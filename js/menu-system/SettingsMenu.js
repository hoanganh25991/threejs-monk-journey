/**
 * SettingsMenu.js
 * Manages the settings menu UI component
 */

import { ModelPreview } from './ModelPreview.js';
import { SkillPreview } from './SkillPreview.js';
import { EnemyPreview } from './EnemyPreview.js';
import { ControlsDisplay } from './ControlsDisplay.js';
import { CHARACTER_MODELS } from '../config/player-models.js';
import { UIComponent } from '../UIComponent.js';
import { SKILLS } from '../config/skills.js';
import { ENEMY_TYPES, BOSS_TYPES } from '../config/enemies.js';
import { STORAGE_KEYS } from '../config/storage-keys.js';

export class SettingsMenu extends UIComponent {
    /**
     * Create a settings menu
     * @param {Game} game - The game instance
     */
    constructor(game) {
        super('main-options-menu', game);
        
        // Performance settings elements
        this.qualitySelect = document.getElementById('quality-select');
        this.adaptiveCheckbox = document.getElementById('adaptive-checkbox');
        this.fpsSlider = document.getElementById('fps-slider');
        this.fpsValue = document.getElementById('fps-value');
        this.showPerformanceInfoCheckbox = document.getElementById('show-performance-info-checkbox');
        
        // Game settings elements
        this.difficultySelect = document.getElementById('difficulty-select');
        
        // Character model settings elements
        this.modelPreviewContainer = document.getElementById('model-preview-container');
        this.modelSelect = document.getElementById('model-select');
        this.prevModelButton = document.getElementById('prev-model-button');
        this.nextModelButton = document.getElementById('next-model-button');
        this.sizeSelect = document.getElementById('size-select');
        this.prevSizeButton = document.getElementById('prev-size-button');
        this.nextSizeButton = document.getElementById('next-size-button');
        this.animationSelect = document.getElementById('animation-select');
        this.prevAnimButton = document.getElementById('prev-anim-button');
        this.nextAnimButton = document.getElementById('next-anim-button');
        
        // Fullscreen model preview elements
        this.modelPreviewFullscreenContainer = document.getElementById('model-preview-fullscreen-container');
        this.modelPreviewSelect = document.getElementById('model-preview-select');
        this.prevModelPreviewButton = document.getElementById('prev-model-preview-button');
        this.nextModelPreviewButton = document.getElementById('next-model-preview-button');
        this.animationPreviewSelect = document.getElementById('animation-preview-select');
        this.prevAnimPreviewButton = document.getElementById('prev-anim-preview-button');
        this.nextAnimPreviewButton = document.getElementById('next-anim-preview-button');
        this.resetCameraButton = document.getElementById('reset-camera-button');
        // Auto-rotate checkbox and rotation speed slider references have been removed
        
        // Audio settings elements
        this.muteCheckbox = document.getElementById('mute-checkbox');
        this.musicVolumeSlider = document.getElementById('music-volume-slider');
        this.musicVolumeValue = document.getElementById('music-volume-value');
        this.sfxVolumeSlider = document.getElementById('sfx-volume-slider');
        this.sfxVolumeValue = document.getElementById('sfx-volume-value');
        this.testSoundButton = document.getElementById('test-sound-button');
        this.audioDisabledMessage = document.getElementById('audio-disabled-message');
        this.simulatedAudioNote = document.getElementById('simulated-audio-note');
        
        // Release settings elements
        this.updateToLatestButton = document.getElementById('update-to-latest-button');
        this.currentVersionSpan = document.getElementById('current-version');
        
        // Footer buttons
        this.backButton = document.getElementById('settings-back-button');
        this.saveButton = document.getElementById('settings-save-button');
        
        // Skills preview elements
        this.skillsPreviewContainer = document.getElementById('skills-preview-container');
        this.skillsPreviewSelect = document.getElementById('skills-preview-select');
        this.prevSkillButton = document.getElementById('prev-skill-button');
        this.nextSkillButton = document.getElementById('next-skill-button');
        this.skillDetailsContainer = document.getElementById('skill-details');
        
        // Enemy preview elements
        this.enemyPreviewContainer = document.getElementById('enemy-preview-container');
        this.enemyPreviewSelect = document.getElementById('enemy-preview-select');
        this.prevEnemyButton = document.getElementById('prev-enemy-button');
        this.nextEnemyButton = document.getElementById('next-enemy-button');
        this.enemyAnimationSelect = document.getElementById('enemy-animation-select');
        this.prevEnemyAnimButton = document.getElementById('prev-enemy-anim-button');
        this.nextEnemyAnimButton = document.getElementById('next-enemy-anim-button');
        this.enemyDetailsContainer = document.getElementById('enemy-details');
        this.resetEnemyCameraButton = document.getElementById('reset-enemy-camera-button');
        
        this.skillPreview = null;
        this.currentSkill = null;
        this.currentSkillEffect = null;
        
        this.enemyPreview = null;
        this.currentEnemy = null;
        
        this.modelPreview = null;
        this.modelPreviewFullscreen = null;
        this.fromInGame = false;
        this.mainMenu = null;
        
        this.init();
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        this.initializeSettings();
        this.initializeTabs();
        this.initializeEnemyPreview();
        return true;
    }
    
