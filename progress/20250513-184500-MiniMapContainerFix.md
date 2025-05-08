# Mini Map Container and Canvas Alignment Fix

## Issue
The mini-map was experiencing distortion where the circular container and the circular canvas did not align properly, causing visual inconsistencies.

## Analysis
The issue was caused by several factors:
1. The container had padding that pushed the canvas inward
2. The canvas and container dimensions were not being properly synchronized
3. The CSS was not ensuring that the canvas filled the container completely
4. There was no proper resize handling to maintain the circular shape

## Changes Made

1. **CSS Improvements**
   - Removed padding from the mini-map container
   - Added flexbox centering to ensure the canvas is perfectly centered
   - Set the canvas to fill 100% of the container width and height
   - Maintained the circular shape with border-radius for both elements

2. **JavaScript Enhancements**
   - Added a separate `canvasSize` property to track canvas dimensions
   - Updated the initialization to explicitly set both container and canvas dimensions
   - Added proper canvas style properties to ensure it fills the container
   - Implemented a `resize()` method to handle size changes properly
   - Enhanced `setScale()` to force a redraw after scale changes

3. **HUDManager Integration**
   - Added a `resizeMiniMap()` method to the HUDManager to expose the resize functionality

## Implementation Details
- The container now has zero padding and uses flexbox to center the canvas
- The canvas is set to 100% width and height of its container
- Both elements maintain their circular shape with border-radius: 50%
- The canvas dimensions are explicitly set both in HTML attributes and JavaScript properties
- When the scale changes, the minimap is redrawn to reflect the new scale

## Files Modified
1. `/css/core/hud-manager.css`
   - Updated the #mini-map and #mini-map-canvas styles
   - Removed padding and added flexbox centering
   - Set canvas to fill container completely

2. `/js/core/hud-manager/MiniMapUI.js`
   - Added canvasSize property
   - Enhanced initialization to properly set dimensions
   - Added resize method for handling size changes
   - Updated setScale to force redraw

3. `/js/core/hud-manager/HUDManager.js`
   - Added resizeMiniMap method to expose resize functionality

## Result
The mini-map now displays correctly with:
- Perfect alignment between the container and canvas
- No distortion of the circular shape
- Proper scaling and resizing capabilities
- Consistent appearance across different screen sizes

These changes ensure that the mini-map maintains its circular shape and proper proportions, providing a more polished and professional appearance.