# Enhanced Blood Particles Implementation

## Overview
This update significantly enhances the blood particle system in the game, creating more realistic and visually impressive bleeding effects. The implementation uses multiple geometries, materials, and advanced particle behaviors to create a more dynamic and immersive experience.

## Key Improvements

### 1. Multiple Particle Geometries
- Added cube geometry (BoxGeometry) as the primary particle shape
- Included sphere and tetrahedron geometries for variety
- Each geometry provides a different visual characteristic to the blood particles

### 2. Increased Particle Count
- Increased the default blood particle count from 100 to 250
- Added support for more particles per bleeding effect (from 15 to 30 in normal mode)

### 3. Multiple Material Types
- Implemented three different shades of red for more realistic blood appearance
- Added varying opacity levels to create depth in the blood splatter

### 4. Advanced Particle Behavior
- Added rotation to particles with individual rotation speeds
- Implemented secondary particle groups with different behaviors
- Created more varied movement patterns with randomized trajectories

### 5. Performance Optimizations
- Added distance-based culling to remove particles far from the player
- Implemented batch processing for particle updates
- Added low-performance mode toggle for devices with limited resources

### 6. Visual Enhancements
- More dramatic size reduction over particle lifetime
- Varied gravity effects for different particle types
- Random movement variations for more chaotic and realistic blood splatter

## Technical Implementation
The implementation uses THREE.js InstancedMesh for efficient rendering of many similar particles. The system is divided into primary and secondary particle groups, each with their own update logic and appearance characteristics.

## Future Improvements
Potential future enhancements could include:
- Surface interaction (particles sticking to walls/floor)
- Pooling system for better memory management
- Particle collision detection
- Blood trail effects for moving wounded entities