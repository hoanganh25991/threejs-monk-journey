# Skill Hotkeys Update

## Summary
Updated the InputHandler.js file to support 7 skill hotkeys instead of just 4.

## Changes Made
- Modified the keyboard event handler in InputHandler.js to recognize Digit5, Digit6, and Digit7 key presses
- Maintained the existing skill activation logic using the same pattern as the original code
- All 7 skills can now be activated using number keys 1-7

## Technical Details
The change was implemented by adding three additional case statements to the existing switch statement in the keyboard event handler:
```javascript
case 'Digit5':
case 'Digit6':
case 'Digit7':
```

The existing logic for determining the skill index and calling the player's useSkill method remains unchanged, as it already correctly calculates the skill index based on the digit key pressed.

## Testing
The implementation should be tested by:
1. Verifying that all 7 skill hotkeys (1-7) trigger the corresponding skills
2. Ensuring that the skill index is correctly calculated (0-6) for each key press
3. Confirming that the player.useSkill() method receives the correct index value