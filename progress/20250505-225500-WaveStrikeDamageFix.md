# Wave Strike Damage Fix

## Issue
The "Wave Strike" skill was visually hitting enemies but not causing damage. This was a critical bug affecting gameplay as one of the main skills wasn't functioning properly.

## Root Cause Analysis
After investigating the code, I found that the issue was in the skill effect system. The skill effects were being created and animated correctly, but the skill's position property (which is used for collision detection in the CollisionManager) wasn't being updated to match the effect's position as it moved through the game world.

The CollisionManager uses the skill's position property to check for collisions with enemies, but this position was remaining at the initial cast location instead of moving with the visual effect.

## Changes Made

1. Fixed the `RangedSkillEffect` class to update the skill's position property:
```javascript
// Move projectile forward
const moveDistance = this.projectileSpeed * delta;
this.effect.position.x += this.direction.x * moveDistance;
this.effect.position.z += this.direction.z * moveDistance;

// IMPORTANT: Update the skill's position property to match the effect's position
// This is crucial for collision detection in CollisionManager
this.skill.position.copy(this.effect.position);
```

2. Applied the same fix to the base `SkillEffect` class to ensure all skill types properly update their position:
```javascript
// IMPORTANT: Update the skill's position property to match the effect's position
// This is crucial for collision detection in CollisionManager
this.skill.position.copy(this.effect.position);
```

3. Also fixed the `AoESkillEffect` and `MultiSkillEffect` classes with the same update to ensure consistent behavior across all skill types.

## Results
- "Wave Strike" now properly damages enemies when it hits them
- The fix also ensures that other skills will properly update their positions for collision detection
- The game's combat system is now more reliable and consistent

## Technical Notes
This fix highlights the importance of properly synchronizing visual effects with their logical representations in game systems. The visual effect was moving correctly, but its logical position used for collision detection wasn't being updated, causing a disconnect between what the player sees and how the game behaves.