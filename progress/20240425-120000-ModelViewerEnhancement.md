# Model Viewer Enhancement

## Summary
Enhanced the 3D model viewer in the Settings menu to provide a better viewing experience by adjusting the camera position and adding more control options.

## Changes Made

1. **Camera Position Adjustment**
   - Increased camera distance from z=4 to z=6 (1.5x zoom out)
   - Raised camera height from y=1.5 to y=2.0 for better viewing angle
   - Added detailed comments explaining the changes

2. **Orbit Controls Enhancement**
   - Increased minimum distance from 2 to 3 to prevent clipping into models
   - Increased maximum distance from 10 to 12 for better zooming capability
   - Added panning capability for better positioning
   - Added auto-rotation option with configurable speed

3. **Model Centering Improvements**
   - Added dynamic camera positioning based on model size
   - For larger models, camera will automatically move back proportionally
   - Maximum camera distance capped at z=15 to prevent extreme zoom-outs

4. **New Control Methods**
   - Added `toggleAutoRotation(enabled)` method to enable/disable auto-rotation
   - Added `setRotationSpeed(speed)` method to adjust rotation speed
   - Added `resetCamera()` method to return to default viewing position

5. **Animation Handling**
   - Modified animation loop to use OrbitControls for rotation instead of manual rotation
   - Commented out manual rotation code but kept it for reference

## Benefits
- Better visibility of the entire model
- More intuitive controls for users
- Automatic adjustment for models of different sizes
- More options for customizing the viewing experience