# SaveManager Skills Fix

## Issue
The game was encountering an error when trying to save:
```
SaveManager.js:94 Error saving game: TypeError: player.skills.map is not a function
    at SaveManager.getPlayerData (SaveManager.js:197:35)
    at SaveManager.saveGame (SaveManager.js:62:30)
    at SaveManager.js:33:18
```

## Root Cause
In the `SaveManager.js` file, it was trying to use `player.skills.map()` directly, assuming that `player.skills` is an array. However, `player.skills` is actually an instance of the `PlayerSkills` class, not an array.

The `PlayerSkills` class has a `skills` property which is an array, but it needs to be accessed through the `getSkills()` method.

## Solution
Modified the `getPlayerData()` method in `SaveManager.js` to use `player.skills.getSkills()` instead of directly trying to map over `player.skills`:

```javascript
// Before:
skills: player.skills.map(skill => ({
    name: skill.name,
    cooldown: skill.cooldown,
    currentCooldown: skill.currentCooldown
}))

// After:
skills: player.skills.getSkills().map(skill => ({
    name: skill.name,
    cooldown: skill.cooldown,
    currentCooldown: skill.currentCooldown
}))
```

This change ensures that we're mapping over the actual array of skills rather than trying to map over the `PlayerSkills` class instance.

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/core/SaveManager.js`