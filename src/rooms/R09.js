// R09 — Inner Sanctum
// Save point before boss. Last breath of calm.
window.R09 = {
    id: 'R09',
    title: 'Inneres Heiligtum',
    bgColor: 0x140a22,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: true,
        patches: [
            { r: 8,  c: 8,  w: 4, v: 2 },
            { r: 8,  c: 18, w: 4, v: 2 },
            { r: 5,  c: 13, w: 4, v: 2 },
            // Altar base
            { r: 10, c: 14, w: 2, v: 1 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left:  { room: 'R08' },
        right: { room: 'R10' }
    },
    enemies: [
        { type: 'ranged', x: 800, y: 128 }
    ],
    spikes: [],
    movingPlatforms: [],
    savePoint: { x: 480, y: 304 },
    boss: null,
    storyBefore: [
        '[KIRI] "Ich spuere die Flamme dahinter. Er ist da."',
        '[KIRI] "Ruh dich am Altar aus. Das wird schwer."'
    ]
};
