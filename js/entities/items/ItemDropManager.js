import * as THREE from 'three';
import { ItemModelFactory } from './models/ItemModelFactory.js';
import { Item } from './Item.js';

/**
 * Manages item drops in the game world
 * Creates visual representations of dropped items and handles pickup
 */
export class ItemDropManager {
    /**
     * Create a new ItemDropManager
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {import("../../game/Game.js").Game} game - The game instance
     */
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.droppedItems = new Map(); // Map of item ID to dropped item data
        this.lightBeams = new Map(); // Map of item ID to light beam effect
    }

    /**
     * Drop an item at a specific position
     * @param {Item} item - The item to drop
     * @param {THREE.Vector3} position - The position to drop the item
     * @returns {string} The ID of the dropped item
     */
    dropItem(item, position) {
        // Create a group for the item
        const itemGroup = new THREE.Group();
        itemGroup.position.copy(position);
        
        // Add a small random offset to prevent items from stacking exactly
        itemGroup.position.x += (Math.random() - 0.5) * 0.5;
        itemGroup.position.z += (Math.random() - 0.5) * 0.5;
        
        // Ensure item is above ground
        if (this.game && this.game.world) {
            const terrainHeight = this.game.world.getTerrainHeight(position.x, position.z);
            itemGroup.position.y = terrainHeight + 0.25; // Slightly above ground
        }
        
        // Create the item model
        const itemModel = ItemModelFactory.createModel(item, itemGroup);
        itemModel.createModel();
        
        // Apply rarity effects
        ItemModelFactory.applyRarityEffects(itemModel, item.rarity);
        
        // Add to scene
        this.scene.add(itemGroup);
        
        // Store reference to dropped item
        this.droppedItems.set(item.id, {
            item: item,
            group: itemGroup,
            model: itemModel,
            dropTime: Date.now()
        });
        
        // Add light beam for rare+ items
        if (['rare', 'epic', 'legendary', 'mythic'].includes(item.rarity)) {
            this.addLightBeamEffect(item, itemGroup);
        }
        
        // Show notification
        if (this.game && this.game.hudManager) {
            this.game.hudManager.showNotification(`${item.name} dropped!`);
        }
        
        return item.id;
    }
    
    /**
     * Add a light beam effect for rare+ items
     * @param {Item} item - The item
     * @param {THREE.Group} itemGroup - The item's group
     */
    addLightBeamEffect(item, itemGroup) {
        // Get color based on rarity
        const rarityColors = {
            rare: 0x0070DD,
            epic: 0xA335EE,
            legendary: 0xFF8000,
            mythic: 0xFF0000
        };
        
        const color = rarityColors[item.rarity] || 0xFFFFFF;
        
        // Create light source
        const light = new THREE.PointLight(color, 1, 10);
        light.position.set(0, 2, 0); // Position above the item
        itemGroup.add(light);
        
        // Create light beam cylinder
        const beamGeometry = new THREE.CylinderGeometry(0.1, 0.3, 4, 8, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(0, 2, 0); // Position above the item
        itemGroup.add(beam);
        
        // Store reference to light beam
        this.lightBeams.set(item.id, {
            light: light,
            beam: beam,
            intensity: 1.0
        });
    }
    
    /**
     * Update all dropped items
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update each dropped item
        for (const [id, itemData] of this.droppedItems.entries()) {
            // Update item model animations
            if (itemData.model) {
                itemData.model.updateAnimations(delta);
            }
            
            // Update light beam effect
            if (this.lightBeams.has(id)) {
                const lightBeam = this.lightBeams.get(id);
                
                // Pulse the light
                const time = Date.now() * 0.001; // Convert to seconds
                const pulseIntensity = 0.7 + Math.sin(time * 2) * 0.3;
                
                lightBeam.light.intensity = pulseIntensity;
                
                // Rotate the beam slightly
                if (lightBeam.beam) {
                    lightBeam.beam.rotation.y += delta * 0.5;
                }
            }
            
            // Check if player is close enough to pick up
            if (this.game && this.game.player) {
                const playerPosition = this.game.player.getPosition();
                const itemPosition = itemData.group.position;
                
                const distance = playerPosition.distanceTo(itemPosition);
                
                // Auto-pickup if player is close enough
                if (distance < 1.5) {
                    this.pickupItem(id);
                }
            }
        }
    }
    
    /**
     * Pick up an item
     * @param {string} itemId - The ID of the item to pick up
     */
    pickupItem(itemId) {
        // Get item data
        const itemData = this.droppedItems.get(itemId);
        if (!itemData) return;
        
        // Add to player inventory
        if (this.game && this.game.player) {
            this.game.player.addToInventory(itemData.item);
            
            // Show notification
            if (this.game.hudManager) {
                this.game.hudManager.showNotification(`Picked up ${itemData.item.name}`);
            }
        }
        
        // Remove from scene
        if (itemData.group) {
            this.scene.remove(itemData.group);
        }
        
        // Remove from maps
        this.droppedItems.delete(itemId);
        this.lightBeams.delete(itemId);
    }
    
    /**
     * Remove all dropped items
     */
    clear() {
        // Remove all items from scene
        for (const [id, itemData] of this.droppedItems.entries()) {
            if (itemData.group) {
                this.scene.remove(itemData.group);
            }
        }
        
        // Clear maps
        this.droppedItems.clear();
        this.lightBeams.clear();
    }
}