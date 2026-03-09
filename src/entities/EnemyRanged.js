class EnemyRanged extends EnemyBase {
    constructor(scene, x, y, cfg) {
        super(scene, x, y, 'enemy_ranged', Object.assign({ hp: 25, damage: 10, speed: 40 }, cfg));
        this.shootRange   = 320;
        this.keepDistance = 180;
        this.shootTimer   = 1500;    // ms before first shot
        this.shootCooldown = 2200;
        this.projectiles  = scene.physics.add.group();
        this.body.setSize(20, 28);
    }

    thinkAndMove(time, delta) {
        var dist = this.distToPlayer();

        if (dist > this.shootRange + 80) {
            this.body.setVelocityX(0);
            return;
        }

        // Maintain distance
        if (dist < this.keepDistance) {
            // Retreat
            var awayDir = this.facingPlayer() * -1;
            this.body.setVelocityX(this.speed * awayDir);
        } else {
            this.body.setVelocityX(0);
        }

        this.setFlipX(this.player && this.player.x < this.x);

        // Shoot
        this.shootTimer -= delta;
        if (this.shootTimer <= 0 && dist < this.shootRange && this.player && this.player.active) {
            this._shoot();
            this.shootTimer = this.shootCooldown;
        }
    }

    _shoot() {
        if (!this.player || !this.player.active) return;
        var p = this.projectiles.create(this.x, this.y, 'projectile');
        p.body.allowGravity = false;
        p.setDepth(4);

        var angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
        var speed = 220;
        p.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        p.damage = this.damage;

        // Destroy projectile after 3 seconds
        this.scene.time.delayedCall(3000, () => { if (p.active) p.destroy(); });
        try { this.scene.sound.play('sfx_shoot'); } catch (e) {}
    }

    die() {
        this.projectiles.clear(true, true);
        super.die();
    }

    destroy(fromScene) {
        if (this.projectiles) this.projectiles.clear(true, true);
        super.destroy(fromScene);
    }
}
