# Fix Settings Menu Display

## Issue
The keyboard controls section in the options menu was not being displayed properly. The code for displaying the controls was correctly implemented, but there were issues with how the options menu was being created and styled.

## Root Cause Analysis
1. Multiple UI elements (pause menu, death screen, options menu) were using the same ID (`game-menu`), causing conflicts.
2. The options menu was not being properly styled and structured to display the keyboard controls.
3. The controls container was not being properly populated with the keyboard controls from INPUT_CONFIG.

## Changes Made
1. Completely rewrote the `showOptionsMenu` method in `HUDManager.js` to:
   - Give the options menu a unique ID (`options-menu`)
   - Apply inline styles to ensure proper display
   - Create a more structured and visually appealing layout for the keyboard controls
   - Add debugging console logs to help troubleshoot any issues
   - Ensure proper cleanup of any existing options menu before creating a new one

2. Updated the `createPauseMenu` and `createDeathScreen` methods to use unique IDs:
   - Changed pause menu ID from `game-menu` to `pause-menu`
   - Changed death screen ID from `game-menu` to `death-screen`
   - Added a `className` of `game-menu` to both to maintain styling

3. Updated the CSS in `style.css` to apply styles to both IDs and the class:
   - Modified selectors to target both specific IDs and the general class
   - Added `overflow-y: auto` to ensure content is scrollable

## Files Modified
1. `/Users/anhle/work-station/diablo-immortal/js/core/HUDManager.js`
2. `/Users/anhle/work-station/diablo-immortal/css/style.css`

## Result
The keyboard controls section in the options menu should now be properly displayed, showing all the configured controls from the `INPUT_CONFIG` object in a clear, structured format.