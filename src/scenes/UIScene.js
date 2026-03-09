class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene' }); }

    create() {
        // ---- HP Bar ----
        this.hpBg   = this.add.rectangle(12, 12, 160, 14, 0x330000).setOrigin(0, 0);
        this.hpBar  = this.add.rectangle(12, 12, 160, 14, 0xff2222).setOrigin(0, 0);
        this.hpText = this.add.text(16, 10, 'HP', { fontSize: '11px', fill: '#ffffff' });
        this.hpVal  = this.add.text(175, 10, '', { fontSize: '11px', fill: '#ffaaaa' });

        // ---- Boss HP Bar (hidden initially) ----
        this.bossBarGroup = this.add.group();
        var bossLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 36, '', {
            fontSize: '13px', fill: '#ff4444', fontStyle: 'bold'
        }).setOrigin(0.5, 1);
        this.bossBg  = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 22, 300, 14, 0x330000).setOrigin(0.5, 0);
        this.bossBar = this.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 22, 300, 14, 0xff0000).setOrigin(0, 0);
        this.bossLabel = bossLabel;
        this.bossBg.setVisible(false);
        this.bossBar.setVisible(false);
        this.bossLabel.setVisible(false);
        this.bossMaxHp = 400;

        // ---- Inventory Slots ----
        var slotY    = 36;
        var slotSize = 30;
        var slotGap  = 34;
        this.invSlots = {};
        var types = ['weapon', 'helmet', 'body', 'ring'];
        var icons = ['⚔', '🪖', '🛡', '💍'];
        types.forEach((type, i) => {
            var x = 12 + i * slotGap;
            var bg = this.add.rectangle(x, slotY, slotSize, slotSize, 0x222244).setOrigin(0, 0);
            var icon = this.add.text(x + 4, slotY + 5, icons[i], { fontSize: '14px' }).setOrigin(0, 0);
            var label = this.add.text(x, slotY + slotSize + 2, type[0].toUpperCase(),
                { fontSize: '9px', fill: '#8888aa' }).setOrigin(0, 0);
            this.invSlots[type] = { bg, icon, label, filled: false };
        });

        // ---- Item pickup toast ----
        this.toast = this.add.text(GAME_WIDTH / 2, 70, '', {
            fontSize: '13px', fill: '#00ffcc',
            backgroundColor: '#00000088', padding: { x: 8, y: 4 }
        }).setOrigin(0.5, 0).setAlpha(0);
        this.toastTimer = 0;

        // ---- Level name ----
        var gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.levelData) {
            var lvlName = this.add.text(GAME_WIDTH - 12, 12,
                gameScene.levelData.name || '', {
                    fontSize: '12px', fill: '#6688aa'
                }).setOrigin(1, 0);
        }

        // ---- Damage flash overlay ----
        this.dmgFlash = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xff0000, 0)
            .setOrigin(0, 0).setDepth(50);

        // ---- Listen to game events ----
        this.events.on('playerHP', this._updateHP, this);
        this.events.on('bossSpawned', this._showBossBar, this);
        this.events.on('bossHP', this._updateBossBar, this);
        this.events.on('bossDied', this._hideBossBar, this);
        this.events.on('inventoryChanged', this._updateInventory, this);
        this.events.on('itemPickup', this._showToast, this);

        // Forward events from GameScene to UIScene
        var gs = this.scene.get('GameScene');
        if (gs) {
            gs.events.on('playerDamaged', (hp, max) => this.events.emit('playerHP', hp, max));
            gs.events.on('bossSpawned',   (max)     => this.events.emit('bossSpawned', max));
            gs.events.on('bossHP',        (hp, max) => this.events.emit('bossHP', hp, max));
            gs.events.on('bossDied',      ()        => this.events.emit('bossDied'));
            gs.events.on('inventoryChanged', (s)    => this.events.emit('inventoryChanged', s));
        }
    }

    update(time, delta) {
        // Toast fade
        if (this.toastTimer > 0) {
            this.toastTimer -= delta;
            if (this.toastTimer <= 500) {
                this.toast.setAlpha(this.toastTimer / 500);
            }
            if (this.toastTimer <= 0) {
                this.toast.setAlpha(0);
            }
        }

        // Damage flash decay
        var flashAlpha = this.dmgFlash.fillAlpha;
        if (flashAlpha > 0) {
            this.dmgFlash.setFillStyle(0xff0000, Math.max(0, flashAlpha - 0.04));
        }
    }

    _updateHP(hp, maxHp) {
        var pct = Math.max(0, hp / maxHp);
        this.hpBar.setSize(160 * pct, 14);
        var color = pct > 0.5 ? 0xff2222 : (pct > 0.25 ? 0xff8800 : 0xff0000);
        this.hpBar.setFillStyle(color);
        this.hpVal.setText(hp + '/' + maxHp);

        // Flash on damage
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
        var pct = Math.max(0, hp / maxHp);
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
            if (item) {
                var rareColor = item.rarity === 'rare' ? '#ffaa00' : '#aabbcc';
                slot.label.setText(type[0].toUpperCase()).setStyle({ fill: rareColor });
            } else {
                slot.label.setText(type[0].toUpperCase()).setStyle({ fill: '#8888aa' });
            }
        });
    }

    _showToast(msg) {
        this.toast.setText(msg).setAlpha(1);
        this.toastTimer = 2500;
    }
}
