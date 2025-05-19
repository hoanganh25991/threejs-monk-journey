import { UIComponent } from '../UIComponent.js';
import * as THREE from 'three';

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
        this.modelRenderer = null;
        this.modelScene = null;
        this.modelCamera = null;
        this.modelLight = null;
        this.characterModel = null;
        this.animationMixer = null;
        this.clock = new THREE.Clock();
        this.isModelInitialized = false;
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
        
        // Clear the model container
        this.modelContainer.innerHTML = '';
        
        // Create a new renderer
        this.modelRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.modelRenderer.setSize(this.modelContainer.clientWidth, this.modelContainer.clientHeight);
        this.modelRenderer.setClearColor(0x000000, 0);
        this.modelRenderer.shadowMap.enabled = true;
        this.modelContainer.appendChild(this.modelRenderer.domElement);
        
        // Create a new scene
        this.modelScene = new THREE.Scene();
        
        // Create a camera
        this.modelCamera = new THREE.PerspectiveCamera(
            45, 
            this.modelContainer.clientWidth / this.modelContainer.clientHeight, 
            0.1, 
            1000
        );
        this.modelCamera.position.set(0, 0, 5);
        this.modelCamera.lookAt(0, 0, 0);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.modelScene.add(ambientLight);
        
        this.modelLight = new THREE.DirectionalLight(0xffffff, 1);
        this.modelLight.position.set(5, 5, 5);
        this.modelLight.castShadow = true;
        this.modelScene.add(this.modelLight);
        
        // Clone the player model
        this.createCharacterModel();
        
        // Start animation loop
        this.animateModel();
        
        this.isModelInitialized = true;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onModelContainerResize());
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
            
            // Initialize model preview if not already done
            if (!this.isModelInitialized) {
                this.initModelPreview();
            }
            
            // Show inventory
            this.show();
            this.isInventoryOpen = true;
            
            // Pause game
            this.game.pause(false);
        }
    }
    
    /**
     * Create the character model by cloning the player model
     */
    createCharacterModel() {
        try {
            console.debug('Creating character model for inventory preview...');
            
            // Get the player model
            const playerModel = this.game.player.model;
            console.debug('Player model:', playerModel);
            
            // If player model exists and has a model group
            if (playerModel && playerModel.getModelGroup()) {
                // Get the model group
                const modelGroup = playerModel.getModelGroup();
                console.debug('Model group found:', modelGroup);
                
                // Clone the entire model group
                this.characterModel = modelGroup.clone(true);
                
                // Apply proper scaling and positioning for the preview
                this.characterModel.scale.set(0.8, 0.8, 0.8);
                this.characterModel.position.set(0, -1.0, 0);
                this.characterModel.rotation.set(0, Math.PI, 0); // Face the camera
                
                // Add to scene
                this.modelScene.add(this.characterModel);
                
                // Set up animation mixer if the player has animations
                if (playerModel.mixer && playerModel.animations) {
                    this.animationMixer = new THREE.AnimationMixer(this.characterModel);
                    
                    // Try to find an idle animation
                    const idleAnimation = Object.keys(playerModel.animations).find(name => 
                        name.toLowerCase().includes('idle') || 
                        name.toLowerCase().includes('stand')
                    );
                    
                    if (idleAnimation && playerModel.animations[idleAnimation]) {
                        try {
                            // Clone the animation clip
                            const originalClip = playerModel.animations[idleAnimation].getClip();
                            const action = this.animationMixer.clipAction(originalClip);
                            action.play();
                            console.debug('Playing idle animation:', idleAnimation);
                        } catch (animError) {
                            console.error('Error playing animation:', animError);
                        }
                    }
                }
                
                console.debug('Character model created for inventory preview');
            } else {
                console.debug('No suitable player model found, creating placeholder');
                // If no model or using fallback, create a simple placeholder
                const geometry = new THREE.BoxGeometry(1, 2, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0x8866ff });
                this.characterModel = new THREE.Mesh(geometry, material);
                this.characterModel.position.set(0, 0, 0);
                this.modelScene.add(this.characterModel);
                
                console.debug('Using placeholder model for inventory preview');
            }
        } catch (error) {
            console.error('Error creating character model for inventory:', error);
            
            // Create a fallback model if there's an error
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0x8866ff });
            this.characterModel = new THREE.Mesh(geometry, material);
            this.characterModel.position.set(0, 0, 0);
            this.modelScene.add(this.characterModel);
        }
    }
    
    /**
     * Animate the character model
     */
    animateModel() {
        // Always request the next frame first to ensure continuous animation
        requestAnimationFrame(() => this.animateModel());
        
        // Only process animation if initialized and inventory is open
        if (!this.isModelInitialized || !this.isInventoryOpen) return;
        
        // Rotate the model slowly
        if (this.characterModel) {
            this.characterModel.rotation.y += 0.01;
        }
        
        // Update animation mixer
        if (this.animationMixer) {
            const delta = this.clock.getDelta();
            this.animationMixer.update(delta);
        }
        
        // Render the scene
        if (this.modelRenderer && this.modelScene && this.modelCamera) {
            this.modelRenderer.render(this.modelScene, this.modelCamera);
        }
    }
    
    /**
     * Handle resize of the model container
     */
    onModelContainerResize() {
        if (!this.isModelInitialized) return;
        
        const width = this.modelContainer.clientWidth;
        const height = this.modelContainer.clientHeight;
        
        // Update camera aspect ratio
        this.modelCamera.aspect = width / height;
        this.modelCamera.updateProjectionMatrix();
        
        // Update renderer size
        this.modelRenderer.setSize(width, height);
    }
    
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
        if (this.isModelInitialized) {
            this.clock.start();
            this.animateModel();
        }
    }
    
    /**
     * Hide the inventory UI
     * Override the parent method to handle 3D model animation
     */
    hide() {
        super.hide();
        
        // Stop the animation clock
        if (this.isModelInitialized) {
            this.clock.stop();
        }
    }
    
    /**
     * Clean up resources when component is destroyed
     * This should be called when the game is shutting down
     */
    dispose() {
        // Stop animation loop
        this.isModelInitialized = false;
        
        // Dispose of Three.js resources
        if (this.characterModel) {
            this.modelScene.remove(this.characterModel);
            this.characterModel.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
            this.characterModel = null;
        }
        
        if (this.animationMixer) {
            this.animationMixer = null;
        }
        
        if (this.modelRenderer) {
            this.modelRenderer.dispose();
            this.modelRenderer = null;
        }
        
        // Remove event listener
        window.removeEventListener('resize', this.onModelContainerResize);
    }
}