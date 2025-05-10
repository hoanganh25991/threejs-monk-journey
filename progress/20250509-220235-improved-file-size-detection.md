# Improved File Size Detection for Cached Resources

## Problem
The loading progress indicator was using hardcoded file size estimates for cached resources when their size couldn't be determined from the Performance API. This approach was not accurate and duplicated code in multiple places.

## Solution
Enhanced the file size detection mechanism by:

1. Extracting detailed file size information from the service worker
2. Creating a robust file size lookup function that tries multiple path variations
3. Using actual file sizes from the service worker before falling back to estimates

### Changes Made

1. **Added a file sizes map to store detailed file information:**
   ```javascript
   // Map to store individual file sizes
   let fileSizesMap = {};
   ```

2. **Enhanced `fetchFileSizesFromServiceWorker()` to extract detailed file sizes:**
   - Now fetches the service worker script and extracts the `FILE_SIZES` object
   - Falls back to the simplified `file-sizes.json` for total size if needed
   - Provides better logging of file size information

3. **Added a robust file size lookup function:**
   ```javascript
   function getFileSizeFromMap(url) {
       // Tries multiple path variations to find the file in the map
       // Including full URL, path with/without leading slash, and filename
   }
   ```

4. **Improved resource size calculation logic:**
   - First tries to get the size from the file sizes map
   - Only falls back to extension-based estimates if not found in the map
   - Provides better debugging information

5. **Eliminated duplicate code:**
   - Applied the same improvements to both the PerformanceObserver handler and the existing resources processing

## Benefits

1. **More accurate progress tracking:** Uses actual file sizes instead of estimates whenever possible
2. **Better user experience:** More realistic loading progress indicators
3. **Improved code maintainability:** Centralized file size lookup logic
4. **Better debugging:** Enhanced logging for troubleshooting

## Future Improvements

1. Consider enhancing the `generate-file-sizes.js` script to output detailed file information
2. Add a mechanism to handle version changes that might affect file paths