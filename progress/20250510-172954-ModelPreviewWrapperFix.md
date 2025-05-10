# Model Preview Wrapper Fix

## Issue
The ModelPreview class was creating its own wrapper div dynamically, resulting in two nested divs:
1. The container div specified in the HTML (`model-preview-fullscreen-container`)
2. A dynamically created wrapper div inside the container

This caused confusion and potential styling issues.

## Solution
1. Modified the HTML to include a predefined wrapper div with ID `model-preview-fullscreen-wrapper`
2. Updated the ModelPreview class to check for and use an existing wrapper if available
3. Added CSS styling for the wrapper element
4. Updated the SettingsMenu initialization to work with the new structure

## Changes Made

### 1. Updated index.html
Added a predefined wrapper div inside the container:
```html
<div class="model-preview-fullscreen-section">
    <div id="model-preview-fullscreen-container">
        <div id="model-preview-fullscreen-wrapper" style="width: 100%; height: 100%;"></div>
    </div>
</div>
```

### 2. Modified ModelPreview.js
Updated the constructor to check for and use an existing wrapper:
```javascript
// Check if there's an existing wrapper with ID 'model-preview-fullscreen-wrapper'
const existingWrapper = this.container.querySelector('#model-preview-fullscreen-wrapper');

if (existingWrapper) {
    // Use the existing wrapper
    this.wrapper = existingWrapper;
    this.wrapper.style.width = `${width}px`;
    this.wrapper.style.height = `${height}px`;
} else {
    // Create a wrapper to handle visibility
    this.wrapper = document.createElement('div');
    this.wrapper.style.width = `${width}px`;
    this.wrapper.style.height = `${height}px`;
    this.container.appendChild(this.wrapper);
}
```

### 3. Added CSS for the wrapper
```css
#model-preview-fullscreen-wrapper {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
}
```

## Benefits
- Clearer HTML structure
- More consistent styling
- Better control over the wrapper element
- Reduced confusion about nested divs