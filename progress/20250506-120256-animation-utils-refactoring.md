# Animation Utils Refactoring

## Overview
Refactored the animation system to move complex animation logic from `PlayerModel.js` to the shared `AnimationUtils.js` utility. This improves code reusability and maintainability by centralizing animation-related functionality.

## Changes Made

1. Enhanced `AnimationUtils.js`:
   - Added a new `updateStateBasedAnimations` function that handles state-based animation updates
   - This function encapsulates the logic for determining which animation to play based on player state

2. Updated `PlayerModel.js`:
   - Imported the `AnimationUtils` module
   - Refactored the `updateAnimations` method to use the new utility function
   - Simplified the `playAnimation` method to delegate to the utility function

## Benefits

- **Improved Code Reusability**: Animation logic can now be shared across different model classes
- **Reduced Duplication**: Common animation handling code is now centralized
- **Better Maintainability**: Changes to animation logic only need to be made in one place
- **Consistent Behavior**: All models using these utilities will have consistent animation behavior

## Future Improvements

- Consider refactoring the `FallbackPlayerModel` and `Enemy` classes to also use these animation utilities
- Add more specialized animation handling functions for different entity types
- Implement animation blending for smoother transitions between animations