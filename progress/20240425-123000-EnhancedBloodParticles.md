# Enhanced Blood Particle System Implementation

## Overview
This update significantly enhances the blood particle system in the game by implementing a mix of cube-shaped and other geometries for more realistic blood effects. The implementation dynamically adjusts particle count, appearance, and behavior based on damage amount, creating more visually impressive bleeding effects.

## Files Modified
1. `/js/core/ParticleManager.js` - Enhanced the blood particle system with multiple geometries and behaviors
2. `/js/entities/Player.js` - Updated to pass damage information to the particle system
3. `/js/entities/Enemy.js` - Updated to pass damage information to the particle system

## Key Improvements

### 1. Multiple Particle Geometries
- Added cube geometry (BoxGeometry) as the primary particle shape for chunky blood particles (50%)
- Added elongated box geometry for blood streaks (30%)
- Kept sphere geometry for blood droplets (20%)
- Each geometry provides a different visual characteristic to the blood particles

### 2. Increased Particle Count
- Increased the default blood particle count from 100 to 250
- Implemented dynamic particle count based on damage amount:
  - Low performance mode: 5-15 particles
  - Normal mode: 10-35 particles
  - Scales with damage (more damage = more particles)

### 3. Multiple Material Types
- Implemented three different shades of red for more realistic blood appearance:
  - Standard blood red (0xaa0000)
  - Darker blood (0x880000)
  - Brighter blood (0xcc0000)
- Material selection based on damage amount (higher damage = brighter red)

### 4. Damage-Based Particle Distribution
- Higher damage creates more cube particles (chunks of blood)
- Medium damage creates a balanced mix
- Lower damage creates more droplets and fewer chunks

### 5. Advanced Particle Behavior
- Added rotation to particles with individual rotation speeds
- Implemented non-uniform scaling for more realistic shapes
- Created specialized behavior for each particle type:
  - Cubes: Slower rotation, more gravity influence
  - Streaks: Aligned with movement direction, less gravity influence
  - Droplets: Faster rotation, more gravity influence

### 6. Performance Optimizations
- Added distance-based culling to remove particles far from the player
- Implemented batch processing for particle updates
- Added low-performance mode toggle for devices with limited resources

### 7. Visual Enhancements
- Different size reduction patterns for each particle type
- Varied gravity effects for different particle types
- Random movement variations for more chaotic and realistic blood splatter
- Specialized initial positioning and trajectories for each particle type

## Technical Implementation
The implementation uses THREE.js InstancedMesh for efficient rendering of many similar particles. The system is divided into primary (cube) and secondary (streak and droplet) particle groups, each with their own update logic and appearance characteristics.

## Future Improvements
Potential future enhancements could include:
- Surface interaction (particles sticking to walls/floor)
- Pooling system for better memory management
- Particle collision detection
- Blood trail effects for moving wounded entities