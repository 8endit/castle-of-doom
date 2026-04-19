var GAME_WIDTH  = 850;
var GAME_HEIGHT = 390;
var TILE_SIZE   = 32;

// Global game state (lives + progress snapshot; ProgressSystem manages
// rooms / savepoints / player snapshot on `progress`).
window.GameState = {
    lives: 3,
    kills: 0,
    deaths: 0,
    startTime: 0,
    progress: null
};
if (window.ProgressSystem) ProgressSystem.reset();

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
