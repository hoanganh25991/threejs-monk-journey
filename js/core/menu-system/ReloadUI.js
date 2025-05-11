/**
 * ReloadButton.js
 * A UI component for reloading the game after quality settings changes
 */

import { UIComponent } from '../UIComponent.js';

export class ReloadButton extends UIComponent {
    /**
     * Create a reload button component
     * @param {Game} game - The game instance
     * @param {string} parentContainerId - ID of the parent container to append to
     * @param {string} message - Message to display with the button
     */
    constructor(game, parentContainerId, message = 'Quality settings have been saved. Please reload the game for changes to take full effect.') {
        // Create a unique ID for this instance
        const containerId = `reload-button-container-${Date.now()}`;
        
        // Create container element
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'reload-button-container';
        
        // Append to parent
        const parentContainer = document.getElementById(parentContainerId);
        if (parentContainer) {
            parentContainer.appendChild(container);
        } else {
            console.error(`Parent container with ID "${parentContainerId}" not found.`);
            document.body.appendChild(container);
        }
        
        // Call parent constructor
        super(containerId, game);
        
        this.message = message;
        this.button = null;
        
        // Initialize the component
        this.init();
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Create the button HTML
        const template = `
            <div class="reload-message">${this.message}</div>
            <button id="${this.containerId}-button" class="primary-button">Reload Game</button>
        `;
        
        // Render the template
        this.render(template);
        
        // Get button reference
        this.button = document.getElementById(`${this.containerId}-button`);
        
        // Add click event
        if (this.button) {
            this.button.addEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Show the component
        this.show();
        
        return true;
    }
    
    /**
     * Show the component with animation
     */
    show() {
        this.container.style.display = 'block';
        
        // Add fade-in animation
        setTimeout(() => {
            this.container.style.opacity = '1';
        }, 10);
    }
    
    /**
     * Hide the component with animation
     */
    hide() {
        this.container.style.opacity = '0';
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 300);
    }
    
    /**
     * Clean up the component
     */
    dispose() {
        // Remove event listener
        if (this.button) {
            this.button.removeEventListener('click', () => {
                window.location.reload();
            });
        }
        
        // Remove from DOM
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}