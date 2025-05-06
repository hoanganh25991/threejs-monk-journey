# Exploding Palm Direction Fix

## Issue
The Exploding Palm skill was not targeting enemies correctly like Wave Strike. While Wave Strike would fly directly to the nearest enemy, the Exploding Palm was flying in the wrong direction.

## Analysis
After examining the code, I found that the Exploding Palm effect was using a different targeting mechanism compared to Wave Strike. The main issue was in the `updateFlyingPhase` method of the `ExplodingPalmEffect.js` file.

Unlike Wave Strike, which properly targets and moves toward the nearest enemy, the Exploding Palm was flying in a straight line based on the initial direction without adjusting its path to home in on the target.

## Changes Made

1. Updated the `updateFlyingPhase` method to implement homing behavior:
   - Added code to calculate the direction to the target enemy
   - Implemented a gradual homing mechanism using `lerp` to smoothly adjust the palm's direction
   - Updated the palm's rotation to match its direction of travel

2. Enhanced the `create` method:
   - Ensured the initial direction is properly stored for both targeted and non-targeted casts
   - Improved code comments for better maintainability

## Results
The Exploding Palm skill now behaves similarly to Wave Strike:
- It properly targets the nearest enemy
- It adjusts its flight path to home in on the target
- The palm rotates to face the direction it's traveling

These changes make the skill more intuitive and effective in combat situations.