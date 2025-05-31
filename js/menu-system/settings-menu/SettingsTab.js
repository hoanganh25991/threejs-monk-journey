/**
 * SettingsTab.js
 * Base class for all settings tab UI components
 */

import { UIComponent } from '../../UIComponent.js';
import { SaveOperationProgress } from '../../save-manager/utils/SaveOperationProgress.js';

export class SettingsTab extends UIComponent {
    /**
     * Create a new settings tab
     * @param {string} tabId - ID of the tab
     * @param {import('../../game/Game.js').Game} game - Reference to the game instance
     * @param {SettingsMenu} settingsMenu - Reference to the parent settings menu
     */
    constructor(tabId, game, settingsMenu) {
        super(`${tabId}-tab`, game);
        this.tabId = tabId;
        this.settingsMenu = settingsMenu;
        this.isLoading = false;
        this.tabElement = document.getElementById(`${tabId}-tab`);
    }
    
    /**
     * Initialize the tab
     * @returns {Promise<boolean>} - Promise resolving to true if initialization was successful
     */
    async init() {
        return true;
    }
    
    /**
     * Called when the tab is activated
     */
    onActivate() {
        // To be implemented by child classes
    }
    
    /**
     * Called when the tab is deactivated
     */
    onDeactivate() {
        // To be implemented by child classes
    }
    
    /**
     * Save the tab settings
     * @returns {Promise<boolean>} - Promise resolving to true if save was successful
     */
    async saveSettings() {
        // To be implemented by child classes
        return true;
    }
    
    /**
     * Reset the tab settings to defaults
     * @returns {Promise<boolean>} - Promise resolving to true if reset was successful
     */
    async resetToDefaults() {
        // To be implemented by child classes
        return true;
    }
    
    /**
     * Resize the tab content
     */
    resize() {
        // To be implemented by child classes
    }
    
    /**
     * Set the loading state of the tab
     * @param {boolean} isLoading - Whether the tab is loading
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        if (this.tabElement) {
            if (isLoading) {
                this.tabElement.classList.add('loading');
            } else {
                this.tabElement.classList.remove('loading');
            }
        }
    }
    
    /**
     * Show a loading indicator during an async operation
     * @param {Function} asyncOperation - The async operation to perform
     * @param {string} operationType - Type of operation ('save' or 'load')
     * @param {string} message - Message to display during the operation
     * @returns {Promise<any>} - The result of the async operation
     */
    async withProgress(asyncOperation, operationType = 'load', message = 'Loading settings...') {
        // Create progress indicator
        const progress = new SaveOperationProgress(this.game, operationType);
        
        try {
            // Set loading state
            this.setLoading(true);
            
            // Start progress indicator
            progress.start(message);
            progress.update(message, 30);
            
            // Perform the async operation
            const result = await asyncOperation();
            
            // Update progress
            progress.update(operationType === 'save' ? 'Settings saved!' : 'Settings loaded!', 100);
            
            // Complete the operation
            setTimeout(() => {
                progress.complete();
                this.setLoading(false);
            }, 300);
            
            return result;
        } catch (error) {
            // Show error
            progress.error(`Error ${operationType === 'save' ? 'saving' : 'loading'} settings: ${error.message}`);
            this.setLoading(false);
            throw error;
        }
    }
}