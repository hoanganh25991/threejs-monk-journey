# UI Hiding and Header Reduction

## Changes Made
1. Added functionality to hide all UI elements when the Settings menu is opened
2. Reduced the size of the settings-header to make it less prominent
3. Added methods to show UI elements when returning to the game

## Technical Implementation
- Added `hideAllUI()` and `showAllUI()` methods to the HUDManager class
- Updated the SettingsMenu.js to call these methods when showing/hiding the menu
- Reduced the padding and font size of the settings-header
- Ensured proper UI state management when transitioning between game and settings

## Benefits
- Cleaner interface when accessing the Settings menu
- More focus on the settings content without UI distractions
- Better visual hierarchy with a smaller header
- Improved user experience with automatic UI management
- Seamless transitions between game and settings screens