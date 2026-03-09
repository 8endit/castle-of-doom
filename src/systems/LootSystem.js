var ITEM_TYPES = ['weapon', 'helmet', 'body', 'ring'];

var ITEM_COLORS = {
    weapon: 0xffdd00,
    helmet: 0x88ccff,
    body:   0x44ff88,
    ring:   0xff88ff
};

var LootSystem = {
    /**
     * Generate a random item.
     * @param {boolean} forced  If true, force a rare item.
     */
    generate(forced) {
        var isRare   = forced || Math.random() < 0.22;
        var type     = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        var rarity   = isRare ? 'rare' : 'common';
        var mult     = isRare ? 2.2 : 1;

        var stats = { damage: 0, defense: 0, hpBonus: 0 };

        if (type === 'weapon') {
            stats.damage  = Math.round(Phaser.Math.Between(5, 12) * mult);
        } else if (type === 'helmet') {
            stats.defense = Math.round(Phaser.Math.Between(2, 5)  * mult);
            stats.hpBonus = Math.round(Phaser.Math.Between(5, 15) * mult);
        } else if (type === 'body') {
            stats.defense = Math.round(Phaser.Math.Between(3, 7)  * mult);
            stats.hpBonus = Math.round(Phaser.Math.Between(10, 25) * mult);
        } else if (type === 'ring') {
            stats.damage  = Math.round(Phaser.Math.Between(2, 6)  * mult);
            stats.hpBonus = Math.round(Phaser.Math.Between(8, 20) * mult);
        }

        return { type, rarity, stats };
    },

    /**
     * Spawn a loot sprite in the scene at (x, y).
     * Returns the sprite so GameScene can track it.
     */
    spawn(scene, x, y, forced) {
        var item   = LootSystem.generate(forced);
        var key    = 'loot_' + item.type;
        var sprite = scene.physics.add.sprite(x, y - 20, key);
        sprite.body.allowGravity = true;
        sprite.setBounce(0.3);
        sprite.setCollideWorldBounds(true);
        sprite.setDepth(3);
        sprite.itemData = item;

        // Glow tween
        scene.tweens.add({
            targets: sprite,
            alpha: { from: 0.6, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // Rare items get a tint
        if (item.rarity === 'rare') {
            sprite.setTint(0xffaa00);
        }

        return sprite;
    },

    /** Drop chance on enemy death (call from GameScene). */
    shouldDrop() {
        return Math.random() < 0.45;   // 45% chance per enemy
    },

    /** Human-readable item label for UI. */
    label(item) {
        var prefix = item.rarity === 'rare' ? '★ ' : '';
        var name   = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        var parts  = [];
        if (item.stats.damage  > 0) parts.push('+' + item.stats.damage  + ' DMG');
        if (item.stats.defense > 0) parts.push('+' + item.stats.defense + ' DEF');
        if (item.stats.hpBonus > 0) parts.push('+' + item.stats.hpBonus + ' HP');
        return prefix + name + ' (' + parts.join(', ') + ')';
    }
};
