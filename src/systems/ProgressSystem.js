// ProgressSystem — persistent run state across rooms.
// Lives on window.GameState.progress; replaces per-level ephemeral state.
var ProgressSystem = {
    reset: function () {
        window.GameState.progress = {
            visitedRooms:   {},        // room id -> true
            roomEntryCount: {},        // room id -> int (enemies respawn if >0 and player re-enters)
            currentRoom:    'R01',
            fromExit:       null,      // 'left' | 'right' | null (spawn origin when entering a room)
            spawnX:         null,
            spawnY:         null,
            savePoint:      { room: 'R01', x: 80, y: 304 },
            keys:           0,
            // Persistent player snapshot (null = fresh start)
            player: null,
            kiri:   null
        };
    },

    markVisited: function (roomId) {
        var p = window.GameState.progress;
        p.visitedRooms[roomId] = true;
        p.roomEntryCount[roomId] = (p.roomEntryCount[roomId] || 0) + 1;
    },

    isFirstVisit: function (roomId) {
        return !window.GameState.progress.visitedRooms[roomId];
    },

    savePlayer: function (player) {
        if (!player) return;
        window.GameState.progress.player = {
            hp:      player.stats.hp,
            maxHp:   player.stats.maxHp,
            defense: player.stats.defense,
            damage:  player.stats.damage,
            slots:   player.inventory ? JSON.parse(JSON.stringify(player.inventory.slots)) : null,
            potions: player.potions ? player.potions.slice() : []
        };
    },

    restorePlayer: function (player) {
        var snap = window.GameState.progress.player;
        if (!snap || !player) return;
        if (player.inventory && snap.slots) {
            player.inventory.slots = snap.slots;
            player.recalcStats();
        }
        player.stats.hp      = snap.hp;
        player.stats.maxHp   = snap.maxHp;
        player.stats.defense = snap.defense;
        player.stats.damage  = snap.damage;
        player.potions = snap.potions.slice();
    },

    saveKiri: function (kiri) {
        if (!kiri) return;
        window.GameState.progress.kiri = { healsLeft: kiri.healsLeft };
    },

    restoreKiri: function (kiri) {
        var snap = window.GameState.progress.kiri;
        if (!snap || !kiri) return;
        kiri.healsLeft = snap.healsLeft;
    },

    setSavePoint: function (roomId, x, y) {
        window.GameState.progress.savePoint = { room: roomId, x: x, y: y };
    },

    respawnAtSave: function () {
        var p = window.GameState.progress;
        p.currentRoom = p.savePoint.room;
        p.fromExit    = null;
        p.spawnX      = p.savePoint.x;
        p.spawnY      = p.savePoint.y;
        // Refill HP on save respawn
        if (p.player) p.player.hp = p.player.maxHp;
    },

    transition: function (toRoom, fromExit) {
        var p = window.GameState.progress;
        p.currentRoom = toRoom;
        p.fromExit    = fromExit;
        p.spawnX      = null;
        p.spawnY      = null;
    }
};

window.ProgressSystem = ProgressSystem;
