# Fix Main Menu Settings Conflict

## Issue
There was a conflict between the main menu options screen and the in-game options menu. Both were creating elements with the same ID (`game-menu`), which was causing conflicts in the DOM and preventing the keyboard controls from being displayed properly in the in-game options menu.

## Root Cause Analysis
1. The game has two different options menus:
   - The main menu options (in main.js) which is shown before the game starts
   - The in-game options menu (in UIManager.js) which is shown when you pause the game

2. Both menus were creating elements with the same ID (`game-menu`), causing conflicts in the DOM.

## Changes Made
1. Modified the `showOptionsMenu` function in `main.js` to:
   - Change the ID from `game-menu` to `main-options-menu`
   - Add a `className` of `game-menu` to maintain styling

2. This change ensures that the main menu options and in-game options menu have unique IDs, preventing conflicts.

## Files Modified
1. `/Users/anhle/work-station/diablo-immortal/js/main.js`

## Result
The main menu options and in-game options menu now have unique IDs, preventing conflicts in the DOM. The keyboard controls should now be properly displayed in the in-game options menu.