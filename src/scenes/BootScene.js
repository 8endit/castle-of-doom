class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }

    create() {
        this._drawPlayer();
        this._drawPlayerAtk();
        this._drawKiri();
        this._drawKiriPortrait();
        this._drawAttackBox();
        this._drawTiles();
        this._drawSpike();
        this._drawMovingPlat();
        this._drawEnemies();
        this._drawProjectiles();
        this._drawBoss();
        this._drawLoot();
        this._drawPortal();
        this.scene.start('MenuScene');
    }

    // ── Player (20×32) ──────────────────────────────────────────────────────
    _drawPlayer() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Cape (behind body)
        g.fillStyle(0x1a2a7e, 1);
        g.fillRect(0, 9, 9, 23);
        // Legs
        g.fillStyle(0x223366, 1);
        g.fillRect(4, 21, 5, 11);
        g.fillRect(11, 21, 5, 11);
        // Boots
        g.fillStyle(0x3d2b1a, 1);
        g.fillRect(3, 27, 6, 5);
        g.fillRect(10, 27, 6, 5);
        g.fillStyle(0x5a4030, 1);
        g.fillRect(3, 27, 6, 1);
        g.fillRect(10, 27, 6, 1);
        // Body armor
        g.fillStyle(0x2244aa, 1);
        g.fillRect(4, 11, 12, 11);
        // Chest plate
        g.fillStyle(0x3366cc, 1);
        g.fillRect(5, 12, 10, 5);
        // Shoulder pads
        g.fillStyle(0x4477dd, 1);
        g.fillRect(3, 11, 3, 4);
        g.fillRect(14, 11, 3, 4);
        // Belt
        g.fillStyle(0x5a3a1a, 1);
        g.fillRect(4, 21, 12, 2);
        g.fillStyle(0xddaa00, 1);
        g.fillRect(9, 21, 2, 2);
        // Neck
        g.fillStyle(0x223388, 1);
        g.fillRect(7, 9, 6, 3);
        // Head (skin)
        g.fillStyle(0xc8956e, 1);
        g.fillRect(6, 3, 8, 7);
        // Hair
        g.fillStyle(0x2a1a08, 1);
        g.fillRect(6, 3, 8, 3);
        g.fillRect(6, 4, 2, 4);
        // Eyes
        g.fillStyle(0xffffff, 1);
        g.fillRect(8, 7, 2, 2);
        g.fillRect(11, 7, 2, 2);
        g.fillStyle(0x0033cc, 1);
        g.fillRect(9, 7, 1, 2);
        g.fillRect(12, 7, 1, 2);
        // Helmet band
        g.fillStyle(0x4466bb, 1);
        g.fillRect(6, 3, 8, 2);
        // Sword
        g.fillStyle(0x888899, 1);
        g.fillRect(16, 12, 2, 12);
        g.fillStyle(0xccccdd, 1);
        g.fillRect(16, 13, 2, 8);
        g.fillStyle(0xaa7700, 1);
        g.fillRect(14, 14, 5, 2);
        g.fillStyle(0x6b4a1a, 1);
        g.fillRect(16, 16, 2, 4);
        g.generateTexture('player', 20, 32);
        g.destroy();
    }

    _drawPlayerAtk() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Cape
        g.fillStyle(0x1a2a7e, 1);
        g.fillRect(0, 9, 9, 23);
        // Legs
        g.fillStyle(0x223366, 1);
        g.fillRect(4, 21, 5, 11);
        g.fillRect(11, 21, 5, 11);
        // Boots
        g.fillStyle(0x3d2b1a, 1);
        g.fillRect(3, 27, 6, 5);
        g.fillRect(10, 27, 6, 5);
        // Body (brighter during attack)
        g.fillStyle(0x3355cc, 1);
        g.fillRect(4, 11, 12, 11);
        g.fillStyle(0x4477ee, 1);
        g.fillRect(5, 12, 10, 5);
        g.fillStyle(0x5588ff, 1);
        g.fillRect(3, 11, 3, 4);
        g.fillRect(14, 11, 3, 4);
        // Belt
        g.fillStyle(0x5a3a1a, 1);
        g.fillRect(4, 21, 12, 2);
        g.fillStyle(0xffcc00, 1);
        g.fillRect(9, 21, 2, 2);
        // Neck
        g.fillStyle(0x223388, 1);
        g.fillRect(7, 9, 6, 3);
        // Head
        g.fillStyle(0xc8956e, 1);
        g.fillRect(6, 3, 8, 7);
        g.fillStyle(0x2a1a08, 1);
        g.fillRect(6, 3, 8, 3);
        g.fillRect(6, 4, 2, 4);
        // Eyes (fire glow)
        g.fillStyle(0xffffff, 1);
        g.fillRect(8, 7, 2, 2);
        g.fillRect(11, 7, 2, 2);
        g.fillStyle(0xff6600, 1);
        g.fillRect(9, 7, 1, 2);
        g.fillRect(12, 7, 1, 2);
        g.fillStyle(0x4466bb, 1);
        g.fillRect(6, 3, 8, 2);
        // Sword extended forward
        g.fillStyle(0xaaaacc, 1);
        g.fillRect(16, 9, 3, 14);
        g.fillStyle(0xddddff, 1);
        g.fillRect(17, 10, 1, 10);
        g.fillStyle(0xffaa00, 1);
        g.fillRect(14, 13, 6, 2);
        g.fillStyle(0x8b5a00, 1);
        g.fillRect(16, 15, 2, 4);
        // Glow
        g.fillStyle(0xff6600, 0.5);
        g.fillRect(15, 8, 5, 1);
        g.fillRect(19, 9, 1, 13);
        g.generateTexture('player_atk', 20, 32);
        g.destroy();
    }

    // ── Kiri the Red Panda (18×18) ───────────────────────────────────────────
    _drawKiri() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Magical aura
        g.fillStyle(0xff8800, 0.12);
        g.fillCircle(9, 10, 9);
        // Body (orange-red)
        g.fillStyle(0xd4521a, 1);
        g.fillCircle(9, 12, 6);
        // Belly (lighter)
        g.fillStyle(0xee8855, 1);
        g.fillCircle(9, 13, 3);
        // Head
        g.fillStyle(0xd4521a, 1);
        g.fillCircle(9, 6, 5);
        // Ears
        g.fillStyle(0xd4521a, 1);
        g.fillTriangle(4, 3, 7, 1, 8, 4);
        g.fillTriangle(14, 3, 11, 1, 10, 4);
        g.fillStyle(0xee9977, 0.8);
        g.fillTriangle(5, 3, 7, 2, 7, 4);
        g.fillTriangle(13, 3, 11, 2, 11, 4);
        // Face mask (dark)
        g.fillStyle(0x220d00, 1);
        g.fillEllipse(9, 6, 8, 4);
        // Eyes (bright green)
        g.fillStyle(0xffffff, 1);
        g.fillCircle(7, 5, 2);
        g.fillCircle(11, 5, 2);
        g.fillStyle(0x226600, 1);
        g.fillCircle(7, 5, 1);
        g.fillCircle(11, 5, 1);
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(7, 4, 1, 1);
        g.fillRect(11, 4, 1, 1);
        // Nose
        g.fillStyle(0x110800, 1);
        g.fillEllipse(9, 8, 3, 2);
        // White cheeks
        g.fillStyle(0xffeecc, 0.6);
        g.fillCircle(6, 7, 1);
        g.fillCircle(12, 7, 1);
        // Tail stripe (behind)
        g.fillStyle(0xd4521a, 1);
        g.fillRect(2, 12, 3, 5);
        g.fillStyle(0x220d00, 0.6);
        g.fillRect(2, 13, 3, 1);
        g.fillRect(2, 15, 3, 1);
        g.generateTexture('kiri', 18, 18);
        g.destroy();
    }

    // ── Kiri Portrait (64×64) for story scenes ────────────────────────────────
    _drawKiriPortrait() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Background
        g.fillStyle(0x2a1000, 1);
        g.fillRect(0, 0, 64, 64);
        g.fillStyle(0x7a3a00, 0.3);
        g.fillCircle(32, 38, 28);
        // Body
        g.fillStyle(0xd4521a, 1);
        g.fillCircle(32, 44, 18);
        g.fillStyle(0xee8855, 1);
        g.fillCircle(32, 47, 11);
        // Head
        g.fillStyle(0xd4521a, 1);
        g.fillCircle(32, 24, 16);
        // Ears
        g.fillStyle(0xd4521a, 1);
        g.fillTriangle(17, 12, 22, 4, 27, 12);
        g.fillTriangle(47, 12, 42, 4, 37, 12);
        g.fillStyle(0xee9977, 1);
        g.fillTriangle(19, 12, 22, 6, 25, 12);
        g.fillTriangle(45, 12, 42, 6, 39, 12);
        // Face mask
        g.fillStyle(0x1a0a00, 1);
        g.fillEllipse(32, 23, 24, 12);
        // Eyes
        g.fillStyle(0xffffff, 1);
        g.fillCircle(26, 21, 5);
        g.fillCircle(38, 21, 5);
        g.fillStyle(0x226600, 1);
        g.fillCircle(26, 21, 3);
        g.fillCircle(38, 21, 3);
        g.fillStyle(0xffffff, 0.9);
        g.fillRect(25, 19, 2, 2);
        g.fillRect(37, 19, 2, 2);
        // Nose
        g.fillStyle(0x080400, 1);
        g.fillEllipse(32, 27, 8, 5);
        // Cheeks
        g.fillStyle(0xffeecc, 0.5);
        g.fillCircle(22, 27, 4);
        g.fillCircle(42, 27, 4);
        // Magic sparkles
        g.fillStyle(0xff8800, 0.9);
        g.fillRect(8, 8, 3, 3);
        g.fillRect(53, 10, 3, 3);
        g.fillRect(5, 32, 2, 2);
        g.fillRect(57, 28, 2, 2);
        g.fillStyle(0xffcc66, 0.7);
        g.fillRect(10, 6, 1, 3);
        g.fillRect(10, 8, 3, 1);
        g.fillRect(55, 8, 1, 3);
        g.fillRect(53, 10, 3, 1);
        g.generateTexture('kiri_portrait', 64, 64);
        g.destroy();
    }

    // ── Attack box (48×28) ───────────────────────────────────────────────────
    _drawAttackBox() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffee00, 0.08);
        g.fillRect(0, 0, 48, 28);
        g.lineStyle(1, 0xffee00, 0.5);
        g.strokeRect(0, 0, 48, 28);
        g.lineStyle(2, 0xffcc00, 0.7);
        g.lineBetween(4, 24, 44, 4);
        g.lineBetween(10, 26, 46, 8);
        g.generateTexture('attack_box', 48, 28);
        g.destroy();
    }

    // ── Tiles ────────────────────────────────────────────────────────────────
    _drawTiles() {
        // Stone tile 32×32
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x4a4a5a, 1);
        g.fillRect(0, 0, 32, 32);
        // Brick pattern
        g.fillStyle(0x3d3d4a, 1);
        g.fillRect(1, 1, 14, 9);
        g.fillRect(17, 1, 14, 9);
        g.fillRect(1, 12, 8, 9);
        g.fillRect(11, 12, 10, 9);
        g.fillRect(23, 12, 8, 9);
        g.fillRect(1, 23, 14, 8);
        g.fillRect(17, 23, 14, 8);
        // Mortar
        g.fillStyle(0x282830, 1);
        g.fillRect(0, 10, 32, 2);
        g.fillRect(0, 21, 32, 2);
        g.fillRect(15, 0, 2, 10);
        g.fillRect(9, 11, 2, 10);
        g.fillRect(21, 11, 2, 10);
        g.fillRect(15, 22, 2, 10);
        // Top highlight
        g.fillStyle(0x6a6a7a, 0.35);
        g.fillRect(0, 0, 32, 1);
        g.generateTexture('tile_solid', 32, 32);
        g.destroy();

        // Wooden platform 32×12
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x5a4a3a, 1);
        g.fillRect(0, 0, 32, 12);
        // Plank lines
        g.fillStyle(0x4a3a2a, 1);
        g.fillRect(0, 4, 32, 1);
        g.fillRect(0, 8, 32, 1);
        g.fillRect(10, 0, 1, 12);
        g.fillRect(21, 0, 1, 12);
        // Top highlight (edge)
        g.fillStyle(0x8a6a4a, 1);
        g.fillRect(0, 0, 32, 2);
        // Nails
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(4, 2, 2, 2);
        g.fillRect(4, 7, 2, 2);
        g.fillRect(15, 1, 2, 2);
        g.fillRect(15, 6, 2, 2);
        g.fillRect(26, 2, 2, 2);
        g.fillRect(26, 7, 2, 2);
        g.generateTexture('tile_plat', 32, 12);
        g.destroy();
    }

    // ── Enemies ──────────────────────────────────────────────────────────────
    _drawEnemies() {
        // Patrol — red armored knight 22×30
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Legs
        g.fillStyle(0x8a2020, 1);
        g.fillRect(2, 18, 8, 12);
        g.fillRect(12, 18, 8, 12);
        g.fillStyle(0x6a1010, 1);
        g.fillRect(2, 25, 8, 5);
        g.fillRect(12, 25, 8, 5);
        // Body
        g.fillStyle(0xaa2222, 1);
        g.fillRect(2, 8, 18, 11);
        g.fillStyle(0x882222, 1);
        g.fillRect(4, 9, 14, 7);
        // Shoulder spikes
        g.fillStyle(0xcc3333, 1);
        g.fillRect(0, 8, 4, 6);
        g.fillRect(18, 8, 4, 6);
        // Head skull
        g.fillStyle(0xddbbaa, 1);
        g.fillRect(5, 1, 12, 8);
        // Eye sockets
        g.fillStyle(0x220000, 1);
        g.fillRect(7, 3, 3, 3);
        g.fillRect(12, 3, 3, 3);
        // Red eyes
        g.fillStyle(0xff3300, 0.9);
        g.fillRect(8, 4, 1, 1);
        g.fillRect(13, 4, 1, 1);
        // Helmet rim
        g.fillStyle(0xaa2222, 1);
        g.fillRect(5, 1, 12, 2);
        g.generateTexture('enemy_patrol', 22, 30);
        g.destroy();

        // Chaser — dark assassin 22×30
        g = this.make.graphics({ x: 0, y: 0, add: false });
        // Flowing cloak
        g.fillStyle(0x1a1a2a, 1);
        g.fillRect(1, 10, 20, 20);
        g.fillRect(0, 14, 22, 14);
        g.fillStyle(0x0d0d1a, 1);
        g.fillRect(10, 10, 2, 20);
        // Legs
        g.fillStyle(0x111120, 1);
        g.fillRect(3, 24, 6, 6);
        g.fillRect(13, 24, 6, 6);
        // Hood
        g.fillStyle(0x1a1a2a, 1);
        g.fillRect(3, 2, 16, 10);
        g.fillRect(2, 3, 18, 8);
        // Shadow face
        g.fillStyle(0x0a0a14, 1);
        g.fillRect(5, 4, 12, 7);
        // Glowing eyes
        g.fillStyle(0xff8800, 1);
        g.fillRect(7, 6, 2, 2);
        g.fillRect(13, 6, 2, 2);
        g.fillStyle(0xff4400, 0.5);
        g.fillRect(6, 5, 4, 4);
        g.fillRect(12, 5, 4, 4);
        // Daggers
        g.fillStyle(0x888888, 1);
        g.fillRect(0, 12, 2, 8);
        g.fillRect(20, 12, 2, 8);
        g.generateTexture('enemy_chaser', 22, 30);
        g.destroy();

        // Ranged — purple mage 22×30
        g = this.make.graphics({ x: 0, y: 0, add: false });
        // Robe
        g.fillStyle(0x6a1a9a, 1);
        g.fillRect(3, 10, 16, 20);
        g.fillRect(2, 18, 18, 12);
        g.fillStyle(0xddaa00, 1);
        g.fillRect(3, 10, 16, 1);
        g.fillRect(3, 18, 16, 1);
        g.fillRect(10, 11, 2, 7);
        // Head
        g.fillStyle(0x4a0a7a, 1);
        g.fillRect(5, 2, 12, 9);
        // Tall hat
        g.fillStyle(0x5a1a8a, 1);
        g.fillRect(7, 0, 8, 4);
        g.fillStyle(0x4a0a7a, 1);
        g.fillRect(3, 3, 16, 2);
        // Face
        g.fillStyle(0xddccbb, 1);
        g.fillRect(6, 4, 10, 6);
        // Eyes
        g.fillStyle(0xffffff, 1);
        g.fillRect(7, 5, 3, 2);
        g.fillRect(12, 5, 3, 2);
        g.fillStyle(0xcc00ff, 1);
        g.fillRect(8, 5, 2, 2);
        g.fillRect(13, 5, 2, 2);
        // Staff
        g.fillStyle(0x8a5a2a, 1);
        g.fillRect(19, 0, 2, 30);
        g.fillStyle(0xcc00ff, 0.9);
        g.fillCircle(20, 2, 3);
        g.generateTexture('enemy_ranged', 22, 30);
        g.destroy();
    }

    // ── Projectiles ──────────────────────────────────────────────────────────
    _drawProjectiles() {
        // Enemy fireball 10×10
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xff4400, 1);
        g.fillCircle(5, 5, 4);
        g.fillStyle(0xffaa00, 0.9);
        g.fillCircle(5, 5, 2);
        g.fillStyle(0xffff00, 0.7);
        g.fillCircle(5, 5, 1);
        g.generateTexture('projectile', 10, 10);
        g.destroy();

        // Arrow 20×8
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x8a6a3a, 1);
        g.fillRect(0, 3, 15, 2);
        g.fillStyle(0xccccdd, 1);
        g.fillTriangle(13, 4, 20, 4, 13, 1);
        g.fillTriangle(13, 4, 20, 4, 13, 7);
        g.fillStyle(0xddddaa, 0.8);
        g.fillRect(0, 2, 4, 1);
        g.fillRect(0, 5, 4, 1);
        g.generateTexture('arrow', 20, 8);
        g.destroy();

        // Magic bolt 16×10
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x4400aa, 0.4);
        g.fillRect(0, 3, 8, 4);
        g.fillStyle(0x8800ff, 0.8);
        g.fillCircle(10, 5, 5);
        g.fillStyle(0xcc44ff, 1);
        g.fillCircle(10, 5, 3);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(10, 5, 1);
        g.generateTexture('magic_bolt', 16, 10);
        g.destroy();
    }

    // ── Boss (48×52) — Demon Lord ─────────────────────────────────────────────
    _drawBoss() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Heavy legs
        g.fillStyle(0x5a0000, 1);
        g.fillRect(6, 36, 14, 16);
        g.fillRect(28, 36, 14, 16);
        g.fillStyle(0x440000, 1);
        g.fillRect(6, 44, 14, 8);
        g.fillRect(28, 44, 14, 8);
        // Knee guards
        g.fillStyle(0xcc2222, 1);
        g.fillRect(7, 37, 12, 5);
        g.fillRect(29, 37, 12, 5);
        // Massive body
        g.fillStyle(0x8a0000, 1);
        g.fillRect(4, 16, 40, 22);
        // Chest plate
        g.fillStyle(0xaa0000, 1);
        g.fillRect(8, 18, 32, 16);
        // Chest cross detail
        g.fillStyle(0xcc1111, 1);
        g.fillRect(22, 18, 4, 16);
        g.fillRect(8, 24, 32, 4);
        // Shoulder guards
        g.fillStyle(0xcc2222, 1);
        g.fillRect(0, 14, 12, 12);
        g.fillRect(36, 14, 12, 12);
        g.fillStyle(0xee3333, 1);
        g.fillRect(0, 14, 12, 4);
        g.fillRect(36, 14, 12, 4);
        // Neck
        g.fillStyle(0x7a0000, 1);
        g.fillRect(16, 12, 16, 6);
        // Head with horned helmet
        g.fillStyle(0x660000, 1);
        g.fillRect(10, 4, 28, 14);
        // Helmet top
        g.fillStyle(0x880000, 1);
        g.fillRect(14, 2, 20, 4);
        // Horns (within bounds)
        g.fillStyle(0x3a1a00, 1);
        g.fillTriangle(10, 4, 4, 0, 16, 8);
        g.fillTriangle(38, 4, 44, 0, 32, 8);
        // Visor
        g.fillStyle(0x220000, 1);
        g.fillRect(14, 6, 20, 8);
        // Glowing eyes
        g.fillStyle(0xff4400, 1);
        g.fillRect(16, 8, 4, 4);
        g.fillRect(28, 8, 4, 4);
        g.fillStyle(0xff8800, 0.8);
        g.fillRect(17, 9, 2, 2);
        g.fillRect(29, 9, 2, 2);
        // Eye glow halo
        g.fillStyle(0xff2200, 0.15);
        g.fillCircle(18, 10, 7);
        g.fillCircle(30, 10, 7);
        // Belt
        g.fillStyle(0xddaa00, 1);
        g.fillRect(4, 36, 40, 3);
        g.fillStyle(0xffcc00, 1);
        g.fillRect(20, 35, 8, 5);
        g.generateTexture('boss', 48, 52);
        g.destroy();
    }

    // ── Loot ─────────────────────────────────────────────────────────────────
    _drawLoot() {
        // Weapon (sword) 20×20
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x111122, 0.7);
        g.fillRect(0, 0, 20, 20);
        g.fillStyle(0xccccdd, 1);
        g.fillRect(9, 1, 2, 14);
        g.fillStyle(0xeeeeff, 0.7);
        g.fillRect(9, 1, 1, 10);
        g.fillStyle(0xddaa00, 1);
        g.fillRect(5, 12, 10, 2);
        g.fillStyle(0xaa6600, 1);
        g.fillRect(9, 14, 2, 5);
        g.generateTexture('loot_weapon', 20, 20);
        g.destroy();

        // Helmet 20×20
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x111122, 0.7);
        g.fillRect(0, 0, 20, 20);
        g.fillStyle(0x88aacc, 1);
        g.fillEllipse(10, 9, 14, 12);
        g.fillStyle(0x6688aa, 1);
        g.fillRect(4, 13, 12, 4);
        g.fillStyle(0xaaccee, 0.5);
        g.fillRect(5, 5, 4, 6);
        g.generateTexture('loot_helmet', 20, 20);
        g.destroy();

        // Body armor 20×20
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x111122, 0.7);
        g.fillRect(0, 0, 20, 20);
        g.fillStyle(0x44aa66, 1);
        g.fillRect(5, 3, 10, 14);
        g.fillRect(2, 3, 5, 6);
        g.fillRect(13, 3, 5, 6);
        g.fillStyle(0x66cc88, 0.5);
        g.fillRect(6, 4, 8, 3);
        g.fillStyle(0x228844, 1);
        g.fillRect(5, 9, 10, 2);
        g.generateTexture('loot_body', 20, 20);
        g.destroy();

        // Ring 14×14
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x111122, 0.7);
        g.fillRect(0, 0, 14, 14);
        g.lineStyle(3, 0xdd88cc, 1);
        g.strokeCircle(7, 8, 4);
        g.fillStyle(0xff44cc, 1);
        g.fillCircle(7, 3, 2);
        g.fillStyle(0xffaaee, 0.8);
        g.fillRect(6, 2, 1, 1);
        g.generateTexture('loot_ring', 14, 14);
        g.destroy();

        // Potion 14×18
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x111122, 0.7);
        g.fillRect(0, 0, 14, 18);
        g.fillStyle(0x883333, 1);
        g.fillRect(5, 1, 4, 3);
        g.fillStyle(0xcc2222, 1);
        g.fillCircle(7, 12, 5);
        g.fillStyle(0xff4444, 0.8);
        g.fillRect(5, 8, 4, 3);
        g.fillStyle(0xff9999, 0.5);
        g.fillCircle(5, 10, 2);
        g.generateTexture('loot_potion', 14, 18);
        g.destroy();
    }

    // ── Exit Portal (32×48) ───────────────────────────────────────────────────
    // ── Spike (32×16) — three upward fangs ──────────────────────────────────
    _drawSpike() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        // Base plate
        g.fillStyle(0x441111, 1);
        g.fillRect(0, 10, 32, 6);
        // Three spike tips
        var tips = [4, 14, 24];
        tips.forEach(function (tx) {
            g.fillStyle(0xcc2222, 1);
            g.fillTriangle(tx, 0, tx + 4, 10, tx + 8, 10);
            g.fillStyle(0xff4444, 1);
            g.fillTriangle(tx + 2, 0, tx + 4, 6, tx + 6, 6);
            g.fillStyle(0xff8888, 1);
            g.fillRect(tx + 3, 0, 2, 3);
        });
        g.generateTexture('spike', 32, 16);
        g.destroy();
    }

    // ── Moving platform (80×12) — teal crystal slab ──────────────────────────
    _drawMovingPlat() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x004455, 1);
        g.fillRect(0, 2, 80, 10);
        g.fillStyle(0x0088aa, 1);
        g.fillRect(0, 2, 80, 3);
        g.fillStyle(0x00ccdd, 0.6);
        g.fillRect(2, 2, 76, 1);
        // Glyph marks
        g.fillStyle(0x00eeff, 0.5);
        for (var i = 8; i < 72; i += 16) {
            g.fillRect(i, 5, 8, 2);
        }
        g.generateTexture('moving_plat', 80, 12);
        g.destroy();
    }

    _drawPortal() {
        var g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x004444, 0.5);
        g.fillRect(0, 0, 32, 48);
        g.lineStyle(3, 0x00eeee, 1);
        g.strokeRect(2, 2, 28, 44);
        g.fillStyle(0x00cccc, 0.6);
        g.fillRect(4, 4, 24, 40);
        g.fillStyle(0x00ffff, 0.4);
        g.fillCircle(16, 24, 12);
        g.fillStyle(0x88ffff, 0.3);
        g.fillCircle(16, 24, 7);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(16, 24, 3);
        // Rune marks
        g.fillStyle(0x00eeee, 0.8);
        for (var ry = 8; ry <= 36; ry += 8) {
            g.fillRect(2, ry, 4, 2);
            g.fillRect(26, ry, 4, 2);
        }
        g.generateTexture('exit_portal', 32, 48);
        g.destroy();
    }
}
