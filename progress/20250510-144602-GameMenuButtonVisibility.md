# Game Menu Button Visibility Improvements

## Issue
The game menu had inconsistent button visibility logic:
1. The "Save Game" button was showing even when the game hadn't started yet
2. The "Load Game" button was showing even when there was no saved data in local storage

## Changes Made

### Updated GameMenu.js

1. Modified the constructor to set initial button visibility:
   - Hide "Load Game" button if no save data exists
   - Hide "Save Game" button if game hasn't started yet

2. Enhanced the `show()` method to properly update button visibility:
   - Added explicit check for "New Game" button text to ensure "Save Game" is hidden when "New Game" is showing
   - Maintained existing logic for "Load Game" button visibility based on save data

3. Improved conditional logic:
   - Added more descriptive comments
   - Used compound conditions to make the visibility rules clearer
   - Ensured consistent behavior between initial setup and menu display

## Testing

The changes ensure that:
1. When the game first loads and "New Game" button is showing, the "Save Game" button is hidden
2. When there's no saved data in local storage, the "Load Game" button is hidden
3. When the game is paused (after starting) and "Resume Game" button is showing, the "Save Game" button is visible
4. When save data exists in local storage, the "Load Game" button is visible

These improvements provide a more intuitive user experience by only showing buttons that are relevant to the current game state.