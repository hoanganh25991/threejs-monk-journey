import * as THREE from 'three';
import { TerrainManager } from './terrain/TerrainManager.js';
import { StructureManager } from './structures/StructureManager.js';
import { EnvironmentManager } from './environment/EnvironmentManager.js';
import { InteractiveObjectManager } from './interactive/InteractiveObjectManager.js';
import { ZoneManager } from './zones/ZoneManager.js';
import { LightingManager } from './lighting/LightingManager.js';

/**
 * Main World Manager class that coordinates all world-related systems
 */
export class WorldManager {
    constructor(scene, loadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        
        // Reference to the game instance (will be set by Game.js)
        this.game = null;
        
        // Initialize managers
        this.lightingManager = new LightingManager(scene);
        this.terrainManager = new TerrainManager(scene, this);
        this.structureManager = new StructureManager(scene, this);
        this.environmentManager = new EnvironmentManager(scene, this);
        this.interactiveManager = new InteractiveObjectManager(scene, this);
        this.zoneManager = new ZoneManager(scene, this);
        
        // For screen-based enemy spawning
        this.lastPlayerPosition = new THREE.Vector3(0, 0, 0);
        this.screenSpawnDistance = 20; // Distance to move before spawning new enemies
        
        // For save/load functionality
        this.savedData = null;
        
        // For minimap features
        this.terrainFeatures = [];
        this.trees = [];
        this.rocks = [];
        this.buildings = [];
        this.paths = [];
    }
    
    /**
     * Set the game reference
     * @param {Game} game - The game instance
     */
    setGame(game) {
        this.game = game;
        
        // Pass game reference to all managers
        this.terrainManager.setGame(game);
        this.structureManager.setGame(game);
        this.environmentManager.setGame(game);
        this.interactiveManager.setGame(game);
        this.zoneManager.setGame(game);
    }
    
    /**
     * Initialize the world
     * @returns {Promise<boolean>} - True if initialization was successful
     */
    async init() {
        console.log("Initializing world...");
        
        // Initialize lighting
        this.lightingManager.init();
        
        // Initialize terrain
        await this.terrainManager.init();
        
        // Initialize structures
        this.structureManager.init();
        
        // Initialize zones
        this.zoneManager.init();
        
        // Initialize interactive objects
        this.interactiveManager.init();
        
        console.log("World initialization complete");
        return true;
    }
    
    /**
     * Update the world based on player position
     * @param {THREE.Vector3} playerPosition - The player's current position
     * @param {number} drawDistanceMultiplier - Multiplier for draw distance
     */
    updateWorldForPlayer(playerPosition, drawDistanceMultiplier = 1.0) {
        // Update terrain chunks
        this.terrainManager.updateForPlayer(playerPosition, drawDistanceMultiplier);
        
        // Update environment objects
        this.environmentManager.updateForPlayer(playerPosition, drawDistanceMultiplier);
        
        // Check if player has moved far enough for screen-based enemy spawning
        const distanceMoved = playerPosition.distanceTo(this.lastPlayerPosition);
        if (distanceMoved >= this.screenSpawnDistance) {
            // Update last position
            this.lastPlayerPosition.copy(playerPosition);
            
            // Notify game that player has moved a screen distance (for enemy spawning)
            if (this.game && this.game.enemyManager) {
                this.game.enemyManager.onPlayerMovedScreenDistance(playerPosition);
            }
        }
        
        // Update fog density based on draw distance for atmospheric effect
        if (this.game && this.game.scene.fog) {
            // Adjust fog density inversely to draw distance
            this.game.scene.fog.density = 0.002 * (1 / drawDistanceMultiplier);
        }
    }
    
    /**
     * Get the terrain height at a specific world position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} - The height of the terrain at the specified position
     */
    getTerrainHeight(x, z) {
        return this.terrainManager.getTerrainHeight(x, z);
    }
    
    /**
     * Get the zone at a specific world position
     * @param {THREE.Vector3} position - The position to check
     * @returns {object|null} - The zone at the specified position, or null if none
     */
    getZoneAt(position) {
        return this.zoneManager.getZoneAt(position);
    }
    
    /**
     * Get interactive objects near a specific position
     * @param {THREE.Vector3} position - The position to check
     * @param {number} radius - The radius to check
     * @returns {Array} - Array of interactive objects within the radius
     */
    getInteractiveObjectsNear(position, radius) {
        return this.interactiveManager.getObjectsNear(position, radius);
    }
    
    /**
     * Clear all world objects for a clean reload
     */
    clearWorldObjects() {
        this.terrainManager.clear();
        this.structureManager.clear();
        this.environmentManager.clear();
        this.interactiveManager.clear();
        this.zoneManager.clear();
        
        // Clear cached data to prevent memory leaks
        this.terrainFeatures = [];
        this.trees = [];
        this.rocks = [];
        this.buildings = [];
        this.paths = [];
        
        // Force garbage collection hint
        if (window.gc) {
            try {
                window.gc();
            } catch (e) {
                // Ignore if not available
            }
        }
        
        console.log("World objects cleared for reload");
    }
    
