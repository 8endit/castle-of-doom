// R02 — Foyer
// First combat encounter — one patrol.
window.R02 = {
    id: 'R02',
    title: 'Eingangshalle',
    bgColor: 0x1a1028,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            { r: 8,  c: 6,  w: 4, v: 2 },
            { r: 6,  c: 12, w: 3, v: 2 },
            { r: 8,  c: 20, w: 4, v: 2 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R01' },
        right: { room: 'R03' }
    },
    enemies: [
        { type: 'patrol', x: 480, y: 336, min: 300, max: 640 }
    ],
    spikes: [],
    movingPlatforms: [],
    savePoint: null,
    boss: null,
    storyBefore: [
        '[KIRI] "Riechst du es auch? Verbrannte Flamme..."'
    ]
};
