class Inventory {
    constructor(player) {
        this.player = player;
        this.slots  = { weapon: null, helmet: null, body: null, ring: null };
    }

    /** Equip an item. Returns the old item (if any) to drop back into the world. */
    equip(item) {
        var old = this.slots[item.type] || null;
        this.slots[item.type] = item;
        this.player.recalcStats();
        this.player.scene.events.emit('inventoryChanged', this.slots);
        return old;
    }

    /** Unequip a slot and return the item. */
    unequip(type) {
        var item = this.slots[type];
        if (item) {
            this.slots[type] = null;
            this.player.recalcStats();
            this.player.scene.events.emit('inventoryChanged', this.slots);
        }
        return item;
    }

    getTotalBonus() {
        var bonus = { damage: 0, defense: 0, hpBonus: 0 };
        for (var type in this.slots) {
            var item = this.slots[type];
            if (!item) continue;
            bonus.damage  += item.stats.damage  || 0;
            bonus.defense += item.stats.defense || 0;
            bonus.hpBonus += item.stats.hpBonus || 0;
        }
        return bonus;
    }
}
