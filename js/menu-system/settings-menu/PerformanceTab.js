/**
 * PerformanceTab.js
 * Manages the performance settings tab UI component
 */

import { SettingsTab } from './SettingsTab.js';
import { STORAGE_KEYS } from '../../config/storage-keys.js';
import storageService from '../../save-manager/StorageService.js';

export class PerformanceTab extends SettingsTab {
    /**
     * Create a performance settings tab
     * @param {import('../../game/Game.js').Game} game - The game instance
     * @param {SettingsMenu} settingsMenu - The parent settings menu
     */
    constructor(game, settingsMenu) {
        super('performance', game, settingsMenu);
        
        // Performance settings elements
        this.qualitySelect = document.getElementById('quality-select');
        this.adaptiveCheckbox = document.getElementById('adaptive-checkbox');
        this.fpsSlider = document.getElementById('fps-slider');
        this.fpsValue = document.getElementById('fps-value');
        this.showPerformanceInfoCheckbox = document.getElementById('show-performance-info-checkbox');
        this.debugModeCheckbox = document.getElementById('debug-mode-checkbox');
        this.logEnabledCheckbox = document.getElementById('log-enabled-checkbox');
        
        // Initialize storage service and tab
        this.initializeTab();
    }
    
    /**
     * Initialize the tab with proper loading state
     */
    async initializeTab() {
        try {
            // Initialize storage service first
            await storageService.init();
            
            // Initialize tab with loading indicator
            await this.withProgress(
                async () => this.initSettings(),
                'load',
                'Loading performance settings...'
            );
        } catch (error) {
            console.error('Error initializing performance tab:', error);
            // Show error in UI if available
            if (this.game && this.game.ui && this.game.ui.notifications) {
                this.game.ui.notifications.show('Error loading performance settings', 'error');
            }
        }
    }
    
    /**
     * Initialize the performance settings
     * @returns {Promise<boolean>} - Promise resolving to true if initialization was successful
     */
    async initSettings() {
        if (this.qualitySelect) {
            // Clear existing options
            while (this.qualitySelect.options.length > 0) {
                this.qualitySelect.remove(0);
            }
            
            // Add quality options
            const qualityLevels = ['ultra'];
            qualityLevels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = level.charAt(0).toUpperCase() + level.slice(1);
                this.qualitySelect.appendChild(option);
            });
            
            // Set current quality
            const currentQuality = await storageService.loadData(STORAGE_KEYS.QUALITY_LEVEL) || 'ultra';
            this.qualitySelect.value = currentQuality;
            
