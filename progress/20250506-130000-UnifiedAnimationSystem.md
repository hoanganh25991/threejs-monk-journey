# Unified Animation System

## Summary
Implemented a unified animation system that synchronizes animation playback between the model preview in the settings menu and the player model in the game. This allows users to preview and select animations in the settings menu, which will then be applied to the player model in the game.

## Bug Fixes
- Fixed reference error in main.js where animation dropdown elements were being accessed before initialization
- Improved error handling for cases where no animations are available

## Changes Made

### 1. Enhanced ModelPreview.js
- Added animation management similar to PlayerModel
- Implemented `playAnimation()` method with crossfade support
- Added methods to get animation names and current animation
- Modified `loadModel()` to store animations by name

### 2. Updated main.js Options Menu
- Added animation dropdown to character model settings
- Implemented animation selection that affects both preview and player model
- Added dynamic population of animation options when model changes
- Synchronized animation state between preview and game

### 3. Enhanced PlayerModel.js
- Added methods to expose animation information:
  - `getAnimationNames()`: Returns list of available animations
  - `getCurrentAnimation()`: Returns the currently playing animation

## Implementation Details

The implementation follows these key principles:
1. **Consistent Animation Interface**: Both ModelPreview and PlayerModel now use the same pattern for animation management
2. **Seamless Animation Transfer**: Animations selected in the preview are automatically applied to the player model
3. **Dynamic Animation Discovery**: The system automatically detects and lists available animations for each model
4. **Graceful Fallbacks**: If an animation isn't found, the system tries to find similar animations by name

## Usage
1. Open the settings menu
2. Select a character model
3. Use the Animation dropdown to select and preview different animations
4. The selected animation will be applied to the player model when returning to the game

## Technical Notes
- Animation crossfading is used for smooth transitions between animations
- The system handles models with different animation naming conventions
- Animation state is preserved when switching between models