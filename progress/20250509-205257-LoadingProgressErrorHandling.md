# Loading Progress Error Handling Update

## Changes Made

1. Modified the error handling in the loading progress system to use `console.error` instead of `console.warn` when file sizes cannot be retrieved from the service worker.

2. Removed the fallback to simulated progress tracking when file sizes cannot be retrieved. The system now simply logs an error and does nothing further in this case.

3. Removed the entire `trackProgressSimulated()` function as it's no longer needed.

4. Updated the error handling in `trackProgressWithFileSize()` to use `console.error` instead of `console.warn` when file data is not available.

## Technical Details

The changes focus on improving error handling in the loading progress system. Instead of falling back to a simulated progress tracking when file sizes cannot be retrieved, the system now simply logs an error and does not attempt to continue with a fallback mechanism.

This approach is more straightforward and avoids running unnecessary code when the required data is not available.

## Files Modified

- `/Users/anhle/work-station/diablo-immortal/pwa/initial-load-progress.js`