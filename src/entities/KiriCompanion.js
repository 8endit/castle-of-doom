// Kiri — the Red Panda companion from the Red Forest.
// She floats next to the player, follows them, and can heal once per level.
class KiriCompanion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'kiri');
        scene.add.existing(this);
        this.setDepth(6);

        this.healsLeft = 1;
        this._bobTimer  = 0;
        this._sayTimer  = 0;

        // Speech bubble
        this._bubble = scene.add.text(x, y - 26, '', {
            fontSize: '11px',
            fill: '#ffeecc',
            backgroundColor: '#2a1a00cc',
            padding: { x: 5, y: 3 },
            wordWrap: { width: 180 }
        }).setOrigin(0.5, 1).setDepth(15).setAlpha(0);

        // Sparkle particles (always on — magical glow)
        this._sparkleTimer = 0;
        this._sparkles = [];

        this.setScale(1.1);
    }

    // Call every game frame from GameScene.update()
    follow(player, delta) {
        if (!this.active || !player.active) return;

        this._bobTimer += delta * 0.003;

        // Float above-and-behind the player (opposite to facing direction)
        var side   = player.flipX ? 1 : -1;
        var targetX = player.x + side * 28;
        var targetY = player.y - 22 + Math.sin(this._bobTimer) * 6;

        // Smooth follow
        this.x = Phaser.Math.Linear(this.x, targetX, 0.09);
        this.y = Phaser.Math.Linear(this.y, targetY, 0.09);
        this.setFlipX(player.flipX);

        // Bubble follows too
        this._bubble.setPosition(this.x, this.y - 14);

        // Tick speech bubble timer
        if (this._sayTimer > 0) {
            this._sayTimer -= delta;
            if (this._sayTimer <= 500) {
                this._bubble.setAlpha(Math.max(0, this._sayTimer / 500));
            }
            if (this._sayTimer <= 0) {
                this._bubble.setAlpha(0);
            }
        }

        // Sparkle effect every 400ms
        this._sparkleTimer += delta;
        if (this._sparkleTimer >= 400) {
            this._sparkleTimer = 0;
            this._emitSparkle();
        }
    }

    // Heal the player (once per level)
    heal(player) {
        if (this.healsLeft <= 0) {
            this.say('Keine Kraft mehr...');
            return;
        }
        this.healsLeft--;
        var healAmt = 40;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healAmt);
        player.scene.events.emit('playerDamaged', player.stats.hp, player.stats.maxHp);
        player.scene.events.emit('kiriHealUsed');
        this.say('Sei geheilt, Freund! +' + healAmt + ' HP');

        // Green healing burst
        var numParts = 12;
        for (var i = 0; i < numParts; i++) {
            var angle  = (i / numParts) * Math.PI * 2;
            var px     = this.scene.add.rectangle(player.x, player.y - 10, 4, 4, 0x44ff88)
                .setDepth(14).setAlpha(0.9);
            this.scene.tweens.add({
                targets: px,
                x: player.x + Math.cos(angle) * 30,
                y: player.y - 10 + Math.sin(angle) * 30,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
                onComplete: () => { if (px.active) px.destroy(); }
            });
        }
        // Screen flash (green)
        var flash = this.scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x00ff88, 0.15)
            .setScrollFactor(0).setDepth(55);
        this.scene.tweens.add({
            targets: flash, alpha: 0, duration: 400,
            onComplete: () => { if (flash.active) flash.destroy(); }
        });

        try { this.scene.sound.play('sfx_pickup'); } catch (e) {}
    }

    // Show a speech bubble
    say(text, duration) {
        this._bubble.setText(text).setAlpha(1);
        this._sayTimer = duration || 2800;
    }

    // Reset for new level
    resetForLevel() {
        this.healsLeft = 1;
    }

    _emitSparkle() {
        if (!this.active) return;
        var sparkle = this.scene.add.rectangle(
            this.x + Phaser.Math.Between(-8, 8),
            this.y + Phaser.Math.Between(-8, 8),
            2, 2, 0xff8800
        ).setDepth(7).setAlpha(0.8);
        this.scene.tweens.add({
            targets: sparkle,
            y: sparkle.y - 10,
            alpha: 0,
            duration: 500,
            onComplete: () => { if (sparkle.active) sparkle.destroy(); }
        });
    }

    destroy(fromScene) {
        if (this._bubble && this._bubble.active) this._bubble.destroy();
        super.destroy(fromScene);
    }
}
