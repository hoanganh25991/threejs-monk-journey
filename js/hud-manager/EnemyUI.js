import { UIComponent } from '../UIComponent.js';

/**
 * Enemy UI component
 * Displays enemy health and information
 */
export class EnemyUI extends UIComponent {
    /**
     * Create a new EnemyUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('enemy-health-container', game);
        this.enemyName = null;
        this.enemyHealthBar = null;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <div id="enemy-name"></div>
            <div id="enemy-health-bar"></div>
        `;
        
        // Render the template
        this.render(template);
        
        // Store references to elements we need to update
        this.enemyName = document.getElementById('enemy-name');
        this.enemyHealthBar = document.getElementById('enemy-health-bar');
        
        // Hide initially
        this.hide();
        
        return true;
    }
    
    /**
     * Update the enemy UI
     */
    update() {
        // Find closest enemy
        const playerPosition = this.game.player.getPosition();
        const closestEnemy = this.game.enemyManager.getClosestEnemy(playerPosition, 10);
        
        if (closestEnemy && !closestEnemy.isDead()) {
            // Show enemy health bar
            this.show();
            
            // Update enemy name
            this.enemyName.textContent = closestEnemy.getName();
            
            // Update enemy health bar
            const healthPercent = (closestEnemy.getHealth() / closestEnemy.getMaxHealth()) * 100;
            this.enemyHealthBar.style.width = `${healthPercent}%`;
        } else {
            // Hide enemy health bar
            this.hide();
        }
    }
}