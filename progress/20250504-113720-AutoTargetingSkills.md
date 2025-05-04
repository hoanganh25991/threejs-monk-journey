# Auto-Targeting Skills Enhancement

## Overview
This enhancement implements automatic targeting for skills, allowing them to automatically find and target the nearest enemy when cast. The player character will also automatically rotate to face the targeted enemy.

## Implementation Details

### Changes to Player.js
1. Modified the `useSkill` method to:
   - Find the nearest enemy within the skill's range
   - Automatically rotate the player to face that enemy
   - Cast the skill in the direction of the enemy
   - Show a notification indicating which enemy is being targeted

2. Key improvements:
   - All skills now automatically target the nearest enemy within range
   - The player character rotates to face the targeted enemy
   - Skills are cast in the direction of the enemy
   - A notification is shown to indicate which enemy is being targeted

### Technical Details
- Used the existing `findNearestEnemy` method from the EnemyManager to locate the closest enemy
- Calculated the direction vector from the player to the enemy
- Updated the player's rotation to face the enemy
- Created the skill effect in the direction of the enemy

## Benefits
- Improved gameplay experience by making skill targeting more intuitive
- Reduced the need for manual targeting and rotation
- Made combat more fluid and responsive
- Enhanced the feeling of the character being aware of enemies

## Testing
The implementation has been tested with various skills and enemy positions. The auto-targeting works correctly, with the player character rotating to face the nearest enemy when a skill is cast.