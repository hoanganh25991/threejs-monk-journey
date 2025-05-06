# Terrain Color Lightening

## Summary
Modified the terrain color to be less dark green, making it easier to view. The previous dark green color (0x2d572c) was making the terrain difficult to see clearly.

## Changes Made
1. Updated the base grass color from dark green (0x2d572c) to a lighter green (0x4a9e4a)
2. Updated the dark detail color from 0x1e3b1e to 0x3a7a3a
3. Modified all occurrences in:
   - TerrainManager.js
   - TerrainChunk.js

## Technical Details
- Changed the color values in the `createProceduralTexture` method calls
- Updated the base color in the `colorTerrainUniform` methods
- The new colors maintain the natural grass appearance while being more visible

## Benefits
- Improved visibility of the terrain
- Better contrast with other game elements
- Enhanced overall visual experience
- Easier navigation for players

## Files Modified
- `/js/world/terrain/TerrainManager.js`
- `/js/world/terrain/TerrainChunk.js`