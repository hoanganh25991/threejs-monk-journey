export class QuestManager {
    constructor(game) {
        this.game = game;
        this.quests = [];
        this.activeQuests = [];
        this.completedQuests = [];
        
        // Initialize with some default quests
        this.initializeQuests();
    }
    
    initializeQuests() {
        // Add some default quests
        this.quests = [
            {
                id: 'main_quest_1',
                name: 'The Beginning of the Journey',
                description: 'Defeat the enemies in the forest to prove your worth.',
                objective: {
                    type: 'kill',
                    target: 'any',
                    count: 5,
                    progress: 0
                },
                reward: {
                    experience: 100,
                    gold: 50,
                    items: [
                        { name: 'Health Potion', amount: 2 }
                    ]
                },
                isMainQuest: true
            },
            {
                id: 'side_quest_1',
                name: 'Treasure Hunter',
                description: 'Find and open treasure chests scattered around the world.',
                objective: {
                    type: 'interact',
                    target: 'chest',
                    count: 3,
                    progress: 0
                },
                reward: {
                    experience: 50,
                    gold: 100
                },
                isMainQuest: false
            },
            {
                id: 'side_quest_2',
                name: 'Explorer',
                description: 'Discover all zones in the world.',
                objective: {
                    type: 'explore',
                    target: 'zone',
                    count: 4,
                    progress: 0,
                    discovered: []
                },
                reward: {
                    experience: 150,
                    gold: 75,
                    items: [
                        { name: 'Map Fragment', amount: 1 }
                    ]
                },
                isMainQuest: false
            }
        ];
    }
    
    startQuest(quest) {
        // Find the quest in the available quests
        const questToStart = this.quests.find(q => q.name === quest.name);
        
        if (questToStart) {
            // Check if quest is already active
            if (!this.activeQuests.some(q => q.id === questToStart.id)) {
                // Add to active quests
                this.activeQuests.push(questToStart);
                
                // Remove from available quests
                this.quests = this.quests.filter(q => q.id !== questToStart.id);
                
                // Notify UI
                this.game.uiManager.updateQuestLog(this.activeQuests);
                
                return true;
            }
        }
        
        return false;
    }
    
    updateEnemyKill(enemy) {
        // Update kill objectives for active quests
        this.activeQuests.forEach(quest => {
            if (quest.objective.type === 'kill') {
                // Check if this enemy type matches the quest target
                if (quest.objective.target === 'any' || quest.objective.target === enemy.type) {
                    quest.objective.progress++;
                    
                    // Check if objective is complete
                    if (quest.objective.progress >= quest.objective.count) {
                        this.completeQuest(quest);
                    } else {
                        // Update UI
                        this.game.uiManager.updateQuestLog(this.activeQuests);
                        this.game.uiManager.showNotification(`Quest progress: ${quest.objective.progress}/${quest.objective.count} enemies defeated`);
                    }
                }
            }
        });
    }
    
    updateInteraction(objectType) {
        // Update interaction objectives for active quests
        this.activeQuests.forEach(quest => {
            if (quest.objective.type === 'interact' && quest.objective.target === objectType) {
                quest.objective.progress++;
                
                // Check if objective is complete
                if (quest.objective.progress >= quest.objective.count) {
                    this.completeQuest(quest);
                } else {
                    // Update UI
                    this.game.uiManager.updateQuestLog(this.activeQuests);
                    this.game.uiManager.showNotification(`Quest progress: ${quest.objective.progress}/${quest.objective.count} ${objectType}s found`);
                }
            }
        });
    }
    
    updateExploration(zoneName) {
        // Update exploration objectives for active quests
        this.activeQuests.forEach(quest => {
            if (quest.objective.type === 'explore' && quest.objective.target === 'zone') {
                // Check if this zone has already been discovered for this quest
                if (!quest.objective.discovered.includes(zoneName)) {
                    quest.objective.discovered.push(zoneName);
                    quest.objective.progress++;
                    
                    // Check if objective is complete
                    if (quest.objective.progress >= quest.objective.count) {
                        this.completeQuest(quest);
                    } else {
                        // Update UI
                        this.game.uiManager.updateQuestLog(this.activeQuests);
                        this.game.uiManager.showNotification(`Zone discovered: ${zoneName}`);
                    }
                }
            }
        });
    }
    
    completeQuest(quest) {
        // Remove from active quests
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        
        // Add to completed quests
        this.completedQuests.push(quest);
        
        // Award rewards
        this.awardQuestRewards(quest);
        
        // Play quest complete sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('questComplete');
        }
        
        // Update UI
        this.game.uiManager.updateQuestLog(this.activeQuests);
        this.game.uiManager.showDialog(
            `Quest Completed: ${quest.name}`,
            `You have completed the quest and received your rewards!`
        );
    }
    
    awardQuestRewards(quest) {
        // Award experience
        if (quest.reward.experience) {
            this.game.player.addExperience(quest.reward.experience);
            this.game.uiManager.showNotification(`Gained ${quest.reward.experience} experience`);
        }
        
        // Award gold
        if (quest.reward.gold) {
            this.game.player.addGold(quest.reward.gold);
            this.game.uiManager.showNotification(`Gained ${quest.reward.gold} gold`);
        }
        
        // Award items
        if (quest.reward.items) {
            quest.reward.items.forEach(item => {
                this.game.player.addToInventory(item);
                this.game.uiManager.showNotification(`Received ${item.name} x${item.amount}`);
            });
        }
    }
    
    getActiveQuests() {
        return this.activeQuests;
    }
    
    getCompletedQuests() {
        return this.completedQuests;
    }
    
    getAvailableQuests() {
        return this.quests;
    }
}