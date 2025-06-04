import { UIComponent } from '../UIComponent.js';

/**
 * Map Selector Button Component
 * Button to toggle the map selector UI
 * This version uses a pre-defined button in the HTML instead of creating it dynamically
 */
export class MapSelectorButton extends UIComponent {
    constructor(game) {
        super('map-selector-button', game);
        this.isVisible = true;
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
                    this.game.gameState && this.game.gameState.isRunning()) {
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
        
        // // Check if game is running using the gameState methods
        // if (this.game.gameState && this.game.gameState.isRunning()) {
        //     this.show();
        // } else {
        //     this.hide();
        // }
    }

    destroy() {
        // We don't remove the element since it's defined in HTML
        // Just remove event listeners if needed
        if (this.element) {
            this.element.removeEventListener('click', this.toggleMapSelector);
        }
    }
}