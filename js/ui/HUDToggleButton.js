/**
 * HUD Toggle Button
 * Provides a button to toggle the HUD visibility
 */
export class HUDToggleButton {
    /**
     * Create a new HUD Toggle Button
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;
        this.button = document.getElementById('hud-toggle-button');
        
        // Initialize the button
        this.init();
    }
    
    /**
     * Initialize the HUD toggle button
     */
    init() {
        // If button doesn't exist, create it
        if (!this.button) {
            console.warn('HUD toggle button not found in DOM. It should be created in HTML.');
            return;
        }
        
        // Add click event listener
        this.button.addEventListener('click', () => {
            this.toggleHUD();
        });
        
        // Show the button when game is running
        if (this.game.isRunning) {
            this.show();
        }
    }
    
    /**
     * Toggle the HUD visibility
     */
    toggleHUD() {
        const isVisible = this.game.uiManager.toggleHUD();
        
        // Update button appearance based on HUD visibility
        if (isVisible) {
            this.button.classList.remove('hud-hidden');
            this.button.textContent = '👁️';
        } else {
            this.button.classList.add('hud-hidden');
            this.button.textContent = '👁️‍🗨️';
        }
    }
    
    /**
     * Show the HUD toggle button
     */
    show() {
        if (this.button) {
            this.button.style.display = 'flex';
        }
    }
    
    /**
     * Hide the HUD toggle button
     */
    hide() {
        if (this.button) {
            this.button.style.display = 'none';
        }
    }
}