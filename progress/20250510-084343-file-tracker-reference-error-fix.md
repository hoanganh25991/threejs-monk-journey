# File Tracker Reference Error Fix

## Issue
A ReferenceError was occurring in the file-tracker.js script at line 309:
```
file-tracker.js:119 Error fetching file sizes JSON: ReferenceError: Cannot access 'now' before initialization
    at updateUI (file-tracker.js:309:13)
    at file-tracker.js:110:17
```

## Root Cause
The variable `now` was being used without being properly declared with `let`, `const`, or `var`. In JavaScript, variables must be declared before they are used, otherwise they will cause a ReferenceError.

## Solution
Added the `const` keyword to properly declare the `now` variable:

```javascript
// Before
now = Date.now();

// After
const now = Date.now();
```

This ensures that the variable is properly declared before it's used, preventing the ReferenceError.

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/pwa/file-tracker.js`