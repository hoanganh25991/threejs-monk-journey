# Model Position Adjustment Configuration

## Task Description
Moved model-specific position adjustments from the PlayerModel.js switch case to the player-models.js configuration file.

## Changes Made

1. Updated the `player-models.js` configuration file:
   - Added a `defaultAdjustments` property to each model configuration
   - This property contains position and rotation adjustments for each model
   - Transferred existing adjustments for 'knight' and 'skeleton' models
   - Added default (0,0,0) adjustments for all other models

2. Modified the `PlayerModel.js` file:
   - Removed the switch case that was handling model-specific position adjustments
   - Updated the code to use the `defaultAdjustments` from the model configuration
   - Improved logging to show that adjustments are coming from the configuration

## Benefits

1. **Centralized Configuration**: All model-specific adjustments are now in one place
2. **Easier Maintenance**: Adding new models or adjusting existing ones is simpler
3. **Cleaner Code**: Removed conditional logic from PlayerModel.js
4. **Better Separation of Concerns**: Configuration data is now separate from implementation logic

## Testing

The changes maintain the same functionality but with a more maintainable structure:
- Knight model will still be raised by 2.0 units on the Y-axis
- Skeleton model will still be raised by 0.5 units on the Y-axis
- Other models will maintain their default positions
- The system still respects saved adjustments when they exist

## Future Improvements

- Consider adding more detailed adjustments for other models as needed
- Potentially add a UI for adjusting these values in-game