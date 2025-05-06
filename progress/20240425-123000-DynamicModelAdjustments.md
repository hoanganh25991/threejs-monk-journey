# Dynamic Model Adjustments Feature

## Overview
This feature adds the ability to dynamically adjust character model properties including baseScale, size multiplier, position, and rotation. It provides both programmatic control and a user interface for making these adjustments in real-time.

## Implementation Details

### 1. Enhanced PlayerModel Class
- Added methods to dynamically set and get preview position and rotation
- Improved baseScale and sizeMultiplier methods to update the model configuration
- Added model-specific adjustments that apply default settings based on model type
- Implemented loading of saved adjustments when switching models

### 2. Model Adjustment UI Panel
- Created a comprehensive UI panel for adjusting model properties
- Added sliders for baseScale and sizeMultiplier
- Added position controls (X, Y, Z) with real-time updates
- Added rotation controls (X, Y, Z) with real-time updates
- Implemented save functionality to persist adjustments to localStorage

### 3. Integration with Game Systems
- Connected the model adjustment system with the game's UI manager
- Added automatic loading of saved adjustments when switching models
- Implemented fallback to default adjustments when no saved settings exist

## Usage

### Programmatic Usage
```javascript
// Set base scale
player.model.setBaseScale(3.0);

// Set size multiplier
player.model.setSizeMultiplier(1.5);

// Set preview position
player.model.setPreviewPosition({ x: 0, y: 2.0, z: 0 });

// Set preview rotation
player.model.setPreviewRotation({ x: 0, y: 0, z: 0 });
```

### UI Usage
1. Click the "Adjust Model" button in the top-right corner of the screen
2. Use the sliders to adjust baseScale and sizeMultiplier
3. Use the position controls to adjust X, Y, Z position
4. Use the rotation controls to adjust X, Y, Z rotation
5. Click "Save Adjustments" to persist your changes

## Benefits
- Allows for precise positioning of models to ensure they appear correctly on the terrain
- Enables customization of model size for better visibility or aesthetic preferences
- Provides a way to fix model-specific issues (like the Knight being partially underground)
- Saves adjustments per model type, so each character can have its own optimal settings

## Future Enhancements
- Add presets for quick application of common adjustments
- Implement model-specific animation adjustments
- Add export/import functionality for sharing adjustments between players
- Integrate with a model editor for more advanced customization