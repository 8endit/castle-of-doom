// R07 — Catacombs West
// Ranged ambush from above, spikes between pedestals.
window.R07 = {
    id: 'R07',
    title: 'Katakomben West',
    bgColor: 0x0b0820,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            { r: 10, c: 7,  w: 2, v: 1 },
            { r: 10, c: 14, w: 2, v: 1 },
            { r: 10, c: 21, w: 2, v: 1 },
            { r: 5,  c: 10, w: 3, v: 2 },
            { r: 5,  c: 17, w: 3, v: 2 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R06' },
        right: { room: 'R08' }
    },
    enemies: [
        { type: 'ranged', x: 352, y: 128 },
        { type: 'ranged', x: 576, y: 128 },
        { type: 'patrol', x: 768, y: 336, min: 704, max: 896 }
    ],
    spikes: [
        { x: 320, y: 344 }, { x: 352, y: 344 },
        { x: 544, y: 344 }, { x: 576, y: 344 },
        { x: 736, y: 344 }
    ],
    movingPlatforms: [],
    savePoint: null,
    boss: null,
    storyBefore: []
};
