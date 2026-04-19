class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    create() {
        var W = GAME_WIDTH, H = GAME_HEIGHT;
        var cx = W / 2, cy = H / 2;
        window.GameState.deaths++;

        this.cameras.main.setBackgroundColor(0x060008);

        // ── Background: blood-red vignette ────────────────────────────────────
        var bg = this.add.graphics();
        bg.fillGradientStyle(0x000000, 0x000000, 0x1a0008, 0x1a0008, 1);
        bg.fillRect(0, 0, W, H);

        // Faint skull shape in background
        var sg = this.add.graphics().setAlpha(0.18);
        sg.fillStyle(0x440011, 1);
        sg.fillCircle(cx, cy - 44, 66);
        sg.fillStyle(0x330008, 1);
        sg.fillEllipse(cx, cy + 8, 76, 46);
        sg.fillStyle(0x000000, 1);
        sg.fillCircle(cx - 20, cy - 52, 12);
        sg.fillCircle(cx + 20, cy - 52, 12);
        sg.fillRect(cx - 18, cy - 18, 8, 20);
        sg.fillRect(cx - 4,  cy - 18, 8, 20);
        sg.fillRect(cx + 10, cy - 18, 8, 20);

        // Falling embers / blood drops
        this.time.addEvent({
            delay: 220, loop: true,
            callback: function () {
                var ex = Math.random() * W;
                var em = this.add.rectangle(ex, -4, 2, 5, 0xcc0022, 0.7);
                this.tweens.add({
                    targets: em, y: H + 10, duration: 1600 + Math.random() * 1200,
                    onComplete: function () { if (em.active) em.destroy(); }
                });
            }, callbackScope: this
        });

        // ── Title ─────────────────────────────────────────────────────────────
        var goText = this.add.text(cx, cy - 80, 'GAME OVER', {
            fontSize: '52px', fill: '#cc0000', fontStyle: 'bold',
            stroke: '#330000', strokeThickness: 10
        }).setOrigin(0.5).setAlpha(0);

        this.add.text(cx, cy - 34, 'The darkness has claimed you...', {
            fontSize: '13px', fill: '#773344'
        }).setOrigin(0.5).setAlpha(0.85);

        // ── Stats ─────────────────────────────────────────────────────────────
        var gs = window.GameState;
        var levelNames = { LEVEL_1: 'Castle Courtyard', LEVEL_2: 'The Catacombs', LEVEL_3: 'The Inner Sanctum' };
        var levelName = levelNames[gs.currentLevel] || gs.currentLevel;
        var elapsed = gs.startTime ? Math.floor((Date.now() - gs.startTime) / 1000) : 0;
        var mm = Math.floor(elapsed / 60), ss = elapsed % 60;
        var timeStr = mm + ':' + (ss < 10 ? '0' : '') + ss;

        this.add.text(cx, cy + 4, [
            'Level reached:     ' + levelName,
            'Enemies slain:    ' + (gs.kills || 0),
            'Time played:       ' + timeStr
        ].join('\n'), {
            fontSize: '13px', fill: '#886677', lineSpacing: 8, align: 'left'
        }).setOrigin(0.5).setAlpha(0.9);

        // ── Kiri farewell ─────────────────────────────────────────────────────
        this.add.image(cx - 180, cy - 56, 'kiri_portrait').setScale(0.38).setAlpha(0.6);
        this.add.text(cx - 180, cy - 22, '"Ich warte auf dich..."', {
            fontSize: '10px', fill: '#ff8833', fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0.7);

        // ── Buttons ───────────────────────────────────────────────────────────
        this._makeBtn(cx - 90, cy + 90, 'RETRY', '#ffcc44', 0x221100, function () { this._restart(); });
        this._makeBtn(cx + 90, cy + 90, 'MENU',  '#aaaaff', 0x110022, function () { this.scene.start('MenuScene'); });

        // Blinking hint
        var hint = this.add.text(cx, cy + 130, 'R / Space — Retry     M — Menu', {
            fontSize: '11px', fill: '#554433'
        }).setOrigin(0.5);
        this.tweens.add({ targets: hint, alpha: { from: 0.9, to: 0.3 }, duration: 700, yoyo: true, repeat: -1 });

        // ── Animate in ────────────────────────────────────────────────────────
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.tweens.add({ targets: goText, alpha: 1, duration: 600, delay: 200, ease: 'Power2' });

        // ── Input ─────────────────────────────────────────────────────────────
        this.input.keyboard.addKey('R').on('down',     function () { this._restart(); }, this);
        this.input.keyboard.addKey('SPACE').on('down', function () { this._restart(); }, this);
        this.input.keyboard.addKey('M').on('down',     function () { this.scene.start('MenuScene'); }, this);
    }

    _makeBtn(x, y, label, color, bgColor, cb) {
        var bg = this.add.rectangle(x, y, 130, 38, bgColor, 0.85)
            .setStrokeStyle(1, 0x666666).setInteractive({ useHandCursor: true });
        var txt = this.add.text(x, y, label, {
            fontSize: '16px', fill: color, fontStyle: 'bold'
        }).setOrigin(0.5);
        bg.on('pointerover',  function () { bg.setFillStyle(bgColor + 0x111111); txt.setStyle({ fill: '#ffffff' }); });
        bg.on('pointerout',   function () { bg.setFillStyle(bgColor); txt.setStyle({ fill: color }); });
        bg.on('pointerdown',  cb, this);
    }

    _restart() {
        window.GameState.kills     = 0;
        window.GameState.startTime = Date.now();
        this.cameras.main.fade(400, 0, 0, 0, false, function (cam, p) {
            if (p === 1) {
                this.scene.start('StoryScene', {
                    lines: LEVEL_1.storyBefore || [],
                    nextScene: 'GameScene',
                    nextData: { level: 'LEVEL_1' }
                });
            }
        }, this);
    }
}
