# Model Preview Update

## Summary
Updated the ModelPreview.js file to support custom position and rotation configuration for 3D models.

## Changes Made

1. Added configuration support to the constructor:
   - Added a new `config` parameter to the constructor
   - Implemented default configuration with position and rotation properties

2. Enhanced the `loadModel` method:
   - Added support for passing a configuration when loading a model
   - Added call to apply the configuration after centering the model

3. Added new methods:
   - `applyModelConfiguration()`: Applies position and rotation from the configuration to the model
   - `updateModelConfiguration(config)`: Updates the configuration and applies it to the current model

## Usage Example

```javascript
// Create a model preview with custom configuration
const config = {
    preview: {
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: Math.PI / 4, z: 0 }
    }
};

const modelPreview = new ModelPreview(container, 300, 450, config);
modelPreview.loadModel('path/to/model.glb', 1.0);

// Update configuration later
modelPreview.updateModelConfiguration({
    preview: {
        position: { x: 0.5, y: 0, z: 0.5 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 }
    }
});
```

## Implementation Details

- The position values are applied additively after centering the model
- The rotation values are applied directly (not additively)
- The configuration can be updated at any time using the `updateModelConfiguration` method
- When updating the configuration, the model is first reset to its centered position before applying the new configuration