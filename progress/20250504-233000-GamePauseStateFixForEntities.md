# Game Pause State Fix for Entities

## Overview
This update fixes an issue where enemies were still moving and attacking the player even when the game was in a paused state after initialization. The problem was that while the game had a proper pause mechanism, several key game systems were not checking the game's pause state before updating their logic.

## Changes Made

1. **EnemyManager Update Method**:
   - Added a check for `game.isPaused` at the beginning of the update method
   - Skips all enemy updates (movement, attacks, spawning) when the game is paused
   - Prevents enemies from moving or attacking until the game is explicitly started

2. **Player Update Method**:
   - Added a check for `game.isPaused` at the beginning of the update method
   - Skips all player updates (movement, skills, animations) when the game is paused
   - Ensures the player remains stationary until the game starts

3. **InputHandler Update Method**:
   - Added a check for `game.isPaused` at the beginning of the update method
   - Prevents processing of continuous skill casting and other inputs when paused
   - Ensures player actions don't trigger while in the menu state

4. **CollisionManager Update Method**:
   - Added a check for `player.game.isPaused` at the beginning of the update method
   - Skips all collision detection when the game is paused
   - Prevents damage and knockback effects during the paused state

## Technical Details

The issue was that while the main game loop in `Game.js` had proper pause state handling:

```javascript
// In Game.js animate() method
if (this.isPaused) {
    // Just render the scene
    this.renderer.render(this.scene, this.camera);
    return;
}
```

The individual managers and entities were still being updated because they weren't checking the pause state themselves. This fix ensures that all game systems respect the pause state by adding explicit checks at the beginning of their update methods.

## Benefits

1. **Proper Initialization Flow**: The game now properly initializes resources without starting gameplay
2. **Improved User Experience**: Players can view the menu without enemies moving or attacking
3. **Consistent Behavior**: All game systems now respect the pause state
4. **Resource Efficiency**: Skipping updates for paused entities saves CPU resources

This implementation ensures that the game world is fully loaded but inactive until the player explicitly chooses to start playing by clicking "New Game" or "Load Game".