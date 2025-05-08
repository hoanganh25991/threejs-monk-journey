# Main Background Visibility Control

## Overview
Modified the main background to only display when UI DOM elements are shown, and hide it when the game is running.

## Changes Made

1. Updated `MainBackground.js`:
   - Added tracking of visibility state with `isVisible` property
   - Enhanced `show()` and `hide()` methods to properly manage visibility
   - Added `getIsVisible()` method to check current visibility state

2. Updated `GameMenu.js`:
   - Modified to hide the background when starting a new game or loading a game
   - Added code to show the background when displaying the game menu

3. Updated `SettingsButton.js`:
   - Added code to show the background when the settings button is clicked
   - Enhanced the game state change listener to hide the background when the game is running

4. Updated `SettingsMenu.js`:
   - Modified to show the background when the settings menu is opened
   - Enhanced the hide method to hide the background when returning to the game

## Result
The main background now only appears when UI elements are displayed (main menu, settings menu) and is hidden during actual gameplay, providing a cleaner gaming experience.