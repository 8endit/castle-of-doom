// R05 — Armory
// Save point, loot reward, ranged ambush.
window.R05 = {
    id: 'R05',
    title: 'Ruestkammer',
    bgColor: 0x1c1428,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            { r: 8,  c: 8,  w: 4, v: 2 },
            { r: 8,  c: 18, w: 4, v: 2 },
            { r: 5,  c: 13, w: 4, v: 2 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R04' },
        right: { room: 'R06' }
    },
    enemies: [
        { type: 'ranged', x: 448, y: 128 },
        { type: 'patrol', x: 720, y: 336, min: 640, max: 832 }
    ],
    spikes: [],
    movingPlatforms: [],
    savePoint: { x: 480, y: 320 },
    boss: null,
    storyBefore: [
        '[KIRI] "Ein alter Altar... nutz ihn. Hier kannst du rasten."'
    ]
};
