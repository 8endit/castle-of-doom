class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene' }); }

    create() {
        // ── HP Bar ──────────────────────────────────────────────────────────
        this.hpBg   = this.add.rectangle(12, 12, 160, 14, 0x330000).setOrigin(0, 0);
        this.hpBar  = this.add.rectangle(12, 12, 160, 14, 0xff2222).setOrigin(0, 0);
        this.hpText = this.add.text(16, 10, 'HP', { fontSize: '11px', fill: '#ffffff' });
        this.hpVal  = this.add.text(175, 10, '', { fontSize: '11px', fill: '#ffaaaa' });

        // ── Boss bar (positioned higher so DOM buttons don't overlap on mobile) ─
        this.bossLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, '', {
            fontSize: '13px', fill: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5, 1).setVisible(false);
        this.bossBg  = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 66, 300, 14, 0x330000)
            .setOrigin(0.5, 0).setVisible(false);
        this.bossBar = this.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 66, 300, 14, 0xff0000)
            .setOrigin(0, 0).setVisible(false);
        this.bossMaxHp = 400;

        // ── Inventory slots ───────────────────────────────────────────────────
        var slotY    = 36;
        var slotSize = 30;
        var slotGap  = 34;
        this.invSlots = {};
        var types = ['weapon', 'helmet', 'body', 'ring'];
        var icons = ['⚔', '🪖', '🛡', '💍'];
        types.forEach((type, i) => {
            var x  = 12 + i * slotGap;
            var bg = this.add.rectangle(x, slotY, slotSize, slotSize, 0x222244).setOrigin(0, 0);
            var icon = this.add.text(x + 4, slotY + 5, icons[i], { fontSize: '14px' }).setOrigin(0, 0);
            var label = this.add.text(x, slotY + slotSize + 2, type[0].toUpperCase(),
                { fontSize: '9px', fill: '#8888aa' }).setOrigin(0, 0);
            this.invSlots[type] = { bg, icon, label, filled: false };
        });

        // ── Weapon mode indicator ─────────────────────────────────────────────
        this.weaponModeText = this.add.text(152, 36, '⚔', {
            fontSize: '18px', fill: '#aaddff',
            backgroundColor: '#00000066', padding: { x: 4, y: 2 }
        }).setOrigin(0, 0);
        this.add.text(152, 70, 'WPN', { fontSize: '8px', fill: '#6688aa' }).setOrigin(0, 0);

        // ── Kiri heal indicator ───────────────────────────────────────────────
        this.kiriHealIcon = this.add.text(186, 36, '🐾', {
            fontSize: '16px',
            backgroundColor: '#001a0066', padding: { x: 4, y: 2 }
        }).setOrigin(0, 0);
        this.kiriHealLabel = this.add.text(186, 70, '[H]', {
            fontSize: '8px', fill: '#ff9933'
        }).setOrigin(0, 0);
        this.add.text(186, 78, 'KIRI', { fontSize: '8px', fill: '#ff8800' }).setOrigin(0, 0);

        // ── Item pickup toast ─────────────────────────────────────────────────
        this.toast = this.add.text(GAME_WIDTH / 2, 8, '', {
            fontSize: '13px', fill: '#00ffcc',
            backgroundColor: '#00000088', padding: { x: 8, y: 4 }
        }).setOrigin(0.5, 0).setAlpha(0);
        this.toastTimer = 0;

        // ── Level name ────────────────────────────────────────────────────────
        var gs = this.scene.get('GameScene');
        if (gs && gs.levelData) {
            this.add.text(GAME_WIDTH - 12, 12, gs.levelData.name || '', {
                fontSize: '12px', fill: '#6688aa'
            }).setOrigin(1, 0);
        }

        // ── Damage flash overlay ──────────────────────────────────────────────
        this.dmgFlash = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0)
            .setOrigin(0, 0).setDepth(50);

        // ── Lives (top area — stays clear of bottom touch buttons) ───────────
        this.heartIcons = [];
        for (var h = 0; h < 3; h++) {
            var heart = this.add.text(14 + h * 22, 72, '♥', {
                fontSize: '18px', fill: '#ff3333'
            });
            this.heartIcons.push(heart);
        }
        this._updateLives(window.GameState.lives);

        // ── Potion slots (next to hearts) ─────────────────────────────────────
        this.potionSlots = [];
        for (var p = 0; p < 2; p++) {
            var slotBg = this.add.rectangle(88 + p * 28, 80, 22, 22, 0x222222)
                .setOrigin(0.5).setStrokeStyle(1, 0x553333);
            var slotIcon = this.add.text(88 + p * 28, 80, '❤', {
                fontSize: '12px', fill: '#441111'
            }).setOrigin(0.5);
            this.potionSlots.push({ bg: slotBg, icon: slotIcon });
        }
        this.add.text(88, 62, '[Q]', { fontSize: '9px', fill: '#886666' }).setOrigin(0.5, 1);

        // ── Event listeners ───────────────────────────────────────────────────
        this.events.on('playerHP',         this._updateHP,        this);
        this.events.on('bossSpawned',      this._showBossBar,     this);
        this.events.on('bossHP',           this._updateBossBar,   this);
        this.events.on('bossDied',         this._hideBossBar,     this);
        this.events.on('inventoryChanged', this._updateInventory, this);
        this.events.on('itemPickup',       this._showToast,       this);
        this.events.on('livesChanged',     this._updateLives,     this);
        this.events.on('potionsChanged',   this._updatePotions,   this);
        this.events.on('weaponModeChanged',this._updateWeapon,    this);
        this.events.on('kiriHealUsed',     this._onKiriUsed,      this);
        this.events.on('kiriHealReady',    this._onKiriReady,     this);

        // Forward from GameScene
        var gameScene = this.scene.get('GameScene');
        if (gameScene) {
            gameScene.events.on('playerDamaged',   (hp, max) => this.events.emit('playerHP', hp, max));
            gameScene.events.on('bossSpawned',     (max)     => this.events.emit('bossSpawned', max));
            gameScene.events.on('bossHP',          (hp, max) => this.events.emit('bossHP', hp, max));
            gameScene.events.on('bossDied',        ()        => this.events.emit('bossDied'));
            gameScene.events.on('inventoryChanged',(s)       => this.events.emit('inventoryChanged', s));
            gameScene.events.on('weaponModeChanged',(m)      => this.events.emit('weaponModeChanged', m));
            gameScene.events.on('kiriHealUsed',    ()        => this.events.emit('kiriHealUsed'));
            gameScene.events.on('kiriHealReady',   ()        => this.events.emit('kiriHealReady'));
        }
    }

    update(time, delta) {
        if (this.toastTimer > 0) {
            this.toastTimer -= delta;
            if (this.toastTimer <= 500) this.toast.setAlpha(this.toastTimer / 500);
            if (this.toastTimer <= 0)   this.toast.setAlpha(0);
        }
        var flashAlpha = this.dmgFlash.fillAlpha;
        if (flashAlpha > 0) {
            this.dmgFlash.setFillStyle(0xff0000, Math.max(0, flashAlpha - 0.04));
        }
    }

    _updateHP(hp, maxHp) {
        var pct   = Math.max(0, hp / maxHp);
        this.hpBar.setSize(160 * pct, 14);
        var color = pct > 0.5 ? 0xff2222 : (pct > 0.25 ? 0xff8800 : 0xff0000);
        this.hpBar.setFillStyle(color);
        this.hpVal.setText(hp + '/' + maxHp);
        if (hp < (this._lastHP || maxHp)) {
            this.dmgFlash.setFillStyle(0xff0000, 0.35);
        }
        this._lastHP = hp;
    }

    _showBossBar(maxHp) {
        this.bossMaxHp = maxHp;
        this.bossBg.setVisible(true);
        this.bossBar.setVisible(true);
        this.bossLabel.setText('DOOM GUARDIAN').setVisible(true);
    }

    _updateBossBar(hp, maxHp) {
        var pct   = Math.max(0, hp / maxHp);
        this.bossBar.setSize(300 * pct, 14);
        var color = pct > 0.5 ? 0xff2200 : (pct > 0.25 ? 0xff6600 : 0xff0000);
        this.bossBar.setFillStyle(color);
        this.bossLabel.setText('DOOM GUARDIAN — ' + hp + '/' + maxHp);
    }

    _hideBossBar() {
        this.bossBg.setVisible(false);
        this.bossBar.setVisible(false);
        this.bossLabel.setVisible(false);
    }

    _updateInventory(slots) {
        var types = ['weapon', 'helmet', 'body', 'ring'];
        types.forEach(type => {
            var slot  = this.invSlots[type];
            var item  = slots[type];
            slot.filled = !!item;
            slot.bg.setFillStyle(item ? 0x445566 : 0x222244);
            var col = item ? (item.rarity === 'rare' ? '#ffaa00' : '#aabbcc') : '#8888aa';
            slot.label.setText(type[0].toUpperCase()).setStyle({ fill: col });
        });
    }

    _showToast(msg) {
        this.toast.setText(msg).setAlpha(1);
        this.toastTimer = 2500;
    }

    _updateLives(lives) {
        this.heartIcons.forEach((heart, i) => {
            heart.setStyle({ fill: i < lives ? '#ff3333' : '#441111' });
            heart.setAlpha(i < lives ? 1 : 0.6);
        });
    }

    _updatePotions(count) {
        this.potionSlots.forEach((slot, i) => {
            if (i < count) {
                slot.icon.setStyle({ fill: '#ff4444' });
                slot.bg.setFillStyle(0x331111);
            } else {
                slot.icon.setStyle({ fill: '#441111' });
                slot.bg.setFillStyle(0x222222);
            }
        });
    }

    _updateWeapon(mode) {
        var icons = { sword: '⚔', bow: '🏹', magic: '✨' };
        this.weaponModeText.setText(icons[mode] || '⚔');
        var colors = { sword: '#aaddff', bow: '#aaff99', magic: '#ddaaff' };
        this.weaponModeText.setStyle({ fill: colors[mode] || '#aaddff' });
    }

    _onKiriUsed() {
        this.kiriHealIcon.setStyle({ fill: '#442200' });
        this.kiriHealLabel.setText('[H]').setStyle({ fill: '#664400' });
        this.kiriHealIcon.setText('🐾').setAlpha(0.4);
    }

    _onKiriReady() {
        this.kiriHealIcon.setAlpha(1);
        this.kiriHealLabel.setStyle({ fill: '#ff9933' });
        this.kiriHealIcon.setText('🐾');
        // Pulse to indicate ready
        this.tweens.add({
            targets: this.kiriHealIcon,
            scaleX: { from: 1, to: 1.3 }, scaleY: { from: 1, to: 1.3 },
            duration: 300, yoyo: true, ease: 'Power2'
        });
    }
}
