class GameOverScene extends Phaser.Scene {
    constructor() { super({ key: 'GameOverScene' }); }

    create() {
        this.cameras.main.setBackgroundColor(0x080008);
        var cx = GAME_WIDTH  / 2;
        var cy = GAME_HEIGHT / 2;

        // Skull decoration
        var g = this.add.graphics();
        g.fillStyle(0x330011, 1);
        g.fillCircle(cx, cy - 60, 70);
        g.fillStyle(0x220008, 1);
        g.fillEllipse(cx, cy - 20, 80, 50);  // jaw

        // Eyes
        g.fillStyle(0xff0000, 1);
        g.fillCircle(cx - 22, cy - 68, 14);
        g.fillCircle(cx + 22, cy - 68, 14);
        g.fillStyle(0x000000, 1);
        g.fillCircle(cx - 22, cy - 68, 8);
        g.fillCircle(cx + 22, cy - 68, 8);

        // Game Over text
        this.add.text(cx, cy + 20, 'GAME OVER', {
            fontSize: '48px', fill: '#cc0000', fontStyle: 'bold',
            stroke: '#330000', strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(cx, cy + 76, 'The darkness has claimed you...', {
            fontSize: '14px', fill: '#884444'
        }).setOrigin(0.5);

        // Blink restart
        var hint = this.add.text(cx, cy + 110, '[ R or SPACE — Try Again ]', {
            fontSize: '16px', fill: '#ff8800', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: hint,
            alpha: { from: 1, to: 0.3 },
            duration: 600, yoyo: true, repeat: -1
        });

        this.add.text(cx, cy + 148, 'M — Main Menu', {
            fontSize: '12px', fill: '#666666'
        }).setOrigin(0.5);

        // Input
        this.input.keyboard.addKey('R').on('down', () => this._restart());
        this.input.keyboard.addKey('SPACE').on('down', () => this._restart());
        this.input.keyboard.addKey('M').on('down', () => this.scene.start('MenuScene'));

        // Fade in
        this.cameras.main.fadeIn(600, 0, 0, 0);
    }

    _restart() {
        this.scene.start('StoryScene', {
            lines: LEVEL_1.storyBefore || [],
            nextScene: 'GameScene',
            nextData: { level: 'LEVEL_1' }
        });
    }
}
