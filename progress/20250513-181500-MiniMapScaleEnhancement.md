# Mini Map Scale Enhancement

## Issue
The mini-map was only displaying content at the center around the hero, not spreading across the entire canvas. This made the mini-map less useful for navigation as it didn't show enough of the surrounding world.

## Analysis
The issue was with the scale factor used for the mini-map. The original scale factor (0.1) was too small, causing all objects to be drawn very close to the player in the center of the mini-map. This made it difficult to see the broader layout of the world.

## Changes Made

1. **Increased Default Scale Factor**
   - Changed the scale factor from 0.1 to 0.5 to spread objects across more of the mini-map canvas
   - Added a maxDrawDistance property to maintain consistent circular bounds

2. **Added Scale Adjustment Methods**
   - Implemented `increaseScale()` and `decreaseScale()` methods to allow zooming in and out
   - Added bounds checking to ensure scale stays within reasonable limits (0.1 to 2.0)
   - Enhanced the existing `setScale()` method with validation

3. **Updated HUDManager**
   - Added methods to expose scale adjustment functionality:
     - `increaseMiniMapScale()`
     - `decreaseMiniMapScale()`

4. **Added Keyboard Controls**
   - Added keyboard shortcuts for mini-map control:
     - `M` key: Toggle mini-map visibility
     - `[` key: Zoom in (decrease scale)
     - `]` key: Zoom out (increase scale)
   - Updated the INPUT_CONFIG documentation to reflect these new controls

## Implementation Details
- Scale adjustments use a 20% increment/decrement for smooth zooming
- The mini-map now shows a larger area of the world while maintaining the circular design
- Users can now customize their view based on preference (zoom in for detail or out for overview)

## Files Modified
1. `/js/core/hud-manager/MiniMapUI.js`
   - Increased default scale factor
   - Added scale adjustment methods

2. `/js/core/hud-manager/HUDManager.js`
   - Added methods to expose scale adjustment functionality

3. `/js/core/InputHandler.js`
   - Added keyboard shortcuts for mini-map control
   - Updated input configuration documentation

## Result
The mini-map now displays a larger portion of the world, making it more useful for navigation. Players can also adjust the zoom level to their preference, allowing them to see either more detail or a broader overview of the surrounding area.