class Boss extends EnemyBase {
    constructor(scene, x, y, cfg) {
        super(scene, x, y, 'boss', Object.assign({ hp: 400, damage: 20, speed: 80 }, cfg));
        this.setScale(1.5);
        this.body.setSize(44, 48);
        this.body.setOffset(2, 4);

        this.phase          = 1;   // 1, 2, 3
        this.shootTimer     = 2000;
        this.shootCooldown  = 1800;
        this.dashTimer      = 4000;
        this.dashCooldown   = 4000;
        this.projectiles    = scene.physics.add.group();
        this.startX         = x;
        this.attackRange    = 70;

        // UI reference for boss bar
        this.scene.events.emit('bossSpawned', this.maxHp);
    }

    thinkAndMove(time, delta) {
        if (!this.player || !this.player.active) return;

        var hpPct = this.hp / this.maxHp;
        if (hpPct <= 0.33 && this.phase < 3) this._enterPhase(3);
        else if (hpPct <= 0.66 && this.phase < 2) this._enterPhase(2);

        var dist = this.distToPlayer();
        var dir  = this.facingPlayer();

        this.setFlipX(dir < 0);

        // Phase-based speed
        var spd = this.speed * (1 + (this.phase - 1) * 0.4);

        // Move toward player
        if (dist > this.attackRange) {
            this.body.setVelocityX(spd * dir);
        } else {
            this.body.setVelocityX(0);
            // Melee slam
            if (this.attackTimer <= 0) {
                this.player.takeDamage(this.damage);
                this.attackTimer = 900;
                this._slam();
            }
        }
        if (this.attackTimer > 0) this.attackTimer -= delta;

        // Ranged attack in phase 2+
        if (this.phase >= 2) {
            this.shootTimer -= delta;
            if (this.shootTimer <= 0) {
                this._shootSpread();
                this.shootTimer = this.shootCooldown;
            }
        }

        // Dash in phase 3
        if (this.phase >= 3) {
            this.dashTimer -= delta;
            if (this.dashTimer <= 0) {
                this._dash(dir);
                this.dashTimer = this.dashCooldown;
            }
        }

        this.scene.events.emit('bossHP', this.hp, this.maxHp);
    }

    _enterPhase(p) {
        this.phase = p;
        this.setTint(p === 2 ? 0xff6600 : 0xff0000);
        // Flash effect
        this.scene.cameras.main.shake(300, 0.01);
        this.shootCooldown = p === 3 ? 1200 : 1800;
    }

    _slam() {
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.7,
            duration: 80,
            yoyo: true
        });
    }

    _shootSpread() {
        if (!this.player || !this.player.active) return;
        var count   = this.phase === 3 ? 5 : 3;
        var baseAng = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        var spread  = Phaser.Math.DegToRad(25);

        for (var i = 0; i < count; i++) {
            var ang = baseAng + spread * (i - (count - 1) / 2);
            var p = this.projectiles.create(this.x, this.y, 'projectile');
            p.body.allowGravity = false;
            p.setDepth(4);
            p.body.setVelocity(Math.cos(ang) * 240, Math.sin(ang) * 240);
            p.damage = Math.floor(this.damage * 0.7);
            this.scene.time.delayedCall(3000, () => { if (p && p.active) p.destroy(); });
        }
    }

    _dash(dir) {
        this.body.setVelocity(dir * 500, -100);
        this.setTint(0xffffff);
        this.scene.time.delayedCall(200, () => { if (this.active) this.clearTint(); });
    }

    die() {
        this.projectiles.clear(true, true);
        this.scene.events.emit('bossDied');
        this.scene.cameras.main.shake(600, 0.02);
        // Drop guaranteed rare items
        for (var i = 0; i < 3; i++) {
            var offX = (i - 1) * 48;
            if (this.onDeath) this.onDeath(this.x + offX, this.y, true);
        }
        super.die();
    }

    destroy(fromScene) {
        if (this.projectiles) this.projectiles.clear(true, true);
        super.destroy(fromScene);
    }
}
