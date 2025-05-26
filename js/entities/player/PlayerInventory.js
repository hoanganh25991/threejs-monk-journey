/**
 * PlayerInventory.js
 * Manages the player's inventory and equipment
 */

export class PlayerInventory {
    constructor() {
        // Initialize inventory
        this.inventory = [];
        this.gold = 0;
        
        // Initialize equipment
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            accessory: null
        };
    }
    
    // Inventory management
    addToInventory(item) {
        // Check if item already exists in inventory
        const existingItem = this.inventory.find(i => i.name === item.name);
        
        if (existingItem) {
            // Increase amount
            existingItem.amount += item.amount;
        } else {
            // Add new item
            this.inventory.push({ ...item });
        }
    }
    
    removeFromInventory(itemName, amount = 1) {
        // Find item in inventory
        const itemIndex = this.inventory.findIndex(i => i.name === itemName);
        
        if (itemIndex >= 0) {
            // Decrease amount
            this.inventory[itemIndex].amount -= amount;
            
            // Remove item if amount is 0 or less
            if (this.inventory[itemIndex].amount <= 0) {
                this.inventory.splice(itemIndex, 1);
            }
            
            return true;
        }
        
        return false;
    }
    
    // Equipment management
    equipItem(item) {
        // Check if item is equippable
        if (!item.type || !this.equipment.hasOwnProperty(item.type)) {
            return false;
        }
        
        // Unequip current item if any
        if (this.equipment[item.type]) {
            this.addToInventory(this.equipment[item.type]);
        }
        
        // Equip new item
        this.equipment[item.type] = item;
        
        // Remove from inventory
        this.removeFromInventory(item.name);
        
        return true;
    }
    
    unequipItem(type) {
        // Check if item type is valid
        if (!this.equipment.hasOwnProperty(type)) {
            return false;
        }
        
        // Check if item is equipped
        if (!this.equipment[type]) {
            return false;
        }
        
        // Add to inventory
        this.addToInventory(this.equipment[type]);
        
        // Remove from equipment
        this.equipment[type] = null;
        
        return true;
    }
    
    // Gold management
    addGold(amount) {
        this.gold += amount;
    }
    
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
    
    // Getters
    getInventory() {
        return this.inventory;
    }
    
    getEquipment() {
        return this.equipment;
    }
    
    getGold() {
        return this.gold;
    }
}