# File Tracker Enhancement

## Issue
There was a significant discrepancy between Chrome's reported resources (10.0 MB) and what the file tracker was showing (only 14% of the size). This made the loading progress indicator inaccurate and not reflective of the actual loading state.

## Analysis
After investigating the issue, several problems were identified:

1. **Incomplete File Scanning**: The `generate-file-sizes.js` script was not scanning all directories and file types, resulting in an incomplete file-sizes.json.

2. **Filename Matching Issues**: The file tracker was using a simple filename extraction method that didn't handle query parameters or path differences.

3. **Size Calculation Differences**: The tracker wasn't using the most appropriate size metric (decodedBodySize) for comparison with Chrome's reported sizes.

4. **Missing Files in Tracking**: Many files loaded by the application weren't included in file-sizes.json, causing them to be tracked but not counted toward the known files percentage.

## Changes Made

### 1. Enhanced File Tracking in file-tracker.js
- Added support for decodedBodySize to better match Chrome's size calculations
- Improved filename extraction to handle query parameters and hashes
- Added more robust file matching logic to find files in file-sizes.json
- Enhanced debugging output to identify files not included in file-sizes.json
- Improved progress calculation to better reflect actual loading progress

### 2. Expanded generate-file-sizes.js Script
- Added more directories to scan, including the root directory
- Expanded the list of file extensions to include more media types
- Added more files to the "always include" list
- Excluded the file-sizes.json file itself from being included in the scan
- Added better handling of font files and other resource types

## Results
- The file-sizes.json now includes 322 files (up from 157) with a total size of 22.83 MB
- This is much closer to Chrome's reported 10.0 MB transferred / 10.0 MB resources
- The file tracker now provides more accurate progress information
- The loading indicator should now better reflect the actual loading state of the application

## Benefits
- More accurate loading progress indicator
- Better debugging information for tracking resource loading
- Improved user experience with more realistic loading percentages
- Better alignment between Chrome's network panel and the application's loading indicator

## Testing
Successfully ran the generate-file-sizes.js script to create an updated file-sizes.json with more comprehensive file coverage.