# ModelPreview Animation Selection Enhancement

## Issue
After implementing the animation listing functionality, we needed to enhance the animation selection and playback to ensure that when a user selects an animation from the dropdown, it properly plays in the model preview.

## Changes Made

1. Enhanced the `playAnimation` method with better error handling and logging:
   ```javascript
   playAnimation(animationName, transitionDuration = 0.5) {
       console.log(`ModelPreview: Attempting to play animation "${animationName}"`);
       console.log(`ModelPreview: Available animations:`, Object.keys(this.animations));
       
       // If we don't have animations or the requested animation doesn't exist, return false
       if (!this.animations || !this.animations[animationName]) {
           console.warn(`ModelPreview: Animation "${animationName}" not found`);
           return false;
       }
       
       // If this is already the current animation, don't restart it
       if (this.currentAnimation === animationName) {
           console.log(`ModelPreview: Animation "${animationName}" is already playing`);
           return true;
       }
       
       try {
           // Crossfade to the new animation
           this.animations[animationName].reset().fadeIn(transitionDuration).play();
           
           // If there was a previous animation, fade it out
           if (this.currentAnimation && this.animations[this.currentAnimation]) {
               this.animations[this.currentAnimation].fadeOut(transitionDuration);
           }
           
           // Update current animation
           this.currentAnimation = animationName;
           console.log(`ModelPreview: Successfully playing animation "${animationName}"`);
           
           return true;
       } catch (error) {
           console.error(`ModelPreview: Error playing animation "${animationName}":`, error);
           return false;
       }
   }
   ```

2. Improved the animation loading in the `loadModel` method:
   - Added handling for unnamed animations
   - Enhanced logging of loaded animations
   - Added proper error handling for animation initialization

3. Updated the animation update logic in the `animate` method:
   - Added a check to ensure the mixer exists before updating animations
   - This prevents errors when no animations are available

## Result
The ModelPreview class now properly handles animation selection and playback, allowing users to:
1. See a list of all available animations for a model
2. Select an animation from the dropdown
3. See the selected animation play with a smooth transition from the previous animation

The enhanced error handling and logging also makes it easier to debug any animation-related issues that might occur.