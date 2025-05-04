# FPS Canvas Width Fix

## Summary
Fixed an issue where the FPS canvas inside the Stats.js panel was not using the full width of its container. This improves the visual appearance of the performance monitoring display.

## Changes Made
1. Updated the `modifyStatsDisplay` method in `PerformanceManager.js` to:
   - Apply full width styling to the canvas element in the FPS panel
   - Add a setTimeout to ensure the styling is applied after initialization
   - Set the canvas display to 'block' to ensure proper rendering

2. Enhanced the `applyStandardIndicatorStyle` method to:
   - Add 'box-sizing: border-box' to ensure padding is included in width calculations
   - Add automatic styling for any canvas elements found within indicators
   - Set consistent height and display properties for all canvases

## Technical Details
- The Stats.js library from three.js creates canvas elements for displaying performance metrics
- The canvas elements needed explicit styling to use the full width of their containers
- Added both immediate styling and update-time styling to ensure the changes persist during runtime

## Benefits
- Improved visual appearance of the FPS display
- More consistent UI across all performance indicators
- Better utilization of the available space in the performance panel