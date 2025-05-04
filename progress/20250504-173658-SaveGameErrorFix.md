# Save Game Error Fix

## Issue
The game was encountering an error when trying to save:
```
Error saving game: TypeError: Cannot read properties of undefined (reading 'filter')
at SaveManager.getWorldMetadata (SaveManager.js:225:42)
at SaveManager.saveGame (SaveManager.js:67:33)
at SaveManager.js:32:18
```

## Root Cause
In the `SaveManager.js` file, the `getWorldMetadata()` method was trying to access properties directly from the `world` object, but these properties are actually stored in their respective manager classes:

1. `world.zones` should be `world.zoneManager.zones`
2. `world.interactiveObjects` should be `world.interactiveManager.interactiveObjects`

Additionally, the code was trying to filter zones with a `discovered` property, but this property doesn't exist in the zone objects.

## Solution
Modified the `getWorldMetadata()` method in `SaveManager.js` to:

1. Use the correct property paths through the manager classes
2. Add null checks to prevent errors when properties don't exist
3. Only filter zones with `discovered === true` (explicit check)
4. Provide fallback empty arrays when properties are undefined

## Changes Made
- Updated `SaveManager.js` to properly access world data through manager classes
- Added defensive programming with null checks and fallbacks
- Fixed property access paths for zones, interactive objects, and terrain chunks

## Testing
The fix should prevent the TypeError when saving the game, allowing the auto-save functionality to work properly.