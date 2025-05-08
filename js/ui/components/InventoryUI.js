import { UIComponent } from '../UIComponent.js';

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
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <div id="inventory-title">Inventory</div>
            <div id="inventory-grid"></div>
            <div id="inventory-close">X</div>
        `;
        
        // Render the template
        this.render(template);
        
        // Store references to elements we need to update
        this.inventoryGrid = document.getElementById('inventory-grid');
        
        // Add click event to close inventory
        const closeButton = document.getElementById('inventory-close');
        closeButton.addEventListener('click', () => {
            this.toggleInventory();
        });
        
        // Hide initially
        this.hide();
        
        return true;
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
            this.game.resume();
        } else {
            // Update inventory items
            this.updateInventoryItems();
            
            // Show inventory
            this.show();
            this.isInventoryOpen = true;
            
            // Pause game
            this.game.pause();
        }
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
            itemElement.textContent = `${item.name} x${item.amount}`;
            
            // Add click event for item use
            itemElement.addEventListener('click', () => {
                // Handle item use
                this.useItem(item);
            });
            
            this.inventoryGrid.appendChild(itemElement);
        });
        
        // Add empty slots
        const totalSlots = 20;
        const emptySlots = totalSlots - inventory.length;
        
        for (let i = 0; i < emptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'inventory-item';
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
}