/**
 * Handles serialization and deserialization of world data
 */
export class WorldSerializer {
    /**
     * Process chunk data and add it to the world
     * @param {Object} world - The world object
     * @param {Object} chunkData - The chunk data to process
     */
    static processChunkData(world, chunkData) {
        if (!world || !chunkData) {
            console.warn('World or chunk data is null or undefined');
            return;
        }
        
        const chunkKey = chunkData.key;
        
        // Process environment objects
        if (chunkData.environmentObjects && chunkData.environmentObjects.length > 0) {
            // Store environment objects for this chunk
            if (world.environmentManager) {
                if (!world.environmentManager.savedObjects) {
                    world.environmentManager.savedObjects = {};
                }
                world.environmentManager.savedObjects[chunkKey] = chunkData.environmentObjects;
            } else {
                if (!world.savedEnvironmentObjects) {
                    world.savedEnvironmentObjects = {};
                }
                world.savedEnvironmentObjects[chunkKey] = chunkData.environmentObjects;
            }
        }
        
        // Mark this chunk as existing
        if (world.terrainManager) {
            if (!world.terrainManager.savedChunks) {
                world.terrainManager.savedChunks = {};
            }
            world.terrainManager.savedChunks[chunkKey] = true;
        } else {
            if (!world.savedTerrainChunks) {
                world.savedTerrainChunks = {};
            }
            world.savedTerrainChunks[chunkKey] = true;
        }
    }
    /**
     * Serialize world metadata for saving
     * @param {Object} world - The world object
     * @returns {Object} Serialized world metadata
     */
    static serializeMetadata(world) {
        if (!world) {
            console.warn('World object is null or undefined');
            return {};
        }
        
        // Save discovered zones, interactive objects state, etc.
        return {
            // Check if zones exist and have the discovered property before filtering
            discoveredZones: world.zoneManager && world.zoneManager.zones ? 
                world.zoneManager.zones
                    .filter(zone => zone.discovered === true)
                    .map(zone => zone.name) : 
                [],
            // Check if interactiveObjects exists before mapping
            interactiveObjects: world.interactiveManager && world.interactiveManager.objects ? 
                world.interactiveManager.objects.map(obj => ({
                    type: obj.type,
                    position: {
                        x: obj.position.x,
                        y: obj.position.y,
                        z: obj.position.z
                    },
                    isOpen: obj.isOpen || false,
                    isCompleted: obj.isCompleted || false
                })) : 
                [],
            // Save current player chunk for reference if it exists
            currentChunk: world.terrainManager ? world.terrainManager.currentChunk : null,
            // Save list of chunk keys that exist (for index) if terrainChunks exists
            chunkKeys: world.terrainManager && world.terrainManager.terrainChunks ? 
                Object.keys(world.terrainManager.terrainChunks) : 
                [],
            // Save visible chunks if they exist
            visibleChunks: world.terrainManager && world.terrainManager.visibleChunks ? 
                Object.keys(world.terrainManager.visibleChunks) : 
                [],
            // Save visible terrain chunks if they exist
            visibleTerrainChunks: world.terrainManager && world.terrainManager.visibleTerrainChunks ? 
                Object.keys(world.terrainManager.visibleTerrainChunks) : 
                []
        };
    }
    
    /**
     * Serialize a world chunk for saving
     * @param {Object} world - The world object
     * @param {string} chunkKey - The chunk key
     * @returns {Object} Serialized chunk data
     */
    static serializeChunk(world, chunkKey) {
        if (!world || !chunkKey) {
            console.warn('World object or chunk key is null or undefined');
            return null;
        }
        
        // Get environment objects for this chunk - check if environmentManager exists
        const environmentObjects = world.environmentManager && world.environmentManager.objects && 
                                  world.environmentManager.objects[chunkKey] || [];
        
        // Create serialized environment objects
        const serializedEnvironmentObjects = environmentObjects.map(item => ({
            type: item.type,
            position: {
                x: item.position.x,
                y: item.position.y,
                z: item.position.z
            }
        }));
        
        // Create chunk data object (minimal data needed to recreate the chunk)
        return {
            key: chunkKey,
            environmentObjects: serializedEnvironmentObjects,
            // Store any structures in this chunk - check if structureManager exists
            structures: world.structureManager && world.structureManager.structures && 
                       world.structureManager.structures[chunkKey] || []
        };
    }
    
