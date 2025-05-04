# GPU Enabled Indicator and Opacity Update

## Overview
Added a "GPU Enabled" indicator below the memory stats and updated all performance statistics elements to have low opacity (0.2) by default, increasing to full opacity on hover for better UI integration.

## Changes Implemented

### 1. Added GPU Enabled Indicator
- Created a new "GPU Enabled" indicator positioned below the memory stats
- Made it clickable to display detailed GPU information
- Styled to match the existing UI aesthetic
- Connected to the same GPU info panel as the original GPU indicator

### 2. Updated Opacity for All Stats Elements
- Set default opacity to 0.2 for all performance stats elements:
  - FPS counter (Stats.js)
  - Memory display
  - GPU indicator
  - New GPU Enabled indicator
- Added hover effects to increase opacity to 1.0 when the user interacts with any element
- Added smooth transitions for opacity changes

### 3. UI Integration
- Updated the performance stats toggle in options menu to include the new GPU Enabled indicator
- Ensured consistent styling across all performance indicators
- Maintained all existing functionality while improving the visual integration

## Technical Implementation
- Added event listeners for hover and click interactions
- Used CSS transitions for smooth opacity changes
- Positioned the new indicator appropriately in the UI hierarchy
- Maintained the same information display as the original GPU indicator

## Benefits
- Less intrusive performance stats that don't distract from gameplay
- Improved UI aesthetics with subtle indicators that become more visible when needed
- Additional access point to GPU information for users
- Consistent visual language across all performance indicators