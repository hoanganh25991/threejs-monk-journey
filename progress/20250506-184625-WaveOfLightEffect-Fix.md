# Wave of Light Effect Bug Fix

## Issue
The `WaveOfLightEffect.js` file had an error on line 410 where `safeRadius` was being used but not defined in the `updateWaveEffect` method. This caused the error message:

```
WaveOfLightEffect.js:274 Error updating effect: safeRadius is not defined
```

## Root Cause
The variable `safeRadius` was defined in the `createWaveEffect` method (line 61) but was not available in the scope of the `updateWaveEffect` method where it was being used to calculate particle opacity based on distance from the center.

## Solution
Added the missing `safeRadius` definition in the `updateWaveEffect` method, using the same validation logic as in the `createWaveEffect` method:

```javascript
// Ensure radius is valid (same as in createWaveEffect method)
const safeRadius = isNaN(this.radius) || this.radius <= 0 ? 2.0 : this.radius;
```

This ensures that the radius value is valid and consistent with the one used during effect creation.

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/entities/skills/WaveOfLightEffect.js`

## Testing
The fix should resolve the error and allow the Wave of Light effect to properly fade particles based on their distance from the center of the impact area.