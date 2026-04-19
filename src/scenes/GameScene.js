class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init(data) {
        this.levelKey  = (data && data.level) || 'LEVEL_1';
        this.levelData = window[this.levelKey] || LEVEL_1;
        this.bossDefeated = false;
        this.exitOpen     = false;
        if (window.GameState.currentLevel !== this.levelKey) {
            window.GameState.currentLevel = this.levelKey;
            window.GameState.checkpoint   = null;
        }
    }

    create() {
        var ld = this.levelData;

        this.cameras.main.setBackgroundColor(ld.bgColor || 0x1a1028);

        var map = TileMap.build(this, ld.tileData);
        this.solidLayer    = map.solid;
        this.platformLayer = map.platforms;

        var W = TileMap.pixelWidth(ld.tileData);
        var H = TileMap.pixelHeight(ld.tileData);

        this.physics.world.setBounds(0, 0, W, H + 200);
        this.cameras.main.setBounds(0, 0, W, H);

        // Player
        var spawnX = window.GameState.checkpoint ? window.GameState.checkpoint.x : ld.playerStart.x;
        var spawnY = window.GameState.checkpoint ? window.GameState.checkpoint.y : ld.playerStart.y;
        this.player = new Player(this, spawnX, spawnY);
        this.player.inventory = new Inventory(this.player);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Kiri companion
        this.kiri = new KiriCompanion(this, spawnX - 40, spawnY - 20);
        this.player.kiri = this.kiri;

        // (level greetings are handled in StoryScene before entering)

        // Enemy group
        this.enemies   = this.physics.add.group({ runChildUpdate: true });
        this.lootItems = this.physics.add.group();

        this._inactiveEnemies = [];
        (ld.enemies || []).forEach(cfg => this._spawnEnemy(cfg));

        this.boss = null;
        if (ld.boss) this._spawnBoss(ld.boss);

        this._spawnCheckpoints(ld.checkpoints || []);
        this._spawnSpikes(ld.spikes || []);
        this._spawnMovingPlatforms(ld.movingPlatforms || []);

        // Exit portal
        this.exitPortal = this.add.sprite(ld.exitX, ld.playerStart.y - 8, 'exit_portal');
        this.exitPortal.setDepth(2);
        this.physics.add.existing(this.exitPortal, true);
        if (ld.boss) {
            this.exitPortal.setAlpha(0);
        } else {
            this.exitOpen = true;
        }

        // ── Colliders ──────────────────────────────────────────────────────
        this.physics.add.collider(this.player, this.solidLayer);
        this.physics.add.collider(this.player, this.platformLayer, null, this._platCheck, this);
        this.physics.add.collider(this.enemies, this.solidLayer);
        this.physics.add.collider(this.lootItems, this.solidLayer);
        this.physics.add.collider(this.lootItems, this.platformLayer, null, this._platCheck, this);

        this.physics.add.overlap(this.player, this.lootItems, this._pickupLoot, null, this);
        this.physics.add.overlap(this.player, this.exitPortal, this._enterExit, null, this);

        // Player projectiles vs enemies
        this.physics.add.overlap(this.player._projectiles, this.enemies,
            (proj, enemy) => {
                if (!proj.active || !enemy.active || enemy.state === 'dead') return;
                enemy.takeDamage(proj.damage || this.player.stats.damage);
                this._projHitEffect(proj);
                proj.destroy();
            }
        );

        // Events
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
        this.events.on('weaponModeChanged', (mode) => {
            this.scene.get('UIScene').events.emit('weaponModeChanged', mode);
        });
        this.events.on('kiriHealUsed', () => {
            this.scene.get('UIScene').events.emit('kiriHealUsed');
        });

        this.time.delayedCall(100, () => {
            this.events.emit('playerDamaged', this.player.stats.hp, this.player.stats.maxHp);
            this.events.emit('inventoryChanged', this.player.inventory.slots);
            this.events.emit('weaponModeChanged', this.player.getWeaponMode());
            this.events.emit('kiriHealReady');
            this.scene.get('UIScene').events.emit('kiriHealReady');
        });

        if (!this.scene.isActive('UIScene'))     this.scene.launch('UIScene');
        if (!this.scene.isActive('MobileScene')) this.scene.launch('MobileScene');

        // Pause
        this._pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this._escKey   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.input.keyboard.on('keydown-P',   () => this._togglePause());
        this.input.keyboard.on('keydown-ESC', () => this._togglePause());

        this._buildBackground(W, H);

        if (!window._hintShown) {
            window._hintShown = true;
            var hint = this.add.text(GAME_WIDTH / 2, 30,
                '← → Move   ↑ Jump   Z Attack   H Kiri-Heal', {
                    fontSize: '12px', fill: '#aabbcc',
                    backgroundColor: '#00000066', padding: { x: 8, y: 4 }
                }).setScrollFactor(0).setDepth(20);
            this.time.delayedCall(5000, () => { if (hint.active) hint.destroy(); });
        }
    }

    update(time, delta) {
        if (!this.player.active) return;

        this.player.update(time, delta);

        // Kiri follows player
        if (this.kiri && this.kiri.active) {
            this.kiri.follow(this.player, delta);
        }

        // Moving platforms
        this._updateMovingPlatforms(delta);

        // Proximity enemy activation
        if (this._inactiveEnemies && this._inactiveEnemies.length > 0) {
            this._inactiveEnemies = this._inactiveEnemies.filter(enemy => {
                if (!enemy.active && Math.abs(enemy.x - this.player.x) < 550) {
                    this._activateEnemy(enemy);
                    return false;
                }
                return !enemy.active;
            });
        }

        this.enemies.getChildren().forEach(enemy => {
            enemy.player = this.player;
        });

        CombatSystem.resolvePlayerAttack(this.player, this.enemies);

        if (this.boss && this.boss.active) {
            this.boss.player = this.player;
            this._checkBossProjectiles();
        }

        // Player projectiles vs boss
        if (this.boss && this.boss.active) {
            this.player._projectiles.getChildren().forEach(proj => {
                if (!proj.active || !this.boss.active) return;
                if (Phaser.Math.Distance.Between(proj.x, proj.y, this.boss.x, this.boss.y) < 32) {
                    this.boss.takeDamage(proj.damage || this.player.stats.damage);
                    this._projHitEffect(proj);
                    proj.destroy();
                }
            });
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

        // Enemy melee contact
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || enemy.state === 'dead') return;
            var d = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            if (d < 28 && enemy.attackTimer <= 0) {
                this.player.takeDamage(enemy.damage);
                enemy.attackTimer = 900;
            }
        });

        // Reset one-frame virtual control pulses AFTER all game logic has read them
        if (window.VirtualControls) {
            window.VirtualControls.jumpJustPressed   = false;
            window.VirtualControls.attackJustPressed = false;
            window.VirtualControls.potionJustPressed = false;
            window.VirtualControls.kiriJustPressed   = false;
        }
    }

    _togglePause() {
        if (this.scene.isActive('PauseScene')) return;
        this.scene.pause();
        this.scene.launch('PauseScene', { from: 'GameScene' });
    }

    _platCheck(player, plat) {
        return player.body.velocity.y >= 0 && player.body.bottom <= plat.body.top + 12;
    }

    _projHitEffect(proj) {
        var color = proj.attackType === 'magic' ? 0xcc44ff : 0xffcc00;
        var spark = this.add.rectangle(proj.x, proj.y, 10, 10, color).setDepth(8);
        this.tweens.add({
            targets: spark, scaleX: 3, scaleY: 3, alpha: 0, duration: 200,
            onComplete: () => { if (spark.active) spark.destroy(); }
        });
    }

    _scheduleKiriGreeting() {
        var greetings = {
            LEVEL_1: null, // already covered in storyBefore
            LEVEL_2: '[KIRI] ...Diese Finsternis kenne ich. Pass auf Fallgruben auf.',
            LEVEL_3: '[KIRI] Das ist das Innere Heiligtum. Ich kann die Flamme fuehlen...'
        };
        var msg = greetings[this.levelKey];
        if (msg && this.kiri) {
            this.time.delayedCall(1500, () => {
                if (this.kiri && this.kiri.active) {
                    this.kiri.say(msg.replace('[KIRI] ', ''), 3500);
                }
            });
        }
    }

    _spawnCheckpoints(checkpoints) {
        this._checkpointZones = [];
        checkpoints.forEach(cp => {
            if (window.GameState.checkpoint && cp.x <= window.GameState.checkpoint.x) return;

            var marker = this.add.text(cp.x, cp.y - 24, '🔥', { fontSize: '20px' })
                .setOrigin(0.5).setDepth(3);
            this.tweens.add({
                targets: marker,
                scaleX: { from: 0.9, to: 1.1 }, scaleY: { from: 0.9, to: 1.1 },
                duration: 800, yoyo: true, repeat: -1
            });

            var zone = this.add.zone(cp.x, cp.y, 40, 64).setOrigin(0.5);
            this.physics.add.existing(zone, true);
            this.physics.add.overlap(this.player, zone, () => {
                if (window.GameState.checkpoint && window.GameState.checkpoint.x >= cp.x) return;
                window.GameState.checkpoint = { x: cp.x, y: cp.y };
                // Reset Kiri heal at checkpoint
                if (this.kiri) this.kiri.resetForLevel();
                this.scene.get('UIScene').events.emit('kiriHealReady');
                marker.setText('✨');
                var flash = this.add.text(cp.x, cp.y - 50, 'CHECKPOINT', {
                    fontSize: '12px', fill: '#00ffcc',
                    backgroundColor: '#00000088', padding: { x: 4, y: 2 }
                }).setOrigin(0.5).setDepth(20);
                this.tweens.add({
                    targets: flash, alpha: 0, y: flash.y - 30, duration: 1500,
                    onComplete: () => { if (flash.active) flash.destroy(); }
                });
                if (this.kiri) this.kiri.say('Ich bin wieder bei Kraefte!', 2000);
            });

            this._checkpointZones.push({ zone, marker, cp });
        });
    }

    _spawnSpikes(spikes) {
        this.spikeGroup = this.physics.add.staticGroup();
        spikes.forEach(cfg => {
            var sp = this.spikeGroup.create(cfg.x, cfg.y, 'spike');
            sp.body.setSize(28, 10).setOffset(2, 6);
        });
        this.physics.add.overlap(this.player, this.spikeGroup, () => {
            if (this.player._spikeTimer && this.player._spikeTimer > 0) return;
            this.player.takeDamage(25);
            this.player._spikeTimer = 800;
        });
    }

    _spawnMovingPlatforms(platforms) {
        this.movingPlatforms = this.physics.add.group();
        platforms.forEach(cfg => {
            var plat = this.physics.add.image(cfg.x, cfg.y, 'moving_plat');
            plat.body.allowGravity = false;
            plat.body.immovable = true;
            plat._cfg = { ox: cfg.x, oy: cfg.y, dir: 1, axis: cfg.axis, range: cfg.range, speed: cfg.speed };
            this.movingPlatforms.add(plat);
        });
        this.physics.add.collider(this.player, this.movingPlatforms, null, this._platCheck, this);
    }

    _updateMovingPlatforms(delta) {
        if (!this.movingPlatforms) return;
        var dt = delta / 1000;
        if (this.player._spikeTimer > 0) this.player._spikeTimer -= delta;
        this.movingPlatforms.getChildren().forEach(plat => {
            var c = plat._cfg;
            var prevX = plat.x, prevY = plat.y;
            if (c.axis === 'x') {
                plat.x += c.speed * c.dir * dt;
                if (plat.x > c.ox + c.range) { plat.x = c.ox + c.range; c.dir = -1; }
                if (plat.x < c.ox - c.range) { plat.x = c.ox - c.range; c.dir = 1; }
            } else {
                plat.y += c.speed * c.dir * dt;
                if (plat.y > c.oy + c.range) { plat.y = c.oy + c.range; c.dir = -1; }
                if (plat.y < c.oy - c.range) { plat.y = c.oy - c.range; c.dir = 1; }
            }
            plat.body.reset(plat.x, plat.y);
            var dx = plat.x - prevX, dy = plat.y - prevY;
            var hw = plat.displayWidth / 2 + 4;
            if (this.player.body.blocked.down &&
                this.player.x > plat.x - hw && this.player.x < plat.x + hw &&
                Math.abs(this.player.body.bottom - plat.body.top) < 10) {
                this.player.x += dx;
                if (dy < 0) this.player.y += dy;
            }
        });
    }

    _spawnEnemy(cfg) {
        var enemy;
        if      (cfg.type === 'patrol') enemy = new EnemyPatrol(this, cfg.x, cfg.y, cfg);
        else if (cfg.type === 'chaser') enemy = new EnemyChaser(this, cfg.x, cfg.y, cfg);
        else if (cfg.type === 'ranged') enemy = new EnemyRanged(this, cfg.x, cfg.y, cfg);
        else return;
        enemy.player  = this.player;
        enemy.onDeath = (x, y, forced) => this._onEnemyDied(x, y, forced);
        enemy.setActive(false).setVisible(false);
        enemy.body.enable = false;
        this._inactiveEnemies.push(enemy);
        this.enemies.add(enemy);
    }

    _activateEnemy(enemy) {
        enemy.setActive(true).setVisible(true);
        enemy.body.enable = true;
        enemy.setScale(0);
        this.tweens.add({
            targets: enemy, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.Out'
        });
        enemy.setTint(0xffffff);
        this.time.delayedCall(200, () => { if (enemy.active) enemy.clearTint(); });
    }

    _spawnBoss(cfg) {
        this.boss = new Boss(this, cfg.x, cfg.y, cfg);
        this.boss.player  = this.player;
        this.boss.onDeath = (x, y, forced) => this._onEnemyDied(x, y, forced);
        this.physics.add.collider(this.boss, this.solidLayer);

        var bossNames = {
            LEVEL_1: 'TORWÄCHTER',
            LEVEL_2: 'KATAKOMBEN-WÄCHTER',
            LEVEL_3: 'HERR DES VERDERBENS'
        };
        var nameTag = this.add.text(cfg.x, cfg.y - 50,
            bossNames[this.levelKey] || 'WÄCHTER', {
                fontSize: '12px', fill: '#ff4444', fontStyle: 'bold'
            }).setOrigin(0.5, 1).setDepth(6);
        this.bossNameTag = nameTag;
    }

    _onEnemyDied(x, y, forced) {
        window.GameState.kills = (window.GameState.kills || 0) + 1;
        if (this.kiri) this.kiri.onEnemyKilled();

        if (LootSystem.shouldDrop() || forced) {
            var loot = LootSystem.spawn(this, x, y, forced);
            this.lootItems.add(loot);
            this.physics.add.collider(loot, this.solidLayer);
        }
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

        this.tweens.add({ targets: this.exitPortal, alpha: 1, duration: 800 });
        this.tweens.add({
            targets: this.exitPortal, scaleY: { from: 1, to: 1.1 },
            duration: 500, yoyo: true, repeat: -1, delay: 800
        });

        var txt = this.add.text(GAME_WIDTH / 2, 80, 'BOSS DEFEATED! Reach the portal →', {
            fontSize: '16px', fill: '#00ffcc', fontStyle: 'bold',
            backgroundColor: '#00000088', padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(20);
        this.time.delayedCall(4000, () => { if (txt.active) txt.destroy(); });

        this.scene.get('UIScene').events.emit('bossDied');

        if (this.kiri) this.kiri.say('Er faellt! Zum Portal!', 3000);
    }

    _pickupLoot(player, lootSprite) {
        if (!lootSprite.active || !lootSprite.itemData) return;
        var item = lootSprite.itemData;

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

        if (old) {
            var dropped = LootSystem.spawn(this, player.x + 30, player.y - 20);
            dropped.itemData = old;
            this.lootItems.add(dropped);
            this.physics.add.collider(dropped, this.solidLayer);
        }

        this.scene.get('UIScene').events.emit('itemPickup', LootSystem.label(item));
        // Update weapon mode indicator
        this.events.emit('weaponModeChanged', player.getWeaponMode());
        try { this.sound.play('sfx_pickup'); } catch (e) {}
    }

    _enterExit(player, portal) {
        if (!this.exitOpen) return;
        var ld = this.levelData;
        this.scene.stop('UIScene');
        this.scene.stop('MobileScene');
        if (ld.nextLevel) {
            // Show this level's storyAfter + next level's storyBefore as one sequence
            var nextLd  = window[ld.nextLevel] || {};
            var lines   = (ld.storyAfter || []).concat(nextLd.storyBefore || []);
            this.scene.start('StoryScene', {
                lines,
                nextScene: 'GameScene',
                nextData: { level: ld.nextLevel }
            });
        } else {
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
        var g = this.add.graphics().setScrollFactor(0.2).setDepth(0);
        g.fillStyle(0x0d0820, 0.5);
        var towerPositions = [0.05, 0.2, 0.38, 0.55, 0.72, 0.88];
        towerPositions.forEach(frac => {
            var tx = frac * W;
            var tw = 60;
            var th = 200;
            g.fillRect(tx, H - th - 20, tw, th);
            for (var i = 0; i < 4; i++) {
                g.fillRect(tx + i * 16, H - th - 36, 12, 20);
            }
        });
    }
}
