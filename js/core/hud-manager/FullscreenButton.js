/**
 * FullscreenButton.js
 * Manages the fullscreen button UI component
 */

import { UIComponent } from '../UIComponent.js';

export class FullscreenButton extends UIComponent {
    /**
     * Create a fullscreen button
     * @param {Game} game - The game instance
     */
    constructor(game) {
        super('fullscreen-button', game);
        this.isFullscreen = false;
        
        this.init();
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Show the button initially if game is running
        if (this.game.isRunning) {
            this.show();
        } else {
            this.hide();
        }
        
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
        // TODO: enable when Game.restart implemented
        return;
        if (this.container) {
            // Add click event to toggle fullscreen
            this.container.addEventListener('click', () => {
                this.toggleFullscreen();
                console.debug("Fullscreen button clicked - toggling fullscreen mode");
            });
            
            // Add event listener to show/hide fullscreen button based on game state
            this.game.addEventListener('gameStateChanged', (state) => {
                if (state === 'running') {
                    // Show fullscreen button when game is running
                    this.show();
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
            
            // Listen for fullscreen change events
            document.addEventListener('fullscreenchange', () => {
                this.updateFullscreenButtonIcon();
            });
            document.addEventListener('webkitfullscreenchange', () => {
                this.updateFullscreenButtonIcon();
            });
            document.addEventListener('mozfullscreenchange', () => {
                this.updateFullscreenButtonIcon();
            });
            document.addEventListener('MSFullscreenChange', () => {
                this.updateFullscreenButtonIcon();
            });
        }
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        // Set a flag to prevent game from pausing during fullscreen change
        window.isFullscreenChange = true;
        
        // Clear the flag after a short delay
        setTimeout(() => {
            window.isFullscreenChange = false;
        }, 1000); // 1 second should be enough for the transition
        
        if (!document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement) {
            // Enter fullscreen
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen();
            } else if (docEl.mozRequestFullScreen) { // Firefox
                docEl.mozRequestFullScreen();
            } else if (docEl.webkitRequestFullscreen) { // Chrome, Safari and Opera
                docEl.webkitRequestFullscreen();
            } else if (docEl.msRequestFullscreen) { // IE/Edge
                docEl.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
        }
    }
    
    /**
     * Update the fullscreen button icon based on current fullscreen state
     */
    updateFullscreenButtonIcon() {
        const isInFullscreen = document.fullscreenElement ||
                              document.mozFullScreenElement ||
                              document.webkitFullscreenElement ||
                              document.msFullscreenElement;
        
        if (isInFullscreen) {
            // In fullscreen mode, show exit fullscreen icon (smaller square)
            this.container.innerHTML = '⤦'; // Unicode U+2926 (South East Arrow to Corner)
            this.container.title = 'Exit Fullscreen';
        } else {
            // Not in fullscreen mode, show enter fullscreen icon (larger square)
            this.container.innerHTML = '⛶'; // Unicode U+26F6 (Square Four Corners)
            this.container.title = 'Enter Fullscreen';
        }
    }

    /**
     * Show the fullscreen button
     * Overrides the parent class method
     */
    show() {
        // Call the parent class method
        super.show();
    }

    /**
     * Hide the fullscreen button
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
    }
}