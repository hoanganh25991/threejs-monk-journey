# Wave of Light Auto-Targeting Enhancement

## Overview
This enhancement improves the "Wave of Light" skill to automatically target nearby enemies. When the skill is cast, it will now check for the nearest enemy within range and drop the bell at that enemy's location instead of at the player's current position.

## Implementation Details

### Changes to Skill.js
1. Modified the `createWaveEffect` method to:
   - Check for the nearest enemy within the skill's range
   - If an enemy is found, position the bell effect at the enemy's location
   - If no enemy is found, the bell will drop at the player's current position (original behavior)
   - Show a notification indicating which enemy is being targeted

2. Key improvements:
   - The bell now drops directly on enemies when they are in range
   - The skill is more effective in combat as it targets enemies automatically
   - Visual feedback is provided to the player through notifications
   - The original behavior is preserved when no enemies are in range

### Technical Details
- Used the existing `findNearestEnemy` method from the EnemyManager to locate the closest enemy
- Calculated the target position based on the enemy's location
- Moved the effect group to the target position
- Stored the target position in the bell state for reference during animation

## Benefits
- Improved combat effectiveness of the "Wave of Light" skill
- More intuitive targeting for the bell effect
- Enhanced visual feedback through notifications
- Preserved original behavior as a fallback when no enemies are in range

## Testing
The implementation has been tested with various enemy positions. The bell now correctly targets the nearest enemy within range, or drops at the player's position if no enemy is found.