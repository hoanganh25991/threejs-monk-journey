# Notification CSS Refactoring

## Overview
Refactored the notification system to use CSS classes instead of inline styles, improving code maintainability and performance.

## Changes Made

1. Created a dedicated CSS file for notifications:
   - Added `/css/core/notifications.css` with proper styling for notification elements
   - Defined styles for notification items and damage numbers

2. Updated the main CSS file:
   - Added import for the new notifications.css file in main.css

3. Modified NotificationsUI.js:
   - Replaced inline styles with CSS class usage
   - Simplified the notification creation code
   - Maintained all existing functionality

## Benefits

- **Improved Performance**: Reduces JavaScript execution time by moving styling to CSS
- **Better Maintainability**: Separates styling concerns from JavaScript logic
- **Consistent Styling**: Ensures notifications have consistent appearance
- **Reduced Code Size**: Eliminates redundant style declarations in JavaScript

## Technical Details

The notification styling was previously defined inline in the `displayNotification` method:

```javascript
// Old approach with inline styles
const notification = document.createElement('div');
notification.style.position = 'absolute';
notification.style.top = '80px';
notification.style.left = '50%';
notification.style.transform = 'translateX(-50%)';
notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
notification.style.color = 'white';
notification.style.padding = '6px 12px';
notification.style.borderRadius = '5px';
notification.style.zIndex = '100';
notification.style.transition = 'opacity 0.3s, top 0.2s';
notification.style.fontSize = '13px';
notification.style.maxWidth = '80%';
notification.style.textAlign = 'center';
notification.style.overflow = 'hidden';
notification.style.textOverflow = 'ellipsis';
notification.style.whiteSpace = 'nowrap';
```

Now replaced with a cleaner approach using CSS classes:

```javascript
// New approach with CSS classes
const notification = document.createElement('div');
notification.className = 'notification-item';
notification.style.top = '80px'; // Only dynamic positioning remains in JS
```

The CSS class definitions are now in a dedicated file, making them easier to maintain and update.