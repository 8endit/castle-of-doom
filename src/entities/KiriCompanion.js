// Kiri — the Red Panda guardian of the Red Forest.
// Floats beside the player, heals once per checkpoint, and reacts to gameplay events.
class KiriCompanion extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'kiri');
        scene.add.existing(this);
        this.setDepth(6);

        this.healsLeft = 1;
        this._bobTimer      = 0;
        this._sayTimer      = 0;
        this._idleTimer     = 0;
        this._sparkleTimer  = 0;
        this._lowHpWarned   = false;
        this._killCount     = 0;

        // Speech bubble
        this._bubble = scene.add.text(x, y - 26, '', {
            fontSize: '11px', fill: '#ffeecc',
            backgroundColor: '#2a1a00cc',
            padding: { x: 5, y: 3 },
            wordWrap: { width: 190 }
        }).setOrigin(0.5, 1).setDepth(15).setAlpha(0);

        this.setScale(1.1);
    }

    follow(player, delta) {
        if (!this.active || !player.active) return;

        this._bobTimer  += delta * 0.003;
        this._idleTimer += delta;

        var side    = player.flipX ? 1 : -1;
        var targetX = player.x + side * 28;
        var targetY = player.y - 22 + Math.sin(this._bobTimer) * 6;

        this.x = Phaser.Math.Linear(this.x, targetX, 0.09);
        this.y = Phaser.Math.Linear(this.y, targetY, 0.09);
        this.setFlipX(player.flipX);

        this._bubble.setPosition(this.x, this.y - 14);

        // Bubble fade
        if (this._sayTimer > 0) {
            this._sayTimer -= delta;
            if (this._sayTimer <= 500) this._bubble.setAlpha(Math.max(0, this._sayTimer / 500));
            if (this._sayTimer <= 0)   this._bubble.setAlpha(0);
        }

        // Sparkle every 400ms
        this._sparkleTimer += delta;
        if (this._sparkleTimer >= 400) {
            this._sparkleTimer = 0;
            this._emitSparkle();
        }

        // Low-HP warning (< 30 %)
        var hpPct = player.stats.hp / player.stats.maxHp;
        if (hpPct < 0.30 && !this._lowHpWarned && this._sayTimer <= 0) {
            this._lowHpWarned = true;
            var msg = this.healsLeft > 0
                ? 'Du bist verletzt! Soll ich helfen? [H]'
                : 'Pass auf! Du bist fast tot!';
            this.say(msg, 3200);
        }
        if (hpPct >= 0.50) this._lowHpWarned = false;

        // Random idle chatter every ~45 s
        if (this._idleTimer > 45000 && this._sayTimer <= 0) {
            this._idleTimer = 0;
            this._sayIdle();
        }
    }

    // Heal the player once per checkpoint
    heal(player) {
        if (this.healsLeft <= 0) {
            this.say('Meine Kraft ist erschöpft...', 2600);
            return;
        }
        this.healsLeft--;
        var healAmt = 40;
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + healAmt);
        player.scene.events.emit('playerDamaged', player.stats.hp, player.stats.maxHp);
        player.scene.events.emit('kiriHealUsed');
        this.say('Sei geheilt, Freund! +' + healAmt + ' HP', 3000);

        // Healing burst
        for (var i = 0; i < 12; i++) {
            var angle = (i / 12) * Math.PI * 2;
            var px = player.scene.add.rectangle(player.x, player.y - 10, 4, 4, 0x44ff88).setDepth(14).setAlpha(0.9);
            player.scene.tweens.add({
                targets: px,
                x: player.x + Math.cos(angle) * 30,
                y: player.y - 10 + Math.sin(angle) * 30,
                alpha: 0, duration: 600, ease: 'Power2',
                onComplete: function () { if (px.active) px.destroy(); }
            });
        }
        var flash = player.scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x00ff88, 0.14)
            .setScrollFactor(0).setDepth(55);
        player.scene.tweens.add({ targets: flash, alpha: 0, duration: 400, onComplete: function () { if (flash.active) flash.destroy(); } });
        try { player.scene.sound.play('sfx_pickup'); } catch (e) {}
    }

    // Called by GameScene when an enemy is killed
    onEnemyKilled() {
        this._killCount++;
        var reactions = {
            1:  'Gut gemacht!',
            3:  'Du kämpfst wie ein Wächter!',
            5:  'Beeindruckend!',
            8:  'Nichts kann dich aufhalten!',
            12: 'Du bist ein Krieger!'
        };
        if (reactions[this._killCount] && this._sayTimer <= 0) {
            this.say(reactions[this._killCount], 2200);
        }
    }

    say(text, duration) {
        this._bubble.setText(text).setAlpha(1);
        this._sayTimer = duration || 2800;
    }

    resetForLevel() {
        this.healsLeft    = 1;
        this._lowHpWarned = false;
        this._idleTimer   = 0;
        this._killCount   = 0;
    }

    _sayIdle() {
        var quotes = [
            'Ich spüre alte Magie hier...',
            'Bleib bei mir, Krieger.',
            'Der Wald braucht uns.',
            'Wie viele Gegner noch, wohl?',
            'Diese Burg riecht nach Verrat.',
            'Mein Schwanz wärmt mich noch ein wenig.',
            'Pass auf Fallen auf!'
        ];
        this.say(Phaser.Math.RND.pick(quotes), 2800);
    }

    _emitSparkle() {
        if (!this.active) return;
        var sp = this.scene.add.rectangle(
            this.x + Phaser.Math.Between(-8, 8),
            this.y + Phaser.Math.Between(-8, 8),
            2, 2, 0xff8800
        ).setDepth(7).setAlpha(0.8);
        this.scene.tweens.add({
            targets: sp, y: sp.y - 10, alpha: 0, duration: 500,
            onComplete: function () { if (sp.active) sp.destroy(); }
        });
    }

    destroy(fromScene) {
        if (this._bubble && this._bubble.active) this._bubble.destroy();
        super.destroy(fromScene);
    }
}
