# Game Paused State Implementation

## Issue
The game was automatically loading and starting when there was a saved game, instead of waiting for the user to click the "Load Game" button.

## Solution
Implemented a paused state in the game to ensure it doesn't start automatically when there's a saved game.

### Changes Made:

1. **Added Paused State to Game Class**
   - Added `isPaused` flag to the Game constructor
   - Modified the `start()` method to set `isPaused = false`
   - Updated the `animate()` method to respect the paused state
   - Added a new `togglePause()` method

2. **Updated SaveManager**
   - Modified the `init()` method to only load the chunk index, not the full game data
   - Game data is now only loaded when the user explicitly clicks the "Load Game" button

3. **Updated Main.js**
   - Changed the initialization flow to keep the game paused until user interaction
   - Added comments to clarify that the game remains paused until a button is clicked

## Result
The game now properly initializes in a paused state and only starts when the user explicitly clicks either the "New Game" or "Load Game" button.