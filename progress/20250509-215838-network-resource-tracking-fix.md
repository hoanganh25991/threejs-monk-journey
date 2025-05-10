# Network Resource Tracking Fix

## Problem
The game's loading progress indicator was only tracking 115 resources (1.75 MB) while Chrome's Network panel showed 311 requests. This discrepancy was causing the loading progress to be inaccurate and potentially causing the `gameAssetsLoaded` event to fire prematurely.

## Root Causes
1. **Limited entry types in PerformanceObserver**: The observer was only tracking a subset of network request types.
2. **Filtering of cached resources**: Resources with zero transfer size (cached resources) were being filtered out.
3. **Incomplete resource detection**: The code wasn't using the buffered option to capture resources loaded before the observer was initialized.
4. **Overly aggressive filtering**: Some legitimate resources were being filtered out due to URL patterns.

## Solution
Created an enhanced version of the loading progress tracker with the following improvements:

1. **Expanded entry type tracking**:
   - Added support for all available performance entry types
   - Used `PerformanceObserver.supportedEntryTypes` to detect available types
   - Added buffered option to capture resources loaded before observer initialization

2. **Improved cached resource handling**:
   - Added explicit tracking of cached resources
   - Properly estimated sizes for cached resources based on file type
   - Added logging to distinguish between cached and downloaded resources

3. **Better resource statistics**:
   - Added detailed resource statistics by file type
   - Created console debugging tools to check resource tracking
   - Added ability to manually check for missed resources

4. **More accurate size estimation**:
   - Improved size estimates for different file types
   - Used more accurate size metrics for cached resources
   - Only filtered analytics/tracking resources if they had zero size

## Implementation
1. Created a new file `initial-load-progress-enhanced.js` with all improvements
2. Added debugging tools accessible via `window.gameResourceTracker` in the console:
   - `window.gameResourceTracker.getStats()` - Shows detailed resource statistics
   - `window.gameResourceTracker.checkMissed()` - Checks for missed resources
   - `window.gameResourceTracker.getResourceCount()` - Returns the total number of tracked resources
   - `window.gameResourceTracker.getTotalBytes()` - Returns the total size of tracked resources

## How to Use
1. Replace the original `initial-load-progress.js` with the enhanced version:
   ```
   cp /Users/anhle/work-station/diablo-immortal/pwa/initial-load-progress-enhanced.js /Users/anhle/work-station/diablo-immortal/pwa/initial-load-progress.js
   ```

2. Reload the game and check the console for detailed resource tracking information

3. If you still see discrepancies, you can manually check for missed resources in the console:
   ```javascript
   window.gameResourceTracker.checkMissed();
   ```

4. To see detailed statistics about tracked resources:
   ```javascript
   window.gameResourceTracker.getStats();
   ```

## Expected Results
- The loading progress indicator should now track all resources, including cached ones
- The total number of tracked resources should be much closer to what Chrome's Network panel shows
- The `gameAssetsLoaded` event should fire only when all resources are truly loaded
- The console will show more detailed information about resource loading