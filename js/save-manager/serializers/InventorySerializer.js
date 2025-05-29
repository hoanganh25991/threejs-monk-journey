/**
 * Handles serialization and deserialization of player inventory and equipment
 */
export class InventorySerializer {
    /**
     * Serialize player inventory and equipment data for saving
     * @param {Object} player - The player object
     * @returns {Object} Serialized inventory and equipment data
     */
    static serialize(player) {
        if (!player || !player.inventory) {
            console.warn('Player or inventory object is null or undefined');
            return { inventory: [], equipment: {} };
        }
        
        // Get inventory items
        const inventoryItems = player.getInventory() || [];
        
        // Get equipment items
        const equipment = player.getEquipment() || {};
        
        return {
            inventory: inventoryItems.map(item => ({ ...item })), // Create deep copy of each item
            equipment: Object.fromEntries(
                Object.entries(equipment).map(([slot, item]) => [slot, item ? { ...item } : null])
            ),
            gold: player.getGold() || 0
        };
    }
    
    /**
     * Deserialize inventory and equipment data from save
     * @param {Object} player - The player object to update
     * @param {Object} inventoryData - The saved inventory data
     */
    static deserialize(player, inventoryData) {
        if (!player || !player.inventory || !inventoryData) {
            console.error('Player, inventory, or inventory data is null or undefined');
            return;
        }
        
        console.debug('Loading inventory data:', Object.keys(inventoryData));
        
        // Clear existing inventory
        if (player.inventory.inventory) {
            player.inventory.inventory = [];
        }
        
        // Load inventory items
        if (inventoryData.inventory && Array.isArray(inventoryData.inventory)) {
            console.debug(`Loading ${inventoryData.inventory.length} inventory items`);
            inventoryData.inventory.forEach(item => {
                player.addToInventory(item);
            });
        }
        
        // Clear existing equipment
        if (player.inventory.equipment) {
            Object.keys(player.inventory.equipment).forEach(slot => {
                player.inventory.equipment[slot] = null;
            });
        }
        
        // Load equipment
        if (inventoryData.equipment) {
            console.debug('Loading player equipment');
            Object.entries(inventoryData.equipment).forEach(([slot, item]) => {
                if (item && player.inventory.equipment.hasOwnProperty(slot)) {
                    player.inventory.equipment[slot] = item;
                }
            });
        }
        
        // Load gold
        if (inventoryData.gold !== undefined) {
            player.inventory.gold = inventoryData.gold;
        }
        
        console.debug('Inventory data loaded successfully');
    }
}