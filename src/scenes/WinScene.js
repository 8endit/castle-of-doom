class WinScene extends Phaser.Scene {
    constructor() { super({ key: 'WinScene' }); }

    create() {
        var W = GAME_WIDTH, H = GAME_HEIGHT;
        var cx = W / 2, cy = H / 2;

        this.cameras.main.setBackgroundColor(0x060c20);

        // ── Dawn sky gradient ────────────────────────────────────────────────
        var bg = this.add.graphics();
        bg.fillGradientStyle(0x060c20, 0x060c20, 0x1a2840, 0x1a2840, 1);
        bg.fillRect(0, 0, W, H);

        // ── Stars (fading out to suggest dawn) ────────────────────────────────
        var starG = this.add.graphics();
        starG.fillStyle(0xffffff, 1);
        for (var i = 0; i < 80; i++) {
            starG.fillPoint(Math.random() * W, Math.random() * H * 0.6, Math.random() < 0.3 ? 2 : 1);
        }
        this.tweens.add({ targets: starG, alpha: { from: 0.7, to: 0.2 }, duration: 5000, delay: 1000 });

        // ── Rising sun at horizon ─────────────────────────────────────────────
        var sunG = this.add.graphics();
        sunG.fillStyle(0xffdd88, 0.12); sunG.fillCircle(cx, H + 30, 180);
        sunG.fillStyle(0xff9933, 0.20); sunG.fillCircle(cx, H + 30, 130);
        sunG.fillStyle(0xffcc44, 0.45); sunG.fillCircle(cx, H + 30, 80);
        sunG.fillStyle(0xffeeaa, 1);    sunG.fillCircle(cx, H + 30, 44);
        sunG.setAlpha(0);
        this.tweens.add({ targets: sunG, alpha: 1, duration: 3000, delay: 800, ease: 'Power2' });

        // ── Golden light spill ────────────────────────────────────────────────
        var lightG = this.add.graphics();
        lightG.fillGradientStyle(0x000000, 0x000000, 0xffcc44, 0xffcc44, 0);
        lightG.fillRect(0, 0, W, H);
        lightG.setAlpha(0);
        this.tweens.add({ targets: lightG, alpha: 0.08, duration: 4000, delay: 1500 });

        // ── Kiri portrait (floating, slightly left) ───────────────────────────
        var kiriImg = this.add.image(cx - 170, cy - 30, 'kiri_portrait')
            .setScale(0.7).setAlpha(0).setDepth(3);
        this.tweens.add({ targets: kiriImg, alpha: 0.95, duration: 1200, delay: 600 });
        this.tweens.add({
            targets: kiriImg, y: { from: cy - 30, to: cy - 20 },
            duration: 2000, yoyo: true, repeat: -1, delay: 800, ease: 'Sine.easeInOut'
        });

        // ── Victory text ──────────────────────────────────────────────────────
        var vic = this.add.text(cx + 30, cy - 72, '✦  VICTORY  ✦', {
            fontSize: '42px', fill: '#ffcc00', fontStyle: 'bold',
            stroke: '#885500', strokeThickness: 7
        }).setOrigin(0.5).setAlpha(0).setDepth(4);
        this.tweens.add({ targets: vic, alpha: 1, duration: 900, delay: 400 });
        this.tweens.add({ targets: vic, alpha: { from: 1, to: 0.82 }, duration: 1800, yoyo: true, repeat: -1, delay: 1400, ease: 'Sine.easeInOut' });

        // Kiri epilogue lines
        var epilogueLines = [
            '"Die Flamme brennt wieder."',
            '"Der Rote Wald erwacht aus seinem Schlaf."',
            '"Ich werde dich nie vergessen, Krieger."'
        ];
        epilogueLines.forEach(function (line, i) {
            this.add.text(cx + 30, cy - 26 + i * 24, line, {
                fontSize: '13px', fill: i === 2 ? '#ff9933' : '#aaddff', fontStyle: i === 2 ? 'italic' : 'normal'
            }).setOrigin(0.5).setAlpha(0).setDepth(4)._tween = this.tweens.add({ targets: this.children.list[this.children.list.length - 1], alpha: 1, duration: 700, delay: 1400 + i * 500 });
        }, this);

        // ── Stats ─────────────────────────────────────────────────────────────
        var gs = window.GameState;
        var elapsed = gs.startTime ? Math.floor((Date.now() - gs.startTime) / 1000) : 0;
        var mm = Math.floor(elapsed / 60), ss = elapsed % 60;
        var timeStr = mm + ':' + (ss < 10 ? '0' : '') + ss;
        var statsText = this.add.text(cx + 30, cy + 66,
            'Enemies slain: ' + (gs.kills || 0) + '     Time: ' + timeStr + '     Deaths: ' + (gs.deaths || 0),
            { fontSize: '11px', fill: '#6688aa' }
        ).setOrigin(0.5).setAlpha(0).setDepth(4);
        this.tweens.add({ targets: statsText, alpha: 0.9, duration: 600, delay: 2800 });

        // ── Buttons ───────────────────────────────────────────────────────────
        var hint = this.add.text(cx + 30, cy + 100,
            '[ SPACE / R — Play Again ]     [ M — Main Menu ]',
            { fontSize: '12px', fill: '#ffaa44' }
        ).setOrigin(0.5).setAlpha(0).setDepth(4);
        this.tweens.add({ targets: hint, alpha: 1, duration: 600, delay: 3200 });
        this.tweens.add({ targets: hint, alpha: { from: 1, to: 0.35 }, duration: 700, yoyo: true, repeat: -1, delay: 4000 });

        // ── Gold star burst ───────────────────────────────────────────────────
        this.time.addEvent({
            delay: 240, repeat: 40,
            callback: function () {
                var star = this.add.text(
                    Phaser.Math.Between(30, W - 30),
                    Phaser.Math.Between(20, H - 20),
                    '✦', { fontSize: '14px', fill: '#ffdd44' }
                ).setDepth(5);
                this.tweens.add({ targets: star, alpha: 0, y: star.y - 28, duration: 1400, onComplete: function () { if (star.active) star.destroy(); } });
            }, callbackScope: this
        });

        // ── Input ─────────────────────────────────────────────────────────────
        this.input.keyboard.addKey('SPACE').on('down', function () { this._restart(); }, this);
        this.input.keyboard.addKey('R').on('down',     function () { this._restart(); }, this);
        this.input.keyboard.addKey('M').on('down',     function () { this.scene.start('MenuScene'); }, this);
        this.input.on('pointerdown', function () { this._restart(); }, this);

        this.cameras.main.fadeIn(900, 0, 0, 0);
    }

    _restart() {
        window.GameState.lives        = 3;
        window.GameState.currentLevel = 'LEVEL_1';
        window.GameState.checkpoint   = null;
        window.GameState.kills        = 0;
        window.GameState.deaths       = 0;
        window.GameState.startTime    = Date.now();
        window._hintShown             = false;
        this.cameras.main.fade(500, 0, 0, 0, false, function (cam, p) {
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
