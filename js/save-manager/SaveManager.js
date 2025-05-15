import { ISaveSystem } from './ISaveSystem.js';
import { LocalStorageAdapter } from './LocalStorageAdapter.js';
import { PlayerSerializer } from './serializers/PlayerSerializer.js';
import { QuestSerializer } from './serializers/QuestSerializer.js';
import { WorldSerializer } from './serializers/WorldSerializer.js';
import { SettingsSerializer } from './serializers/SettingsSerializer.js';
import { SaveUtils } from './utils/SaveUtils.js';
import { SaveOperationProgress } from './utils/SaveOperationProgress.js';
import { STORAGE_KEYS } from '../config/storage-keys.js';

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
        this.saveKey = STORAGE_KEYS.SAVE_DATA;
        this.chunkSaveKeyPrefix = STORAGE_KEYS.CHUNK_PREFIX;
        this.autoSaveInterval = 60_000; // Auto-save every minute (reduced frequency)
        this.autoSaveTimer = null;
        this.lastSaveLevel = 0; // Track player level at last save
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
        
        // No need to load chunk index anymore since we're only saving hero data
        
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
     * Only saves hero information (player data, quests, settings)
     * @param {boolean} forceSave - Whether to force save regardless of conditions
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async saveGame(forceSave = false, autoSave = false) {
        try {
            const currentTime = Date.now();
            const playerLevel = this.game.player.stats.level;
            
            // Check if we should save based on time passed
            const timeSinceLastSave = currentTime - this.lastSaveTime;
            const enoughTimePassed = timeSinceLastSave > this.minTimeBetweenSaves;
            
            if (!forceSave && !enoughTimePassed) {
                SaveUtils.log('Skipping save - not enough time passed since last save');
                return true; // Skip saving but return success
            }

            // Initialize progress indicator
            !autoSave && this.saveProgress.start('Preparing to save hero data...');
            
            // Create save data object (only hero-related data)
            !autoSave && this.saveProgress.update('Collecting player data...', 20);
            await this.delay(50); // Small delay for UI update
            
            const playerData = PlayerSerializer.serialize(this.game.player);
            
            !autoSave && this.saveProgress.update('Collecting quest data...', 40);
            await this.delay(50); // Small delay for UI update
            
            const questData = QuestSerializer.serialize(this.game.questManager);
            
            !autoSave && this.saveProgress.update('Collecting settings...', 60);
            await this.delay(50); // Small delay for UI update
            
            const settingsData = SettingsSerializer.serialize(this.game);
            
            const saveData = {
                player: playerData,
                quests: questData,
                settings: settingsData,
                timestamp: currentTime,
                version: this.currentVersion
            };
            
            !autoSave && this.saveProgress.update('Writing hero data to storage...', 80);
            await this.delay(100); // Small delay for UI update
        
            // Save to storage
            const success = this.storage.saveData(this.saveKey, saveData);
            
            if (!success) {
                throw new Error('Failed to save hero data');
            }
            
            this.lastSaveTime = currentTime;
            this.lastSaveLevel = playerLevel;
            
            !autoSave && this.saveProgress.update('Save complete!', 100);
            await this.delay(500); // Show completion for a moment
            
            SaveUtils.log('Hero data saved successfully');
            SaveUtils.showNotification(this.game, 'Hero data saved successfully');
            
            // Complete the progress indicator
            this.saveProgress.complete();
            
            return true;
        } catch (error) {
            SaveUtils.log('Error saving hero data: ' + error.message, 'error');
            
            // Show error in progress indicator
            this.saveProgress.error('Failed to save hero data: ' + error.message);
            
            SaveUtils.showNotification(this.game, 'Failed to save hero data', 3000, 'error');
            
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
     * Only loads hero-related data (player, quests, settings)
     * @returns {Promise<boolean>} Promise resolving to success status
     */
    async loadGame() {
        try {
            // Initialize progress indicator
            this.loadProgress.start('Preparing to load hero data...');
            
            // Get save data from storage
            this.loadProgress.update('Reading save data...', 20);
            await this.delay(100); // Small delay for UI update
            
            const saveData = this.storage.loadData(this.saveKey);
            
            // Check if save data exists
            if (!saveData) {
                SaveUtils.log('No save data found');
                this.loadProgress.error('No save data found');
                return false;
            }
            
            this.loadProgress.update('Validating save data...', 30);
            await this.delay(100); // Small delay for UI update
            
            SaveUtils.log('Save data parsed successfully: ' + Object.keys(saveData).join(', '));
            
            // Check version compatibility
            if (saveData.version !== this.currentVersion) {
                SaveUtils.log('Save data version mismatch, some data may not load correctly', 'warn');
                this.loadProgress.update('Warning: Save data version mismatch', 35);
            }
            
            // Clear existing enemies
            this.loadProgress.update('Clearing enemies...', 40);
            await this.delay(100); // Small delay for UI update
            
            if (this.game.enemyManager) {
                this.game.enemyManager.removeAllEnemies();
            } else {
                SaveUtils.log('Enemy manager not found, skipping enemy removal', 'warn');
            }
            
            // Load player data
            this.loadProgress.update('Loading player data...', 50);
            await this.delay(150); // Small delay for UI update
            
            if (saveData.player) {
                SaveUtils.log('Loading player data...');
                PlayerSerializer.deserialize(this.game.player, saveData.player);
            } else {
                SaveUtils.log('No player data found in save', 'warn');
                this.loadProgress.update('Warning: No player data found', 55);
            }
            
            // Load quest data
            this.loadProgress.update('Loading quest data...', 70);
            await this.delay(150); // Small delay for UI update
            
            if (saveData.quests) {
                SaveUtils.log('Loading quest data...');
                QuestSerializer.deserialize(this.game.questManager, saveData.quests);
            } else {
                SaveUtils.log('No quest data found in save', 'warn');
                this.loadProgress.update('Warning: No quest data found', 75);
            }
            
            // Load game settings - handle errors separately to prevent blocking game load
            this.loadProgress.update('Loading game settings...', 85);
            await this.delay(100); // Small delay for UI update
            
            if (saveData.settings) {
                SaveUtils.log('Loading game settings...');
                try {
                    SettingsSerializer.deserialize(this.game, saveData.settings);
                } catch (settingsError) {
                    SaveUtils.log('Error loading game settings: ' + settingsError.message, 'error');
                    this.loadProgress.update('Warning: Error loading settings', 90);
                    // Continue loading the game with default settings
                    SaveUtils.log('Continuing with default settings');
                }
            } else {
                SaveUtils.log('No settings data found in save', 'warn');
                this.loadProgress.update('Warning: No settings data found', 90);
            }
            
            // Update last save level to prevent immediate re-saving
            if (saveData.player && saveData.player.level) {
                this.lastSaveLevel = saveData.player.level;
            }
            
            // Update last save time
            this.lastSaveTime = Date.now();
            
            this.loadProgress.update('Load complete!', 100);
            await this.delay(500); // Show completion for a moment
            
            SaveUtils.log('Hero data loaded successfully');
            SaveUtils.showNotification(this.game, 'Hero data loaded successfully');
            
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
            SaveUtils.log('Error loading hero data: ' + error.message, 'error');
            
            // Show error in progress indicator
            this.loadProgress.error('Failed to load hero data: ' + error.message);
            
            SaveUtils.showNotification(this.game, 'Failed to load hero data: ' + error.message, 3000, 'error');
            
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
        
        // Chunk loading has been removed
        this.loadProgress.update('Skipping chunk loading (feature removed)...', 82);
        await this.delay(100);
        
        // No chunk loading anymore
        SaveUtils.log('Chunk loading has been removed from the game');
        
        // Process legacy world data
        this.loadProgress.update('Processing world data...', 85);
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
    
    // saveWorldChunks method has been removed
    
    // saveWorldChunksWithProgress method has been removed
    
    // loadChunkIndex method has been removed
    
    // loadChunk method has been removed
    
    /**
     * Delete all save data
     * @returns {boolean} Success status
     */
    deleteSave() {
        try {
            // Remove main save data from storage
            this.storage.deleteData(this.saveKey);
            
            SaveUtils.log('Hero save data deleted successfully');
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