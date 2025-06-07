import * as THREE from 'three';
import { Tree } from './Tree.js';
import { Rock } from './Rock.js';
import { Bush } from './Bush.js';
import { Flower } from './Flower.js';
import { TallGrass } from './TallGrass.js';
import { AncientTree } from './AncientTree.js';
import { TreeCluster } from './TreeCluster.js';
import { RandomGenerator } from '../utils/RandomGenerator.js';
import { EnvironmentFactory } from './EnvironmentFactory.js';

/**
 * Manages environment objects like trees, rocks, bushes, etc.
 * Fully randomized with natural grouping of similar objects
 * Optimized with tree clustering for better performance
 */
export class EnvironmentManager {
    constructor(scene, worldManager, game = null) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.game = game;
        
        // Initialize the environment factory
        this.environmentFactory = new EnvironmentFactory(scene, worldManager);
        
        // Environment object collections
        this.environmentObjects = {}; // Object to track environment objects by chunk key
        this.visibleChunks = {}; // Empty object for compatibility with old system
        
        // Get environment object types from factory and add traditional types
        const factoryTypes = this.environmentFactory.getRegisteredTypes();
        const traditionalTypes = [
            'tree', 'rock', 'bush', 'flower', 'tall_grass', 'ancient_tree', 'small_plant',
            'fallen_log', 'mushroom', 'rock_formation', 'shrine', 'stump', 'waterfall'
        ];
        
        // Combine both sets of types, removing duplicates
        this.environmentObjectTypes = [...new Set([...traditionalTypes, ...factoryTypes])];
        
        // For minimap functionality
        this.trees = [];
        this.treeClusters = []; // New array for tree clusters
        this.rocks = [];
        this.bushes = [];
        this.flowers = [];
        this.tallGrass = [];
        this.ancientTrees = [];
        this.smallPlants = [];
        this.fallenLogs = [];
        this.mushrooms = [];
        this.rockFormations = [];
        this.shrines = [];
        this.stumps = [];
        this.waterfalls = [];
        this.crystalFormations = [];
        this.mosses = [];
        
        // Performance optimization settings
        this.useTreeClustering = true; // Enable tree clustering by default
        this.clusterThreshold = 5; // Minimum number of trees to form a cluster
        this.maxTreesPerCluster = 30; // Maximum number of trees in a single cluster
        this.clusterRadius = 20; // Maximum radius for a tree cluster
        
        // Last player position for distance tracking
        this.lastPlayerPosition = new THREE.Vector3(0, 0, 0);
        this.minDistanceForNewObject = 80; // Increased from 30 to 80 for mobile performance
        this.lastObjectTime = 0;
        this.objectCooldown = 5000; // Increased from 1000ms to 5000ms for mobile performance
        
        // Natural grouping settings
        this.groupingProbabilities = {
            'tree': 0.9,        // Increased from 80% to 90% chance that trees will be in groups
            'rock': 0.6,        // 60% chance that rocks will be in groups
            'bush': 0.7,        // 70% chance that bushes will be in groups
            'flower': 0.9,      // 90% chance that flowers will be in groups
            'tall_grass': 0.95, // 95% chance that tall grass will be in groups
            'ancient_tree': 0.1, // 10% chance that ancient trees will be in groups (usually solitary)
            'small_plant': 0.85, // 85% chance that small plants will be in groups
            'waterfall': 0.2,   // 20% chance that waterfalls will be in groups (usually solitary)
            'crystal_formation': 0.7 // 70% chance that crystal formations will be in groups
        };
        
