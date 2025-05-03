# Diablo Immortal Enhancements and Fixes

## Summary of Changes

This update addresses several issues and implements enhancements from the todo list:

### 1. Fixed Skill Cleanup Issue
- Improved skill cleanup when spamming skills by reducing the cleanup threshold from 150% to 110% of skill duration
- Added immediate cleanup of older instances of the same skill when a new one is cast
- Reduced the maximum number of skills of the same type from 3 to 2 to limit visual clutter
- Implemented a comprehensive resource disposal system in the `remove()` method to ensure all THREE.js resources are properly cleaned up
- Increased default duration of all skills to provide better visual feedback

### 2. Enhanced Notification System
- Limited notifications to take up only 1/5 of the screen height
- Implemented automatic compression of notifications when there are too many
- Added deduplication of notifications to reduce clutter
- Improved notification styling and positioning
- Added faster cleanup of duplicate messages
- Implemented smooth transitions for notifications

### 3. Blood Particle Effect for Damage
- Replaced numeric damage indicators with blood particle effects
- Implemented dynamic particle count and color based on damage amount
- Added screen flash effect for high damage hits
- Created realistic particle movement with gravity and spread
- Optimized particle cleanup to prevent memory leaks

### 4. UI Improvements
- Moved health and mana bars to the top left corner
- Added player portrait and name
- Implemented absolute health/mana values display (current/max)
- Enhanced health bar with color changes based on health percentage
- Improved overall UI layout and styling

### 5. Wave of Light Skill Enhancement
- Added configuration options for the bell size in the Wave of Light skill
- Implemented proportional scaling of all bell components
- Adjusted animation speeds and effects based on bell size
- Improved visual effects and particle systems

## Technical Improvements
- Optimized memory usage by properly disposing of THREE.js resources
- Improved code organization with helper methods
- Enhanced animation systems for smoother transitions
- Added safeguards against potential errors

These changes significantly improve the visual quality and user experience of the game while fixing critical issues with skill cleanup and UI clutter.