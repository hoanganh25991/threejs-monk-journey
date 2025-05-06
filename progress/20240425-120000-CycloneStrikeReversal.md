# Cyclone Strike Effect Reversal

## Task Completed
Modified the Cyclone Strike effect in the AoESkillEffect.js file to reverse the shape of the cyclone. The original implementation had large circles at the bottom that gradually decreased in size towards the top. The new implementation has small circles at the bottom that gradually increase in size towards the top.

## Changes Made

1. **Base Cylinder Modification**:
   - Reduced the base radius to 30% of the original skill radius
   - Modified the cylinder geometry to have a smaller top than bottom

2. **Layer Radius Calculation**:
   - Changed the formula from decreasing radius with height to increasing radius with height
   - Used a multiplier of 2.5 to create a more dramatic widening effect as the cyclone rises

3. **Particle Distribution**:
   - Updated particle positioning to match the new inverted cone shape
   - Particles now spread out more at higher elevations to match the wider top of the cyclone
   - Implemented a height-based distance calculation for particle placement

## Visual Effect

The new cyclone effect now resembles a traditional tornado shape, starting with a narrow base and expanding upward. This creates a more dynamic and visually interesting effect that better matches typical tornado/cyclone representations in games.

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/js/entities/skills/AoESkillEffect.js`