            // Add change event listener
            this.qualitySelect.addEventListener('change', async () => {
                // Show saving indicator
                this.withProgress(
                    async () => {
                        await storageService.saveData(STORAGE_KEYS.QUALITY_LEVEL, this.qualitySelect.value);
                        
                        // Apply quality settings immediately if game is available
                        if (this.game && this.game.renderer) {
                            this.game.applyQualitySettings(this.qualitySelect.value);
                        }
                    },
                    'save',
                    'Saving quality settings...'
                );
            });
        }
        
        if (this.adaptiveCheckbox) {
            // Set current adaptive quality state
            const adaptiveQuality = await storageService.loadData(STORAGE_KEYS.ADAPTIVE_QUALITY);
            
            // Handle both boolean and string values
            // This ensures compatibility with both LocalStorageAdapter and GoogleDriveAdapter
            this.adaptiveCheckbox.checked = adaptiveQuality === true || adaptiveQuality === 'true';
            
            console.debug(`Adaptive quality loaded: ${adaptiveQuality} (${typeof adaptiveQuality}), checkbox set to: ${this.adaptiveCheckbox.checked}`);
            
            // Add change event listener
            this.adaptiveCheckbox.addEventListener('change', async () => {
                // Show saving indicator
                this.withProgress(
                    async () => {
                        await storageService.saveData(STORAGE_KEYS.ADAPTIVE_QUALITY, this.adaptiveCheckbox.checked.toString());
                        
                        // Apply adaptive quality settings immediately if game is available
                        if (this.game && this.game.renderer) {
                            this.game.useAdaptiveQuality = this.adaptiveCheckbox.checked;
                        }
                    },
                    'save',
                    'Saving adaptive quality settings...'
                );
            });
        }
        
        if (this.fpsSlider && this.fpsValue) {
            // Set current target FPS
            const targetFPS = await storageService.loadData(STORAGE_KEYS.TARGET_FPS);
            const parsedFPS = targetFPS ? parseInt(targetFPS) : 60;
            this.fpsSlider.value = parsedFPS;
            this.fpsValue.textContent = parsedFPS;
            
            // Add input event listener with debounce
            let fpsDebounceTimeout = null;
            this.fpsSlider.addEventListener('input', () => {
                const value = parseInt(this.fpsSlider.value);
                this.fpsValue.textContent = value;
                
                // Clear previous timeout
                if (fpsDebounceTimeout) {
                    clearTimeout(fpsDebounceTimeout);
                }
                
                // Set new timeout for saving
                fpsDebounceTimeout = setTimeout(() => {
                    this.withProgress(
                        async () => {
                            await storageService.saveData(STORAGE_KEYS.TARGET_FPS, value.toString());
                            
                            // Apply target FPS immediately if game is available
                            if (this.game) {
                                this.game.targetFPS = value;
                            }
                        },
                        'save',
                        'Saving FPS settings...'
                    );
                }, 500); // Debounce for 500ms
            });
        }
        
        if (this.showPerformanceInfoCheckbox) {
            // Set current show performance info state
            const showPerformanceInfo = await storageService.loadData(STORAGE_KEYS.SHOW_PERFORMANCE_INFO);
            
            // Handle both boolean and string values
            // This ensures compatibility with both LocalStorageAdapter and GoogleDriveAdapter
            this.showPerformanceInfoCheckbox.checked = showPerformanceInfo === true || showPerformanceInfo === 'true';
            
            console.debug(`Show performance info loaded: ${showPerformanceInfo} (${typeof showPerformanceInfo}), checkbox set to: ${this.showPerformanceInfoCheckbox.checked}`);
            
            // Add change event listener
            this.showPerformanceInfoCheckbox.addEventListener('change', async () => {
                // Show saving indicator
                this.withProgress(
                    async () => {
                        await storageService.saveData(STORAGE_KEYS.SHOW_PERFORMANCE_INFO, this.showPerformanceInfoCheckbox.checked.toString());
                        
                        // Apply performance info display settings immediately if game is available
                        if (this.game && this.game.ui) {
                            this.game.ui.showPerformanceInfo = this.showPerformanceInfoCheckbox.checked;
                        }
                    },
                    'save',
                    'Saving performance info settings...'
                );
            });
        }
        
        if (this.debugModeCheckbox) {
            // Set current debug mode state
            const debugMode = await storageService.loadData(STORAGE_KEYS.DEBUG_MODE);
            
            // Handle both boolean and string values
            // This ensures compatibility with both LocalStorageAdapter and GoogleDriveAdapter
            this.debugModeCheckbox.checked = debugMode === true || debugMode === 'true';
            
            console.debug(`Debug mode loaded: ${debugMode} (${typeof debugMode}), checkbox set to: ${this.debugModeCheckbox.checked}`);
            
            // Add change event listener
            this.debugModeCheckbox.addEventListener('change', async () => {
                // Show saving indicator
                this.withProgress(
                    async () => {
                        await storageService.saveData(STORAGE_KEYS.DEBUG_MODE, this.debugModeCheckbox.checked.toString());
                        
                        // Apply debug mode settings immediately if game is available
                        if (this.game) {
                            this.game.debugMode = this.debugModeCheckbox.checked;
                        }
                    },
                    'save',
                    'Saving debug mode settings...'
                );
            });
        }
        
        if (this.logEnabledCheckbox) {
            // Set current log enabled state, default to false for better performance
            const logEnabled = await storageService.loadData(STORAGE_KEYS.LOG_ENABLED);
            
            // Handle both boolean and string values
            // This ensures compatibility with both LocalStorageAdapter and GoogleDriveAdapter
            this.logEnabledCheckbox.checked = logEnabled === true || logEnabled === 'true';
            
            console.debug(`Log enabled loaded: ${logEnabled} (${typeof logEnabled}), checkbox set to: ${this.logEnabledCheckbox.checked}`);
            
            // Add change event listener
            this.logEnabledCheckbox.addEventListener('change', async () => {
                // Show saving indicator
                this.withProgress(
                    async () => {
                        await storageService.saveData(STORAGE_KEYS.LOG_ENABLED, this.logEnabledCheckbox.checked.toString());
                        
                        // Show a notification that changes will take effect after reload
                        if (this.game && this.game.ui && this.game.ui.notifications) {
                            this.game.ui.notifications.show('Log settings will take effect after page reload', 'info');
                        }
                    },
                    'save',
                    'Saving log settings...'
                );
            });
        }
        
        return true;
    }
    
    /**
     * Called when the tab is activated
     */
    onActivate() {
        // If tab was not fully initialized yet, try again
        if (!this.initialized && !this.isLoading) {
            this.initializeTab();
        }
    }
    
    /**
     * Save the performance settings
     * @returns {Promise<boolean>}
     */
    async saveSettings() {
        return this.withProgress(
            async () => {
                if (this.qualitySelect) {
                    await storageService.saveData(STORAGE_KEYS.QUALITY_LEVEL, this.qualitySelect.value);
                }
                
                if (this.adaptiveCheckbox) {
                    await storageService.saveData(STORAGE_KEYS.ADAPTIVE_QUALITY, this.adaptiveCheckbox.checked.toString());
                }
                
                if (this.fpsSlider) {
                    await storageService.saveData(STORAGE_KEYS.TARGET_FPS, this.fpsSlider.value);
                }
                
                if (this.showPerformanceInfoCheckbox) {
                    await storageService.saveData(STORAGE_KEYS.SHOW_PERFORMANCE_INFO, this.showPerformanceInfoCheckbox.checked.toString());
                }
                
                if (this.debugModeCheckbox) {
                    await storageService.saveData(STORAGE_KEYS.DEBUG_MODE, this.debugModeCheckbox.checked.toString());
                }
                
                if (this.logEnabledCheckbox) {
                    await storageService.saveData(STORAGE_KEYS.LOG_ENABLED, this.logEnabledCheckbox.checked.toString());
                }
                
                return true;
            },
            'save',
            'Saving performance settings...'
        );
    }
    
    /**
     * Reset the performance settings to defaults
     * @returns {Promise<boolean>}
     */
    async resetToDefaults() {
        return this.withProgress(
            async () => {
                if (this.qualitySelect) {
                    this.qualitySelect.value = 'ultra';
                }
                
                if (this.adaptiveCheckbox) {
                    this.adaptiveCheckbox.checked = true;
                }
                
                if (this.fpsSlider && this.fpsValue) {
                    this.fpsSlider.value = 60;
                    this.fpsValue.textContent = 60;
                }
                
                if (this.showPerformanceInfoCheckbox) {
                    this.showPerformanceInfoCheckbox.checked = false;
                }
                
                if (this.debugModeCheckbox) {
                    this.debugModeCheckbox.checked = false;
                }
                
                if (this.logEnabledCheckbox) {
                    this.logEnabledCheckbox.checked = false;
                }
                
                // Save the default settings
                await this.saveSettings();
                
                return true;
            },
            'save',
            'Resetting performance settings...'
        );
    }
}