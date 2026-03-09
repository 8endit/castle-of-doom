var GAME_WIDTH  = 800;
var GAME_HEIGHT = 512;
var TILE_SIZE   = 32;

var game = new Phaser.Game({
    type: Phaser.AUTO,
    width:  GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width:  GAME_WIDTH,
        height: GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 600 }, debug: false }
    },
    input: {
        activePointers: 4   // support multi-touch (left + right + jump + attack)
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        UIScene,
        MobileScene,
        StoryScene,
        GameOverScene,
        WinScene
    ]
});
