// R01 — Gate of Doom
// Safe entry room. Save point. Tutorial hint.
window.R01 = {
    id: 'R01',
    title: 'Tor des Verderbens',
    bgColor: 0x1a1028,
    tileData: makeRoomTiles({
        rightDoor: true,
        patches: [
            // stepping stones leading to the door
            { r: 8,  c: 18, w: 3, v: 2 },
            { r: 7,  c: 22, w: 3, v: 2 }
        ]
    }),
    playerStart: { x: 80, y: 336 },
    exits: {
        right: { room: 'R02' }
    },
    enemies: [],
    spikes: [],
    movingPlatforms: [],
    savePoint: { x: 160, y: 320 },
    boss: null,
    storyBefore: [
        'Der Rote Wald stirbt.',
        '[KIRI] "Halt! Ich bin Kiri — Hueterin des Roten Waldes."',
        '[KIRI] "Die Burg vor uns hat unsere heilige Flamme gestohlen."',
        '[KIRI] "Ich kann nicht alleine kaempfen. Hilfst du mir?"',
        'Der Krieger nickt.',
        '[KIRI] "Ruf mich mit [H] wenn du verletzt bist — einmal pro Raum."'
    ]
};
