# MiniMap Enemy Dot Size Reduction

## Issue
Enemy dots on the minimap were too large, making the minimap cluttered and difficult to read.

## Root Cause
The enemy dots were set to a size of 4 pixels, with additional glow and outline effects that made them appear even larger.

## Solution
Made the following changes to reduce the size of enemy dots on the minimap:
1. Reduced the dot size from 4 pixels to 2 pixels
2. Removed the outer glow ring effect
3. Reduced the shadow blur from 6 to 3
4. Decreased the outline width from 1.5 to 1

## Files Changed
- `/js/core/hud-manager/MiniMapUI.js`: Modified the enemy dot rendering to make dots smaller and less obtrusive

## Testing
After this change, enemy dots should appear as small red circles on the minimap, making the map cleaner and easier to read while still allowing enemies to be identified.