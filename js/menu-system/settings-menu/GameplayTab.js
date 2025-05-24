/**
 * GameplayTab.js
 * Manages the gameplay settings tab UI component
 */

import { SettingsTab } from './SettingsTab.js';
import { STORAGE_KEYS } from '../../config/storage-keys.js';

export class GameplayTab extends SettingsTab {
    /**
     * Create a gameplay settings tab
     * @param {import('../../game/Game.js').Game} game - The game instance
     * @param {SettingsMenu} settingsMenu - The parent settings menu
     */
    constructor(game, settingsMenu) {
        super('game', game, settingsMenu);
        
        // Game settings elements
        this.difficultySelect = document.getElementById('difficulty-select');
        this.customSkillsCheckbox = document.getElementById('custom-skills-checkbox');
        
        this.init();
    }
    
    /**
     * Initialize the gameplay settings
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        if (this.difficultySelect) {
            // Clear existing options
            while (this.difficultySelect.options.length > 0) {
                this.difficultySelect.remove(0);
            }
            
            // Add difficulty options
            const difficultyLevels = ['easy', 'normal', 'hard', 'nightmare'];
            difficultyLevels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
                this.difficultySelect.appendChild(option);
            });
            
            // Set current difficulty
            const currentDifficulty = localStorage.getItem(STORAGE_KEYS.DIFFICULTY) || 'normal';
            this.difficultySelect.value = currentDifficulty;
            
            // Add change event listener
            this.difficultySelect.addEventListener('change', () => {
                localStorage.setItem(STORAGE_KEYS.DIFFICULTY, this.difficultySelect.value);
                
                // Apply difficulty settings immediately if game is available
                if (this.game) {
                    this.game.difficulty = this.difficultySelect.value;
                }
            });
        }
        
        if (this.customSkillsCheckbox) {
            // Set current custom skills state (default is false)
            const customSkillsEnabled = localStorage.getItem(STORAGE_KEYS.CUSTOM_SKILLS) === 'true';
            this.customSkillsCheckbox.checked = customSkillsEnabled;
            
            // Add change event listener
            this.customSkillsCheckbox.addEventListener('change', () => {
                localStorage.setItem(STORAGE_KEYS.CUSTOM_SKILLS, this.customSkillsCheckbox.checked);
                
                // Apply custom skills settings immediately if game is available
                if (this.game && this.game.player && this.game.player.skills) {
                    this.game.player.skills.updateCustomSkillsVisibility();
                }
            });
        }
        
        return true;
    }
    
    /**
     * Save the gameplay settings
     */
    saveSettings() {
        if (this.difficultySelect) {
            localStorage.setItem(STORAGE_KEYS.DIFFICULTY, this.difficultySelect.value);
        }
        
        if (this.customSkillsCheckbox) {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_SKILLS, this.customSkillsCheckbox.checked);
        }
    }
    
    /**
     * Reset the gameplay settings to defaults
     */
    resetToDefaults() {
        if (this.difficultySelect) {
            this.difficultySelect.value = 'normal';
        }
        
        if (this.customSkillsCheckbox) {
            this.customSkillsCheckbox.checked = false;
        }
        
        this.saveSettings();
    }
}