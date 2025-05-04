export class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'diablo_immortal_save';
        this.chunkSaveKeyPrefix = 'diablo_immortal_chunk_';
        this.autoSaveInterval = 60_000; // Auto-save every minute (reduced frequency)
        this.autoSaveTimer = null;
        this.lastSaveLevel = 0; // Track player level at last save
        this.saveThresholdLevels = [5, 10, 15, 20, 30, 40, 50]; // Save at these level milestones
        this.lastSaveTime = 0; // Track time of last save
        this.minTimeBetweenSaves = 60_000; // Minimum minute between saves
    }
    
    init() {
        // Start auto-save timer
        this.startAutoSave();
        
        // Load any existing save data
        this.loadChunkIndex();
        
        return true;
    }
    
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
    
    stopAutoSave() {
        // Clear timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    saveGame(forceSave = false) {
        try {
            const currentTime = Date.now();
            const playerLevel = this.game.player.stats.level;
            
            // Check if we should save based on level milestones or forced save
            const shouldSaveByLevel = this.saveThresholdLevels.includes(playerLevel) && playerLevel > this.lastSaveLevel;
            const timeSinceLastSave = currentTime - this.lastSaveTime;
            const enoughTimePassed = timeSinceLastSave > this.minTimeBetweenSaves;
            
            if (!forceSave && !shouldSaveByLevel && !enoughTimePassed) {
                console.log('Skipping save - not at level milestone or not enough time passed');
                return true; // Skip saving but return success
            }
            
            // Create save data object (without full world data)
            const saveData = {
                player: this.getPlayerData(),
                quests: this.getQuestData(),
                settings: this.getGameSettings(),
                timestamp: currentTime,
                version: '1.1.0',
                // Only save world metadata, not full chunk data
                worldMeta: this.getWorldMetadata()
            };
            
            // Convert to JSON string
            const saveString = JSON.stringify(saveData);
            
            // Save to local storage
            localStorage.setItem(this.saveKey, saveString);
            
            // Save chunks separately if at level milestone or forced
            if (shouldSaveByLevel || forceSave) {
                this.saveWorldChunks();
                this.lastSaveLevel = playerLevel;
            }
            
            this.lastSaveTime = currentTime;
            
            console.log('Game saved successfully');
            
            // Show notification if game is running
            if (this.game.isRunning && this.game.uiManager) {
                this.game.uiManager.showNotification('Game saved successfully');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            
            // Show error notification if game is running
            if (this.game.isRunning && this.game.uiManager) {
                this.game.uiManager.showNotification('Failed to save game', 3000, 'error');
            }
            
            return false;
        }
    }
    
    loadGame() {
        try {
            // Get save data from local storage
            const saveString = localStorage.getItem(this.saveKey);
            
            // Check if save data exists
            if (!saveString) {
                console.log('No save data found');
                return false;
            }
            
            // Parse save data
            const saveData = JSON.parse(saveString);
            
            // Check version compatibility
            if (saveData.version !== '1.1.0') {
                console.warn('Save data version mismatch, some data may not load correctly');
            }
            
            // Clear existing game state
            this.game.enemyManager.removeAllEnemies();
            
            // Load player data
            this.loadPlayerData(saveData.player);
            
            // Load quest data
            this.loadQuestData(saveData.quests);
            
            // Load world data - check for new or old format
            if (saveData.worldMeta) {
                // New format - load world metadata
                this.loadWorldData(saveData.worldMeta);
            } else if (saveData.world) {
                // Old format - load full world data
                this.loadWorldData(saveData.world);
            }
            
            // Load game settings
            if (saveData.settings) {
                this.loadGameSettings(saveData.settings);
            }
            
            // Update last save level to prevent immediate re-saving
            if (saveData.player && saveData.player.level) {
                this.lastSaveLevel = saveData.player.level;
            }
            
            // Update last save time
            this.lastSaveTime = Date.now();
            
            console.log('Game loaded successfully');
            
            // Show notification if game is running
            if (this.game.isRunning && this.game.uiManager) {
                this.game.uiManager.showNotification('Game loaded successfully');
                
                // Update UI elements
                this.game.uiManager.updatePlayerUI();
                this.game.uiManager.updateQuestLog(this.game.questManager.activeQuests);
            }
            
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
            
            // Show error notification if game is running
            if (this.game.isRunning && this.game.uiManager) {
                this.game.uiManager.showNotification('Failed to load game', 3000, 'error');
            }
            
            return false;
        }
    }
    
    getPlayerData() {
        const player = this.game.player;
        
        return {
            stats: { ...player.stats },
            position: {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z
            },
            inventory: [...player.inventory],
            equipment: { ...player.equipment },
            gold: player.gold,
            level: player.stats.level,
            experience: player.stats.experience,
            skills: player.skills.map(skill => ({
                name: skill.name,
                cooldown: skill.cooldown,
                currentCooldown: skill.currentCooldown
            }))
        };
    }
    
    getQuestData() {
        const questManager = this.game.questManager;
        
        return {
            activeQuests: questManager.activeQuests.map(quest => ({
                ...quest,
                // Ensure objective progress is saved
                objective: {
                    ...quest.objective,
                    progress: quest.objective.progress,
                    discovered: quest.objective.discovered || []
                }
            })),
            completedQuests: [...questManager.completedQuests],
            availableQuests: [...questManager.quests]
        };
    }
    
    // Get only world metadata (not full chunk data)
    getWorldMetadata() {
        const world = this.game.world;
        
        // Save discovered zones, interactive objects state, etc.
        return {
            discoveredZones: world.zones.filter(zone => zone.discovered).map(zone => zone.name),
            interactiveObjects: world.interactiveObjects.map(obj => ({
                type: obj.type,
                position: {
                    x: obj.position.x,
                    y: obj.position.y,
                    z: obj.position.z
                },
                isOpen: obj.isOpen || false,
                isCompleted: obj.isCompleted || false
            })),
            // Save current player chunk for reference
            currentChunk: world.currentChunk,
            // Save list of chunk keys that exist (for index)
            chunkKeys: Object.keys(world.terrainChunks),
            // Save visible chunks
            visibleChunks: Object.keys(world.visibleChunks),
            // Save visible terrain chunks
            visibleTerrainChunks: Object.keys(world.visibleTerrainChunks)
        };
    }
    
    // Save world chunks individually to local storage
    saveWorldChunks() {
        const world = this.game.world;
        const chunkIndex = {};
        
        console.log('Saving world chunks to local storage...');
        
        // Save each chunk individually
        for (const chunkKey in world.terrainChunks) {
            // Get environment objects for this chunk
            const environmentObjects = world.environmentObjects[chunkKey] || [];
            
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
            const chunkData = {
                key: chunkKey,
                environmentObjects: serializedEnvironmentObjects,
                // Store any structures in this chunk
                structures: world.structuresPlaced[chunkKey] || []
            };
            
            // Save chunk data to local storage with unique key
            const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
            localStorage.setItem(chunkStorageKey, JSON.stringify(chunkData));
            
            // Add to chunk index
            chunkIndex[chunkKey] = {
                timestamp: Date.now(),
                storageKey: chunkStorageKey
            };
        }
        
        // Save chunk index
        localStorage.setItem(`${this.chunkSaveKeyPrefix}index`, JSON.stringify(chunkIndex));
        
        console.log(`Saved ${Object.keys(chunkIndex).length} chunks to local storage`);
        return chunkIndex;
    }
    
    // Load chunk index from local storage
    loadChunkIndex() {
        try {
            const indexString = localStorage.getItem(`${this.chunkSaveKeyPrefix}index`);
            if (!indexString) {
                console.log('No chunk index found in local storage');
                return null;
            }
            
            return JSON.parse(indexString);
        } catch (error) {
            console.error('Error loading chunk index:', error);
            return null;
        }
    }
    
    // Load a specific chunk from local storage
    loadChunk(chunkKey) {
        try {
            const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
            const chunkString = localStorage.getItem(chunkStorageKey);
            
            if (!chunkString) {
                console.log(`Chunk ${chunkKey} not found in local storage`);
                return null;
            }
            
            return JSON.parse(chunkString);
        } catch (error) {
            console.error(`Error loading chunk ${chunkKey}:`, error);
            return null;
        }
    }
    
    getGameSettings() {
        return {
            difficulty: this.game.difficultyManager.getCurrentDifficultyIndex(),
            audioSettings: {
                isMuted: this.game.audioManager.isMuted,
                musicVolume: this.game.audioManager.musicVolume,
                sfxVolume: this.game.audioManager.sfxVolume
            }
        };
    }
    
    loadPlayerData(playerData) {
        const player = this.game.player;
        
        // Load stats
        player.stats = { ...playerData.stats };
        
        // Load position
        player.setPosition(
            playerData.position.x,
            playerData.position.y,
            playerData.position.z
        );
        
        // Load inventory
        player.inventory = [...playerData.inventory];
        
        // Load equipment
        player.equipment = { ...playerData.equipment };
        
        // Load gold
        player.gold = playerData.gold;
        
        // Load skills cooldowns if available
        if (playerData.skills && Array.isArray(playerData.skills)) {
            playerData.skills.forEach((savedSkill, index) => {
                if (index < player.skills.length) {
                    player.skills[index].currentCooldown = savedSkill.currentCooldown || 0;
                }
            });
        }
    }
    
    loadQuestData(questData) {
        const questManager = this.game.questManager;
        
        // Reset quest state
        questManager.activeQuests = [];
        questManager.completedQuests = [];
        
        // Load active quests with their progress
        if (questData.activeQuests && Array.isArray(questData.activeQuests)) {
            questManager.activeQuests = questData.activeQuests.map(quest => {
                // Find the original quest template
                const originalQuest = questManager.quests.find(q => q.id === quest.id);
                if (originalQuest) {
                    // Create a new quest object with progress from saved data
                    return {
                        ...originalQuest,
                        objective: {
                            ...originalQuest.objective,
                            progress: quest.objective.progress,
                            discovered: quest.objective.discovered || []
                        }
                    };
                }
                return quest;
            });
        }
        
        // Load completed quests
        if (questData.completedQuests && Array.isArray(questData.completedQuests)) {
            questManager.completedQuests = [...questData.completedQuests];
        }
        
        // Filter available quests to remove active and completed ones
        questManager.quests = questManager.quests.filter(quest => {
            const isActive = questManager.activeQuests.some(q => q.id === quest.id);
            const isCompleted = questManager.completedQuests.some(q => q.id === quest.id);
            return !isActive && !isCompleted;
        });
        
        // Update UI
        this.game.uiManager.updateQuestLog(questManager.activeQuests);
    }
    
    loadWorldData(worldData) {
        if (!worldData) return;
        
        const world = this.game.world;
        
        // Mark discovered zones
        if (worldData.discoveredZones && Array.isArray(worldData.discoveredZones)) {
            worldData.discoveredZones.forEach(zoneName => {
                const zone = world.zones.find(z => z.name === zoneName);
                if (zone) {
                    zone.discovered = true;
                }
            });
        }
        
        // Restore interactive objects state
        if (worldData.interactiveObjects && Array.isArray(worldData.interactiveObjects)) {
            worldData.interactiveObjects.forEach(savedObj => {
                const obj = world.interactiveObjects.find(o => 
                    o.type === savedObj.type && 
                    Math.abs(o.position.x - savedObj.position.x) < 1 &&
                    Math.abs(o.position.z - savedObj.position.z) < 1
                );
                
                if (obj) {
                    obj.isOpen = savedObj.isOpen;
                    obj.isCompleted = savedObj.isCompleted;
                }
            });
        }
        
        // Restore current chunk
        if (worldData.currentChunk) {
            world.currentChunk = worldData.currentChunk;
        }
        
        // Clear existing terrain and environment objects
        world.clearWorldObjects();
        
        // Load chunk data from individual storage
        const chunkIndex = this.loadChunkIndex();
        
        if (chunkIndex) {
            console.log(`Found ${Object.keys(chunkIndex).length} saved chunks in index`);
            
            // Create a temporary storage for environment objects
            const savedEnvironmentObjects = {};
            
            // Create a temporary storage for terrain chunks
            const savedTerrainChunks = {};
            
            // Only load chunks near the player's current position
            const playerChunkX = Math.floor(this.game.player.position.x / world.terrainChunkSize);
            const playerChunkZ = Math.floor(this.game.player.position.z / world.terrainChunkSize);
            const loadDistance = 2; // Only load chunks within 2 chunks of player
            
            // Count how many chunks we're loading
            let loadedChunkCount = 0;
            
            // Process each chunk in the index
            for (const chunkKey in chunkIndex) {
                // Parse the chunk coordinates
                const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
                
                // Check if this chunk is within load distance
                const distanceX = Math.abs(chunkX - playerChunkX);
                const distanceZ = Math.abs(chunkZ - playerChunkZ);
                
                if (distanceX <= loadDistance && distanceZ <= loadDistance) {
                    // Load this chunk from storage
                    const chunkData = this.loadChunk(chunkKey);
                    
                    if (chunkData) {
                        // Store environment objects for this chunk
                        if (chunkData.environmentObjects && chunkData.environmentObjects.length > 0) {
                            savedEnvironmentObjects[chunkKey] = chunkData.environmentObjects;
                        }
                        
                        // Mark this chunk as existing
                        savedTerrainChunks[chunkKey] = true;
                        
                        loadedChunkCount++;
                    }
                } else {
                    // Just mark this chunk as existing without loading its data
                    savedTerrainChunks[chunkKey] = true;
                }
            }
            
            console.log(`Loaded ${loadedChunkCount} chunks near player position`);
            
            // Store the loaded data for world to use
            world.savedEnvironmentObjects = savedEnvironmentObjects;
            world.savedTerrainChunks = savedTerrainChunks;
        } else if (worldData.environmentObjects && worldData.terrainChunks) {
            // Fall back to old format if no chunk index found
            console.log('No chunk index found, falling back to legacy format');
            world.savedEnvironmentObjects = worldData.environmentObjects;
            world.savedTerrainChunks = worldData.terrainChunks;
        }
        
        // Restore visible chunks
        if (worldData.visibleChunks && Array.isArray(worldData.visibleChunks)) {
            world.visibleChunks = {};
            worldData.visibleChunks.forEach(chunkKey => {
                world.visibleChunks[chunkKey] = [];
            });
        }
        
        // Restore visible terrain chunks
        if (worldData.visibleTerrainChunks && Array.isArray(worldData.visibleTerrainChunks)) {
            world.visibleTerrainChunks = {};
            worldData.visibleTerrainChunks.forEach(chunkKey => {
                world.visibleTerrainChunks[chunkKey] = true;
            });
        }
        
        // Update the world based on player position to regenerate necessary chunks
        if (this.game.player) {
            world.updateWorldForPlayer(this.game.player.position);
        }
    }
    
    loadGameSettings(settings) {
        if (!settings) return;
        
        // Load difficulty
        if (settings.difficulty !== undefined) {
            this.game.difficultyManager.setDifficulty(settings.difficulty);
        }
        
        // Load audio settings
        if (settings.audioSettings) {
            if (settings.audioSettings.isMuted !== undefined) {
                this.game.audioManager.isMuted = settings.audioSettings.isMuted;
            }
            
            if (settings.audioSettings.musicVolume !== undefined) {
                this.game.audioManager.setMusicVolume(settings.audioSettings.musicVolume);
            }
            
            if (settings.audioSettings.sfxVolume !== undefined) {
                this.game.audioManager.setSFXVolume(settings.audioSettings.sfxVolume);
            }
        }
    }
    
    deleteSave() {
        try {
            // Remove main save data from local storage
            localStorage.removeItem(this.saveKey);
            
            // Get chunk index
            const chunkIndex = this.loadChunkIndex();
            
            // Remove all chunk data
            if (chunkIndex) {
                for (const chunkKey in chunkIndex) {
                    const chunkStorageKey = `${this.chunkSaveKeyPrefix}${chunkKey}`;
                    localStorage.removeItem(chunkStorageKey);
                }
            }
            
            // Remove chunk index
            localStorage.removeItem(`${this.chunkSaveKeyPrefix}index`);
            
            console.log('All save data deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting save data:', error);
            return false;
        }
    }
    
    hasSaveData() {
        return localStorage.getItem(this.saveKey) !== null;
    }
}