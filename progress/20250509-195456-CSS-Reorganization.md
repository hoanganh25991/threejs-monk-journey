# CSS Reorganization

## Task Summary
Reorganized CSS elements by moving them to their appropriate files:
1. Moved `#loading-screen` styles from `layout.css` to a new `loading-screen.css` file
2. Moved `#inventory` styles from `layout.css` to `hud-manager.css`
3. Moved `#gpu-info-panel` and related GPU indicator styles from `layout.css` to a new `performance-manager.css` file

## Files Created
- `/Users/anhle/work-station/diablo-immortal/css/core/loading-screen.css`
- `/Users/anhle/work-station/diablo-immortal/css/core/performance-manager.css`

## Files Modified
- `/Users/anhle/work-station/diablo-immortal/css/core/layout.css`
- `/Users/anhle/work-station/diablo-immortal/css/core/hud-manager.css`
- `/Users/anhle/work-station/diablo-immortal/css/main.css`

## Changes Made
1. Created new CSS files for specific components
2. Removed the moved styles from `layout.css` and added comments indicating where they were moved
3. Added the new CSS files to the imports in `main.css`
4. Added `#inventory` styles to `hud-manager.css`

This reorganization improves code organization by grouping related styles together in their own files, making the codebase more maintainable and easier to navigate.