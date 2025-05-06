# Model Path Configuration Update

## Summary
Moved the hardcoded model path from the `createModel()` method to the constructor as a configuration option, making it easier to change the model path without modifying the core loading logic.

## Changes Made
1. Added `this.modelPath` property to the constructor with the default value of '/assets/models/monk.glb'
2. Updated all references to the hardcoded path in the `createModel()` method to use `this.modelPath` instead
3. Updated log messages to use the dynamic path from the configuration
4. Added a new `setModelPath(path)` method to allow changing the model path programmatically
5. Updated comments to be more generic and not reference a specific model name

## Benefits
- Improved configurability: The model path can now be changed without modifying the core code
- Better maintainability: All model-related configuration is now in one place
- Enhanced flexibility: The `setModelPath()` method allows changing models at runtime

## Usage Example
```javascript
// Create a player model with default configuration
const playerModel = new PlayerModel(scene);

// Change the model path if needed
playerModel.setModelPath('/assets/models/different_character.glb');

// Create the model with the new path
await playerModel.createModel();
```