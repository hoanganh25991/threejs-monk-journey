# Settings Button Visibility Fix

## Issue
The settings button was not appearing on screen during gameplay.

## Root Cause
The settings button is defined outside the main UI container (`ui-container`) in the HTML, but the HUDManager was only showing/hiding elements within that container. When the game state changed to 'running', the UI container was made visible, but the settings button remained hidden.

## Solution
Modified the `showAllUI` and `hideAllUI` methods in the HUDManager to explicitly handle the settings button visibility:

1. In `showAllUI`, added code to explicitly show the settings button
2. In `hideAllUI`, added logic to hide the settings button except when the settings menu is open

## Files Changed
- `/js/core/HUDManager.js`

## Implementation Details
- Added code to explicitly show the settings button in the `showAllUI` method
- Added conditional logic in the `hideAllUI` method to prevent hiding the settings button when the settings menu is open
- Simplified the `handleGameStateChange` method to use the updated `showAllUI` and `hideAllUI` methods without duplicating logic

## Testing
The settings button should now be visible during gameplay, allowing players to access the settings menu at any time.