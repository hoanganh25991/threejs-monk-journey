/**
 * SettingsMenu.js
 * Manages the settings menu UI component
 */

import { UIComponent } from '../UIComponent.js';
import {
    PerformanceTab,
    GameplayTab,
    CharacterModelTab,
    SkillsPreviewTab,
    AudioTab,
    ControlsTab,
    EnemyPreviewTab,
    ReleaseTab
} from './settings-menu/index.js';

export class SettingsMenu extends UIComponent {
    /**
     * Create a settings menu
     * @param {Game} game - The game instance
     */
    constructor(game) {
        super('main-options-menu', game);
        
        // Footer buttons
        this.backButton = document.getElementById('settings-back-button');
        this.saveButton = document.getElementById('settings-save-button');
        
        this.fromInGame = false;
        this.mainMenu = null;
        
        // Tab components
        this.tabs = {};
        
        this.init();
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        this.initializeTabs();
        this.initializeTabComponents();
        this.setupBackButton();
        this.setupSaveButton();
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
                    
                    // Call onActivate for the active tab
                    if (this.tabs[tabId]) {
                        this.tabs[tabId].onActivate();
                    }
                    
                    // Call onDeactivate for all other tabs
                    Object.keys(this.tabs).forEach(key => {
                        if (key !== tabId && this.tabs[key]) {
                            this.tabs[key].onDeactivate();
                        }
                    });
                }
            });
        });
    }
    
    /**
     * Initialize all tab components
     * @private
     */
    initializeTabComponents() {
        // Create tab components
        this.tabs.performance = new PerformanceTab(this.game, this);
        this.tabs.game = new GameplayTab(this.game, this);
        this.tabs['model-preview'] = new CharacterModelTab(this.game, this);
        this.tabs['skills-preview'] = new SkillsPreviewTab(this.game, this);
        this.tabs.audio = new AudioTab(this.game, this);
        this.tabs.controls = new ControlsTab(this.game, this);
        this.tabs['enemy-preview'] = new EnemyPreviewTab(this.game, this);
        this.tabs.release = new ReleaseTab(this.game, this);
    }
    
    /**
     * Set up back button
     * @private
     */
    setupBackButton() {
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                // Save settings before going back
                this.saveSettings();
                
                // Hide settings menu
                this.hide();
                
                // Show main menu if available
                if (this.mainMenu) {
                    this.mainMenu.show();
                }
                
                // Resume game if coming from in-game
                if (this.fromInGame && this.game) {
                    this.game.resume();
                }
            });
        }
    }
    
    /**
     * Set up save button
     * @private
     */
    setupSaveButton() {
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => {
                // Save settings
                this.saveSettings();
                
                // Show confirmation message
                const confirmationMessage = document.createElement('div');
                confirmationMessage.className = 'settings-saved-message';
                confirmationMessage.textContent = 'Settings saved!';
                document.body.appendChild(confirmationMessage);
                
                // Remove confirmation message after a delay
                setTimeout(() => {
                    document.body.removeChild(confirmationMessage);
                }, 2000);
            });
        }
    }
    
    /**
     * Save all settings
     * @private
     */
    saveSettings() {
        // Save settings for all tabs
        Object.values(this.tabs).forEach(tab => {
            if (tab && typeof tab.saveSettings === 'function') {
                tab.saveSettings();
            }
        });
    }
    
    /**
     * Show the settings menu
     * @param {boolean|HTMLElement} fromInGameOrElement - Whether the settings menu is being shown from in-game or the element that triggered the show
     * @param {MainMenu|boolean} mainMenuOrIsPaused - Reference to the main menu or whether the game is paused
     */
    showSettings(fromInGameOrElement = false, mainMenuOrIsPaused = null) {
        // Handle both old and new parameter formats
        if (typeof fromInGameOrElement === 'boolean') {
            // New format: showSettings(fromInGame, mainMenu)
            this.fromInGame = fromInGameOrElement;
            this.mainMenu = mainMenuOrIsPaused;
        } else {
            // Old format: show(element, isPaused)
            this.fromInGame = mainMenuOrIsPaused || false;
            this.mainMenu = null;
        }
        
        // Show the settings menu
        this.show();
        
        // Resize all tab components
        this.resizeAllTabs();
        
        // Activate the first tab
        const firstTabButton = document.querySelector('.tab-button, .tab-icon');
        if (firstTabButton) {
            firstTabButton.click();
        }
    }
    
    /**
     * Resize all tab components
     * @private
     */
    resizeAllTabs() {
        // Resize all tab components
        Object.values(this.tabs).forEach(tab => {
            if (tab && typeof tab.resize === 'function') {
                tab.resize();
            }
        });
    }
    
    /**
     * Update the component
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update all tab components
        Object.values(this.tabs).forEach(tab => {
            if (tab && typeof tab.update === 'function') {
                tab.update(delta);
            }
        });
    }
    
    /**
     * Clean up the component
     */
    dispose() {
        // Dispose all tab components
        Object.values(this.tabs).forEach(tab => {
            if (tab && typeof tab.dispose === 'function') {
                tab.dispose();
            }
        });
        
        // Clear tabs
        this.tabs = {};
    }
}