class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    create() {
        this._genTexture('player',      20, 32, 0x4488ff, 0x2255cc);
        this._genTexture('player_atk',  20, 32, 0x66aaff, 0x2255cc);
        this._genTexture('attack_box',  48, 28, 0xffff00, 0xffaa00);
        this._genTexture('tile_solid',  32, 32, 0x8B6914, 0x5a4010);
        this._genTexture('tile_plat',   32, 12, 0xA0522D, 0x6b3518);
        this._genTexture('enemy_patrol',22, 30, 0xcc3333, 0x881111);
        this._genTexture('enemy_chaser',22, 30, 0xcc6600, 0x884400);
        this._genTexture('enemy_ranged',22, 30, 0x9933cc, 0x662299);
        this._genTexture('projectile',  10, 10, 0xff6600, 0xff3300);
        this._genTexture('boss',        48, 52, 0xdd1111, 0x770000);
        this._genTexture('loot_weapon', 20, 20, 0xffdd00, 0xcc9900);
        this._genTexture('loot_helmet', 20, 20, 0x88ccff, 0x4488cc);
        this._genTexture('loot_body',   20, 20, 0x44ff88, 0x22aa55);
        this._genTexture('loot_ring',   14, 14, 0xff88ff, 0xcc44cc);
        this._genTexture('exit_portal', 32, 48, 0x00ffff, 0x008888);
        this.scene.start('MenuScene');
    }

    _genTexture(key, w, h, fill, border) {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(border, 1);
        g.fillRect(0, 0, w, h);
        g.fillStyle(fill, 1);
        g.fillRect(2, 2, w - 4, h - 4);
        g.generateTexture(key, w, h);
        g.destroy();
    }
}
