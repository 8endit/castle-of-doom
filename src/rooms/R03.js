// R03 — Great Hall
// Vertical platforming + melee + ranged.
window.R03 = {
    id: 'R03',
    title: 'Grosse Halle',
    bgColor: 0x1a1028,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            // Stepped platforms climbing up
            { r: 8,  c: 4,  w: 3, v: 2 },
            { r: 6,  c: 9,  w: 3, v: 2 },
            { r: 4,  c: 14, w: 4, v: 2 },
            { r: 6,  c: 20, w: 3, v: 2 },
            { r: 8,  c: 25, w: 3, v: 2 },
            // Small pillar in the middle floor
            { r: 10, c: 15, w: 1, v: 1 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R02' },
        right: { room: 'R04' }
    },
    enemies: [
        { type: 'patrol', x: 260, y: 336, min: 130, max: 440 },
        { type: 'chaser', x: 700, y: 336 },
        { type: 'ranged', x: 816, y: 336 }
    ],
    spikes: [],
    movingPlatforms: [],
    savePoint: null,
    boss: null,
    storyBefore: []
};
