# Simplified Loading Progress Tracking

## Changes Made

1. **Simplified Category Tracking**
   - Removed complex category counting and size calculation in `fetchFileSizesFromServiceWorker`
   - Replaced with a simple log of total files with size information
   - This reduces unnecessary processing during the initial loading phase

2. **Improved File Size Accuracy Logic**
   - Simplified the file size determination logic
   - Prioritizes `transferSize` when available (the source of truth for network requests)
   - Falls back to `filesData[fileName].size` only when `transferSize` is 0 (cached resources)
   - Removed unnecessary size accuracy calculation and logging

3. **Cleaner Debug Output**
   - Removed size accuracy percentage from debug logs
   - Simplified the console output format

## Benefits

- **Improved Performance**: Reduced unnecessary calculations during the loading process
- **Simplified Logic**: More straightforward code that's easier to maintain
- **Accurate Size Tracking**: Prioritizes actual transfer size when available
- **Cleaner Logs**: Removed redundant information from debug output

These changes maintain the core functionality of the loading progress indicator while making the code more efficient and easier to understand.