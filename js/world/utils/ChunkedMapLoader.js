import * as THREE from 'three';

/**
 * Chunked Map Loader - Loads pre-generated maps into the world using a chunking system
 * Integrates with existing WorldManager, StructureManager, and EnvironmentManager
 * Optimized for large maps by loading only visible chunks
 */
export class ChunkedMapLoader {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.scene = worldManager.scene;
        this.game = worldManager.game;
        
        // Track loaded map data
        this.currentMapMetadata = null;
        this.loadedObjects = {};  // Organized by chunk key
        this.loadedChunks = {};   // Track which chunks are currently loaded
        
        // Chunking settings
        this.chunkSize = 25;      // Size of each chunk in world units (reduced to 1/4 of original size)
        this.loadRadius = 2;      // How many chunks to load in each direction from player
        this.lastPlayerChunk = null; // Last player chunk coordinates for change detection
        this.lastPlayerDirection = null; // Last player direction for selective chunk loading
        
        // Anti-eager loading settings
        this.lastUpdateTime = 0;  // Last time chunks were updated
        this.updateCooldown = 3000; // Minimum time between chunk updates (ms)
        this.lastPlayerPosition = null; // Last player position for distance-based updates
        this.minMoveDistance = 10; // Minimum distance player must move to trigger update
        
        // Map storage settings
        this.storageEnabled = true;
        this.storageKeyPrefix = 'monk_journey_map_';
        
