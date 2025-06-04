import { UIComponent } from '../UIComponent.js';

/**
 * Map Selector Button Component
 * Button to toggle the map selector UI
 * This version uses a pre-defined button in the HTML instead of creating it dynamically
 */
export class MapSelectorButton extends UIComponent {
    constructor(game) {
        super();
        this.game = game;
        this.isVisible = true;
        
        // Get the button element from the DOM instead of creating it
        this.element = document.getElementById('map-selector-button');
        
        if (!this.element) {
            console.error('Map selector button not found in the DOM. Make sure to add it to your HTML.');
            return;
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle map selector on click
        this.element.addEventListener('click', () => {
            this.toggleMapSelector();
        });
        
        // Keyboard shortcut (M key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                // Only trigger if no input is focused and game is running
                if (!document.activeElement.matches('input, textarea') && 
                    this.game.gameState.currentState === 'playing') {
                    e.preventDefault();
                    this.toggleMapSelector();
                }
            }
        });
    }

    toggleMapSelector() {
        if (this.game.hudManager && this.game.hudManager.components.mapSelectorUI) {
            this.game.hudManager.components.mapSelectorUI.toggle();
        }
    }

    show() {
        this.isVisible = true;
        if (this.element) {
            this.element.style.display = 'flex';
        }
    }

    hide() {
        this.isVisible = false;
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    update(delta) {
        // Update button state based on game state
        if (!this.element) return;
        
        const gameState = this.game.gameState.currentState;
        
        if (gameState === 'playing') {
            this.show();
        } else {
            this.hide();
        }
    }

    destroy() {
        // We don't remove the element since it's defined in HTML
        // Just remove event listeners if needed
        if (this.element) {
            this.element.removeEventListener('click', this.toggleMapSelector);
        }
    }
}