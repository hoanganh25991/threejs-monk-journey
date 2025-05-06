# Player Model Refactoring

## Overview
This update separates the fallback player model into a dedicated file, improving code organization and maintainability. The fallback model is used when the main 3D model (GLB) fails to load.

## Changes Made

1. Created a new file `FallbackPlayerModel.js` that implements the `IPlayerModel` interface
2. Modified `PlayerModel.js` to:
   - Import and use the new `FallbackPlayerModel` class
   - Add properties to track when the fallback model is being used
   - Delegate appropriate method calls to the fallback model when it's active

## Benefits

- **Improved Separation of Concerns**: Each model implementation now has its own file
- **Better Maintainability**: Changes to either model can be made independently
- **Cleaner Code**: The main PlayerModel class is now more focused on handling the 3D GLB model
- **Easier Testing**: Each model implementation can be tested separately

## Files Modified

- `/js/entities/player/PlayerModel.js` - Updated to use the new FallbackPlayerModel
- Created `/js/entities/player/FallbackPlayerModel.js` - New file containing the fallback model implementation

## Implementation Details

The main PlayerModel class now has:
- A reference to a FallbackPlayerModel instance
- A flag to track when the fallback model is being used
- Logic to delegate method calls to the fallback model when appropriate

The FallbackPlayerModel implements all required methods from the IPlayerModel interface, providing a simple geometric representation of the player when the main 3D model cannot be loaded.