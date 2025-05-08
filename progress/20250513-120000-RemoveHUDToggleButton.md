# Remove HUD Toggle Button

## Changes Made

1. Removed the HUD toggle button from the HTML in index.html
2. Removed the import of HUDToggleButton in HUDManager.js
3. Removed the initialization of HUDToggleButton in HUDManager.js
4. Removed references to the HUD toggle button in hideAllUI and showAllUI methods
5. Kept the keyboard shortcut (F key) functionality for toggling HUD visibility

## Rationale

The HUD toggle button was removed as requested, while maintaining the ability to toggle the HUD visibility using the F key. This simplifies the UI while preserving the functionality through keyboard shortcuts.

## Files Modified

- index.html
- js/core/HUDManager.js