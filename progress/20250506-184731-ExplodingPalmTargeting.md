# Exploding Palm Targeting Enhancement

## Overview
Enhanced the Exploding Palm skill to automatically find and target the nearest enemy. The palm now flies directly toward enemies and attaches to them, creating a more dynamic and effective combat experience.

## Implementation Details

### 1. Added Enemy Targeting to `create` Method
- Modified the `create` method to search for the nearest enemy using the `findNearestEnemy` method from the EnemyManager
- If an enemy is found, the palm is directed toward that enemy instead of in the player's facing direction
- The target enemy is stored for tracking during the palm's flight

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

### 2. Enhanced the `updateFlyingPhase` Method
- Added logic to track the target enemy during flight
- Implemented a homing effect that adjusts the palm's trajectory to follow moving enemies
- Added collision detection to transition to the "attached" phase when the palm reaches the enemy

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
  }
  
  // If target has moved, update direction to track it
  if (distanceToTarget > attachDistance * 1.5) {
    // Calculate new direction to target
    const newDirection = new THREE.Vector3()
      .subVectors(targetPosition, palmPosition)
      .normalize();
    
    // Gradually adjust current direction towards new direction (homing effect)
    this.currentDirection.lerp(newDirection, 0.1);
    this.currentDirection.normalize();
  }
}
```

## Benefits
1. **Improved Targeting**: The skill now intelligently finds and targets enemies rather than flying in a fixed direction
2. **Dynamic Tracking**: The palm adjusts its trajectory to follow moving enemies
3. **Visual Feedback**: The palm visually attaches to enemies, making it clear which enemy is marked
4. **Gameplay Enhancement**: Makes the Exploding Palm skill more effective and satisfying to use

## Testing Notes
- The palm successfully finds and targets the nearest enemy within range
- The homing effect works well for tracking moving enemies
- The palm properly transitions to the "attached" phase when it reaches an enemy
- If no enemies are in range, the palm behaves as before, flying in the direction the player is facing