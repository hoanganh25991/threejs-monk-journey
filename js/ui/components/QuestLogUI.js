import { UIComponent } from '../UIComponent.js';

/**
 * Quest Log UI component
 * Displays active quests and objectives
 */
export class QuestLogUI extends UIComponent {
    /**
     * Create a new QuestLogUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('quest-log', game);
        this.questList = null;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Active Quests</div>
            <div id="quest-list"></div>
        `;
        
        // Render the template
        this.render(template);
        
        // Store references to elements we need to update
        this.questList = document.getElementById('quest-list');
        
        // Set styles for quest log
        this.container.style.position = 'absolute';
        this.container.style.top = '20px';
        this.container.style.right = '20px';
        this.container.style.width = '250px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.container.style.color = 'white';
        this.container.style.padding = '10px';
        this.container.style.borderRadius = '5px';
        this.container.style.zIndex = '100';
        
        return true;
    }
    
    /**
     * Update the quest log with active quests
     * @param {Array} activeQuests - Array of active quests
     */
    updateQuestLog(activeQuests) {
        // Clear quest list
        this.questList.innerHTML = '';
        
        if (activeQuests.length === 0) {
            // No active quests
            const noQuests = document.createElement('div');
            noQuests.style.fontStyle = 'italic';
            noQuests.textContent = 'No active quests';
            this.questList.appendChild(noQuests);
        } else {
            // Add active quests
            activeQuests.forEach(quest => {
                // Create quest item HTML
                const questHTML = `
                    <div style="margin-bottom: 10px;">
                        <div style="font-weight: bold; color: ${quest.isMainQuest ? '#ffcc00' : 'white'};">${quest.name}</div>
                        <div style="font-size: 14px;">${this.formatObjective(quest.objective)}</div>
                    </div>
                `;
                
                // Add to quest list
                this.questList.innerHTML += questHTML;
            });
        }
    }
    
    /**
     * Format quest objective based on type
     * @param {Object} objective - Quest objective
     * @returns {string} - Formatted objective text
     */
    formatObjective(objective) {
        switch (objective.type) {
            case 'kill':
                return `Kill ${objective.progress}/${objective.count} enemies`;
            case 'interact':
                return `Find ${objective.progress}/${objective.count} ${objective.target}s`;
            case 'explore':
                return `Discover ${objective.progress}/${objective.count} zones`;
            default:
                return objective.description || 'Complete the objective';
        }
    }
}