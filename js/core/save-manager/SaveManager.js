import { ISaveSystem } from './ISaveSystem.js';
import { LocalStorageAdapter } from './LocalStorageAdapter.js';
import { PlayerSerializer } from './serializers/PlayerSerializer.js';
import { QuestSerializer } from './serializers/QuestSerializer.js';
import { WorldSerializer } from './serializers/WorldSerializer.js';
import { SettingsSerializer } from './serializers/SettingsSerializer.js';
import { SaveUtils } from './utils/SaveUtils.js';
import { SaveOperationProgress } from './utils/SaveOperationProgress.js';

/**
 * SaveManager implementation using localStorage
 * Handles saving and loading game state with progress indicators
 */
export class SaveManager extends ISaveSystem {
    /**
     * Create a new SaveManager
     * @param {Object} game - The game object
     */
    constructor(game) {
        super();
        this.game = game;
        
        // Create progress indicators
        this.saveProgress = new SaveOperationProgress(game, 'save');
        this.loadProgress = new SaveOperationProgress(game, 'load');
        this.saveKey = 'monk_journey_save';
        this.chunkSaveKeyPrefix = 'monk_journey_chunk_';
        this.autoSaveInterval = 60_000; // Auto-save every minute (reduced frequency)
        this.autoSaveTimer = null;
        this.lastSaveLevel = 0; // Track player level at last save
        this.saveThresholdLevels = [5, 10, 15, 20, 30, 40, 50]; // Save at these level milestones
        this.lastSaveTime = 0; // Track time of last save
        this.minTimeBetweenSaves = 60_000; // Minimum minute between saves
        
        // Create storage adapter
        this.storage = new LocalStorageAdapter();
        
        // Current save version
        this.currentVersion = '1.1.0';
    }
    
    /**
     * Initialize the save system
     * @returns {boolean} Success status
     */
    init() {
        // Start auto-save timer
        this.startAutoSave();
        
        // Just load the chunk index, but don't load the game data yet
        // This will be done explicitly when the user clicks "Load Game"
        this.loadChunkIndex();
        
        return true;
    }
    
    /**
     * Start auto-save functionality
     */
    startAutoSave() {
        // Clear existing timer if any
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // Set up new timer
        this.autoSaveTimer = setInterval(() => {
            // Use async saveGame method
            this.saveGame(false, true).catch(error => {
                console.error('Auto-save failed:', error);
            });
        }, this.autoSaveInterval);
    }
    
