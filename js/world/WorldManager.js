import * as THREE from 'three';
import { TerrainManager } from './terrain/TerrainManager.js';
import { StructureManager } from './structures/StructureManager.js';
import { EnvironmentManager } from './environment/EnvironmentManager.js';
import { InteractiveObjectManager } from './interactive/InteractiveObjectManager.js';
import { ZoneManager } from './zones/ZoneManager.js';
import { LightingManager } from './lighting/LightingManager.js';
import { FogManager } from './environment/FogManager.js';
import { SkyManager } from './environment/SkyManager.js';
import { TeleportManager } from './teleport/TeleportManager.js';
import { MapLoader } from './utils/MapLoader.js';

/**
 * Main World Manager class that coordinates all world-related systems
 * Simplified to focus only on loading existing maps rather than generating content
 */
export class WorldManager {
    constructor(scene, loadingManager, game) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.game = game;
        
        // Initialize managers
        this.lightingManager = new LightingManager(scene);
        this.skyManager = new SkyManager(scene);
        this.fogManager = new FogManager(scene, this, game);
        this.terrainManager = new TerrainManager(scene, this, game);
        this.structureManager = new StructureManager(scene, this, game);
        this.environmentManager = new EnvironmentManager(scene, this, game);
        this.interactiveManager = new InteractiveObjectManager(scene, this, game);
        this.zoneManager = new ZoneManager(scene, this, game);
        this.teleportManager = new TeleportManager(scene, this, game);
        
        // Map loader for loading existing maps
        this.mapLoader = new MapLoader(this);
        
        // For minimap features
        this.terrainFeatures = [];
        this.trees = [];
        this.rocks = [];
        this.buildings = [];
        this.paths = [];
        
        // Path navigation and loading
        this.pathNodes = [];
        this.loadedMapPaths = [];
        this.lastPathGenerationPosition = new THREE.Vector3(0, 0, 0);
        
        // Track if map is loaded
        this.mapLoaded = false;
        
        // Track current map information
        this.currentMapId = null;
        this.currentMapName = null;
        this.currentMapFilename = null;
        
