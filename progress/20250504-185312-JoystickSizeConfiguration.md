# Joystick Size Configuration Enhancement

## Summary
Added configuration options to adjust the virtual joystick size, with a default setting of 80% of the original size. This makes the joystick height match the skills container's two rows, improving the UI layout on mobile devices.

## Changes Made

1. Added joystick configuration to `INPUT_CONFIG` in `InputHandler.js`:
   - Added a new `ui` section with joystick settings
   - Set default `sizeMultiplier` to 0.8 (80% of original size)
   - Stored original base and handle sizes as reference values

2. Modified `createVirtualJoystick()` in `HUDManager.js`:
   - Now uses the configuration values from `INPUT_CONFIG`
   - Applies size multiplier to both the joystick base and handle
   - Sets inline styles for dynamic sizing

3. Updated CSS in `style.css`:
   - Removed fixed width/height values for joystick elements
   - Added comments to indicate that sizes are now set via JavaScript

4. Enhanced the options menu with joystick size controls:
   - Added a UI Settings section with a slider for joystick size
   - Implemented real-time size adjustment (0.5x to 2.0x range)
   - Shows current size multiplier value

## Benefits

1. **Improved Mobile Experience**: The reduced joystick size (80% of original) matches the height of the skills container's two rows, creating a more balanced UI layout.

2. **User Customization**: Players can now adjust the joystick size to their preference through the options menu.

3. **Easy Maintenance**: The configuration system makes it simple to adjust default values in one place.

4. **Real-time Feedback**: Changes to the joystick size are immediately visible while adjusting the slider.

## Technical Implementation

The implementation uses a multiplier-based approach that scales from the original size. This makes it easy to understand the relationship between different size settings (e.g., 1x is original, 2x is double size).

The joystick size configuration is stored in the `INPUT_CONFIG` object, which centralizes all input-related settings in one place, making the code more maintainable.