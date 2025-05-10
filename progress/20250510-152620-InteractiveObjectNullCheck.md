# Interactive Object Null Check Fix

## Issue
The game was experiencing an error when interacting with certain objects:
```
Uncaught TypeError: Cannot read properties of null (reading 'type')
    at CollisionManager.handleInteraction (CollisionManager.js:136:24)
```

## Analysis
The error occurred in the `handleInteraction` method of the `CollisionManager` class. The issue was that the code was trying to access the `type` property of a result object that could be null. This happened specifically when interacting with treasure chests that had already been opened, as their `onInteract` method returns null.

## Changes Made

1. Added a null check in the `handleInteraction` method in `CollisionManager.js`:
```javascript
// Check if result is null or undefined before proceeding
if (!result) {
    // No interaction result, possibly already interacted with
    if (this.player.game && this.player.game.uiManager) {
        this.player.game.uiManager.showNotification("Nothing happens.");
    }
    // Reset interaction state
    this.player.setInteracting(false);
    return;
}
```

2. Fixed the interaction type in `InteractiveObjectManager.js` to ensure consistency:
```javascript
// Changed from 'item' to 'treasure' to match the case in the switch statement
return {
    type: 'treasure',
    item: {
        name: 'Gold',
        amount: Math.floor(Math.random() * 100) + 50
    }
};
```

3. Added an additional case for 'item' type in the switch statement to handle both types of interactions.

## Benefits
- Prevents the game from crashing when interacting with objects that don't return a result
- Provides user feedback with a "Nothing happens" notification
- Ensures consistent handling of treasure/item interactions

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/core/CollisionManager.js`
- `/Users/anhle/work-station/diablo-immortal/js/world/interactive/InteractiveObjectManager.js`