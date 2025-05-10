# Bleeding Effect Refactor to Three.js

## Summary
Refactored the bleeding effect from DOM-based implementation to Three.js to improve performance. The DOM-based implementation was causing performance issues, especially when many effects were active simultaneously.

## Changes Made

1. Created a new `BleedingEffect.js` class that extends the base `SkillEffect` class:
   - Implements a Three.js-based particle system for blood effects
   - Properly handles creation, updating, and disposal of resources
   - Scales effect intensity based on damage amount
   - Includes proper cleanup methods to prevent memory leaks

2. Updated `EffectsManager.js` to:
   - Use the new Three.js-based `BleedingEffect` class
   - Maintain backward compatibility with any remaining DOM-based effects
   - Add proper cleanup methods for both DOM and Three.js effects
   - Track Three.js effects separately from DOM effects

## Benefits

1. **Performance Improvement**:
   - Three.js effects are rendered directly in the WebGL context, avoiding DOM manipulation
   - GPU-accelerated rendering instead of CPU-intensive DOM operations
   - Reduced garbage collection pressure from DOM element creation/removal

2. **Code Organization**:
   - Better integration with the existing skill effect system
   - Follows the established pattern for skill effects
   - Cleaner separation of concerns

3. **Visual Consistency**:
   - Effects now appear in the 3D world rather than as 2D overlays
   - Better depth perception and integration with the game world
   - Consistent with other game effects

## Technical Details

The new implementation:
- Creates 3D particles based on damage amount
- Applies physics-based movement (velocity and gravity)
- Properly fades out particles over time
- Includes flash effects for high damage hits
- Properly disposes of all Three.js resources (geometries, materials)

## Future Improvements

1. Consider replacing the DOM-based screen flash with a Three.js post-processing effect
2. Add more variation to particle shapes and behaviors
3. Add sound effects that scale with damage amount
4. Consider adding damage numbers alongside the blood effects