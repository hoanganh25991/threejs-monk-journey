# Fix: Upside-Down Chinese Warrior Monk Model

## Issue
After updating the model from `warrior_monk.glb` to `monk.glb`, the model appeared upside-down in the game.

## Root Cause
The original code was applying a 180-degree rotation around the X-axis to fix an upside-down orientation in the previous model. However, the new Chinese Warrior Monk model has a different default orientation, so this rotation was causing it to appear upside-down.

## Solution
Commented out the rotation code that was flipping the model:

```javascript
// No rotation needed for monk.glb model
// this.gltfModel.rotation.x = Math.PI; // Commented out as it was causing upside-down orientation
```

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/entities/player/PlayerModel.js`

## Next Steps
- Test the game to ensure the model appears with the correct orientation
- Verify that animations work properly with the new model orientation