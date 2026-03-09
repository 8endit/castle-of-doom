class EnemyPatrol extends EnemyBase {
    constructor(scene, x, y, cfg) {
        super(scene, x, y, 'enemy_patrol', Object.assign({ hp: 30, damage: 8, speed: 70 }, cfg));
        this.patrolMin = cfg.min || (x - 128);
        this.patrolMax = cfg.max || (x + 128);
        this.dir = 1;
        this.body.setSize(20, 28);
    }

    thinkAndMove(time, delta) {
        var dist = this.distToPlayer();

        if (dist < 160 && this.player && this.player.active) {
            this.state = 'chase';
        } else if (dist > 220) {
            this.state = 'patrol';
        }

        if (this.state === 'patrol') {
            this._patrol();
        } else if (this.state === 'chase') {
            this._chase();
        }

        this.setFlipX(this.body.velocity.x < 0);

        // Melee attack when close
        if (dist < 40 && this.attackTimer <= 0 && this.player && this.player.active) {
            this.player.takeDamage(this.damage);
            this.attackTimer = 1200;
        }
        if (this.attackTimer > 0) this.attackTimer -= delta;
    }

    _patrol() {
        if (this.x <= this.patrolMin) this.dir = 1;
        if (this.x >= this.patrolMax) this.dir = -1;
        this.body.setVelocityX(this.speed * this.dir);
    }

    _chase() {
        var dir = this.facingPlayer();
        this.body.setVelocityX(this.speed * 1.3 * dir);
    }
}
