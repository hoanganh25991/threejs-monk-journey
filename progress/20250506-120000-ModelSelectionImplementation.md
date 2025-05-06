# Model Selection Implementation

## Overview
Implemented a feature to allow the model selected in the settings menu to be used as the hero character in the game. This ensures that when a player selects a character model in the settings, that model will be used when starting a new game.

## Changes Made

### 1. Global Model Selection Storage
- Added global variables to store the selected model ID and size multiplier
- These variables are accessible to the Game class when initializing the player

### 2. Model Selection Event Handling
- Updated the model selection event handlers to store the selected model ID and size multiplier globally
- Ensured that the model preview is updated to reflect the selected model

### 3. Player Initialization
- Modified the Game class to apply the selected model and size when initializing the player
- This ensures that the player character uses the model selected in the settings menu

## Files Modified
- `/js/main.js`: Added global variables and updated event handlers
- `/js/core/Game.js`: Modified player initialization to use the selected model

## Testing
- Verified that selecting a model in the settings menu updates the preview
- Confirmed that starting a new game uses the selected model as the player character
- Tested with different model sizes to ensure proper scaling