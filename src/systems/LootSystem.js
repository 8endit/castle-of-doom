// Named world-fitting items for Castle of Doom
var WEAPON_VARIANTS = [
    { name: 'Shadow Blade',      weaponType: 'sword',  dmgRange: [8, 14]  },
    { name: 'Flame Sword',       weaponType: 'sword',  dmgRange: [10, 16] },
    { name: 'Silver Edge',       weaponType: 'sword',  dmgRange: [6, 12]  },
    { name: 'Bone Cleaver',      weaponType: 'sword',  dmgRange: [12, 18] },
    { name: 'Elven Longbow',     weaponType: 'bow',    dmgRange: [5, 10]  },
    { name: 'Shadow Crossbow',   weaponType: 'bow',    dmgRange: [8, 14]  },
    { name: 'Storm Bow',         weaponType: 'bow',    dmgRange: [7, 12]  },
    { name: 'Moonstaff',         weaponType: 'magic',  dmgRange: [6, 11]  },
    { name: 'Chaos Wand',        weaponType: 'magic',  dmgRange: [9, 15]  },
    { name: "Lich's Scepter",    weaponType: 'magic',  dmgRange: [11, 18] },
];

var HELMET_VARIANTS = [
    { name: 'Iron Helm',         defRange: [2, 4],  hpRange: [5, 10]  },
    { name: "Mage's Crown",      defRange: [1, 3],  hpRange: [10, 20] },
    { name: 'Shadow Hood',       defRange: [3, 5],  hpRange: [8, 15]  },
    { name: 'Dragon Helm',       defRange: [4, 7],  hpRange: [10, 20] },
    { name: 'Ancient Circlet',   defRange: [2, 5],  hpRange: [15, 25] },
];

var BODY_VARIANTS = [
    { name: 'Scale Mail',        defRange: [4, 7],  hpRange: [10, 20] },
    { name: 'Shadow Cloak',      defRange: [5, 8],  hpRange: [8, 18]  },
    { name: 'Dragon Armor',      defRange: [6, 10], hpRange: [15, 25] },
    { name: 'Enchanted Robe',    defRange: [3, 6],  hpRange: [20, 35] },
    { name: 'Battle Plate',      defRange: [7, 12], hpRange: [5, 15]  },
];

var RING_VARIANTS = [
    { name: 'Moonstone Ring',    dmgRange: [2, 5],  hpRange: [10, 20] },
    { name: 'Blood Ruby',        dmgRange: [3, 7],  hpRange: [8, 15]  },
    { name: 'Spirit Band',       dmgRange: [1, 4],  hpRange: [15, 25] },
    { name: 'Chaos Sigil',       dmgRange: [4, 8],  hpRange: [5, 12]  },
    { name: 'Forest Gem',        dmgRange: [2, 6],  hpRange: [12, 20] },
];

var ITEM_TYPES = ['weapon', 'helmet', 'body', 'ring'];
var POTION_HEAL = [30, 50];

var LootSystem = {
    generate(forced) {
        var isRare = forced || Math.random() < 0.22;
        var type   = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        var rarity = isRare ? 'rare' : 'common';
        var mult   = isRare ? 2.2 : 1;
        var item   = { type, rarity, stats: { damage: 0, defense: 0, hpBonus: 0 } };

        if (type === 'weapon') {
            var v = WEAPON_VARIANTS[Math.floor(Math.random() * WEAPON_VARIANTS.length)];
            item.name       = (isRare ? '★ ' : '') + v.name;
            item.weaponType = v.weaponType;
            item.stats.damage = Math.round(Phaser.Math.Between(v.dmgRange[0], v.dmgRange[1]) * mult);

        } else if (type === 'helmet') {
            var v = HELMET_VARIANTS[Math.floor(Math.random() * HELMET_VARIANTS.length)];
            item.name = (isRare ? '★ ' : '') + v.name;
            item.stats.defense = Math.round(Phaser.Math.Between(v.defRange[0], v.defRange[1]) * mult);
            item.stats.hpBonus = Math.round(Phaser.Math.Between(v.hpRange[0],  v.hpRange[1])  * mult);

        } else if (type === 'body') {
            var v = BODY_VARIANTS[Math.floor(Math.random() * BODY_VARIANTS.length)];
            item.name = (isRare ? '★ ' : '') + v.name;
            item.stats.defense = Math.round(Phaser.Math.Between(v.defRange[0], v.defRange[1]) * mult);
            item.stats.hpBonus = Math.round(Phaser.Math.Between(v.hpRange[0],  v.hpRange[1])  * mult);

        } else { // ring
            var v = RING_VARIANTS[Math.floor(Math.random() * RING_VARIANTS.length)];
            item.name = (isRare ? '★ ' : '') + v.name;
            item.stats.damage  = Math.round(Phaser.Math.Between(v.dmgRange[0], v.dmgRange[1]) * mult);
            item.stats.hpBonus = Math.round(Phaser.Math.Between(v.hpRange[0],  v.hpRange[1])  * mult);
        }

        return item;
    },

    spawn(scene, x, y, forced) {
        var item   = LootSystem.generate(forced);
        var key    = 'loot_' + item.type;
        var sprite = scene.physics.add.sprite(x, y - 20, key);
        sprite.body.allowGravity = true;
        sprite.setBounce(0.3);
        sprite.setCollideWorldBounds(true);
        sprite.setDepth(3);
        sprite.itemData = item;

        // Glow pulse
        scene.tweens.add({
            targets: sprite,
            alpha: { from: 0.6, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        if (item.rarity === 'rare') {
            sprite.setTint(0xffaa00);
        }
        return sprite;
    },

    generatePotion() {
        var heal = Phaser.Math.Between(POTION_HEAL[0], POTION_HEAL[1]);
        return { type: 'potion', name: 'Health Potion', rarity: 'common', healAmount: heal };
    },

    spawnPotion(scene, x, y) {
        var item   = LootSystem.generatePotion();
        var sprite = scene.physics.add.sprite(x, y - 20, 'loot_potion');
        sprite.body.allowGravity = true;
        sprite.setBounce(0.3);
        sprite.setCollideWorldBounds(true);
        sprite.setDepth(3);
        sprite.itemData = item;
        scene.tweens.add({
            targets: sprite,
            alpha: { from: 0.6, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        return sprite;
    },

    shouldDrop()       { return Math.random() < 0.45; },
    shouldDropPotion() { return Math.random() < 0.25; },

    label(item) {
        if (item.name) {
            var parts = [];
            if (item.stats.damage  > 0) parts.push('+' + item.stats.damage  + ' DMG');
            if (item.stats.defense > 0) parts.push('+' + item.stats.defense + ' DEF');
            if (item.stats.hpBonus > 0) parts.push('+' + item.stats.hpBonus + ' HP');
            var wType = item.weaponType ? ' [' + item.weaponType + ']' : '';
            return item.name + wType + (parts.length ? ' (' + parts.join(', ') + ')' : '');
        }
        var prefix = item.rarity === 'rare' ? '★ ' : '';
        var name   = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        var parts  = [];
        if (item.stats.damage  > 0) parts.push('+' + item.stats.damage  + ' DMG');
        if (item.stats.defense > 0) parts.push('+' + item.stats.defense + ' DEF');
        if (item.stats.hpBonus > 0) parts.push('+' + item.stats.hpBonus + ' HP');
        return prefix + name + ' (' + parts.join(', ') + ')';
    }
};
