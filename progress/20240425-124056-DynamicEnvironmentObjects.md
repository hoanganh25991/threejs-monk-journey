# Dynamic Environment Objects Implementation

## Overview
This update implements a system for dynamically generating and managing environmental objects (trees, rocks, bushes, flowers) throughout the entire game world. As the player explores, the environment will be populated with various objects that persist between visits to the same area.

## Key Features
1. **Persistent Environment Objects**: Objects are tracked by chunk and restored when revisiting areas
2. **Varied Object Types**: Added new object types including bushes and flowers
3. **Memory Efficient**: Objects are removed from the scene when not visible but their data is preserved
4. **Consistent Generation**: Using seeded random generation ensures the same objects appear in the same locations
5. **Varied Visuals**: Multiple variations of each object type for visual diversity

## New Object Types
1. **Bushes**: Clusters of spheres with varied sizes and positions to create natural-looking bushes
2. **Flowers**: Various flower types including daisies, tulips, and multi-petal flowers with different colors

## Technical Implementation
1. Enhanced the World class with:
   - Tracking system for environment objects by chunk
   - Methods to generate, store, and restore environment objects
   - Improved object density settings for different object types

2. Added new object creation methods:
   - `createBush()`: Creates varied bush shapes using sphere clusters
   - `createFlower()`: Creates different flower types with varied colors and shapes

3. Modified chunk management:
   - `generateChunkObjects()`: Now handles environment objects separately from structures
   - `removeChunkObjects()`: Removes objects from scene but preserves their data
   - `restoreEnvironmentObjects()`: Restores previously generated objects when revisiting areas

## Gameplay Impact
- The world feels more alive and detailed with varied vegetation
- Areas maintain their unique character when revisited
- The environment feels consistent and persistent throughout gameplay
- Exploration is more rewarding with visually diverse landscapes

## Future Improvements
- Add biome-specific environment objects (desert plants, snow-covered trees, etc.)
- Implement seasonal variations of environment objects
- Add interactive environment objects (harvestable plants, breakable rocks)
- Create wildlife that moves through the environment