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
        
        // Camera settings
        this.cameraZoomSlider = document.getElementById('camera-zoom-slider');
        this.cameraZoomValue = document.getElementById('camera-zoom-value');
        
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
        
        // Initialize camera zoom slider if it exists
        if (this.cameraZoomSlider) {
            // Set min, max and default values
            this.cameraZoomSlider.min = 10;  // Closest zoom (10 units)
            this.cameraZoomSlider.max = 30;  // Furthest zoom (30 units)
            this.cameraZoomSlider.step = 1;  // 1 unit increments
            
            // Get stored zoom value or use default
            const storedZoom = localStorage.getItem(STORAGE_KEYS.CAMERA_ZOOM);
            const defaultZoom = 25; // Default camera distance
            const currentZoom = storedZoom ? parseInt(storedZoom) : defaultZoom;
            
            // Set the slider to the current zoom value
            this.cameraZoomSlider.value = currentZoom;
            
            // Update the display value
            if (this.cameraZoomValue) {
                this.cameraZoomValue.textContent = currentZoom;
            }
            
            // Add event listener for zoom changes
            this.cameraZoomSlider.addEventListener('input', () => {
                const zoomValue = parseInt(this.cameraZoomSlider.value);
                
                // Update the display value
                if (this.cameraZoomValue) {
                    this.cameraZoomValue.textContent = zoomValue;
                }
                
                // Store the zoom value
                localStorage.setItem(STORAGE_KEYS.CAMERA_ZOOM, zoomValue);
                
                // Apply zoom immediately if game is available
                if (this.game && this.game.hudManager && this.game.hudManager.cameraControl) {
                    this.game.hudManager.cameraControl.cameraDistance = zoomValue;
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
        
        if (this.cameraZoomSlider) {
            localStorage.setItem(STORAGE_KEYS.CAMERA_ZOOM, this.cameraZoomSlider.value);
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
        
        if (this.cameraZoomSlider) {
            this.cameraZoomSlider.value = 20; // Default camera distance
            
            // Update the display value
            if (this.cameraZoomValue) {
                this.cameraZoomValue.textContent = 20;
            }
        }
        
        this.saveSettings();
    }
}