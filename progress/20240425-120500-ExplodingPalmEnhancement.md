# Exploding Palm Skill Enhancement

## Changes Made

### 1. Increased Duration and Range
- **Duration**: Increased from 5 seconds to 10 seconds to give more time to observe the palm
- **Range**: Increased from 2 units to 10 units to allow the palm to travel farther
- **Explosion Radius**: Increased from 3 units to 5 units for a more dramatic effect

### 2. Adjusted Movement Speed
- **Flying Speed**: Reduced from 15 units/second to 6 units/second for slower, more visible movement
- **Maximum Distance**: Increased by 50% (now 15 units with the new range value)
- **Explosion Timing**: Changed to occur at 90% of the skill duration (instead of 80%)

### 3. Added Debug Information
- Added progress logging every 2 seconds showing:
  - Percentage of skill duration completed
  - Distance traveled vs. maximum distance
- Added explosion trigger logging showing the reason for explosion:
  - Max distance reached
  - Target hit
  - Duration reached

## Expected Results
The "Exploding Palm" skill should now:
1. Move more slowly through the air, giving you more time to observe it
2. Travel a much greater distance before exploding
3. Create a larger explosion effect when it reaches its destination
4. Provide helpful debug information in the console to track its progress

## How to Test
1. Cast the Exploding Palm skill
2. Watch as the palm moves slowly through the air (should take about 9 seconds before exploding)
3. Observe the explosion effect when it reaches maximum distance or hits a target
4. Check the console for progress updates and explosion trigger information