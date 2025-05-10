# Force Reload Button Relocation

## Overview
Moved the "Force Reload" button from the Game Menu to a new "Release" tab in the Settings Menu, and renamed it to "Update to latest". This change improves the organization of the UI by placing update-related functionality in a dedicated section.

## Changes Made

### 1. Removed Force Reload Button from Game Menu
- Removed the button from the Game Menu in `index.html`
- Removed the button reference and event listener code from `GameMenu.js`

### 2. Added New Release Tab to Settings Menu
- Added a new "Release" tab button to the Settings Menu tabs in `index.html`
- Created a new tab content section for the Release tab with an "Update to latest" button
- Added a version display element to show the current version

### 3. Updated SettingsMenu.js
- Added references to the new Release tab elements
- Added a new `initializeReleaseSettings()` method to handle the Release tab functionality
- Moved the force reload functionality from GameMenu.js to the new method, renaming it to "Update to latest"

## Benefits
- Better organization of UI elements by grouping related functionality
- More intuitive placement of the update functionality in a dedicated Release tab
- Cleaner Game Menu with fewer buttons
- Improved user experience by providing version information alongside the update button