# Settings Menu Refactoring

## Overview
Refactored the settings menu to improve organization, usability, and visual appeal. The menu now features multiple tabs for different sections, a dedicated model preview tab, and better layout proportions.

## Changes Made

### HTML Structure
- Reorganized the settings menu into six tabs:
  - Performance
  - Game
  - Audio
  - Controls (new)
  - Model Preview (new dedicated tab)
  - Model Settings (renamed from Character Model)
- Added a dedicated fullscreen model preview layout with side-by-side design
- Added camera controls for the model preview
- Added keyboard and mobile controls information section

### CSS Styling
- Set the settings menu to consume 80% width and height of the page
- Added max-width and max-height constraints for better appearance on large screens
- Created new styles for the fullscreen model preview layout
- Added styles for controls information display
- Added styles for camera controls
- Improved styling for the mini model preview in the model settings tab

### JavaScript Functionality
- Refactored the SettingsMenu class to handle both model preview instances
- Added methods to sync model and animation selections between tabs
- Implemented camera controls for the fullscreen model preview
- Improved model preview resizing logic
- Added helper methods to reduce code duplication
- Enhanced cleanup in the dispose method

## Benefits
- Better organization of settings into logical groups
- Dedicated model preview tab provides more space for viewing models
- Improved user experience with synchronized model and animation selections
- More intuitive controls for model viewing and customization
- Cleaner code structure with better separation of concerns

## Future Improvements
- Add more game settings options
- Implement control remapping functionality
- Add more camera control options for model preview
- Consider adding model comparison feature