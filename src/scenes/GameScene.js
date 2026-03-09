class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init(data) {
        this.levelKey  = (data && data.level) || 'LEVEL_1';
        this.levelData = window[this.levelKey] || LEVEL_1;
        this.bossDefeated = false;
        this.exitOpen     = false;
        // Track current level; reset checkpoint when entering a new level
        if (window.GameState.currentLevel !== this.levelKey) {
            window.GameState.currentLevel = this.levelKey;
            window.GameState.checkpoint   = null;
        }
    }

    create() {
        var ld = this.levelData;

        // Background
        this.cameras.main.setBackgroundColor(ld.bgColor || 0x1a1028);

        // Build tile map
        var map = TileMap.build(this, ld.tileData);
        this.solidLayer    = map.solid;
        this.platformLayer = map.platforms;

        var W = TileMap.pixelWidth(ld.tileData);
        var H = TileMap.pixelHeight(ld.tileData);

        // World & camera bounds
        this.physics.world.setBounds(0, 0, W, H + 200);
        this.cameras.main.setBounds(0, 0, W, H);

        // Player — respawn at checkpoint if available
        var spawnX = (window.GameState.checkpoint ? window.GameState.checkpoint.x : ld.playerStart.x);
        var spawnY = (window.GameState.checkpoint ? window.GameState.checkpoint.y : ld.playerStart.y);
        this.player = new Player(this, spawnX, spawnY);
        this.player.inventory = new Inventory(this.player);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Enemy group (runChildUpdate = each enemy's preUpdate is called)
        this.enemies = this.physics.add.group({ runChildUpdate: true });

        // Loot items group
        this.lootItems = this.physics.add.group();

        // Spawn enemies (initially deactivated for proximity spawning)
        this._inactiveEnemies = [];
        (ld.enemies || []).forEach(cfg => this._spawnEnemy(cfg));

        // Spawn boss
        this.boss = null;
        if (ld.boss) {
            this._spawnBoss(ld.boss);
        }

        // Checkpoints
        this._spawnCheckpoints(ld.checkpoints || []);

        // Exit portal (hidden until boss dies or no boss)
        this.exitPortal = this.add.sprite(ld.exitX, ld.playerStart.y - 8, 'exit_portal');
        this.exitPortal.setDepth(2);
        this.physics.add.existing(this.exitPortal, true);  // static body
        if (ld.boss) {
            this.exitPortal.setAlpha(0);  // hidden until boss dies
        } else {
            this.exitOpen = true;
        }

        // ---- Colliders ----
        // Player ↔ tiles
        this.physics.add.collider(this.player, this.solidLayer);
        this.physics.add.collider(this.player, this.platformLayer, null, this._platCheck, this);

        // Enemies ↔ tiles
        this.physics.add.collider(this.enemies, this.solidLayer);

        // Loot ↔ tiles
        this.physics.add.collider(this.lootItems, this.solidLayer);
        this.physics.add.collider(this.lootItems, this.platformLayer, null, this._platCheck, this);

        // Player picks up loot
        this.physics.add.overlap(this.player, this.lootItems, this._pickupLoot, null, this);

        // Player reaches exit
        this.physics.add.overlap(this.player, this.exitPortal, this._enterExit, null, this);

        // Events from Boss
        this.events.on('bossDied', this._onBossDied, this);
        this.events.on('bossSpawned', (maxHp) => {
            this.scene.get('UIScene').events.emit('bossSpawned', maxHp);
        });
        this.events.on('bossHP', (hp, maxHp) => {
            this.scene.get('UIScene').events.emit('bossHP', hp, maxHp);
        });
        this.events.on('playerDamaged', (hp, maxHp) => {
            this.scene.get('UIScene').events.emit('playerHP', hp, maxHp);
        });
        this.events.on('inventoryChanged', (slots) => {
            this.scene.get('UIScene').events.emit('inventoryChanged', slots);
        });

        // Notify UI of initial HP
        this.time.delayedCall(100, () => {
            this.events.emit('playerDamaged', this.player.stats.hp, this.player.stats.maxHp);
            this.events.emit('inventoryChanged', this.player.inventory.slots);
        });

        // Launch HUD overlay
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }

        // Launch mobile touch controls overlay
        if (!this.scene.isActive('MobileScene')) {
            this.scene.launch('MobileScene');
        }

        // Background decoration — parallax castle silhouette
        this._buildBackground(W, H);

        // Controls hint (first time)
        if (!window._hintShown) {
            window._hintShown = true;
            var hint = this.add.text(GAME_WIDTH / 2, 30,
                '← → Move   ↑/W/Space Jump   Z Attack', {
                    fontSize: '13px', fill: '#aabbcc',
                    backgroundColor: '#00000066', padding: { x: 8, y: 4 }
                }).setScrollFactor(0).setDepth(20);
            this.time.delayedCall(4000, () => { if (hint.active) hint.destroy(); });
        }
    }

    update(time, delta) {
        if (!this.player.active) return;

        this.player.update(time, delta);

        // Proximity spawning: activate enemies within 550px of player
        if (this._inactiveEnemies && this._inactiveEnemies.length > 0) {
            this._inactiveEnemies = this._inactiveEnemies.filter(enemy => {
                if (!enemy.active && Math.abs(enemy.x - this.player.x) < 550) {
                    this._activateEnemy(enemy);
                    return false;  // remove from inactive list
                }
                return !enemy.active;
            });
        }

        // Set player reference on enemies and handle projectile overlaps
        this.enemies.getChildren().forEach(enemy => {
            enemy.player = this.player;
        });

        // Player attack resolution
        CombatSystem.resolvePlayerAttack(this.player, this.enemies);

        // Boss projectile overlap (boss may not be in enemies group)
        if (this.boss && this.boss.active) {
            this.boss.player = this.player;
            this._checkBossProjectiles();
        }

        // Ranged enemy projectiles vs player
        this.enemies.getChildren().forEach(enemy => {
            if (enemy instanceof EnemyRanged && enemy.projectiles) {
                enemy.projectiles.getChildren().forEach(proj => {
                    if (!proj.active || !this.player.active) return;
                    if (Phaser.Math.Distance.Between(proj.x, proj.y, this.player.x, this.player.y) < 18) {
                        CombatSystem.resolveProjectileHit(proj, this.player);
                    }
                });
            }
        });

        // Enemy melee vs player (contact damage)
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || enemy.state === 'dead') return;
            var d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            if (d < 28 && enemy.attackTimer <= 0) {
                this.player.takeDamage(enemy.damage);
                enemy.attackTimer = 900;
            }
        });

        // Level name display
        if (this._levelNameTimer > 0) this._levelNameTimer -= delta;
    }

    _platCheck(player, plat) {
        return player.body.velocity.y >= 0 && player.body.bottom <= plat.body.top + 12;
    }

    _spawnCheckpoints(checkpoints) {
        this._checkpointZones = [];
        checkpoints.forEach((cp, index) => {
            // Skip checkpoints already passed (checkpoint x ≤ current checkpoint x)
            if (window.GameState.checkpoint && cp.x <= window.GameState.checkpoint.x) return;

            // Visual marker: small campfire-like glyph
            var marker = this.add.text(cp.x, cp.y - 24, '🔥', {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(3);

            // Pulsing glow
            this.tweens.add({
                targets: marker,
                scaleX: { from: 0.9, to: 1.1 },
                scaleY: { from: 0.9, to: 1.1 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            // Trigger zone
            var zone = this.add.zone(cp.x, cp.y, 40, 64).setOrigin(0.5);
            this.physics.add.existing(zone, true);
            this.physics.add.overlap(this.player, zone, () => {
                if (window.GameState.checkpoint && window.GameState.checkpoint.x >= cp.x) return;
                window.GameState.checkpoint = { x: cp.x, y: cp.y };
                marker.setText('✨');
                // Checkpoint flash
                var flash = this.add.text(cp.x, cp.y - 50, 'CHECKPOINT', {
                    fontSize: '12px', fill: '#00ffcc',
                    backgroundColor: '#00000088', padding: { x: 4, y: 2 }
                }).setOrigin(0.5).setDepth(20);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    y: flash.y - 30,
                    duration: 1500,
                    onComplete: () => { if (flash.active) flash.destroy(); }
                });
            });

            this._checkpointZones.push({ zone, marker, cp });
        });
    }

    _spawnEnemy(cfg) {
        var enemy;
        if (cfg.type === 'patrol') {
            enemy = new EnemyPatrol(this, cfg.x, cfg.y, cfg);
        } else if (cfg.type === 'chaser') {
            enemy = new EnemyChaser(this, cfg.x, cfg.y, cfg);
        } else if (cfg.type === 'ranged') {
            enemy = new EnemyRanged(this, cfg.x, cfg.y, cfg);
        } else {
            return;
        }
        enemy.player  = this.player;
        enemy.onDeath = (x, y, forced) => this._onEnemyDied(x, y, forced);
        // Start deactivated — activated via proximity in update()
        enemy.setActive(false).setVisible(false);
        enemy.body.enable = false;
        this._inactiveEnemies.push(enemy);
        this.enemies.add(enemy);
    }

    _activateEnemy(enemy) {
        enemy.setActive(true).setVisible(true);
        enemy.body.enable = true;
        // Pop-in animation: scale 0→1 over 300ms
        enemy.setScale(0);
        this.tweens.add({
            targets: enemy,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.Out'
        });
        // White flash
        enemy.setTint(0xffffff);
        this.time.delayedCall(200, () => { if (enemy.active) enemy.clearTint(); });
    }

    _spawnBoss(cfg) {
        this.boss = new Boss(this, cfg.x, cfg.y, cfg);
        this.boss.player  = this.player;
        this.boss.onDeath = (x, y, forced) => this._onEnemyDied(x, y, forced);

        // Boss ↔ tiles
        this.physics.add.collider(this.boss, this.solidLayer);

        // Boss label
        var nameTag = this.add.text(cfg.x, cfg.y - 50, 'DOOM GUARDIAN', {
            fontSize: '12px', fill: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5, 1).setDepth(6);
        // Make label follow boss
        this.bossNameTag = nameTag;
    }

    _onEnemyDied(x, y, forced) {
        if (LootSystem.shouldDrop() || forced) {
            var loot = LootSystem.spawn(this, x, y, forced);
            this.lootItems.add(loot);
            this.physics.add.collider(loot, this.solidLayer);
        }
        // Additional potion drop
        if (LootSystem.shouldDropPotion()) {
            var potion = LootSystem.spawnPotion(this, x - 20, y);
            this.lootItems.add(potion);
            this.physics.add.collider(potion, this.solidLayer);
        }
    }

    _onBossDied() {
        this.bossDefeated = true;
        this.exitOpen     = true;
        if (this.bossNameTag) this.bossNameTag.destroy();

        // Reveal exit portal
        this.tweens.add({
            targets: this.exitPortal,
            alpha: 1,
            duration: 800
        });

        // Animate portal pulsing
        this.tweens.add({
            targets: this.exitPortal,
            scaleY: { from: 1, to: 1.1 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            delay: 800
        });

        var txt = this.add.text(GAME_WIDTH / 2, 80, 'BOSS DEFEATED! Reach the portal →', {
            fontSize: '16px', fill: '#00ffcc', fontStyle: 'bold',
            backgroundColor: '#00000088', padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(20);
        this.time.delayedCall(4000, () => { if (txt.active) txt.destroy(); });

        this.scene.get('UIScene').events.emit('bossDied');
    }

    _pickupLoot(player, lootSprite) {
        if (!lootSprite.active || !lootSprite.itemData) return;
        var item = lootSprite.itemData;

        // Potion: add to player's potion stack (max 2)
        if (item.type === 'potion') {
            if (!player.potions) player.potions = [];
            if (player.potions.length < 2) {
                player.potions.push(item.healAmount);
                lootSprite.destroy();
                this.scene.get('UIScene').events.emit('potionsChanged', player.potions.length);
                this.scene.get('UIScene').events.emit('itemPickup', '❤ Potion (+' + item.healAmount + ' HP)');
                try { this.sound.play('sfx_pickup'); } catch (e) {}
            }
            return;
        }

        var old = player.inventory.equip(item);
        lootSprite.destroy();

        // Drop old item back if any
        if (old) {
            var dropped = LootSystem.spawn(this, player.x + 30, player.y - 20);
            dropped.itemData = old;
            this.lootItems.add(dropped);
            this.physics.add.collider(dropped, this.solidLayer);
        }

        // Pickup notification
        this.scene.get('UIScene').events.emit('itemPickup', LootSystem.label(item));
        try { this.sound.play('sfx_pickup'); } catch (e) {}
    }

    _enterExit(player, portal) {
        if (!this.exitOpen) return;

        var ld = this.levelData;
        this.scene.stop('UIScene');
        this.scene.stop('MobileScene');

        if (ld.nextLevel) {
            this.scene.start('StoryScene', {
                lines: ld.storyAfter || [],
                nextScene: 'GameScene',
                nextData: { level: ld.nextLevel }
            });
        } else {
            // Final level complete
            this.scene.start('StoryScene', {
                lines: ld.storyAfter || [],
                nextScene: 'WinScene',
                nextData: {}
            });
        }
    }

    _checkBossProjectiles() {
        if (!this.boss || !this.boss.projectiles) return;
        this.boss.projectiles.getChildren().forEach(proj => {
            if (!proj.active || !this.player.active) return;
            if (Phaser.Math.Distance.Between(proj.x, proj.y, this.player.x, this.player.y) < 18) {
                CombatSystem.resolveProjectileHit(proj, this.player);
            }
        });
    }

    _buildBackground(W, H) {
        // Simple gradient-like background silhouette (towers)
        var g = this.add.graphics().setScrollFactor(0.2).setDepth(0);
        g.fillStyle(0x0d0820, 1);

        // Draw castle towers across the background
        var towerPositions = [0.1, 0.25, 0.45, 0.65, 0.8, 0.95];
        g.setAlpha(0.5);
        towerPositions.forEach(frac => {
            var tx = frac * W;  // spread across full world width; scroll factor 0.2 gives parallax depth
            var tw = 60;
            var th = 200;
            g.fillRect(tx, H - th - 20, tw, th);
            // Battlements
            for (var i = 0; i < 4; i++) {
                g.fillRect(tx + i * 16, H - th - 36, 12, 20);
            }
        });
    }
}
