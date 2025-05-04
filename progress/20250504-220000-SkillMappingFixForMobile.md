# Skill Mapping Fix for Mobile Devices

## Issues Fixed
1. Fixed an issue where on mobile devices with a 2-row skill layout, pressing skill button 1 would incorrectly cast skill 2. This mismatch between the visual layout and the actual skill casting was causing confusion for mobile users.
2. Fixed a follow-up issue where pressing a single key would sometimes trigger multiple skills to cast simultaneously.
3. Fixed a persistent issue where pressing key '1' would cast both skill 1 and skill 2, and pressing 'h' would cast both the basic attack and skill 1.
4. Fixed a final issue where continuous skill casting (holding down a key) was using incorrect skill indices, causing skills to be cast out of order.

## Technical Details

### Problem Analysis
- On desktop, skills are displayed in a single row and the mapping is straightforward
- On mobile, skills are arranged in a 2-row grid:
  * Top row: Skills 4, 5, 6, 7
  * Bottom row: Skills 1, 2, 3, h (primary)
- When pressing numeric keys on mobile, the index mapping was incorrect, causing skill 1 to cast skill 2, etc.
- The initial fix introduced a bug where pressing a single key would sometimes trigger multiple skills due to conflicting mapping logic.
- A deeper analysis revealed that the basic attack (Fist of Thunder) was being incorrectly referenced in multiple places:
  * It was defined as the last skill in the array (index 7) with the `basicAttack: true` property
  * But the `useBasicAttack()` method was using the first skill (index 0) by default
  * This caused both skills to be cast when either key was pressed
- The continuous casting system in the InputHandler.js update method was not converting the 1-based key digit to a 0-based skill index, causing it to use the wrong skills when holding down a key.

### Solution Implemented
1. Simplified the skill index mapping to use a consistent approach across all devices
2. Removed device-specific mapping logic that was causing duplicate skill activations
3. Ensured that numeric keys (1-7) always map directly to skills 0-6 (zero-indexed) regardless of device
4. Fixed the `useBasicAttack()` method to properly find and use the skill marked with `basicAttack: true`
5. Updated the UI click handlers to use different methods for basic attack vs. regular skills
6. Fixed the continuous casting system to properly convert from 1-based key digits to 0-based skill indices
7. Added detailed logging to help with debugging and verification

### Code Changes
- Simplified the key handling in InputHandler.js to use a consistent mapping for all devices
- Updated the Player.js `useBasicAttack()` method to properly find the skill with `basicAttack: true`
- Modified the HUDManager.js click event handlers to use different methods based on skill type
- Fixed the InputHandler.js update method to properly convert key digits to skill indices for continuous casting
- Streamlined the getVisualPositionInGrid method to only be used for debugging
- Enhanced logging to show both the key pressed and the actual skill index used

## Benefits
- Consistent skill activation across all devices
- Completely eliminated the bug where multiple skills would activate from a single key press
- Fixed continuous casting to use the correct skills when holding down a key
- Improved user experience on mobile devices
- Intuitive mapping where pressing key 1 always activates skill 1, and 'h' always activates the basic attack
- Simplified code that is easier to maintain
- Clear separation between basic attack and regular skills

This fix ensures that the skill casting behavior matches user expectations on both desktop and mobile devices, providing a more intuitive and consistent gameplay experience without any unintended side effects.