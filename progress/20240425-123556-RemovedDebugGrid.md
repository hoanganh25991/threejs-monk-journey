# Removed Debug Grid

## Overview
This update removes the debug grid helper that was visible in the center of the game world, providing a cleaner and more immersive gameplay experience.

## Changes Made
1. Removed the `GridHelper` from the Game.js file
2. Removed the `AxesHelper` from the Game.js file
3. Replaced the debug helpers with a commented-out log message

## Impact
- The game world now appears more natural without the artificial grid overlay
- Players can explore the world without visual distractions
- The immersion is improved as the debug elements are no longer visible
- Enemy spawning still works throughout the entire world as implemented previously

## Technical Details
The grid helper was previously used during development to provide spatial reference, but is no longer needed for the final gameplay experience. The axes helper (which showed X, Y, Z directions) has also been removed as it was only useful during development.