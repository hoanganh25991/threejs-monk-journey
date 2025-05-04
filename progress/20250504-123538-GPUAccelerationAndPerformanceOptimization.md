# GPU Acceleration and Performance Optimization

## Overview
This update adds comprehensive GPU acceleration and performance optimization to the game, including:
- FPS counter in the top-right corner
- Dynamic quality adjustment based on performance
- Performance settings in the options menu
- Optimized rendering for better performance on medium-spec devices

## Implementation Details

### 1. Performance Manager
Created a new `PerformanceManager` class that:
- Monitors FPS in real-time
- Dynamically adjusts quality settings to maintain target FPS
- Provides quality presets (minimal, low, medium, high, ultra)
- Optimizes GPU and CPU usage

### 2. GPU Acceleration
- Enabled WebGL optimizations with `powerPreference: 'high-performance'`
- Optimized shadow rendering with proper shadow map types
- Implemented frustum culling for off-screen objects
- Adjusted material precision based on device capability
- Optimized texture handling and geometry processing

### 3. Dynamic Draw Distance
- Added variable draw distance based on performance
- Implemented fog density adjustment to match draw distance
- Optimized terrain chunk loading based on performance level

### 4. UI Enhancements
- Added FPS counter to the top-right corner
- Added performance settings to the options menu:
  - Quality preset selector
  - Adaptive quality toggle
  - Target FPS slider (30-60 FPS)

### 5. Optimization Techniques
- Reduced shadow map size on lower quality settings
- Disabled shadows completely on minimal settings
- Adjusted pixel ratio based on quality level
- Optimized material properties for better performance
- Implemented proper object culling and LOD (Level of Detail)

## Benefits
- Smoother gameplay on medium-spec devices
- Consistent frame rate through adaptive quality
- User control over performance vs. quality tradeoff
- Better battery life on mobile devices through optimized rendering
- Improved overall game responsiveness

## Technical Notes
- The performance manager uses a rolling average of frame times for stability
- Quality adjustments happen gradually to prevent jarring visual changes
- The system is designed to be non-intrusive and work in the background
- All optimizations are compatible with the existing game architecture