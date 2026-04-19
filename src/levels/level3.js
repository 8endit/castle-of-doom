// Level 3 — The Inner Sanctum
// 40 cols × 16 rows — final boss arena
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
    boss: { x: 1120, y: 380 },
    exitX: 1220,
    storyBefore: [
        '[KIRI] "Hier ist es. Das Innere Heiligtum."',
        '[KIRI] "Ich kann die Flamme sehen — dort in der Mitte. Korrumpiert und gefangen."',
        '[KIRI] "Krieger... ich muss dir etwas sagen. Wenn der Herr des Verderbens besiegt wird..."',
        '[KIRI] "Der dunkle Zauber, der diese Burg aufrechterhaelt, wird zerbrechen. Und ich mit ihm."',
        '"Was meinst du damit?"',
        '[KIRI] "Ich bin an die Flamme gebunden. Wenn sie befreit wird... muss ich in den Wald zurueckkehren."',
        '[KIRI] "Bitte — zoeger nicht. Befreie die Flamme. Rette mein Zuhause."',
        '[ Das letzte Gefecht. ]'
    ],
    storyAfter: [
        'Der Herr des Verderbens faellt.',
        'Die dunkle Flamme zersplittert. Licht flutet das Heiligtum.',
        '[KIRI] "...Die Flamme ist frei. Ich kann spueren, wie sie den Wald heilt."',
        '[KIRI] "Danke, Krieger. Ich werde deinen Mut niemals vergessen."',
        '[KIRI] "Eines Tages, wenn der Rote Wald wieder bluehend ist... besuche mich."',
        'Als die Burg zerfaellt, springt ein kleiner orangefarbener Panda ins goldene Licht.',
        'Und verschwindet.',
        'ENDE — Die Flamme des Roten Waldes'
    ],
    nextLevel: null
};
