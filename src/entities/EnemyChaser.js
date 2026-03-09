class EnemyChaser extends EnemyBase {
    constructor(scene, x, y, cfg) {
        super(scene, x, y, 'enemy_chaser', Object.assign({ hp: 45, damage: 12, speed: 110 }, cfg));
        this.activationRange = 280;
        this.body.setSize(20, 28);
    }

    thinkAndMove(time, delta) {
        var dist = this.distToPlayer();

        if (dist > this.activationRange) {
            // Idle — stand still
            this.body.setVelocityX(0);
            return;
        }

        // Always chase once activated
        var dir = this.facingPlayer();
        this.body.setVelocityX(this.speed * dir);
        this.setFlipX(dir < 0);

        // Melee attack on contact
        if (dist < 40 && this.attackTimer <= 0 && this.player && this.player.active) {
            this.player.takeDamage(this.damage);
            this.attackTimer = 900;
        }
        if (this.attackTimer > 0) this.attackTimer -= delta;
    }
}
