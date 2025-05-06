# Exploding Palm Skill Effect Fix

## Issue
The Exploding Palm skill was throwing an error:
```
Skill.js:125 Error creating effect for skill Exploding Palm: TypeError: Cannot read properties of undefined (reading 'x')
    at Vector3.copy (three.core.js:8211:14)
    at MarkSkillEffect.createMarkEffect (MarkSkillEffect.js:429:26)
    at MarkSkillEffect.create (MarkSkillEffect.js:27:10)
    at Skill.createEffect (Skill.js:120:47)
    at PlayerSkills.useSkill (PlayerSkills.js:441:39)
    at Player.useSkill (Player.js:148:28)
    at InputHandler.js:159:38
```

## Root Cause
The `createMarkEffect` method in `MarkSkillEffect.js` was not properly using the position and direction parameters passed to it. Instead, it was trying to access `this.position` and `this.direction` properties which don't exist in the `MarkSkillEffect` class.

## Changes Made
1. Updated the `createMarkEffect` method signature to properly accept and use the position and direction parameters
2. Added null checks for position and direction parameters
3. Stored the direction in a class property (`this.currentDirection`) for use in the update method
4. Updated references to `this.direction` in the update method to use `this.currentDirection` instead
5. Fixed a reference to `this.name` that should have been `this.skill.name`

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/entities/skills/MarkSkillEffect.js`

## Testing
The fix should allow the Exploding Palm skill to work correctly without throwing errors. The skill effect should now be created and displayed properly.