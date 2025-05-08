export class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'monk_journey_save';
        this.chunkSaveKeyPrefix = 'monk_journey_chunk_';
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
        
        // Just load the chunk index, but don't load the game data yet
        // This will be done explicitly when the user clicks "Load Game"
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
            
            try {
                // Parse save data
                const saveData = JSON.parse(saveString);
                console.log('Save data parsed successfully:', Object.keys(saveData));
                
                // Check version compatibility
                if (saveData.version !== '1.1.0') {
                    console.warn('Save data version mismatch, some data may not load correctly');
                }
                
                try {
                    // Clear existing game state
                    if (this.game.enemyManager) {
                        this.game.enemyManager.removeAllEnemies();
                    } else {
                        console.warn('Enemy manager not found, skipping enemy removal');
                    }
                    
                    try {
                        // Load player data
                        if (saveData.player) {
                            console.log('Loading player data...');
                            this.loadPlayerData(saveData.player);
                            console.log('Player data loaded successfully');
                        } else {
                            console.warn('No player data found in save');
                        }
                        
                        try {
                            // Load quest data
                            if (saveData.quests) {
                                console.log('Loading quest data...');
                                this.loadQuestData(saveData.quests);
                                console.log('Quest data loaded successfully');
                            } else {
                                console.warn('No quest data found in save');
                            }
                            
                            try {
                                // Load world data - check for new or old format
                                console.log('Loading world data...');
                                if (saveData.worldMeta) {
                                    // New format - load world metadata
                                    console.log('Using new world metadata format');
                                    this.loadWorldData(saveData.worldMeta);
                                } else if (saveData.world) {
                                    // Old format - load full world data
                                    console.log('Using old world data format');
                                    this.loadWorldData(saveData.world);
                                } else {
                                    console.warn('No world data found in save');
                                }
                                console.log('World data loaded successfully');
                                
                                // Load game settings - handle errors separately to prevent blocking game load
                                if (saveData.settings) {
                                    console.log('Loading game settings...');
                                    try {
                                        this.loadGameSettings(saveData.settings);
                                        console.log('Game settings loaded successfully');
                                    } catch (settingsError) {
                                        console.error('Error loading game settings:', settingsError);
                                        // Continue loading the game with default settings
                                        console.log('Continuing with default settings');
                                    }
                                } else {
                                    console.warn('No settings data found in save');
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
                            } catch (worldError) {
                                console.error('Error loading world data:', worldError);
                                throw worldError;
                            }
                        } catch (questError) {
                            console.error('Error loading quest data:', questError);
                            throw questError;
                        }
                    } catch (playerError) {
                        console.error('Error loading player data:', playerError);
                        throw playerError;
                    }
                } catch (gameStateError) {
                    console.error('Error clearing game state:', gameStateError);
                    throw gameStateError;
                }
            } catch (parseError) {
                console.error('Error parsing save data:', parseError);
                throw parseError;
            }
        } catch (error) {
            console.error('Error loading game:', error);
            
            // Show error notification if game is running
            if (this.game.isRunning && this.game.uiManager) {
                this.game.uiManager.showNotification('Failed to load game: ' + error.message, 3000, 'error');
            }
            
            return false;
        }
    }
    
    getPlayerData() {
        const player = this.game.player;
        
        // Create a default position if player.position is undefined
        const position = player.position ? {
            x: player.position.x,
            y: player.position.y,
            z: player.position.z
        } : { x: 0, y: 0, z: 0 };
        
        return {
            stats: { ...player.stats },
            position: position,
            inventory: [...player.getInventory()], // Use getInventory() method to get the array
            equipment: { ...player.equipment },
            gold: player.gold,
            level: player.stats.level,
            experience: player.stats.experience,
            skills: player.skills.getSkills().map(skill => ({
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
    
    // Save world chunks individually to local storage
    saveWorldChunks() {
        const world = this.game.world;
        const chunkIndex = {};
        
        console.log('Saving world chunks to local storage...');
        
        // Check if terrainManager exists and has terrainChunks
        if (!world.terrainManager || !world.terrainManager.terrainChunks) {
            console.warn('No terrain chunks found to save');
            return chunkIndex;
        }
        
        // Save each chunk individually
        for (const chunkKey in world.terrainManager.terrainChunks) {
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
            const chunkData = {
                key: chunkKey,
                environmentObjects: serializedEnvironmentObjects,
                // Store any structures in this chunk - check if structureManager exists
                structures: world.structureManager && world.structureManager.structures && 
                           world.structureManager.structures[chunkKey] || []
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
        try {
            const settings = {
                difficulty: this.game.difficultyManager ? 
                    this.game.difficultyManager.getCurrentDifficultyIndex() : 0,
                audioSettings: {}
            };
            
            // Only add audio settings if audioManager exists and is initialized
            if (this.game.audioManager) {
                settings.audioSettings = {
                    isMuted: this.game.audioManager.isMuted !== undefined ? 
                        this.game.audioManager.isMuted : false,
                    musicVolume: this.game.audioManager.musicVolume !== undefined ? 
                        this.game.audioManager.musicVolume : 0.5,
                    sfxVolume: this.game.audioManager.sfxVolume !== undefined ? 
                        this.game.audioManager.sfxVolume : 0.8
                };
            }
            
            return settings;
        } catch (error) {
            console.warn('Error getting game settings, returning defaults:', error);
            // Return default settings if there's an error
            return {
                difficulty: 0,
                audioSettings: {
                    isMuted: false,
                    musicVolume: 0.5,
                    sfxVolume: 0.8
                }
            };
        }
    }
    
    loadPlayerData(playerData) {
        if (!playerData) {
            console.error('Player data is null or undefined');
            return;
        }
        
        console.log('Loading player data:', Object.keys(playerData));
        const player = this.game.player;
        
        if (!player) {
            console.error('Player object is null or undefined');
            return;
        }
        
        try {
            // Load stats
            if (playerData.stats) {
                console.log('Loading player stats');
                // Instead of replacing the stats object, update its properties
                // This preserves the methods of the PlayerStats class
                Object.keys(playerData.stats).forEach(key => {
                    player.stats[key] = playerData.stats[key];
                });
            } else {
                console.warn('No player stats found in save data');
            }
            
            try {
                // Load position
                if (playerData.position) {
                    console.log('Loading player position');
                    player.setPosition(
                        playerData.position.x || 0,
                        playerData.position.y || 0,
                        playerData.position.z || 0
                    );
                } else {
                    console.warn('No player position found in save data, using default');
                    player.setPosition(0, 0, 0);
                }
                
                try {
                    // Load inventory - clear existing inventory and add each item
                    if (player.inventory) {
                        console.log('Loading player inventory');
                        if (player.inventory.inventory) {
                            player.inventory.inventory = []; // Clear the inventory array
                        } else {
                            console.warn('Player inventory.inventory is not an array, creating new one');
                            player.inventory.inventory = [];
                        }
                        
                        if (playerData.inventory && Array.isArray(playerData.inventory)) {
                            console.log(`Loading ${playerData.inventory.length} inventory items`);
                            playerData.inventory.forEach(item => {
                                if (player.addToInventory) {
                                    player.addToInventory(item);
                                } else {
                                    console.warn('Player addToInventory method not found');
                                    player.inventory.inventory.push(item);
                                }
                            });
                        } else {
                            console.warn('No inventory data found or not an array');
                        }
                    } else {
                        console.warn('Player inventory object not found');
                    }
                    
                    try {
                        // Load equipment
                        if (playerData.equipment) {
                            console.log('Loading player equipment');
                            // Check if player.equipment exists
                            if (!player.equipment) {
                                player.equipment = {};
                            }
                            // Update equipment properties instead of replacing the object
                            Object.keys(playerData.equipment).forEach(key => {
                                player.equipment[key] = playerData.equipment[key];
                            });
                        } else {
                            console.warn('No equipment data found in save');
                        }
                        
                        // Load additional player data if available
                        if (playerData.gold !== undefined) {
                            console.log('Loading player gold');
                            player.gold = playerData.gold;
                        }
                        
                        if (playerData.level !== undefined) {
                            console.log('Loading player level');
                            player.stats.level = playerData.level;
                        }
                        
                        if (playerData.experience !== undefined) {
                            console.log('Loading player experience');
                            player.stats.experience = playerData.experience;
                        }
                        
                        // Load skills if available
                        if (playerData.skills && Array.isArray(playerData.skills) && player.skills) {
                            console.log('Loading player skills');
                            try {
                                player.skills.loadSkills(playerData.skills);
                            } catch (skillError) {
                                console.warn('Error loading skills:', skillError);
                            }
                        }
                        
                        console.log('Player data loaded successfully');
                    } catch (equipmentError) {
                        console.error('Error loading equipment:', equipmentError);
                        throw equipmentError;
                    }
                } catch (inventoryError) {
                    console.error('Error loading inventory:', inventoryError);
                    throw inventoryError;
                }
            } catch (positionError) {
                console.error('Error loading position:', positionError);
                throw positionError;
            }
        } catch (statsError) {
            console.error('Error loading stats:', statsError);
            throw statsError;
        }
        
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
        if (!questData) {
            console.error('Quest data is null or undefined');
            return;
        }
        
        console.log('Loading quest data:', Object.keys(questData));
        
        const questManager = this.game.questManager;
        if (!questManager) {
            console.error('Quest manager is null or undefined');
            return;
        }
        
        try {
            // Reset quest state
            questManager.activeQuests = [];
            questManager.completedQuests = [];
            
            // Load active quests with their progress
            if (questData.activeQuests && Array.isArray(questData.activeQuests)) {
                console.log(`Loading ${questData.activeQuests.length} active quests`);
                questManager.activeQuests = questData.activeQuests.map(quest => {
                    try {
                        // Find the original quest template
                        const originalQuest = questManager.quests.find(q => q.id === quest.id);
                        if (originalQuest) {
                            // Create a new quest object with progress from saved data
                            return {
                                ...originalQuest,
                                objective: {
                                    ...originalQuest.objective,
                                    progress: quest.objective && quest.objective.progress ? quest.objective.progress : 0,
                                    discovered: quest.objective && quest.objective.discovered ? quest.objective.discovered : []
                                }
                            };
                        }
                        return quest;
                    } catch (questError) {
                        console.error('Error processing quest:', questError, quest);
                        return quest;
                    }
                });
            } else {
                console.warn('No active quests found or not an array');
            }
            
            try {
                // Load completed quests
                if (questData.completedQuests && Array.isArray(questData.completedQuests)) {
                    console.log(`Loading ${questData.completedQuests.length} completed quests`);
                    questManager.completedQuests = [...questData.completedQuests];
                } else {
                    console.warn('No completed quests found or not an array');
                }
                
                try {
                    // Filter available quests to remove active and completed ones
                    if (questManager.quests && Array.isArray(questManager.quests)) {
                        console.log('Filtering available quests');
                        questManager.quests = questManager.quests.filter(quest => {
                            const isActive = questManager.activeQuests.some(q => q.id === quest.id);
                            const isCompleted = questManager.completedQuests.some(q => q.id === quest.id);
                            return !isActive && !isCompleted;
                        });
                    } else {
                        console.warn('Quest manager quests is not an array');
                    }
                    
                    // Update UI if game is running and UI manager exists
                    if (this.game.isRunning && this.game.uiManager) {
                        console.log('Updating quest UI');
                        this.game.uiManager.updateQuestLog(questManager.activeQuests);
                    }
                    
                    console.log('Quest data loaded successfully');
                } catch (filterError) {
                    console.error('Error filtering quests:', filterError);
                    throw filterError;
                }
            } catch (completedError) {
                console.error('Error loading completed quests:', completedError);
                throw completedError;
            }
        } catch (questError) {
            console.error('Error loading quest data:', questError);
            throw questError;
        }
    }
    
    loadWorldData(worldData) {
        if (!worldData) {
            console.warn('World data is null or undefined');
            return;
        }
        
        console.log('Loading world data:', Object.keys(worldData));
        
        const world = this.game.world;
        if (!world) {
            console.error('World object is null or undefined');
            return;
        }
        
        try {
            // Mark discovered zones - check if zoneManager exists
            if (worldData.discoveredZones && Array.isArray(worldData.discoveredZones)) {
                console.log(`Loading ${worldData.discoveredZones.length} discovered zones`);
                
                if (world.zoneManager && world.zoneManager.zones) {
                    worldData.discoveredZones.forEach(zoneName => {
                        try {
                            const zone = world.zoneManager.zones.find(z => z.name === zoneName);
                            if (zone) {
                                zone.discovered = true;
                                console.log(`Marked zone as discovered: ${zoneName}`);
                            } else {
                                console.warn(`Zone not found: ${zoneName}`);
                            }
                        } catch (zoneError) {
                            console.warn(`Error processing zone ${zoneName}:`, zoneError);
                        }
                    });
                } else {
                    console.warn('Zone manager or zones array not found');
                }
            } else {
                console.warn('No discovered zones found or not an array');
            }
            
            // Restore interactive objects state - check if interactiveManager exists
            if (worldData.interactiveObjects && Array.isArray(worldData.interactiveObjects)) {
                console.log(`Loading ${worldData.interactiveObjects.length} interactive objects`);
                
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
                                console.log(`Restored interactive object state: ${obj.type}`);
                            } else {
                                console.warn(`Interactive object not found: ${savedObj.type} at position ${savedObj.position.x}, ${savedObj.position.z}`);
                            }
                        } catch (objError) {
                            console.warn(`Error processing interactive object:`, objError, savedObj);
                        }
                    });
                } else {
                    console.warn('Interactive manager or objects array not found');
                }
            } else {
                console.warn('No interactive objects found or not an array');
            }
            
            // Restore current chunk
            if (worldData.currentChunk) {
                console.log(`Setting current chunk to: ${worldData.currentChunk}`);
                if (world.terrainManager) {
                    world.terrainManager.currentChunk = worldData.currentChunk;
                } else {
                    world.currentChunk = worldData.currentChunk;
                }
            } else {
                console.warn('No current chunk found in save data');
            }
            
            // Clear existing terrain and environment objects if method exists
            if (world.clearWorldObjects) {
                console.log('Clearing existing world objects');
                world.clearWorldObjects();
            } else {
                console.warn('clearWorldObjects method not found on world object');
            }
            
            // Load chunk data from individual storage
            console.log('Loading chunk index');
            const chunkIndex = this.loadChunkIndex();
            
            if (chunkIndex) {
                console.log(`Found ${Object.keys(chunkIndex).length} saved chunks in index`);
                
                // Create a temporary storage for environment objects
                const savedEnvironmentObjects = {};
                
                // Create a temporary storage for terrain chunks
                const savedTerrainChunks = {};
                
                // Only load chunks near the player's current position
                const terrainChunkSize = world.terrainManager ? 
                    world.terrainManager.chunkSize : 
                    (world.terrainChunkSize || 100); // Default to 100 if not found
                
                console.log(`Using terrain chunk size: ${terrainChunkSize}`);
                
                let playerPos = this.game.player.getPosition ? 
                    this.game.player.getPosition() : 
                    this.game.player.position;
                
                if (!playerPos) {
                    console.warn('Player position not found, using default (0,0,0)');
                    playerPos = { x: 0, y: 0, z: 0 };
                }
                
                const playerChunkX = Math.floor(playerPos.x / terrainChunkSize);
                const playerChunkZ = Math.floor(playerPos.z / terrainChunkSize);
                const loadDistance = 2; // Only load chunks within 2 chunks of player
                
                console.log(`Player is at chunk (${playerChunkX}, ${playerChunkZ}), loading chunks within distance ${loadDistance}`);
                
                // Count how many chunks we're loading
                let loadedChunkCount = 0;
                
                // Process each chunk in the index
                for (const chunkKey in chunkIndex) {
                    try {
                        // Parse the chunk coordinates
                        const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
                        
                        // Check if this chunk is within load distance
                        const distanceX = Math.abs(chunkX - playerChunkX);
                        const distanceZ = Math.abs(chunkZ - playerChunkZ);
                        
                        if (distanceX <= loadDistance && distanceZ <= loadDistance) {
                            console.log(`Loading chunk ${chunkKey} (within range of player)`);
                            
                            // Load this chunk from storage
                            const chunkData = this.loadChunk(chunkKey);
                            
                            if (chunkData) {
                                // Store environment objects for this chunk
                                if (chunkData.environmentObjects && chunkData.environmentObjects.length > 0) {
                                    savedEnvironmentObjects[chunkKey] = chunkData.environmentObjects;
                                    console.log(`Loaded ${chunkData.environmentObjects.length} environment objects for chunk ${chunkKey}`);
                                } else {
                                    console.warn(`No environment objects found for chunk ${chunkKey}`);
                                }
                                
                                // Mark this chunk as existing
                                savedTerrainChunks[chunkKey] = true;
                                loadedChunkCount++;
                            } else {
                                console.warn(`Failed to load chunk data for ${chunkKey}`);
                            }
                        } else {
                            console.log(`Skipping chunk ${chunkKey} (out of range of player)`);
                        }
                    } catch (chunkError) {
                        console.warn(`Error processing chunk ${chunkKey}:`, chunkError);
                    }
                }
                
                console.log(`Loaded ${loadedChunkCount} chunks near player position`);
                
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
            } else if (worldData.environmentObjects && worldData.terrainChunks) {
                // Fall back to old format if no chunk index found
                console.log('No chunk index found, falling back to legacy format');
                if (world.environmentManager) {
                    world.environmentManager.savedObjects = worldData.environmentObjects;
                } else {
                    world.savedEnvironmentObjects = worldData.environmentObjects;
                }
                if (world.terrainManager) {
                    world.terrainManager.savedChunks = worldData.terrainChunks;
                } else {
                    world.savedTerrainChunks = worldData.terrainChunks;
                }
            }
        } catch (error) {
            console.error('Error loading world data:', error);
        }
        
        try {
            // Restore visible chunks
            if (worldData.visibleChunks && Array.isArray(worldData.visibleChunks)) {
                console.log(`Loading ${worldData.visibleChunks.length} visible chunks`);
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
            } else {
                console.warn('No visible chunks found or not an array');
            }
            
            // Restore visible terrain chunks
            if (worldData.visibleTerrainChunks && Array.isArray(worldData.visibleTerrainChunks)) {
                console.log(`Loading ${worldData.visibleTerrainChunks.length} visible terrain chunks`);
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
            } else {
                console.warn('No visible terrain chunks found or not an array');
            }
            
            console.log('World data loaded successfully');
            
            // Update the world based on player position to regenerate necessary chunks
            if (this.game.player) {
                const playerPos = this.game.player.getPosition ? 
                    this.game.player.getPosition() : 
                    this.game.player.position;
                
                if (playerPos && world.updateWorldForPlayer) {
                    console.log('Updating world for player position');
                    world.updateWorldForPlayer(playerPos);
                } else {
                    console.warn('Could not update world for player - missing position or method');
                }
            } else {
                console.warn('Player object not found, skipping world update');
            }
        } catch (error) {
            console.error('Error updating world after load:', error);
        }
    }
    
    loadGameSettings(settings) {
        if (!settings) return;
        
        try {
            // Load difficulty
            if (settings.difficulty !== undefined && this.game.difficultyManager) {
                this.game.difficultyManager.setDifficulty(settings.difficulty);
            }
            
            // Load audio settings
            if (settings.audioSettings && this.game.audioManager) {
                // Check if audioManager exists and is initialized
                if (settings.audioSettings.isMuted !== undefined) {
                    this.game.audioManager.isMuted = settings.audioSettings.isMuted;
                }
                
                if (settings.audioSettings.musicVolume !== undefined) {
                    try {
                        this.game.audioManager.setMusicVolume(settings.audioSettings.musicVolume);
                    } catch (audioError) {
                        console.warn('Error setting music volume:', audioError);
                        // Continue with other settings
                    }
                }
                
                if (settings.audioSettings.sfxVolume !== undefined) {
                    try {
                        this.game.audioManager.setSFXVolume(settings.audioSettings.sfxVolume);
                    } catch (audioError) {
                        console.warn('Error setting SFX volume:', audioError);
                        // Continue with other settings
                    }
                }
            } else if (settings.audioSettings) {
                console.warn('Audio manager not available, skipping audio settings');
            }
        } catch (error) {
            console.warn('Error applying game settings, continuing with defaults:', error);
            // Don't throw the error - allow the game to continue loading with default settings
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