# Model Height Offset Configuration

## Summary
Moved the height offset configuration from hardcoded if-else statements in the `PlayerModel.js` file to the model configuration in `player-models.js`. This makes the code more maintainable and allows for easier configuration of model-specific height offsets.

## Changes Made

1. Added `heightOffset` property to the `defaultAdjustments` object for each model in `player-models.js`:
   - Knight of Valor: 2.0
   - Skeleton King: 1.5
   - Ebon Knight: 2.5
   - All other models: 1.0 (default)

2. Updated the `setModel` method in `PlayerModel.js` to use the height offset from the model configuration instead of hardcoded if-else statements.

## Benefits

- More maintainable code with configuration centralized in one place
- Easier to add or modify height offsets for different models
- Consistent approach to model configuration
- Reduced code duplication

## Technical Details

The height offset is used to adjust the player's position relative to the terrain, ensuring that different models with varying sizes and proportions appear correctly positioned in the game world.