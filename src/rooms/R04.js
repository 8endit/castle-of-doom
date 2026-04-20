// R04 — Chapel Ruins
// Floor spikes — must use platforms to cross.
window.R04 = {
    id: 'R04',
    title: 'Kapellenruine',
    bgColor: 0x181028,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            // Safe pedestals over the spike pit
            { r: 10, c: 5,  w: 2, v: 1 },
            { r: 10, c: 12, w: 2, v: 1 },
            { r: 10, c: 19, w: 2, v: 1 },
            { r: 10, c: 24, w: 2, v: 1 },
            // Upper crossing platforms (safer alt route)
            { r: 6,  c: 7,  w: 3, v: 2 },
            { r: 6,  c: 14, w: 3, v: 2 },
            { r: 6,  c: 20, w: 3, v: 2 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R03' },
        right: { room: 'R05' }
    },
    enemies: [
        { type: 'patrol', x: 400, y: 176, min: 224, max: 560 }
    ],
    spikes: [
        { x: 256, y: 344 }, { x: 288, y: 344 }, { x: 320, y: 344 },
        { x: 448, y: 344 }, { x: 480, y: 344 },
        { x: 608, y: 344 }, { x: 640, y: 344 }, { x: 672, y: 344 }
    ],
    movingPlatforms: [],
    savePoint: null,
    boss: null,
    storyBefore: [
        '[KIRI] "Pass auf die Bodenstacheln auf — nutz die Balken oben."'
    ]
};
