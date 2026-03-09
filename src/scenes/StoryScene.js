class StoryScene extends Phaser.Scene {
    constructor() { super({ key: 'StoryScene' }); }

    init(data) {
        this.lines      = (data && data.lines)     || [];
        this.nextScene  = (data && data.nextScene) || 'GameScene';
        this.nextData   = (data && data.nextData)  || {};
        this.lineIndex  = 0;
        this.charIndex  = 0;
        this.fullLine   = '';
        this.typing     = false;
        this.done       = false;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        var cx = GAME_WIDTH  / 2;
        var cy = GAME_HEIGHT / 2;

        // Decorative frame
        var g = this.add.graphics();
        g.lineStyle(2, 0x5533aa, 1);
        g.strokeRect(40, cy - 80, GAME_WIDTH - 80, 160);
        g.lineStyle(1, 0x332266, 1);
        g.strokeRect(44, cy - 76, GAME_WIDTH - 88, 152);

        // Corner ornaments
        [[40, cy-80],[GAME_WIDTH-40, cy-80],[40, cy+80],[GAME_WIDTH-40, cy+80]].forEach(([x, y]) => {
            g.fillStyle(0x5533aa, 1);
            g.fillCircle(x, y, 5);
        });

        // Story text display
        this.storyText = this.add.text(cx, cy - 20, '', {
            fontSize: '17px', fill: '#ddeeff',
            wordWrap: { width: GAME_WIDTH - 120 },
            lineSpacing: 8
        }).setOrigin(0.5, 0.5);

        // "Continue" hint
        this.continueHint = this.add.text(cx, cy + 60, '[ SPACE / ENTER / CLICK to continue ]', {
            fontSize: '11px', fill: '#554477'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: this.continueHint,
            alpha: { from: 0, to: 1 },
            duration: 600, yoyo: true, repeat: -1
        });

        // Scroll indicator
        this.pageNum = this.add.text(GAME_WIDTH - 48, cy + 70, '', {
            fontSize: '10px', fill: '#443366'
        }).setOrigin(0.5);

        if (this.lines.length === 0) {
            // No story — skip straight to next scene
            this.time.delayedCall(200, () => this._next());
            return;
        }

        this._showLine(0);

        // Input
        var advance = () => {
            if (this.typing) {
                // Skip typewriter — show full line
                this._showFullLine();
            } else {
                this._advance();
            }
        };

        this.input.keyboard.on('keydown-SPACE', advance);
        this.input.keyboard.on('keydown-ENTER', advance);
        this.input.on('pointerdown', advance);
    }

    update(time, delta) {
        if (!this.typing || this.done) return;

        this.charTimer = (this.charTimer || 0) + delta;
        if (this.charTimer < 40) return;  // 40ms per character
        this.charTimer = 0;

        if (this.charIndex < this.fullLine.length) {
            this.charIndex++;
            this.storyText.setText(this.fullLine.slice(0, this.charIndex));
        } else {
            this.typing = false;
            this.continueHint.setAlpha(1);
        }
    }

    _showLine(idx) {
        if (idx >= this.lines.length) { this._next(); return; }
        this.lineIndex  = idx;
        this.fullLine   = this.lines[idx];
        this.charIndex  = 0;
        this.typing     = true;
        this.charTimer  = 0;
        this.storyText.setText('');
        this.continueHint.setAlpha(0);
        this.pageNum.setText((idx + 1) + '/' + this.lines.length);
    }

    _showFullLine() {
        this.storyText.setText(this.fullLine);
        this.charIndex = this.fullLine.length;
        this.typing    = false;
        this.continueHint.setAlpha(1);
    }

    _advance() {
        if (this.lineIndex < this.lines.length - 1) {
            this._showLine(this.lineIndex + 1);
        } else {
            this._next();
        }
    }

    _next() {
        if (this.done) return;
        this.done = true;
        this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
            if (progress === 1) {
                this.scene.start(this.nextScene, this.nextData);
            }
        });
    }
}
