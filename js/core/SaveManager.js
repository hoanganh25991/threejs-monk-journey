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
                timestamp: Date.now(),
                version: '1.0.0'
            };
            
            // Convert to JSON string
            const saveString = JSON.stringify(saveData);
            
            // Save to local storage
            localStorage.setItem(this.saveKey, saveString);
            
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
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
            if (saveData.version !== '1.0.0') {
                console.warn('Save data version mismatch, some data may not load correctly');
            }
            
            // Load player data
            this.loadPlayerData(saveData.player);
            
            // Load quest data
            this.loadQuestData(saveData.quests);
            
            console.log('Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading game:', error);
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
            experience: player.stats.experience
        };
    }
    
    getQuestData() {
        const questManager = this.game.questManager;
        
        return {
            activeQuests: [...questManager.activeQuests],
            completedQuests: [...questManager.completedQuests],
            availableQuests: [...questManager.quests]
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
    }
    
    loadQuestData(questData) {
        const questManager = this.game.questManager;
        
        // Load quests
        questManager.activeQuests = [...questData.activeQuests];
        questManager.completedQuests = [...questData.completedQuests];
        questManager.quests = [...questData.availableQuests];
        
        // Update UI
        this.game.uiManager.updateQuestLog(questManager.activeQuests);
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