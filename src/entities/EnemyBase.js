class EnemyBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, cfg) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.cfg = cfg || {};
        this.maxHp   = cfg.hp     || 30;
        this.hp      = this.maxHp;
        this.damage  = cfg.damage || 8;
        this.speed   = cfg.speed  || 70;

        this.state        = 'patrol';   // patrol | chase | attack | hurt | dead
        this.stateTimer   = 0;
        this.attackTimer  = 0;
        this.hurtTimer    = 0;
        this.player       = null;       // set by GameScene

        this.setCollideWorldBounds(true);
        this.body.setGravityY(200);

        // Loot drop callback (set by GameScene)
        this.onDeath = null;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active || this.state === 'dead') return;

        // Hurt state: count down, then return to patrol
        if (this.state === 'hurt') {
            this.hurtTimer -= delta;
            if (this.hurtTimer <= 0) {
                this.state = 'patrol';
                this.setAlpha(1);
            }
            return;
        }

        this.thinkAndMove(time, delta);
    }

    /** Override in subclasses */
    thinkAndMove(time, delta) {}

    distToPlayer() {
        if (!this.player || !this.player.active) return Infinity;
        return Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    }

    facingPlayer() {
        if (!this.player) return false;
        return this.player.x < this.x ? -1 : 1;  // -1=left, 1=right
    }

    takeDamage(amount) {
        if (this.state === 'dead' || !this.active) return;

        this.hp -= amount;
        this.setTint(0xff4444);
        this.scene.time.delayedCall(120, () => { if (this.active) this.clearTint(); });

        if (this.hp <= 0) {
            this.die();
        } else {
            this.state = 'hurt';
            this.hurtTimer = 400;
            var kbDir = this.player ? (this.player.x < this.x ? 1 : -1) : 1;
            this.body.setVelocity(kbDir * 200, -120);
        }

        try { this.scene.sound.play('sfx_enemy_hit'); } catch (e) {}
    }

    die() {
        this.state = 'dead';
        this.body.enable = false;
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 20,
            scaleX: 1.5,
            scaleY: 0,
            duration: 500,
            onComplete: () => {
                if (this.onDeath) this.onDeath(this.x, this.y);
                this.destroy();
            }
        });
    }
}
