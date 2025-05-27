import { DIFFICULTY_SETTINGS } from '../config/difficulty-settings.js';

export class DifficultyMenu {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.isVisible = false;
        this.selectedDifficulty = 'medium';
    }
    
    create() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'difficulty-menu';
        this.container.style.display = 'none';
        
        // Create header
        const header = document.createElement('h2');
        header.textContent = 'Select Difficulty';
        this.container.appendChild(header);
        
        // Create difficulty options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'difficulty-options';
        
        // Add each difficulty option
        for (const [key, settings] of Object.entries(DIFFICULTY_SETTINGS)) {
            const option = this.createDifficultyOption(key, settings);
            optionsContainer.appendChild(option);
        }
        
        this.container.appendChild(optionsContainer);
        
        // Create buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        // Apply button
        const applyButton = document.createElement('button');
        applyButton.textContent = 'Apply';
        applyButton.addEventListener('click', () => {
            this.applyDifficulty();
        });
        buttonContainer.appendChild(applyButton);
        
        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            this.hide();
        });
        buttonContainer.appendChild(cancelButton);
        
        this.container.appendChild(buttonContainer);
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    createDifficultyOption(key, settings) {
        const option = document.createElement('div');
        option.className = 'difficulty-option';
        option.dataset.difficulty = key;
        
        // Add selected class if this is the current difficulty
        if (key === this.selectedDifficulty) {
            option.classList.add('selected');
        }
        
        // Create name
        const name = document.createElement('h3');
        name.textContent = settings.name;
        option.appendChild(name);
        
        // Create description
        const description = document.createElement('p');
        description.textContent = settings.description;
        option.appendChild(description);
        
        // Create stats
        const stats = document.createElement('div');
        stats.className = 'difficulty-stats';
        
        // Add stat items
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Enemy Level:</span>
                <span class="stat-value">Player ${settings.levelOffset >= 0 ? '+' : ''}${settings.levelOffset}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Enemy Health:</span>
                <span class="stat-value">${settings.healthMultiplier * 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Enemy Damage:</span>
                <span class="stat-value">${settings.damageMultiplier * 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Experience:</span>
                <span class="stat-value">${settings.experienceMultiplier * 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Item Quality:</span>
                <span class="stat-value">${settings.itemQualityMultiplier * 100}%</span>
            </div>
        `;
        
        option.appendChild(stats);
        
        // Add click handler
        option.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.difficulty-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to this option
            option.classList.add('selected');
            
            // Update selected difficulty
            this.selectedDifficulty = key;
        });
        
        return option;
    }
    
    show() {
        if (!this.container) {
            this.create();
        }
        
        // Pause game
        if (this.game) {
            this.game.pause();
        }
        
        // Show menu
        this.container.style.display = 'flex';
        this.isVisible = true;
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        
        // Resume game
        if (this.game) {
            this.game.resume();
        }
        
        this.isVisible = false;
    }
    
    applyDifficulty() {
        // Apply selected difficulty
        if (this.game && this.game.enemyManager) {
            this.game.enemyManager.setDifficulty(this.selectedDifficulty);
            
            // Show notification
            if (this.game.hudManager) {
                const difficultyName = DIFFICULTY_SETTINGS[this.selectedDifficulty].name;
                this.game.hudManager.showNotification(`Difficulty changed to ${difficultyName}`);
            }
        }
        
        // Hide menu
        this.hide();
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
