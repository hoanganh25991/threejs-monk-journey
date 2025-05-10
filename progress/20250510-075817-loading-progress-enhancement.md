# Loading Progress Enhancement

## Summary
Enhanced the loading progress tracking in `initial-load-progress.js` to properly handle cached resources by using file size information from `file-sizes.json`. This ensures accurate progress reporting even when resources are loaded from the browser cache.

## Changes Made

1. **Improved Resource Size Tracking**
   - Modified the PerformanceObserver handler to use file size data from `file-sizes.json` when resources are loaded from cache (transferSize = 0)
   - Added proper logging to distinguish between network-loaded and cache-loaded resources

2. **Enhanced Category Progress Tracking**
   - Updated the `updateCategoryProgress` function to handle files not found in `file-sizes.json` by using extension-based categorization
   - Ensured consistent categorization between different functions

3. **Added Size Estimation for Unknown Files**
   - Added reasonable size estimates for files not found in `file-sizes.json` based on their file type
   - This provides more accurate progress reporting for all resources

## Benefits

- More accurate loading progress reporting, especially on repeat visits when resources are cached
- Better category-based progress tracking for all resources
- Improved user experience with more realistic loading indicators
- Proper triggering of the `gameAssetsLoaded` event with accurate loading statistics

## Technical Details

The key improvement is in how we handle cached resources. Previously, resources with `transferSize = 0` (cached resources) were ignored in the progress calculation. Now, we use the expected file size from `file-sizes.json` for these resources, ensuring they contribute to the overall loading progress.

This change ensures that the loading progress indicator accurately reflects the actual loading state of all game assets, whether they're loaded from the network or from the browser cache.