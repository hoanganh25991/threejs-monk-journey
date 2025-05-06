# ModelPreview Animation Fix

## Issue
The ModelPreview class was missing methods for handling animations that were being called from main.js:
- `getAnimationNames()` - To get a list of available animations
- `getCurrentAnimation()` - To get the name of the currently playing animation
- `playAnimation()` - To play a specific animation by name

This was causing the error:
```
main.js:517 Uncaught TypeError: modelPreview.getAnimationNames is not a function
    at main.js:517:49
```

## Changes Made

1. Added missing properties to the ModelPreview class constructor:
   ```javascript
   this.animations = {};
   this.currentAnimation = null;
   ```

2. Updated the `loadModel` method to store animations in a map and track the current animation:
   ```javascript
   // Store all animations
   this.animations = {};
   gltf.animations.forEach(animation => {
       const action = this.mixer.clipAction(animation);
       this.animations[animation.name] = action;
   });
   
   // Play the first animation
   const firstAnimName = gltf.animations[0].name;
   this.animations[firstAnimName].play();
   this.currentAnimation = firstAnimName;
   ```

3. Added the missing methods:
   - `getAnimationNames()` - Returns an array of animation names
   - `getCurrentAnimation()` - Returns the name of the currently playing animation
   - `playAnimation(animationName, transitionDuration)` - Plays a specific animation with crossfade

4. Updated the `dispose()` method to clean up the new properties.

## Result
The ModelPreview class now properly supports animation listing and selection, allowing users to view and switch between different animations in the model preview UI.