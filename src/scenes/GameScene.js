// GameScene — room-based Castlevania-style exploration.
// One room is loaded at a time; door zones on left/right edges transition
// to adjacent rooms while persisting player state via ProgressSystem.
class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'GameScene' }); }

    init(data) {
        if (!window.GameState.progress) ProgressSystem.reset();
        var p = window.GameState.progress;

        if (data && data.room)              p.currentRoom = data.room;
        if (data && data.fromExit !== undefined) p.fromExit = data.fromExit;
        if (data && data.spawnX !== undefined)   p.spawnX   = data.spawnX;
        if (data && data.spawnY !== undefined)   p.spawnY   = data.spawnY;

        this.roomId         = p.currentRoom;
        this.room           = WorldData.get(this.roomId);
        this.bossDefeated   = false;
        this._transitioning = false;
    }

    create() {
        var rd = this.room;
        if (!rd) {
            // Fallback to start room if someone references a missing room
            this.roomId = WorldData.startRoom;
            rd = this.room = WorldData.get(this.roomId);
        }

        this.cameras.main.setBackgroundColor(rd.bgColor || 0x1a1028);

        var map = TileMap.build(this, rd.tileData);
        this.solidLayer    = map.solid;
        this.platformLayer = map.platforms;

        var W = TileMap.pixelWidth(rd.tileData);
        var H = TileMap.pixelHeight(rd.tileData);
        this.physics.world.setBounds(0, 0, W, H + 200);
        this.cameras.main.setBounds(0, 0, W, H);

        // ── Spawn position ────────────────────────────────────────────────
        var progress = window.GameState.progress;
        var spawnX, spawnY, facing = null;
        if (progress.spawnX !== null && progress.spawnY !== null) {
            spawnX = progress.spawnX;
            spawnY = progress.spawnY;
        } else if (progress.fromExit === 'left') {
            spawnX = ROOM_SPAWN.left.x;  spawnY = ROOM_SPAWN.left.y;
            facing = 'right';
        } else if (progress.fromExit === 'right') {
            spawnX = ROOM_SPAWN.right.x; spawnY = ROOM_SPAWN.right.y;
            facing = 'left';
        } else {
            spawnX = rd.playerStart.x;   spawnY = rd.playerStart.y;
        }

        // ── Player + Kiri ─────────────────────────────────────────────────
        this.player = new Player(this, spawnX, spawnY);
        this.player.inventory = new Inventory(this.player);
        ProgressSystem.restorePlayer(this.player);
        if (facing === 'right') this.player.setFlipX(false);
        if (facing === 'left')  this.player.setFlipX(true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.kiri = new KiriCompanion(this, spawnX - 28, spawnY - 20);
        ProgressSystem.restoreKiri(this.kiri);
        this.player.kiri = this.kiri;

        // ── Enemies, loot, boss, hazards, doors, save ─────────────────────
        this.enemies   = this.physics.add.group({ runChildUpdate: true });
        this.lootItems = this.physics.add.group();

        this._inactiveEnemies = [];
        (rd.enemies || []).forEach(cfg => this._spawnEnemy(cfg));

        this.boss = null;
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

        // ── Events → UI bridge ────────────────────────────────────────────
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
            this.scene.get('UIScene').events.emit('kiriHealReady');
        });

        if (!this.scene.isActive('UIScene'))     this.scene.launch('UIScene');
        if (!this.scene.isActive('MobileScene')) this.scene.launch('MobileScene');

        // Pause
        this.input.keyboard.on('keydown-P',   () => this._togglePause());
        this.input.keyboard.on('keydown-ESC', () => this._togglePause());

        this._buildBackground(W, H);

        // ── First-visit story + room title ────────────────────────────────
        var firstVisit = ProgressSystem.isFirstVisit(this.roomId);
        ProgressSystem.markVisited(this.roomId);

        // Clear transition spawn hints so death-respawn/reload picks up cleanly
        progress.fromExit = null;
        progress.spawnX   = null;
        progress.spawnY   = null;

        if (firstVisit && rd.storyBefore && rd.storyBefore.length > 0 && this.kiri) {
            // Show the first Kiri line as a speech bubble (avoids full cutscene mid-run)
            var line = rd.storyBefore[0];
            if (line.indexOf('[KIRI]') === 0) line = line.replace(/^\[KIRI\]\s*"?/, '').replace(/"$/, '');
            this.time.delayedCall(900, () => {
                if (this.kiri && this.kiri.active) this.kiri.say(line, 3500);
            });
        }
        this._showRoomTitle(rd.title || this.roomId);

        // Controls hint (first room only, once per page load)
        if (!window._hintShown && this.roomId === WorldData.startRoom) {
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
        if (this._transitioning)  return;

        this.player.update(time, delta);

        if (this.kiri && this.kiri.active) {
            this.kiri.follow(this.player, delta);
        }

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

        // Door transitions
        this._checkDoorTransitions();

        // Reset one-frame virtual control pulses
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

    // ── Doors ──────────────────────────────────────────────────────────────
    _spawnDoors(exits, roomWidth) {
        this.doorZones = [];
        if (exits.left) {
            this._makeDoor(16, 320, exits.left.room, 'right');
        }
        if (exits.right) {
            this._makeDoor(roomWidth - 16, 320, exits.right.room, 'left');
        }
    }

    _makeDoor(x, y, targetRoom, incomingSide) {
        var door = this.add.image(x, y, 'door').setDepth(2);
        var zone = this.add.zone(x, y, 24, 60).setOrigin(0.5);
        this.physics.add.existing(zone, true);
        zone._target = targetRoom;
        zone._via    = incomingSide;
        zone._door   = door;

        // Boss-lock hint
        if (this.room.lockLeftDoorDuringBoss && incomingSide === 'right' && !this.bossDefeated) {
            door.setTint(0x661111);
        }

        this.doorZones.push(zone);
    }

    _checkDoorTransitions() {
        if (!this.doorZones || this._transitioning) return;
        for (var i = 0; i < this.doorZones.length; i++) {
            var z = this.doorZones[i];
            if (Math.abs(this.player.x - z.x) < 14 && Math.abs(this.player.y - z.y) < 36) {
                if (this.room.lockLeftDoorDuringBoss && !this.bossDefeated && z._via === 'right') {
                    this._flashLockedDoor(z._door);
                    continue;
                }
                this._transitionToRoom(z._target, z._via);
                break;
            }
        }
    }

    _flashLockedDoor(door) {
        if (door._flashing) return;
        door._flashing = true;
        this.tweens.add({
            targets: door, alpha: { from: 1, to: 0.4 }, duration: 120, yoyo: true, repeat: 2,
            onComplete: () => { door._flashing = false; door.setAlpha(1); }
        });
    }

    _transitionToRoom(targetRoom, via) {
        if (this._transitioning) return;
        this._transitioning = true;
        ProgressSystem.savePlayer(this.player);
        ProgressSystem.saveKiri(this.kiri);
        ProgressSystem.transition(targetRoom, via);
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop('UIScene');
            this.scene.stop('MobileScene');
            this.scene.restart();
        });
    }

    // ── Save Point ─────────────────────────────────────────────────────────
    _spawnSavePoint(sp) {
        var sprite = this.add.image(sp.x, sp.y, 'save_point').setDepth(2);
        this.tweens.add({
            targets: sprite, scaleX: { from: 1, to: 1.05 }, scaleY: { from: 1, to: 0.95 },
            duration: 700, yoyo: true, repeat: -1
        });
        var zone = this.add.zone(sp.x, sp.y, 32, 40).setOrigin(0.5);
        this.physics.add.existing(zone, true);
        zone._used = false;
        this.physics.add.overlap(this.player, zone, () => {
            if (zone._used) return;
            zone._used = true;
            ProgressSystem.setSavePoint(this.roomId, sp.x, sp.y);
            this.player.stats.hp = this.player.stats.maxHp;
            this.scene.get('UIScene').events.emit('playerHP', this.player.stats.hp, this.player.stats.maxHp);
            if (this.kiri) {
                this.kiri.resetForLevel();
                this.scene.get('UIScene').events.emit('kiriHealReady');
                this.kiri.say('Hier ruhen wir. Kraft kehrt zurueck.', 2400);
            }
            var txt = this.add.text(sp.x, sp.y - 42, 'GESPEICHERT', {
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

        var nameTag = this.add.text(cfg.x, cfg.y - 50, 'HERR DES VERDERBENS', {
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
        if (this.bossNameTag) this.bossNameTag.destroy();
        // Unlock any door that was boss-gated
        if (this.doorZones) {
            this.doorZones.forEach(z => {
                if (z._door && z._door.tintTopLeft !== 0xffffff) z._door.clearTint();
            });
        }

        var txt = this.add.text(GAME_WIDTH / 2, 80, 'DIE FLAMME IST FREI!', {
            fontSize: '16px', fill: '#00ffcc', fontStyle: 'bold',
            backgroundColor: '#00000088', padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(20);
        this.time.delayedCall(3200, () => { if (txt.active) txt.destroy(); });

        this.scene.get('UIScene').events.emit('bossDied');
        if (this.kiri) this.kiri.say('Er faellt! Die Flamme ist frei!', 3000);

        // Head to WinScene after a brief pause
        this.time.delayedCall(3600, () => {
            ProgressSystem.savePlayer(this.player);
            this.scene.stop('UIScene');
            this.scene.stop('MobileScene');
            this.scene.start('StoryScene', {
                lines: this.room.storyAfter || [],
                nextScene: 'WinScene',
                nextData: {}
            });
        });
    }

    // ── Loot ───────────────────────────────────────────────────────────────
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
        this.events.emit('weaponModeChanged', player.getWeaponMode());
        try { this.sound.play('sfx_pickup'); } catch (e) {}
    }

    // ── Misc ───────────────────────────────────────────────────────────────
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
        var g = this.add.graphics().setScrollFactor(0.2).setDepth(0);
        g.fillStyle(0x0d0820, 0.5);
        var towerPositions = [0.12, 0.35, 0.6, 0.85];
        towerPositions.forEach(frac => {
            var tx = frac * W;
            var tw = 48, th = 160;
            g.fillRect(tx, H - th - 12, tw, th);
            for (var i = 0; i < 3; i++) {
                g.fillRect(tx + i * 16, H - th - 24, 12, 16);
            }
        });
    }
}
