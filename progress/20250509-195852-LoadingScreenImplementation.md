# LoadingScreen Implementation in Initial Load Progress

## Summary
Integrated the LoadingScreen class from the core menu system into the initial loading progress script. This change ensures a consistent loading experience by using the same loading screen component throughout the application lifecycle.

## Changes Made

1. **Modified `pwa/initial-load-progress.js`**:
   - Replaced the custom loading indicator implementation with the LoadingScreen class
   - Added import statement for the LoadingScreen class
   - Implemented time-based progress tracking using the LoadingScreen's updateProgress method
   - Maintained the same progress stages and messages from the original implementation
   - Added safety timeout to ensure the loading screen doesn't block the game

2. **Updated `index.html`**:
   - Removed the redundant initial-loading-indicator element
   - Added required elements for the LoadingScreen class:
     - `loading-text` paragraph element
     - `loading-info` paragraph element

## Benefits

1. **Consistency**: Uses the same loading screen component throughout the application
2. **Maintainability**: Centralizes loading screen logic in one class
3. **User Experience**: Provides a seamless transition from initial loading to game loading
4. **Code Reuse**: Leverages existing functionality instead of duplicating code

## Technical Details

The implementation now follows this flow:
1. On page load, the initial-load-progress.js script creates a LoadingScreen instance
2. The script shows the loading screen and starts updating progress based on elapsed time
3. When the window load event fires, the progress jumps to 100%
4. A safety timeout ensures the loading screen is hidden after 30 seconds, even if something goes wrong

The LoadingScreen class handles:
- Showing and hiding the loading screen
- Updating the progress bar
- Displaying status messages
- Transitioning to the game when loading is complete