import * as THREE from 'three';
import { UIComponent } from '../UIComponent.js';
import { PlayerModel } from '../entities/player/PlayerModel.js';
import { PlayerState } from '../entities/player/PlayerState.js';
import { ModelPreview } from '../menu-system/ModelPreview.js';
import { updateAnimation } from '../utils/AnimationUtils.js';

/**
 * Inventory UI component
 * Displays player inventory and allows item interaction
 */
export class InventoryUI extends UIComponent {
    /**
     * Create a new InventoryUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('inventory', game);
        this.inventoryGrid = null;
        this.isInventoryOpen = false;
        
        // 3D model preview properties
        this.modelContainer = null;
        this.modelPreview = null; // ModelPreview instance
        this.isModelInitialized = false;
        
        // User interaction properties
        this.isUserInteracting = false;
        this.rotationSpeed = 0.01;
        this.userRotationY = Math.PI; // Start facing the camera
        this.userRotationYOnMouseDown = 0;
        this.mouseX = 0;
        this.mouseXOnMouseDown = 0;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Store references to elements we need to update
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.modelContainer = document.getElementById('character-model-container');
        
        // Add click event to save inventory
        const saveButton = document.getElementById('inventory-save');
        saveButton.addEventListener('click', () => {
            this.saveInventory();
            this.toggleInventory();
        });

        setTimeout(() => this.initModelPreview(), 1000);
        
        // Hide initially
        this.hide();
        
        return true;
    }
    
    /**
     * Initialize the 3D model preview
     * This is called when the inventory is first opened
     */
    initModelPreview() {
        if (this.isModelInitialized) return;
        
        console.debug('Initializing model preview...');
        
        // Clear the model container
        this.modelContainer.innerHTML = '';
        
        // Get container dimensions, ensure they're valid
        let containerWidth = this.modelContainer.clientWidth;
        let containerHeight = this.modelContainer.clientHeight;
        
        // Use default dimensions if container size is invalid
        if (containerWidth <= 0 || containerHeight <= 0) {
            console.debug('Container has invalid dimensions, using defaults');
            containerWidth = 300;  // Default width
            containerHeight = 400; // Default height
        }
        
        console.debug(`Container dimensions: ${containerWidth}x${containerHeight}`);
        
        // Create a new ModelPreview instance
        this.modelPreview = new ModelPreview(this.modelContainer, containerWidth, containerHeight);
        
        // Get the current player model path
        const playerModel = this.game.player.model;
        if (playerModel && playerModel.currentModel) {
            const modelPath = playerModel.currentModel.path;
            const baseScale = playerModel.currentModel.baseScale || 1.0;
            const multiplier = playerModel.currentModel.multiplier || 1.0;
            const effectiveScale = baseScale * multiplier;
            
            console.debug(`Loading player model: ${modelPath} with scale ${effectiveScale}`);
            
            // Load the model into the preview
            this.modelPreview.loadModel(modelPath, effectiveScale);
        } else {
            console.warn('No player model available to display in inventory');
        }
        
        // Mark as initialized
        this.isModelInitialized = true;
        
        // Add a custom animation speed modifier to the ModelPreview
        // This will slow down animations for better viewing
        const originalAnimate = this.modelPreview.animate;
        this.modelPreview.animate = () => {
            // Only continue animation if visible
            if (this.modelPreview.visible) {
                this.modelPreview.animationId = requestAnimationFrame(() => this.modelPreview.animate());
                
                // Update controls
                this.modelPreview.controls.update();
                
                // Get delta time with the clock
                const delta = this.modelPreview.clock.getDelta();
                
                // // Apply slowdown factor for better animation viewing
                // const slowdownFactor = 0.5; // Reduce animation speed by half
                // const effectiveDelta = Math.max(delta * slowdownFactor, 0.004);
                // console.debug({ effectiveDelta })
                
                // Update animations with slowed-down delta
                if (this.modelPreview.mixer) {
                    updateAnimation(this.modelPreview.mixer, delta);
                }
                
                // Render scene
                try {
                    this.modelPreview.renderer.render(this.modelPreview.scene, this.modelPreview.camera);
                } catch (error) {
                    console.error('ModelPreview: Error rendering scene:', error);
                }
            } else {
                // If not visible, don't request another frame
                this.modelPreview.animationId = null;
            }
        };
    }
    
    /**
     * Toggle inventory visibility
     */
    toggleInventory() {
        if (this.isInventoryOpen) {
            // Hide inventory
            this.hide();
            this.isInventoryOpen = false;
            
            // Resume game
            this.game.resume(false);
        } else {
            // Update inventory items
            this.updateInventoryItems();
            
            // Show inventory first so container has dimensions
            this.show();
            this.isInventoryOpen = true;
            
            // Pause game
            this.game.pause(false);
        }
    }
    
    // The createCharacterModel method has been replaced by the ModelPreview's loadModel method
    
    // The animateModel method has been replaced by the ModelPreview's animate method
    
