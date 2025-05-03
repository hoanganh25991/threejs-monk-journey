# Camera Angle and Zoom Update

## Changes Made

Updated the camera settings in the Player.js file to provide a better view of the game world:

1. **Increased Camera Height**: Changed the Y offset from 5 to 8 units to position the camera higher above the player.
2. **Increased Camera Distance**: Changed the Z offset from 10 to 15 units to zoom out and see more of the game world.
3. **Adjusted Camera Target**: Lowered the camera target Y position from +1 to +0.5 to allow the camera to see more of the scene ahead of the player.

## Benefits

These changes provide the following improvements:

- **Wider Field of View**: Players can now see more of the game world at once.
- **Better Strategic View**: The higher angle provides a better overview of the battlefield.
- **Improved Gameplay Experience**: Easier to spot enemies, items, and environmental features.

## Technical Implementation

Modified the `updateCamera()` method in the Player class to adjust the camera position and target:

```javascript
updateCamera() {
    // Position camera behind player with increased height and distance for better view
    const cameraOffset = new THREE.Vector3(0, 8, 15);
    
    // ...
    
    const cameraTarget = new THREE.Vector3(
        this.position.x,
        this.position.y + 0.5, // Lower the look target to see more of the scene
        this.position.z
    );
    
    // ...
}
```