// GameScene — loads one room, handles play + door transitions.
//
// Flow:
//   create()   → build the room from ROOMS[currentRoom], spawn player at
//                playerStart / SPAWN_FROM_LEFT / SPAWN_FROM_RIGHT, lock
//                door triggers for _doorLockMs so we don't bounce back
//                through the incoming door.
//   update()   → normal gameplay, then _checkDoors() once lock expires.
//   transition → RunState.snapshot + enterRoomVia, fade out, scene.restart.
class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init() {
        if (!window.RUN) RunState.init();
        this.roomId  = window.RUN.currentRoom;
        this.room    = ROOMS[this.roomId] || ROOMS[START_ROOM];
        this._transitioning = false;
        this._doorLockMs    = 600;   // ignore door zones this long after spawn
    }

    create() {
        var rd = this.room;

        this.cameras.main.resetFX();
        this.cameras.main.setBackgroundColor(rd.bgColor);
        this.cameras.main.fadeIn(260, 0, 0, 0);

        var map = TileMap.build(this, rd.tileData);
        this.solidLayer    = map.solid;
        this.platformLayer = map.platforms;

        var W = TileMap.pixelWidth(rd.tileData);
        var H = TileMap.pixelHeight(rd.tileData);
        this.physics.world.setBounds(0, 0, W, H);
        this.cameras.main.setBounds(0, 0, W, H);

        // ── Spawn position ────────────────────────────────────────────────
        var run = window.RUN;
        var spawn;
        if (run.spawnOverride)         spawn = run.spawnOverride;
        else if (run.fromExit === 'left')   spawn = SPAWN_FROM_LEFT;
        else if (run.fromExit === 'right')  spawn = SPAWN_FROM_RIGHT;
        else                                spawn = rd.playerStart;

        // ── Player + Kiri ─────────────────────────────────────────────────
        this.player = new Player(this, spawn.x, spawn.y);
        this.player.inventory = new Inventory(this.player);
        RunState.applyToPlayer(this.player);
        this.player.setFlipX(run.fromExit === 'right');
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.kiri = new KiriCompanion(this, spawn.x - 28, spawn.y - 20);
        RunState.applyToKiri(this.kiri);
        this.player.kiri = this.kiri;

        // ── Room contents ─────────────────────────────────────────────────
        this.enemies   = this.physics.add.group({ runChildUpdate: true });
        this.lootItems = this.physics.add.group();

        this._inactiveEnemies = [];
        (rd.enemies || []).forEach(cfg => this._spawnEnemy(cfg));

        this.boss         = null;
        this.bossDefeated = false;
        if (rd.boss) this._spawnBoss(rd.boss);

        this._spawnSpikes(rd.spikes || []);
        this._spawnMovingPlatforms(rd.movingPlatforms || []);
        this._spawnDoors(rd.exits || {}, W);
        if (rd.savePoint) this._spawnSavePoint(rd.savePoint);

        // ── Colliders ─────────────────────────────────────────────────────
        this.physics.add.collider(this.player, this.solidLayer);
        this.physics.add.collider(this.player, this.platformLayer, null, this._platCheck, this);
        this.physics.add.collider(this.enemies, this.solidLayer);
        this.physics.add.collider(this.lootItems, this.solidLayer);
        this.physics.add.collider(this.lootItems, this.platformLayer, null, this._platCheck, this);

        this.physics.add.overlap(this.player, this.lootItems, this._pickupLoot, null, this);

        this.physics.add.overlap(this.player._projectiles, this.enemies,
            (proj, enemy) => {
                if (!proj.active || !enemy.active || enemy.state === 'dead') return;
                enemy.takeDamage(proj.damage || this.player.stats.damage);
                this._projHitEffect(proj);
                proj.destroy();
            }
        );

        // ── UI bridge ─────────────────────────────────────────────────────
        this.events.on('bossDied',       this._onBossDied, this);
        this.events.on('bossSpawned',    (m)   => this.scene.get('UIScene').events.emit('bossSpawned', m));
        this.events.on('bossHP',         (h,m) => this.scene.get('UIScene').events.emit('bossHP', h, m));
        this.events.on('playerDamaged',  (h,m) => this.scene.get('UIScene').events.emit('playerHP', h, m));
        this.events.on('inventoryChanged', (s) => this.scene.get('UIScene').events.emit('inventoryChanged', s));
        this.events.on('weaponModeChanged',(m) => this.scene.get('UIScene').events.emit('weaponModeChanged', m));
        this.events.on('kiriHealUsed',         () => this.scene.get('UIScene').events.emit('kiriHealUsed'));

        // Push HUD state after UIScene has had a frame to initialize
        this.time.delayedCall(80, () => {
            var ui = this.scene.get('UIScene');
            this.events.emit('playerDamaged',  this.player.stats.hp, this.player.stats.maxHp);
            this.events.emit('inventoryChanged', this.player.inventory.slots);
            this.events.emit('weaponModeChanged', this.player.getWeaponMode());
            ui.events.emit('roomChanged',   rd.title || this.roomId);
            ui.events.emit('potionsChanged', (this.player.potions && this.player.potions.length) || 0);
            ui.events.emit('kiriHealReady');
        });

        if (!this.scene.isActive('UIScene'))     this.scene.launch('UIScene');
        if (!this.scene.isActive('MobileScene')) this.scene.launch('MobileScene');

        // Pause — keyboard + mobile button (see MobileScene)
        this.input.keyboard.on('keydown-P',   () => this._togglePause());
        this.input.keyboard.on('keydown-ESC', () => this._togglePause());

        this._buildBackground(W, H);
        this._showRoomTitle(rd.title || this.roomId);

        // Fresh-run-only: clear transition hints after consumption
        run.fromExit      = null;
        run.spawnOverride = null;
        window.RUN.visited[this.roomId] = true;

        if (!window._hintShown && this.roomId === START_ROOM) {
            window._hintShown = true;
            var hint = this.add.text(GAME_WIDTH / 2, 30,
                '← → Laufen   ↑ Sprung   Z Angriff   H Kiri-Heilung', {
                    fontSize: '12px', fill: '#aabbcc',
                    backgroundColor: '#00000066', padding: { x: 8, y: 4 }
                }).setScrollFactor(0).setDepth(20);
            this.time.delayedCall(5000, () => { if (hint.active) hint.destroy(); });
        }
    }

    // ── Update loop ────────────────────────────────────────────────────────
    update(time, delta) {
        if (this._transitioning)          return;
        if (!this.player || !this.player.active) return;

        if (this._doorLockMs > 0) this._doorLockMs -= delta;

        this.player.update(time, delta);

        if (this.kiri && this.kiri.active) this.kiri.follow(this.player, delta);

        this._updateMovingPlatforms(delta);

        // Proximity enemy activation
        if (this._inactiveEnemies.length > 0) {
            this._inactiveEnemies = this._inactiveEnemies.filter(enemy => {
                if (!enemy.active && Math.abs(enemy.x - this.player.x) < 520) {
                    this._activateEnemy(enemy);
                    return false;
                }
                return !enemy.active;
            });
        }

        this.enemies.getChildren().forEach(enemy => enemy.player = this.player);

        CombatSystem.resolvePlayerAttack(this.player, this.enemies);

        if (this.boss && this.boss.active) {
            this.boss.player = this.player;
            this._checkBossProjectiles();
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

        if (this._doorLockMs <= 0) this._checkDoors();

        if (window.VirtualControls) {
            window.VirtualControls.jumpJustPressed   = false;
            window.VirtualControls.attackJustPressed = false;
            window.VirtualControls.potionJustPressed = false;
            window.VirtualControls.kiriJustPressed   = false;
            window.VirtualControls.pauseJustPressed  = false;
        }
    }

    // ── Pause / Menu ───────────────────────────────────────────────────────
    _togglePause() {
        if (this._transitioning) return;
        if (this.scene.isActive('PauseScene')) return;
        this.scene.pause();
        this.scene.launch('PauseScene', { from: 'GameScene' });
    }

    // Called from MobileScene pause button
    requestPause() { this._togglePause(); }

    // ── Doors ──────────────────────────────────────────────────────────────
    _spawnDoors(exits, roomWidth) {
        this.doors = [];
        if (exits.left) {
            this._makeDoor(16, 320, exits.left, 'right');
        }
        if (exits.right) {
            this._makeDoor(roomWidth - 16, 320, exits.right, 'left');
        }
    }

    _makeDoor(x, y, targetRoom, incomingSide) {
        var sprite = this.add.image(x, y, 'door').setDepth(2);
        var locked = this.room.lockExitsDuringBoss && !this.bossDefeated;
        if (locked) sprite.setTint(0x661111);
        this.doors.push({ x: x, y: y, targetRoom: targetRoom, incomingSide: incomingSide, sprite: sprite });
    }

    _checkDoors() {
        if (!this.doors || this._transitioning) return;
        for (var i = 0; i < this.doors.length; i++) {
            var d = this.doors[i];
            if (Math.abs(this.player.x - d.x) < 14 && Math.abs(this.player.y - d.y) < 36) {
                if (this.room.lockExitsDuringBoss && !this.bossDefeated) {
                    this._flashDoor(d.sprite);
                    return;
                }
                this._transitionToRoom(d.targetRoom, d.incomingSide);
                return;
            }
        }
    }

    _flashDoor(sprite) {
        if (sprite._flashing) return;
        sprite._flashing = true;
        this.tweens.add({
            targets: sprite, alpha: { from: 1, to: 0.3 }, duration: 120, yoyo: true, repeat: 2,
            onComplete: () => { sprite._flashing = false; sprite.setAlpha(1); }
        });
    }

    _transitionToRoom(targetRoom, via) {
        if (this._transitioning) return;
        this._transitioning = true;
        if (this.player && this.player.body) this.player.body.setVelocity(0, 0);
        RunState.snapshotPlayer(this.player);
        RunState.snapshotKiri(this.kiri);
        RunState.enterRoomVia(targetRoom, via);
        this.cameras.main.fadeOut(240, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => { this.scene.restart(); });
    }

    // ── Save point ─────────────────────────────────────────────────────────
    _spawnSavePoint(sp) {
        var sprite = this.add.image(sp.x, sp.y, 'save_point').setDepth(2);
        this.tweens.add({
            targets: sprite, scaleX: { from: 1, to: 1.05 }, scaleY: { from: 1, to: 0.95 },
            duration: 700, yoyo: true, repeat: -1
        });
        var zone = this.add.zone(sp.x, sp.y, 36, 44).setOrigin(0.5);
        this.physics.add.existing(zone, true);
        zone._triggered = false;
        this.physics.add.overlap(this.player, zone, () => {
            if (zone._triggered) return;
            zone._triggered = true;
            RunState.setSave(this.roomId, sp.x, sp.y);
            this.player.stats.hp = this.player.stats.maxHp;
            this.scene.get('UIScene').events.emit('playerHP', this.player.stats.hp, this.player.stats.maxHp);
            if (this.kiri) {
                this.kiri.resetForLevel();
                this.scene.get('UIScene').events.emit('kiriHealReady');
                this.kiri.say('Hier ruhen wir. Kraft kehrt zurueck.', 2400);
            }
            var txt = this.add.text(sp.x, sp.y - 44, 'GESPEICHERT', {
                fontSize: '12px', fill: '#ffcc00', fontStyle: 'bold',
                backgroundColor: '#00000088', padding: { x: 5, y: 2 }
            }).setOrigin(0.5).setDepth(20);
            this.tweens.add({
                targets: txt, alpha: 0, y: txt.y - 24, duration: 1800,
                onComplete: () => { if (txt.active) txt.destroy(); }
            });
        });
    }

    // ── Hazards ────────────────────────────────────────────────────────────
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

    // ── Enemies ────────────────────────────────────────────────────────────
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
        this.tweens.add({ targets: enemy, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.Out' });
        enemy.setTint(0xffffff);
        this.time.delayedCall(200, () => { if (enemy.active) enemy.clearTint(); });
    }

    _spawnBoss(cfg) {
        this.boss = new Boss(this, cfg.x, cfg.y, cfg);
        this.boss.player  = this.player;
        this.boss.onDeath = (x, y, forced) => this._onEnemyDied(x, y, forced);
        this.physics.add.collider(this.boss, this.solidLayer);

        this.bossNameTag = this.add.text(cfg.x, cfg.y - 50, 'HERR DES VERDERBENS', {
            fontSize: '12px', fill: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5, 1).setDepth(6);
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
        if (this.bossNameTag) this.bossNameTag.destroy();
        if (this.doors) this.doors.forEach(d => { if (d.sprite) d.sprite.clearTint(); });

        var txt = this.add.text(GAME_WIDTH / 2, 80, 'DIE FLAMME IST FREI!', {
            fontSize: '16px', fill: '#00ffcc', fontStyle: 'bold',
            backgroundColor: '#00000088', padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(20);
        this.time.delayedCall(3000, () => { if (txt.active) txt.destroy(); });

        this.scene.get('UIScene').events.emit('bossDied');
        if (this.kiri) this.kiri.say('Er faellt! Die Flamme ist frei!', 3000);

        this.time.delayedCall(3400, () => {
            RunState.snapshotPlayer(this.player);
            this.scene.stop('UIScene');
            this.scene.stop('MobileScene');
            this.scene.start('WinScene');
        });
    }

    // ── Loot pickup ────────────────────────────────────────────────────────
    _pickupLoot(player, lootSprite) {
        if (!lootSprite.active || !lootSprite.itemData) return;
        var item = lootSprite.itemData;

        if (item.type === 'potion') {
            if (!player.potions) player.potions = [];
            if (player.potions.length < 2) {
                player.potions.push(item.healAmount);
                lootSprite.destroy();
                this.scene.get('UIScene').events.emit('potionsChanged', player.potions.length);
                this.scene.get('UIScene').events.emit('itemPickup', '❤ Trank (+' + item.healAmount + ' HP)');
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
        this.events.emit('weaponModeChanged', player.getWeaponMode());
        try { this.sound.play('sfx_pickup'); } catch (e) {}
    }

    // ── Misc ───────────────────────────────────────────────────────────────
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

    _checkBossProjectiles() {
        if (!this.boss || !this.boss.projectiles) return;
        this.boss.projectiles.getChildren().forEach(proj => {
            if (!proj.active || !this.player.active) return;
            if (Phaser.Math.Distance.Between(proj.x, proj.y, this.player.x, this.player.y) < 18) {
                CombatSystem.resolveProjectileHit(proj, this.player);
            }
        });
    }

    _showRoomTitle(title) {
        var txt = this.add.text(GAME_WIDTH / 2, 54, title, {
            fontSize: '18px', fill: '#eeccaa', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20).setAlpha(0);
        this.tweens.add({
            targets: txt, alpha: 1, duration: 350,
            onComplete: () => {
                this.time.delayedCall(1600, () => {
                    this.tweens.add({
                        targets: txt, alpha: 0, duration: 500,
                        onComplete: () => { if (txt.active) txt.destroy(); }
                    });
                });
            }
        });
    }

    _buildBackground(W, H) {
        var g = this.add.graphics().setScrollFactor(0.3).setDepth(0);
        g.fillStyle(0x0d0820, 0.55);
        var towers = [0.15, 0.4, 0.65, 0.9];
        towers.forEach(frac => {
            var tx = frac * W;
            var tw = 44, th = 150;
            g.fillRect(tx, H - th - 16, tw, th);
            for (var i = 0; i < 3; i++) g.fillRect(tx + i * 14, H - th - 28, 10, 14);
        });
    }
}
