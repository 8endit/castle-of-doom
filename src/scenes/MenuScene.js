class MenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MenuScene' }); }

    create() {
        this.cameras.main.setBackgroundColor(0x08040e);

        var cx = GAME_WIDTH  / 2;
        var cy = GAME_HEIGHT / 2;

        // Background silhouette
        var g = this.add.graphics();
        g.fillStyle(0x0d0820, 1);
        // Moon
        g.fillStyle(0xeeeebb, 1);
        g.fillCircle(cx + 200, 80, 50);
        g.fillStyle(0x0d0820, 1);
        g.fillCircle(cx + 220, 70, 46);   // crescent cutout

        // Castle towers
        g.fillStyle(0x0d0820, 1);
        [[cx - 180, 60], [cx - 80, 80], [cx, 50], [cx + 80, 80], [cx + 180, 60]].forEach(([x, h]) => {
            g.fillRect(x - 30, GAME_HEIGHT - h - 120, 60, h + 120);
            g.fillRect(x - 36, GAME_HEIGHT - h - 130, 72, 20);
            // Battlements
            for (var i = 0; i < 4; i++) {
                g.fillRect(x - 36 + i * 18, GAME_HEIGHT - h - 148, 12, 20);
            }
        });

        // Stars
        g.fillStyle(0xffffff, 1);
        for (var i = 0; i < 80; i++) {
            g.fillPoint(Math.random() * GAME_WIDTH, Math.random() * (GAME_HEIGHT - 180), 2);
        }

        // Title
        this.add.text(cx, cy - 80, 'CASTLE', {
            fontSize: '52px', fill: '#cc2222', fontStyle: 'bold',
            stroke: '#660000', strokeThickness: 6
        }).setOrigin(0.5);
        this.add.text(cx, cy - 30, 'OF DOOM', {
            fontSize: '44px', fill: '#ff4444', fontStyle: 'bold',
            stroke: '#660000', strokeThickness: 5
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, cy + 30, 'A Castlevania-Style Adventure', {
            fontSize: '14px', fill: '#8866aa'
        }).setOrigin(0.5);

        // Blink "press space"
        var startText = this.add.text(cx, cy + 80, '— PRESS SPACE TO START —', {
            fontSize: '16px', fill: '#ffcc44', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: { from: 1, to: 0.2 },
            duration: 700,
            yoyo: true,
            repeat: -1
        });

        // Controls
        this.add.text(cx, cy + 130,
            '← → / A D  Move    ↑ / W / Space  Jump (×2)    Z / X  Attack',
            { fontSize: '11px', fill: '#667788' }).setOrigin(0.5);

        // Version
        this.add.text(GAME_WIDTH - 8, GAME_HEIGHT - 8, 'v1.0', {
            fontSize: '10px', fill: '#334455'
        }).setOrigin(1, 1);

        // Input
        var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        var enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        var startGame = () => {
            window._hintShown = false;  // Reset hint for new game
            this.scene.start('StoryScene', {
                lines: LEVEL_1.storyBefore || [],
                nextScene: 'GameScene',
                nextData: { level: 'LEVEL_1' }
            });
        };

        spaceKey.on('down', startGame);
        enterKey.on('down', startGame);
        this.input.on('pointerdown', startGame);
    }
}
