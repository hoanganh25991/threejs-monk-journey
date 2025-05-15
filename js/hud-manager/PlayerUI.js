import { UIComponent } from '../UIComponent.js';

/**
 * Player UI component
 * Displays player health, mana, level, and other stats
 */
export class PlayerUI extends UIComponent {
    /**
     * Create a new PlayerUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('player-stats-container', game);
        this.levelIndicator = null;
        this.healthBar = null;
        this.healthText = null;
        this.manaBar = null;
        this.manaText = null;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Create player header (portrait and info)
        const headerTemplate = `
            <div id="player-header">
                <div id="player-portrait">🧘</div>
                <div id="player-info">
                    <div id="player-name">Monk</div>
                    <div id="level-indicator">Level: ${this.game.player.getLevel()}</div>
                </div>
            </div>
        `;
        
        // Create health bar
        const healthTemplate = `
            <div id="health-bar-container">
                <div id="health-icon">❤️</div>
                <div id="health-bar"></div>
                <div id="health-text"></div>
            </div>
        `;
        
        // Create mana bar
        const manaTemplate = `
            <div id="mana-bar-container">
                <div id="mana-icon">🔷</div>
                <div id="mana-bar"></div>
                <div id="mana-text"></div>
            </div>
        `;
        
        // Render the template
        this.render(headerTemplate + healthTemplate + manaTemplate);
        
        // Store references to elements we need to update
        this.levelIndicator = document.getElementById('level-indicator');
        this.healthBar = document.getElementById('health-bar');
        this.healthText = document.getElementById('health-text');
        this.manaBar = document.getElementById('mana-bar');
        this.manaText = document.getElementById('mana-text');
        
        return true;
    }
    
    /**
     * Update the player UI
     */
    update() {
        if (!this.game.player) return;
        
        // Update level indicator
        this.levelIndicator.textContent = `Level: ${this.game.player.getLevel()}`;
        
        // Get health values
        const currentHealth = Math.round(this.game.player.getHealth());
        const maxHealth = this.game.player.getMaxHealth();
        const healthPercent = (currentHealth / maxHealth) * 100;
        
        // Update health bar
        this.healthBar.style.width = `${healthPercent}%`;
        
        // Update health text
        this.healthText.textContent = `${currentHealth}/${maxHealth}`;
        
        // Get mana values
        const currentMana = Math.round(this.game.player.getMana());
        const maxMana = this.game.player.getMaxMana();
        const manaPercent = (currentMana / maxMana) * 100;
        
        // Update mana bar
        this.manaBar.style.width = `${manaPercent}%`;
        
        // Update mana text
        this.manaText.textContent = `${currentMana}/${maxMana}`;
        
        // Change health bar color based on health percentage
        if (healthPercent < 25) {
            this.healthBar.style.backgroundColor = '#ff3333'; // Bright red when low
            this.healthBar.style.boxShadow = '0 0 8px #ff3333';
        } else if (healthPercent < 50) {
            this.healthBar.style.backgroundColor = '#ff6633'; // Orange-red when medium
            this.healthBar.style.boxShadow = '0 0 5px #ff6633';
        } else {
            this.healthBar.style.backgroundColor = '#ff0000'; // Normal red when high
            this.healthBar.style.boxShadow = 'none';
        }
    }
}