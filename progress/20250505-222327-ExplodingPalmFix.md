# Exploding Palm Skill Fix

## Issue
The Exploding Palm skill was not properly flying forward from the hero's position. The palm was being created at the hero's position but wasn't being positioned 10 units ahead as intended.

## Changes Made

1. Fixed the initial positioning of the palm:
   - Added code to position the palm 10 units ahead of the hero in the direction they're facing
   - Added logging to confirm the palm's position

2. Fixed the update method:
   - Corrected the condition to check for the skill name using `this.skill.name` instead of `this.name`
   - Ensured the `distanceTraveled` property is reset to 0 when the skill is created

## Technical Details

The main issue was in the `create` method of the `MarkSkillEffect` class. While there was code to set the palm's rotation correctly, it was missing the code to position the palm ahead of the hero.

Added the following code to position the palm 10 units ahead:
```javascript
// Position the palm 10 units ahead of the hero in the direction they're facing
if (direction) {
  // Calculate the position 10 units ahead in the direction the hero is facing
  const forwardPosition = direction.clone().normalize().multiplyScalar(10);
  // Move the palm group to this position
  this.explodingPalmState.palmGroup.position.add(forwardPosition);
  
  console.log(`Positioned palm 10 units ahead at: ${this.explodingPalmState.palmGroup.position.x.toFixed(2)}, ${this.explodingPalmState.palmGroup.position.y.toFixed(2)}, ${this.explodingPalmState.palmGroup.position.z.toFixed(2)}`);
}
```

Also fixed the condition in the `updateMarkEffect` method to properly check for the skill name:
```javascript
if ((this.skill && this.skill.name === "Exploding Palm") && this.explodingPalmState) {
  // Update logic...
}
```

## Testing
The palm should now:
1. Start 10 units ahead of the hero
2. Continue flying forward from that position
3. Properly track its distance traveled