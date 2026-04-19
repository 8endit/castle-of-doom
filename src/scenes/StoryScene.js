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
        g.strokeRect(40, cy - 90, GAME_WIDTH - 80, 180);
        g.lineStyle(1, 0x332266, 1);
        g.strokeRect(44, cy - 86, GAME_WIDTH - 88, 172);

        // Corner ornaments
        [[40, cy-90],[GAME_WIDTH-40, cy-90],[40, cy+90],[GAME_WIDTH-40, cy+90]].forEach(([x, y]) => {
            g.fillStyle(0x5533aa, 1);
            g.fillCircle(x, y, 5);
        });

        // Kiri portrait (left side, shown conditionally)
        this.portraitBg = this.add.rectangle(82, cy, 68, 68, 0x2a1000)
            .setOrigin(0.5).setAlpha(0);
        this.portrait   = this.add.image(82, cy, 'kiri_portrait')
            .setOrigin(0.5).setAlpha(0).setScale(1);

        // Speaker name
        this.speakerName = this.add.text(82, cy - 48, '', {
            fontSize: '10px', fill: '#ff8800', fontStyle: 'bold'
        }).setOrigin(0.5, 1).setAlpha(0);

        // Story text (shifts right when portrait is shown)
        this.storyText = this.add.text(cx, cy - 20, '', {
            fontSize: '16px', fill: '#ddeeff',
            wordWrap: { width: GAME_WIDTH - 130 },
            lineSpacing: 8
        }).setOrigin(0.5, 0.5);

        // Continue hint
        this.continueHint = this.add.text(cx, cy + 70, '[ SPACE / ENTER / CLICK to continue ]', {
            fontSize: '11px', fill: '#554477'
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({
            targets: this.continueHint,
            alpha: { from: 0, to: 1 },
            duration: 600, yoyo: true, repeat: -1
        });

        this.pageNum = this.add.text(GAME_WIDTH - 48, cy + 78, '', {
            fontSize: '10px', fill: '#443366'
        }).setOrigin(0.5);

        if (this.lines.length === 0) {
            this.time.delayedCall(200, () => this._next());
            return;
        }
        this._showLine(0);

        var advance = () => {
            if (this.typing) this._showFullLine();
            else             this._advance();
        };
        this.input.keyboard.on('keydown-SPACE', advance);
        this.input.keyboard.on('keydown-ENTER', advance);
        this.input.on('pointerdown', advance);
    }

    update(time, delta) {
        if (!this.typing || this.done) return;
        this.charTimer = (this.charTimer || 0) + delta;
        if (this.charTimer < 35) return;
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
        this.lineIndex = idx;
        var raw = this.lines[idx];

        // Detect [KIRI] speaker tag
        var isKiri  = raw.startsWith('[KIRI]');
        var display = isKiri ? raw.replace('[KIRI] ', '').replace('[KIRI]', '') : raw;

        this.fullLine  = display;
        this.charIndex = 0;
        this.typing    = true;
        this.charTimer = 0;
        this.storyText.setText('');
        this.continueHint.setAlpha(0);
        this.pageNum.setText((idx + 1) + '/' + this.lines.length);

        // Portrait
        if (isKiri) {
            this._showPortrait('kiri_portrait', 'Kiri');
            // Shift text right to make room for portrait
            this.storyText.setPosition(
                GAME_WIDTH / 2 + 30,
                GAME_HEIGHT / 2 - 20
            );
            this.storyText.setWordWrapWidth(GAME_WIDTH - 190);
        } else {
            this._hidePortrait();
            this.storyText.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
            this.storyText.setWordWrapWidth(GAME_WIDTH - 130);
        }
    }

    _showPortrait(key, name) {
        this.portraitBg.setAlpha(1);
        this.portrait.setTexture(key).setAlpha(1);
        this.speakerName.setText(name).setAlpha(1);
        // Slight glow pulse on portrait
        this.tweens.killTweensOf(this.portrait);
        this.tweens.add({
            targets: this.portrait,
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 600, yoyo: true, repeat: 0
        });
    }

    _hidePortrait() {
        this.portraitBg.setAlpha(0);
        this.portrait.setAlpha(0);
        this.speakerName.setAlpha(0);
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
