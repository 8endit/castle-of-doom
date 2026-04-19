// WorldData — the 10-room graph.
// Each entry references a room blueprint defined in src/rooms/R??.js.
// Room coordinates in the overworld are purely for mini-map use (optional).
//
// Room layout (linear, bidirectional):
//   R01 <-> R02 <-> R03 <-> R04 <-> R05 <-> R06 <-> R07 <-> R08 <-> R09 <-> R10
//
// Each room's left/right door matches the neighbor's opposite door.
var WorldData = {
    startRoom: 'R01',
    bossRoom:  'R10',

    rooms: [
        { id: 'R01', title: 'Gate of Doom',        map: { col: 0, row: 0 } },
        { id: 'R02', title: 'Foyer',               map: { col: 1, row: 0 } },
        { id: 'R03', title: 'Great Hall',          map: { col: 2, row: 0 } },
        { id: 'R04', title: 'Chapel Ruins',        map: { col: 3, row: 0 } },
        { id: 'R05', title: 'Armory',              map: { col: 4, row: 0 } },
        { id: 'R06', title: 'Dungeon Descent',     map: { col: 5, row: 0 } },
        { id: 'R07', title: 'Catacombs West',      map: { col: 6, row: 0 } },
        { id: 'R08', title: 'Catacombs East',      map: { col: 7, row: 0 } },
        { id: 'R09', title: 'Inner Sanctum',       map: { col: 8, row: 0 } },
        { id: 'R10', title: 'Throne of Doom',      map: { col: 9, row: 0 } }
    ],

    get: function (id) {
        return window[id] || null;
    },

    title: function (id) {
        for (var i = 0; i < this.rooms.length; i++) {
            if (this.rooms[i].id === id) return this.rooms[i].title;
        }
        return id;
    }
};

window.WorldData = WorldData;

// ── Room-tile helper ───────────────────────────────────────────────────────
// Standard room: 30 cols × 12 rows (960 × 384 px). Ceiling, floor, walls.
// Door cutouts on rows 9-10 (y=288..352) for left/right exits.
// Spawn positions: left-entry x=64 y=336, right-entry x=896 y=336.
//
//   patches: array of { r, c, v, w?, h? }
//     - r,c: tile coordinate
//     - v: 0 air, 1 solid, 2 one-way platform
//     - w,h: optional run length (defaults 1×1)
//
// Returns a 2D tile array ready for TileMap.build().
function makeRoomTiles(opts) {
    var cols = 30, rows = 12;
    var data = [];
    for (var r = 0; r < rows; r++) {
        var row = [];
        for (var c = 0; c < cols; c++) {
            var cell = 0;
            if (r === 0 || r === rows - 1) cell = 1;
            if (c === 0 || c === cols - 1) cell = 1;
            row.push(cell);
        }
        data.push(row);
    }
    if (opts.leftDoor)  { data[9][0]        = 0; data[10][0]        = 0; }
    if (opts.rightDoor) { data[9][cols - 1] = 0; data[10][cols - 1] = 0; }
    (opts.patches || []).forEach(function (p) {
        var w = p.w || 1, h = p.h || 1;
        for (var dy = 0; dy < h; dy++) {
            for (var dx = 0; dx < w; dx++) {
                var rr = p.r + dy, cc = p.c + dx;
                if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
                    data[rr][cc] = p.v;
                }
            }
        }
    });
    return data;
}
window.makeRoomTiles = makeRoomTiles;

// Standard spawn positions after coming through a door
var ROOM_SPAWN = {
    left:  { x: 64,  y: 336 },   // entering from left door → face right
    right: { x: 896, y: 336 }    // entering from right door → face left
};
window.ROOM_SPAWN = ROOM_SPAWN;

