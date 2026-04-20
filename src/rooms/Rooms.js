// ROOMS — all room blueprints for the run.
// Each room is 30 cols × 12 rows (960 × 384 px).
//
// tile codes:
//   0 = air, 1 = solid, 2 = one-way platform
//
// Door openings are cut on rows 9-10, cols 0 (left) / 29 (right).
// Spawn positions after a door transition:
//   via 'left'  → enter near the left wall, facing right
//   via 'right' → enter near the right wall, facing left
// ────────────────────────────────────────────────────────────────────────
var ROOM_COLS = 30;
var ROOM_ROWS = 12;

var SPAWN_FROM_LEFT  = { x:  72, y: 336 };
var SPAWN_FROM_RIGHT = { x: 888, y: 336 };

function buildTiles(opts) {
    var data = [];
    for (var r = 0; r < ROOM_ROWS; r++) {
        var row = [];
        for (var c = 0; c < ROOM_COLS; c++) {
            var cell = 0;
            if (r === 0 || r === ROOM_ROWS - 1) cell = 1;         // ceiling / floor
            if (c === 0 || c === ROOM_COLS - 1) cell = 1;         // side walls
            row.push(cell);
        }
        data.push(row);
    }
    if (opts.leftExit)  { data[9][0]               = 0; data[10][0]               = 0; }
    if (opts.rightExit) { data[9][ROOM_COLS - 1]   = 0; data[10][ROOM_COLS - 1]   = 0; }
    (opts.patches || []).forEach(function (p) {
        var w = p.w || 1, h = p.h || 1;
        for (var dy = 0; dy < h; dy++) {
            for (var dx = 0; dx < w; dx++) {
                var rr = p.r + dy, cc = p.c + dx;
                if (rr >= 0 && rr < ROOM_ROWS && cc >= 0 && cc < ROOM_COLS) {
                    data[rr][cc] = p.v;
                }
            }
        }
    });
    return data;
}

var ROOMS = {
    // ── R01 — Eingang (safe, one sword drop, save point) ────────────────
    R01: {
        id:       'R01',
        title:    'Eingang',
        bgColor:  0x1a1028,
        tileData: buildTiles({
            rightExit: true,
            patches: [
                { r: 8, c: 14, w: 4, v: 2 }   // single practice platform
            ]
        }),
        playerStart: { x:  96, y: 336 },
        exits:       { right: 'R02' },
        enemies:     [],
        spikes:      [],
        movingPlatforms: [],
        savePoint:   { x: 160, y: 320 },
        boss:        null
    },

    // ── R02 — Vorhof (one patrol, platforms) ────────────────────────────
    R02: {
        id:       'R02',
        title:    'Vorhof',
        bgColor:  0x151a30,
        tileData: buildTiles({
            leftExit: true,
            rightExit: true,
            patches: [
                { r: 8, c:  6, w: 4, v: 2 },
                { r: 6, c: 13, w: 4, v: 2 },
                { r: 8, c: 21, w: 4, v: 2 }
            ]
        }),
        playerStart: SPAWN_FROM_LEFT,
        exits:       { left: 'R01', right: 'R03' },
        enemies: [
            { type: 'patrol', x: 480, y: 336, min: 320, max: 640 }
        ],
        spikes:          [],
        movingPlatforms: [],
        savePoint:       null,
        boss:            null
    },

    // ── R03 — Katakombe (chaser + spikes, pre-boss) ─────────────────────
    R03: {
        id:       'R03',
        title:    'Katakombe',
        bgColor:  0x1c0818,
        tileData: buildTiles({
            leftExit: true,
            rightExit: true,
            patches: [
                { r: 10, c:  8, w: 2, v: 1 },  // stepping pillar over spikes
                { r: 10, c: 16, w: 2, v: 1 },
                { r: 10, c: 23, w: 2, v: 1 },
                { r:  6, c: 11, w: 3, v: 2 },  // upper alt route
                { r:  6, c: 19, w: 3, v: 2 }
            ]
        }),
        playerStart: SPAWN_FROM_LEFT,
        exits:       { left: 'R02', right: 'RB' },
        enemies: [
            { type: 'chaser', x: 640, y: 336 }
        ],
        spikes: [
            { x: 352, y: 344 }, { x: 384, y: 344 },
            { x: 576, y: 344 }, { x: 608, y: 344 },
            { x: 768, y: 344 }
        ],
        movingPlatforms: [],
        savePoint:       { x: 128, y: 320 },
        boss:            null
    },

    // ── RB — Bossraum (locked during fight) ─────────────────────────────
    RB: {
        id:       'RB',
        title:    'Thronsaal',
        bgColor:  0x30080a,
        tileData: buildTiles({
            leftExit: true,
            rightExit: false,
            patches: [
                { r:  8, c:  4, w: 3, v: 2 },
                { r:  8, c: 23, w: 3, v: 2 },
                { r: 10, c: 14, w: 2, v: 1 }
            ]
        }),
        playerStart: SPAWN_FROM_LEFT,
        exits:       { left: 'R03' },
        enemies:     [],
        spikes:      [],
        movingPlatforms: [],
        savePoint:   null,
        boss:        { x: 720, y: 304 },
        lockExitsDuringBoss: true
    }
};

window.ROOMS            = ROOMS;
window.ROOM_COLS        = ROOM_COLS;
window.ROOM_ROWS        = ROOM_ROWS;
window.SPAWN_FROM_LEFT  = SPAWN_FROM_LEFT;
window.SPAWN_FROM_RIGHT = SPAWN_FROM_RIGHT;
window.START_ROOM       = 'R01';
