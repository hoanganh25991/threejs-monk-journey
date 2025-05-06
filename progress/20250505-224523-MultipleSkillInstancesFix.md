# Multiple Skill Instances Fix

## Problem
The skill system was designed to clean up existing instances of a skill when a new one was created, preventing multiple instances of the same skill from existing simultaneously. This limited the player's ability to create multiple skill effects at once.

## Solution
Modified the skill system to:
1. Create a new skill instance each time a skill is used
2. Allow multiple instances of the same skill to exist simultaneously
3. Remove all code that forced cleanup of existing skill instances

### Changes Made:
1. Added import for `SkillEffectFactory` in `PlayerSkills.js`
2. Modified the `useSkill` method to:
   - Use the original skill as a template
   - Create a new skill instance with the same properties
   - Create a new effect handler for the new skill instance
   - Add the new skill instance to the active skills array
   - Removed code that cleaned up existing instances of the same skill

3. Modified the `useBasicAttack` method to follow the same pattern

4. Removed all code that limited the number of active skills:
   - Removed forced cleanup for skills that were being spammed
   - Removed limits on the number of skills of the same type
   - Removed limits on the number of skills of the same name

5. Added logging to track multiple instances of the same skill

## Benefits
- Players can now create multiple instances of the same skill
- Each skill instance has its own independent lifecycle
- Skills only clean up when they naturally expire at the end of their duration
- Improved gameplay flexibility by allowing skill effects to stack

## Testing
The changes should be tested by:
1. Using the same skill multiple times in quick succession
2. Verifying that multiple instances appear and remain active
3. Checking that each instance expires independently at the end of its duration