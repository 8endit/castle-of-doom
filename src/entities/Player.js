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
        this.stats     = { hp: 100, maxHp: 100, damage: 10, defense: 0, speed: 180, jumpPower: 380 };

        // Combat state
        this.isAttacking         = false;
        this.attackTimer         = 0;
        this.attackDuration      = 300;
        this.attackCooldown      = 0;
        this._attackQueued       = false;
        this.hitEnemiesThisSwing = new Set();
        this.isHurt              = false;
        this.hurtTimer           = 0;
        this.hurtDuration        = 900;
        this.invincible          = false;
        this.canDoubleJump       = true;
        this.jumpCount           = 0;

        // Coyote time + jump buffer
        this._coyoteTimer  = 0;   // counts down after leaving ground
        this._jumpBuffer   = 0;   // counts down after pressing jump in air
        this._wasOnGround  = false;
        this._spikeTimer   = 0;

        // Inventory + companion reference (set after creation)
        this.inventory = null;
        this.kiri      = null;
        this.potions   = [];

        // Player-fired projectiles group
        this._projectiles = scene.physics.add.group();

        // Input
        this.cursors     = scene.input.keyboard.createCursorKeys();
        this.wasd        = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.attackKey    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.altAtkKey    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.inventoryKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.potionKey    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.kiriKey      = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        // Attack visual (melee only)
        this.attackSprite = scene.add.sprite(x, y, 'attack_box');
        this.attackSprite.setAlpha(0);
        this.attackSprite.setDepth(5);
    }

    update(time, delta) {
        if (!this.active) return;

        var onGround = this.body.blocked.down;

        // Coyote time: give a grace window after walking off a ledge
        if (onGround) {
            this.jumpCount   = 0;
            this._coyoteTimer = 100;
            this._wasOnGround = true;
        } else {
            if (this._coyoteTimer > 0) this._coyoteTimer -= delta;
        }

        // Jump buffer: count down even in air
        if (this._jumpBuffer > 0) this._jumpBuffer -= delta;
        if (this._spikeTimer  > 0) this._spikeTimer  -= delta;

        // Hurt flash
        if (this.isHurt) {
            this.hurtTimer -= delta;
            this.setAlpha(Math.floor(this.hurtTimer / 80) % 2 === 0 ? 0.3 : 1);
            if (this.hurtTimer <= 0) {
                this.isHurt     = false;
                this.invincible = false;
                this.setAlpha(1);
            }
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
            // Fire queued attack the moment cooldown expires
            if (this.attackCooldown <= 0 && this._attackQueued && !this.isAttacking) {
                this._attackQueued = false;
                this.startAttack();
            }
        }

        // Melee attack visual
        if (this.isAttacking) {
            this.attackTimer -= delta;
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

        // Movement
        var vc        = window.VirtualControls || {};
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

        // Jump — with coyote time and jump buffer
        var jumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)    ||
                              Phaser.Input.Keyboard.JustDown(this.wasd.up)       ||
                              Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                              vc.jumpJustPressed;

        if (jumpJustPressed) {
            if (onGround || this._coyoteTimer > 0) {
                // Ground jump (or coyote)
                this.body.setVelocityY(-this.stats.jumpPower);
                this.jumpCount    = 1;
                this._coyoteTimer = 0;
                this._jumpBuffer  = 0;
            } else if (this.jumpCount < 2) {
                // Double jump
                this.body.setVelocityY(-this.stats.jumpPower * 0.85);
                this.jumpCount   = 2;
                this._jumpBuffer = 0;
            } else {
                // In air with no jumps left — store buffer
                this._jumpBuffer = 150;
            }
        }

        // Execute buffered jump on landing
        if (onGround && !this._wasOnGround && this._jumpBuffer > 0) {
            this.body.setVelocityY(-this.stats.jumpPower);
            this.jumpCount   = 1;
            this._jumpBuffer = 0;
        }
        this._wasOnGround = onGround;

        // Drop through platform
        if (this.cursors.down && this.cursors.down.isDown && jumpJustPressed) {
            this.body.setVelocityY(200);
        }

        // Attack — with queue
        var atkJustPressed = Phaser.Input.Keyboard.JustDown(this.attackKey) ||
                             Phaser.Input.Keyboard.JustDown(this.altAtkKey) ||
                             vc.attackJustPressed;
        if (atkJustPressed) {
            if (!this.isAttacking && this.attackCooldown <= 0) {
                this.startAttack();
            } else if (this.attackCooldown > 0) {
                // Queue attack for when cooldown ends (within 400ms window)
                if (this.attackCooldown < 400) this._attackQueued = true;
            }
        }

        // Inventory
        if (Phaser.Input.Keyboard.JustDown(this.inventoryKey)) {
            if (!this.scene.scene.isActive('InventoryScene')) {
                this.scene.scene.launch('InventoryScene');
            }
        }

        // Use potion
        if (Phaser.Input.Keyboard.JustDown(this.potionKey) || vc.potionJustPressed) {
            this._usePotion();
        }

        // Call Kiri to heal
        if (Phaser.Input.Keyboard.JustDown(this.kiriKey) || vc.kiriJustPressed) {
            if (this.kiri) this.kiri.heal(this);
        }

        // Kill if fallen out of world
        if (this.y > GAME_HEIGHT + 100) {
            this.takeDamage(999);
        }
    }

    // Returns current weapon mode based on equipped weapon
    getWeaponMode() {
        if (!this.inventory) return 'sword';
        var w = this.inventory.slots.weapon;
        return (w && w.weaponType) ? w.weaponType : 'sword';
    }

    startAttack() {
        var mode = this.getWeaponMode();
        if (mode === 'bow' || mode === 'magic') {
            this.attackCooldown = 600;
            this._fireProjectile(mode);
        } else {
            this.isAttacking    = true;
            this.attackTimer    = this.attackDuration;
            this.attackCooldown = 400;
            this.setTexture('player_atk');
            this._trySound('sfx_attack');
        }
    }

    _fireProjectile(mode) {
        var key    = mode === 'bow' ? 'arrow' : 'magic_bolt';
        var dir    = this.flipX ? -1 : 1;
        var projX  = this.x + dir * 22;
        var projY  = this.y - 4;
        var proj   = this.scene.physics.add.sprite(projX, projY, key);

        proj.body.allowGravity = false;
        proj.setFlipX(this.flipX);
        proj.setDepth(5);
        proj.damage     = this.stats.damage;
        proj.attackType = mode;

        if (mode === 'bow') {
            proj.body.setVelocityX(dir * 360);
            proj.body.setVelocityY(-30);
        } else {
            proj.body.setVelocityX(dir * 300);
            this.scene.tweens.add({
                targets: proj,
                alpha: { from: 0.5, to: 1 },
                duration: 150, yoyo: true, repeat: -1
            });
        }

        this._projectiles.add(proj);
        this.scene.time.delayedCall(2000, () => {
            if (proj && proj.active) proj.destroy();
        });
        this._trySound('sfx_attack');
    }

    takeDamage(amount) {
        if (this.invincible || !this.active) return;
        var dmg = Math.max(1, amount - this.stats.defense);
        this.stats.hp = Math.max(0, this.stats.hp - dmg);

        // Cancel ongoing attack cleanly
        if (this.isAttacking) {
            this.isAttacking = false;
            this.attackSprite.setAlpha(0);
            this.hitEnemiesThisSwing.clear();
            this.setTexture('player');
        }
        this._attackQueued = false;

        this.isHurt     = true;
        this.invincible = true;
        this.hurtTimer  = this.hurtDuration;

        var kbX = this.flipX ? 150 : -150;
        this.body.setVelocity(kbX, -150);

        this._trySound('sfx_hit');
        this.scene.events.emit('playerDamaged', this.stats.hp, this.stats.maxHp);

        if (this.stats.hp <= 0) this.die();
    }

    die() {
        if (!this.active) return;
        this.active      = false;
        this.body.enable = false;
        this.attackSprite.setAlpha(0);
        this.setTexture('player');

        window.GameState.lives--;

        // Death flash then fade
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 50,
            duration: 700,
            ease: 'Power2',
            onComplete: () => {
                if (window.GameState.lives > 0) {
                    this._showDeathScreen();
                } else {
                    this.scene.scene.start('GameOverScene');
                }
            }
        });
    }

    _showDeathScreen() {
        var scene = this.scene;
        var cam   = scene.cameras.main;
        var cx    = cam.scrollX + GAME_WIDTH  / 2;
        var cy    = cam.scrollY + GAME_HEIGHT / 2;

        var overlay = scene.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0)
            .setDepth(98).setScrollFactor(0);
        scene.tweens.add({ targets: overlay, fillAlpha: 0.7, duration: 400 });

        var txt = scene.add.text(cx, cy - 20, 'GESTORBEN', {
            fontSize: '52px', fill: '#cc1111', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setDepth(99).setScrollFactor(0).setAlpha(0);

        var sub = scene.add.text(cx, cy + 38, 'Respawne am letzten Checkpoint...', {
            fontSize: '14px', fill: '#aa8888'
        }).setOrigin(0.5).setDepth(99).setScrollFactor(0).setAlpha(0);

        scene.tweens.add({ targets: [txt, sub], alpha: 1, duration: 350, delay: 100 });

        scene.time.delayedCall(2000, () => {
            scene.scene.get('UIScene').events.emit('livesChanged', window.GameState.lives);
            scene.scene.stop('UIScene');
            scene.scene.stop('MobileScene');
            scene.scene.start('GameScene', { level: window.GameState.currentLevel });
        });
    }

    _usePotion() {
        if (!this.potions || this.potions.length === 0) return;
        var heal = this.potions.shift();
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + heal);
        this.scene.events.emit('playerDamaged', this.stats.hp, this.stats.maxHp);
        this.scene.events.emit('potionsChanged', this.potions.length);
        var particles = this.scene.add.particles(this.x, this.y, 'player', {
            speed: { min: 20, max: 80 },
            scale: { start: 0.3, end: 0 },
            tint: 0x00ff88,
            lifespan: 500,
            quantity: 10,
            gravityY: -100
        });
        this.scene.time.delayedCall(600, () => { if (particles) particles.destroy(); });
        this._trySound('sfx_pickup');
    }

    recalcStats() {
        var bonus = this.inventory ? this.inventory.getTotalBonus() : { damage: 0, defense: 0, hpBonus: 0 };
        var prev  = this.stats.maxHp;
        this.stats.maxHp   = this.baseStats.maxHp + bonus.hpBonus;
        this.stats.damage  = this.baseStats.damage + bonus.damage;
        this.stats.defense = this.baseStats.defense + bonus.defense;
        this.stats.hp      = Math.min(this.stats.hp + (this.stats.maxHp - prev), this.stats.maxHp);
        this.scene.events.emit('playerDamaged', this.stats.hp, this.stats.maxHp);
        this.scene.events.emit('weaponModeChanged', this.getWeaponMode());
    }

    _trySound(key) {
        try { this.scene.sound.play(key); } catch (e) {}
    }

    destroy(fromScene) {
        if (this.attackSprite) this.attackSprite.destroy();
        super.destroy(fromScene);
    }
}
