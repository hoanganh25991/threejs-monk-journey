# HomeButton and GameMenu Integration

## Changes Made

1. Updated HomeButton.js to open GameMenu instead of SettingsMenu:
   - Changed import from SettingsMenu to GameMenu
   - Renamed variable from settingsMenu to gameMenu
   - Updated click event handler to create and show GameMenu
   - Updated dispose method to clean up gameMenu instead of settingsMenu

2. Updated SettingsMenu.js to return to GameMenu when Back button is clicked:
   - Added import for GameMenu
   - Modified setupBackButton method to create and show a new GameMenu instance
   - Removed conditional logic that was previously used to either resume the game or return to main menu

## Benefits

- Improved user experience with consistent navigation flow
- Home button now properly opens the main game menu
- Back button in Settings Menu now returns to the Game Menu instead of directly to the game
- Maintains proper game state management during menu navigation

## Technical Details

- HomeButton.js now imports and instantiates GameMenu.js
- SettingsMenu.js now imports and instantiates GameMenu.js when Back button is clicked
- Both components properly handle UI visibility and game state