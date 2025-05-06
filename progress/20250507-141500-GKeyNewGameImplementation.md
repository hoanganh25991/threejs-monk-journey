# G Key New Game Implementation

## Overview
Implemented the ability to start a new game by pressing the "G" key. This provides a quick way for players to restart the game without having to navigate through menus.

## Changes Made

1. Updated the `INPUT_CONFIG` in `InputHandler.js` to include the "G" key in the actions section:
   ```javascript
   { keys: ['KeyG'], description: 'Start New Game' }
   ```

2. Added a key handler for the "G" key in the `initKeyboardEvents` method of the `InputHandler` class:
   ```javascript
   case 'KeyG':
       // Start a new game
       console.log('G key pressed - starting new game');
       
       // Hide any existing game menu
       const existingGameMenu = document.getElementById('game-menu');
       if (existingGameMenu) {
           existingGameMenu.style.display = 'none';
       }
       
       // Hide any existing options menu
       const existingOptionsMenu = document.getElementById('main-options-menu');
       if (existingOptionsMenu) {
           existingOptionsMenu.style.display = 'none';
       }
       
       // Start the game
       this.game.start();
       
       // Make sure settings button is visible
       const settingsButton = document.getElementById('settings-button');
       if (settingsButton) {
           settingsButton.style.display = 'block';
       }
       
       console.log("Game started via G key - enemies and player are now active");
       break;
   ```

## Testing
The implementation was tested by:
1. Pressing "G" at the main menu to start a new game
2. Pressing "G" during gameplay to restart the game
3. Pressing "G" in the options menu to start a new game

All scenarios worked as expected, with the game starting/restarting properly and the UI elements updating accordingly.

## Future Improvements
Consider adding a confirmation dialog when pressing "G" during gameplay to prevent accidental game restarts.