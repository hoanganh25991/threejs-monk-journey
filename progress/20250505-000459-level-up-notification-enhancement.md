# Level Up Notification Enhancement

## Task Description
Enhance the level up notification system to handle multiple level ups better by:
1. Removing old level up notifications quickly when a new one appears
2. Maintaining the 2-second duration for the current notification
3. Ensuring proper cleanup of notifications in various game states

## Changes Made

### 1. Added Tracking Variables in UIManager
Added two new class variables to track level up notifications:
- `levelUpElement`: Stores the current level up DOM element
- `levelUpAnimation`: Stores the interval ID for the animation

```javascript
constructor(game) {
    // ... existing code ...
    this.levelUpElement = null;
    this.levelUpAnimation = null;
}
```

### 2. Enhanced showLevelUp Method
Modified the `showLevelUp` method to:
- Clear any existing level up notification before showing a new one
- Store references to the current notification element and animation
- Use the new `clearLevelUpNotification` method for cleanup

```javascript
showLevelUp(level) {
    // If there's an existing level up notification, remove it immediately
    this.clearLevelUpNotification();
    
    // Create level up element
    this.levelUpElement = document.createElement('div');
    // ... rest of the method ...
}
```

### 3. Added clearLevelUpNotification Method
Created a new method to handle proper cleanup of level up notifications:
- Clears the animation interval
- Removes the DOM element
- Resets tracking variables

```javascript
clearLevelUpNotification() {
    // Clear any existing level up animation
    if (this.levelUpAnimation) {
        clearInterval(this.levelUpAnimation);
        this.levelUpAnimation = null;
    }
    
    // Remove any existing level up element
    if (this.levelUpElement) {
        this.levelUpElement.remove();
        this.levelUpElement = null;
    }
}
```

### 4. Updated showDeathScreen Method
Modified the `showDeathScreen` method to clear any level up notifications when the player dies:

```javascript
showDeathScreen() {
    // Clear any level up notifications
    this.clearLevelUpNotification();
    
    // ... rest of the method ...
}
```

## Benefits
- Improved user experience with cleaner transitions between level up notifications
- Prevents overlapping or stacking of multiple level up messages
- Ensures proper cleanup of UI elements in different game states
- Maintains the impressive visual effect of the level up animation

## Testing Notes
The changes should be tested by:
1. Triggering multiple level ups in quick succession
2. Checking that old notifications are immediately removed
3. Verifying that the 2-second animation duration is maintained for each notification
4. Confirming that notifications are properly cleaned up when the player dies