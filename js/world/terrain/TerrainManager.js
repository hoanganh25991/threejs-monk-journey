import * as THREE from 'three';
import { TerrainChunk } from './TerrainChunk.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

/**
 * Manages terrain generation and rendering
 */
export class TerrainManager {
    constructor(scene, worldManager) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.game = null;
        
        // Terrain properties
        this.terrainSize = 50; // Base terrain size
        this.terrainResolution = 16; // Base terrain resolution
        this.terrainHeight = 10; // Maximum terrain height
        
        // For terrain chunks
        this.terrainChunks = {}; // Store terrain chunks by chunk key
        this.terrainChunkSize = 50; // Size of each terrain chunk
        this.visibleTerrainChunks = {}; // Store currently visible terrain chunks
        this.terrainChunkViewDistance = 3; // How many terrain chunks to show in each direction
        
        // For terrain buffering (pre-rendering)
        this.terrainBuffer = {}; // Store pre-generated terrain chunks that aren't yet visible
        this.terrainBufferDistance = 6; // How far ahead to buffer terrain (larger than view distance)
        this.terrainGenerationQueue = []; // Queue for prioritized terrain generation
        this.isProcessingTerrainQueue = false; // Flag to prevent multiple queue processing
        this.lastPlayerChunk = { x: 0, z: 0 }; // Last player chunk for movement prediction
        this.playerMovementDirection = new THREE.Vector3(0, 0, 0); // Track player movement direction for prediction
        
        // Base terrain
        this.terrain = null;
        
        // Flag to prevent terrain vibration on first load
        this.initialTerrainCreated = false;
        
