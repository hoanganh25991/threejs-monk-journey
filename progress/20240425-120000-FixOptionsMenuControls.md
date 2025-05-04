# Fix Options Menu Keyboard Controls Display

## Issue
The keyboard controls section in the options menu was not being displayed properly. The code for displaying the controls was correctly implemented, but there was an issue with how the options menu was being created and styled.

## Root Cause Analysis
1. The options menu was being created with the same ID (`game-menu`) as the pause menu, which was causing conflicts.
2. When the options menu was displayed, it was replacing the pause menu in the DOM, but the keyboard controls were not being displayed.

## Changes Made
1. Modified the `showOptionsMenu` method in `UIManager.js` to give the options menu a unique ID (`options-menu`) and added a class (`game-menu`) for styling.
2. Updated the CSS in `style.css` to apply the same styles to both the pause menu and options menu by using both the ID and class selectors.
3. Added `overflow-y: auto` to the menu styles to ensure that all content is visible and scrollable if it exceeds the screen height.

## Files Modified
1. `/Users/anhle/work-station/diablo-immortal/js/ui/UIManager.js`
2. `/Users/anhle/work-station/diablo-immortal/css/style.css`

## Result
The keyboard controls section in the options menu should now be properly displayed, showing all the configured controls from the `INPUT_CONFIG` object.