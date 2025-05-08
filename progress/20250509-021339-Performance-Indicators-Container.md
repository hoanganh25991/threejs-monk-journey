# Performance Indicators Container Refactoring

## Changes Made

Refactored the performance indicators to be contained within a parent container element, allowing them to share display properties and styling.

### Before:
```html
<!-- Performance Indicators -->
<div id="gpu-enabled-indicator" class="performance-indicator" style="display: none;">GPU Enabled</div>
<div id="gpu-info-panel" class="performance-panel" style="display: none; position: absolute; top: 0; right: 0; background-color: rgba(0, 0, 0, 0.9); color: #0ff; padding: 10px; font-size: 12px; font-family: monospace; border-radius: 3px 0 0 3px; z-index: 1002; width: 250px;"></div>
```

### After:
```html
<!-- Performance Indicators Container -->
<div id="performance-indicators-container" style="display: none;">
    <!-- Stats.js will be appended here by the PerformanceManager -->
    <div id="memory-display" class="performance-indicator">MEM: 0 MB</div>
    <div id="quality-indicator" class="performance-indicator">Quality: Ultra</div>
    <div id="gpu-enabled-indicator" class="performance-indicator">GPU Enabled</div>
    <div id="gpu-info-panel" class="performance-panel"></div>
</div>
```

## CSS Changes

Created a more structured CSS approach:

```css
/* Container for all performance indicators */
#performance-indicators-container {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1000;
    pointer-events: auto;
}

/* Individual performance indicators */
.performance-indicator {
    position: relative;
    right: 0;
    width: 100px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #0ff;
    font-size: 11px;
    font-family: monospace;
    border-radius: 3px 0 0 3px;
    z-index: 1001;
    opacity: 0.5;
    transition: opacity 0.2s;
    box-sizing: border-box;
    padding: 5px;
    margin-bottom: 5px;
}
```

## JavaScript Changes

Updated all related methods to work with the container:

1. `initializeStatsDisplay()` - Now adds Stats.js to the container instead of the body
2. `createMemoryDisplay()` - Now uses the existing HTML element
3. `createQualityIndicator()` - Now uses the existing HTML element
4. `createGPUIndicator()` - Now uses the existing HTML element

## Benefits

1. **Improved Structure**: All performance indicators are now grouped in a single container
2. **Simplified Display Management**: Show/hide all indicators with a single property change
3. **Consistent Styling**: All indicators share the same CSS classes and positioning
4. **Reduced Code Duplication**: No need to repeat styling for each indicator
5. **Better Maintainability**: Easier to add new indicators in the future
6. **Cleaner DOM**: All performance-related elements are contained in one parent