        // For save/load functionality
        this.savedTerrainChunks = null;
    }
    
    /**
     * Set the game reference
     * @param {Game} game - The game instance
     */
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Initialize the terrain system
     * @returns {Promise<boolean>} - True if initialization was successful
     */
    async init() {
        // Create base terrain
        await this.createBaseTerrain();
        
        // Set flag to indicate initial terrain is created
        this.initialTerrainCreated = true;
        
        // Initialize the first chunks around the player
        this.updateForPlayer(new THREE.Vector3(0, 0, 0));
        
        return true;
    }
    
    /**
     * Create the base flat terrain
     * @returns {Promise<void>}
     */
    async createBaseTerrain() {
        // Create a completely flat terrain for consistency with endless terrain
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize, 
            this.terrainSize, 
            this.terrainResolution - 1, 
            this.terrainResolution - 1
        );
        
        // No need to apply heightmap since we want a flat terrain
        geometry.computeVertexNormals();
        
        // Create terrain material with lighter green color
        const grassTexture = TextureGenerator.createProceduralTexture(0x4a9e4a, 0x3a7a3a, 512);
        
        // Create terrain material with grass texture
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.2,
            vertexColors: true
        });
        
        // Create terrain mesh
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        terrain.castShadow = true;
        
        // Apply uniform grass coloring with slight variations
        this.colorTerrainUniform(terrain);
        
        // Make sure terrain is positioned at the center and exactly at y=0
        // This is critical to prevent vibration
        terrain.position.set(0, 0, 0);
        
        // Add terrain to scene
        this.scene.add(terrain);
        this.terrain = terrain;
        
        console.log("Flat terrain created and added to scene");
    }
    
    /**
     * Apply uniform coloring to terrain with slight variations
     * @param {THREE.Mesh} terrain - The terrain mesh to color
     */
    colorTerrainUniform(terrain) {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Use lighter grass color with slight variations
            const baseColor = new THREE.Color(0x4a9e4a); // Lighter base grass color
            
            // Add some variation to make the grass look more natural
            const variation = Math.random() * 0.1 - 0.05;
            const color = new THREE.Color(
                Math.max(0, Math.min(1, baseColor.r + variation)),
                Math.max(0, Math.min(1, baseColor.g + variation)),
                Math.max(0, Math.min(1, baseColor.b + variation))
            );
            
            colors.push(color.r, color.g, color.b);
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    /**
     * Update terrain based on player position
     * @param {THREE.Vector3} playerPosition - The player's current position
     * @param {number} drawDistanceMultiplier - Multiplier for draw distance
     */
    updateForPlayer(playerPosition, drawDistanceMultiplier = 1.0) {
        // Get the terrain chunk coordinates for the player's position
        const terrainChunkX = Math.floor(playerPosition.x / this.terrainChunkSize);
        const terrainChunkZ = Math.floor(playerPosition.z / this.terrainChunkSize);
        
        // Calculate player movement direction for predictive loading
        if (this.lastPlayerChunk.x !== terrainChunkX || this.lastPlayerChunk.z !== terrainChunkZ) {
            // Calculate movement direction vector
            this.playerMovementDirection.x = terrainChunkX - this.lastPlayerChunk.x;
            this.playerMovementDirection.z = terrainChunkZ - this.lastPlayerChunk.z;
            
            // Normalize the direction vector if it's not zero
            if (this.playerMovementDirection.x !== 0 || this.playerMovementDirection.z !== 0) {
                const length = Math.sqrt(
                    this.playerMovementDirection.x * this.playerMovementDirection.x + 
                    this.playerMovementDirection.z * this.playerMovementDirection.z
                );
                if (length > 0) {
                    this.playerMovementDirection.x /= length;
                    this.playerMovementDirection.z /= length;
                }
            }
            
            // Update last player chunk
            this.lastPlayerChunk = { x: terrainChunkX, z: terrainChunkZ };
        }
        
        // Update terrain chunks
        this.updateTerrainChunks(terrainChunkX, terrainChunkZ, drawDistanceMultiplier);
    }
    
    /**
     * Update visible terrain chunks based on player position
     * @param {number} centerX - Center X chunk coordinate
     * @param {number} centerZ - Center Z chunk coordinate
     * @param {number} drawDistanceMultiplier - Multiplier for draw distance
     */
    updateTerrainChunks(centerX, centerZ, drawDistanceMultiplier = 1.0) {
        // Track which terrain chunks should be visible
        const newVisibleTerrainChunks = {};
        
        // Adjust view distance based on performance
        const viewDistance = Math.max(1, Math.floor(this.terrainChunkViewDistance * drawDistanceMultiplier));
        
        // Generate terrain chunks in view distance (these need to be immediately visible)
        for (let x = centerX - viewDistance; x <= centerX + viewDistance; x++) {
            for (let z = centerZ - viewDistance; z <= centerZ + viewDistance; z++) {
                const chunkKey = `${x},${z}`;
                newVisibleTerrainChunks[chunkKey] = true;
                
                // If this terrain chunk doesn't exist yet, create it immediately
                // First check if it's in the buffer
                if (this.terrainBuffer[chunkKey]) {
                    // Check if it's a placeholder and convert if needed
                    if (this.terrainBuffer[chunkKey].isPlaceholder) {
                        this.convertPlaceholderToRealChunk(chunkKey);
                    }
                    
                    // Move from buffer to active chunks
                    this.terrainChunks[chunkKey] = this.terrainBuffer[chunkKey];
                    
                    // Add to scene
                    this.scene.add(this.terrainChunks[chunkKey]);
                    
                    // Remove from buffer
                    delete this.terrainBuffer[chunkKey];
                    console.log(`Chunk ${chunkKey} moved from buffer to active`);
                } 
                // If not in buffer, create it immediately
                else if (!this.terrainChunks[chunkKey]) {
                    this.createTerrainChunk(x, z);
                }
            }
        }
        
        // Queue terrain chunks for buffering (prioritize in the direction of movement)
        this.queueTerrainChunksForBuffering(centerX, centerZ);
        
        // Process a chunk from the queue if we're not already processing
        if (!this.isProcessingTerrainQueue) {
            this.processTerrainGenerationQueue();
        }
        
        // Remove terrain chunks that are no longer visible but keep them in buffer
        for (const chunkKey in this.visibleTerrainChunks) {
            if (!newVisibleTerrainChunks[chunkKey]) {
                // Instead of removing, move to buffer if within buffer distance
                const [x, z] = chunkKey.split(',').map(Number);
                const distX = Math.abs(x - centerX);
                const distZ = Math.abs(z - centerZ);
                
                if (distX <= this.terrainBufferDistance && distZ <= this.terrainBufferDistance) {
                    // Move to buffer instead of removing
                    this.terrainBuffer[chunkKey] = this.terrainChunks[chunkKey];
                    delete this.terrainChunks[chunkKey];
                    
                    // Hide the chunk but don't destroy it
                    const chunk = this.terrainBuffer[chunkKey];
                    if (chunk && chunk.parent) {
                        this.scene.remove(chunk);
                    }
                } else {
                    // If outside buffer distance, remove completely
                    this.removeTerrainChunk(chunkKey);
                }
            }
        }
        
        // Update the visible terrain chunks
        this.visibleTerrainChunks = newVisibleTerrainChunks;
    }
    
    /**
     * Create a terrain chunk at the specified coordinates
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @returns {THREE.Mesh} - The created terrain chunk
     */
    createTerrainChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Skip if this chunk already exists
        if (this.terrainChunks[chunkKey]) {
            return this.terrainChunks[chunkKey];
        }
        
        // Check if this chunk was saved previously
        const shouldCreateChunk = !this.savedTerrainChunks || 
                                 this.savedTerrainChunks[chunkKey] || 
                                 Object.keys(this.savedTerrainChunks).length === 0;
        
        if (!shouldCreateChunk) {
            return null; // Skip creating this chunk as it wasn't in the saved state
        }
        
        // Try to load this chunk from local storage first
        if (this.game && this.game.saveManager) {
            const loadedChunk = this.game.saveManager.loadChunk(chunkKey);
            if (loadedChunk) {
                // Create the terrain chunk from saved data
                return this.createTerrainChunkFromSavedData(chunkX, chunkZ, loadedChunk);
            }
        }
        
        // If not loaded from storage, create a new chunk
        return this.createNewTerrainChunk(chunkX, chunkZ);
    }
    
    /**
     * Create a new terrain chunk from scratch
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @returns {THREE.Mesh} - The created terrain chunk
     */
    createNewTerrainChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Calculate world coordinates for this chunk
        const worldX = chunkX * this.terrainChunkSize;
        const worldZ = chunkZ * this.terrainChunkSize;
        
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.terrainChunkSize,
            this.terrainChunkSize,
            16, // Lower resolution for better performance
            16
        );
        
        // Create terrain material with lighter green color
        const grassTexture = TextureGenerator.createProceduralTexture(0x4a9e4a, 0x3a7a3a, 512);
        
        // Create terrain material with grass texture
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.2,
            vertexColors: true
        });
        
        // Create terrain mesh
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        
        // Apply uniform grass coloring with slight variations
        this.colorTerrainUniform(terrain);
        
        // Position the terrain chunk - ensure y=0 exactly to prevent vibration
        terrain.position.set(
            worldX + this.terrainChunkSize / 2,
            0,
            worldZ + this.terrainChunkSize / 2
        );
        
        // Add terrain to scene
        this.scene.add(terrain);
        
        // Store the terrain chunk
        this.terrainChunks[chunkKey] = terrain;
        
        // Notify structure manager to generate structures for this chunk
        if (this.worldManager && this.worldManager.structureManager) {
            this.worldManager.structureManager.generateStructuresForChunk(chunkX, chunkZ);
        }
        
        return terrain;
    }
    
    /**
     * Create a terrain chunk from saved data
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @param {object} chunkData - Saved chunk data
     * @returns {THREE.Mesh} - The created terrain chunk
     */
    createTerrainChunkFromSavedData(chunkX, chunkZ, chunkData) {
        // Create the basic terrain chunk
        const terrain = this.createNewTerrainChunk(chunkX, chunkZ);
        
        // Notify structure manager about saved structures
        if (chunkData.structures && chunkData.structures.length > 0 && 
            this.worldManager && this.worldManager.structureManager) {
            this.worldManager.structureManager.loadStructuresForChunk(chunkX, chunkZ, chunkData.structures);
        }
        
        // Notify environment manager about saved environment objects
        if (chunkData.environmentObjects && chunkData.environmentObjects.length > 0 && 
            this.worldManager && this.worldManager.environmentManager) {
            this.worldManager.environmentManager.loadEnvironmentObjectsForChunk(chunkX, chunkZ, chunkData.environmentObjects);
        }
        
        console.log(`Terrain chunk ${chunkX},${chunkZ} created from saved data`);
        return terrain;
    }
    
    /**
     * Create a terrain chunk for the buffer (not immediately visible)
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     */
    createBufferedTerrainChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Skip if this chunk already exists in any collection
        if (this.terrainChunks[chunkKey] || this.terrainBuffer[chunkKey]) {
            return;
        }
        
        // Check if this chunk was saved previously
        const shouldCreateChunk = !this.savedTerrainChunks || 
                                 this.savedTerrainChunks[chunkKey] || 
                                 Object.keys(this.savedTerrainChunks).length === 0;
        
        if (!shouldCreateChunk) {
            return; // Skip creating this chunk as it wasn't in the saved state
        }
        
        // For buffered chunks, we'll just create a placeholder and defer actual creation
        // This significantly reduces memory usage and improves performance
        
        // Create a minimal placeholder object
        const placeholder = {
            isPlaceholder: true,
            chunkX: chunkX,
            chunkZ: chunkZ
        };
        
        // Store in buffer but don't create actual geometry yet
        this.terrainBuffer[chunkKey] = placeholder;
        
        // Notify structure manager to pre-generate structures for this chunk
        if (this.worldManager && this.worldManager.structureManager) {
            this.worldManager.structureManager.generateStructuresForChunk(chunkX, chunkZ, true); // true = data only
        }
        
        console.log(`Buffered terrain chunk placeholder created: ${chunkKey}`);
    }
    
    /**
     * Convert a buffered placeholder to a real chunk when needed
     * @param {string} chunkKey - The chunk key
     */
    convertPlaceholderToRealChunk(chunkKey) {
        const placeholder = this.terrainBuffer[chunkKey];
        
        // Skip if not a placeholder
        if (!placeholder || !placeholder.isPlaceholder) {
            return;
        }
        
        // Extract coordinates
        const { chunkX, chunkZ } = placeholder;
        
        // Try to load from storage first
        if (this.game && this.game.saveManager) {
            const loadedChunk = this.game.saveManager.loadChunk(chunkKey);
            if (loadedChunk) {
                // Create terrain but don't add to scene yet (it's still in buffer)
                const worldX = chunkX * this.terrainChunkSize;
                const worldZ = chunkZ * this.terrainChunkSize;
                
                // Create terrain geometry
                const geometry = new THREE.PlaneGeometry(
                    this.terrainChunkSize,
                    this.terrainChunkSize,
                    16, // Lower resolution for better performance
                    16
                );
                
                // Create terrain material with lighter green color
                const grassTexture = TextureGenerator.createProceduralTexture(0x4a9e4a, 0x3a7a3a, 512);
                
                // Create terrain material with grass texture
                const material = new THREE.MeshStandardMaterial({
                    map: grassTexture,
                    roughness: 0.8,
                    metalness: 0.2,
                    vertexColors: true
                });
                
                // Create terrain mesh
                const terrain = new THREE.Mesh(geometry, material);
                terrain.rotation.x = -Math.PI / 2;
                terrain.receiveShadow = true;
                
                // Apply uniform grass coloring with slight variations
                this.colorTerrainUniform(terrain);
                
                // Position the terrain chunk - ensure y=0 exactly to prevent vibration
                terrain.position.set(
                    worldX + this.terrainChunkSize / 2,
                    0,
                    worldZ + this.terrainChunkSize / 2
                );
                
                // Replace placeholder with real terrain
                this.terrainBuffer[chunkKey] = terrain;
                
                // Store environment objects data for later use
                if (loadedChunk.environmentObjects && loadedChunk.environmentObjects.length > 0) {
                    // We'll create a temporary storage for this data
                    terrain.savedEnvironmentObjects = loadedChunk.environmentObjects;
                }
                
                console.log(`Placeholder converted to real buffered chunk: ${chunkKey}`);
                return;
            }
        }
        
        // If no saved data, create a new chunk
        const worldX = chunkX * this.terrainChunkSize;
        const worldZ = chunkZ * this.terrainChunkSize;
        
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.terrainChunkSize,
            this.terrainChunkSize,
            16, // Lower resolution for better performance
            16
        );
        
        // Create terrain material with lighter green color
        const grassTexture = TextureGenerator.createProceduralTexture(0x4a9e4a, 0x3a7a3a, 512);
        
        // Create terrain material with grass texture
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.2,
            vertexColors: true
        });
        
        // Create terrain mesh
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        
        // Apply uniform grass coloring with slight variations
        this.colorTerrainUniform(terrain);
        
        // Position the terrain chunk - ensure y=0 exactly to prevent vibration
        terrain.position.set(
            worldX + this.terrainChunkSize / 2,
            0,
            worldZ + this.terrainChunkSize / 2
        );
        
        // Replace placeholder with real terrain
        this.terrainBuffer[chunkKey] = terrain;
        
        console.log(`Placeholder converted to new buffered chunk: ${chunkKey}`);
    }
    
    /**
     * Queue terrain chunks for buffering with priority based on player movement direction
     * @param {number} centerX - Center X chunk coordinate
     * @param {number} centerZ - Center Z chunk coordinate
     */
    queueTerrainChunksForBuffering(centerX, centerZ) {
        // Clear existing queue to avoid duplicates
        this.terrainGenerationQueue = [];
        
        // Calculate buffer area (larger than view distance)
        for (let x = centerX - this.terrainBufferDistance; x <= centerX + this.terrainBufferDistance; x++) {
            for (let z = centerZ - this.terrainBufferDistance; z <= centerZ + this.terrainBufferDistance; z++) {
                const chunkKey = `${x},${z}`;
                
                // Skip if already in visible chunks or already in buffer
                if (this.visibleTerrainChunks[chunkKey] || this.terrainBuffer[chunkKey] || this.terrainChunks[chunkKey]) {
                    continue;
                }
                
                // Calculate distance from center
                const distX = x - centerX;
                const distZ = z - centerZ;
                
                // Calculate dot product with movement direction to prioritize chunks in that direction
                let priority = 0;
                if (this.playerMovementDirection.x !== 0 || this.playerMovementDirection.z !== 0) {
                    const dotProduct = distX * this.playerMovementDirection.x + distZ * this.playerMovementDirection.z;
                    // Higher dot product means the chunk is more in the direction of movement
                    priority = dotProduct;
                }
                
                // Add to queue with priority
                this.terrainGenerationQueue.push({
                    x: x,
                    z: z,
                    priority: priority,
                    chunkKey: chunkKey
                });
            }
        }
        
        // Sort queue by priority (higher priority first)
        this.terrainGenerationQueue.sort((a, b) => b.priority - a.priority);
    }
    
    /**
     * Process the terrain generation queue asynchronously
     */
    processTerrainGenerationQueue() {
        if (this.terrainGenerationQueue.length === 0) {
            this.isProcessingTerrainQueue = false;
            return;
        }
        
        this.isProcessingTerrainQueue = true;
        
        // Get the highest priority chunk
        const nextChunk = this.terrainGenerationQueue.shift();
        
        // Create the chunk in the buffer (not visible yet)
        this.createBufferedTerrainChunk(nextChunk.x, nextChunk.z);
        
        // Process next chunk in the queue after a small delay to avoid blocking the main thread
        setTimeout(() => {
            this.processTerrainGenerationQueue();
        }, 10); // Small delay to keep the game responsive
    }
    
    /**
     * Remove a terrain chunk
     * @param {string} chunkKey - The chunk key
     */
    removeTerrainChunk(chunkKey) {
        const terrain = this.terrainChunks[chunkKey];
        if (terrain) {
            this.scene.remove(terrain);
            terrain.geometry.dispose();
            terrain.material.dispose();
            delete this.terrainChunks[chunkKey];
        }
    }
    
    /**
     * Get the terrain height at a specific world position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {number} - The height of the terrain at the specified position
     */
    getTerrainHeight(x, z) {
        // Always return exactly 0 for completely flat terrain
        // This is critical to prevent vibration
        return 0;
    }
    
    /**
     * Clear all terrain objects
     */
    clear() {
        // Clear terrain chunks
        for (const chunkKey in this.terrainChunks) {
            this.removeTerrainChunk(chunkKey);
        }
        
        // Clear buffered terrain chunks
        for (const chunkKey in this.terrainBuffer) {
            const terrain = this.terrainBuffer[chunkKey];
            if (terrain) {
                if (terrain.parent) {
                    this.scene.remove(terrain);
                }
                if (terrain.geometry) {
                    terrain.geometry.dispose();
                }
                if (terrain.material) {
                    terrain.material.dispose();
                }
            }
        }
        
        // Remove initial terrain if it exists
        if (this.terrain && this.terrain.parent) {
            this.scene.remove(this.terrain);
            this.terrain.geometry.dispose();
            this.terrain.material.dispose();
            this.terrain = null;
        }
        
        // Reset object collections
        this.terrainChunks = {};
        this.visibleTerrainChunks = {};
        this.terrainBuffer = {};
        this.terrainGenerationQueue = [];
        this.isProcessingTerrainQueue = false;
    }
    
    /**
     * Clear distant terrain chunks to free memory
     * @param {number} maxDistance - Maximum distance from player to keep chunks (defaults to 2x view distance)
     */
    clearDistantChunks(maxDistance) {
        // Default to 2x the view distance if not specified
        const clearDistance = maxDistance || (this.terrainChunkViewDistance * 2);
        
        // Get current player chunk coordinates
        let centerX = 0;
        let centerZ = 0;
        
        // If we have a player position, use that
        if (this.worldManager && this.worldManager.game && this.worldManager.game.player) {
            const playerPos = this.worldManager.game.player.getPosition();
            centerX = Math.floor(playerPos.x / this.terrainChunkSize);
            centerZ = Math.floor(playerPos.z / this.terrainChunkSize);
        }
        
        // Count chunks before cleanup
        const chunkCountBefore = Object.keys(this.terrainChunks).length;
        const bufferCountBefore = Object.keys(this.terrainBuffer).length;
        
        // Clear distant chunks from active chunks
        const chunksToRemove = [];
        for (const chunkKey in this.terrainChunks) {
            const [x, z] = chunkKey.split(',').map(Number);
            const distX = Math.abs(x - centerX);
            const distZ = Math.abs(z - centerZ);
            
            // If chunk is too far away, mark for removal
            if (distX > clearDistance || distZ > clearDistance) {
                chunksToRemove.push(chunkKey);
            }
        }
        
        // Remove marked chunks
        chunksToRemove.forEach(chunkKey => {
            this.removeTerrainChunk(chunkKey);
        });
        
        // Clear distant chunks from buffer
        const bufferToRemove = [];
        for (const chunkKey in this.terrainBuffer) {
            const [x, z] = chunkKey.split(',').map(Number);
            const distX = Math.abs(x - centerX);
            const distZ = Math.abs(z - centerZ);
            
            // If chunk is too far away, mark for removal
            if (distX > clearDistance || distZ > clearDistance) {
                bufferToRemove.push(chunkKey);
            }
        }
        
        // Remove marked buffer chunks
        bufferToRemove.forEach(chunkKey => {
            const chunk = this.terrainBuffer[chunkKey];
            
            // Remove from scene if needed
            if (chunk && chunk.parent) {
                this.scene.remove(chunk);
            }
            
            // Dispose of geometry and materials
            if (chunk && chunk.geometry) {
                chunk.geometry.dispose();
            }
            
            if (chunk && chunk.material) {
                const materials = Array.isArray(chunk.material) ? chunk.material : [chunk.material];
                materials.forEach(material => {
                    if (material.map) material.map.dispose();
                    material.dispose();
                });
            }
            
            // Remove from buffer
            delete this.terrainBuffer[chunkKey];
        });
        
        // Clear any distant chunks from generation queue
        this.terrainGenerationQueue = this.terrainGenerationQueue.filter(item => {
            const distX = Math.abs(item.x - centerX);
            const distZ = Math.abs(item.z - centerZ);
            return distX <= clearDistance && distZ <= clearDistance;
        });
        
        // Count chunks after cleanup
        const chunkCountAfter = Object.keys(this.terrainChunks).length;
        const bufferCountAfter = Object.keys(this.terrainBuffer).length;
        
        console.log(`Cleared distant chunks: ${chunkCountBefore - chunkCountAfter} active, ${bufferCountBefore - bufferCountAfter} buffered`);
    }
    
    /**
     * Save terrain state
     * @returns {object} - The saved terrain state
     */
    save() {
        const terrainState = {
            chunks: {}
        };
        
        // Save visible chunks
        for (const chunkKey in this.terrainChunks) {
            terrainState.chunks[chunkKey] = {
                exists: true
            };
        }
        
        // Save buffered chunks
        for (const chunkKey in this.terrainBuffer) {
            if (!terrainState.chunks[chunkKey]) {
                terrainState.chunks[chunkKey] = {
                    exists: true,
                    buffered: true
                };
            }
        }
        
        return terrainState;
    }
    
    /**
     * Load terrain state
     * @param {object} terrainState - The terrain state to load
     */
    load(terrainState) {
        if (!terrainState || !terrainState.chunks) return;
        
        this.savedTerrainChunks = terrainState.chunks;
    }
}