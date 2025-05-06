# Seven-Sided Strike Enhancement

## Task
Enhance the Seven-Sided Strike skill to make it more dynamic and faster, matching the description "Rapidly attack multiple enemies".

## Implementation Details

The Seven-Sided Strike skill has been enhanced to create a more dynamic and faster visual effect. The following changes were made:

1. **Increased Strike Speed**:
   - Added a `strikeSpeedMultiplier` (1.8x) to make all strikes happen faster
   - Modified the strike duration calculation to incorporate this multiplier
   - Ensured no strikes are skipped when the speed is increased

2. **Enhanced Visual Effects**:
   - Faster flash effects with higher intensity
   - Increased vortex rotation speed (from 2.0 to 3.5)
   - Faster pulse animations for strike markers
   - Shorter visibility duration for monk clones to match the faster pace

3. **Added Dynamic Animations**:
   - Implemented arm movement animations for monk clones
   - Added attack speed parameter to control animation speed
   - Enhanced flash effects with pulsing intensity

4. **Code Improvements**:
   - Extracted strike logic into a separate `_performStrike` method
   - Added handling for multiple strikes in a single frame
   - Improved animation timing and transitions

## Technical Changes

1. Added `strikeSpeedMultiplier` property to the `SevenSidedStrikeEffect` class
2. Modified strike duration calculation: `(this.skill.duration / this.skill.hits) / this.strikeSpeedMultiplier`
3. Enhanced monk animation with dynamic arm movements
4. Added intensity parameter to flash effects
5. Increased animation speeds for all visual elements
6. Implemented multi-strike handling for very fast frame rates

## Result

The Seven-Sided Strike skill now appears much more dynamic and rapid, with monk clones appearing and attacking faster. The visual effect better matches the skill description "Rapidly attack multiple enemies" and provides a more exciting combat experience.