// R06 — Dungeon Descent
// Dark room, two chasers, moving platform bridge.
window.R06 = {
    id: 'R06',
    title: 'Kerker-Abstieg',
    bgColor: 0x0e0a20,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            // Gap in the floor (to cross with moving platform)
            { r: 11, c: 12, w: 6, v: 0 },
            // Static platforms either side of the gap
            { r: 8,  c: 5,  w: 3, v: 2 },
            { r: 8,  c: 22, w: 3, v: 2 },
            // Ceiling drip
            { r: 4,  c: 14, w: 3, v: 1 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R05' },
        right: { room: 'R07' }
    },
    enemies: [
        { type: 'chaser', x: 240, y: 336 },
        { type: 'chaser', x: 720, y: 336 }
    ],
    spikes: [],
    movingPlatforms: [
        { x: 480, y: 336, range: 112, axis: 'x', speed: 70 }
    ],
    savePoint: null,
    boss: null,
    storyBefore: [
        '[KIRI] "Diese Finsternis... kenne ich. Pass auf die Luecke auf."'
    ]
};
