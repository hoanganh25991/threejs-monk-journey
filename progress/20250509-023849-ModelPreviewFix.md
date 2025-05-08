# Model Preview Fix for monk-v3 Model

## Issue
The monk-v3 model was not showing up correctly in the ModelPreview component. The model was being loaded successfully (as indicated by the console logs), but it wasn't visible in the preview.

## Root Cause
The issue was in the `centerModel()` method of the ModelPreview.js file. This method was overriding the custom position settings for the monk-v3 model. Specifically, the monk-v3 model requires a specific Y-position offset of -2.05 to be properly visible, but the centerModel method was calculating a different position based on the model's bounding box.

## Solution
1. Modified the `loadModel()` method to store the model path in the model's userData for reference:
```javascript
// Store the model path in userData for reference
this.model.userData.modelPath = modelPath;
```

2. Updated the `centerModel()` method to check if the model is the monk-v3 model and apply the specific height offset:
```javascript
// Check if this is the monk-v3 model and apply the specific height offset
const modelPath = this.model.userData.modelPath;
if (modelPath && modelPath.includes('monk-v3.glb')) {
    // Use the specific height offset for monk-v3 model
    this.model.position.y = -2.05;
    console.log('ModelPreview: Applied specific height offset for monk-v3 model:', this.model.position.y);
} else {
    // Default positioning for other models
    this.model.position.y = -box.min.y;
}
```

## Testing
The changes should now allow the monk-v3 model to be properly positioned and visible in the model preview. The model will be positioned at Y: -2.05, which matches the height offset specified in the player-models.js configuration file.

## Additional Notes
- This fix specifically targets the monk-v3 model but maintains the default positioning logic for all other models.
- The solution respects the model's configuration in player-models.js where the defaultAdjustments for monk-v3 specify a position of { x: 0, y: -2.05, z: 0 }.
- Added console logging to help with debugging if issues persist.