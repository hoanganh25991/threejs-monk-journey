# Fix for Enemy Animation Error

## Issue
The game was experiencing an error in the Enemy.js file:
```
Enemy.js:769 Uncaught TypeError: Cannot read properties of undefined (reading 'position')
    at Enemy.updateAnimations (Enemy.js:769:26)
    at Enemy.update (Enemy.js:753:14)
    at EnemyManager.update (EnemyManager.js:268:19)
    at Game.animate (Game.js:165:27)
    at Game.js:146:42
```

## Root Cause
The error occurred in the `updateAnimations` method of the Enemy class. The code was trying to access `rightLeg.position.z` without properly checking if `rightLeg` exists. This happens because:

1. The code assumed that `this.modelGroup.children[5]` (the right leg) always exists
2. Different enemy types might have different model structures
3. There was no null checking before accessing properties

## Solution
Added proper null checks to prevent the error:

1. Added a check for `this.modelGroup` existence
2. Changed the condition to check for at least 6 children (for legs) and 4 children (for arms)
3. Added null checks before accessing properties of each limb
4. Added defensive programming to ensure all objects and their properties exist before trying to modify them

## Changes Made
Modified the `updateAnimations` method in `Enemy.js` to include proper null checks:

```javascript
updateAnimations(delta) {
    // Simple animations for the enemy model
    if (this.state.isMoving && this.modelGroup) {
        // Walking animation
        const walkSpeed = 5;
        const walkAmplitude = 0.1;
        
        // Animate legs
        if (this.modelGroup.children.length >= 6) {
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            
            if (leftLeg && leftLeg.position) {
                leftLeg.position.z = Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            }
            
            if (rightLeg && rightLeg.position) {
                rightLeg.position.z = -Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            }
        }
        
        // Animate arms
        if (this.modelGroup.children.length >= 4) {
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            if (leftArm && leftArm.rotation) {
                leftArm.rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
            }
            
            if (rightArm && rightArm.rotation) {
                rightArm.rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
            }
        }
    }
    
    // Attack animation
    if (this.state.isAttacking && this.modelGroup) {
        // Simple attack animation
        if (this.modelGroup.children.length >= 4) {
            const rightArm = this.modelGroup.children[3];
            if (rightArm && rightArm.rotation) {
                rightArm.rotation.x = Math.sin(Date.now() * 0.02) * 0.5;
            }
        }
    }
}
```

This fix ensures that the game won't crash when encountering enemies with different model structures.