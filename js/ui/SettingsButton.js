/**
 * SettingsButton.js
 * Manages the settings button UI component
 */

import { SettingsMenu } from './SettingsMenu.js';
import { UIComponent } from './UIComponent.js';

export class SettingsButton extends UIComponent {
    /**
     * Create a settings button
     * @param {Game} game - The game instance
     */
    constructor(game) {
        super('settings-button', game);
        this.settingsMenu = null;
        
        this.init();
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        this.setupEventListeners();
        return true;
    }
    
    /**
     * Update the component
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // No update logic needed for this component
    }

    /**
     * Set up event listeners
     * @private
     */
    setupEventListeners() {
        if (this.container) {
            // Add click event to show settings menu
            this.container.addEventListener('click', () => {
                // Pause the game
                this.game.pause();
                
                // Show the main background when opening settings
                if (this.game.uiManager && this.game.uiManager.mainBackground) {
                    this.game.uiManager.mainBackground.show();
                }
                
                // Show settings menu
                if (!this.settingsMenu) {
                    this.settingsMenu = new SettingsMenu(this.game);
                }
                this.settingsMenu.show(null, true);
                
                console.log("Settings button clicked - game paused and settings menu opened");
            });
            
            // Add event listener to show/hide settings button based on game state
            this.game.addEventListener('gameStateChanged', (state) => {
                console.log('Game state changed:', state);
                if (state === 'running') {
                    // Show settings button when game is running
                    this.show();
                    
                    // Hide the main background when game is running
                    if (this.game.uiManager && this.game.uiManager.mainBackground) {
                        this.game.uiManager.mainBackground.hide();
                    }
                } else if (state === 'paused') {
                    // When paused, only hide if it's not because of the options menu
                    if (!document.getElementById('main-options-menu') || 
                        document.getElementById('main-options-menu').style.display === 'none') {
                        this.hide();
                    } else {
                        // Keep button visible when options menu is open
                        this.show();
                    }
                } else if (state === 'menu') {
                    this.hide();
                }
            });
        }
    }

    /**
     * Show the settings button
     * Overrides the parent class method
     */
    show() {
        // Call the parent class method
        super.show();
    }

    /**
     * Hide the settings button
     * Overrides the parent class method
     */
    hide() {
        // Call the parent class method
        super.hide();
    }

    /**
     * Clean up resources
     * Overrides the parent class method
     */
    dispose() {
        // Call the parent class dispose method
        super.dispose();
        
        if (this.settingsMenu) {
            this.settingsMenu.dispose();
        }
        
        this.settingsMenu = null;
    }
}