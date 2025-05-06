# Exploding Palm Skill Update

## Summary
Updated the Exploding Palm skill to use the movement input direction (WASD keys) for targeting, removing the auto-targeting functionality. The palm now starts in front of the hero and moves in the direction of the input keys.

## Changes Made

1. **Input-Based Direction System**
   - Removed the auto-targeting logic that would find and target the nearest enemy
   - **NEW**: Modified the skill to use the movement input direction (WASD keys)
   - **NEW**: The palm now starts in front of the hero instead of behind
   - **FIXED**: Changed the palm to move FORWARD in the input direction
   - **FIXED**: Corrected the rotation angles to ensure proper orientation

2. **Starting Position Improvements**
   - **NEW**: The palm now starts in front of the hero in the direction of movement
   - **NEW**: Added a forward offset to position the palm ahead of the hero
   - Improved the initial positioning logic to match the input direction

3. **Collision Detection Updates**
   - Updated collision detection to store the position where the collision happened
   - Removed the "break" statement to allow the palm to hit multiple enemies in the same frame
   - The palm now continues along its path even after hitting enemies

4. **Explosion Damage Improvements**
   - Added additional logging to track explosion position and enemies hit
   - Added a counter to track how many enemies are affected by the explosion
   - Maintained the damage calculation based on distance from explosion center

5. **Hand Orientation Fixes**
   - Adjusted the hand rotation to ensure it's properly aligned with the direction of travel
   - Added explicit rotation settings to ensure consistent orientation

## Benefits

1. **Intuitive Control**
   - **NEW**: The skill now follows the same direction as the movement keys (WASD)
   - **NEW**: Starting in front of the hero provides better visual feedback
   - Players can aim more precisely by moving in the desired direction
   - The palm travels in a straight line based on input direction

2. **Improved Multi-Target Potential**
   - By removing the auto-targeting that would focus on a single enemy, the skill can now hit multiple enemies along its path
   - This makes the skill more effective for crowd control

3. **Better Visual Feedback**
   - Added logging to provide better feedback about the skill's behavior
   - Makes it easier to debug and understand how the skill is functioning
   - Added direction vector logging to help diagnose orientation issues

## Technical Implementation
The main changes were made in the `MarkSkillEffect.js` file:
1. Updated the `create` method to check for movement input and position the palm in front of the hero
2. Enhanced the `createMarkEffect` method to prioritize movement input direction
3. Modified the `updateMarkEffect` method to continue movement in the input direction
4. Added detailed logging to track input direction and positioning