# MiniMap Enemy Color Fix

## Issue
Enemies were not showing as red on the minimap, instead appearing as white.

## Root Cause
The `Enemy` class did not have the `isEnemy` property set, which is required by the `MiniMapUI` component to identify and color enemies correctly on the minimap.

## Solution
Added the `isEnemy = true` property to the `Enemy` class constructor to ensure enemies are properly identified and displayed as red on the minimap.

## Files Changed
- `/js/entities/Enemy.js`: Added the `isEnemy = true` property to the constructor

## Testing
After this change, enemies should now appear as red dots on the minimap, making them easier to identify and distinguish from other entities.