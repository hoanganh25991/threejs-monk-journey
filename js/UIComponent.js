/**
 * Base class for all UI components
 * Provides common functionality for UI components
 */
export class UIComponent {
    /**
     * Create a new UI component
     * @param {string} containerId - ID of the container element
     * @param {import('../game/Game.js').Game} game - Reference to the game instance
     */
    constructor(containerId, game) {
        this.containerId = containerId;
        this.game = game;
        this.container = document.getElementById(containerId);
        
        // Validate container exists
        if (!this.container) {
            console.error(`Container element with ID "${containerId}" not found. Creating it dynamically.`);
            this.container = document.createElement('div');
            this.container.id = containerId;

            // Add to UI container
            document.body.appendChild(this.container);
        }
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // To be implemented by child classes
        return true;
    }
    
    /**
     * Update the component
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // To be implemented by child classes
    }
    
    /**
     * Render the component using a template
     * @param {string} template - HTML template string
     * @param {boolean} append - Whether to append to container or replace content
     */
    render(template, append = false) {
        if (append) {
            this.container.innerHTML += template;
        } else {
            this.container.innerHTML = template;
        }
    }
    
    /**
     * Show the component
     */
    show() {
        this.container.style.display = 'block';
    }
    
    /**
     * Hide the component
     */
    hide() {
        this.container.style.display = 'none';
    }
    
    /**
     * Toggle the component visibility
     * @returns {boolean} - New visibility state (true = visible)
     */
    toggle() {
        const isVisible = this.container.style.display !== 'none';
        this.container.style.display = isVisible ? 'none' : 'block';
        return !isVisible;
    }

    get isMobile() {
        return window.innerHeight <= 430;
    }
    
    /**
     * Clean up the component
     */
    dispose() {
        // To be implemented by child classes
    }
}