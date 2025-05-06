# Camera Zoom Adjustment

## Summary
Modified the ModelPreview.js file to zoom out the camera by 1.5x from its previous position, allowing for a better view of 3D models in the preview.

## Changes Made
1. Updated the default camera position in the `init()` method:
   - Changed z-position from 6.0 to 9.0 (1.5x increase)
   - Updated the comment to reflect the new zoom level (2.25x from original position)

2. Updated the `resetCamera()` method to match the new default position:
   - Changed z-position from 6.0 to 9.0

3. Updated the dynamic camera positioning in the `centerModel()` method:
   - Adjusted the maximum camera distance from 15 to 20
   - Updated the proportional distance calculation to use 9.0 as the base value

## Benefits
- Improved visibility of 3D models in the preview
- Better overall viewing experience with more context around the models
- Consistent camera behavior across all model preview functions