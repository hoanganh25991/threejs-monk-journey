# Shared File Scanning Configuration Implementation

## Summary
Implemented a shared configuration module for file scanning operations across multiple generator scripts. This refactoring centralizes common configuration settings and functions, reducing code duplication and making future maintenance easier.

## Changes Made

1. Created a new shared configuration module:
   - Location: `/scripts/config/file-scan-config.js`
   - Contains shared settings:
     - `directoriesToScan`: Common directories to scan
     - `fileExtensions`: File types to include
     - `alwaysInclude`: Files that should always be included
     - `excludeFiles`: Files/directories to exclude
     - `categorizeFileByExtension()`: Helper function for file categorization

2. Updated the following scripts to use the shared configuration:
   - `/scripts/generate-service-worker.js`
   - `/scripts/generate-file-sizes.js`

3. Refactored file categorization logic in `generate-file-sizes.js` to use the shared helper function.

## Benefits

- **Reduced Duplication**: Eliminated redundant configuration code across multiple files
- **Centralized Management**: Configuration changes can now be made in a single location
- **Consistency**: Ensures all scripts use the same configuration values
- **Maintainability**: Easier to update and extend in the future

## Future Improvements

- Consider adding more shared utility functions for file operations
- Implement configuration validation
- Add documentation for each configuration option