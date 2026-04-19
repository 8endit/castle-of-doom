// Level 1 — Castle Courtyard
// 60 cols × 16 rows, TILE_SIZE=32 → 1920 × 512 px
var LEVEL_1 = {
    name: 'Castle Courtyard',
    bgColor: 0x1a1028,
    tileData: [
      // row  0 — ceiling
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  2
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  3
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  5
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  6
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  7
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  8
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  9
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row 10 — upper platforms
      [1,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,1],
      // row 11
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row 12 — mid platforms
      [1,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,1],
      // row 13
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row 14
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row 15 — floor
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    playerStart: { x: 64, y: 430 },
    enemies: [
        { type: 'patrol', x: 400,  y: 430, min: 320,  max: 544  },
        { type: 'patrol', x: 576,  y: 430, min: 480,  max: 672  },
        { type: 'patrol', x: 736,  y: 430, min: 672,  max: 864  },
        { type: 'chaser', x: 896,  y: 430 },
        { type: 'ranged', x: 1024, y: 430 },
        { type: 'patrol', x: 1184, y: 430, min: 1120, max: 1312 },
        { type: 'chaser', x: 1344, y: 430 },
        { type: 'ranged', x: 1504, y: 430 },
        { type: 'patrol', x: 1632, y: 430, min: 1568, max: 1728 },
    ],
    boss: { x: 1760, y: 400 },
    exitX: 1872,
    storyBefore: [
        'Der Rote Wald liegt im Sterben.',
        'Seit Wochen saugt die Burg des Verderbens die Lebenskraft des Waldes.',
        '[KIRI] "Halt! Ich bin Kiri, Hueterin des Roten Waldes."',
        '[KIRI] "Diese Burg — die Burg des Verderbens — hat unsere heilige Flamme gestohlen."',
        '[KIRI] "Ohne die Flamme wird mein Wald in Tagen von Dunkelheit verschluckt."',
        '[KIRI] "Ich kann nicht alleine kaempfen... Wirst du mir helfen, Krieger?"',
        'Der Krieger nickt. Ein unerwartetes Buendnis ist geschmiedet.',
        '[KIRI] "Ich werde dir folgen. Wenn du in Not bist, kann ich dich einmal pro Level heilen. [H]"',
        'Jahr 1476. Das Schicksal des Waldes liegt in deinen Haenden.',
        '[ Druecke SPACE um zu beginnen ]'
    ],
    storyAfter: [
        '[KIRI] "Der erste Wachter ist gefallen. Ich spuere die Flamme... sie ist tiefer drinnen."',
        '[KIRI] "Unter den Hofmauern liegen die Katakomben. Die Dunkelheit ist dort staerker."',
        'Sei bereit, Krieger. Die wahre Gefahr wartet noch.'
    ],
    nextLevel: 'LEVEL_2',
    checkpoints: [
        { x: 672,  y: 430 },
        { x: 1312, y: 430 }
    ]
};
