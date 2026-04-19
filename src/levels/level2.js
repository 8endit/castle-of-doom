// Level 2 — The Catacombs
// 60 cols × 16 rows — darker, pits, stalactites
// Zone layout:
//   x 0–480   Hazard intro    — pits and stalactites, no enemies (learn mechanics)
//   x 480–900  First enemies  — chasers, wider spacing
//   x 900–1300 Mid section   — ranged + chaser combos, more pits
//   x 1300–1600 Gauntlet     — denser, all three types
//   x 1600–1920 Boss arena   — Katakomben-Wächter + exit
var LEVEL_2 = {
    name: 'The Catacombs',
    bgColor: 0x0a0a18,
    tileData: [
      // row  0 — ceiling
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  2
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  3 — stalactites (upper hazard, visual warning before pits)
      [1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,1],
      // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  5 — upper platforms (alt route over pits)
      [1,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,0,2,2,2,2,0,0,0,0,0,1],
      // row  6
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  7 — mid platforms
      [1,0,0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,1],
      // row  8
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // rows 9-14 open
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row 15 — floor with pits (introduced after safe intro)
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    playerStart: { x: 64, y: 430 },
    enemies: [
        // First enemies — simple chasers after the hazard intro zone
        { type: 'chaser', x: 544,  y: 430 },
        { type: 'patrol', x: 736,  y: 430, min: 640,  max: 864  },
        // Mid section — first ranged enemy, wider spacing
        { type: 'ranged', x: 960,  y: 430 },
        { type: 'chaser', x: 1088, y: 430 },
        // Tighter combinations
        { type: 'patrol', x: 1248, y: 430, min: 1184, max: 1344 },
        { type: 'ranged', x: 1408, y: 430 },
        // Gauntlet — all three types, tightest section
        { type: 'chaser', x: 1504, y: 430 },
        { type: 'patrol', x: 1600, y: 430, min: 1536, max: 1664 },
        { type: 'ranged', x: 1696, y: 430 },
    ],
    boss: { x: 1824, y: 400 },
    exitX: 1888,
    spikes: [
        // Near pits — teach the player to watch two hazards at once
        { x: 544,  y: 472 }, { x: 576,  y: 472 },
        { x: 896,  y: 472 }, { x: 928,  y: 472 }, { x: 960, y: 472 },
        { x: 1216, y: 472 }, { x: 1248, y: 472 },
        { x: 1472, y: 472 }, { x: 1504, y: 472 }
    ],
    movingPlatforms: [
        { x: 400,  y: 352, range: 110, axis: 'x', speed: 80 },
        { x: 864,  y: 320, range: 65,  axis: 'y', speed: 55 },
        { x: 1344, y: 368, range: 95,  axis: 'x', speed: 90 }
    ],
    storyBefore: [
        '[KIRI] "Die Katakomben. Ich kenne diese Korruption — diese Kreaturen waren einst wie ich."',
        '[KIRI] "Die Burg hat ihre Seelen gestohlen. Wir befreien sie, indem wir sie besiegen."',
        'Vorsicht vor den Gruben — der Boden faellt weg.',
        '[KIRI] "Ich bin bei dir, Krieger."'
    ],
    storyAfter: [
        '[KIRI] "Ich kann die Flamme riechen. Sie ist nah."',
        '[KIRI] "Der Herr dieser Burg... er hat sie gestohlen. Fuer Unsterblichkeit."',
        '[KIRI] "Er muss fallen. Das Schicksal des Waldes liegt jetzt in deinen Haenden."'
    ],
    nextLevel: 'LEVEL_3',
    checkpoints: [
        { x: 480,  y: 430 },
        { x: 1152, y: 430 }
    ]
};
