import * as THREE from 'three';
import { Building } from './Building.js';
import { Tower } from './Tower.js';
import { Ruins } from './Ruins.js';
import { DarkSanctum } from './DarkSanctum.js';
import { Mountain } from './Mountain.js';
import { Bridge } from './Bridge.js';
import { Village } from './Village.js';
import { RandomGenerator } from '../utils/RandomGenerator.js';

/**
 * Manages structure generation and placement
 */
export class StructureManager {
    constructor(scene, worldManager) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.game = null;
        
        // Structure collections
        this.structures = [];
        this.structuresPlaced = {}; // Track placed structures by chunk key
        this.specialStructures = {}; // Track special structures like Dark Sanctum
        
        // Structure types and densities
        this.structureTypes = [
            'house', 'tower', 'ruins', 'darkSanctum', 
            'mountain', 'bridge', 'village'
        ]; // Types of structures
        
        this.structureDensity = {
            'house': 0.001,      // Individual houses
            'tower': 0.0008,     // Watchtowers
            'ruins': 0.0008,     // Ancient ruins
            'darkSanctum': 0.0002, // Rare dark sanctums
            'mountain': 0.0005,  // Mountains (less frequent but impactful)
            'bridge': 0.0003,    // Bridges (rare, placed over water/valleys)
            'village': 0.0002    // Villages (rare, contains multiple buildings)
        };
    }
    
    /**
     * Set the game reference
     * @param {Game} game - The game instance
     */
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Initialize the structure system
     */
    init() {
        // Create initial structures near the player's starting position
        this.createRuins(0, 0);
        
        // Create Dark Sanctum as a landmark
        this.createDarkSanctum(0, -40);
        
        // Mark these initial structures as placed
        this.specialStructures['initial_ruins'] = { x: 0, z: 0, type: 'ruins' };
        this.specialStructures['initial_darkSanctum'] = { x: 0, z: -40, type: 'darkSanctum' };
        
        console.debug("Initial structures created");
    }
    
    /**
     * Generate structures for a specific chunk
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @param {boolean} dataOnly - If true, only generate data without creating 3D objects
     */
    generateStructuresForChunk(chunkX, chunkZ, dataOnly = false) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Skip if structures already generated for this chunk
        if (this.structuresPlaced[chunkKey]) {
            return;
        }
        
        // Mark this chunk as processed
        this.structuresPlaced[chunkKey] = [];
        
        // Calculate world coordinates for this chunk
        const worldX = chunkX * this.worldManager.terrainManager.terrainChunkSize;
        const worldZ = chunkZ * this.worldManager.terrainManager.terrainChunkSize;
        
        // Use seeded random for consistent generation
        const random = RandomGenerator.seededRandom(chunkKey);
        
        // Determine if this chunk should have a Dark Sanctum (very rare)
        if (random() < this.structureDensity.darkSanctum) {
            const x = worldX + random() * this.worldManager.terrainManager.terrainChunkSize;
            const z = worldZ + random() * this.worldManager.terrainManager.terrainChunkSize;
            
            // Check if we're too close to an existing Dark Sanctum
            let tooClose = false;
            for (const key in this.specialStructures) {
                if (this.specialStructures[key].type === 'darkSanctum') {
                    const dx = this.specialStructures[key].x - x;
                    const dz = this.specialStructures[key].z - z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    if (distance < 200) { // Minimum distance between Dark Sanctums
                        tooClose = true;
                        break;
                    }
                }
            }
            
            if (!tooClose) {
                // Store the structure data
                this.structuresPlaced[chunkKey].push({ x, z, type: 'darkSanctum' });
                
                // Only create the actual 3D object if not in data-only mode
                if (!dataOnly) {
                    this.createDarkSanctum(x, z);
                    this.specialStructures[`darkSanctum_${chunkKey}_${this.structuresPlaced[chunkKey].length - 1}`] = { 
                        x, z, type: 'darkSanctum' 
                    };
                }
            }
        }
        
        // Generate houses
        const terrainChunkSize = this.worldManager.terrainManager.terrainChunkSize;
        for (let i = 0; i < Math.floor(terrainChunkSize * terrainChunkSize * this.structureDensity.house); i++) {
            const x = worldX + random() * terrainChunkSize;
            const z = worldZ + random() * terrainChunkSize;
            
            // Randomize house dimensions
            const width = 3 + random() * 5;
            const depth = 3 + random() * 5;
            const height = 2 + random() * 5;
            
            // Store the structure data
            this.structuresPlaced[chunkKey].push({ 
                x, z, type: 'house', 
                dimensions: { width, depth, height } 
            });
            
            // Only create the actual 3D object if not in data-only mode
            if (!dataOnly) {
                this.createBuilding(x, z, width, depth, height);
            }
        }
        
        // Generate towers
        for (let i = 0; i < Math.floor(terrainChunkSize * terrainChunkSize * this.structureDensity.tower); i++) {
            const x = worldX + random() * terrainChunkSize;
            const z = worldZ + random() * terrainChunkSize;
            
            // Store the structure data
            this.structuresPlaced[chunkKey].push({ x, z, type: 'tower' });
            
            // Only create the actual 3D object if not in data-only mode
            if (!dataOnly) {
                this.createTower(x, z);
            }
        }
        
        // Generate ruins
        for (let i = 0; i < Math.floor(terrainChunkSize * terrainChunkSize * this.structureDensity.ruins); i++) {
            const x = worldX + random() * terrainChunkSize;
            const z = worldZ + random() * terrainChunkSize;
            
            // Store the structure data
            this.structuresPlaced[chunkKey].push({ x, z, type: 'ruins' });
            
            // Only create the actual 3D object if not in data-only mode
            if (!dataOnly) {
                this.createRuins(x, z);
            }
        }
    }
    
    /**
     * Load structures for a chunk from saved data
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @param {Array} structures - Array of structure data
     */
    loadStructuresForChunk(chunkX, chunkZ, structures) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Skip if already loaded
        if (this.structuresPlaced[chunkKey]) {
            return;
        }
        
        // Store the structures data
        this.structuresPlaced[chunkKey] = structures;
        
        // Create the actual 3D objects
        structures.forEach(structure => {
            switch (structure.type) {
                case 'house':
                    this.createBuilding(
                        structure.x, 
                        structure.z, 
                        structure.dimensions.width, 
                        structure.dimensions.depth, 
                        structure.dimensions.height
                    );
                    break;
                case 'tower':
                    this.createTower(structure.x, structure.z);
                    break;
                case 'ruins':
                    this.createRuins(structure.x, structure.z);
                    break;
                case 'darkSanctum':
                    this.createDarkSanctum(structure.x, structure.z);
                    this.specialStructures[`darkSanctum_${chunkKey}_${this.structuresPlaced[chunkKey].indexOf(structure)}`] = { 
                        x: structure.x, z: structure.z, type: 'darkSanctum' 
                    };
                    break;
            }
        });
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
     * Create a building at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {number} width - Building width
     * @param {number} depth - Building depth
     * @param {number} height - Building height
     * @returns {THREE.Group} - The building group
     */
    createBuilding(x, z, width, depth, height) {
        const zoneType = this.getZoneTypeAt(x, z);
        const building = new Building(width, depth, height, zoneType);
        const buildingGroup = building.createMesh();
        
        // Position building on terrain
        buildingGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(buildingGroup);
        this.structures.push(buildingGroup);
        
        return buildingGroup;
    }
    
    /**
     * Create a tower at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {THREE.Group} - The tower group
     */
    createTower(x, z) {
        const zoneType = this.getZoneTypeAt(x, z);
        const tower = new Tower(zoneType);
        const towerGroup = tower.createMesh();
        
        // Position tower on terrain
        towerGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(towerGroup);
        this.structures.push(towerGroup);
        
        return towerGroup;
    }
    
    /**
     * Create ruins at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {THREE.Group} - The ruins group
     */
    createRuins(x, z) {
        const ruins = new Ruins();
        const ruinsGroup = ruins.createMesh();
        
        // Position ruins on terrain
        ruinsGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(ruinsGroup);
        this.structures.push(ruinsGroup);
        
        return ruinsGroup;
    }
    
    /**
     * Create a dark sanctum at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {THREE.Group} - The dark sanctum group
     */
    createDarkSanctum(x, z) {
        const darkSanctum = new DarkSanctum();
        const sanctumGroup = darkSanctum.createMesh();
        
        // Position sanctum on terrain
        sanctumGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(sanctumGroup);
        this.structures.push(sanctumGroup);
        
        // Add a boss spawn point
        if (this.worldManager && this.worldManager.interactiveManager) {
            this.worldManager.interactiveManager.createBossSpawnPoint(x, z, 'necromancer_lord');
        }
        
        return sanctumGroup;
    }
    
    /**
     * Remove structures in a specific chunk
     * @param {string} chunkKey - The chunk key (x,z format)
     * @param {boolean} disposeResources - Whether to dispose of geometries and materials
     */
    removeStructuresInChunk(chunkKey, disposeResources = false) {
        // Check if we have structures in this chunk
        if (this.structuresPlaced[chunkKey]) {
            // Get structures in this chunk
            const structuresToRemove = this.structures.filter(structure => {
                // Check if structure has position data
                if (structure.userData && structure.userData.chunkKey === chunkKey) {
                    return true;
                }
                return false;
            });
            
            // Remove structures from scene and dispose resources
            structuresToRemove.forEach(structure => {
                // Remove from scene
                if (structure.parent) {
                    this.scene.remove(structure);
                }
                
                // Dispose of resources if requested
                if (disposeResources) {
                    // Dispose of geometry
                    if (structure.geometry) {
                        structure.geometry.dispose();
                    }
                    
                    // Dispose of materials
                    if (structure.material) {
                        if (Array.isArray(structure.material)) {
                            structure.material.forEach(material => {
                                if (material.map) material.map.dispose();
                                material.dispose();
                            });
                        } else {
                            if (structure.material.map) structure.material.map.dispose();
                            structure.material.dispose();
                        }
                    }
                    
                    // Handle child objects
                    if (structure.children && structure.children.length > 0) {
                        structure.children.forEach(child => {
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
            });
            
            // Remove structures from the structures array
            this.structures = this.structures.filter(structure => {
                return !(structure.userData && structure.userData.chunkKey === chunkKey);
            });
            
            // Remove from structuresPlaced
            delete this.structuresPlaced[chunkKey];
            
            console.debug(`Removed ${structuresToRemove.length} structures from chunk ${chunkKey}`);
        }
    }
    
    /**
     * Clear all structures
     */
    clear() {
        // Remove all structures from the scene
        this.structures.forEach(structure => {
            if (structure.parent) {
                this.scene.remove(structure);
            }
            
            // Dispose of geometry
            if (structure.geometry) {
                structure.geometry.dispose();
            }
            
            // Dispose of materials
            if (structure.material) {
                if (Array.isArray(structure.material)) {
                    structure.material.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                    });
                } else {
                    if (structure.material.map) structure.material.map.dispose();
                    structure.material.dispose();
                }
            }
        });
        
        // Reset collections
        this.structures = [];
        this.structuresPlaced = {};
        this.specialStructures = {};
    }
    
    /**
     * Save structure state
     * @returns {object} - The saved structure state
     */
    save() {
        return {
            structuresPlaced: this.structuresPlaced,
            specialStructures: this.specialStructures
        };
    }
    
    /**
     * Load structure state
     * @param {object} structureState - The structure state to load
     */
    load(structureState) {
        if (!structureState) return;
        
        if (structureState.structuresPlaced) {
            this.structuresPlaced = structureState.structuresPlaced;
        }
        
        if (structureState.specialStructures) {
            this.specialStructures = structureState.specialStructures;
        }
    }
}