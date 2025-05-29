/**
 * Handles serialization and deserialization of quest data
 */
export class QuestSerializer {
    /**
     * Serialize quest data for saving
     * @param {Object} questManager - The quest manager object
     * @returns {Object} Serialized quest data
     */
    static serialize(questManager) {
        if (!questManager) {
            console.warn('Quest manager is null or undefined');
            return {};
        }
        
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
            completedQuests: [...questManager.completedQuests]
            // Removed availableQuests to reduce save size
        };
    }
    
    /**
     * Deserialize quest data from save
     * @param {Object} questManager - The quest manager to update
     * @param {Object} questData - The saved quest data
     */
    static deserialize(questManager, questData) {
        if (!questManager || !questData) {
            console.error('Quest manager or quest data is null or undefined');
            return;
        }
        
        console.debug('Loading quest data:', Object.keys(questData));
        
        // Reset quest state
        questManager.activeQuests = [];
        questManager.completedQuests = [];
        
        // Load active quests with their progress
        if (questData.activeQuests && Array.isArray(questData.activeQuests)) {
            console.debug(`Loading ${questData.activeQuests.length} active quests`);
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
        }
        
        // Load completed quests
        if (questData.completedQuests && Array.isArray(questData.completedQuests)) {
            console.debug(`Loading ${questData.completedQuests.length} completed quests`);
            questManager.completedQuests = [...questData.completedQuests];
        }
        
        // Filter available quests to remove active and completed ones
        if (questManager.quests && Array.isArray(questManager.quests)) {
            console.debug('Filtering available quests');
            questManager.quests = questManager.quests.filter(quest => {
                const isActive = questManager.activeQuests.some(q => q.id === quest.id);
                const isCompleted = questManager.completedQuests.some(q => q.id === quest.id);
                return !isActive && !isCompleted;
            });
        }
        
        console.debug('Quest data loaded successfully');
    }
}