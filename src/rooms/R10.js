// R10 — Throne of Doom
// Boss arena. No right exit. Left door locks during the fight.
window.R10 = {
    id: 'R10',
    title: 'Thron des Verderbens',
    bgColor: 0x28101a,
    tileData: makeRoomTiles({
        leftDoor: true,
        rightDoor: false,
        patches: [
            // Symmetric pillars for dodging
            { r: 10, c: 6,  w: 2, v: 1 },
            { r: 10, c: 22, w: 2, v: 1 },
            { r: 8,  c: 3,  w: 3, v: 2 },
            { r: 8,  c: 24, w: 3, v: 2 },
            { r: 5,  c: 13, w: 4, v: 2 }
        ]
    }),
    playerStart: { x: 64, y: 336 },
    exits: {
        left: { room: 'R09' }
    },
    enemies: [],
    spikes: [],
    movingPlatforms: [],
    savePoint: null,
    boss: { x: 720, y: 304 },
    lockLeftDoorDuringBoss: true,
    storyBefore: [
        '[KIRI] "Da ist er — der Herr des Verderbens."',
        '[KIRI] "Die Flamme brennt in seiner Brust. Reiss sie heraus!"'
    ],
    storyAfter: [
        '[KIRI] "Er ist gefallen! Die Flamme ist frei!"',
        '[KIRI] "Der Wald wird wieder leben. Danke, Krieger."'
    ]
};
