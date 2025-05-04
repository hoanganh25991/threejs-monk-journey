# Three.js OutputColorSpace Fix

## Issue
The game was generating a warning in the console:
```
three.module.js:30959 THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead.
```

## Solution
Updated the deprecated `outputEncoding` property to the new `outputColorSpace` property in the Game.js file:

```javascript
// Old code
this.renderer.outputEncoding = THREE.sRGBEncoding;

// New code
this.renderer.outputColorSpace = THREE.SRGBColorSpace;
```

## Technical Details
- The Three.js API has changed, deprecating `outputEncoding` in favor of `outputColorSpace`
- Similarly, `THREE.sRGBEncoding` has been replaced with `THREE.SRGBColorSpace`
- This change ensures compatibility with newer versions of Three.js and eliminates the console warning

## Impact
- Removed console warning
- Maintained correct color space rendering
- Improved code compatibility with current Three.js standards