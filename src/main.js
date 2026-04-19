var GAME_WIDTH  = 850;
var GAME_HEIGHT = 390;
var TILE_SIZE   = 32;

// Global game state (lives, checkpoint, current level)
window.GameState = {
    lives: 3,
    currentLevel: 'LEVEL_1',
    checkpoint: null,
    kills: 0,
    deaths: 0,
    startTime: 0
};

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
        InventoryScene,
        StoryScene,
        PauseScene,
        GameOverScene,
        WinScene
    ]
});
