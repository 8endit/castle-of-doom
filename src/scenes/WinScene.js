class WinScene extends Phaser.Scene {
    constructor() { super({ key: 'WinScene' }); }

    create() {
        this.cameras.main.setBackgroundColor(0x0a1428);
        var cx = GAME_WIDTH  / 2;
        var cy = GAME_HEIGHT / 2;

        // Stars
        var g = this.add.graphics();
        g.fillStyle(0xffffff, 1);
        for (var i = 0; i < 120; i++) {
            g.fillPoint(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, 2);
        }

        // Sun/dawn circle
        g.fillStyle(0xffdd88, 1);
        g.fillCircle(cx, GAME_HEIGHT - 20, 120);
        g.fillStyle(0xff8833, 0.5);
        g.fillCircle(cx, GAME_HEIGHT - 20, 160);

        // Victory crown decoration
        g.fillStyle(0xffcc00, 1);
        var crownX = cx - 40;
        var crownY = cy - 100;
        g.fillRect(crownX, crownY + 20, 80, 30);
        [[0, 0],[25, -20],[40, 0],[55, -20],[80, 0]].forEach(([dx, dy]) => {
            g.fillRect(crownX + dx, crownY + dy, 10, 30);
        });

        // Main text
        this.add.text(cx, cy - 20, '✦ VICTORY ✦', {
            fontSize: '46px', fill: '#ffcc00', fontStyle: 'bold',
            stroke: '#885500', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(cx, cy + 40, 'Castle Doom is no more!', {
            fontSize: '18px', fill: '#aaddff'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 72, 'The curse is broken. The land is free.', {
            fontSize: '14px', fill: '#88aacc'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 100, 'You are a legend.', {
            fontSize: '14px', fill: '#88aacc'
        }).setOrigin(0.5);

        // Blink replay
        var hint = this.add.text(cx, cy + 148, '[ SPACE — Play Again ]   [ M — Menu ]', {
            fontSize: '14px', fill: '#ffaa44'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: hint,
            alpha: { from: 1, to: 0.3 },
            duration: 700, yoyo: true, repeat: -1
        });

        // Particle-like twinkle
        this.time.addEvent({
            delay: 200,
            repeat: 50,
            callback: () => {
                var star = this.add.text(
                    Phaser.Math.Between(20, GAME_WIDTH - 20),
                    Phaser.Math.Between(20, GAME_HEIGHT - 20),
                    '✦', { fontSize: '18px', fill: '#ffdd44' }
                );
                this.tweens.add({
                    targets: star, alpha: 0, y: star.y - 30,
                    duration: 1500, onComplete: () => star.destroy()
                });
            }
        });

        // Input
        this.input.keyboard.addKey('SPACE').on('down', () => this._restart());
        this.input.keyboard.addKey('M').on('down', () => this.scene.start('MenuScene'));
        this.cameras.main.fadeIn(800, 0, 0, 0);
    }

    _restart() {
        this.scene.start('StoryScene', {
            lines: LEVEL_1.storyBefore || [],
            nextScene: 'GameScene',
            nextData: { level: 'LEVEL_1' }
        });
    }
}
