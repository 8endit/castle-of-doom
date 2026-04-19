// Global virtual controls — read by Player.update(), written by DOM touch handlers (index.html).
// "JustPressed" flags are reset at the END of GameScene.update() (not here) so Player.update()
// always reads them in the same frame they were set.
window.VirtualControls = {
    left:              false,
    right:             false,
    jumpJustPressed:   false,
    attackJustPressed: false,
    potionJustPressed: false,
    kiriJustPressed:   false
};

class MobileScene extends Phaser.Scene {
    constructor() { super({ key: 'MobileScene' }); }
    create() {}
    update() {}
}
