// Level 1 — Castle Courtyard
// 60 cols × 16 rows, TILE_SIZE=32 → 1920 × 512 px
// Zone layout:
//   x 0–640   Safe intro zone  — empty, platforms to practice
//   x 640–960  First encounter — 1 slow patrol
//   x 960–1280 Build-up        — 2 patrols + first spikes
//   x 1280–1550 Mid section    — 1 chaser + 1 ranged + moving platform
//   x 1550–1750 Pre-boss       — 2 mixed enemies
//   x 1750–1920 Boss arena     — Torwächter + exit
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
    playerStart: { x: 80, y: 430 },
    enemies: [
        // First encounter — one slow patrol, easy to read
        { type: 'patrol', x: 736,  y: 430, min: 640,  max: 864  },
        // Build-up — two patrols, slightly faster
        { type: 'patrol', x: 1024, y: 430, min: 960,  max: 1152 },
        { type: 'patrol', x: 1184, y: 430, min: 1120, max: 1280 },
        // Mid section — first chaser (more aggressive)
        { type: 'chaser', x: 1344, y: 430 },
        // First ranged enemy (teaches dodging)
        { type: 'ranged', x: 1472, y: 430 },
        // Pre-boss — challenge ramp
        { type: 'chaser', x: 1568, y: 430 },
        { type: 'patrol', x: 1664, y: 430, min: 1600, max: 1728 },
    ],
    boss: { x: 1792, y: 400 },
    exitX: 1872,
    spikes: [
        // Introduced mid-level, after first checkpoint
        { x: 1056, y: 472 }, { x: 1088, y: 472 },
        { x: 1312, y: 472 }, { x: 1344, y: 472 }, { x: 1376, y: 472 },
        { x: 1632, y: 472 }
    ],
    movingPlatforms: [
        { x: 800,  y: 336, range: 100, axis: 'x', speed: 65 },
        { x: 1440, y: 320, range: 75,  axis: 'y', speed: 50 }
    ],
    storyBefore: [
        'Der Rote Wald stirbt.',
        '[KIRI] "Halt! Ich bin Kiri — Hueterin des Roten Waldes."',
        '[KIRI] "Die Burg vor uns hat unsere heilige Flamme gestohlen. Ohne sie stirbt der Wald."',
        '[KIRI] "Ich kann nicht alleine kaempfen. Wirst du mir helfen, Krieger?"',
        'Der Krieger nickt.',
        '[KIRI] "Dann lass uns gehen. Wenn du verletzt bist, ruf mich — ich heile dich einmal pro Level. [H]"'
    ],
    storyAfter: [
        '[KIRI] "Der erste Waechter ist gefallen. Gut."',
        '[KIRI] "Die Flamme... ich kann sie tiefer spueren. Unter der Burg. In den Katakomben."',
        'Sei bereit. Was dort unten wartet, ist dunkler.'
    ],
    nextLevel: 'LEVEL_2',
    checkpoints: [
        { x: 608,  y: 430 },
        { x: 1296, y: 430 }
    ]
};
