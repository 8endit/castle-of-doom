// Global virtual controls — read by Player.update(), written by DOM touch handlers (index.html).
// "JustPressed" flags are reset at the END of GameScene.update() (not here) so Player.update()
// always reads them in the same frame they were set.
window.VirtualControls = {
    left:              false,
    right:             false,
    jumpJustPressed:   false,
    attackJustPressed: false,
    potionJustPressed: false,
    kiriJustPressed:   false,
    pauseJustPressed:  false
};

class MobileScene extends Phaser.Scene {
    constructor() { super({ key: 'MobileScene' }); }
    create() {}
    update() {
        if (window.VirtualControls && window.VirtualControls.pauseJustPressed) {
            window.VirtualControls.pauseJustPressed = false;
            var gs = this.scene.get('GameScene');
            if (gs && gs.scene && gs.scene.isActive() && typeof gs.requestPause === 'function') {
                gs.requestPause();
            }
        }
    }
}