    /**
     * Fetch the current cache version from the service worker
     * @returns {Promise<string>} - Promise that resolves to the cache version
     */
    async fetchCacheVersion() {
        try {
            // Fetch the service worker file
            const response = await fetch('service-worker.js');
            if (!response.ok) {
                throw new Error(`Failed to fetch service worker: ${response.status}`);
            }
            
            // Get the text content
            const text = await response.text();
            
            // Extract the cache version using regex
            const versionMatch = text.match(/const CACHE_VERSION = ['"](\d+)['"]/);
            if (versionMatch && versionMatch[1]) {
                return versionMatch[1];
            } else {
                throw new Error('Could not find CACHE_VERSION in service-worker.js');
            }
        } catch (error) {
            console.error('Error fetching cache version:', error);
            return 'Unknown';
        }
    }
    
    /**
     * Initialize tab functionality
     * @private
     */
    initializeTabs() {
        // Get all tab buttons and content (including icon tabs)
        const tabButtons = document.querySelectorAll('.tab-button, .tab-icon');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Add click event to each tab button
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get the tab id from the button id
                const tabId = button.id.replace('tab-', '');
                
                // Show the corresponding tab content
                const tabContent = document.getElementById(`${tabId}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                    
                    // Handle model preview resizing based on tab
                    if (tabId === 'model-preview' && this.modelPreviewFullscreen) {
                        // Use setTimeout to ensure the tab is visible before resizing
                        setTimeout(() => {
                            this.resizeModelPreviewFullscreen();
                        }, 50);
                    }
                    
                    // Handle skills preview resizing based on tab
                    if (tabId === 'skills-preview' && this.skillPreview) {
                        // Use setTimeout to ensure the tab is visible before resizing
                        setTimeout(() => {
                            this.resizeSkillsPreview();
                            
                            // Force restart the animation when the skills preview tab is clicked
                            this.skillPreview.forceRestartAnimation();
                            
                            // Also play the current skill effect
                            this.playCurrentSkillEffect();
                        }, 50);
                    }
                    
                    // Handle enemy preview resizing based on tab
                    if (tabId === 'enemy-preview' && this.enemyPreview) {
                        // Use setTimeout to ensure the tab is visible before resizing
                        setTimeout(() => {
                            this.resizeEnemyPreview();
                            
                            // Force restart the animation when the enemy preview tab is clicked
                            this.enemyPreview.forceRestartAnimation();
                        }, 50);
                    }
                }
            });
        });
    }
    
    // Model preview resize method removed
    
    /**
     * Resize the fullscreen model preview to fit the container
     * @private
     */
    resizeModelPreviewFullscreen() {
        if (!this.modelPreviewFullscreen) return;
        
        const container = document.querySelector('.model-preview-fullscreen-section');
        if (!container) return;
        
        // Get the container dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update the model preview size
        this.modelPreviewFullscreen.setSize(width, height);
    }
    
    /**
     * Resize the skills preview to fit the container
     * @private
     */
    resizeSkillsPreview() {
        if (!this.skillPreview) return;
        
        const container = document.querySelector('.skills-preview-section');
        if (!container) return;
        
        // Get the container dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update the skills preview size
        this.skillPreview.setSize(width, height);
    }
    
    /**
     * Resize the enemy preview to fit the container
     * @private
     */
    resizeEnemyPreview() {
        if (!this.enemyPreview) return;
        
        const container = document.querySelector('.enemy-preview-section');
        if (!container) return;
        
        // Get the container dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update the enemy preview size
        this.enemyPreview.setSize(width, height);
    }
    
    /**
     * Initialize skills preview
     * @private
     */
    initializeSkillsPreview() {
        // Initialize skills select dropdown
        this.initializeSkillsOptions();
        
        // Set up navigation buttons for skills preview
        this.setupSkillsNavigationButtons();
        
        // Initialize the skills preview container
        this.initializeSkillsPreviewContainer();
    }
    
    /**
     * Initialize enemy preview
     * @private
     */
    initializeEnemyPreview() {
        // Initialize enemy select dropdown
        this.initializeEnemyOptions();
        
        // Set up navigation buttons for enemy preview
        this.setupEnemyNavigationButtons();
        
        // Initialize the enemy preview container
        this.initializeEnemyPreviewContainer();
        
        // Initialize enemy animation options
        this.initializeEnemyAnimationOptions();
    }
    
    /**
     * Initialize skills options in the select element
     * @private
     */
    initializeSkillsOptions() {
        if (!this.skillsPreviewSelect) return;
        
        // Clear existing options
        while (this.skillsPreviewSelect.options.length > 0) {
            this.skillsPreviewSelect.remove(0);
        }
        
        // Add skill options
        SKILLS.forEach((skill, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = skill.name;
            option.title = skill.description;
            this.skillsPreviewSelect.appendChild(option);
        });
        
        // Get the stored selected skill index or default to 0
        let selectedSkillIndex = 0;
        const storedSkillIndex = localStorage.getItem(STORAGE_KEYS.SELECTED_SKILL_PREVIEW);
        
        if (storedSkillIndex !== null && !isNaN(parseInt(storedSkillIndex)) && 
            parseInt(storedSkillIndex) >= 0 && parseInt(storedSkillIndex) < SKILLS.length) {
            selectedSkillIndex = parseInt(storedSkillIndex);
        }
        
        // Set the selected skill
        if (SKILLS.length > 0) {
            this.skillsPreviewSelect.selectedIndex = selectedSkillIndex;
            this.updateSkillDetails(selectedSkillIndex);
        }
        
        // Add change event
        this.skillsPreviewSelect.addEventListener('change', () => {
            const skillIndex = parseInt(this.skillsPreviewSelect.value);
            this.updateSkillDetails(skillIndex);
            
            // Save the selected skill index to localStorage
            localStorage.setItem(STORAGE_KEYS.SELECTED_SKILL_PREVIEW, skillIndex);
        });
    }
    
    /**
     * Set up navigation buttons for skills preview
     * @private
     */
    setupSkillsNavigationButtons() {
        // Add event listeners for prev/next skill buttons
        if (this.prevSkillButton && this.skillsPreviewSelect) {
            this.prevSkillButton.addEventListener('click', () => {
                const currentIndex = this.skillsPreviewSelect.selectedIndex;
                const newIndex = (currentIndex > 0) ? currentIndex - 1 : SKILLS.length - 1;
                this.skillsPreviewSelect.selectedIndex = newIndex;
                this.updateSkillDetails(newIndex);
                
                // Save the selected skill index to localStorage
                localStorage.setItem(STORAGE_KEYS.SELECTED_SKILL_PREVIEW, newIndex);
            });
        }
        
        if (this.nextSkillButton && this.skillsPreviewSelect) {
            this.nextSkillButton.addEventListener('click', () => {
                const currentIndex = this.skillsPreviewSelect.selectedIndex;
                const newIndex = (currentIndex < SKILLS.length - 1) ? currentIndex + 1 : 0;
                this.skillsPreviewSelect.selectedIndex = newIndex;
                this.updateSkillDetails(newIndex);
                
                // Save the selected skill index to localStorage
                localStorage.setItem(STORAGE_KEYS.SELECTED_SKILL_PREVIEW, newIndex);
            });
        }
    }
    
    /**
     * Initialize the skills preview container
     * @private
     */
    initializeSkillsPreviewContainer() {
        // Get the skills preview container
        const container = document.getElementById('skills-preview-container');
        if (!container) return;
        
        // Create a new SkillPreview instance
        this.skillPreview = new SkillPreview(container);
        
        // Set initial size
        const previewSection = document.querySelector('.skills-preview-section');
        if (previewSection) {
            const width = previewSection.clientWidth;
            const height = previewSection.clientHeight;
            this.skillPreview.setSize(width, height);
        }
    }
    
    /**
     * Initialize enemy options in the select element
     * @private
     */
    initializeEnemyOptions() {
        if (!this.enemyPreviewSelect) return;
        
        // Clear existing options
        while (this.enemyPreviewSelect.options.length > 0) {
            this.enemyPreviewSelect.remove(0);
        }
        
        // Combine regular enemies and bosses
        const allEnemies = [...ENEMY_TYPES, ...BOSS_TYPES];
        
        // Add enemy options
        allEnemies.forEach((enemy, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = enemy.name;
            option.title = `${enemy.name} - ${enemy.type}`;
            this.enemyPreviewSelect.appendChild(option);
        });
        
        // Get the stored selected enemy index or default to 0
        let selectedEnemyIndex = 0;
        const storedEnemyIndex = localStorage.getItem(STORAGE_KEYS.SELECTED_ENEMY_PREVIEW);
        
        if (storedEnemyIndex !== null && !isNaN(parseInt(storedEnemyIndex)) && 
            parseInt(storedEnemyIndex) >= 0 && parseInt(storedEnemyIndex) < allEnemies.length) {
            selectedEnemyIndex = parseInt(storedEnemyIndex);
        }
        
        // Set the selected enemy
        if (allEnemies.length > 0) {
            this.enemyPreviewSelect.selectedIndex = selectedEnemyIndex;
            this.updateEnemyDetails(selectedEnemyIndex);
        }
        
        // Add change event
        this.enemyPreviewSelect.addEventListener('change', () => {
            const enemyIndex = parseInt(this.enemyPreviewSelect.value);
            this.updateEnemyDetails(enemyIndex);
            
            // Save the selected enemy index to localStorage
            localStorage.setItem(STORAGE_KEYS.SELECTED_ENEMY_PREVIEW, enemyIndex);
            
            // Load the enemy model
            if (this.enemyPreview) {
                const allEnemies = [...ENEMY_TYPES, ...BOSS_TYPES];
                this.enemyPreview.loadEnemyModel(allEnemies[enemyIndex]);
            }
        });
    }
    
    /**
     * Set up navigation buttons for enemy preview
     * @private
     */
    setupEnemyNavigationButtons() {
        const allEnemies = [...ENEMY_TYPES, ...BOSS_TYPES];
        
        // Add event listeners for prev/next enemy buttons
        if (this.prevEnemyButton && this.enemyPreviewSelect) {
            this.prevEnemyButton.addEventListener('click', () => {
                const currentIndex = this.enemyPreviewSelect.selectedIndex;
                const newIndex = (currentIndex > 0) ? currentIndex - 1 : allEnemies.length - 1;
                this.enemyPreviewSelect.selectedIndex = newIndex;
                this.updateEnemyDetails(newIndex);
                
                // Save the selected enemy index to localStorage
                localStorage.setItem(STORAGE_KEYS.SELECTED_ENEMY_PREVIEW, newIndex);
                
                // Load the enemy model
                if (this.enemyPreview) {
                    this.enemyPreview.loadEnemyModel(allEnemies[newIndex]);
                }
            });
        }
        
        if (this.nextEnemyButton && this.enemyPreviewSelect) {
            this.nextEnemyButton.addEventListener('click', () => {
                const currentIndex = this.enemyPreviewSelect.selectedIndex;
                const newIndex = (currentIndex < allEnemies.length - 1) ? currentIndex + 1 : 0;
                this.enemyPreviewSelect.selectedIndex = newIndex;
                this.updateEnemyDetails(newIndex);
                
                // Save the selected enemy index to localStorage
                localStorage.setItem(STORAGE_KEYS.SELECTED_ENEMY_PREVIEW, newIndex);
                
                // Load the enemy model
                if (this.enemyPreview) {
                    this.enemyPreview.loadEnemyModel(allEnemies[newIndex]);
                }
            });
        }
    }
    
    /**
     * Initialize the enemy preview container
     * @private
     */
    initializeEnemyPreviewContainer() {
        // Get the enemy preview container
        const container = document.getElementById('enemy-preview-container');
        if (!container) return;
        
        // Create a new EnemyPreview instance
        this.enemyPreview = new EnemyPreview(container);
        
        // Initialize the preview
        this.enemyPreview.init();
        
        // Set initial size
        const previewSection = document.querySelector('.enemy-preview-section');
        if (previewSection) {
            const width = previewSection.clientWidth;
            const height = previewSection.clientHeight;
            this.enemyPreview.setSize(width, height);
        }
        
        // Add reset camera button functionality
        if (this.resetEnemyCameraButton) {
            this.resetEnemyCameraButton.addEventListener('click', () => {
                if (this.enemyPreview) {
                    this.enemyPreview.resetCamera();
                }
            });
        }
        
        // Load the initial enemy
        const allEnemies = [...ENEMY_TYPES, ...BOSS_TYPES];
        const selectedEnemyIndex = this.enemyPreviewSelect ? this.enemyPreviewSelect.selectedIndex : 0;
        if (allEnemies.length > 0 && selectedEnemyIndex >= 0 && selectedEnemyIndex < allEnemies.length) {
            this.enemyPreview.loadEnemyModel(allEnemies[selectedEnemyIndex]);
        }
    }
    
    /**
     * Initialize enemy animation options
     * @private
     */
    initializeEnemyAnimationOptions() {
        if (!this.enemyAnimationSelect) return;
        
        // Clear existing options
        while (this.enemyAnimationSelect.options.length > 0) {
            this.enemyAnimationSelect.remove(0);
        }
        
        // Add default animations
        const defaultAnimations = ['idle', 'walk', 'attack', 'hit', 'death'];
        defaultAnimations.forEach((animation, index) => {
            const option = document.createElement('option');
            option.value = animation;
            option.textContent = animation.charAt(0).toUpperCase() + animation.slice(1);
            this.enemyAnimationSelect.appendChild(option);
        });
        
        // Add change event
        this.enemyAnimationSelect.addEventListener('change', () => {
            const animationName = this.enemyAnimationSelect.value;
            if (this.enemyPreview) {
                this.enemyPreview.playAnimation(animationName);
            }
        });
        
        // Add event listeners for prev/next animation buttons
        if (this.prevEnemyAnimButton && this.enemyAnimationSelect) {
            this.prevEnemyAnimButton.addEventListener('click', () => {
                const currentIndex = this.enemyAnimationSelect.selectedIndex;
                const newIndex = (currentIndex > 0) ? currentIndex - 1 : this.enemyAnimationSelect.options.length - 1;
                this.enemyAnimationSelect.selectedIndex = newIndex;
                
                // Play the selected animation
                const animationName = this.enemyAnimationSelect.value;
                if (this.enemyPreview) {
                    this.enemyPreview.playAnimation(animationName);
                }
            });
        }
        
        if (this.nextEnemyAnimButton && this.enemyAnimationSelect) {
            this.nextEnemyAnimButton.addEventListener('click', () => {
                const currentIndex = this.enemyAnimationSelect.selectedIndex;
                const newIndex = (currentIndex < this.enemyAnimationSelect.options.length - 1) ? currentIndex + 1 : 0;
                this.enemyAnimationSelect.selectedIndex = newIndex;
                
                // Play the selected animation
                const animationName = this.enemyAnimationSelect.value;
                if (this.enemyPreview) {
                    this.enemyPreview.playAnimation(animationName);
                }
            });
        }
    }
    
    /**
     * Update enemy details based on the selected enemy
     * @param {number} enemyIndex - The index of the selected enemy
     * @private
     */
    updateEnemyDetails(enemyIndex) {
        if (!this.enemyDetailsContainer) return;
        
        // Get the selected enemy
        const allEnemies = [...ENEMY_TYPES, ...BOSS_TYPES];
        const enemy = allEnemies[enemyIndex];
        if (!enemy) return;
        
        // Store the current enemy
        this.currentEnemy = enemy;
        
        // Clear existing content
        this.enemyDetailsContainer.innerHTML = '';
        
        // Create enemy details HTML
        const detailsHTML = `
            <div class="enemy-detail"><span class="enemy-detail-label">Name:</span> <span class="enemy-detail-value">${enemy.name}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Type:</span> <span class="enemy-detail-value">${enemy.type}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Health:</span> <span class="enemy-detail-value">${enemy.health}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Damage:</span> <span class="enemy-detail-value">${enemy.damage}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Speed:</span> <span class="enemy-detail-value">${enemy.speed}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Attack Range:</span> <span class="enemy-detail-value">${enemy.attackRange}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Attack Speed:</span> <span class="enemy-detail-value">${enemy.attackSpeed}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">XP Value:</span> <span class="enemy-detail-value">${enemy.experienceValue}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Behavior:</span> <span class="enemy-detail-value">${enemy.behavior}</span></div>
            <div class="enemy-detail"><span class="enemy-detail-label">Zone:</span> <span class="enemy-detail-value">${enemy.zone}</span></div>
        `;
        
        // Add abilities if available
        if (enemy.abilities && enemy.abilities.length > 0) {
            const abilitiesHTML = `
                <div class="enemy-detail"><span class="enemy-detail-label">Abilities:</span> <span class="enemy-detail-value">${enemy.abilities.join(', ')}</span></div>
            `;
            this.enemyDetailsContainer.innerHTML = detailsHTML + abilitiesHTML;
        } else {
            this.enemyDetailsContainer.innerHTML = detailsHTML;
        }
    }
    
    /**
     * Update skill details based on the selected skill
     * @param {number} skillIndex - The index of the selected skill
     * @private
     */
    updateSkillDetails(skillIndex) {
        if (!this.skillDetailsContainer) return;
        
        // Get the selected skill
        const skill = SKILLS[skillIndex];
        if (!skill) return;
        
        // Store the current skill
        this.currentSkill = skill;
        
        // Automatically play the skill effect when a skill is selected
        if (this.skillPreview) {
            this.playCurrentSkillEffect();
        }
        
        // Clear existing content
        this.skillDetailsContainer.innerHTML = '';
        
        // Create skill details HTML
        const detailsHTML = `
            <div class="skill-detail"><span class="detail-label">Name:</span> <span class="detail-value">${skill.name}</span></div>
            <div class="skill-detail"><span class="detail-label">Type:</span> <span class="detail-value">${skill.type}</span></div>
            <div class="skill-detail"><span class="detail-label">Damage:</span> <span class="detail-value">${skill.damage}</span></div>
            <div class="skill-detail"><span class="detail-label">Mana Cost:</span> <span class="detail-value">${skill.manaCost}</span></div>
            <div class="skill-detail"><span class="detail-label">Cooldown:</span> <span class="detail-value">${skill.cooldown}s</span></div>
            <div class="skill-detail"><span class="detail-label">Range:</span> <span class="detail-value">${skill.range}</span></div>
            <div class="skill-detail"><span class="detail-label">Radius:</span> <span class="detail-value">${skill.radius}</span></div>
            <div class="skill-detail"><span class="detail-label">Duration:</span> <span class="detail-value">${skill.duration}s</span></div>
            <div class="skill-detail"><span class="detail-label">Description:</span> <span class="detail-value">${skill.description}</span></div>
        `;
        
        this.skillDetailsContainer.innerHTML = detailsHTML;
    }
    
    /**
     * Play the current skill effect
     * @private
     */
    playCurrentSkillEffect() {
        if (!this.currentSkill || !this.skillPreview) return;
        
        console.debug(`Playing skill effect for: ${this.currentSkill.name}`);
        
        // Create the skill effect using the SkillPreview
        this.skillPreview.createSkillEffect(this.currentSkill);
    }
    
    /**
     * Update the component
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // No update logic needed for this component
    }

    /**
     * Initialize settings with current values
     * @private
     */
    initializeSettings() {
        // Initialize performance settings
        this.initializePerformanceSettings();
        
        // Initialize game settings
        this.initializeGameSettings();
        
        // Initialize character model settings
        this.initializeCharacterModelSettings();
        
        // Initialize skills preview
        this.initializeSkillsPreview();
        
        // Initialize audio settings
        this.initializeAudioSettings();
        
        // Initialize controls display
        this.initializeControlsDisplay();
        
        // Initialize release settings
        this.initializeReleaseSettings();
        
        // Set up back button
        this.setupBackButton();
    }

    /**
     * Initialize performance settings
     * @private
     */
    initializePerformanceSettings() {
        if (this.qualitySelect) {
            // Clear existing options
            while (this.qualitySelect.options.length > 0) {
                this.qualitySelect.remove(0);
            }
            
            // Add quality options
            const qualityLevels = ['minimal', 'low', 'medium', 'high', 'ultra'];
            qualityLevels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
                this.qualitySelect.appendChild(option);
            });
            
            // Set current quality
            if (this.game.performanceManager) {
                this.qualitySelect.value = this.game.performanceManager.currentQuality;
            }
            
            // Add change event
            this.qualitySelect.addEventListener('change', () => {
                if (this.game.performanceManager) {
                    // Store the setting in localStorage
                    localStorage.setItem(STORAGE_KEYS.QUALITY_LEVEL, this.qualitySelect.value);
                }
            });
        }
        
        if (this.adaptiveCheckbox) {
            // Set current adaptive quality state
            this.adaptiveCheckbox.checked = this.game.performanceManager ? 
                this.game.performanceManager.adaptiveQualityEnabled : true;
            
            // Add change event
            this.adaptiveCheckbox.addEventListener('change', () => {
                if (this.game.performanceManager) {
                    this.game.performanceManager.toggleAdaptiveQuality();
                    
                    // Disable quality selector if adaptive is enabled
                    if (this.qualitySelect) {
                        this.qualitySelect.disabled = this.adaptiveCheckbox.checked;
                    }
                    
                    // Store the setting in localStorage
                    localStorage.setItem(STORAGE_KEYS.ADAPTIVE_QUALITY, this.adaptiveCheckbox.checked);
                }
            });
        }
        
        if (this.fpsSlider && this.fpsValue) {
            // Set current FPS
            this.fpsSlider.value = this.game.performanceManager ? 
                this.game.performanceManager.targetFPS : 60;
            this.fpsValue.textContent = `${this.fpsSlider.value} FPS`;
            
            // Add input event
            this.fpsSlider.addEventListener('input', () => {
                if (this.game.performanceManager) {
                    this.game.performanceManager.setTargetFPS(parseInt(this.fpsSlider.value));
                    this.fpsValue.textContent = `${this.fpsSlider.value} FPS`;
                    
                    // Store the setting in localStorage
                    localStorage.setItem(STORAGE_KEYS.TARGET_FPS, this.fpsSlider.value);
                }
            });
        }
        
        if (this.showPerformanceInfoCheckbox) {
            // Get the stored value or default to false (hide performance info by default)
            const showPerformanceInfo = localStorage.getItem(STORAGE_KEYS.SHOW_PERFORMANCE_INFO);
            const showPerformanceInfoValue = showPerformanceInfo === null ? false : showPerformanceInfo === 'true';
            
            // Set the checkbox state
            this.showPerformanceInfoCheckbox.checked = showPerformanceInfoValue;
            
            // Apply the current setting
            this.togglePerformanceInfoVisibility(showPerformanceInfoValue);
            
            // Add change event
            this.showPerformanceInfoCheckbox.addEventListener('change', () => {
                const isChecked = this.showPerformanceInfoCheckbox.checked;
                
                // Toggle visibility of performance info
                this.togglePerformanceInfoVisibility(isChecked);
                
                // Store the setting in localStorage
                localStorage.setItem(STORAGE_KEYS.SHOW_PERFORMANCE_INFO, isChecked);
            });
        }
    }
    
    /**
     * Toggle the visibility of performance information displays
     * @param {boolean} show - Whether to show or hide the performance info
     * @private
     */
    togglePerformanceInfoVisibility(show) {
        if (!this.game.performanceManager) return;
        
        // Get references to the performance info elements
        const statsElement = this.game.performanceManager.stats ? this.game.performanceManager.stats.dom : null;
        const memoryDisplay = this.game.performanceManager.memoryDisplay;
        const gpuIndicator = this.game.performanceManager.gpuEnabledIndicator;
        const qualityIndicator = this.game.performanceManager.qualityIndicator;
        
        // Set visibility based on the show parameter
        if (statsElement) statsElement.style.display = show ? 'block' : 'none';
        if (memoryDisplay) memoryDisplay.style.display = show ? 'block' : 'none';
        if (gpuIndicator) gpuIndicator.style.display = show ? 'block' : 'none';
        if (qualityIndicator) qualityIndicator.style.display = show ? 'block' : 'none';
    }

    /**
     * Initialize game settings
     * @private
     */
    initializeGameSettings() {
        if (this.difficultySelect) {
            // Clear existing options
            while (this.difficultySelect.options.length > 0) {
                this.difficultySelect.remove(0);
            }
            
            // Add difficulty options
            const difficultyLevels = this.game.difficultyManager.getDifficultyLevels();
            difficultyLevels.forEach((level, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = level;
                this.difficultySelect.appendChild(option);
            });
            
            // Set current difficulty
            this.difficultySelect.value = this.game.difficultyManager.getCurrentDifficultyIndex();
            
            // Add change event
            this.difficultySelect.addEventListener('change', () => {
                this.game.difficultyManager.setDifficulty(parseInt(this.difficultySelect.value));
                
                // Store the setting in localStorage
                localStorage.setItem(STORAGE_KEYS.DIFFICULTY, this.difficultySelect.value);
            });
        }
    }

    /**
     * Initialize character model settings
     * @private
     */
    initializeCharacterModelSettings() {
        // Initialize model select for the preview tab
        this.initializeModelOptions(this.modelPreviewSelect);
        
        // Set up navigation buttons for model preview tab
        this.setupModelPreviewNavigationButtons();
        
        // Initialize fullscreen model preview
        this.initializeFullscreenModelPreview();
        
        // Add window resize handler to update model preview sizes
        window.addEventListener('resize', () => {
            this.resizeModelPreviewFullscreen();
        });
        
        // Note: Model Settings tab has been removed
    }
    
    /**
     * Initialize model options in a select element
     * @param {HTMLSelectElement} selectElement - The select element to populate
     * @private
     */
    initializeModelOptions(selectElement) {
        if (!selectElement) return;
        
        // Clear existing options
        while (selectElement.options.length > 0) {
            selectElement.remove(0);
        }
        
        // Add model options
        CHARACTER_MODELS.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            option.title = model.description;
            selectElement.appendChild(option);
        });
        
        // Determine which select element we're dealing with
        const isModelPreview = selectElement === this.modelPreviewSelect;
        
        // Try to get the stored model ID first
        let modelId = null;
        
        if (isModelPreview) {
            // For model preview, try to get from localStorage
            modelId = localStorage.getItem(STORAGE_KEYS.MODEL_PREVIEW);
        }
        
        // If no stored value or invalid, fall back to the current player model
        if (!modelId || !CHARACTER_MODELS.some(model => model.id === modelId)) {
            if (this.game.player && this.game.player.model) {
                modelId = this.game.player.model.getCurrentModelId();
            }
        }
        
        // Set the value if we have a valid model ID
        if (modelId && CHARACTER_MODELS.some(model => model.id === modelId)) {
            selectElement.value = modelId;
        } else if (CHARACTER_MODELS.length > 0) {
            // Default to first model if no valid model ID
            selectElement.value = CHARACTER_MODELS[0].id;
        }
    }
    
    /**
     * Set up navigation buttons for model preview tab
     * @private
     */
    setupModelPreviewNavigationButtons() {
        // Add event listeners for prev/next model preview buttons
        if (this.prevModelPreviewButton && this.modelPreviewSelect) {
            this.prevModelPreviewButton.addEventListener('click', () => {
                const currentIndex = this.modelPreviewSelect.selectedIndex;
                const newIndex = (currentIndex > 0) ? currentIndex - 1 : this.modelPreviewSelect.options.length - 1;
                this.modelPreviewSelect.selectedIndex = newIndex;
                
                // Trigger the change event to update the model
                const event = new Event('change');
                this.modelPreviewSelect.dispatchEvent(event);
            });
        }
        
        if (this.nextModelPreviewButton && this.modelPreviewSelect) {
            this.nextModelPreviewButton.addEventListener('click', () => {
                const currentIndex = this.modelPreviewSelect.selectedIndex;
                const newIndex = (currentIndex < this.modelPreviewSelect.options.length - 1) ? currentIndex + 1 : 0;
                this.modelPreviewSelect.selectedIndex = newIndex;
                
                // Trigger the change event to update the model
                const event = new Event('change');
                this.modelPreviewSelect.dispatchEvent(event);
            });
        }
        
        // Add event listeners for prev/next animation preview buttons
        if (this.prevAnimPreviewButton && this.animationPreviewSelect) {
            this.prevAnimPreviewButton.addEventListener('click', () => {
                if (this.animationPreviewSelect.options.length > 0 && !this.animationPreviewSelect.disabled) {
                    const currentIndex = this.animationPreviewSelect.selectedIndex;
                    const newIndex = (currentIndex > 0) ? currentIndex - 1 : this.animationPreviewSelect.options.length - 1;
                    this.animationPreviewSelect.selectedIndex = newIndex;
                    
                    // Trigger the change event to update the animation
                    const event = new Event('change');
                    this.animationPreviewSelect.dispatchEvent(event);
                }
            });
        }
        
        if (this.nextAnimPreviewButton && this.animationPreviewSelect) {
            this.nextAnimPreviewButton.addEventListener('click', () => {
                if (this.animationPreviewSelect.options.length > 0 && !this.animationPreviewSelect.disabled) {
                    const currentIndex = this.animationPreviewSelect.selectedIndex;
                    const newIndex = (currentIndex < this.animationPreviewSelect.options.length - 1) ? currentIndex + 1 : 0;
                    this.animationPreviewSelect.selectedIndex = newIndex;
                    
                    // Trigger the change event to update the animation
                    const event = new Event('change');
                    this.animationPreviewSelect.dispatchEvent(event);
                }
            });
        }
        
        // Add change event for animation preview selection
        if (this.animationPreviewSelect) {
            this.animationPreviewSelect.addEventListener('change', () => {
                const animationName = this.animationPreviewSelect.value;
                if (this.modelPreviewFullscreen && animationName) {
                    this.modelPreviewFullscreen.playAnimation(animationName);
                    
                    // Save to localStorage
                    localStorage.setItem(STORAGE_KEYS.ANIMATION_PREVIEW, animationName);
                    
                    // Sync with regular model preview
                    if (this.modelPreview && this.animationSelect) {
                        this.modelPreview.playAnimation(animationName);
                        this.syncAnimationSelect(this.animationSelect, animationName);
                    }
                    
                    // If game is running, also play the same animation on the player model
                    if (this.game.player && this.game.player.model && !this.game.player.model.usingFallbackModel) {
                        this.game.player.model.playAnimation(animationName);
                    }
                }
            });
        }
        
        // Add change event for model preview selection
        if (this.modelPreviewSelect && this.animationPreviewSelect) {
            this.modelPreviewSelect.addEventListener('change', () => {
                const modelId = this.modelPreviewSelect.value;
                const selectedModel = CHARACTER_MODELS.find(m => m.id === modelId);
                
                if (selectedModel && this.modelPreviewFullscreen) {
                    // Store the selected model ID for use when starting a new game
                    window.selectedModelId = modelId;
                    
                    // Save to localStorage
                    localStorage.setItem(STORAGE_KEYS.MODEL_PREVIEW, modelId);
                    
                    // Reset animation dropdown
                    this.resetAnimationSelect(this.animationPreviewSelect);
                    
                    // Get size multiplier (use the one from settings tab)
                    const multiplier = parseFloat(this.sizeSelect ? this.sizeSelect.value : 1.0);
                    
                    // Update preview
                    const baseScale = selectedModel.baseScale;
                    const effectiveScale = baseScale * multiplier;
                    this.modelPreviewFullscreen.loadModel(selectedModel.path, effectiveScale);
                    
                    // Sync with regular model preview
                    if (this.modelPreview && this.modelSelect) {
                        this.modelPreview.loadModel(selectedModel.path, effectiveScale);
                        this.syncModelSelect(this.modelSelect, modelId);
                    }
                    
                    // Update player model if game is running
                    if (this.game.player && this.game.player.model) {
                        this.game.player.model.setModel(modelId).then(() => {
                            // After model is loaded, apply the size multiplier
                            this.game.player.model.setSizeMultiplier(multiplier);
                        });
                    }
                    
                    // Update animation dropdown after a short delay
                    setTimeout(() => {
                        this.updateAnimationOptions(
                            this.modelPreviewFullscreen, 
                            this.animationPreviewSelect, 
                            this.prevAnimPreviewButton, 
                            this.nextAnimPreviewButton
                        );
                        
                        // Also update regular preview animations
                        if (this.modelPreview && this.animationSelect) {
                            this.updateAnimationOptions(
                                this.modelPreview, 
                                this.animationSelect, 
                                this.prevAnimButton, 
                                this.nextAnimButton
                            );
                        }
                    }, 500);
                }
            });
        }
        
        // Add camera control events
        if (this.resetCameraButton && this.modelPreviewFullscreen) {
            this.resetCameraButton.addEventListener('click', () => {
                if (this.modelPreviewFullscreen) {
                    this.modelPreviewFullscreen.resetCamera();
                }
            });
        }
        
        // Auto-rotate and rotation speed event listeners have been removed
    }
    
    /**
     * Initialize fullscreen model preview
     * @private
     */
    initializeFullscreenModelPreview() {
        if (!this.modelPreviewFullscreenContainer) {
            console.error('SettingsMenu: Model preview container not found');
            return;
        }
        
        console.debug('SettingsMenu: Initializing fullscreen model preview');
        
        // Clear any existing content in the wrapper
        const wrapper = document.getElementById('model-preview-fullscreen-wrapper');
        if (wrapper) {
            console.debug('SettingsMenu: Found existing wrapper');
            while (wrapper.firstChild) {
                wrapper.removeChild(wrapper.firstChild);
            }
        }
        
        setTimeout(() => {
            // Get the container dimensions for a more appropriate size
            const container = document.querySelector('.model-preview-fullscreen-section');
            let width = 500;
            let height = 400;
            
            if (container) {
                width = container.clientWidth;
                height = container.clientHeight || 400;
                console.debug('SettingsMenu: Container dimensions', width, height);
            } else {
                console.warn('SettingsMenu: Could not find container for dimensions');
            }
            
            // Create model preview with dynamic size using the container with the wrapper inside
            console.debug('SettingsMenu: Creating new ModelPreview instance');
            this.modelPreviewFullscreen = new ModelPreview(this.modelPreviewFullscreenContainer, width, height);
            
            // Auto-rotation functionality has been removed
            
            // Load the current model
            const modelId = this.modelPreviewSelect ? this.modelPreviewSelect.value : 
                           (this.modelSelect ? this.modelSelect.value : null);
            const selectedModel = modelId ? CHARACTER_MODELS.find(m => m.id === modelId) : null;
            
            if (selectedModel) {
                const baseScale = selectedModel.baseScale;
                const multiplier = window.selectedSizeMultiplier || 1.0;
                const effectiveScale = baseScale * multiplier;
                
                // Load the model
                this.modelPreviewFullscreen.loadModel(selectedModel.path, effectiveScale);
                
                // Check for animations after a short delay to ensure model is loaded
                setTimeout(() => {
                    this.updateAnimationOptions(
                        this.modelPreviewFullscreen, 
                        this.animationPreviewSelect, 
                        this.prevAnimPreviewButton, 
                        this.nextAnimPreviewButton
                    );
                }, 500);
            }
        }, 100);
    }
    
    /**
     * Reset animation select dropdown and add loading placeholder
     * @param {HTMLSelectElement} selectElement - The select element to reset
     * @private
     */
    resetAnimationSelect(selectElement) {
        if (!selectElement) return;
        
        // Clear existing options
        while (selectElement.options.length > 0) {
            selectElement.remove(0);
        }
        
        // Add loading placeholder
        const loadingOption = document.createElement('option');
        loadingOption.value = '';
        loadingOption.textContent = 'Loading...';
        selectElement.appendChild(loadingOption);
        selectElement.disabled = true;
    }
    
    /**
     * Update animation options in a select element
     * @param {ModelPreview} modelPreview - The model preview instance
     * @param {HTMLSelectElement} selectElement - The select element to update
     * @param {HTMLButtonElement} prevButton - The previous button
     * @param {HTMLButtonElement} nextButton - The next button
     * @private
     */
    updateAnimationOptions(modelPreview, selectElement, prevButton, nextButton) {
        if (!modelPreview || !selectElement) return;
        
        // Clear existing options
        while (selectElement.options.length > 0) {
            selectElement.remove(0);
        }
        
        // Get available animations
        const animations = modelPreview.getAnimationNames();
        
        if (animations.length > 0) {
            // Enable dropdown and buttons
            selectElement.disabled = false;
            if (prevButton) prevButton.disabled = false;
            if (nextButton) nextButton.disabled = false;
            
            // Add animations to dropdown
            animations.forEach(animName => {
                const option = document.createElement('option');
                option.value = animName;
                option.textContent = animName;
                selectElement.appendChild(option);
            });
            
            // Determine if this is the animation preview select
            const isAnimationPreview = selectElement === this.animationPreviewSelect;
            
            // Try to get the stored animation name first
            let animationName = null;
            
            if (isAnimationPreview) {
                // For animation preview, try to get from localStorage
                animationName = localStorage.getItem(STORAGE_KEYS.ANIMATION_PREVIEW);
            }
            
            // If no stored value or invalid, fall back to the current animation
            if (!animationName || !animations.includes(animationName)) {
                animationName = modelPreview.getCurrentAnimation();
            }
            
            // Set the value if we have a valid animation name
            if (animationName && animations.includes(animationName)) {
                selectElement.value = animationName;
                // Also play this animation
                modelPreview.playAnimation(animationName);
            } else if (animations.length > 0) {
                // Default to first animation if no valid animation name
                selectElement.value = animations[0];
                // Also play this animation
                modelPreview.playAnimation(animations[0]);
            }
        } else {
            // No animations available
            const noAnimOption = document.createElement('option');
            noAnimOption.value = '';
            noAnimOption.textContent = 'No animations available';
            selectElement.appendChild(noAnimOption);
            
            // Disable dropdown and buttons
            selectElement.disabled = true;
            if (prevButton) prevButton.disabled = true;
            if (nextButton) nextButton.disabled = true;
        }
    }
    
    /**
     * Sync model selection between two select elements
     * @param {HTMLSelectElement} selectElement - The select element to update
     * @param {string} modelId - The model ID to select
     * @private
     */
    syncModelSelect(selectElement, modelId) {
        if (!selectElement || !modelId) return;
        
        selectElement.value = modelId;
    }
    
    /**
     * Sync animation selection between two select elements
     * @param {HTMLSelectElement} selectElement - The select element to update
     * @param {string} animationName - The animation name to select
     * @private
     */
    syncAnimationSelect(selectElement, animationName) {
        if (!selectElement || !animationName) return;
        
        // Only set if the animation exists in the dropdown
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].value === animationName) {
                selectElement.value = animationName;
                break;
            }
        }
    }

    /**
     * Initialize audio settings
     * @private
     */
    initializeAudioSettings() {
        // Check if audio is enabled
        const audioEnabled = this.game.audioManager.isAudioEnabled();
        
        if (audioEnabled) {
            // Show audio controls
            if (this.audioDisabledMessage) {
                this.audioDisabledMessage.style.display = 'none';
            }
            
            // Mute toggle
            if (this.muteCheckbox) {
                this.muteCheckbox.checked = this.game.audioManager.isMuted;
                
                this.muteCheckbox.addEventListener('change', () => {
                    this.game.audioManager.toggleMute();
                    this.game.audioManager.saveSettings();
                });
            }
            
            // Music volume slider
            if (this.musicVolumeSlider && this.musicVolumeValue) {
                this.musicVolumeSlider.value = this.game.audioManager.getMusicVolume() * 100;
                this.musicVolumeValue.textContent = `${Math.round(this.game.audioManager.getMusicVolume() * 100)}%`;
                
                this.musicVolumeSlider.addEventListener('input', () => {
                    const volume = parseInt(this.musicVolumeSlider.value) / 100;
                    this.game.audioManager.setMusicVolume(volume);
                    this.musicVolumeValue.textContent = `${Math.round(volume * 100)}%`;
                });
                
                this.musicVolumeSlider.addEventListener('change', () => {
                    this.game.audioManager.saveSettings();
                });
            }
            
            // SFX volume slider
            if (this.sfxVolumeSlider && this.sfxVolumeValue) {
                this.sfxVolumeSlider.value = this.game.audioManager.getSFXVolume() * 100;
                this.sfxVolumeValue.textContent = `${Math.round(this.game.audioManager.getSFXVolume() * 100)}%`;
                
                this.sfxVolumeSlider.addEventListener('input', () => {
                    const volume = parseInt(this.sfxVolumeSlider.value) / 100;
                    this.game.audioManager.setSFXVolume(volume);
                    this.sfxVolumeValue.textContent = `${Math.round(volume * 100)}%`;
                });
                
                this.sfxVolumeSlider.addEventListener('change', () => {
                    this.game.audioManager.saveSettings();
                    // Play a test sound
                    this.game.audioManager.playSound('buttonClick');
                });
            }
            
            // Test sound button
            if (this.testSoundButton) {
                this.testSoundButton.addEventListener('click', () => {
                    this.game.audioManager.playSound('buttonClick');
                });
            }
            
            // Show simulated audio note if needed
            if (this.simulatedAudioNote) {
                this.simulatedAudioNote.style.display = 
                    !this.game.audioManager.areAudioFilesAvailable() ? 'block' : 'none';
            }
        } else {
            // Show audio disabled message
            if (this.audioDisabledMessage) {
                this.audioDisabledMessage.style.display = 'block';
            }
        }
    }

    /**
     * Set up back button
     * @private
     */
    setupBackButton() {
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                this.hide();
                
                // If the game is paused, show the game menu
                if (this.game.isPaused) {
                    // Use the menu manager if available
                    if (this.game.menuManager) {
                        this.game.menuManager.showMenu('gameMenu');
                    } else {
                        // Fallback to old behavior
                        this.game.events.dispatch('gameStateChanged', 'paused');
                    }
                } else if (this.mainMenu) {
                    // If we have a reference to the main menu that opened us, show it
                    this.mainMenu.style.display = 'flex';
                } else {
                    // Otherwise, resume the game
                    this.game.resume();
                }
                
                console.debug("Settings back button clicked - returning to previous screen");
            });
        }
        
        // Add click event to the Save button
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => {
                // Save all settings to localStorage
                this.saveAllSettings();
                
                // Reload the game
                setTimeout(() => {
                    window.location.reload(true);
                }, 500);
            });
        }
    }
    
    /**
     * Save all settings to localStorage
     * @private
     */
    saveAllSettings() {
        // Save performance settings
        if (this.game.performanceManager) {
            localStorage.setItem(STORAGE_KEYS.QUALITY_LEVEL, this.game.performanceManager.currentQuality);
            localStorage.setItem(STORAGE_KEYS.ADAPTIVE_QUALITY, this.game.performanceManager.adaptiveQualityEnabled);
            localStorage.setItem(STORAGE_KEYS.TARGET_FPS, this.game.performanceManager.targetFPS);
            
            // Save performance info visibility setting
            if (this.showPerformanceInfoCheckbox) {
                localStorage.setItem(STORAGE_KEYS.SHOW_PERFORMANCE_INFO, this.showPerformanceInfoCheckbox.checked);
            }
        }
        
        // Save game settings
        if (this.game.difficultyManager) {
            localStorage.setItem(STORAGE_KEYS.DIFFICULTY, this.game.difficultyManager.getCurrentDifficultyIndex());
        }
        
        // Save audio settings
        if (this.game.audioManager) {
            this.game.audioManager.saveSettings();
        }
        
        // Save character model settings
        if (this.game.player && this.game.player.model) {
            localStorage.setItem(STORAGE_KEYS.CHARACTER_MODEL, this.game.player.model.getCurrentModelId());
        }
        
        console.debug("All settings saved to localStorage");
    }

    /**
     * Show the settings menu
     * @param {HTMLElement} [mainMenu=null] - The main menu element to hide (optional)
     * @param {boolean} [fromInGame=false] - Whether the menu was opened from in-game
     */
    show(mainMenu = null, fromInGame = false) {
        // Store parameters for later use
        if (mainMenu !== undefined) this.mainMenu = mainMenu;
        if (fromInGame !== undefined) this.fromInGame = fromInGame;
        
        // Hide main menu if coming from main menu
        if (this.mainMenu) {
            this.mainMenu.style.display = 'none';
        }
        
        // Hide all UI elements (HUD, joystick, skills, etc.) using the HUDManager
        if (this.game.hudManager) {
            this.game.hudManager.hideAllUI();
        }
        
        // Show the main background when opening settings
        if (this.game.hudManager && this.game.hudManager.mainBackground) {
            this.game.hudManager.mainBackground.show();
        }
        
        // Show settings menu using parent class method
        super.show();
        
        // Override display style to flex instead of block
        if (this.container) {
            this.container.style.display = 'flex';
        }
        
        // If the game is paused, make sure the game menu is hidden to prevent overlap
        if (this.game.isPaused) {
            const gameMenuElement = document.getElementById('game-menu');
            if (gameMenuElement) {
                gameMenuElement.style.display = 'none';
            }
        }
        
        // Resize model preview fullscreen if needed
        if (this.modelPreviewFullscreen) {
            // Use setTimeout to ensure the menu is fully visible
            setTimeout(() => {
                this.resizeModelPreviewFullscreen();
            }, 100);
        }
        
        // Check if skills preview is initialized and restart animation if needed
        if (this.skillPreview) {
            // Use setTimeout to ensure the menu is fully visible
            setTimeout(() => {
                // Force restart the animation when the settings menu is opened
                this.skillPreview.forceRestartAnimation();
                
                // Also resize the skills preview
                this.resizeSkillsPreview();
            }, 100);
        }
    }
    
    /**
     * Hide the settings menu
     */
    hide() {
        // Store the last active tab (including icon tabs)
        const activeTab = document.querySelector('.tab-button.active, .tab-icon.active');
        if (activeTab) {
            window.lastActiveSettingsTab = activeTab.id.replace('tab-', '');
        }
        
        if (this.container) {
            this.container.style.display = 'none';
        }
        
        // If returning to game, show UI elements and hide the background
        if (this.fromInGame && this.game.isRunning) {
            // Show all UI elements
            if (this.game.hudManager) {
                this.game.hudManager.showAllUI();
            }
            
            // Hide the background
            if (this.game.hudManager && this.game.hudManager.mainBackground) {
                this.game.hudManager.mainBackground.hide();
            }
        }
    }

    /**
     * Initialize release settings
     * @private
     */
    initializeReleaseSettings() {
        // Set current version from service worker cache version
        if (this.currentVersionSpan) {
            // Try to get the cache version from the service worker
            this.fetchCacheVersion().then(version => {
                this.currentVersionSpan.textContent = version;
            }).catch(error => {
                console.error('Error fetching cache version:', error);
                this.currentVersionSpan.textContent = 'Unknown';
            });
        }
        
        // Set up update to latest button
        if (this.updateToLatestButton) {
            this.updateToLatestButton.addEventListener('click', () => {
                console.debug("Update to latest button clicked - performing hard reload...");
                
                // Show notification before reload
                if (this.game.hudManager) {
                    this.game.hudManager.showNotification('Updating to latest version...', 1500, 'info');
                }
                
                // Unregister service worker to ensure clean reload
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                        for (let registration of registrations) {
                            registration.unregister();
                            console.debug('Service worker unregistered');
                        }
                        
                        // Clear caches to ensure fresh content
                        if ('caches' in window) {
                            caches.keys().then(cacheNames => {
                                return Promise.all(
                                    cacheNames.map(cacheName => {
                                        console.debug(`Deleting cache: ${cacheName}`);
                                        return caches.delete(cacheName);
                                    })
                                );
                            }).then(() => {
                                console.debug('All caches cleared');
                                // Reload the page after a short delay
                                setTimeout(() => {
                                    window.location.reload(true);
                                }, 500);
                            });
                        } else {
                            // If caches API is not available, just reload
                            setTimeout(() => {
                                window.location.reload(true);
                            }, 500);
                        }
                    });
                } else {
                    // If service worker is not supported, just do a hard reload
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 500);
                }
            });
        }
    }
    
    /**
     * Initialize controls display
     * @private
     */
    initializeControlsDisplay() {
        // Initialize the controls display
        ControlsDisplay.initialize();
    }

    /**
     * Clean up resources
     * Overrides the parent class method
     */
    dispose() {
        // Call the parent class dispose method
        super.dispose();
        
        // Clean up model previews
        if (this.modelPreview) {
            this.modelPreview.dispose();
            this.modelPreview = null;
        }
        
        if (this.modelPreviewFullscreen) {
            this.modelPreviewFullscreen.dispose();
            this.modelPreviewFullscreen = null;
        }
    }
    
    /**
     * Check if the menu is visible
     * @returns {boolean} True if the menu is visible
     */
    isVisible() {
        return this.container && this.container.style.display !== 'none';
    }
    
    /**
     * Get the menu type/name
     * @returns {string} The menu type/name
     */
    getType() {
        return 'settingsMenu';
    }
}