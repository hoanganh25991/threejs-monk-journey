import { UIComponent } from '../../ui/UIComponent.js';

/**
 * Death Screen UI component
 * Displays death screen with respawn and quit options
 */
export class DeathScreenUI extends UIComponent {
    /**
     * Create a new DeathScreenUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('death-screen', game);
        this.isDeathScreenOpen = false;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <h1 style="color: #ff0000;">You Died</h1>
            <button class="menu-button" id="respawn-button">Respawn</button>
            <button class="menu-button" id="quit-button">Quit Game</button>
        `;
        
        // Render the template
        this.render(template);
        
        // Add event listeners
        const respawnButton = document.getElementById('respawn-button');
        respawnButton.addEventListener('click', () => {
            this.game.player.revive();
        });
        
        const quitButton = document.getElementById('quit-button');
        quitButton.addEventListener('click', () => {
            // Reload page to restart game
            location.reload();
        });
        
        // Hide initially
        this.hide();
        
        return true;
    }
    
    /**
     * Show the death screen
     */
    showDeathScreen() {
        // Show death screen
        this.show();
        this.isDeathScreenOpen = true;
        
        // Pause game
        this.game.pause();
    }
    
    /**
     * Hide the death screen
     */
    hideDeathScreen() {
        // Hide death screen
        this.hide();
        this.isDeathScreenOpen = false;
        
        // Resume game
        this.game.resume();
    }
}