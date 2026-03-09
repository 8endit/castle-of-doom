var CombatSystem = {
    /**
     * Check if any active enemy overlaps the player's attack hitbox.
     * Called every frame from GameScene.update() while player.isAttacking.
     */
    resolvePlayerAttack(player, enemies) {
        if (!player.isAttacking) return;

        var atkReach = 54;   // pixels in front of player
        var atkHalfH = 24;   // half-height of hitbox

        enemies.getChildren().forEach(function(enemy) {
            if (!enemy.active || enemy.state === 'dead') return;
            if (player.hitEnemiesThisSwing.has(enemy)) return;

            // Attack box center
            var atkX = player.flipX ? player.x - atkReach + 10 : player.x + atkReach - 10;
            var atkY = player.y;

            var dx = Math.abs(atkX - enemy.x);
            var dy = Math.abs(atkY - enemy.y);

            if (dx < atkReach * 0.8 && dy < atkHalfH + 16) {
                enemy.takeDamage(player.stats.damage);
                player.hitEnemiesThisSwing.add(enemy);
                try { player.scene.sound.play('sfx_hit'); } catch(e) {}
            }
        });
    },

    /**
     * Check if boss attack box overlaps player.
     * Boss melee is handled inside Boss.thinkAndMove, but projectiles need
     * separate overlap — registered in GameScene via physics.add.overlap.
     */
    resolveProjectileHit(projectile, player) {
        if (!player.active || player.invincible) return;
        player.takeDamage(projectile.damage || 10);
        projectile.destroy();
    },

    /**
     * Add overlap between all projectile groups and player.
     * Called once from GameScene.create().
     */
    registerProjectileOverlaps(scene, player, enemies) {
        enemies.getChildren().forEach(function(enemy) {
            if (enemy instanceof EnemyRanged || enemy instanceof Boss) {
                scene.physics.add.overlap(
                    enemy.projectiles,
                    player,
                    CombatSystem.resolveProjectileHit,
                    null,
                    scene
                );
            }
        });
    }
};