        this.groupSizes = {
            'tree': { min: 10, max: 30 },      // Increased from 6-24 to 10-30 for more visible tree groups
            'rock': { min: 2, max: 6 },        // Rocks come in groups of 2-6
            'bush': { min: 3, max: 10 },       // Increased from 2-8 to 3-10
            'flower': { min: 5, max: 15 },     // Flowers come in groups of 5-15
            'tall_grass': { min: 8, max: 20 }, // Tall grass comes in patches of 8-20
            'ancient_tree': { min: 1, max: 3 }, // Ancient trees are usually solitary, max 3
            'small_plant': { min: 6, max: 18 }, // Small plants come in groups of 6-18
            'waterfall': { min: 1, max: 3 },   // Waterfalls come in groups of 1-3
            'crystal_formation': { min: 3, max: 8 } // Crystal formations come in groups of 3-8
        };
        
        // Group spread determines how tightly packed the groups are
        this.groupSpread = {
            'tree': 12,        // Increased from 8 to 12 to spread trees more
            'rock': 5,         // Rocks spread up to 5 units from center
            'bush': 6,         // Bushes spread up to 6 units from center
            'flower': 4,       // Flowers spread up to 4 units from center
            'tall_grass': 8,   // Tall grass spreads up to 8 units from center
            'ancient_tree': 20, // Ancient trees spread up to 20 units from center (when grouped)
            'small_plant': 5,  // Small plants spread up to 5 units from center
            'waterfall': 30,   // Waterfalls spread up to 30 units from center (when grouped)
            'crystal_formation': 10 // Crystal formations spread up to 10 units from center
        };
        