    /**
     * Save the current world state
     * @returns {object} - The saved world state
     */
    saveWorldState() {
        const worldState = {
            terrain: this.terrainManager.save(),
            structures: this.structureManager.save(),
            environment: this.environmentManager.save(),
            interactive: this.interactiveManager.save(),
            zones: this.zoneManager.save()
        };
        
        return worldState;
    }
    
    /**
     * Load a saved world state
     * @param {object} worldState - The world state to load
     */
    loadWorldState(worldState) {
        if (!worldState) return;
        
        this.savedData = worldState;
        
        // Clear existing world
        this.clearWorldObjects();
        
        // Load saved state into each manager
        this.terrainManager.load(worldState.terrain);
        this.structureManager.load(worldState.structures);
        this.environmentManager.load(worldState.environment);
        this.interactiveManager.load(worldState.interactive);
        this.zoneManager.load(worldState.zones);
    }
    
    /**
     * Get all entities in the world for the minimap
     * @returns {Array} - Array of entities
     */
    getEntities() {
        const entities = [];
        
        // Add enemies if available
        if (this.game && this.game.enemyManager) {
            entities.push(...this.game.enemyManager.enemies);
        }
        
        // Add interactive objects if available
        if (this.interactiveManager && this.interactiveManager.objects) {
            entities.push(...this.interactiveManager.objects);
        }
        
        return entities;
    }
    
    /**
     * Get terrain features for the minimap
     * @returns {Array} - Array of terrain features
     */
    getTerrainFeatures() {
        // Collect terrain features from various sources
        this.terrainFeatures = [];
        
        // Add terrain features from terrain manager
        if (this.terrainManager && this.terrainManager.terrainMeshes) {
            // Add terrain boundaries as walls
            const terrainSize = this.terrainManager.terrainSize || 100;
            const halfSize = terrainSize / 2;
            
            // Add boundary walls
            for (let i = -halfSize; i <= halfSize; i += 5) {
                // North wall
                this.terrainFeatures.push({
                    type: 'wall',
                    position: { x: i, y: 0, z: -halfSize }
                });
                
                // South wall
                this.terrainFeatures.push({
                    type: 'wall',
                    position: { x: i, y: 0, z: halfSize }
                });
                
                // East wall
                this.terrainFeatures.push({
                    type: 'wall',
                    position: { x: halfSize, y: 0, z: i }
                });
                
                // West wall
                this.terrainFeatures.push({
                    type: 'wall',
                    position: { x: -halfSize, y: 0, z: i }
                });
            }
        }
        
        // Add structures as walls
        if (this.structureManager && this.structureManager.structures) {
            this.structureManager.structures.forEach(structure => {
                this.terrainFeatures.push({
                    type: 'wall',
                    position: structure.position
                });
            });
        }
        
        // Add environment objects
        if (this.environmentManager) {
            // Add trees
            if (this.environmentManager.trees) {
                this.environmentManager.trees.forEach(tree => {
                    this.terrainFeatures.push({
                        type: 'tree',
                        position: tree.position
                    });
                });
            }
            
            // Add rocks
            if (this.environmentManager.rocks) {
                this.environmentManager.rocks.forEach(rock => {
                    this.terrainFeatures.push({
                        type: 'rock',
                        position: rock.position
                    });
                });
            }
            
            // Add water bodies
            if (this.environmentManager.waterBodies) {
                this.environmentManager.waterBodies.forEach(water => {
                    this.terrainFeatures.push({
                        type: 'water',
                        position: water.position
                    });
                });
            }
        }
        
        return this.terrainFeatures;
    }
    
    /**
     * Get trees for the minimap
     * @returns {Array} - Array of trees
     */
    getTrees() {
        this.trees = [];
        
        // Add trees from environment manager
        if (this.environmentManager && this.environmentManager.trees) {
            this.environmentManager.trees.forEach(tree => {
                this.trees.push({
                    position: tree.position
                });
            });
        }
        
        return this.trees;
    }
    
    /**
     * Get rocks for the minimap
     * @returns {Array} - Array of rocks
     */
    getRocks() {
        this.rocks = [];
        
        // Add rocks from environment manager
        if (this.environmentManager && this.environmentManager.rocks) {
            this.environmentManager.rocks.forEach(rock => {
                this.rocks.push({
                    position: rock.position
                });
            });
        }
        
        return this.rocks;
    }
    
    /**
     * Get buildings for the minimap
     * @returns {Array} - Array of buildings
     */
    getBuildings() {
        this.buildings = [];
        
        // Add buildings from structure manager
        if (this.structureManager && this.structureManager.structures) {
            this.structureManager.structures.forEach(structure => {
                if (structure.type === 'building') {
                    this.buildings.push({
                        position: structure.position
                    });
                }
            });
        }
        
        return this.buildings;
    }
    
    /**
     * Get paths for the minimap
     * @returns {Array} - Array of paths
     */
    getPaths() {
        this.paths = [];
        
        // Add paths from environment manager or other sources
        if (this.environmentManager && this.environmentManager.paths) {
            this.environmentManager.paths.forEach(path => {
                this.paths.push({
                    position: path.position,
                    nextPoint: path.nextPoint
                });
            });
        }
        
        return this.paths;
    }
}