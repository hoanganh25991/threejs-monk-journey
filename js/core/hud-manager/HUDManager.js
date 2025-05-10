import * as THREE from 'three';
import { PlayerUI } from './PlayerUI.js';
import { EnemyUI } from './EnemyUI.js';
import { SkillsUI } from './SkillsUI.js';
import { DialogUI } from './DialogUI.js';
import { InventoryUI } from './InventoryUI.js';
import { VirtualJoystickUI } from './VirtualJoystickUI.js';
import { DeathScreenUI } from './DeathScreenUI.js';
import { NotificationsUI } from './NotificationsUI.js';
import { QuestLogUI } from './QuestLogUI.js';
import { MiniMapUI } from './MiniMapUI.js';
import { BleedingEffect } from '../../entities/skills/BleedingEffect.js';
import { MainBackground } from '../menu-system/MainBackground.js';
import { HomeButton } from './HomeButton.js';

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
        this.threeJsEffects = [];
        this.domEffects = [];
        
        // Add event listener for game state changes
        this.game.addEventListener('gameStateChanged', (state) => this.handleGameStateChange(state));
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
        
        // Initialize effects container
        this.initEffectsContainer();
        
        // Initially hide UI if game is not running
        if (!this.game.isRunning) {
            this.hideAllUI();
        }
        
        return true;
    }
    
    /**
     * Initialize the effects container for DOM-based effects
     */
    initEffectsContainer() {
        // For backward compatibility with any remaining DOM effects
        this.effectsContainer = document.getElementById('effects-container');
        
        // Ensure the container exists
        if (!this.effectsContainer) {
            console.warn('Effects container not found in the DOM. This is only needed for legacy DOM effects.');
        }
    }
    
    /**
     * Validate that the UI container exists in the DOM
     * If not, create it
     */
    validateUIContainer() {
        this.uiContainer = document.getElementById('ui-container');
        
        if (!this.uiContainer) {
            console.log('UI container not found in DOM. Creating it dynamically.');
            
            // Create UI container
            this.uiContainer = document.createElement('div');
            this.uiContainer.id = 'ui-container';
            this.uiContainer.style.zIndex = 1000;
            document.body.appendChild(this.uiContainer);
        }
        
        // Don't force visibility here - it will be controlled by game state
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
        
        // Create mini map UI
        this.components.miniMapUI = new MiniMapUI(this.game);
        this.components.miniMapUI.init();
        
        // Create quest log UI
        this.components.questLogUI = new QuestLogUI(this.game);
        this.components.questLogUI.init();
        
        // Create settings button
        this.components.homeButton = new HomeButton(this.game);
        // Note: SettingsButton initializes itself in its constructor
    }
    
    /**
     * Clean up all effects
     * Should be called when changing scenes or shutting down the game
     */
    cleanupEffects() {
        // Clean up DOM effects
        for (const effect of this.domEffects) {
            if (effect.element && effect.element.parentNode) {
                effect.element.remove();
            }
        }
        this.domEffects = [];
        
        // Clean up Three.js effects
        for (const effect of this.threeJsEffects) {
            effect.dispose();
        }
        this.threeJsEffects = [];
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
        
        // Update mini map UI
        this.components.miniMapUI.update(delta);
        
        // Update notifications UI
        this.components.notificationsUI.update(delta);
        
        // Update settings button
        this.components.homeButton.update(delta);
        
        // Update and remove expired DOM effects (legacy)
        for (let i = this.domEffects.length - 1; i >= 0; i--) {
            const effect = this.domEffects[i];
            
            // Update effect lifetime
            effect.lifetime -= delta;
            
            // Remove expired effects
            if (effect.lifetime <= 0) {
                if (effect.element && effect.element.parentNode) {
                    effect.element.remove();
                }
                this.domEffects.splice(i, 1);
            }
        }
        
        // Update Three.js effects
        for (let i = this.threeJsEffects.length - 1; i >= 0; i--) {
            const effect = this.threeJsEffects[i];
            
            // Update the effect
            effect.update(delta);
            
            // Remove inactive effects
            if (!effect.isActive) {
                effect.dispose();
                this.threeJsEffects.splice(i, 1);
            }
        }
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
     * @returns {BleedingEffect|null} - The created bleeding effect or null if creation failed
     */
    createBleedingEffect(amount, position, isPlayerDamage = false) {
        // Only show damage particles for player-caused damage
        if (!isPlayerDamage) return null;
        
        // Create a new bleeding effect
        const bleedingEffect = new BleedingEffect({
            amount: amount,
            duration: 1.5, // 1.5 seconds duration
            isPlayerDamage: isPlayerDamage
        });
        
        // Create the effect at the specified position
        const effectGroup = bleedingEffect.create(position, new THREE.Vector3(0, 1, 0));
        
        // Add the effect to the scene
        if (this.game && this.game.scene) {
            this.game.scene.add(effectGroup);
            
            // Add to the effects array for updates
            this.threeJsEffects.push(bleedingEffect);
            
            // For very high damage, add a screen flash effect (still using DOM for this)
            if (amount > 40 && this.effectsContainer) {
                this.createScreenFlash('rgba(255, 0, 0, 0.15)', 0.5);
            }
            
            return bleedingEffect;
        }
        
        return null;
    }
    
    /**
     * Create a screen flash effect (still using DOM for this effect)
     * @param {string} color - CSS color string
     * @param {number} duration - Duration in seconds
     */
    createScreenFlash(color, duration) {
        if (!this.effectsContainer) return;
        
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = color;
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '90';
        flash.style.transition = `opacity ${duration}s`;
        
        this.effectsContainer.appendChild(flash);
        
        // Fade out and remove after a short time
        setTimeout(() => {
            flash.style.opacity = '0';
            
            // Add to effects array for cleanup
            this.domEffects.push({
                element: flash,
                lifetime: duration
            });
        }, 100);
    }
    
    /**
     * Get the current joystick direction
     * @returns {Object} - Direction vector {x, y}
     */
    getJoystickDirection() {
        return this.components.joystickUI.getJoystickDirection();
    }
    
    /**
     * Toggle mini map visibility
     * @returns {boolean} - New visibility state
     */
    toggleMiniMap() {
        return this.components.miniMapUI.toggleMiniMap();
    }
    
    /**
     * Set mini map scale
     * @param {number} scale - New scale factor
     */
    setMiniMapScale(scale) {
        if (this.components.miniMapUI) {
            this.components.miniMapUI.setScale(scale);
        }
    }
    
    /**
     * Increase mini map scale (zoom out)
     */
    increaseMiniMapScale() {
        if (this.components.miniMapUI) {
            this.components.miniMapUI.increaseScale();
        }
    }
    
    /**
     * Decrease mini map scale (zoom in)
     */
    decreaseMiniMapScale() {
        if (this.components.miniMapUI) {
            this.components.miniMapUI.decreaseScale();
        }
    }
    
    /**
     * Resize the mini map
     * @param {number} size - New size in pixels
     */
    resizeMiniMap(size) {
        if (this.components.miniMapUI) {
            this.components.miniMapUI.resize(size);
        }
    }
    
    /**
     * Hide all UI elements
     */
    hideAllUI() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'none';
        }
        
        // Don't hide the settings button when paused if the settings menu is open
        const settingsMenu = document.getElementById('main-options-menu');
        const homeButton = document.getElementById('home-button');
        if (homeButton && (!settingsMenu || settingsMenu.style.display === 'none')) {
            homeButton.style.display = 'none';
        }
    }
    
    /**
     * Show all UI elements
     */
    showAllUI() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'block';
        }
        
        // Explicitly show the settings button since it's outside the UI container
        const homeButton = document.getElementById('home-button');
        if (homeButton) {
            homeButton.style.display = 'block';
        }
    }
    
    /**
     * Toggle the visibility of all UI elements
     * @returns {boolean} - The new visibility state (true if visible, false if hidden)
     */
    toggleHUD() {
        if (this.uiContainer) {
            const isCurrentlyVisible = this.uiContainer.style.display !== 'none';
            if (isCurrentlyVisible) {
                this.hideAllUI();
                return false;
            } else {
                this.showAllUI();
                return true;
            }
        }
        return false;
    }
    
    /**
     * Handle game state changes
     * @param {string} state - Current game state ('running' or 'paused')
     */
    handleGameStateChange(state) {
        if (state === 'running') {
            this.showAllUI();
        } else if (state === 'paused') {
            this.hideAllUI();
            // Clean up effects when game is paused
            this.cleanupEffects();
        }
    }
}