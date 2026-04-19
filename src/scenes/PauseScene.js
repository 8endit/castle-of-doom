class PauseScene extends Phaser.Scene {
    constructor() { super({ key: 'PauseScene' }); }

    init(data) {
        this.callerScene = (data && data.from) || 'GameScene';
    }

    create() {
        var cx = GAME_WIDTH  / 2;
        var cy = GAME_HEIGHT / 2;

        // Dim overlay
        this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
            .setScrollFactor(0);

        // Panel
        var panel = this.add.rectangle(cx, cy, 260, 160, 0x1a0a30, 0.95)
            .setScrollFactor(0);
        this.add.rectangle(cx, cy, 260, 160, 0x5533aa, 0)
            .setStrokeStyle(2, 0x5533aa).setScrollFactor(0);

        this.add.text(cx, cy - 55, 'PAUSE', {
            fontSize: '28px', fill: '#ffffff', fontStyle: 'bold',
            stroke: '#5533aa', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0);

        this._items = [
            { label: 'Weiterspielen',  action: () => this._resume() },
            { label: 'Steuerung',      action: () => this._showControls() },
            { label: 'Zum Hauptmenü', action: () => this._toMenu() }
        ];
        this._cursor = 0;
        this._menuTexts = this._items.map((item, i) => {
            var t = this.add.text(cx, cy - 10 + i * 34, item.label, {
                fontSize: '15px', fill: '#ccbbee'
            }).setOrigin(0.5).setScrollFactor(0);
            return t;
        });
        this._updateCursor();

        // Controls info panel (hidden)
        this._controlsPanel = this.add.container(cx, cy).setVisible(false).setScrollFactor(0);
        var bg  = this.add.rectangle(0, 0, 280, 170, 0x0d0820, 0.97).setStrokeStyle(1, 0x5533aa);
        var txt = this.add.text(0, -60,
            'Bewegen:   ← →  /  A D\n' +
            'Springen:  ↑  /  W  /  SPACE\n' +
            'Angreifen: Z  /  X\n' +
            'Trank:     Q\n' +
            'Kiri-Heal: H\n' +
            'Pause:     P  /  ESC',
            { fontSize: '12px', fill: '#ddeeff', lineSpacing: 6 }
        ).setOrigin(0.5, 0);
        var close = this.add.text(0, 70, '[ SPACE / ESC — zurück ]', {
            fontSize: '10px', fill: '#554477'
        }).setOrigin(0.5);
        this._controlsPanel.add([bg, txt, close]);

        // Input
        var keys = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.UP,
            down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
            esc:   Phaser.Input.Keyboard.KeyCodes.ESC,
            p:     Phaser.Input.Keyboard.KeyCodes.P
        });

        this.input.keyboard.on('keydown-UP',    () => this._moveCursor(-1));
        this.input.keyboard.on('keydown-DOWN',  () => this._moveCursor(1));
        this.input.keyboard.on('keydown-SPACE', () => this._select());
        this.input.keyboard.on('keydown-ENTER', () => this._select());
        this.input.keyboard.on('keydown-ESC',   () => this._onEsc());
        this.input.keyboard.on('keydown-P',     () => this._onEsc());
    }

    _moveCursor(dir) {
        if (this._controlsPanel.visible) return;
        this._cursor = Phaser.Math.Wrap(this._cursor + dir, 0, this._items.length);
        this._updateCursor();
    }

    _updateCursor() {
        this._menuTexts.forEach((t, i) => {
            t.setText(i === this._cursor ? '▶ ' + this._items[i].label : '   ' + this._items[i].label);
            t.setColor(i === this._cursor ? '#ffffff' : '#ccbbee');
        });
    }

    _select() {
        if (this._controlsPanel.visible) {
            this._controlsPanel.setVisible(false);
            return;
        }
        this._items[this._cursor].action();
    }

    _onEsc() {
        if (this._controlsPanel.visible) {
            this._controlsPanel.setVisible(false);
        } else {
            this._resume();
        }
    }

    _resume() {
        this.scene.resume(this.callerScene);
        this.scene.stop();
    }

    _showControls() {
        this._controlsPanel.setVisible(true);
    }

    _toMenu() {
        this.scene.stop(this.callerScene);
        this.scene.stop('UIScene');
        this.scene.stop('MobileScene');
        this.scene.stop();
        this.scene.start('MenuScene');
    }
}
