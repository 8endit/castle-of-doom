class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(18, 30);
        this.body.setOffset(1, 2);

        // Base stats
        this.baseStats = { maxHp: 100, damage: 10, defense: 0, speed: 180, jumpPower: 380 };
        this.stats = { hp: 100, maxHp: 100, damage: 10, defense: 0, speed: 180, jumpPower: 380 };

        // Combat state
        this.isAttacking    = false;
        this.attackTimer    = 0;
        this.attackDuration = 300;
        this.attackCooldown = 0;
        this.hitEnemiesThisSwing = new Set();
        this.isHurt         = false;
        this.hurtTimer      = 0;
        this.hurtDuration   = 600;
        this.invincible     = false;
        this.canDoubleJump  = true;
        this.jumpCount      = 0;

        // Inventory reference (set after creation)
        this.inventory = null;

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd    = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.altAtkKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Attack visual
        this.attackSprite = scene.add.sprite(x, y, 'attack_box');
        this.attackSprite.setAlpha(0);
        this.attackSprite.setDepth(5);
    }

    update(time, delta) {
        if (!this.active) return;

        var onGround = this.body.blocked.down;

        // Reset double jump when landing
        if (onGround) {
            this.jumpCount = 0;
        }

        // Hurt flash
        if (this.isHurt) {
            this.hurtTimer -= delta;
            this.setAlpha(Math.floor(this.hurtTimer / 80) % 2 === 0 ? 0.3 : 1);
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
                this.invincible = false;
                this.setAlpha(1);
            }
        }

        // Attack cooldown
        if (this.attackCooldown > 0) this.attackCooldown -= delta;

        // Attack active timer
        if (this.isAttacking) {
            this.attackTimer -= delta;
            // Position attack sprite
            var atkOffX = this.flipX ? -34 : 34;
            this.attackSprite.setPosition(this.x + atkOffX, this.y);
            this.attackSprite.setAlpha(0.7);
            this.attackSprite.setFlipX(this.flipX);
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.attackSprite.setAlpha(0);
                this.hitEnemiesThisSwing.clear();
                this.setTexture('player');
            }
        }

        // Horizontal movement (keyboard + virtual touch controls)
        var vc = window.VirtualControls || {};
        var moveLeft  = this.cursors.left.isDown  || this.wasd.left.isDown  || vc.left;
        var moveRight = this.cursors.right.isDown || this.wasd.right.isDown || vc.right;

        if (!this.isHurt) {
            if (moveLeft) {
                this.body.setVelocityX(-this.stats.speed);
                this.setFlipX(true);
            } else if (moveRight) {
                this.body.setVelocityX(this.stats.speed);
                this.setFlipX(false);
            } else {
                this.body.setVelocityX(0);
            }
        }

        // Jump (keyboard + virtual touch controls)
        var jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                          Phaser.Input.Keyboard.JustDown(this.wasd.up)    ||
                          Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                          vc.jumpJustPressed;

        if (jumpPressed) {
            if (onGround) {
                this.body.setVelocityY(-this.stats.jumpPower);
                this.jumpCount = 1;
                this.scene.sound && this.scene.sound.play && this._trySound('sfx_jump');
            } else if (this.jumpCount < 2) {
                this.body.setVelocityY(-this.stats.jumpPower * 0.8);
                this.jumpCount = 2;
            }
        }

        // Attack (keyboard + virtual touch controls)
        var atkPressed = Phaser.Input.Keyboard.JustDown(this.attackKey) ||
                         Phaser.Input.Keyboard.JustDown(this.altAtkKey) ||
                         vc.attackJustPressed;
        if (atkPressed && !this.isAttacking && this.attackCooldown <= 0) {
            this.startAttack();
        }

        // Drop through platform (Down + Jump)
        if ((this.cursors.down && this.cursors.down.isDown) && jumpPressed) {
            this.body.setVelocityY(200);
        }

        // Kill if fallen out of world
        if (this.y > GAME_HEIGHT + 100) {
            this.takeDamage(999);
        }
    }

    startAttack() {
        this.isAttacking = true;
        this.attackTimer = this.attackDuration;
        this.attackCooldown = 400;
        this.setTexture('player_atk');
        this._trySound('sfx_attack');
    }

    takeDamage(amount) {
        if (this.invincible || !this.active) return;

        var dmg = Math.max(1, amount - this.stats.defense);
        this.stats.hp = Math.max(0, this.stats.hp - dmg);

        this.isHurt      = true;
        this.invincible  = true;
        this.hurtTimer   = this.hurtDuration;

        // Knockback
        var kbX = this.flipX ? 150 : -150;
        this.body.setVelocity(kbX, -150);

        this._trySound('sfx_hit');
        this.scene.events.emit('playerDamaged', this.stats.hp, this.stats.maxHp);

        if (this.stats.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.active = false;
        this.body.enable = false;
        this.attackSprite.setAlpha(0);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 40,
            duration: 800,
            onComplete: () => {
                this.scene.scene.start('GameOverScene');
            }
        });
    }

    recalcStats() {
        var bonus = this.inventory ? this.inventory.getTotalBonus() : { damage: 0, defense: 0, hpBonus: 0 };
        var prev  = this.stats.maxHp;
        this.stats.maxHp   = this.baseStats.maxHp + bonus.hpBonus;
        this.stats.damage  = this.baseStats.damage + bonus.damage;
        this.stats.defense = this.baseStats.defense + bonus.defense;
        // Scale current HP proportionally
        this.stats.hp = Math.min(this.stats.hp + (this.stats.maxHp - prev), this.stats.maxHp);
        this.scene.events.emit('playerDamaged', this.stats.hp, this.stats.maxHp);
    }

    _trySound(key) {
        try { this.scene.sound.play(key); } catch (e) { /* no audio file */ }
    }

    destroy(fromScene) {
        if (this.attackSprite) this.attackSprite.destroy();
        super.destroy(fromScene);
    }
}