    /**
     * Stop auto-save functionality
     */
    stopAutoSave() {
        // Clear timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    /**
     * Save the current game state with progress indicator
     * @param {boolean} forceSave - Whether to force save regardless of conditions
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async saveGame(forceSave = false, autoSave = false) {
        try {
            const currentTime = Date.now();
            const playerLevel = this.game.player.stats.level;
            
            // Check if we should save based on level milestones or forced save
            const shouldSaveByLevel = this.saveThresholdLevels.includes(playerLevel) && playerLevel > this.lastSaveLevel;
            const timeSinceLastSave = currentTime - this.lastSaveTime;
            const enoughTimePassed = timeSinceLastSave > this.minTimeBetweenSaves;
            
            if (!forceSave && !shouldSaveByLevel && !enoughTimePassed) {
                SaveUtils.log('Skipping save - not at level milestone or not enough time passed');
                return true; // Skip saving but return success
            }

            // Initialize progress indicator
            !autoSave && this.saveProgress.start('Preparing to save game...');
            
            // Create save data object (without full world data)
            !autoSave && this.saveProgress.update('Collecting player data...', 10);
            await this.delay(50); // Small delay for UI update
            
            const playerData = PlayerSerializer.serialize(this.game.player);
            
            !autoSave && this.saveProgress.update('Collecting quest data...', 20);
            await this.delay(50); // Small delay for UI update
            
            const questData = QuestSerializer.serialize(this.game.questManager);
            
            !autoSave && this.saveProgress.update('Collecting settings...', 30);
            await this.delay(50); // Small delay for UI update
            
            const settingsData = SettingsSerializer.serialize(this.game);
            
            !autoSave && this.saveProgress.update('Collecting world metadata...', 40);
            await this.delay(50); // Small delay for UI update
            
            const worldMetaData = WorldSerializer.serializeMetadata(this.game.world);
            
            const saveData = {
                player: playerData,
                quests: questData,
                settings: settingsData,
                timestamp: currentTime,
                version: this.currentVersion,
                worldMeta: worldMetaData
            };
            
            !autoSave &&  this.saveProgress.update('Writing save data to storage...', 60);
            await this.delay(100); // Small delay for UI update
        
            // Save to storage
            const success = this.storage.saveData(this.saveKey, saveData);
            
            if (!success) {
                throw new Error('Failed to save game data');
            }
            
            // Save chunks separately if at level milestone or forced
            if (shouldSaveByLevel || forceSave) {
                this.saveProgress.update('Saving world chunks...', 70);
                await this.saveWorldChunksWithProgress(autoSave);
                this.lastSaveLevel = playerLevel;
            } else {
                this.saveProgress.update('Skipping world chunks...', 80);
            }

            this.lastSaveTime = currentTime;
            
            !autoSave && this.saveProgress.update('Save complete!', 100);
            await this.delay(500); // Show completion for a moment
            
            SaveUtils.log('Game saved successfully');
            SaveUtils.showNotification(this.game, 'Game saved successfully');
            
            // Complete the progress indicator
            this.saveProgress.complete();
            
            return true;
        } catch (error) {
            SaveUtils.log('Error saving game: ' + error.message, 'error');
            
            // Show error in progress indicator
            this.saveProgress.error('Failed to save game: ' + error.message);
            
            SaveUtils.showNotification(this.game, 'Failed to save game', 3000, 'error');
            
            return false;
        }
    }
    
    /**
     * Helper method to introduce a small delay
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after the delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Load a saved game with progress indicator
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async loadGame() {
        try {
            // Initialize progress indicator
            this.loadProgress.start('Preparing to load game...');
            
            // Get save data from storage
            this.loadProgress.update('Reading save data...', 10);
            await this.delay(100); // Small delay for UI update
            
            const saveData = this.storage.loadData(this.saveKey);
            
            // Check if save data exists
            if (!saveData) {
                SaveUtils.log('No save data found');
                this.loadProgress.error('No save data found');
                return false;
            }
            
            this.loadProgress.update('Validating save data...', 20);
            await this.delay(100); // Small delay for UI update
            
            SaveUtils.log('Save data parsed successfully: ' + Object.keys(saveData).join(', '));
            
            // Check version compatibility
            if (saveData.version !== this.currentVersion) {
                SaveUtils.log('Save data version mismatch, some data may not load correctly', 'warn');
                this.loadProgress.update('Warning: Save data version mismatch', 25);
            }
            
            // Clear existing game state
            this.loadProgress.update('Clearing game state...', 30);
            await this.delay(100); // Small delay for UI update
            
            if (this.game.enemyManager) {
                this.game.enemyManager.removeAllEnemies();
            } else {
                SaveUtils.log('Enemy manager not found, skipping enemy removal', 'warn');
                this.loadProgress.update('Warning: Enemy manager not found', 35);
            }
            
            // Load player data
            this.loadProgress.update('Loading player data...', 40);
            await this.delay(150); // Small delay for UI update
            
            if (saveData.player) {
                SaveUtils.log('Loading player data...');
                PlayerSerializer.deserialize(this.game.player, saveData.player);
            } else {
                SaveUtils.log('No player data found in save', 'warn');
                this.loadProgress.update('Warning: No player data found', 45);
            }
            
            // Load quest data
            this.loadProgress.update('Loading quest data...', 50);
            await this.delay(150); // Small delay for UI update
            
            if (saveData.quests) {
                SaveUtils.log('Loading quest data...');
                QuestSerializer.deserialize(this.game.questManager, saveData.quests);
            } else {
                SaveUtils.log('No quest data found in save', 'warn');
                this.loadProgress.update('Warning: No quest data found', 55);
            }
            
            // Load world data - check for new or old format
            this.loadProgress.update('Loading world data...', 60);
            SaveUtils.log('Loading world data...');
            
            if (saveData.worldMeta) {
                // New format - load world metadata
                SaveUtils.log('Using new world metadata format');
                await this.loadWorldDataWithProgress(
                    saveData.worldMeta, 
                    (chunkKey) => this.loadChunk(chunkKey)
                );
            } else if (saveData.world) {
                // Old format - load full world data
                SaveUtils.log('Using old world data format');
                await this.loadWorldDataWithProgress(
                    saveData.world, 
                    (chunkKey) => this.loadChunk(chunkKey)
                );
            } else {
                SaveUtils.log('No world data found in save', 'warn');
                this.loadProgress.update('Warning: No world data found', 70);
            }
            
            // Load game settings - handle errors separately to prevent blocking game load
            this.loadProgress.update('Loading game settings...', 90);
            await this.delay(100); // Small delay for UI update
            
            if (saveData.settings) {
                SaveUtils.log('Loading game settings...');
                try {
                    SettingsSerializer.deserialize(this.game, saveData.settings);
                } catch (settingsError) {
                    SaveUtils.log('Error loading game settings: ' + settingsError.message, 'error');
                    this.loadProgress.update('Warning: Error loading settings', 95);
                    // Continue loading the game with default settings
                    SaveUtils.log('Continuing with default settings');
                }
            } else {
                SaveUtils.log('No settings data found in save', 'warn');
                this.loadProgress.update('Warning: No settings data found', 95);
            }
            
            // Update last save level to prevent immediate re-saving
            if (saveData.player && saveData.player.level) {
                this.lastSaveLevel = saveData.player.level;
            }
            
            // Update last save time
            this.lastSaveTime = Date.now();
            
            this.loadProgress.update('Load complete!', 100);
            await this.delay(500); // Show completion for a moment
            
            SaveUtils.log('Game loaded successfully');
            SaveUtils.showNotification(this.game, 'Game loaded successfully');
            
            // Update UI elements
            if (this.game.isRunning && this.game.uiManager) {
                // Update player UI by accessing the PlayerUI component directly
                if (this.game.uiManager.components && this.game.uiManager.components.playerUI) {
                    this.game.uiManager.components.playerUI.update();
                }
                this.game.uiManager.updateQuestLog(this.game.questManager.activeQuests);
            }
            
            // Complete the progress indicator
            this.loadProgress.complete();
            
            return true;
        } catch (error) {
            SaveUtils.log('Error loading game: ' + error.message, 'error');
            
            // Show error in progress indicator
            this.loadProgress.error('Failed to load game: ' + error.message);
            
            SaveUtils.showNotification(this.game, 'Failed to load game: ' + error.message, 3000, 'error');
            
            return false;
        }
    }
    
    /**
     * Load world data with progress updates
     * @param {Object} worldData - World data to load
     * @param {Function} chunkLoader - Function to load individual chunks
     * @returns {Promise<void>}
     */
    async loadWorldDataWithProgress(worldData, chunkLoader) {
        const world = this.game.world;
        
        // Mark discovered zones
        this.loadProgress.update('Loading discovered zones...', 65);
        await this.delay(100);
        
        if (worldData.discoveredZones && Array.isArray(worldData.discoveredZones)) {
            SaveUtils.log(`Loading ${worldData.discoveredZones.length} discovered zones`);
            
            if (world.zoneManager && world.zoneManager.zones) {
                for (const zoneName of worldData.discoveredZones) {
                    const zone = world.zoneManager.zones.find(z => z.name === zoneName);
                    if (zone) {
                        zone.discovered = true;
                    }
                }
            }
        }
        
        // Restore interactive objects state
        this.loadProgress.update('Loading interactive objects...', 70);
        await this.delay(100);
        
        if (worldData.interactiveObjects && Array.isArray(worldData.interactiveObjects)) {
            SaveUtils.log(`Loading ${worldData.interactiveObjects.length} interactive objects`);
            
            if (world.interactiveManager && world.interactiveManager.objects) {
                for (const savedObj of worldData.interactiveObjects) {
                    try {
                        const obj = world.interactiveManager.objects.find(o => 
                            o.type === savedObj.type && 
                            Math.abs(o.position.x - savedObj.position.x) < 1 &&
                            Math.abs(o.position.z - savedObj.position.z) < 1
                        );
                        
                        if (obj) {
                            obj.isOpen = savedObj.isOpen || false;
                            obj.isCompleted = savedObj.isCompleted || false;
                        }
                    } catch (objError) {
                        SaveUtils.log(`Error processing interactive object: ${objError.message}`, 'warn');
                    }
                }
            }
        }
        
        // Restore current chunk
        this.loadProgress.update('Setting current chunk...', 75);
        await this.delay(100);
        
        if (worldData.currentChunk) {
            SaveUtils.log(`Setting current chunk to: ${worldData.currentChunk}`);
            if (world.terrainManager) {
                world.terrainManager.currentChunk = worldData.currentChunk;
            } else {
                world.currentChunk = worldData.currentChunk;
            }
        }
        
        // Clear existing terrain and environment objects
        this.loadProgress.update('Clearing existing world objects...', 80);
        await this.delay(100);
        
        if (world.clearWorldObjects) {
            world.clearWorldObjects();
        }
        
        // Load chunk data from individual storage
        this.loadProgress.update('Loading chunk index...', 82);
        await this.delay(100);
        
        const chunkIndex = this.loadChunkIndex();
        
        if (chunkIndex) {
            SaveUtils.log(`Found ${Object.keys(chunkIndex).length} saved chunks in index`);
            
            // Get player position for proximity loading
            let playerPos = this.game.player.getPosition ? 
                this.game.player.getPosition() : 
                this.game.player.position;
            
            if (!playerPos) {
                playerPos = { x: 0, y: 0, z: 0 };
            }
            
            // Calculate player chunk
            const terrainChunkSize = world.terrainManager ? 
                world.terrainManager.chunkSize : 
                (world.terrainChunkSize || 100);
            
            const playerChunkX = Math.floor(playerPos.x / terrainChunkSize);
            const playerChunkZ = Math.floor(playerPos.z / terrainChunkSize);
            const loadDistance = 2; // Only load chunks within 2 chunks of player
            
            // Get chunks to load
            const chunkKeys = Object.keys(chunkIndex);
            const chunksToLoad = chunkKeys.filter(chunkKey => {
                const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
                const distanceX = Math.abs(chunkX - playerChunkX);
                const distanceZ = Math.abs(chunkZ - playerChunkZ);
                return distanceX <= loadDistance && distanceZ <= loadDistance;
            });
            
            // Load chunks with progress updates
            const totalChunksToLoad = chunksToLoad.length;
            SaveUtils.log(`Loading ${totalChunksToLoad} chunks near player position`);
            
            for (let i = 0; i < chunksToLoad.length; i++) {
                const chunkKey = chunksToLoad[i];
                
                // Update progress (82-95% range for chunks)
                const progressPercent = 82 + Math.floor((i / totalChunksToLoad) * 13);
                this.loadProgress.update(`Loading chunk ${i+1}/${totalChunksToLoad}...`, progressPercent);
                
                // Small delay to prevent UI freezing
                await this.delay(10);
                
                // Load chunk data
                const chunkData = chunkLoader(chunkKey);
                
                if (chunkData) {
                    // Process chunk data
                    WorldSerializer.processChunkData(world, chunkData);
                }
            }
        } else {
            // Fall back to old format if no chunk index found
            this.loadProgress.update('No chunk index found, using legacy format...', 85);
            await this.delay(100);
            
            if (worldData.environmentObjects) {
                if (world.environmentManager) {
                    world.environmentManager.savedObjects = worldData.environmentObjects;
                } else {
                    world.savedEnvironmentObjects = worldData.environmentObjects;
                }
            }
            
            if (worldData.terrainChunks) {
                if (world.terrainManager) {
                    world.terrainManager.savedChunks = worldData.terrainChunks;
                } else {
                    world.savedTerrainChunks = worldData.terrainChunks;
                }
            }
        }
        
        // Restore visible chunks
        this.loadProgress.update('Restoring visible chunks...', 95);
        await this.delay(100);
        
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
                    world.terrainManager.visibleTerrainChunks[chunkKey] = [];
                });
            } else {
                world.visibleTerrainChunks = {};
                worldData.visibleTerrainChunks.forEach(chunkKey => {
                    world.visibleTerrainChunks[chunkKey] = [];
                });
            }
        }
    }
    
    /**
     * Save world chunks individually to storage
     * @returns {Object} Chunk index
     */
    saveWorldChunks() {
        const world = this.game.world;
        const chunkIndex = {};
        
        SaveUtils.log('Saving world chunks to local storage...');
        
        // Check if terrainManager exists and has terrainChunks
        if (!world.terrainManager || !world.terrainManager.terrainChunks) {
            SaveUtils.log('No terrain chunks found to save', 'warn');
            return chunkIndex;
        }
        
        // Save each chunk individually
        for (const chunkKey in world.terrainManager.terrainChunks) {
            // Serialize chunk data
            const chunkData = WorldSerializer.serializeChunk(world, chunkKey);
            
            if (!chunkData) {
                SaveUtils.log(`Failed to serialize chunk ${chunkKey}`, 'warn');
                continue;
            }
            
            // Save chunk data to storage with unique key
            const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
            const success = this.storage.saveData(chunkStorageKey, chunkData);
            
            if (success) {
                // Add to chunk index
                chunkIndex[chunkKey] = {
                    timestamp: Date.now(),
                    storageKey: chunkStorageKey
                };
            } else {
                SaveUtils.log(`Failed to save chunk ${chunkKey}`, 'warn');
            }
        }
        
        // Save chunk index
        this.storage.saveData(`${this.chunkSaveKeyPrefix}index`, chunkIndex);
        
        SaveUtils.log(`Saved ${Object.keys(chunkIndex).length} chunks to local storage`);
        return chunkIndex;
    }
    
    /**
     * Save world chunks individually to storage with progress updates
     * @returns {Promise<Object>} Promise resolving to chunk index
     */
    async saveWorldChunksWithProgress(auto = false) {
        const world = this.game.world;
        const chunkIndex = {};
        
        SaveUtils.log('Saving world chunks to local storage with progress...');
        
        // Check if terrainManager exists and has terrainChunks
        if (!world.terrainManager || !world.terrainManager.terrainChunks) {
            SaveUtils.log('No terrain chunks found to save', 'warn');
            !auto && this.saveProgress.update('No terrain chunks found to save', 75);
            return chunkIndex;
        }
        
        // Get total number of chunks for progress calculation
        const chunkKeys = Object.keys(world.terrainManager.terrainChunks);
        const totalChunks = chunkKeys.length;
        
        if (totalChunks === 0) {
            SaveUtils.log('No chunks to save', 'warn');
            !auto && this.saveProgress.update('No chunks to save', 75);
            return chunkIndex;
        }
        
        // Save each chunk individually with progress updates
        for (let i = 0; i < chunkKeys.length; i++) {
            const chunkKey = chunkKeys[i];
            
            // Update progress (70-90% range for chunks)
            const progressPercent = 70 + Math.floor((i / totalChunks) * 20);
            !auto && this.saveProgress.update(`Saving chunk ${i+1}/${totalChunks}...`, progressPercent);
            
            // Small delay to prevent UI freezing
            await this.delay(10);
            
            // Serialize chunk data
            const chunkData = WorldSerializer.serializeChunk(world, chunkKey);
            
            if (!chunkData) {
                SaveUtils.log(`Failed to serialize chunk ${chunkKey}`, 'warn');
                continue;
            }
            
            // Save chunk data to storage with unique key
            const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
            const success = this.storage.saveData(chunkStorageKey, chunkData);
            
            if (success) {
                // Add to chunk index
                chunkIndex[chunkKey] = {
                    timestamp: Date.now(),
                    storageKey: chunkStorageKey
                };
            } else {
                SaveUtils.log(`Failed to save chunk ${chunkKey}`, 'warn');
            }
        }
        
        // Save chunk index
        !auto && this.saveProgress.update('Finalizing chunk index...', 90);
        await this.delay(50);
        
        this.storage.saveData(`${this.chunkSaveKeyPrefix}index`, chunkIndex);
        
        SaveUtils.log(`Saved ${Object.keys(chunkIndex).length} chunks to local storage`);
        return chunkIndex;
    }
    
    /**
     * Load chunk index from storage
     * @returns {Object|null} Chunk index or null if not found
     */
    loadChunkIndex() {
        try {
            const chunkIndex = this.storage.loadData(`${this.chunkSaveKeyPrefix}index`);
            if (!chunkIndex) {
                SaveUtils.log('No chunk index found in storage');
                return null;
            }
            
            return chunkIndex;
        } catch (error) {
            SaveUtils.log('Error loading chunk index: ' + error.message, 'error');
            return null;
        }
    }
    
    /**
     * Load a specific chunk from storage
     * @param {string} chunkKey - The chunk key
     * @returns {Object|null} Chunk data or null if not found
     */
    loadChunk(chunkKey) {
        try {
            const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
            const chunkData = this.storage.loadData(chunkStorageKey);
            
            if (!chunkData) {
                SaveUtils.log(`Chunk ${chunkKey} not found in storage`);
                return null;
            }
            
            return chunkData;
        } catch (error) {
            SaveUtils.log(`Error loading chunk ${chunkKey}: ${error.message}`, 'error');
            return null;
        }
    }
    
    /**
     * Delete all save data
     * @returns {boolean} Success status
     */
    deleteSave() {
        try {
            // Remove main save data from storage
            this.storage.deleteData(this.saveKey);
            
            // Get chunk index
            const chunkIndex = this.loadChunkIndex();
            
            // Remove all chunk data
            if (chunkIndex) {
                for (const chunkKey in chunkIndex) {
                    const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
                    this.storage.deleteData(chunkStorageKey);
                }
            }
            
            // Remove chunk index
            this.storage.deleteData(`${this.chunkSaveKeyPrefix}index`);
            
            SaveUtils.log('All save data deleted successfully');
            return true;
        } catch (error) {
            SaveUtils.log('Error deleting save data: ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * Check if save data exists
     * @returns {boolean} Whether save data exists
     */
    hasSaveData() {
        return this.storage.hasData(this.saveKey);
    }
}