        // Create some initial environment objects
        this.createInitialEnvironment();
    }
    
    /**
     * Create initial environment objects around the starting area
     */
    createInitialEnvironment() {
        // Use a specific chunk key for the starting area
        const startingChunkKey = "starting-area";
        const startingAreaObjects = [];
        
        // Create a larger forest near the starting position (3x more trees)
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 10 + Math.random() * 20; // Reduced distance
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            const tree = this.createTree(x, z);
            if (tree) {
                startingAreaObjects.push({
                    type: 'tree',
                    object: tree,
                    position: new THREE.Vector3(x, 0, z)
                });
                this.trees.push(tree);
            }
        }
        
        // Add some rocks
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 15; // Reduced distance
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            const rock = this.createRock(x, z);
            if (rock) {
                startingAreaObjects.push({
                    type: 'rock',
                    object: rock,
                    position: new THREE.Vector3(x, 0, z)
                });
                this.rocks.push(rock);
            }
        }
        
        // Store the starting area objects in the environmentObjects object
        this.environmentObjects[startingChunkKey] = startingAreaObjects;
        
        console.debug("Initial environment objects created");
    }
    
    /**
     * Update environment objects based on player position
     * @param {THREE.Vector3} playerPosition - The player's current position
     * @param {number} drawDistanceMultiplier - Multiplier for draw distance (not used in simplified version)
     */
    updateForPlayer(playerPosition, drawDistanceMultiplier = 1.0) {
        // Check if player has moved far enough to generate a new random object
        this.checkForRandomObject(playerPosition);
    }
    
    /**
     * Check if player has moved far enough to generate a new random environment object
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    checkForRandomObject(playerPosition) {
        // Calculate distance moved since last object
        const distanceMoved = playerPosition.distanceTo(this.lastPlayerPosition);
        const currentTime = Date.now();
        const timeSinceLastObject = currentTime - this.lastObjectTime;
        
        // Only generate a new object if player has moved far enough and enough time has passed
        if (distanceMoved >= this.minDistanceForNewObject && timeSinceLastObject >= this.objectCooldown) {
            // Update last position and time
            this.lastPlayerPosition.copy(playerPosition);
            this.lastObjectTime = currentTime;
            
            // 20% chance to generate an object when conditions are met (reduced from 40%)
            if (Math.random() < 1) {
                this.generateRandomObject(playerPosition);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Generate a random environment object or group near the player
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    generateRandomObject(playerPosition) {
        // Choose a random object type with higher probability for trees
        // 60% chance for trees, 40% chance for other object types
        const randomValue = Math.random();
        let randomType;
        
        if (randomValue < 0.6) {
            // 60% chance to generate a tree
            randomType = 'tree';
        } else {
            // Get all available types from both traditional and factory methods
            const availableTypes = [...this.environmentObjectTypes];
            
            // Add factory-specific types that might not be in the traditional list
            const factoryTypes = this.environmentFactory.getRegisteredTypes();
            factoryTypes.forEach(type => {
                if (!availableTypes.includes(type)) {
                    availableTypes.push(type);
                }
            });
            
            // Filter out 'tree' since we already handled it
            const otherTypes = availableTypes.filter(type => type !== 'tree');
            randomType = otherTypes[Math.floor(Math.random() * otherTypes.length)];
        }
        
        // Generate a position that's visible but not too close to the player
        // Random angle and distance between 30-100 units from player
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 70;
        
        const centerX = playerPosition.x + Math.cos(angle) * distance;
        const centerZ = playerPosition.z + Math.sin(angle) * distance;
        
        // Create a chunk key for this random object
        // Use a grid-based approach to determine the chunk
        const chunkSize = 100; // Size of each chunk in world units
        const chunkX = Math.floor(centerX / chunkSize);
        const chunkZ = Math.floor(centerZ / chunkSize);
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Initialize the chunk if it doesn't exist
        if (!this.environmentObjects[chunkKey]) {
            this.environmentObjects[chunkKey] = [];
        }
        
        // Determine if we should create a group or a single object
        const createGroup = Math.random() < this.groupingProbabilities[randomType];
        
        if (createGroup) {
            // Create a group of objects
            const groupSize = Math.floor(
                this.groupSizes[randomType].min + 
                Math.random() * (this.groupSizes[randomType].max - this.groupSizes[randomType].min)
            );
            
            const spread = this.groupSpread[randomType];
            const groupObjects = [];
            
            console.debug(`Generating a group of ${groupSize} ${randomType}s at (${centerX.toFixed(1)}, ${centerZ.toFixed(1)})`);
            
            // Create objects in a natural-looking group pattern
            for (let i = 0; i < groupSize; i++) {
                // For natural grouping, use a combination of random and patterned placement
                let objectX, objectZ;
                
                if (i === 0) {
                    // First object at center
                    objectX = centerX;
                    objectZ = centerZ;
                } else {
                    // Subsequent objects in a natural pattern
                    // Use polar coordinates for more natural grouping
                    const groupAngle = Math.random() * Math.PI * 2;
                    
                    // Distance from center increases slightly with each object
                    // but with some randomness for natural look
                    const groupDistance = Math.random() * spread * (i / groupSize + 0.3);
                    
                    objectX = centerX + Math.cos(groupAngle) * groupDistance;
                    objectZ = centerZ + Math.sin(groupAngle) * groupDistance;
                }
                
                // Create the object
                let object = null;
                
                // Vary sizes slightly within a group for natural look
                const scaleFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                
                // Create the object using the factory
                object = this.createEnvironmentObject(randomType, objectX, objectZ, scaleFactor);
                
                if (object) {
                    // Add to environment objects for this chunk
                    this.environmentObjects[chunkKey].push({
                        type: randomType,
                        object: object,
                        position: new THREE.Vector3(objectX, 0, objectZ),
                        groupId: `group_${Date.now()}_${randomType}` // Track group membership
                    });
                    
                    groupObjects.push(object);
                }
            }
            
            console.debug(`Created group of ${groupObjects.length} ${randomType}s`);
        } else {
            // Create a single object
            let object = null;
            
            // Create the object using the factory
            object = this.createEnvironmentObject(randomType, centerX, centerZ);
            
            if (object) {
                console.debug(`Generated single ${randomType} at (${centerX.toFixed(1)}, ${centerZ.toFixed(1)})`);
                
                // Add to environment objects for this chunk
                this.environmentObjects[chunkKey].push({
                    type: randomType,
                    object: object,
                    position: new THREE.Vector3(centerX, 0, centerZ)
                });
            }
        }
        
        // Limit the number of environment objects to prevent memory issues
        // Count total objects across all chunks
        let totalObjects = 0;
        for (const key in this.environmentObjects) {
            totalObjects += this.environmentObjects[key].length;
        }
        
        const maxObjects = 500; // Increased from 150 to 500 to accommodate more trees
        if (totalObjects > maxObjects) {
            // Find the oldest chunk (assuming the first one added is the oldest)
            const oldestChunkKey = Object.keys(this.environmentObjects)[0];
            if (oldestChunkKey && this.environmentObjects[oldestChunkKey]) {
                // Remove objects from the oldest chunk
                const objectsToRemove = totalObjects - maxObjects;
                const chunkObjects = this.environmentObjects[oldestChunkKey];
                
                // Remove objects up to the number needed or all in the chunk
                const removeCount = Math.min(objectsToRemove, chunkObjects.length);
                
                for (let i = 0; i < removeCount; i++) {
                    if (chunkObjects.length > 0) {
                        const oldestObject = chunkObjects.shift();
                        if (oldestObject && oldestObject.object && oldestObject.object.parent) {
                            this.scene.remove(oldestObject.object);
                            
                            // Also remove from type-specific arrays
                            switch (oldestObject.type) {
                                case 'tree':
                                    this.trees = this.trees.filter(t => t !== oldestObject.object);
                                    break;
                                case 'rock':
                                    this.rocks = this.rocks.filter(r => r !== oldestObject.object);
                                    break;
                                case 'bush':
                                    this.bushes = this.bushes.filter(b => b !== oldestObject.object);
                                    break;
                                case 'flower':
                                    this.flowers = this.flowers.filter(f => f !== oldestObject.object);
                                    break;
                            }
                        }
                    }
                }
                
                // If the chunk is now empty, remove it
                if (chunkObjects.length === 0) {
                    delete this.environmentObjects[oldestChunkKey];
                }
            }
        }
    }
    
    // The generateEnvironmentObjects method has been removed
    // Environment objects are now created using the factory system
    
    /**
     * Remove environment objects for a specific chunk
     * @param {string} chunkKey - The chunk key
     * @param {boolean} disposeResources - Whether to dispose of geometries and materials
     */
    removeChunkObjects(chunkKey, disposeResources = false) {
        // Remove environment objects from scene
        if (this.environmentObjects[chunkKey]) {
            this.environmentObjects[chunkKey].forEach(item => {
                if (item.object) {
                    // Remove from scene if it's in the scene
                    if (item.object.parent) {
                        this.scene.remove(item.object);
                    }
                    
                    // Dispose of geometries and materials if requested
                    if (disposeResources) {
                        if (item.object.geometry) {
                            item.object.geometry.dispose();
                        }
                        
                        if (item.object.material) {
                            // Handle both single materials and material arrays
                            if (Array.isArray(item.object.material)) {
                                item.object.material.forEach(material => {
                                    if (material.map) material.map.dispose();
                                    material.dispose();
                                });
                            } else {
                                if (item.object.material.map) item.object.material.map.dispose();
                                item.object.material.dispose();
                            }
                        }
                        
                        // Handle child objects if any
                        if (item.object.children && item.object.children.length > 0) {
                            item.object.children.forEach(child => {
                                if (child.geometry) child.geometry.dispose();
                                if (child.material) {
                                    if (Array.isArray(child.material)) {
                                        child.material.forEach(material => {
                                            if (material.map) material.map.dispose();
                                            material.dispose();
                                        });
                                    } else {
                                        if (child.material.map) child.material.map.dispose();
                                        child.material.dispose();
                                    }
                                }
                            });
                        }
                    }
                }
            });
            
            // If disposing resources, remove the chunk data completely
            if (disposeResources) {
                delete this.environmentObjects[chunkKey];
                console.debug(`Disposed environment objects for chunk ${chunkKey}`);
            }
        }
        
        // Remove the chunk from the visible chunks
        delete this.visibleChunks[chunkKey];
    }
    
    /**
     * Load environment objects for a chunk from saved data
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @param {Array} environmentObjects - Array of environment object data
     */
    loadEnvironmentObjectsForChunk(chunkX, chunkZ, environmentObjects) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Skip if already loaded
        if (this.environmentObjects[chunkKey]) {
            return;
        }
        
        // Create objects from saved data
        const objects = [];
        
        for (const objData of environmentObjects) {
            // Create the object based on saved type and position
            let object;
            const x = objData.position.x;
            const z = objData.position.z;
            const size = objData.size || 1;
            
            // Create the object using the factory
            object = this.createEnvironmentObject(objData.type, x, z, size, objData.data);
            
            if (object) {
                // Store object with its type and position for persistence
                objects.push({
                    type: objData.type,
                    object: object,
                    position: new THREE.Vector3(x, this.worldManager.getTerrainHeight(x, z), z)
                });
            }
        }
        
        // Store environment objects for this chunk
        this.environmentObjects[chunkKey] = objects;
    }
    
    /**
     * Get the zone type at a specific position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {string} - The zone type (Forest, Desert, etc.)
     */
    getZoneTypeAt(x, z) {
        // Use the world manager to get the zone at this position
        if (this.worldManager && this.worldManager.getZoneAt) {
            const position = new THREE.Vector3(x, 0, z);
            const zone = this.worldManager.getZoneAt(position);
            if (zone) {
                return zone.name;
            }
        }
        
        // Default to Forest if no zone found
        return 'Forest';
    }
    
    /**
     * Create an environment object using the factory
     * @param {string} type - The type of environment object to create
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {number} size - Size of the object (optional)
     * @param {Object} data - Additional data for complex objects (optional)
     * @returns {THREE.Object3D} - The created environment object
     */
    createEnvironmentObject(type, x, z, size = 1, data = null) {
        // Create position object with terrain height
        const position = new THREE.Vector3(
            x, 
            this.worldManager.getTerrainHeight(x, z), 
            z
        );
        
        // Check if the factory supports this type
        if (!this.environmentFactory.hasType(type)) {
            console.warn(`Environment type ${type} not registered in factory`);
            return null;
        }
        
        // Create the object using the factory
        const object = this.environmentFactory.create(type, position, size, data);
        
        if (object) {
            // Add to the appropriate tracking array if it exists
            const trackingArrayName = this.getTrackingArrayName(type);
            if (this[trackingArrayName]) {
                this[trackingArrayName].push(object);
            }
            
            return object;
        }
        
        return null;
    }
    
    /**
     * Get the name of the tracking array for a given environment object type
     * @param {string} type - The type of environment object
     * @returns {string} - The name of the tracking array
     */
    getTrackingArrayName(type) {
        // Convert type to camelCase for array name (e.g., 'crystal_formation' -> 'crystalFormations')
        const parts = type.split('_');
        const camelCase = parts.map((part, index) => {
            if (index === 0) return part;
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
        
        // Add 's' for plural
        return camelCase + 's';
    }

    /**
     * Clear all environment objects
     */
    clear() {
        // Remove all environment objects from the scene
        for (const chunkKey in this.environmentObjects) {
            this.environmentObjects[chunkKey].forEach(item => {
                if (item.object && item.object.parent) {
                    this.scene.remove(item.object);
                }
            });
        }
        
        // Reset collections
        this.environmentObjects = {};
        this.visibleChunks = {};
        
        // Reset tracking arrays
        this.trees = [];
        this.rocks = [];
        this.bushes = [];
        this.flowers = [];
        this.tallGrass = [];
        this.ancientTrees = [];
        this.smallPlants = [];
        this.fallenLogs = [];
        this.mushrooms = [];
        this.rockFormations = [];
        this.shrines = [];
        this.stumps = [];
    }
}