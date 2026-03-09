// Global virtual controls — read by Player.update(), written by MobileScene
window.VirtualControls = {
    left:              false,
    right:             false,
    jumpJustPressed:   false,
    attackJustPressed: false
};

class MobileScene extends Phaser.Scene {
    constructor() { super({ key: 'MobileScene' }); }

    create() {
        var W = GAME_WIDTH;
        var H = GAME_HEIGHT;
        var R = 38;   // button radius
        var alpha = 0.55;

        // ── Left/Right buttons (bottom-left) ──────────────────────────────
        this._makeBtn(R + 16,       H - R - 20, R, '◀', alpha, 'left');
        this._makeBtn(R * 2 + 52,   H - R - 20, R, '▶', alpha, 'right');

        // ── Jump / Attack buttons (bottom-right) ──────────────────────────
        this._makeBtn(W - R * 2 - 52, H - R - 20, R, '⬆', alpha, 'jump', 0x2255cc);
        this._makeBtn(W - R - 16,    H - R - 20, R, 'Z',  alpha, 'attack', 0xcc2222);

        // Label hints (tiny text)
        var style = { fontSize: '9px', fill: '#ffffff88' };
        this.add.text(R + 16,       H - 12, 'LEFT',   style).setOrigin(0.5, 1);
        this.add.text(R * 2 + 52,   H - 12, 'RIGHT',  style).setOrigin(0.5, 1);
        this.add.text(W - R*2 - 52, H - 12, 'JUMP',   style).setOrigin(0.5, 1);
        this.add.text(W - R - 16,   H - 12, 'ATTACK', style).setOrigin(0.5, 1);

        // Prevent touch events from bubbling to game camera
        this.input.on('pointerdown', (p) => p.event && p.event.stopPropagation && p.event.stopPropagation());
    }

    update() {
        // "Just pressed" flags are consumed by Player in its update — reset here
        // after one full frame cycle so they're always valid for that frame
        // (MobileScene runs after GameScene in the scene queue, so flags were
        //  already read by Player.update this frame)
        window.VirtualControls.jumpJustPressed   = false;
        window.VirtualControls.attackJustPressed = false;
    }

    _makeBtn(x, y, r, label, alpha, action, color) {
        color = color || 0x444466;
        var g = this.add.graphics();

        var redraw = (pressed) => {
            g.clear();
            g.fillStyle(pressed ? 0xffffff : color, pressed ? 0.7 : alpha);
            g.fillCircle(x, y, r);
            g.lineStyle(2, 0xffffff, 0.4);
            g.strokeCircle(x, y, r);
        };

        redraw(false);

        var txt = this.add.text(x, y, label, {
            fontSize: '22px', fill: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        // Hit zone (invisible rectangle over the circle for easier tapping)
        var zone = this.add.zone(x, y, r * 2.2, r * 2.2).setInteractive();

        zone.on('pointerover',  () => { redraw(true);  this._pressAction(action, true);  });
        zone.on('pointerout',   () => { redraw(false); this._pressAction(action, false); });
        zone.on('pointerdown',  () => { redraw(true);  this._pressAction(action, true);  });
        zone.on('pointerup',    () => { redraw(false); this._pressAction(action, false); });
    }

    _pressAction(action, isDown) {
        var vc = window.VirtualControls;
        if (action === 'left')  vc.left   = isDown;
        if (action === 'right') vc.right  = isDown;
        if (action === 'jump'  && isDown) vc.jumpJustPressed   = true;
        if (action === 'attack'&& isDown) vc.attackJustPressed = true;
    }
}
