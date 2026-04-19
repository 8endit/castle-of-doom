class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    create() {
        var W = GAME_WIDTH, H = GAME_HEIGHT;
        var cx = W / 2, cy = H / 2;

        this._menuIdx = 0;
        this._panelOpen = false;

        // ── Sky gradient ─────────────────────────────────────────────────────
        var sky = this.add.graphics();
        sky.fillGradientStyle(0x04021c, 0x04021c, 0x160830, 0x160830, 1);
        sky.fillRect(0, 0, W, H);

        // ── Stars (three size/brightness tiers, all twinkling) ────────────────
        for (var i = 0; i < 140; i++) {
            var sx = Math.random() * W;
            var sy = Math.random() * (H * 0.72);
            var ss = Math.random() < 0.15 ? 3 : (Math.random() < 0.35 ? 2 : 1);
            var sa = 0.35 + Math.random() * 0.65;
            var star = this.add.rectangle(sx, sy, ss, ss, 0xffffff, sa).setDepth(1);
            this.tweens.add({
                targets: star,
                alpha: { from: sa, to: sa * 0.15 },
                duration: 600 + Math.random() * 2800,
                yoyo: true, repeat: -1,
                delay: Math.random() * 3000,
                ease: 'Sine.easeInOut'
            });
        }

        // ── Crescent moon (top-right) ─────────────────────────────────────────
        var mg = this.add.graphics().setDepth(2);
        mg.fillStyle(0xffeecc, 0.06); mg.fillCircle(W - 108, 58, 72);
        mg.fillStyle(0xffeecc, 0.12); mg.fillCircle(W - 108, 58, 56);
        mg.fillStyle(0xeeeebb, 1);    mg.fillCircle(W - 108, 58, 42);
        mg.fillStyle(0x0d0820, 1);    mg.fillCircle(W - 88,  47, 38);
        // Pulsing corona
        var corona = this.add.graphics().setDepth(2);
        corona.fillStyle(0xffeecc, 0.09); corona.fillCircle(W - 108, 58, 60);
        this.tweens.add({ targets: corona, alpha: { from: 1, to: 0.35 }, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // ── Drifting fog strips ───────────────────────────────────────────────
        var fogG = this.add.graphics().setDepth(2);
        for (var f = 0; f < 6; f++) {
            fogG.fillStyle(0x2a1040, 0.05 + Math.random() * 0.07);
            fogG.fillRoundedRect(
                Math.random() * W * 0.4 - 40,
                H * 0.42 + f * 20,
                W * 0.6 + Math.random() * W * 0.5, 16, 7
            );
        }
        this.tweens.add({ targets: fogG, x: { from: 0, to: 28 }, duration: 7000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        // ── Castle silhouette ─────────────────────────────────────────────────
        var cg = this.add.graphics().setDepth(3);
        cg.fillStyle(0x080412, 1);
        cg.fillRect(0, H - 90, W, 90);  // base wall

        var towers = [
            { x: 60,      h: 140 }, { x: 160,     h: 108 },
            { x: 275,     h: 165 }, { x: cx - 20, h: 210 },
            { x: cx + 80, h: 140 }, { x: W - 190, h: 120 },
            { x: W - 80,  h: 155 }
        ];
        towers.forEach(function (t) {
            var tx = t.x, th = t.h;
            cg.fillRect(tx - 28, H - th, 56, th);
            cg.fillRect(tx - 34, H - th - 14, 68, 14);
            for (var b = 0; b < 4; b++) {
                cg.fillRect(tx - 34 + b * 17, H - th - 26, 11, 12);
            }
        });

        // Gate arch under centre tower
        cg.fillStyle(0x000000, 1);
        cg.fillRect(cx - 28 - 22, H - 90, 44, 90);
        cg.fillEllipse(cx - 28, H - 90, 44, 44);

        // ── Flickering window candles ─────────────────────────────────────────
        towers.forEach(function (t) {
            var wy = H - t.h + 22;
            var win = this.add.rectangle(t.x, wy, 9, 13, 0xff6600, 0.75).setDepth(4);
            this.tweens.add({
                targets: win,
                alpha: { from: 0.75, to: 0.15 + Math.random() * 0.25 },
                duration: 180 + Math.random() * 380,
                yoyo: true, repeat: -1,
                delay: Math.random() * 900
            });
        }, this);

        // ── Rising embers ─────────────────────────────────────────────────────
        this.time.addEvent({
            delay: 280, loop: true,
            callback: function () {
                if (!this.scene.isActive('MenuScene')) return;
                var ex = Math.random() * W;
                var em = this.add.rectangle(ex, H - 60, 2, 2,
                    Math.random() < 0.5 ? 0xff5500 : 0xff8800, 0.85).setDepth(4);
                this.tweens.add({
                    targets: em,
                    y: H - 60 - 70 - Math.random() * 90,
                    x: ex + (Math.random() - 0.5) * 35,
                    alpha: 0, duration: 1400 + Math.random() * 1000,
                    onComplete: function () { if (em.active) em.destroy(); }
                });
            }, callbackScope: this
        });

        // ── Title ─────────────────────────────────────────────────────────────
        var t1 = this.add.text(cx, 48, 'CASTLE', {
            fontSize: '54px', fill: '#dd1a1a', fontStyle: 'bold',
            stroke: '#550000', strokeThickness: 9
        }).setOrigin(0.5).setDepth(5);

        var t2 = this.add.text(cx, 106, 'OF  DOOM', {
            fontSize: '44px', fill: '#ff3333', fontStyle: 'bold',
            stroke: '#660000', strokeThickness: 7
        }).setOrigin(0.5).setDepth(5);

        this.tweens.add({
            targets: [t1, t2], alpha: { from: 1, to: 0.78 },
            duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(cx, 142, 'Die Flamme des Roten Waldes', {
            fontSize: '12px', fill: '#7755aa', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(5);

        // ── Kiri portrait (floating, top-right of menu) ───────────────────────
        var kiriImg = this.add.image(W - 56, 92, 'kiri_portrait')
            .setScale(0.52).setDepth(5).setAlpha(0.92);
        this.add.text(W - 56, 123, 'Kiri', {
            fontSize: '10px', fill: '#ff9933'
        }).setOrigin(0.5).setDepth(5);
        this.tweens.add({
            targets: kiriImg, y: { from: 92, to: 100 },
            duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // ── Menu items ────────────────────────────────────────────────────────
        this._menuDefs = ['NEW GAME', 'CONTROLS', 'ABOUT'];
        this._menuTexts = [];
        var menuY = [172, 210, 245];
        this._menuDefs.forEach(function (label, i) {
            var t = this.add.text(cx, menuY[i],
                (i === 0 ? '▶  ' : '   ') + label, {
                    fontSize: '18px',
                    fill: i === 0 ? '#ffcc44' : '#8888aa',
                    fontStyle: i === 0 ? 'bold' : 'normal'
                }
            ).setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });
            t.on('pointerover', function () { this._setCursor(i); }, this);
            t.on('pointerdown', function () { this._setCursor(i); this._select(); }, this);
            this._menuTexts.push(t);
        }, this);

        // ── Controls hint (very bottom) ───────────────────────────────────────
        this.add.text(cx, H - 14,
            '← → Move   ↑/Space Jump   Z Attack   H Heal   Q Potion   I Inventory',
            { fontSize: '9px', fill: '#333355' }
        ).setOrigin(0.5, 1).setDepth(5);

        this.add.text(W - 8, H - 6, 'v2.0',
            { fontSize: '9px', fill: '#223344' }
        ).setOrigin(1, 1).setDepth(5);

        // ── Info panel (hidden) ───────────────────────────────────────────────
        this._buildInfoPanel();

        // ── Keyboard ─────────────────────────────────────────────────────────
        this.input.keyboard.on('keydown-UP',    function () { this._setCursor((this._menuIdx + 2) % 3); }, this);
        this.input.keyboard.on('keydown-DOWN',  function () { this._setCursor((this._menuIdx + 1) % 3); }, this);
        this.input.keyboard.on('keydown-SPACE', function () { this._select(); }, this);
        this.input.keyboard.on('keydown-ENTER', function () { this._select(); }, this);
        this.input.keyboard.on('keydown-ESC',   function () { this._closePanel(); }, this);

        this.cameras.main.fadeIn(700, 0, 0, 0);
    }

    _setCursor(idx) {
        this._menuIdx = idx;
        this._menuTexts.forEach(function (t, i) {
            var label = (i === idx ? '▶  ' : '   ') + this._menuDefs[i];
            t.setText(label).setStyle({
                fill: i === idx ? '#ffcc44' : '#8888aa',
                fontStyle: i === idx ? 'bold' : 'normal'
            });
        }, this);
    }

    _select() {
        if (this._panelOpen) { this._closePanel(); return; }
        if (this._menuIdx === 0) {
            this._startGame();
        } else {
            this._openPanel(this._menuIdx === 1 ? 'controls' : 'about');
        }
    }

    _buildInfoPanel() {
        var W = GAME_WIDTH, H = GAME_HEIGHT;
        var bg = this.add.rectangle(W / 2, H / 2, 520, 240, 0x0a0520, 0.96)
            .setStrokeStyle(1, 0x5544aa).setDepth(20).setAlpha(0);
        var txt = this.add.text(W / 2, H / 2, '', {
            fontSize: '13px', fill: '#aabbdd', lineSpacing: 9, align: 'center'
        }).setOrigin(0.5).setDepth(21).setAlpha(0);
        var close = this.add.text(W / 2 + 244, H / 2 - 112, '[X] ESC',
            { fontSize: '12px', fill: '#ff6666' }
        ).setOrigin(1, 0).setDepth(22).setAlpha(0).setInteractive({ useHandCursor: true });
        close.on('pointerdown', function () { this._closePanel(); }, this);
        this._panel = { bg, txt, close };
    }

    _openPanel(type) {
        this._panelOpen = true;
        var p = this._panel;
        if (type === 'controls') {
            p.txt.setText(
                '— CONTROLS —\n\n' +
                '← → / A D       Move\n' +
                '↑ / W / Space   Jump  (double jump!)\n' +
                'Z / X             Attack\n' +
                'H                  Kiri heals you  (+40 HP)\n' +
                'Q                  Use potion\n' +
                'I                    Open inventory\n\n' +
                'Equip weapons to change attack mode:\n' +
                'Sword  ·  Bow  ·  Magic Staff'
            );
        } else {
            p.txt.setText(
                '— CASTLE OF DOOM —\n\n' +
                '"Die Flamme des Roten Waldes"\n\n' +
                'The Red Forest is dying.\n' +
                'Its sacred flame was stolen by\n' +
                'the Castle of Doom.\n\n' +
                'You and Kiri the Red Panda must\n' +
                'brave 3 levels, defeat the Doom Guardian,\n' +
                'and reclaim the flame.\n\n' +
                'Built with Phaser 3  ·  v2.0'
            );
        }
        this.tweens.add({ targets: [p.bg, p.txt, p.close], alpha: 1, duration: 220 });
    }

    _closePanel() {
        if (!this._panelOpen) return;
        this._panelOpen = false;
        this.tweens.add({ targets: [this._panel.bg, this._panel.txt, this._panel.close], alpha: 0, duration: 180 });
    }

    _startGame() {
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
