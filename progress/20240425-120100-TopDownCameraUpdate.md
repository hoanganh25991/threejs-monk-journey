# Top-Down Camera View Update

## Changes Made

Updated the camera settings in the Player.js file to provide a more top-down view with increased zoom:

1. **Significantly Increased Camera Height**: Changed the Y offset from 8 to 20 units to position the camera much higher above the player, creating a more top-down perspective.

2. **Adjusted Camera Distance**: Changed the Z offset from 15 to 8 units to position the camera more directly above the player rather than behind.

3. **Modified Camera Target**: Changed the camera target to look directly at the player's position (removed the +0.5 Y offset) to create a cleaner top-down view.

## Benefits

These changes provide the following improvements:

- **True Top-Down Perspective**: The camera now provides a more classic isometric/top-down view similar to traditional Diablo games.
- **Larger Visible Area**: Players can see a much larger area of the ground around their character.
- **Enhanced Strategic Gameplay**: The wider field of view allows for better planning and awareness of surroundings.
- **Improved Combat Visibility**: Easier to see enemy positions and plan attacks from a higher vantage point.

## Technical Implementation

Modified the `updateCamera()` method in the Player class to adjust the camera position and target:

```javascript
updateCamera() {
    // Position camera in a more top-down view with greater height and distance
    const cameraOffset = new THREE.Vector3(0, 20, 8);
    
    // ...
    
    const cameraTarget = new THREE.Vector3(
        this.position.x,
        this.position.y, // Look directly at player's position for top-down view
        this.position.z
    );
    
    // ...
}
```