        // Spatial index for quick lookup of objects by position
        this.spatialIndex = {
            zones: {},
            paths: {},
            structures: {},
            environment: {}
        };
    }

    /**
     * Load a map from JSON data with chunking support
     * @param {Object} mapData - The map data to load
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadMap(mapData) {
        console.log(`Loading map: ${mapData.theme.name}`);
        
        try {
            // Clear existing world content
            await this.clearWorld();
            
            // Store map metadata (theme, general info)
            this.currentMapMetadata = {
                theme: mapData.theme,
                metadata: mapData.metadata || {},
                bounds: this.calculateMapBounds(mapData)
            };
            
            // Process and chunk the map data
            const chunkedData = this.chunkifyMapData(mapData);
            
            // Store chunked data in localStorage if enabled
            if (this.storageEnabled) {
                this.storeChunkedMapData(chunkedData, mapData.theme.name);
            }
            
            // Set theme colors in zone manager if available
            if (mapData.theme && mapData.theme.colors) {
                this.worldManager.zoneManager.setThemeColors(mapData.theme.colors);
            }
            
            // Load zones globally (zones affect the entire map and are usually small in data size)
            await this.loadZones(mapData.zones);
            
            // Initial load of chunks around starting position (usually 0,0,0)
            const startPosition = new THREE.Vector3(0, 0, 0);
            await this.initialChunkLoad(startPosition);
            
            console.log(`Map "${mapData.theme.name}" loaded successfully (chunked mode)`);
            return true;
            
        } catch (error) {
            console.error('Error loading map:', error);
            return false;
        }
    }

    /**
     * Load a map from a JSON file with chunking support
     * @param {string} mapFilePath - Path to the map JSON file
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadMapFromFile(mapFilePath) {
        try {
            // Check if we already have this map in localStorage
            const mapName = this.extractMapNameFromPath(mapFilePath);
            const cachedMetadata = this.getStoredMapMetadata(mapName);
            
            if (cachedMetadata) {
                console.log(`Loading map "${mapName}" from cache`);
                
                // Set the current map metadata
                this.currentMapMetadata = cachedMetadata;
                
                // Set theme colors in zone manager if available
                if (cachedMetadata.theme && cachedMetadata.theme.colors) {
                    this.worldManager.zoneManager.setThemeColors(cachedMetadata.theme.colors);
                }
                
                // Load zones from cache
                const cachedZones = this.getStoredMapZones(mapName);
                if (cachedZones) {
                    await this.loadZones(cachedZones);
                }
                
                // Initial load of chunks around starting position
                const startPosition = new THREE.Vector3(0, 0, 0);
                await this.initialChunkLoad(startPosition);
                
                console.log(`Map "${mapName}" loaded from cache successfully`);
                return true;
            } else {
                // Not in cache, load from file
                console.log(`Map "${mapName}" not found in cache, loading from file`);
                const response = await fetch(mapFilePath);
                const mapData = await response.json();
                return await this.loadMap(mapData);
            }
        } catch (error) {
            console.error('Error loading map file:', error);
            return false;
        }
    }

    /**
     * Extract map name from file path
     * @param {string} mapFilePath - Path to the map file
     * @returns {string} - Map name
     */
    extractMapNameFromPath(mapFilePath) {
        // Extract filename without extension
        const parts = mapFilePath.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0];
    }

    /**
     * Calculate the bounds of the map from all objects
     * @param {Object} mapData - The map data
     * @returns {Object} - Bounds object with min and max coordinates
     */
    calculateMapBounds(mapData) {
        const bounds = {
            minX: Infinity,
            maxX: -Infinity,
            minZ: Infinity,
            maxZ: -Infinity
        };
        
        // Process zones
        if (mapData.zones) {
            mapData.zones.forEach(zone => {
                if (zone.center) {
                    bounds.minX = Math.min(bounds.minX, zone.center.x - zone.radius);
                    bounds.maxX = Math.max(bounds.maxX, zone.center.x + zone.radius);
                    bounds.minZ = Math.min(bounds.minZ, zone.center.z - zone.radius);
                    bounds.maxZ = Math.max(bounds.maxZ, zone.center.z + zone.radius);
                } else if (zone.points) {
                    zone.points.forEach(point => {
                        bounds.minX = Math.min(bounds.minX, point.x);
                        bounds.maxX = Math.max(bounds.maxX, point.x);
                        bounds.minZ = Math.min(bounds.minZ, point.z);
                        bounds.maxZ = Math.max(bounds.maxZ, point.z);
                    });
                }
            });
        }
        
        // Process paths
        if (mapData.paths) {
            mapData.paths.forEach(path => {
                if (path.points) {
                    path.points.forEach(point => {
                        bounds.minX = Math.min(bounds.minX, point.x);
                        bounds.maxX = Math.max(bounds.maxX, point.x);
                        bounds.minZ = Math.min(bounds.minZ, point.z);
                        bounds.maxZ = Math.max(bounds.maxZ, point.z);
                    });
                }
            });
        }
        
        // Process structures
        if (mapData.structures) {
            mapData.structures.forEach(structure => {
                if (structure.position) {
                    bounds.minX = Math.min(bounds.minX, structure.position.x);
                    bounds.maxX = Math.max(bounds.maxX, structure.position.x);
                    bounds.minZ = Math.min(bounds.minZ, structure.position.z);
                    bounds.maxZ = Math.max(bounds.maxZ, structure.position.z);
                }
            });
        }
        
        // Process environment objects
        if (mapData.environment) {
            mapData.environment.forEach(env => {
                if (env.position) {
                    bounds.minX = Math.min(bounds.minX, env.position.x);
                    bounds.maxX = Math.max(bounds.maxX, env.position.x);
                    bounds.minZ = Math.min(bounds.minZ, env.position.z);
                    bounds.maxZ = Math.max(bounds.maxZ, env.position.z);
                }
            });
        }
        
        // Add padding to bounds
        const padding = this.chunkSize;
        bounds.minX -= padding;
        bounds.maxX += padding;
        bounds.minZ -= padding;
        bounds.maxZ += padding;
        
        return bounds;
    }

    /**
     * Divide map data into chunks for efficient loading
     * @param {Object} mapData - The map data to chunk
     * @returns {Object} - Map data organized by chunks
     */
    chunkifyMapData(mapData) {
        const chunkedData = {
            zones: mapData.zones, // Zones are kept global
            chunks: {}
        };
        
        // Process paths
        if (mapData.paths) {
            mapData.paths.forEach(path => {
                // For paths that span multiple chunks, we need to assign them to all relevant chunks
                if (path.points && path.points.length > 0) {
                    const affectedChunks = new Set();
                    
                    // Find all chunks this path touches
                    path.points.forEach(point => {
                        const chunkKey = this.getChunkKeyFromPosition(point.x, point.z);
                        affectedChunks.add(chunkKey);
                    });
                    
                    // Add path to all affected chunks
                    affectedChunks.forEach(chunkKey => {
                        if (!chunkedData.chunks[chunkKey]) {
                            chunkedData.chunks[chunkKey] = { paths: [], structures: [], environment: [] };
                        }
                        
                        chunkedData.chunks[chunkKey].paths.push(path);
                    });
                }
            });
        }
        
        // Process structures
        if (mapData.structures) {
            mapData.structures.forEach(structure => {
                if (structure.position) {
                    const chunkKey = this.getChunkKeyFromPosition(structure.position.x, structure.position.z);
                    
                    if (!chunkedData.chunks[chunkKey]) {
                        chunkedData.chunks[chunkKey] = { paths: [], structures: [], environment: [] };
                    }
                    
                    chunkedData.chunks[chunkKey].structures.push(structure);
                }
            });
        }
        
        // Process environment objects
        if (mapData.environment) {
            mapData.environment.forEach(env => {
                if (env.position) {
                    const chunkKey = this.getChunkKeyFromPosition(env.position.x, env.position.z);
                    
                    if (!chunkedData.chunks[chunkKey]) {
                        chunkedData.chunks[chunkKey] = { paths: [], structures: [], environment: [] };
                    }
                    
                    chunkedData.chunks[chunkKey].environment.push(env);
                }
            });
        }
        
        return chunkedData;
    }

    /**
     * Get chunk key from world position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {string} - Chunk key in format "x_z"
     */
    getChunkKeyFromPosition(x, z) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        return `${chunkX}_${chunkZ}`;
    }

    /**
     * Store chunked map data in localStorage
     * @param {Object} chunkedData - The chunked map data
     * @param {string} mapName - Name of the map
     */
    storeChunkedMapData(chunkedData, mapName) {
        try {
            // Store metadata
            localStorage.setItem(
                `${this.storageKeyPrefix}${mapName}_metadata`, 
                JSON.stringify(this.currentMapMetadata)
            );
            
            // Store zones separately (they're global)
            localStorage.setItem(
                `${this.storageKeyPrefix}${mapName}_zones`, 
                JSON.stringify(chunkedData.zones)
            );
            
            // Store each chunk separately to avoid localStorage size limits
            for (const chunkKey in chunkedData.chunks) {
                localStorage.setItem(
                    `${this.storageKeyPrefix}${mapName}_chunk_${chunkKey}`,
                    JSON.stringify(chunkedData.chunks[chunkKey])
                );
            }
            
            console.log(`Map "${mapName}" stored in localStorage (${Object.keys(chunkedData.chunks).length} chunks)`);
        } catch (error) {
            console.warn('Failed to store map data in localStorage:', error);
        }
    }

    /**
     * Get stored map metadata from localStorage
     * @param {string} mapName - Name of the map
     * @returns {Object|null} - Map metadata or null if not found
     */
    getStoredMapMetadata(mapName) {
        try {
            const metadata = localStorage.getItem(`${this.storageKeyPrefix}${mapName}_metadata`);
            return metadata ? JSON.parse(metadata) : null;
        } catch (error) {
            console.warn('Failed to retrieve map metadata from localStorage:', error);
            return null;
        }
    }

    /**
     * Get stored map zones from localStorage
     * @param {string} mapName - Name of the map
     * @returns {Array|null} - Map zones or null if not found
     */
    getStoredMapZones(mapName) {
        try {
            const zones = localStorage.getItem(`${this.storageKeyPrefix}${mapName}_zones`);
            return zones ? JSON.parse(zones) : null;
        } catch (error) {
            console.warn('Failed to retrieve map zones from localStorage:', error);
            return null;
        }
    }

    /**
     * Get stored map chunk from localStorage
     * @param {string} mapName - Name of the map
     * @param {string} chunkKey - Chunk key
     * @returns {Object|null} - Chunk data or null if not found
     */
    getStoredMapChunk(mapName, chunkKey) {
        try {
            const chunk = localStorage.getItem(`${this.storageKeyPrefix}${mapName}_chunk_${chunkKey}`);
            return chunk ? JSON.parse(chunk) : null;
        } catch (error) {
            console.warn(`Failed to retrieve map chunk ${chunkKey} from localStorage:`, error);
            return null;
        }
    }

    /**
     * Initial load of chunks around a position - used when first loading a map
     * This loads a larger area than regular updates to ensure the player has enough content
     * @param {THREE.Vector3} position - Position to load chunks around
     */
    async initialChunkLoad(position) {
        if (!this.currentMapMetadata) {
            return; // No map loaded
        }
        
        console.log("Performing initial chunk load...");
        
        // Initialize tracking variables
        this.lastPlayerPosition = position.clone();
        this.lastUpdateTime = Date.now();
        
        // Get current chunk
        const chunkX = Math.floor(position.x / this.chunkSize);
        const chunkZ = Math.floor(position.z / this.chunkSize);
        const chunkKey = `${chunkX}_${chunkZ}`;
        this.lastPlayerChunk = chunkKey;
        
        // Get map bounds if available
        let minChunkX = -Infinity;
        let maxChunkX = Infinity;
        let minChunkZ = -Infinity;
        let maxChunkZ = Infinity;
        
        if (this.currentMapMetadata.bounds) {
            minChunkX = Math.floor(this.currentMapMetadata.bounds.minX / this.chunkSize);
            maxChunkX = Math.ceil(this.currentMapMetadata.bounds.maxX / this.chunkSize);
            minChunkZ = Math.floor(this.currentMapMetadata.bounds.minZ / this.chunkSize);
            maxChunkZ = Math.ceil(this.currentMapMetadata.bounds.maxZ / this.chunkSize);
        }
        
        // Use a larger initial radius for first load
        const initialRadius = this.loadRadius + 1;
        const chunksToLoad = {};
        
        // Load chunks in all directions for initial load
        for (let xOffset = -initialRadius; xOffset <= initialRadius; xOffset++) {
            for (let zOffset = -initialRadius; zOffset <= initialRadius; zOffset++) {
                const targetChunkX = chunkX + xOffset;
                const targetChunkZ = chunkZ + zOffset;
                
                // Only load chunks within map bounds
                if (targetChunkX >= minChunkX && targetChunkX <= maxChunkX && 
                    targetChunkZ >= minChunkZ && targetChunkZ <= maxChunkZ) {
                    const targetChunkKey = `${targetChunkX}_${targetChunkZ}`;
                    chunksToLoad[targetChunkKey] = true;
                }
            }
        }
        
        // Load all initial chunks
        for (const chunkKey in chunksToLoad) {
            if (!this.loadedChunks[chunkKey]) {
                await this.loadChunk(chunkKey);
            }
        }
        
        console.log(`Initial chunk load complete (${Object.keys(chunksToLoad).length} chunks)`);
    }
    
    /**
     * Update loaded chunks based on player position with anti-eager loading
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    async updateLoadedChunksForPosition(playerPosition) {
        if (!this.currentMapMetadata) {
            return; // No map loaded
        }
        
        // Special case for first load - initialize position tracking
        if (!this.lastPlayerPosition) {
            this.lastPlayerPosition = playerPosition.clone();
            this.lastUpdateTime = Date.now();
            
            // For first load, we'll do a full chunk load
            console.log("Initial chunk loading...");
        }
        
        // Get current player chunk
        const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);
        const playerChunkKey = `${playerChunkX}_${playerChunkZ}`;
        
        // Get player direction if available (from camera or player object)
        let playerDirection = null;
        if (this.game && this.game.player && this.game.player.getDirection) {
            playerDirection = this.game.player.getDirection();
        } else if (this.game && this.game.camera) {
            // Extract direction from camera if player direction not available
            const camera = this.game.camera;
            if (camera.getWorldDirection) {
                playerDirection = new THREE.Vector3();
                camera.getWorldDirection(playerDirection);
            }
        }
        
        // Calculate time since last update and distance moved
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
        const distanceMoved = this.lastPlayerPosition ? 
            playerPosition.distanceTo(this.lastPlayerPosition) : 0;
            
        // Skip if player hasn't moved to a new chunk and direction hasn't changed significantly
        const directionChanged = playerDirection && this.lastPlayerDirection && 
            playerDirection.angleTo(this.lastPlayerDirection) > 0.3; // ~17 degrees threshold
            
        // Check if we should update chunks based on multiple criteria
        const inSameChunk = this.lastPlayerChunk === playerChunkKey;
        const cooldownActive = timeSinceLastUpdate < this.updateCooldown;
        const notMovedEnough = distanceMoved < this.minMoveDistance;
        
        // Skip update if all these conditions are true:
        // 1. Player is in the same chunk as before
        // 2. Direction hasn't changed significantly
        // 3. Either the cooldown is still active OR player hasn't moved enough
        if (inSameChunk && !directionChanged && (cooldownActive || notMovedEnough)) {
            return;
        }
        
        // If we're here, we need to update chunks
        console.log(`Updating chunks: ${inSameChunk ? 'Same chunk' : 'New chunk'}, ` +
                    `Distance moved: ${distanceMoved.toFixed(2)}, ` +
                    `Time since last update: ${(timeSinceLastUpdate/1000).toFixed(1)}s`);
                    
        // Update tracking variables
        this.lastPlayerChunk = playerChunkKey;
        this.lastUpdateTime = currentTime;
        this.lastPlayerPosition = playerPosition.clone();
        
        if (playerDirection) {
            this.lastPlayerDirection = playerDirection.clone();
        }
        
        // Determine which chunks should be loaded
        const chunksToLoad = {};
        
        // Get map bounds if available
        let minChunkX = -Infinity;
        let maxChunkX = Infinity;
        let minChunkZ = -Infinity;
        let maxChunkZ = Infinity;
        
        if (this.currentMapMetadata.bounds) {
            minChunkX = Math.floor(this.currentMapMetadata.bounds.minX / this.chunkSize);
            maxChunkX = Math.ceil(this.currentMapMetadata.bounds.maxX / this.chunkSize);
            minChunkZ = Math.floor(this.currentMapMetadata.bounds.minZ / this.chunkSize);
            maxChunkZ = Math.ceil(this.currentMapMetadata.bounds.maxZ / this.chunkSize);
        }
        
        // Always load the current chunk
        chunksToLoad[playerChunkKey] = true;
        
        // Determine loading pattern based on player direction
        if (playerDirection) {
            // Normalize direction to get primary direction
            const dirX = Math.round(playerDirection.x);
            const dirZ = Math.round(playerDirection.z);
            
            // Load chunks in front of player (in direction of travel/view)
            for (let xOffset = -this.loadRadius; xOffset <= this.loadRadius; xOffset++) {
                for (let zOffset = -this.loadRadius; zOffset <= this.loadRadius; zOffset++) {
                    // Prioritize chunks in the direction player is facing
                    // Skip chunks that are behind the player (opposite to direction)
                    if ((dirX > 0 && xOffset < -1) || (dirX < 0 && xOffset > 1) || 
                        (dirZ > 0 && zOffset < -1) || (dirZ < 0 && zOffset > 1)) {
                        continue; // Skip chunks behind player
                    }
                    
                    const chunkX = playerChunkX + xOffset;
                    const chunkZ = playerChunkZ + zOffset;
                    
                    // Only load chunks within map bounds
                    if (chunkX >= minChunkX && chunkX <= maxChunkX && chunkZ >= minChunkZ && chunkZ <= maxChunkZ) {
                        const chunkKey = `${chunkX}_${chunkZ}`;
                        chunksToLoad[chunkKey] = true;
                    }
                }
            }
        } else {
            // Fallback to standard loading pattern if direction not available
            // But with a smaller radius to reduce memory usage
            const reducedRadius = Math.max(1, this.loadRadius - 1);
            for (let xOffset = -reducedRadius; xOffset <= reducedRadius; xOffset++) {
                for (let zOffset = -reducedRadius; zOffset <= reducedRadius; zOffset++) {
                    const chunkX = playerChunkX + xOffset;
                    const chunkZ = playerChunkZ + zOffset;
                    
                    // Only load chunks within map bounds
                    if (chunkX >= minChunkX && chunkX <= maxChunkX && chunkZ >= minChunkZ && chunkZ <= maxChunkZ) {
                        const chunkKey = `${chunkX}_${chunkZ}`;
                        chunksToLoad[chunkKey] = true;
                    }
                }
            }
        }
        
        // Unload chunks that are no longer needed
        for (const chunkKey in this.loadedChunks) {
            if (!chunksToLoad[chunkKey]) {
                await this.unloadChunk(chunkKey);
            }
        }
        
        // Load new chunks
        for (const chunkKey in chunksToLoad) {
            if (!this.loadedChunks[chunkKey]) {
                await this.loadChunk(chunkKey);
            }
        }
    }

    /**
     * Load a specific chunk
     * @param {string} chunkKey - Chunk key to load
     */
    async loadChunk(chunkKey) {
        if (!this.currentMapMetadata || this.loadedChunks[chunkKey]) {
            return; // Already loaded or no map
        }
        
        // Check if chunk is within map bounds
        if (this.currentMapMetadata.bounds) {
            const [chunkX, chunkZ] = chunkKey.split('_').map(Number);
            const minChunkX = Math.floor(this.currentMapMetadata.bounds.minX / this.chunkSize);
            const maxChunkX = Math.ceil(this.currentMapMetadata.bounds.maxX / this.chunkSize);
            const minChunkZ = Math.floor(this.currentMapMetadata.bounds.minZ / this.chunkSize);
            const maxChunkZ = Math.ceil(this.currentMapMetadata.bounds.maxZ / this.chunkSize);
            
            // If chunk is outside map bounds, mark as empty and return
            if (chunkX < minChunkX || chunkX > maxChunkX || chunkZ < minChunkZ || chunkZ > maxChunkZ) {
                // Mark as loaded with empty data to prevent repeated attempts
                this.loadedChunks[chunkKey] = { paths: [], structures: [], environment: [] };
                return;
            }
        }
        
        console.log(`Loading chunk ${chunkKey}...`);
        
        // Get map name from metadata
        const mapName = this.currentMapMetadata.theme.name;
        
        // Get chunk data from localStorage
        const chunkData = this.getStoredMapChunk(mapName, chunkKey);
        
        if (!chunkData) {
            console.log(`No data found for chunk ${chunkKey}, creating empty chunk`);
            // Mark as loaded even if empty to prevent repeated attempts
            this.loadedChunks[chunkKey] = { paths: [], structures: [], environment: [] };
            return;
        }
        
        // Initialize tracking for this chunk
        this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        
        // Load chunk components in order
        if (chunkData.paths && chunkData.paths.length > 0) {
            await this.loadPaths(chunkData.paths, chunkKey);
        }
        
        if (chunkData.structures && chunkData.structures.length > 0) {
            await this.loadStructures(chunkData.structures, chunkKey);
        }
        
        if (chunkData.environment && chunkData.environment.length > 0) {
            await this.loadEnvironment(chunkData.environment, chunkKey);
        }
        
        // Mark chunk as loaded
        this.loadedChunks[chunkKey] = chunkData;
        console.log(`Chunk ${chunkKey} loaded successfully`);
    }

    /**
     * Unload a specific chunk
     * @param {string} chunkKey - Chunk key to unload
     */
    async unloadChunk(chunkKey) {
        if (!this.loadedChunks[chunkKey]) {
            return; // Not loaded
        }
        
        console.log(`Unloading chunk ${chunkKey}...`);
        
        // Remove all objects in this chunk from the scene
        if (this.loadedObjects[chunkKey]) {
            // Remove paths
            this.loadedObjects[chunkKey].paths.forEach(pathGroup => {
                if (pathGroup && pathGroup.parent) {
                    this.scene.remove(pathGroup);
                    this.disposeObject(pathGroup);
                }
            });
            
            // Remove structures
            this.loadedObjects[chunkKey].structures.forEach(structure => {
                if (structure && structure.parent) {
                    this.scene.remove(structure);
                    this.disposeObject(structure);
                }
            });
            
            // Remove environment objects
            this.loadedObjects[chunkKey].environment.forEach(envObject => {
                if (envObject && envObject.parent) {
                    this.scene.remove(envObject);
                    this.disposeObject(envObject);
                }
            });
            
            // Clear tracking arrays
            delete this.loadedObjects[chunkKey];
        }
        
        // Mark chunk as unloaded
        delete this.loadedChunks[chunkKey];
        console.log(`Chunk ${chunkKey} unloaded successfully`);
    }

    /**
     * Dispose of a Three.js object to free memory
     * @param {THREE.Object3D} object - Object to dispose
     */
    disposeObject(object) {
        if (!object) return;
        
        // Recursively dispose of all children
        if (object.children && object.children.length > 0) {
            // Create a copy of the children array to avoid modification during iteration
            const children = [...object.children];
            children.forEach(child => {
                this.disposeObject(child);
            });
        }
        
        // Dispose of geometries and materials
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
    }

    /**
     * Clear the existing world
     */
    async clearWorld() {
        console.log('Clearing existing world...');
        
        // Clear existing structures
        if (this.worldManager.structureManager) {
            this.worldManager.structureManager.clear();
        }
        
        // Clear existing environment objects
        if (this.worldManager.environmentManager) {
            this.worldManager.environmentManager.clear();
        }
        
        // Clear existing zones and theme colors
        if (this.worldManager.zoneManager) {
            this.worldManager.zoneManager.clear();
            this.worldManager.zoneManager.setThemeColors(null);
        }
        
        // Clear existing procedural paths from WorldManager
        this.clearProceduralPaths();
        
        // Clear our tracked objects
        for (const chunkKey in this.loadedObjects) {
            await this.unloadChunk(chunkKey);
        }
        
        // Reset tracking variables
        this.loadedObjects = {};
        this.loadedChunks = {};
        this.lastPlayerChunk = null;
        this.spatialIndex = {
            zones: {},
            paths: {},
            structures: {},
            environment: {}
        };
    }

    /**
     * Clear procedural paths from WorldManager
     */
    clearProceduralPaths() {
        if (this.worldManager.paths && this.worldManager.paths.length > 0) {
            console.log(`Clearing ${this.worldManager.paths.length} procedural paths...`);
            
            // Remove all procedural path meshes from scene
            this.worldManager.paths.forEach(pathMesh => {
                if (pathMesh && pathMesh.parent) {
                    this.scene.remove(pathMesh);
                }
                // Dispose of geometry and material to free memory
                if (pathMesh.geometry) {
                    pathMesh.geometry.dispose();
                }
                if (pathMesh.material) {
                    if (Array.isArray(pathMesh.material)) {
                        pathMesh.material.forEach(mat => mat.dispose());
                    } else {
                        pathMesh.material.dispose();
                    }
                }
            });
            
            // Clear the paths array
            this.worldManager.paths = [];
        }
        
        // Clear loaded map paths
        if (this.worldManager.loadedMapPaths && this.worldManager.loadedMapPaths.length > 0) {
            console.log(`Clearing ${this.worldManager.loadedMapPaths.length} loaded map paths...`);
            this.worldManager.loadedMapPaths = [];
        }
        
        // Clear path nodes to prevent future connections
        if (this.worldManager.pathNodes) {
            this.worldManager.pathNodes = [];
        }
        
        // Reset path generation position to prevent immediate regeneration
        if (this.worldManager.lastPathGenerationPosition) {
            this.worldManager.lastPathGenerationPosition.set(0, 0, 0);
        }
        
        // Re-enable procedural path generation for when returning to procedural maps
        this.enableProceduralPathGeneration();
    }

    /**
     * Disable procedural path generation to prevent conflicts with loaded paths
     */
    disableProceduralPathGeneration() {
        if (this.worldManager) {
            // Set a flag to indicate that map paths are loaded
            this.worldManager.mapPathsLoaded = true;
            
            // Increase the path generation distance to effectively disable it
            this.worldManager.originalPathGenerationDistance = this.worldManager.pathGenerationDistance;
            this.worldManager.pathGenerationDistance = Number.MAX_SAFE_INTEGER;
            
            console.log('Procedural path generation disabled - using map paths');
        }
    }

    /**
     * Re-enable procedural path generation (for when returning to procedural maps)
     */
    enableProceduralPathGeneration() {
        if (this.worldManager) {
            // Clear the flag
            this.worldManager.mapPathsLoaded = false;
            
            // Restore original path generation distance
            if (this.worldManager.originalPathGenerationDistance !== undefined) {
                this.worldManager.pathGenerationDistance = this.worldManager.originalPathGenerationDistance;
            } else {
                this.worldManager.pathGenerationDistance = 30; // Default value
            }
            
            console.log('Procedural path generation re-enabled');
        }
    }

    /**
     * Load zones from map data
     * @param {Array} zones - Zone data array
     */
    async loadZones(zones) {
        console.log(`Loading ${zones.length} zones...`);
        
        if (!this.worldManager.zoneManager) {
            console.warn('ZoneManager not available');
            return;
        }
        
        // Convert map zones to ZoneManager format
        const convertedZones = zones.map(zone => {
            // Handle zones with 'center' property
            if (zone.center) {
                return {
                    name: zone.name,
                    center: new THREE.Vector3(zone.center.x, zone.center.y, zone.center.z),
                    radius: zone.radius,
                    color: zone.color
                };
            } 
            // Handle zones with 'points' property (like boundary zones)
            else if (zone.points && zone.points.length > 0) {
                // Calculate center from points
                const center = new THREE.Vector3(0, 0, 0);
                zone.points.forEach(point => {
                    center.x += point.x;
                    center.y += point.y;
                    center.z += point.z;
                });
                center.divideScalar(zone.points.length);
                
                // Calculate radius as distance to furthest point
                let maxDistance = 0;
                zone.points.forEach(point => {
                    const distance = Math.sqrt(
                        Math.pow(point.x - center.x, 2) + 
                        Math.pow(point.z - center.z, 2)
                    );
                    maxDistance = Math.max(maxDistance, distance);
                });
                
                return {
                    name: zone.name,
                    center: center,
                    radius: maxDistance,
                    color: zone.color
                };
            }
            // Skip zones with invalid format
            else {
                console.warn(`Skipping zone "${zone.name}" with invalid format`);
                return null;
            }
        }).filter(zone => zone !== null); // Remove any null zones
        
        // Update zone manager with new zones
        this.worldManager.zoneManager.zones = convertedZones;
        this.worldManager.zoneManager.buildSimpleZoneCache();
        this.worldManager.zoneManager.visualizeZones();
        
        // Update terrain colors based on zones (using ZoneManager's implementation)
        this.worldManager.zoneManager.updateTerrainColors();
    }

    /**
     * Load paths from map data for a specific chunk
     * @param {Array} paths - Path data array
     * @param {string} chunkKey - Chunk key
     */
    async loadPaths(paths, chunkKey) {
        console.log(`Loading ${paths.length} paths for chunk ${chunkKey}...`);
        
        // Disable procedural path generation while loading map paths
        this.disableProceduralPathGeneration();
        
        // Initialize tracking array if needed
        if (!this.loadedObjects[chunkKey]) {
            this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        }
        
        paths.forEach(pathData => {
            const pathGroup = this.createPath(pathData);
            
            // Register path points with WorldManager for navigation and AI
            this.registerPathWithWorldManager(pathData, pathGroup);
            
            // Track this path in the loaded objects for this chunk
            this.loadedObjects[chunkKey].paths.push(pathGroup);
        });
        
        console.log(`Loaded ${paths.length} map paths for chunk ${chunkKey} successfully`);
    }

    /**
     * Create a path in the world
     * @param {Object} pathData - Path configuration
     * @returns {THREE.Group} - Path group
     */
    createPath(pathData) {
        const points = pathData.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const width = pathData.width || 3;
        
        // Create path geometry
        const pathGeometry = this.createPathGeometry(points, width);
        
        // Get the zone at the first point of the path to determine color
        const zoneAt = this.worldManager.zoneManager.getZoneAt(points[0]);
        const zoneName = zoneAt ? zoneAt.name : 'Terrant';
        
        // Get zone colors from the current map theme
        let pathColor = 0x8B7355; // Default brown path color
        
        if (this.currentMapMetadata && this.currentMapMetadata.theme) {
            const themeColors = this.currentMapMetadata.theme.colors;
            
            // Use zone-specific path color if available
            if (themeColors && themeColors.path) {
                // Convert hex string to number
                pathColor = parseInt(themeColors.path.replace('#', '0x'), 16);
            } else if (zoneName === 'Desert' && themeColors.sand) {
                pathColor = parseInt(themeColors.sand.replace('#', '0x'), 16);
            } else if (zoneName === 'Forest' && themeColors.ground) {
                pathColor = parseInt(themeColors.ground.replace('#', '0x'), 16);
            } else if (zoneName === 'Mountains' && themeColors.rock) {
                pathColor = parseInt(themeColors.rock.replace('#', '0x'), 16);
            }
        }
        
        // Create path material with zone-appropriate color
        const pathMaterial = new THREE.MeshLambertMaterial({
            color: pathColor,
            transparent: true,
            opacity: 0.9,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create path mesh
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.receiveShadow = true;
        
        // Add path border/edge for better definition
        const borderWidth = width + 0.3;
        const borderGeometry = this.createPathGeometry(points, borderWidth);
        const borderMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.2,
            roughness: 0.9
        });
        
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.y = -0.05; // Slightly below the main path
        borderMesh.receiveShadow = true;
        
        // Create a group for the path and its border
        const pathGroup = new THREE.Group();
        pathGroup.add(borderMesh);
        pathGroup.add(pathMesh);
        
        pathGroup.userData = {
            type: 'path',
            id: pathData.id,
            pattern: pathData.pattern,
            zone: zoneName
        };
        
        this.scene.add(pathGroup);
        
        return pathGroup;
    }

    /**
     * Create geometry for a path
     * @param {Array} points - Array of Vector3 points
     * @param {number} width - Path width
     * @returns {THREE.BufferGeometry} - Path geometry
     */
    createPathGeometry(points, width) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        
        const halfWidth = width / 2;
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const height = this.worldManager.getTerrainHeight(point.x, point.z) + 0.1;
            
            // Calculate direction for path width
            let direction;
            if (i === 0) {
                direction = points[1].clone().sub(point).normalize();
            } else if (i === points.length - 1) {
                direction = point.clone().sub(points[i - 1]).normalize();
            } else {
                const dir1 = point.clone().sub(points[i - 1]).normalize();
                const dir2 = points[i + 1].clone().sub(point).normalize();
                direction = dir1.add(dir2).normalize();
            }
            
            // Calculate perpendicular for width
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
            
            // Add vertices for both sides of the path
            const leftPoint = point.clone().add(perpendicular.clone().multiplyScalar(halfWidth));
            const rightPoint = point.clone().add(perpendicular.clone().multiplyScalar(-halfWidth));
            
            leftPoint.y = height;
            rightPoint.y = height;
            
            vertices.push(leftPoint.x, leftPoint.y, leftPoint.z);
            vertices.push(rightPoint.x, rightPoint.y, rightPoint.z);
            
            // Add UVs
            const u = i / (points.length - 1);
            uvs.push(0, u);
            uvs.push(1, u);
            
            // Add indices for triangles (except for the last point)
            if (i < points.length - 1) {
                const baseIndex = i * 2;
                
                // First triangle
                indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
                // Second triangle
                indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }

    /**
     * Register loaded path with WorldManager for navigation and AI systems
     * @param {Object} pathData - Original path data
     * @param {THREE.Group} pathGroup - Created path group
     */
    registerPathWithWorldManager(pathData, pathGroup) {
        if (!this.worldManager || !pathData.points) {
            return;
        }

        // Add path points as navigation nodes for AI and pathfinding
        pathData.points.forEach((point, index) => {
            const position = new THREE.Vector3(point.x, point.y, point.z);
            
            // Add to path nodes for potential connections (but don't auto-connect)
            this.worldManager.pathNodes.push({
                position: position.clone(),
                type: 'map_path',
                pathId: pathData.id,
                pointIndex: index,
                timestamp: Date.now(),
                isMapPath: true // Flag to distinguish from procedural paths
            });
        });

        // Store reference to the loaded path in WorldManager
        if (!this.worldManager.loadedMapPaths) {
            this.worldManager.loadedMapPaths = [];
        }
        
        this.worldManager.loadedMapPaths.push({
            id: pathData.id,
            points: pathData.points.map(p => new THREE.Vector3(p.x, p.y, p.z)),
            width: pathData.width || 3,
            type: pathData.type || 'road',
            pathGroup: pathGroup
        });
    }

    /**
     * Load structures from map data for a specific chunk
     * @param {Array} structures - Structure data array
     * @param {string} chunkKey - Chunk key
     */
    async loadStructures(structures, chunkKey) {
        console.log(`Loading ${structures.length} structures for chunk ${chunkKey}...`);
        
        if (!this.worldManager.structureManager) {
            console.warn('StructureManager not available');
            return;
        }
        
        // Initialize tracking array if needed
        if (!this.loadedObjects[chunkKey]) {
            this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        }
        
        for (const structureData of structures) {
            const structure = await this.createStructure(structureData);
            if (structure) {
                this.loadedObjects[chunkKey].structures.push(structure);
            }
        }
    }

    /**
     * Create a structure in the world
     * @param {Object} structureData - Structure configuration
     * @returns {THREE.Object3D} - Created structure
     */
    async createStructure(structureData) {
        const position = structureData.position;
        const structureManager = this.worldManager.structureManager;
        
        let structure = null;
        
        switch (structureData.type) {
            case 'village':
                structure = await this.createVillageFromData(structureData);
                break;
                
            case 'tower':
                structure = structureManager.createTower(position.x, position.z);
                break;
                
            case 'ruins':
                structure = structureManager.createRuins(position.x, position.z);
                break;
                
            case 'darkSanctum':
                structure = structureManager.createDarkSanctum(position.x, position.z);
                break;
                
            case 'bridge':
                structure = structureManager.createBridge(position.x, position.z);
                break;
                
            default:
                console.warn(`Unknown structure type: ${structureData.type}`);
        }
        
        if (structure) {
            structure.userData = {
                ...structure.userData,
                mapId: structureData.id,
                theme: structureData.theme
            };
        }
        
        return structure;
    }

    /**
     * Create a village from map data with enhanced features
     * @param {Object} villageData - Village configuration
     * @returns {THREE.Group} - Village group object
     */
    async createVillageFromData(villageData) {
        const villageGroup = new THREE.Group();
        villageGroup.userData = {
            type: 'village',
            mapId: villageData.id,
            theme: villageData.theme,
            style: villageData.style || 0
        };
        
        // Create buildings with proper rotation and style
        if (villageData.buildings) {
            for (const buildingData of villageData.buildings) {
                // Get zone colors for theming
                const zoneAt = this.worldManager.zoneManager.getZoneAt(
                    new THREE.Vector3(buildingData.position.x, 0, buildingData.position.z)
                );
                const zoneName = zoneAt ? zoneAt.name : 'Terrant';
                
                // Create the building with appropriate parameters
                const building = this.worldManager.structureManager.createBuilding(
                    buildingData.position.x,
                    buildingData.position.z,
                    buildingData.width,
                    buildingData.depth,
                    buildingData.height,
                    buildingData.type || 'house',
                    buildingData.style || 0,
                    zoneName
                );
                
                if (building) {
                    // Apply rotation if specified
                    if (buildingData.rotation !== undefined) {
                        building.rotation.y = buildingData.rotation;
                    }
                    
                    // Apply height position if specified (for terraced villages)
                    if (buildingData.position.y !== undefined && buildingData.position.y > 0) {
                        building.position.y = buildingData.position.y;
                    }
                    
                    villageGroup.add(building);
                }
            }
        }
        
        this.scene.add(villageGroup);
        return villageGroup;
    }

    /**
     * Load environment objects from map data for a specific chunk
     * @param {Array} environment - Environment data array
     * @param {string} chunkKey - Chunk key
     */
    async loadEnvironment(environment, chunkKey) {
        console.log(`Loading ${environment.length} environment objects for chunk ${chunkKey}...`);
        
        if (!this.worldManager.environmentManager) {
            console.warn('EnvironmentManager not available');
            return;
        }
        
        // Initialize tracking array if needed
        if (!this.loadedObjects[chunkKey]) {
            this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        }
        
        for (const envData of environment) {
            const envObject = await this.createEnvironmentObject(envData);
            if (envObject) {
                this.loadedObjects[chunkKey].environment.push(envObject);
            }
        }
    }

    /**
     * Create an environment object in the world
     * @param {Object} envData - Environment object configuration
     * @returns {THREE.Object3D} - Created environment object
     */
    async createEnvironmentObject(envData) {
        const position = envData.position;
        const environmentManager = this.worldManager.environmentManager;
        
        let envObject = null;
        
        switch (envData.type) {
            case 'tree':
                envObject = environmentManager.createTree(position.x, position.z);
                break;
                
            case 'rock':
                envObject = environmentManager.createRock(position.x, position.z);
                break;
                
            case 'bush':
                envObject = environmentManager.createBush(position.x, position.z);
                break;
                
            case 'flower':
                envObject = environmentManager.createFlower(position.x, position.z);
                break;
                
            case 'tall_grass':
                envObject = environmentManager.createTallGrass(position.x, position.z);
                break;
                
            case 'ancient_tree':
                envObject = environmentManager.createAncientTree(position.x, position.z);
                break;
                
            case 'mountain':
                envObject = this.worldManager.structureManager.createMountain(position.x, position.z);
                break;
                
            case 'tree_cluster':
                envObject = this.createTreeCluster(envData);
                break;
                
            case 'small_plant':
                envObject = environmentManager.createSmallPlant(position.x, position.z);
                break;
                
            case 'water':
                // For now, we'll skip water objects as they require special handling
                // This prevents the warning from appearing in the console
                console.debug(`Skipping water object at position (${position.x}, ${position.z})`);
                break;
                
            case 'fallen_log':
                envObject = environmentManager.createFallenLog(position.x, position.z);
                break;
                
            case 'mushroom':
                envObject = environmentManager.createMushroom(position.x, position.z);
                break;
                
            case 'rock_formation':
                envObject = environmentManager.createRockFormation(position.x, position.z);
                break;
                
            case 'shrine':
                envObject = environmentManager.createShrine(position.x, position.z);
                break;
                
            case 'stump':
                envObject = environmentManager.createStump(position.x, position.z);
                break;
                
            default:
                console.warn(`Unknown environment object type: ${envData.type}`);
        }
        
        if (envObject) {
            envObject.userData = {
                ...envObject.userData,
                theme: envData.theme
            };
        }
        
        return envObject;
    }
    
    /**
     * Create a cluster of trees at the specified position
     * @param {Object} clusterData - Data for the tree cluster
     * @returns {THREE.Group} - Group containing the tree cluster
     */
    createTreeCluster(clusterData) {
        const clusterGroup = new THREE.Group();
        const position = clusterData.position;
        const environmentManager = this.worldManager.environmentManager;
        
        // Set cluster position
        clusterGroup.position.set(position.x, position.y || 0, position.z);
        
        // Create individual trees based on the cluster data
        if (clusterData.trees && clusterData.trees.length > 0) {
            // Use the stored tree positions from the map data
            clusterData.trees.forEach(treeData => {
                const tree = environmentManager.createTree(
                    treeData.relativePosition.x,
                    treeData.relativePosition.z,
                    clusterData.theme || 'Forest',
                    treeData.size || 1.0
                );
                
                // Position is relative to cluster center
                tree.position.set(
                    treeData.relativePosition.x,
                    treeData.relativePosition.y || 0,
                    treeData.relativePosition.z
                );
                
                clusterGroup.add(tree);
            });
        } else {
            // Fallback: create trees in a circular pattern if no tree data is provided
            const treeCount = clusterData.treeCount || 5;
            const radius = clusterData.radius || 10;
            
            for (let i = 0; i < treeCount; i++) {
                const angle = (i / treeCount) * Math.PI * 2;
                const distance = Math.random() * radius;
                const x = Math.cos(angle) * distance;
                const z = Math.sin(angle) * distance;
                
                const tree = environmentManager.createTree(
                    position.x + x,
                    position.z + z,
                    clusterData.theme || 'Forest',
                    clusterData.avgSize || 1.0
                );
                
                tree.position.set(x, 0, z);
                clusterGroup.add(tree);
            }
        }
        
        clusterGroup.userData = {
            type: 'tree_cluster',
            theme: clusterData.theme,
            treeCount: clusterData.treeCount
        };
        
        this.scene.add(clusterGroup);
        return clusterGroup;
    }

    /**
     * Get information about the currently loaded map
     * @returns {Object|null} - Map information or null if no map is loaded
     */
    getCurrentMapInfo() {
        if (!this.currentMapMetadata) {
            return null;
        }
        
        // Count loaded objects
        let structureCount = 0;
        let pathCount = 0;
        let environmentCount = 0;
        
        for (const chunkKey in this.loadedChunks) {
            if (this.loadedChunks[chunkKey].structures) {
                structureCount += this.loadedChunks[chunkKey].structures.length;
            }
            if (this.loadedChunks[chunkKey].paths) {
                pathCount += this.loadedChunks[chunkKey].paths.length;
            }
            if (this.loadedChunks[chunkKey].environment) {
                environmentCount += this.loadedChunks[chunkKey].environment.length;
            }
        }
        
        return {
            theme: this.currentMapMetadata.theme.name,
            description: this.currentMapMetadata.theme.description,
            metadata: this.currentMapMetadata.metadata,
            loadedChunks: Object.keys(this.loadedChunks).length,
            objectCounts: {
                zones: this.worldManager.zoneManager.zones.length,
                structures: structureCount,
                paths: pathCount,
                environment: environmentCount
            }
        };
    }

    /**
     * Clear the currently loaded map
     */
    async clearCurrentMap() {
        if (this.currentMapMetadata) {
            await this.clearWorld();
            this.currentMapMetadata = null;
            console.log('Current map cleared');
        }
    }
}