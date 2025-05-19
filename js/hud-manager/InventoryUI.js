import * as THREE from 'three';
import { UIComponent } from '../UIComponent.js';
import { PlayerModel } from '../entities/player/PlayerModel.js';

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
        
        // User interaction properties
        this.isUserInteracting = false;
        this.autoRotate = true;
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
        
        // Create a new renderer
        this.modelRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.modelRenderer.setSize(containerWidth, containerHeight);
        this.modelRenderer.setClearColor(0x000000, 0);
        this.modelRenderer.shadowMap.enabled = true;
        this.modelContainer.appendChild(this.modelRenderer.domElement);
        
        // Create a new scene
        this.modelScene = new THREE.Scene();
        
        // Create a camera
        this.modelCamera = new THREE.PerspectiveCamera(
            45, 
            containerWidth / containerHeight, 
            0.1, 
            1000
        );
        // Position camera to frame the character from legs to head
        this.modelCamera.position.set(0, 0.5, 5);
        this.modelCamera.lookAt(0, 0.5, 0);
        
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
        
        // Add mouse/touch interaction events
        this.setupModelInteraction();
        
        // Force an initial render
        if (this.modelRenderer && this.modelScene && this.modelCamera) {
            this.modelRenderer.render(this.modelScene, this.modelCamera);
        }
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
            
            // Initialize model preview if not already done
            if (!this.isModelInitialized) {
                setTimeout(() => this.initModelPreview());
            }
            
            // Pause game
            this.game.pause(false);
        }
    }
    
    /**
     * Create the character model by cloning the player model
     */
    createCharacterModel() {
        console.debug('Creating character model for inventory preview...');
        this.characterModel = new PlayerModel(this.modelScene);
    }
    
    /**
     * Animate the character model
     */
    animateModel() {
        // Always request the next frame first to ensure continuous animation
        requestAnimationFrame(() => this.animateModel());
        
        // Only process animation if initialized and inventory is open
        if (!this.isModelInitialized || !this.isInventoryOpen) return;

        const delta = this.clock.getDelta();

        this.characterModel.updateAnimations(delta)
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
     * Set up mouse and touch interaction for the model
     */
    setupModelInteraction() {
        if (!this.modelContainer || !this.modelRenderer) return;
        
        const canvas = this.modelRenderer.domElement;
        
        // Mouse events
        canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();
            this.isUserInteracting = true;
            this.autoRotate = false;
            this.mouseXOnMouseDown = event.clientX;
            this.userRotationYOnMouseDown = this.userRotationY;
        });
        
        document.addEventListener('mousemove', (event) => {
            if (this.isUserInteracting) {
                const deltaX = event.clientX - this.mouseXOnMouseDown;
                // Convert mouse movement to rotation (adjust sensitivity as needed)
                this.userRotationY = this.userRotationYOnMouseDown + deltaX * 0.01;
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isUserInteracting = false;
            // Resume auto-rotation after a delay
            setTimeout(() => {
                if (!this.isUserInteracting) {
                    this.autoRotate = true;
                }
            }, 2000);
        });
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                this.isUserInteracting = true;
                this.autoRotate = false;
                this.mouseXOnMouseDown = event.touches[0].clientX;
                this.userRotationYOnMouseDown = this.userRotationY;
            }
        });
        
        document.addEventListener('touchmove', (event) => {
            if (this.isUserInteracting && event.touches.length === 1) {
                const deltaX = event.touches[0].clientX - this.mouseXOnMouseDown;
                // Convert touch movement to rotation (adjust sensitivity as needed)
                this.userRotationY = this.userRotationYOnMouseDown + deltaX * 0.01;
            }
        });
        
        document.addEventListener('touchend', () => {
            this.isUserInteracting = false;
            // Resume auto-rotation after a delay
            setTimeout(() => {
                if (!this.isUserInteracting) {
                    this.autoRotate = true;
                }
            }, 2000);
        });
        
        // Double-click/tap to reset rotation
        canvas.addEventListener('dblclick', () => {
            this.userRotationY = Math.PI; // Reset to face the camera
            this.characterModel.rotation.y = this.userRotationY;
        });
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
        
        // Remove event listeners
        window.removeEventListener('resize', this.onModelContainerResize);
        
        // Note: Since we're using anonymous functions for event listeners,
        // we can't directly remove them. In a production app, you would
        // store references to the bound event handlers.
    }
}