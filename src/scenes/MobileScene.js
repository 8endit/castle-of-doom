// Global virtual controls — read by Player.update(), written by DOM touch handlers (index.html)
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

    create() {
        // No Phaser buttons — controls are DOM elements in index.html.
        // This scene only exists to reset "just pressed" flags each frame
        // so Player.update() sees them for exactly one frame per tap.
    }

    update() {
        window.VirtualControls.jumpJustPressed   = false;
        window.VirtualControls.attackJustPressed = false;
        window.VirtualControls.potionJustPressed = false;
        window.VirtualControls.kiriJustPressed   = false;
    }
}
