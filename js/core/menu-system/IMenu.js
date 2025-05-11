/**
 * IMenu.js
 * Interface for menu components in the game
 */

/**
 * Interface for menu components
 * @interface
 */
export class IMenu {
    /**
     * Show the menu
     */
    show() {
        throw new Error('Method not implemented');
    }
    
    /**
     * Hide the menu
     */
    hide() {
        throw new Error('Method not implemented');
    }
    
    /**
     * Check if the menu is visible
     * @returns {boolean} True if the menu is visible
     */
    isVisible() {
        throw new Error('Method not implemented');
    }
    
    /**
     * Get the menu type/name
     * @returns {string} The menu type/name
     */
    getType() {
        throw new Error('Method not implemented');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        throw new Error('Method not implemented');
    }
}