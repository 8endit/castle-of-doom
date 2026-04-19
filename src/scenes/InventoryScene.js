class InventoryScene extends Phaser.Scene {
    constructor() { super({ key: 'InventoryScene' }); }

    create() {
        var W = GAME_WIDTH;
        var H = GAME_HEIGHT;
        var panelW = 420;
        var panelH = 300;
        var panelX = (W - panelW) / 2;
        var panelY = (H - panelH) / 2;

        // Dim background overlay
        this.dimBg = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0).setDepth(0);

        // Panel background
        this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a1040, 1)
            .setOrigin(0, 0).setDepth(1);
        this.add.rectangle(panelX, panelY, panelW, panelH, 0x4433aa, 0)
            .setOrigin(0, 0).setDepth(1)
            .setStrokeStyle(2, 0x8866ff);

        // Title
        this.add.text(panelX + panelW / 2, panelY + 14, 'INVENTORY', {
            fontSize: '18px', fill: '#ccaaff', fontStyle: 'bold'
        }).setOrigin(0.5, 0).setDepth(2);

        // Close button [X]
        var closeBtn = this.add.text(panelX + panelW - 12, panelY + 10, '[X]', {
            fontSize: '14px', fill: '#ff6666'
        }).setOrigin(1, 0).setDepth(2).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this._close());

        // Slot layout
        var slotTypes  = ['weapon', 'helmet', 'body', 'ring'];
        var slotIcons  = ['⚔', '🪖', '🛡', '💍'];
        var slotLabels = ['WEAPON', 'HELMET', 'BODY', 'RING'];
        this._slotObjects = {};

        slotTypes.forEach((type, i) => {
            var row = i;
            var sy  = panelY + 50 + row * 56;
            var sx  = panelX + 20;

            // Icon box
            var box = this.add.rectangle(sx, sy, 40, 40, 0x221155, 1)
                .setOrigin(0, 0).setDepth(2)
                .setStrokeStyle(1, 0x6655aa);
            var icon = this.add.text(sx + 20, sy + 20, slotIcons[i], {
                fontSize: '18px'
            }).setOrigin(0.5).setDepth(3);

            // Slot label
            this.add.text(sx + 52, sy + 4, slotLabels[i], {
                fontSize: '10px', fill: '#8877bb'
            }).setDepth(2);

            // Item name / stats
            var nameText = this.add.text(sx + 52, sy + 18, 'empty', {
                fontSize: '13px', fill: '#aaaacc'
            }).setDepth(2);

            var statsText = this.add.text(sx + 52, sy + 34, '', {
                fontSize: '10px', fill: '#7799bb'
            }).setDepth(2);

            // Unequip button (shown only when slot is filled)
            var unequipBtn = this.add.text(panelX + panelW - 20, sy + 20, 'DROP', {
                fontSize: '11px', fill: '#ff9955',
                backgroundColor: '#331100', padding: { x: 4, y: 2 }
            }).setOrigin(1, 0.5).setDepth(2).setInteractive({ useHandCursor: true }).setAlpha(0);
            unequipBtn.on('pointerdown', () => this._unequipSlot(type));

            this._slotObjects[type] = { nameText, statsText, unequipBtn };
        });

        // Total stats line
        this._totalText = this.add.text(panelX + panelW / 2, panelY + panelH - 24,
            '', { fontSize: '11px', fill: '#aaccff' }
        ).setOrigin(0.5, 1).setDepth(2);

        // Populate with current inventory
        var gs = this.scene.get('GameScene');
        if (gs && gs.player && gs.player.inventory) {
            this._refresh(gs.player.inventory.slots);
        }

        // Close on ESC or I
        this.input.keyboard.on('keydown-ESC', () => this._close());
        this.input.keyboard.on('keydown-I',   () => this._close());

        // Click outside panel to close
        this.dimBg.setInteractive();
        this.dimBg.on('pointerdown', () => this._close());

        // Pause GameScene input while open (keep it running for physics)
        this.scene.pause('GameScene');
    }

    _refresh(slots) {
        var totalAtk = 0, totalDef = 0, totalHp = 0;
        var types = ['weapon', 'helmet', 'body', 'ring'];
        types.forEach(type => {
            var obj  = this._slotObjects[type];
            var item = slots[type];
            if (item) {
                var displayName = item.name || (item.type.charAt(0).toUpperCase() + item.type.slice(1));
                obj.nameText.setText(displayName)
                    .setStyle({ fill: item.rarity === 'rare' ? '#ffcc44' : '#ccddff' });
                var parts = [];
                if (item.weaponType)           parts.push('[' + item.weaponType + ']');
                if (item.stats.damage  > 0) { parts.push('+' + item.stats.damage  + ' ATK'); totalAtk += item.stats.damage; }
                if (item.stats.defense > 0) { parts.push('+' + item.stats.defense + ' DEF'); totalDef += item.stats.defense; }
                if (item.stats.hpBonus > 0) { parts.push('+' + item.stats.hpBonus + ' HP');  totalHp  += item.stats.hpBonus; }
                obj.statsText.setText(parts.join('  '));
                obj.unequipBtn.setAlpha(1);
            } else {
                obj.nameText.setText('empty').setStyle({ fill: '#556677' });
                obj.statsText.setText('');
                obj.unequipBtn.setAlpha(0);
            }
        });
        this._totalText.setText('TOTAL STATS:  ATK +' + totalAtk + '  DEF +' + totalDef + '  HP +' + totalHp);
    }

    _unequipSlot(type) {
        var gs = this.scene.get('GameScene');
        if (!gs || !gs.player) return;
        var item = gs.player.inventory.unequip(type);
        if (item) {
            // Drop item into game world
            var dropped = LootSystem.spawn(gs, gs.player.x + 30, gs.player.y - 20);
            dropped.itemData = item;
            gs.lootItems.add(dropped);
            gs.physics.add.collider(dropped, gs.solidLayer);
        }
        this._refresh(gs.player.inventory.slots);
    }

    _close() {
        this.scene.resume('GameScene');
        this.scene.stop('InventoryScene');
    }
}