    /**
     * Deserialize world data from save
     * @param {Object} world - The world object to update
     * @param {Object} worldData - The saved world data
     * @param {Object} game - The game object (needed for player position)
     * @param {Function} loadChunk - Function to load a chunk from storage
     */
    static deserialize(world, worldData, game, loadChunk) {
        if (!world || !worldData) {
            console.warn('World or world data is null or undefined');
            return;
        }
        
        console.debug('Loading world data:', Object.keys(worldData));
        
        try {
            // Mark discovered zones - check if zoneManager exists
            if (worldData.discoveredZones && Array.isArray(worldData.discoveredZones)) {
                console.debug(`Loading ${worldData.discoveredZones.length} discovered zones`);
                
                if (world.zoneManager && world.zoneManager.zones) {
                    worldData.discoveredZones.forEach(zoneName => {
                        try {
                            const zone = world.zoneManager.zones.find(z => z.name === zoneName);
                            if (zone) {
                                zone.discovered = true;
                                console.debug(`Marked zone as discovered: ${zoneName}`);
                            }
                        } catch (zoneError) {
                            console.warn(`Error processing zone ${zoneName}:`, zoneError);
                        }
                    });
                }
            }
            
            // Restore interactive objects state - check if interactiveManager exists
            if (worldData.interactiveObjects && Array.isArray(worldData.interactiveObjects)) {
                console.debug(`Loading ${worldData.interactiveObjects.length} interactive objects`);
                
                if (world.interactiveManager && world.interactiveManager.objects) {
                    worldData.interactiveObjects.forEach(savedObj => {
                        try {
                            const obj = world.interactiveManager.objects.find(o => 
                                o.type === savedObj.type && 
                                Math.abs(o.position.x - savedObj.position.x) < 1 &&
                                Math.abs(o.position.z - savedObj.position.z) < 1
                            );
                            
                            if (obj) {
                                obj.isOpen = savedObj.isOpen || false;
                                obj.isCompleted = savedObj.isCompleted || false;
                                console.debug(`Restored interactive object state: ${obj.type}`);
                            }
                        } catch (objError) {
                            console.warn(`Error processing interactive object:`, objError, savedObj);
                        }
                    });
                }
            }
            
            // Restore current chunk
            if (worldData.currentChunk) {
                console.debug(`Setting current chunk to: ${worldData.currentChunk}`);
                if (world.terrainManager) {
                    world.terrainManager.currentChunk = worldData.currentChunk;
                } else {
                    world.currentChunk = worldData.currentChunk;
                }
            }
            
            // Clear existing terrain and environment objects if method exists
            if (world.clearWorldObjects) {
                console.debug('Clearing existing world objects');
                world.clearWorldObjects();
            }
            
            // Load chunks near the player's current position
            if (game && game.player && worldData.chunkKeys && Array.isArray(worldData.chunkKeys)) {
                const terrainChunkSize = world.terrainManager ? 
                    world.terrainManager.chunkSize : 
                    (world.terrainChunkSize || 100); // Default to 100 if not found
                
                let playerPos = game.player.getPosition ? 
                    game.player.getPosition() : 
                    game.player.position;
                
                if (!playerPos) {
                    playerPos = { x: 0, y: 0, z: 0 };
                }
                
                const playerChunkX = Math.floor(playerPos.x / terrainChunkSize);
                const playerChunkZ = Math.floor(playerPos.z / terrainChunkSize);
                const loadDistance = 2; // Only load chunks within 2 chunks of player
                
                console.debug(`Player is at chunk (${playerChunkX}, ${playerChunkZ}), loading chunks within distance ${loadDistance}`);
                
                // Create temporary storage for environment objects and terrain chunks
                const savedEnvironmentObjects = {};
                const savedTerrainChunks = {};
                let loadedChunkCount = 0;
                
                // Process each chunk in the index
                for (const chunkKey of worldData.chunkKeys) {
                    try {
                        // Parse the chunk coordinates
                        const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
                        
                        // Check if this chunk is within load distance
                        const distanceX = Math.abs(chunkX - playerChunkX);
                        const distanceZ = Math.abs(chunkZ - playerChunkZ);
                        
                        if (distanceX <= loadDistance && distanceZ <= loadDistance) {
                            console.debug(`Loading chunk ${chunkKey} (within range of player)`);
                            
                            // Load this chunk from storage
                            const chunkData = loadChunk(chunkKey);
                            
                            if (chunkData) {
                                // Store environment objects for this chunk
                                if (chunkData.environmentObjects && chunkData.environmentObjects.length > 0) {
                                    savedEnvironmentObjects[chunkKey] = chunkData.environmentObjects;
                                }
                                
                                // Mark this chunk as existing
                                savedTerrainChunks[chunkKey] = true;
                                loadedChunkCount++;
                            }
                        }
                    } catch (chunkError) {
                        console.warn(`Error processing chunk ${chunkKey}:`, chunkError);
                    }
                }
                
                console.debug(`Loaded ${loadedChunkCount} chunks near player position`);
                
                // Store the loaded data for world to use
                if (world.environmentManager) {
                    world.environmentManager.savedObjects = savedEnvironmentObjects;
                } else {
                    world.savedEnvironmentObjects = savedEnvironmentObjects;
                }
                if (world.terrainManager) {
                    world.terrainManager.savedChunks = savedTerrainChunks;
                } else {
                    world.savedTerrainChunks = savedTerrainChunks;
                }
            }
            
            // Restore visible chunks
            if (worldData.visibleChunks && Array.isArray(worldData.visibleChunks)) {
                if (world.terrainManager) {
                    world.terrainManager.visibleChunks = {};
                    worldData.visibleChunks.forEach(chunkKey => {
                        world.terrainManager.visibleChunks[chunkKey] = [];
                    });
                } else {
                    world.visibleChunks = {};
                    worldData.visibleChunks.forEach(chunkKey => {
                        world.visibleChunks[chunkKey] = [];
                    });
                }
            }
            
            // Restore visible terrain chunks
            if (worldData.visibleTerrainChunks && Array.isArray(worldData.visibleTerrainChunks)) {
                if (world.terrainManager) {
                    world.terrainManager.visibleTerrainChunks = {};
                    worldData.visibleTerrainChunks.forEach(chunkKey => {
                        world.terrainManager.visibleTerrainChunks[chunkKey] = true;
                    });
                } else {
                    world.visibleTerrainChunks = {};
                    worldData.visibleTerrainChunks.forEach(chunkKey => {
                        world.visibleTerrainChunks[chunkKey] = true;
                    });
                }
            }
            
            console.debug('World data loaded successfully');
            
            // Update the world based on player position to regenerate necessary chunks
            if (game && game.player) {
                const playerPos = game.player.getPosition ? 
                    game.player.getPosition() : 
                    game.player.position;
                
                if (playerPos && world.updateWorldForPlayer) {
                    console.debug('Updating world for player position');
                    world.updateWorldForPlayer(playerPos);
                }
            }
        } catch (error) {
            console.error('Error loading world data:', error);
        }
    }
}