    /**
     * Update inventory items
     */
    updateInventoryItems() {
        // Clear inventory grid
        this.inventoryGrid.innerHTML = '';
        
        // Get player inventory
        const inventory = this.game.player.getInventory();
        
        // Add items to inventory grid
        inventory.forEach(item => {
            // Create item element
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            
            // Create item icon
            const itemIcon = document.createElement('div');
            itemIcon.className = 'item-icon';
            
            // Use emoji based on item type or default to package icon
            let iconContent = '📦';
            if (item.name.includes('Potion')) {
                iconContent = '🧪';
            } else if (item.name.includes('Weapon')) {
                iconContent = '⚔️';
            } else if (item.name.includes('Armor')) {
                iconContent = '🛡️';
            }
            
            itemIcon.textContent = iconContent;
            itemElement.appendChild(itemIcon);
            
            // Create item count
            const itemCount = document.createElement('div');
            itemCount.className = 'item-count';
            itemCount.textContent = item.amount > 1 ? `x${item.amount}` : '';
            itemElement.appendChild(itemCount);
            
            // Add click event for item use
            itemElement.addEventListener('click', () => {
                // Handle item use
                this.useItem(item);
            });
            
            // Add tooltip with item name
            itemElement.title = item.name;
            
            this.inventoryGrid.appendChild(itemElement);
        });
        
        // Add empty slots
        const totalSlots = 25; // 5x5 grid
        const emptySlots = totalSlots - inventory.length;
        
        for (let i = 0; i < emptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'inventory-item empty';
            this.inventoryGrid.appendChild(emptySlot);
        }
    }
    
    /**
     * Use an item from the inventory
     * @param {Object} item - Item to use
     */
    useItem(item) {
        // Handle different item types
        if (item.name === 'Health Potion') {
            // Heal player
            const newHealth = this.game.player.getHealth() + 50;
            const maxHealth = this.game.player.getMaxHealth();
            this.game.player.getStatsObject().setHealth(Math.min(newHealth, maxHealth));
            
            // Remove item from inventory
            this.game.player.removeFromInventory(item.name, 1);
            
            // Show notification
            this.game.hudManager.showNotification('Used Health Potion: +50 Health');
            
            // Update inventory
            this.updateInventoryItems();
        } else if (item.name === 'Mana Potion') {
            // Restore mana
            const newMana = this.game.player.getMana() + 50;
            const maxMana = this.game.player.getMaxMana();
            this.game.player.getStatsObject().setMana(Math.min(newMana, maxMana));
            
            // Remove item from inventory
            this.game.player.removeFromInventory(item.name, 1);
            
            // Show notification
            this.game.hudManager.showNotification('Used Mana Potion: +50 Mana');
            
            // Update inventory
            this.updateInventoryItems();
        } else {
            // Show item description
            this.game.hudManager.showNotification(`Item: ${item.name}`);
        }
    }
    
    /**
     * Save the current inventory state
     * This method handles saving the inventory data
     */
    saveInventory() {
        // Get player inventory
        const inventory = this.game.player.getInventory();
        
        // Save inventory data (implementation depends on game's save system)
        // For now, just show a notification
        this.game.hudManager.showNotification('Inventory saved successfully!');
        
        // Here you would typically call the game's save system
        // this.game.saveManager.savePlayerInventory(inventory);
    }
    
    /**
     * Show the inventory UI
     * Override the parent method to handle 3D model animation
     */
    show() {
        super.show();
        
        // Start the animation loop if the model is initialized
        if (this.isModelInitialized && this.modelPreview) {
            // The ModelPreview class handles animation resumption automatically
            // through its visibility observer
            this.modelPreview.visible = true;
            
            // Force an animation frame if needed
            if (!this.modelPreview.animationId) {
                this.modelPreview.animate();
            }
        }
    }
    
    /**
     * Hide the inventory UI
     * Override the parent method to handle 3D model animation
     */
    hide() {
        super.hide();
        
        // Stop the animation when hidden
        if (this.isModelInitialized && this.modelPreview) {
            this.modelPreview.visible = false;
            
            // Cancel animation frame if it's running
            if (this.modelPreview.animationId) {
                cancelAnimationFrame(this.modelPreview.animationId);
                this.modelPreview.animationId = null;
            }
        }
    }
    
    // The setupModelInteraction method has been replaced by the ModelPreview's OrbitControls
    
    /**
     * Clean up resources when component is destroyed
     * This should be called when the game is shutting down
     */
    dispose() {
        // Stop animation loop
        this.isModelInitialized = false;
        
        // Dispose of ModelPreview resources
        if (this.modelPreview) {
            // The ModelPreview class has its own dispose method that handles cleanup
            this.modelPreview.dispose();
            this.modelPreview = null;
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onModelContainerResize);
        
        // Note: Since we're using anonymous functions for event listeners,
        // we can't directly remove them. In a production app, you would
        // store references to the bound event handlers.
    }
}