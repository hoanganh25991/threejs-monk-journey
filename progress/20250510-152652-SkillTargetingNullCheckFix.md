# Skill Targeting Null Check Fix

## Issue
When using skills with the Digit1 key (or other skill keys) without any enemies in range, the game was throwing an error:
```
TypeError: Cannot read properties of null (reading 'type')
    at PlayerSkills.useSkill (PlayerSkills.js:256:55)
    at Player.useSkill (Player.js:163:28)
    at InputHandler.update (InputHandler.js:520:46)
    at Game.animate (Game.js:357:27)
    at Game.js:337:42
```

## Root Cause
In the `PlayerSkills.js` file, when a skill is used without any enemies in range, the `targetEnemy` variable is null. However, on line 256, the code was trying to access `targetEnemy.type` without checking if `targetEnemy` was null first.

## Solution
Added a null check before accessing the `targetEnemy.type` property:

```javascript
// Before
console.log(`Auto-targeting ${targetEnemy.type} with ${skillTemplate.name}`);

// After
if (targetEnemy) {
    console.log(`Auto-targeting ${targetEnemy.type} with ${skillTemplate.name}`);
} else {
    console.log(`Using ${skillTemplate.name} without a target`);
}
```

This change ensures that the game doesn't crash when using skills without any enemies in range, and it provides better logging information about the skill usage.

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/entities/player/PlayerSkills.js`