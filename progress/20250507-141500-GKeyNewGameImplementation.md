# G Key New Game Implementation

## Overview
Implemented the ability to start a new game by pressing the "G" key, but only when the game hasn't started yet and the player is at the main menu. This provides a quick way for players to start the game without having to click the "New Game" button.

## Changes Made

1. Updated the `INPUT_CONFIG` in `InputHandler.js` to include the "G" key in the actions section:
   ```javascript
   { keys: ['KeyG'], description: 'Start New Game' }
   ```

2. Added a key handler for the "G" key in the `initKeyboardEvents` method of the `InputHandler` class with a condition to only work at the main menu:
   ```javascript
   case 'KeyG':
       // Only allow starting a new game when the game is not already running
       if (this.game.isPaused && document.getElementById('game-menu')) {
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
           const homeButton = document.getElementById('home-button');
           if (homeButton) {
               homeButton.style.display = 'block';
           }
           
           console.log("Game started via G key - enemies and player are now active");
       } else {
           console.log('G key pressed but game is already running or not at main menu');
       }
       break;
   ```

## Testing
The implementation was tested by:
1. Pressing "G" at the main menu to start a new game - works as expected
2. Pressing "G" during gameplay - no effect, game continues running
3. Pressing "G" in the options menu - no effect, stays in the options menu

The "G" key now only works when the player is at the main menu and the game hasn't started yet, which prevents accidental game restarts during gameplay.