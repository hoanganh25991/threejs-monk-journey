# Auto-Pause Music Implementation

## Overview
Implemented a feature to automatically pause background music when the game is not active, with special attention to mobile devices. This enhances the user experience by preventing music from playing when the user switches to another app or tab.

## Changes Made

### 1. AudioManager.js
- Added `wasMusicPlayingBeforeHidden` property to track music state when page visibility changes
- Added `autoPauseEnabled` property (default: true) to allow users to toggle this feature
- Implemented `handleVisibilityChange()` method to handle page visibility events
- Added `toggleAutoPause()` and `isAutoPauseEnabled()` methods
- Updated `saveSettings()` and `loadSettings()` to include the auto-pause setting

### 2. Game.js
- Added event listeners for visibility changes:
  - `visibilitychange` - Standard visibility API
  - `pagehide`/`pageshow` - Mobile-specific events
  - `blur`/`focus` - Additional fallback for some browsers
- Implemented event handler methods:
  - `onVisibilityChange()`
  - `onPageHide()`
  - `onPageShow()`
  - `onBlur()`
  - `onFocus()`

### 3. main.js (Settings Menu)
- Added "Auto-pause music when inactive" toggle in the audio settings section
- Connected the toggle to the AudioManager's auto-pause functionality

## Benefits
- Prevents music from continuing to play when the user switches to another app or tab
- Especially useful on mobile devices where background processes should be minimized
- Improves battery life by reducing unnecessary audio playback
- Provides user control with the ability to toggle this feature on/off

## Technical Details
- Uses the Page Visibility API as the primary detection method
- Includes fallbacks for various mobile browsers and scenarios
- Persists user preference in localStorage
- Automatically resumes music when the game becomes active again (if it was playing before)