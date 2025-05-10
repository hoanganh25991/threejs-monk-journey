# File Tracker Null Check Fix

## Issue
An uncaught error was occurring in the file-tracker.js at line 363. The error message was:
```
Uncaught TypeError: Cannot read properties of null (reading 'file-tracker.js')
    at file-tracker.js:363:43
    at Array.filter (<anonymous>)
    at FileTracker.updateUI (file-tracker.js:361:18)
    at file-tracker.js:101:36
```

## Root Cause
There were multiple issues:
1. The `updateUI()` method was being called before the file-sizes.json data was loaded, resulting in `this.filesData` being null.
2. There was insufficient error handling when processing URLs, which could be null or malformed.
3. The code was not properly handling edge cases in the URL splitting operations.

## Fix
Added comprehensive error handling to the URL processing code:

```javascript
// Before
const fileName = url.split('/').pop().split('?')[0];
return !this.filesData[fileName];

// After
// Make sure url is not null or undefined
if (!url) return false;

try {
    const urlParts = url.split('/');
    const lastPart = urlParts.pop() || '';
    const fileName = lastPart.split('?')[0] || '';
    
    // Check if this.filesData exists and if the fileName exists in it
    return !this.filesData || !fileName || !this.filesData[fileName];
} catch (error) {
    console.error('Error processing URL in file tracker:', error, url);
    return false;
}
```

This change ensures:
1. We check if the URL is null or undefined before trying to process it
2. We use try/catch to handle any unexpected errors during URL processing
3. We provide fallbacks for each step of the URL parsing
4. We log any errors that occur for debugging purposes

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/pwa/file-tracker.js`