        // Default map path
        this.defaultMapPath = '/assets/default-map.json';
    }
    
    /**
     * Initialize the world by loading the default map
     * @returns {Promise<boolean>} - True if initialization was successful
     */
    async init() {
        console.debug("Initializing world...");
        
        // Initialize lighting and fog
        this.lightingManager.init();
        this.fogManager.initFog();
        
        // Initialize terrain
        await this.terrainManager.init();
        
        // Initialize managers - no content generation, just setup
        this.zoneManager.init();
        this.structureManager.init(false); // false = don't create initial structures
        this.interactiveManager.init(false); // false = don't create initial objects
        this.teleportManager.init();
        
        // Load the default map
        await this.loadDefaultMap();
        
        console.debug("World initialization complete");
        return true;
    }
    
    /**
     * Load the default map from JSON file
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadDefaultMap() {
        console.debug("Loading default map...");
        
        // Show loading message if UI is available
        if (this.game && this.game.ui) {
            this.game.ui.showMessage("Loading world...", 0);
        }
        
        // Load the default map using the MapLoader
        const success = await this.mapLoader.loadMapFromFile(this.defaultMapPath);
        
        // Hide loading message
        if (this.game && this.game.ui) {
            this.game.ui.hideMessage();
        }
        
        if (success) {
            this.mapLoaded = true;
            this.currentMapId = 'default-map';
            this.currentMapName = 'Default Map';
            this.currentMapFilename = 'default-map.json';
            console.debug("Default map loaded successfully");
            
            // Notify other systems that the world has changed
            if (this.game && this.game.events) {
                this.game.events.emit('worldChanged', {
                    mapId: this.currentMapId,
                    mapName: this.currentMapName,
                    filename: this.currentMapFilename
                });
            }
        } else {
            console.error("Failed to load default map");
        }
        
        return success;
    }
    
    /**
     * Pre-generate terrain chunks around the starting position
     * @returns {Promise<boolean>} - True if pre-generation was successful
     * 
     * Note: For pre-made maps, this is a no-op placeholder to satisfy the Game.js call
     * since terrain is defined in the map JSON rather than procedurally generated
     */
    async preGenerateTerrain() {
        console.debug("Using pre-made map, skipping terrain pre-generation");
        
        // Update loading UI if needed
        if (this.game && this.game.ui) {
            this.game.ui.updateLoadingProgress?.(35, 'Loading map terrain...');
        }
        
        // Return true immediately since we're using pre-made maps
        return true;
    }
    
    /**
     * Load a specific map by filename
     * @param {string} mapFilename - The filename of the map to load
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadMap(mapFilename) {
        console.debug(`Loading map: ${mapFilename}`);
        
        // Show loading message if UI is available
        if (this.game && this.game.ui) {
            this.game.ui.showMessage("Loading world...", 0);
        }
        
        // Determine the map path
        const mapPath = mapFilename.startsWith('/') 
            ? mapFilename 
            : `/assets/maps/${mapFilename}`;
        
        // Load the map using the MapLoader
        const success = await this.mapLoader.loadMapFromFile(mapPath);
        
        // Hide loading message
        if (this.game && this.game.ui) {
            this.game.ui.hideMessage();
        }
        
        if (success) {
            this.mapLoaded = true;
            
            // Extract map ID from filename (remove .json extension)
            this.currentMapFilename = mapFilename;
            this.currentMapId = mapFilename.replace('.json', '');
            this.currentMapName = this.currentMapId; // Will be updated if we have map metadata
            
            console.debug(`Map ${mapFilename} loaded successfully`);
            
            // Notify other systems that the world has changed
            if (this.game && this.game.events) {
                this.game.events.emit('worldChanged', {
                    mapId: this.currentMapId,
                    mapName: this.currentMapName,
                    filename: this.currentMapFilename
                });
            }
        } else {
            console.error(`Failed to load map: ${mapFilename}`);
        }
        
        return success;
    }
    
    /**
     * Clear the current map and return to the default map
     * @returns {Promise<boolean>} - True if clearing was successful
     */
    async clearCurrentMap() {
        console.debug("Clearing current map and returning to default...");
        
        // Show loading message if UI is available
        if (this.game && this.game.ui) {
            this.game.ui.showMessage("Loading default world...", 0);
        }
        
        // Load the default map
        const success = await this.loadDefaultMap();
        
        // Hide loading message
        if (this.game && this.game.ui) {
            this.game.ui.hideMessage();
        }
        
        if (success) {
            console.debug("Successfully returned to default map");
            
            // Notify other systems that the world has changed
            if (this.game && this.game.events) {
                this.game.events.emit('worldChanged', {
                    mapId: this.currentMapId,
                    mapName: this.currentMapName,
                    filename: this.currentMapFilename
                });
            }
        } else {
            console.error("Failed to return to default map");
        }
        
        return success;
    }

    /**
     * Get terrain height at a specific position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} - Height at the position
     */
    getTerrainHeight(x, z) {
        // Use terrain manager to get height
        if (this.terrainManager && this.terrainManager.getHeightAt) {
            return this.terrainManager.getHeightAt(x, z);
        }
        
        // Default height if terrain manager is not available
        return 0;
    }

    /**
     * Update the world based on player position
     * @param {THREE.Vector3} playerPosition - The player's current position
     * @param {number} drawDistanceMultiplier - Multiplier for draw distance
     * @param {number} delta - Time since last update (in seconds)
     */
    updateWorldForPlayer(playerPosition, drawDistanceMultiplier = 1.0, delta = 0) {
        // Update terrain manager
        if (this.terrainManager) {
            this.terrainManager.updateForPlayer(playerPosition, drawDistanceMultiplier);
        }
        
        // Update lighting to follow player
        this.updateLighting(playerPosition);
    }

    /**
     * Update lighting based on player position
     * @param {THREE.Vector3} playerPosition - The player's current position
     */
    updateLighting(playerPosition) {
        // Update lighting manager if available
        if (this.lightingManager && this.lightingManager.updateForPlayer) {
            this.lightingManager.updateForPlayer(playerPosition);
        }
    }

    /**
     * Save world state
     * @returns {object} - The saved world state
     */
    save() {
        return {
            mapLoaded: this.mapLoaded,
            currentMapId: this.currentMapId,
            currentMapName: this.currentMapName,
            currentMapFilename: this.currentMapFilename,
            terrainFeatures: this.terrainFeatures,
            trees: this.trees,
            rocks: this.rocks,
            buildings: this.buildings,
            paths: this.paths
        };
    }

    /**
     * Load world state
     * @param {object} worldState - The world state to load
     */
    load(worldState) {
        if (!worldState) return;
        
        this.mapLoaded = worldState.mapLoaded || false;
        this.currentMapId = worldState.currentMapId || null;
        this.currentMapName = worldState.currentMapName || null;
        this.currentMapFilename = worldState.currentMapFilename || null;
        this.terrainFeatures = worldState.terrainFeatures || [];
        this.trees = worldState.trees || [];
        this.rocks = worldState.rocks || [];
        this.buildings = worldState.buildings || [];
        this.paths = worldState.paths || [];
    }

    /**
     * Get interactive objects near a specific position
     * This is a wrapper for interactiveManager.getObjectsNear
     * @param {THREE.Vector3} position - The position to check
     * @param {number} radius - The radius to check
     * @returns {Array} - Array of interactive objects within the radius
     */
    getInteractiveObjectsNear(position, radius) {
        if (this.interactiveManager && this.interactiveManager.getObjectsNear) {
            return this.interactiveManager.getObjectsNear(position, radius);
        }
        return [];
    }

    /**
     * Hint the JavaScript engine to perform garbage collection
     * This is called after significant cleanup operations to help free memory
     */
    hintGarbageCollection() {
        // Try to hint garbage collection if available
        if (typeof window !== 'undefined' && window.gc) {
            // Manual garbage collection is available (Chrome with --js-flags="--expose-gc")
            try {
                window.gc();
                console.debug('Manual garbage collection triggered');
            } catch (e) {
                console.debug('Manual garbage collection failed:', e.message);
            }
        } else {
            // Fallback: create a small delay to allow natural garbage collection
            // This gives the JS engine a chance to clean up during the next idle period
            setTimeout(() => {
                // Force a small allocation to potentially trigger GC
                const temp = new Array(1000).fill(null);
                temp.length = 0;
            }, 0);
            console.debug('Garbage collection hint scheduled');
        }
    }
}
