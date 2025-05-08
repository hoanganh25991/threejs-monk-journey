# Mini Map Direction Fix

## Issue
The mini-map was showing incorrect direction indicators when the player moved using the "w" (forward) and "s" (backward) keys. The direction indicator was pointing in the opposite direction of the actual player movement.

## Analysis
The issue was in the `MiniMapUI.js` file where the player direction indicator was drawn. The problem was with the sign of the cosine function in the direction calculation.

In the original code:
```javascript
this.ctx.lineTo(
    centerX + Math.sin(playerRotation) * 8,
    centerY - Math.cos(playerRotation) * 8
);
```

The negative sign in front of the cosine function was causing the direction to be inverted on the Z-axis (which corresponds to forward/backward movement with W/S keys).

## Fix
Changed the sign of the cosine function from negative to positive:

```javascript
this.ctx.lineTo(
    centerX + Math.sin(playerRotation) * 8,
    centerY + Math.cos(playerRotation) * 8
);
```

This ensures that the direction indicator on the mini-map correctly reflects the player's movement direction, particularly when using the W (forward) and S (backward) keys.

## Files Modified
- `/js/core/hud-manager/MiniMapUI.js`