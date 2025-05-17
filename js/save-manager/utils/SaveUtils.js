/**
 * Utility functions for the save system
 */
export class SaveUtils {
    /**
     * Show a notification if the game is running
     * @param {Object} game - The game object
     * @param {string} message - The notification message
     * @param {number} duration - Duration in milliseconds (optional)
     * @param {string} type - Notification type (optional)
     */
    static showNotification(game, message, duration = 2000, type = 'info') {
        if (game && game.isRunning && game.hudManager) {
            game.hudManager.showNotification(message, duration, type);
        }
    }
    
    /**
     * Log a message with optional console method
     * @param {string} message - The message to log
     * @param {string} level - Log level (log, warn, error, info)
     */
    static log(message, level = 'debug') {
        if (typeof console[level] === 'function') {
            console[level](message);
        } else {
            console.debug(message);
        }
    }
    
    /**
     * Get a safe copy of an object (handles null/undefined)
     * @param {Object} obj - The object to copy
     * @param {Object} defaultValue - Default value if obj is null/undefined
     * @returns {Object} A safe copy of the object
     */
    static safeCopy(obj, defaultValue = {}) {
        if (!obj) {
            return defaultValue;
        }
        
        if (Array.isArray(obj)) {
            return [...obj];
        }
        
        return { ...obj };
    }
    
    /**
     * Safely access a nested property
     * @param {Object} obj - The object to access
     * @param {string} path - The property path (e.g., 'a.b.c')
     * @param {*} defaultValue - Default value if property doesn't exist
     * @returns {*} The property value or default
     */
    static getProperty(obj, path, defaultValue = null) {
        if (!obj || !path) {
            return defaultValue;
        }
        
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return defaultValue;
            }
            current = current[part];
        }
        
        return current !== undefined ? current : defaultValue;
    }
}