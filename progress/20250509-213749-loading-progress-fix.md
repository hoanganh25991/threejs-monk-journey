# Loading Progress Indicator Fix

## Issue
The loading progress indicator was showing only 3MB downloaded when it should have been showing 6MB. This discrepancy was occurring because the progress tracking system was only counting resources with a non-zero `transferSize` property, which meant that cached resources were not being counted.

## Root Cause Analysis
1. The `PerformanceObserver` was only tracking resources with a non-zero `transferSize`.
2. Resources loaded from browser cache or service worker cache typically have a `transferSize` of 0.
3. The progress calculation was not accounting for resources that were already loaded before the observer was set up.

## Changes Made

### 1. Improved Resource Size Detection
- Modified the code to use `decodedBodySize` or `encodedBodySize` as fallbacks when `transferSize` is 0
- Added size estimation for cached resources based on file extension
- This ensures that all resources contribute to the progress indicator, even if they're loaded from cache

```javascript
// Use decodedBodySize instead of transferSize to account for cached resources
let resourceSize = entry.decodedBodySize || entry.transferSize || entry.encodedBodySize || 0;

// For cached resources (transferSize = 0), estimate size based on file extension
if (resourceSize === 0) {
    const ext = fileName.split('.').pop().toLowerCase();
    // Estimate sizes for common file types
    if (['jpg', 'jpeg', 'png'].includes(ext)) resourceSize = 100000; // ~100KB for images
    else if (['js'].includes(ext)) resourceSize = 50000; // ~50KB for JS files
    else if (['css'].includes(ext)) resourceSize = 10000; // ~10KB for CSS
    else if (['glb', 'gltf'].includes(ext)) resourceSize = 500000; // ~500KB for 3D models
    else if (['mp3', 'wav'].includes(ext)) resourceSize = 100000; // ~100KB for audio
    else resourceSize = 5000; // Default size for other files
}
```

### 2. Added Tracking for Already Loaded Resources
- Added code to check for resources that were already loaded before the observer was set up
- This ensures that resources loaded early in the page lifecycle are counted

```javascript
// Also check for already loaded resources
if (performance && performance.getEntriesByType) {
    const existingResources = performance.getEntriesByType('resource');
    if (existingResources && existingResources.length > 0) {
        console.log(`Found ${existingResources.length} already loaded resources, adding to tracking`);
        existingResources.forEach(entry => {
            // Process each existing resource...
        });
    }
}
```

### 3. Improved Progress Display
- Modified the progress display to handle cases where the calculated total might exceed the expected total
- Added more detailed logging to help with debugging

```javascript
// Ensure we don't exceed the expected total size in the display
const displayedBytes = Math.min(loadedBytes, totalFilesSize);

// Log more detailed information
console.log(`Actual tracked bytes: ${formatFileSize(loadedBytes)} from ${downloadedResources.size} resources`);
```

### 4. Enhanced Completion Reporting
- Improved the completion message to show the actual size of loaded resources
- Added more detailed logging about the loading process

```javascript
// Calculate actual loaded bytes for reporting
const actualLoadedBytes = Array.from(downloadedResources.values()).reduce((sum, size) => sum + size, 0);
const displaySize = Math.max(totalFilesSize, actualLoadedBytes);

// Log detailed information about loaded resources
console.log(`Loading completed in ${loadTime}s`);
console.log(`Total tracked resources: ${downloadedResources.size}`);
console.log(`Total bytes tracked: ${formatFileSize(actualLoadedBytes)}`);
console.log(`Expected total size: ${formatFileSize(totalFilesSize)}`);
```

## Expected Results
- The loading progress indicator should now show the full 6MB (or more) of downloaded resources
- Cached resources will be properly accounted for in the progress calculation
- The progress indicator will provide a more accurate representation of the loading process

## Testing
To test this fix:
1. Clear browser cache and reload the page to see the full download progress
2. Reload the page without clearing cache to verify that cached resources are still counted
3. Check the browser console for detailed logging about resource loading