# Exploding Palm Direct Targeting Enhancement

## Overview
Enhanced the Exploding Palm skill to automatically find and target the nearest enemy with a direct flight path. The palm now flies in a straight line toward the nearest enemy, creating a more precise and predictable combat experience.

## Implementation Details

### 1. Added Enemy Targeting to `create` Method
- Modified the `create` method to search for the nearest enemy using the `findNearestEnemy` method from the EnemyManager
- If an enemy is found, the palm is directed toward that enemy instead of in the player's facing direction
- The target enemy is stored for collision detection during the palm's flight

```javascript
// Find the nearest enemy if we have access to the game and enemy manager
let targetEnemy = null;
let targetDirection = direction;

if (this.skill && this.skill.game && this.skill.game.enemyManager) {
  // Try to find the nearest enemy within a reasonable range
  const searchRange = 30; // Maximum search distance
  targetEnemy = this.skill.game.enemyManager.findNearestEnemy(position, searchRange);
  
  if (targetEnemy) {
    const enemyPosition = targetEnemy.getPosition();
    // Calculate direction vector from player to enemy
    targetDirection = new THREE.Vector3()
      .subVectors(enemyPosition, position)
      .normalize();
    
    // Store the target entity for later use
    this.targetEntity = targetEnemy;
  }
}
```

### 2. Simplified the `updateFlyingPhase` Method
- Removed all homing and tracking behavior
- The palm now flies in a direct, straight line toward the initially calculated direction
- Added collision detection to transition to the "attached" phase when the palm reaches the enemy
- Maintained the maximum distance check to ensure the palm explodes if it doesn't hit an enemy

```javascript
// Check if we have a target entity and it's still alive
if (this.explodingPalmState.targetEntity && 
    !this.explodingPalmState.targetEntity.isDead()) {
  
  // Get current palm position and target position
  const palmPosition = new THREE.Vector3().copy(this.explodingPalmState.palmGroup.position);
  const targetPosition = this.explodingPalmState.targetEntity.getPosition();
  
  // Calculate distance to target
  const distanceToTarget = palmPosition.distanceTo(targetPosition);
  
  // If we're close enough to the target, attach to it
  const attachDistance = 1.5; // Distance threshold to consider "attached"
  if (distanceToTarget <= attachDistance) {
    // Transition to attached phase
    this.explodingPalmState.phase = "attached";
    this.explodingPalmState.attachedPosition = targetPosition.clone();
    
    // Position the palm at the target
    this.explodingPalmState.palmGroup.position.copy(targetPosition);
    // Adjust height to be visible on the enemy
    this.explodingPalmState.palmGroup.position.y = 1.5;
    
    return; // Exit early since we've changed phases
  }
  
  // No homing or tracking - palm flies in a direct line as initially aimed
}
```

## Benefits
1. **Direct Targeting**: The skill now finds the nearest enemy and flies directly toward it in a straight line
2. **Predictable Behavior**: Players can better anticipate where the palm will go, making it more reliable in combat
3. **Visual Clarity**: The direct path makes it clear which enemy is being targeted
4. **Gameplay Enhancement**: Makes the Exploding Palm skill more effective while maintaining a consistent behavior

## Testing Notes
- The palm successfully finds and targets the nearest enemy within range
- The palm flies in a direct line toward the initially calculated target position
- The palm properly transitions to the "attached" phase when it reaches an enemy
- If no enemies are in range, the palm behaves as before, flying in the direction the player is facing
- If the palm misses the enemy (due to enemy movement), it continues on its path until reaching maximum distance