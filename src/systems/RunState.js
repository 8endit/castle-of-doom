// RunState — persistent progression across rooms within one run.
// Reset from MenuScene on "Neues Spiel"; never read directly by anyone
// except GameScene + Player respawn.
var RunState = {
    init: function () {
        window.RUN = {
            currentRoom:   'R01',
            fromExit:      null,     // 'left' | 'right' | null (door we entered through)
            spawnOverride: null,     // { x, y } from save-point respawn; beats fromExit
            savePoint:     null,     // { room, x, y } | null
            visited:       {},       // roomId -> true
            player:        null,     // snapshot (see snapshotPlayer)
            kiri:          null      // { healsLeft }
        };
    },

    snapshotPlayer: function (player) {
        if (!player) return;
        window.RUN.player = {
            hp:     player.stats.hp,
            maxHp:  player.stats.maxHp,
            slots:  player.inventory
                ? JSON.parse(JSON.stringify(player.inventory.slots))
                : { weapon: null, helmet: null, body: null, ring: null },
            potions: player.potions ? player.potions.slice() : []
        };
    },

    applyToPlayer: function (player) {
        var snap = window.RUN.player;
        if (!snap || !player) return;
        if (player.inventory) {
            player.inventory.slots = JSON.parse(JSON.stringify(snap.slots));
            player.recalcStats();  // recomputes maxHp/damage/defense from slots
        }
        player.stats.maxHp = snap.maxHp;
        player.stats.hp    = Math.min(snap.hp, player.stats.maxHp);
        player.potions     = snap.potions.slice();
    },

    snapshotKiri: function (kiri) {
        if (!kiri) return;
        window.RUN.kiri = { healsLeft: kiri.healsLeft };
    },

    applyToKiri: function (kiri) {
        var snap = window.RUN.kiri;
        if (!snap || !kiri) return;
        kiri.healsLeft = snap.healsLeft;
    },

    setSave: function (roomId, x, y) {
        window.RUN.savePoint = { room: roomId, x: x, y: y };
    },

    enterRoomVia: function (roomId, via) {
        window.RUN.currentRoom   = roomId;
        window.RUN.fromExit      = via;
        window.RUN.spawnOverride = null;
    },

    respawnAtSave: function () {
        var s = window.RUN.savePoint;
        if (s) {
            window.RUN.currentRoom   = s.room;
            window.RUN.fromExit      = null;
            window.RUN.spawnOverride = { x: s.x, y: s.y };
        } else {
            window.RUN.currentRoom   = 'R01';
            window.RUN.fromExit      = null;
            window.RUN.spawnOverride = null;
        }
        // Full heal on save respawn
        if (window.RUN.player) window.RUN.player.hp = window.RUN.player.maxHp;
    }
};

window.RunState = RunState;
