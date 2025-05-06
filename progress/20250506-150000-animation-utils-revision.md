# Animation Utils Revision

## Summary
Revised the `playAnimation` function in `AnimationUtils.js` to make it more efficient and address the question of whether the `currentAnimation` parameter is necessary.

## Analysis of Current Implementation

The current `playAnimation` function takes a `currentAnimation` parameter which is used for:

1. Checking if the requested animation is already playing (to avoid restarting it)
2. Fading out the current animation when transitioning to a new one
3. Returning the current animation name in the result object

## Proposed Solutions

### Option 1: Keep currentAnimation but improve clarity
This option maintains backward compatibility while improving the code clarity:

```javascript
export function playAnimation(animations, currentAnimation, primaryName, fallbackName = null, transitionDuration = 0.5) {
    // [existing implementation with minor improvements]
    
    // Get the name of the animation we're about to play
    const newAnimationName = animationToPlay._clip.name;
    
    // If this is already the current animation, don't restart it but return true
    if (currentAnimation === newAnimationName) {
        return { 
            success: true, 
            animation: animationToPlay, 
            currentAnimation: newAnimationName 
        };
    }
    
    // [rest of implementation]
}
```

### Option 2: Alternative implementation without currentAnimation parameter
This option eliminates the need for the `currentAnimation` parameter by determining it from the animations object:

```javascript
export function playAnimationV2(animations, primaryName, fallbackName = null, transitionDuration = 0.5) {
    // If we don't have animations, exit early with a warning
    if (!animations || Object.keys(animations).length === 0) {
        console.warn('AnimationUtils: No animations available to play');
        return { 
            success: false, 
            animation: null, 
            currentAnimation: null 
        };
    }
    
    // Get all available animation names
    const allAnimNames = Object.keys(animations);
    let animationToPlay = null;
    
    // Find currently playing animation (if any)
    let currentlyPlayingAnimation = null;
    for (const name of allAnimNames) {
        if (animations[name].isRunning()) {
            currentlyPlayingAnimation = name;
            break;
        }
    }
    
    // Check if primaryName is a direct animation name
    if (primaryName && animations[primaryName]) {
        animationToPlay = animations[primaryName];
        console.log(`AnimationUtils: Found direct animation match: ${primaryName}`);
    }
    
    // If no match found, use the first animation as fallback
    if (!animationToPlay && allAnimNames.length > 0) {
        const firstAnim = allAnimNames[0];
        animationToPlay = animations[firstAnim];
        console.log(`AnimationUtils: Using first available animation as fallback: ${firstAnim}`);
    }
    
    // If no matching animation is found after all attempts, return false
    if (!animationToPlay) {
        console.warn(`AnimationUtils: No matching animation found for ${primaryName} and no animations available to fall back to`);
        return { 
            success: false, 
            animation: null, 
            currentAnimation: currentlyPlayingAnimation 
        };
    }
    
    // Get the name of the animation we're about to play
    const newAnimationName = animationToPlay._clip.name;
    
    // If this is already the current animation, don't restart it but return true
    if (currentlyPlayingAnimation === newAnimationName) {
        return { 
            success: true, 
            animation: animationToPlay, 
            currentAnimation: newAnimationName 
        };
    }
    
    // Crossfade to the new animation
    animationToPlay.reset().fadeIn(transitionDuration).play();
    
    // If there was a previous animation, fade it out
    if (currentlyPlayingAnimation && animations[currentlyPlayingAnimation]) {
        animations[currentlyPlayingAnimation].fadeOut(transitionDuration);
    }
    
    // Return success with the new animation and updated current animation name
    return { 
        success: true, 
        animation: animationToPlay, 
        currentAnimation: newAnimationName 
    };
}
```

## Recommendation

**Option 1** is recommended for immediate implementation as it maintains backward compatibility while improving code clarity.

**Option 2** could be implemented as a new function (`playAnimationV2`) alongside the existing one, allowing for gradual migration in the codebase. However, this approach depends on whether the animation objects have an `isRunning()` method to detect the currently playing animation.

## Implementation Notes

The key changes in the recommended implementation:
1. Added better type documentation for the `currentAnimation` parameter
2. Extracted the new animation name to a variable for clarity and consistency
3. Used the new animation name consistently in return values

These changes make the code more maintainable while preserving the existing functionality.