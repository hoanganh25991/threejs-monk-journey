# Model Selection Navigation Enhancement

## Overview
Added next and previous buttons to the model selection interface to allow for easier navigation between character models and animations.

## Changes Made
1. Added next/previous buttons to the character model selection dropdown
2. Added next/previous buttons to the animation selection dropdown
3. Added next/previous buttons to the size multiplier selection dropdown
4. Ensured proper enabling/disabling of animation buttons based on available animations
5. Maintained all existing functionality while adding the new navigation options

## Implementation Details
- Added button controls that trigger the same events as the dropdown selections
- Styled buttons to match the game's aesthetic with dark backgrounds and gold borders
- Implemented circular navigation (going from last to first item and vice versa)
- Ensured buttons are properly disabled when animations aren't available

## Benefits
- Provides a more intuitive way to cycle through available models
- Makes it easier to preview different animations without having to use the dropdown
- Allows for quick size adjustments with a single click
- Maintains the dropdown functionality for users who prefer direct selection

## Files Modified
- `/js/main.js` - Updated the model selection UI in the options menu