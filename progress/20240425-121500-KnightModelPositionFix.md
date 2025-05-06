# Knight Model Position Fix

## Issue
The Knight of Valor character model was positioned with half of its body below the ground level, making it appear as if it was sinking into the terrain.

## Root Cause Analysis
The issue was caused by insufficient vertical offset in the model's preview position configuration. Each character model has a specific preview position that determines its initial placement in the 3D world. The Knight model needed a higher Y-position value to properly place it on the ground.

Additionally, the terrain height offset used by the movement system needed to be adjusted specifically for the Knight model due to its different proportions compared to other character models.

## Changes Made

1. Updated the Knight model's preview position in player-models.js:
   ```javascript
   preview: {
       position: { x: 0, y: 2.0, z: 0 }, // Raised y-position to place knight on ground
       rotation: { x: 0, y: 0, z: 0 }
   }
   ```

2. Added model-specific height offset adjustment in PlayerModel.js:
   ```javascript
   // Adjust player movement height offset based on model
   if (this.game && this.game.player && this.game.player.movement) {
       // For knight model, use a larger height offset to keep it above ground
       if (modelId === 'knight') {
           this.game.player.movement.heightOffset = 2.0;
           console.log(`Adjusted height offset for knight model to: 2.0`);
       } else {
           // Default height offset for other models
           this.game.player.movement.heightOffset = 1.0;
           console.log(`Reset height offset to default: 1.0`);
       }
   }
   ```

3. Added game reference to PlayerModel class to enable access to the player movement component:
   ```javascript
   setGame(game) {
       this.game = game;
   }
   ```

4. Updated Player.js to pass the game reference to the model component:
   ```javascript
   // Pass game reference to model
   if (this.model) {
       this.model.setGame(game);
   }
   ```

## Expected Outcome
The Knight of Valor character model should now be properly positioned on the ground level, with its feet touching the terrain rather than being partially submerged. The model should maintain this proper positioning during movement across the terrain.

## Testing
To test the fix:
1. Start the game
2. Select the Knight of Valor character model
3. Verify that the knight appears properly positioned on the ground
4. Move the character around to ensure it maintains proper positioning on different terrain heights