class TileMap {
    /**
     * Build solid and platform StaticGroups from a 2D tile array.
     * 0 = air, 1 = solid, 2 = one-way platform
     */
    static build(scene, tileData) {
        var solid     = scene.physics.add.staticGroup();
        var platforms = scene.physics.add.staticGroup();

        for (var row = 0; row < tileData.length; row++) {
            for (var col = 0; col < tileData[row].length; col++) {
                var cell = tileData[row][col];
                if (cell === 0) continue;

                var cx = col * TILE_SIZE + TILE_SIZE / 2;
                var cy = row * TILE_SIZE + TILE_SIZE / 2;

                if (cell === 1) {
                    var s = solid.create(cx, cy, 'tile_solid');
                    s.refreshBody();
                } else if (cell === 2) {
                    // Platform: thinner, positioned at the top of the tile cell
                    var cy2 = row * TILE_SIZE + 6; // 6px from top of cell
                    var p = platforms.create(cx, cy2, 'tile_plat');
                    p.setSize(TILE_SIZE, 12);
                    p.refreshBody();
                }
            }
        }
        return { solid, platforms };
    }

    /** Width in pixels of a level data array. */
    static pixelWidth(tileData) {
        return (tileData[0] ? tileData[0].length : 0) * TILE_SIZE;
    }

    static pixelHeight(tileData) {
        return tileData.length * TILE_SIZE;
    }
}
