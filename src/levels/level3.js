// Level 3 — The Inner Sanctum
// 40 cols × 16 rows — final boss arena, no regular enemies
// The player walks through a silent, ominous approach before the boss fight.
var LEVEL_3 = {
    name: 'The Inner Sanctum',
    bgColor: 0x200010,
    tileData: [
      // row  0 — ceiling
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // row  1
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  2 — upper platforms
      [1,0,0,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,2,2,2,0,0,1],
      // row  3
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  4
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row  5 — mid platforms
      [1,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,1],
      // rows 6-14
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      // row 15 — floor
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    playerStart: { x: 96, y: 430 },
    enemies: [],
    boss: { x: 1088, y: 380 },
    exitX: 1220,
    spikes: [
        // Approach corridor — visible warnings, not cheap deaths
        { x: 352, y: 472 }, { x: 384, y: 472 },
        { x: 672, y: 472 }, { x: 704, y: 472 },
        { x: 896, y: 472 }
    ],
    movingPlatforms: [
        { x: 512, y: 336, range: 80, axis: 'x', speed: 85 }
    ],
    storyBefore: [
        '[KIRI] "Das Innere Heiligtum. Die Flamme — ich kann sie sehen."',
        '[KIRI] "Krieger... ich muss dir etwas sagen, bevor wir reingehen."',
        '[KIRI] "Wenn der Herr des Verderbens faellt, zerbricht der Zauber. Und ich bin an die Flamme gebunden."',
        '[KIRI] "Das bedeutet... ich muss zurueck in den Wald. Fuer immer."',
        '[KIRI] "Zoegere nicht. Bitte."'
    ],
    storyAfter: [
        'Der Herr des Verderbens faellt.',
        'Die dunkle Flamme zersplittert. Licht flutet das Heiligtum.',
        '[KIRI] "...Die Flamme ist frei. Ich kann spueren, wie sie den Wald heilt."',
        '[KIRI] "Danke, Krieger. Ich werde deinen Mut niemals vergessen."',
        '[KIRI] "Wenn der Rote Wald wieder bluehend ist... besuche mich."',
        'Als die Burg zerfaellt, springt ein kleiner orangefarbener Panda ins goldene Licht.',
        'Und verschwindet.',
        'ENDE — Die Flamme des Roten Waldes'
    ],
    nextLevel: null
};
