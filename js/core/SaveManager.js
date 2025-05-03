export class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveKey = 'diablo_immortal_save';
        this.autoSaveInterval = 60000; // Auto-save every minute
        this.autoSaveTimer = null;
    }
    
    init() {
        // Start auto-save timer
        this.startAutoSave();
        
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
    
    saveGame() {
        try {
            // Create save data object
            const saveData = {
                player: this.getPlayerData(),
                quests: this.getQuestData(),
                world: this.getWorldData(),
                settings: this.getGameSettings(),
                timestamp: Date.now(),
                version: '1.1.0'
            };
            
            // Convert to JSON string
            const saveString = JSON.stringify(saveData);
            
            // Save to local storage
            localStorage.setItem(this.saveKey, saveString);
            
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
            
            // Load world data
            if (saveData.world) {
                this.loadWorldData(saveData.world);
            }
            
            // Load game settings
            if (saveData.settings) {
                this.loadGameSettings(saveData.settings);
            }
            
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
    
    getWorldData() {
        // Save discovered zones, interactive objects state, etc.
        return {
            discoveredZones: this.game.world.zones.filter(zone => zone.discovered).map(zone => zone.name),
            interactiveObjects: this.game.world.interactiveObjects.map(obj => ({
                type: obj.type,
                position: {
                    x: obj.position.x,
                    y: obj.position.y,
                    z: obj.position.z
                },
                isOpen: obj.isOpen || false,
                isCompleted: obj.isCompleted || false
            }))
        };
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
        
        // Mark discovered zones
        if (worldData.discoveredZones && Array.isArray(worldData.discoveredZones)) {
            worldData.discoveredZones.forEach(zoneName => {
                const zone = this.game.world.zones.find(z => z.name === zoneName);
                if (zone) {
                    zone.discovered = true;
                }
            });
        }
        
        // Restore interactive objects state
        if (worldData.interactiveObjects && Array.isArray(worldData.interactiveObjects)) {
            worldData.interactiveObjects.forEach(savedObj => {
                const obj = this.game.world.interactiveObjects.find(o => 
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
            // Remove save data from local storage
            localStorage.removeItem(this.saveKey);
            console.log('Save data deleted successfully');
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