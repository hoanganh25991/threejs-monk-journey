# Reverse Palm Direction Implementation

## Task Completed
Successfully reversed the direction of the Exploding Palm skill effect by 180 degrees, making it fly backward instead of forward.

## Changes Made

1. **Initial Positioning**:
   - Changed the palm's initial position to be behind the hero instead of in front
   - Used a negative multiplier (`-1.2`) for the direction vector to place it in the opposite direction

2. **Movement Direction**:
   - Reversed the movement direction in the `updateMarkEffect` method
   - Applied a negative multiplier to the movement vector (`-moveDistance`)

3. **Rotation Adjustments**:
   - Added 180 degrees (Math.PI) to all rotation angles to make the palm face the correct direction
   - Updated the palm group and effect group rotations to match the new direction

4. **Log Messages**:
   - Updated log messages to reflect the new behavior

## Technical Details
- The palm now spawns behind the hero and flies backward
- Auto-targeting still works, but the palm approaches enemies from the opposite direction
- All visual effects and animations remain intact, just with reversed direction

## Testing
The changes should be tested in-game to ensure:
- The palm spawns in the correct position
- Movement is smooth in the reversed direction
- Targeting and collision detection work properly
- Visual effects appear correct with the new orientation