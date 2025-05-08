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
            this.saveGame();
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
    async saveGame(forceSave = false) {
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
            this.saveProgress.start('Preparing to save game...');
            
            // Create save data object (without full world data)
            this.saveProgress.update('Collecting player data...', 10);
            await this.delay(50); // Small delay for UI update
            
            const playerData = PlayerSerializer.serialize(this.game.player);
            
            this.saveProgress.update('Collecting quest data...', 20);
            await this.delay(50); // Small delay for UI update
            
            const questData = QuestSerializer.serialize(this.game.questManager);
            
            this.saveProgress.update('Collecting settings...', 30);
            await this.delay(50); // Small delay for UI update
            
            const settingsData = SettingsSerializer.serialize(this.game);
            
            this.saveProgress.update('Collecting world metadata...', 40);
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
            
            // Save to storage
            this.saveProgress.update('Writing save data to storage...', 60);
            await this.delay(100); // Small delay for UI update
            
            const success = this.storage.saveData(this.saveKey, saveData);
            
            if (!success) {
                throw new Error('Failed to save game data');
            }
            
            // Save chunks separately if at level milestone or forced
            if (shouldSaveByLevel || forceSave) {
                this.saveProgress.update('Saving world chunks...', 70);
                await this.saveWorldChunksWithProgress();
                this.lastSaveLevel = playerLevel;
            } else {
                this.saveProgress.update('Skipping world chunks...', 80);
            }
            
            this.lastSaveTime = currentTime;
            
            this.saveProgress.update('Save complete!', 100);
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
     * Load a saved game
     * @returns {boolean} Success status
     */
    loadGame() {
        try {
            // Get save data from storage
            const saveData = this.storage.loadData(this.saveKey);
            
            // Check if save data exists
            if (!saveData) {
                SaveUtils.log('No save data found');
                return false;
            }
            
            SaveUtils.log('Save data parsed successfully: ' + Object.keys(saveData).join(', '));
            
            // Check version compatibility
            if (saveData.version !== this.currentVersion) {
                SaveUtils.log('Save data version mismatch, some data may not load correctly', 'warn');
            }
            
            // Clear existing game state
            if (this.game.enemyManager) {
                this.game.enemyManager.removeAllEnemies();
            } else {
                SaveUtils.log('Enemy manager not found, skipping enemy removal', 'warn');
            }
            
            // Load player data
            if (saveData.player) {
                SaveUtils.log('Loading player data...');
                PlayerSerializer.deserialize(this.game.player, saveData.player);
            } else {
                SaveUtils.log('No player data found in save', 'warn');
            }
            
            // Load quest data
            if (saveData.quests) {
                SaveUtils.log('Loading quest data...');
                QuestSerializer.deserialize(this.game.questManager, saveData.quests);
            } else {
                SaveUtils.log('No quest data found in save', 'warn');
            }
            
            // Load world data - check for new or old format
            SaveUtils.log('Loading world data...');
            if (saveData.worldMeta) {
                // New format - load world metadata
                SaveUtils.log('Using new world metadata format');
                WorldSerializer.deserialize(
                    this.game.world, 
                    saveData.worldMeta, 
                    this.game, 
                    (chunkKey) => this.loadChunk(chunkKey)
                );
            } else if (saveData.world) {
                // Old format - load full world data
                SaveUtils.log('Using old world data format');
                WorldSerializer.deserialize(
                    this.game.world, 
                    saveData.world, 
                    this.game, 
                    (chunkKey) => this.loadChunk(chunkKey)
                );
            } else {
                SaveUtils.log('No world data found in save', 'warn');
            }
            
            // Load game settings - handle errors separately to prevent blocking game load
            if (saveData.settings) {
                SaveUtils.log('Loading game settings...');
                try {
                    SettingsSerializer.deserialize(this.game, saveData.settings);
                } catch (settingsError) {
                    SaveUtils.log('Error loading game settings: ' + settingsError.message, 'error');
                    // Continue loading the game with default settings
                    SaveUtils.log('Continuing with default settings');
                }
            } else {
                SaveUtils.log('No settings data found in save', 'warn');
            }
            
            // Update last save level to prevent immediate re-saving
            if (saveData.player && saveData.player.level) {
                this.lastSaveLevel = saveData.player.level;
            }
            
            // Update last save time
            this.lastSaveTime = Date.now();
            
            SaveUtils.log('Game loaded successfully');
            SaveUtils.showNotification(this.game, 'Game loaded successfully');
            
            // Update UI elements
            if (this.game.isRunning && this.game.uiManager) {
                this.game.uiManager.updatePlayerUI();
                this.game.uiManager.updateQuestLog(this.game.questManager.activeQuests);
            }
            
            return true;
        } catch (error) {
            SaveUtils.log('Error loading game: ' + error.message, 'error');
            SaveUtils.showNotification(this.game, 'Failed to load game: ' + error.message, 3000, 'error');
            
            return false;
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
    async saveWorldChunksWithProgress() {
        const world = this.game.world;
        const chunkIndex = {};
        
        SaveUtils.log('Saving world chunks to local storage with progress...');
        
        // Check if terrainManager exists and has terrainChunks
        if (!world.terrainManager || !world.terrainManager.terrainChunks) {
            SaveUtils.log('No terrain chunks found to save', 'warn');
            this.saveProgress.update('No terrain chunks found to save', 75);
            return chunkIndex;
        }
        
        // Get total number of chunks for progress calculation
        const chunkKeys = Object.keys(world.terrainManager.terrainChunks);
        const totalChunks = chunkKeys.length;
        
        if (totalChunks === 0) {
            SaveUtils.log('No chunks to save', 'warn');
            this.saveProgress.update('No chunks to save', 75);
            return chunkIndex;
        }
        
        // Save each chunk individually with progress updates
        for (let i = 0; i < chunkKeys.length; i++) {
            const chunkKey = chunkKeys[i];
            
            // Update progress (70-90% range for chunks)
            const progressPercent = 70 + Math.floor((i / totalChunks) * 20);
            this.saveProgress.update(`Saving chunk ${i+1}/${totalChunks}...`, progressPercent);
            
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
        this.saveProgress.update('Finalizing chunk index...', 90);
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