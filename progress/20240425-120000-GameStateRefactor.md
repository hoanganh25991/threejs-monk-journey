# Game State Refactoring

## Summary
Refactored the game state management in `Game.js` to use only the `isPaused` flag, making `isRunning` a computed property based on `isPaused`. This simplifies the state management and ensures consistency throughout the codebase.

## Changes Made

1. Removed the explicit `isRunning` property from the constructor
2. Added a getter method for `isRunning` that returns `!this.isPaused`
3. Updated the following methods to use only `isPaused`:
   - `start()`: Now only sets `isPaused = false`
   - `pause()`: Now only sets `isPaused = true`
   - `resume()`: Now checks `isPaused` and sets it to `false`
   - `animate()`: Now uses the computed `isRunning` property

4. Improved the animation loop to continue regardless of pause state, but only update game logic when not paused

## Benefits

1. **Simplified State Management**: Only one state variable (`isPaused`) to track
2. **Consistency**: All game state checks now use a single source of truth
3. **Reduced Bugs**: Eliminates potential inconsistencies between `isRunning` and `isPaused`
4. **Better Code Organization**: Uses JavaScript's getter feature for computed properties

## Testing Notes

The game should behave exactly as before, with the following state transitions:
- Game starts with `isPaused = true` (and thus `isRunning = false`)
- `start()` sets `isPaused = false` (making `isRunning = true`)
- `pause()` sets `isPaused = true` (making `isRunning = false`)
- `resume()` sets `isPaused = false` (making `isRunning = true`)
- `togglePause()` toggles `isPaused` (and thus `isRunning` as well)