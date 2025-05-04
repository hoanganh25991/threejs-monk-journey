# Background Image Implementation

## Overview
Added the background.jpg image to the game menu and options menu to enhance the visual appeal of the game interface.

## Changes Made
1. Added background image styling to the game menu:
   - Set the background image to use assets/images/background.jpg
   - Configured proper background sizing and positioning
   - Added a semi-transparent overlay to ensure text readability

2. Added the same background image styling to the options menu for consistency:
   - Applied identical background image and styling properties
   - Maintained the same semi-transparent overlay for text readability

## Technical Implementation
- Used CSS background properties to display the image
- Added inline styles directly to the menu elements
- Set background-size to 'cover' to ensure the image fills the entire menu area
- Used rgba background color with opacity to create a semi-transparent overlay

## Benefits
- Enhanced visual appeal of the game interface
- Improved user experience with a more polished look
- Maintained consistent styling across different menu screens
- Ensured text readability with the semi-transparent overlay

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/main.js`
  - Modified `showGameMenu()` function to add background image
  - Modified `showOptionsMenu()` function to add the same background image