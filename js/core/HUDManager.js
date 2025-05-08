import { PlayerUI } from '../ui/components/PlayerUI.js';
import { EnemyUI } from '../ui/components/EnemyUI.js';
import { SkillsUI } from '../ui/components/SkillsUI.js';
import { DialogUI } from '../ui/components/DialogUI.js';
import { InventoryUI } from '../ui/components/InventoryUI.js';
import { VirtualJoystickUI } from '../ui/components/VirtualJoystickUI.js';
import { DeathScreenUI } from '../ui/components/DeathScreenUI.js';
import { NotificationsUI } from '../ui/components/NotificationsUI.js';
import { QuestLogUI } from '../ui/components/QuestLogUI.js';
import { EffectsManager } from '../ui/components/EffectsManager.js';
import { MainBackground } from '../ui/MainBackground.js';

/**
 * HUD Manager
 * Manages all UI components and provides a central interface for UI interactions
 */
export class HUDManager {
    /**
     * Create a new HUD Manager
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;
        
        // Initialize UI components
        this.components = {};
        this.effectsManager = null;
    }
    
    /**
     * Initialize the HUD Manager and all UI components
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Validate UI container exists
        this.validateUIContainer();
        
        // Create main background
        this.createMainBackground();
        
        // Create UI components
        this.createUIComponents();
        
        // Create effects manager
        this.createEffectsManager();
        
        return true;
    }
    
    /**
     * Validate that the UI container exists in the DOM
     * If not, create it
     */
    validateUIContainer() {
        this.uiContainer = document.getElementById('ui-container');
        
        if (!this.uiContainer) {
            console.error('UI container not found in DOM. Creating it dynamically.');
            
            // Create UI container
            this.uiContainer = document.createElement('div');
            this.uiContainer.id = 'ui-container';
            this.uiContainer.style.zIndex = 1000;
            document.body.appendChild(this.uiContainer);
        }
        
        // Make sure UI container is visible
        this.uiContainer.style.display = 'block';
    }
    
    /**
     * Create the main background
     */
    createMainBackground() {
        // Initialize the main background
        this.mainBackground = new MainBackground(this.game);
        
        // Show the background
        this.mainBackground.show();
    }
    
    /**
     * Create all UI components
     */
    createUIComponents() {
        // Create player UI
        this.components.playerUI = new PlayerUI(this.game);
        this.components.playerUI.init();
        
        // Create enemy UI
        this.components.enemyUI = new EnemyUI(this.game);
        this.components.enemyUI.init();
        
        // Create skills UI
        this.components.skillsUI = new SkillsUI(this.game);
        this.components.skillsUI.init();
        
        // Create dialog UI
        this.components.dialogUI = new DialogUI(this.game);
        this.components.dialogUI.init();
        
        // Create inventory UI
        this.components.inventoryUI = new InventoryUI(this.game);
        this.components.inventoryUI.init();
        
        // Create virtual joystick UI
        this.components.joystickUI = new VirtualJoystickUI(this.game);
        this.components.joystickUI.init();
        
        // Create death screen UI
        this.components.deathScreenUI = new DeathScreenUI(this.game);
        this.components.deathScreenUI.init();
        
        // Create notifications UI
        this.components.notificationsUI = new NotificationsUI(this.game);
        this.components.notificationsUI.init();
        
        // Create quest log UI
        this.components.questLogUI = new QuestLogUI(this.game);
        this.components.questLogUI.init();
    }
    
    /**
     * Create the effects manager
     */
    createEffectsManager() {
        this.effectsManager = new EffectsManager(this.game);
        this.effectsManager.init();
    }
    
    /**
     * Update all UI components
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update player UI
        this.components.playerUI.update(delta);
        
        // Update enemy UI
        this.components.enemyUI.update(delta);
        
        // Update skills UI
        this.components.skillsUI.update(delta);
        
        // Update notifications UI
        this.components.notificationsUI.update(delta);
        
        // Update effects manager
        this.effectsManager.update(delta);
    }
    
    /**
     * Set a new background image
     * @param {string} imagePath - Path to the new background image
     */
    setBackgroundImage(imagePath) {
        if (this.mainBackground) {
            this.mainBackground.setBackgroundImage(imagePath);
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     */
    showNotification(message) {
        this.components.notificationsUI.showNotification(message);
    }
    
    /**
     * Show a dialog with title and text
     * @param {string} title - Dialog title
     * @param {string} text - Dialog text
     */
    showDialog(title, text) {
        this.components.dialogUI.showDialog(title, text);
    }
    
    /**
     * Hide the dialog
     */
    hideDialog() {
        this.components.dialogUI.hideDialog();
    }
    
    /**
     * Toggle inventory visibility
     */
    toggleInventory() {
        this.components.inventoryUI.toggleInventory();
    }
    
    /**
     * Show the death screen
     */
    showDeathScreen() {
        this.components.deathScreenUI.showDeathScreen();
    }
    
    /**
     * Hide the death screen
     */
    hideDeathScreen() {
        this.components.deathScreenUI.hideDeathScreen();
    }
    
    /**
     * Show level up animation
     * @param {number} level - New level
     */
    showLevelUp(level) {
        this.components.notificationsUI.showLevelUp(level);
    }
    
    /**
     * Update the quest log with active quests
     * @param {Array} activeQuests - Array of active quests
     */
    updateQuestLog(activeQuests) {
        this.components.questLogUI.updateQuestLog(activeQuests);
    }
    
    /**
     * Create a bleeding effect at the given position
     * @param {number} amount - Damage amount
     * @param {Object} position - 3D position {x, y, z}
     * @param {boolean} isPlayerDamage - Whether the damage was caused by the player
     */
    createBleedingEffect(amount, position, isPlayerDamage = false) {
        this.effectsManager.createBleedingEffect(amount, position, isPlayerDamage);
    }
    
    /**
     * Get the current joystick direction
     * @returns {Object} - Direction vector {x, y}
     */
    getJoystickDirection() {
        return this.components.joystickUI.getJoystickDirection();
    }
    
    /**
     * Hide all UI elements
     */
    hideAllUI() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'none';
        }
    }
    
    /**
     * Show all UI elements
     */
    showAllUI() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'block';
        }
    }
}