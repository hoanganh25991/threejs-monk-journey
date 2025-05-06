# Skill Instance Fix

## Problem
The skill system was using a singleton pattern where the same skill object was reused for multiple activations. This caused issues when creating multiple instances of the same skill, as they would share state. When a skill reached the end of its duration, it would clean up itself, but if a second instance of the skill was created, it would inherit the state from the first instance rather than starting fresh.

## Solution
Modified the skill system to create a new skill instance each time a skill is used, ensuring that each instance has its own independent state and effect handler. This allows multiple instances of the same skill to exist simultaneously without interfering with each other.

### Changes Made:
1. Added import for `SkillEffectFactory` in `PlayerSkills.js`
2. Modified the `useSkill` method to:
   - Use the original skill as a template
   - Create a new skill instance with the same properties
   - Create a new effect handler for the new skill instance
   - Add the new skill instance to the active skills array

3. Modified the `useBasicAttack` method to follow the same pattern:
   - Use the original skill as a template
   - Create a new skill instance when teleporting to an enemy
   - Create a new effect handler for the new skill instance
   - Add the new skill instance to the active skills array

## Benefits
- Each skill instance now has its own independent state
- When a skill expires, it properly cleans up without affecting other instances
- Multiple instances of the same skill can exist simultaneously
- Improved code maintainability and reduced potential for bugs

## Testing
The changes should be tested by:
1. Using the same skill multiple times in quick succession
2. Verifying that each instance behaves independently
3. Checking that when a skill expires, other instances of the same skill continue to function correctly