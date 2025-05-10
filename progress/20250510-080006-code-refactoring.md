# Code Refactoring for Loading Progress

## Summary
Refactored the code in `initial-load-progress.js` to improve maintainability by extracting common functionality into separate utility functions. This makes the code more modular, easier to maintain, and reduces duplication.

## Changes Made

1. **Extracted File Categorization Logic**
   - Created a new utility function `getCategoryFromExtension()` that determines a file's category based on its extension
   - Added support for capitalization option to make the function more versatile

2. **Extracted Size Estimation Logic**
   - Created a new utility function `getEstimatedSizeForCategory()` that provides size estimates based on file category
   - Normalized category names for consistent comparison

3. **Updated Existing Functions**
   - Modified `getFileInfo()` and `updateCategoryProgress()` to use the new utility functions
   - Added JSDoc comments to improve code documentation

## Benefits

- **Reduced Code Duplication**: The same categorization logic was previously duplicated in multiple places
- **Improved Maintainability**: Changes to categorization or size estimation only need to be made in one place
- **Better Documentation**: Added JSDoc comments to clarify function purposes and parameters
- **More Consistent Behavior**: Ensures consistent categorization across different parts of the code

## Technical Details

The refactoring focused on extracting two key pieces of functionality:

1. **File Categorization**: Determining which category a file belongs to based on its extension
2. **Size Estimation**: Providing reasonable size estimates for files not found in `file-sizes.json`

These functions are now centralized, making future updates easier and reducing the risk of inconsistencies.