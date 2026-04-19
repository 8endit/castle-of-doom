// R08 — Catacombs East
// Tight corridor, chaser, vertical moving platform.
window.R08 = {
    id: 'R08',
    title: 'Katakomben Ost',
    bgColor: 0x0b0820,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            // Ceiling-hanging wall forces ducking (stand on floor, jump past)
            { r: 3,  c: 10, w: 3, h: 3, v: 1 },
            { r: 3,  c: 18, w: 3, h: 3, v: 1 },
            // Floor pit near right side
            { r: 11, c: 22, w: 3, v: 0 },
            { r: 8,  c: 22, w: 3, v: 2 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R07' },
        right: { room: 'R09' }
    },
    enemies: [
        { type: 'chaser', x: 480, y: 336 },
        { type: 'patrol', x: 260, y: 336, min: 130, max: 300 }
    ],
    spikes: [
        { x: 736, y: 344 }, { x: 768, y: 344 }
    ],
    movingPlatforms: [
        { x: 768, y: 256, range: 64, axis: 'y', speed: 55 }
    ],
    savePoint: null,
    boss: null,
    storyBefore: []
};
