class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init(data) {
        this.levelKey  = (data && data.level) || 'LEVEL_1';
        this.levelData = window[this.levelKey] || LEVEL_1;
        this.bossDefeated = false;
        this.exitOpen     = false;
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

        // Player
        this.player = new Player(this, ld.playerStart.x, ld.playerStart.y);
        this.player.inventory = new Inventory(this.player);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Enemy group (runChildUpdate = each enemy's preUpdate is called)
        this.enemies = this.physics.add.group({ runChildUpdate: true });

        // Loot items group
        this.lootItems = this.physics.add.group();

        // Spawn enemies
        (ld.enemies || []).forEach(cfg => this._spawnEnemy(cfg));

        // Spawn boss
        this.boss = null;
        if (ld.boss) {
            this._spawnBoss(ld.boss);
        }

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
        this.enemies.add(enemy);
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
            // Loot ↔ tiles collider
            this.physics.add.collider(loot, this.solidLayer);
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
        var old  = player.inventory.equip(item);
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
        towerPositions.forEach(frac => {
            var tx = frac * W * 0.2;  // visible range, scroll factor 0.2
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
