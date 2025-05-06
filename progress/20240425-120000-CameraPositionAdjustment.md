# Camera Position Adjustment

## Summary
Adjusted the camera position in the ModelPreview.js file to focus more on the 3D model and less on the ground. The camera has been moved to approximately 1/3 from the bottom of the view to provide better visibility of the character model.

## Changes Made
1. Lowered the camera's Y position from 2.0 to 1.0 to achieve the 1/3 from bottom perspective
2. Updated the camera's lookAt target to point at (0, 1.0, 0) instead of (0, 0, 0) to focus more on the model's body
3. Updated the resetCamera() method to maintain consistency with the new camera position and target

## Benefits
- Better focus on the character model
- Less emphasis on the ground plane
- Improved viewing angle for character details
- Consistent camera behavior when reset

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/ui/ModelPreview.js`