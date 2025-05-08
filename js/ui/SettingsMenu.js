/**
 * SettingsMenu.js
 * Manages the settings menu UI component
 */

import { ModelPreview } from './ModelPreview.js';
import { CHARACTER_MODELS, MODEL_SIZE_MULTIPLIERS } from '../config/index.js';
import { UIComponent } from './UIComponent.js';

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
        
        // Audio settings elements
        this.muteCheckbox = document.getElementById('mute-checkbox');
        this.autoPauseCheckbox = document.getElementById('auto-pause-checkbox');
        this.musicVolumeSlider = document.getElementById('music-volume-slider');
        this.musicVolumeValue = document.getElementById('music-volume-value');
        this.sfxVolumeSlider = document.getElementById('sfx-volume-slider');
        this.sfxVolumeValue = document.getElementById('sfx-volume-value');
        this.testSoundButton = document.getElementById('test-sound-button');
        this.audioDisabledMessage = document.getElementById('audio-disabled-message');
        this.simulatedAudioNote = document.getElementById('simulated-audio-note');
        
        // Back button
        this.backButton = document.getElementById('settings-back-button');
        
        this.modelPreview = null;
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
        return true;
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
        
        // Initialize audio settings
        this.initializeAudioSettings();
        
        // Set up back button
        this.setupBackButton();
    }

    /**
     * Initialize performance settings
     * @private
     */
    initializePerformanceSettings() {
        if (this.qualitySelect) {
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
                    this.game.performanceManager.setQualityLevel(this.qualitySelect.value);
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
                }
            });
        }
    }

    /**
     * Initialize game settings
     * @private
     */
    initializeGameSettings() {
        if (this.difficultySelect) {
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
            });
        }
    }

    /**
     * Initialize character model settings
     * @private
     */
    initializeCharacterModelSettings() {
        // Add model options
        if (this.modelSelect) {
            CHARACTER_MODELS.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                option.title = model.description;
                this.modelSelect.appendChild(option);
            });
            
            // Set current model
            if (this.game.player && this.game.player.model) {
                this.modelSelect.value = this.game.player.model.getCurrentModelId();
            }
        }
        
        // Add size multiplier options
        if (this.sizeSelect) {
            MODEL_SIZE_MULTIPLIERS.forEach(multiplier => {
                const option = document.createElement('option');
                option.value = multiplier.value;
                option.textContent = multiplier.label;
                this.sizeSelect.appendChild(option);
            });
            
            // Set current size multiplier
            if (this.game.player && this.game.player.model) {
                const currentMultiplier = this.game.player.model.getCurrentSizeMultiplier();
                this.sizeSelect.value = currentMultiplier;
            }
        }
        
        // Add event listeners for prev/next model buttons
        if (this.prevModelButton && this.modelSelect) {
            this.prevModelButton.addEventListener('click', () => {
                const currentIndex = this.modelSelect.selectedIndex;
                const newIndex = (currentIndex > 0) ? currentIndex - 1 : this.modelSelect.options.length - 1;
                this.modelSelect.selectedIndex = newIndex;
                
                // Trigger the change event to update the model
                const event = new Event('change');
                this.modelSelect.dispatchEvent(event);
            });
        }
        
        if (this.nextModelButton && this.modelSelect) {
            this.nextModelButton.addEventListener('click', () => {
                const currentIndex = this.modelSelect.selectedIndex;
                const newIndex = (currentIndex < this.modelSelect.options.length - 1) ? currentIndex + 1 : 0;
                this.modelSelect.selectedIndex = newIndex;
                
                // Trigger the change event to update the model
                const event = new Event('change');
                this.modelSelect.dispatchEvent(event);
            });
        }
        
        // Add event listeners for prev/next size buttons
        if (this.prevSizeButton && this.sizeSelect) {
            this.prevSizeButton.addEventListener('click', () => {
                const currentIndex = this.sizeSelect.selectedIndex;
                const newIndex = (currentIndex > 0) ? currentIndex - 1 : this.sizeSelect.options.length - 1;
                this.sizeSelect.selectedIndex = newIndex;
                
                // Trigger the change event to update the size
                const event = new Event('change');
                this.sizeSelect.dispatchEvent(event);
            });
        }
        
        if (this.nextSizeButton && this.sizeSelect) {
            this.nextSizeButton.addEventListener('click', () => {
                const currentIndex = this.sizeSelect.selectedIndex;
                const newIndex = (currentIndex < this.sizeSelect.options.length - 1) ? currentIndex + 1 : 0;
                this.sizeSelect.selectedIndex = newIndex;
                
                // Trigger the change event to update the size
                const event = new Event('change');
                this.sizeSelect.dispatchEvent(event);
            });
        }
        
        // Add event listeners for prev/next animation buttons
        if (this.prevAnimButton && this.animationSelect) {
            this.prevAnimButton.addEventListener('click', () => {
                if (this.animationSelect.options.length > 0 && !this.animationSelect.disabled) {
                    const currentIndex = this.animationSelect.selectedIndex;
                    const newIndex = (currentIndex > 0) ? currentIndex - 1 : this.animationSelect.options.length - 1;
                    this.animationSelect.selectedIndex = newIndex;
                    
                    // Trigger the change event to update the animation
                    const event = new Event('change');
                    this.animationSelect.dispatchEvent(event);
                }
            });
        }
        
        if (this.nextAnimButton && this.animationSelect) {
            this.nextAnimButton.addEventListener('click', () => {
                if (this.animationSelect.options.length > 0 && !this.animationSelect.disabled) {
                    const currentIndex = this.animationSelect.selectedIndex;
                    const newIndex = (currentIndex < this.animationSelect.options.length - 1) ? currentIndex + 1 : 0;
                    this.animationSelect.selectedIndex = newIndex;
                    
                    // Trigger the change event to update the animation
                    const event = new Event('change');
                    this.animationSelect.dispatchEvent(event);
                }
            });
        }
        
        // Add change event for animation selection
        if (this.animationSelect) {
            this.animationSelect.addEventListener('change', () => {
                const animationName = this.animationSelect.value;
                if (this.modelPreview && animationName) {
                    this.modelPreview.playAnimation(animationName);
                    
                    // If game is running, also play the same animation on the player model
                    if (this.game.player && this.game.player.model && !this.game.player.model.usingFallbackModel) {
                        this.game.player.model.playAnimation(animationName);
                    }
                }
            });
        }
        
        // Add change event for model selection
        if (this.modelSelect && this.animationSelect) {
            this.modelSelect.addEventListener('change', () => {
                const modelId = this.modelSelect.value;
                const selectedModel = CHARACTER_MODELS.find(m => m.id === modelId);
                
                if (selectedModel && this.modelPreview) {
                    // Store the selected model ID for use when starting a new game
                    window.selectedModelId = modelId;
                    
                    // Reset animation dropdown
                    while (this.animationSelect.options.length > 0) {
                        this.animationSelect.remove(0);
                    }
                    
                    // Add loading placeholder
                    const loadingOption = document.createElement('option');
                    loadingOption.value = '';
                    loadingOption.textContent = 'Loading animations...';
                    this.animationSelect.appendChild(loadingOption);
                    this.animationSelect.disabled = true;
                    
                    // Update preview
                    const baseScale = selectedModel.baseScale;
                    const multiplier = parseFloat(this.sizeSelect.value);
                    const effectiveScale = baseScale * multiplier;
                    this.modelPreview.loadModel(selectedModel.path, effectiveScale);
                    
                    // Update player model if game is running
                    if (this.game.player && this.game.player.model) {
                        this.game.player.model.setModel(modelId).then(() => {
                            // After model is loaded, apply the size multiplier
                            this.game.player.model.setSizeMultiplier(multiplier);
                        });
                    }
                    
                    // Update animation dropdown after a short delay
                    setTimeout(() => {
                        // Clear existing options
                        while (this.animationSelect.options.length > 0) {
                            this.animationSelect.remove(0);
                        }
                        
                        // Get available animations
                        const animations = this.modelPreview.getAnimationNames();
                        
                        if (animations.length > 0) {
                            // Enable dropdown and buttons
                            this.animationSelect.disabled = false;
                            if (this.prevAnimButton) this.prevAnimButton.disabled = false;
                            if (this.nextAnimButton) this.nextAnimButton.disabled = false;
                            
                            // Add animations to dropdown
                            animations.forEach(animName => {
                                const option = document.createElement('option');
                                option.value = animName;
                                option.textContent = animName;
                                this.animationSelect.appendChild(option);
                            });
                            
                            // Set current animation as selected
                            const currentAnim = this.modelPreview.getCurrentAnimation();
                            if (currentAnim) {
                                this.animationSelect.value = currentAnim;
                            }
                        } else {
                            // No animations available
                            const noAnimOption = document.createElement('option');
                            noAnimOption.value = '';
                            noAnimOption.textContent = 'No animations available';
                            this.animationSelect.appendChild(noAnimOption);
                            
                            // Disable dropdown and buttons
                            this.animationSelect.disabled = true;
                            if (this.prevAnimButton) this.prevAnimButton.disabled = true;
                            if (this.nextAnimButton) this.nextAnimButton.disabled = true;
                        }
                    }, 500);
                }
            });
        }
        
        // Add change event for size multiplier
        if (this.sizeSelect) {
            this.sizeSelect.addEventListener('change', () => {
                const multiplier = parseFloat(this.sizeSelect.value);
                const modelId = this.modelSelect ? this.modelSelect.value : null;
                const selectedModel = modelId ? CHARACTER_MODELS.find(m => m.id === modelId) : null;
                
                if (selectedModel && this.modelPreview) {
                    // Store the selected size multiplier for use when starting a new game
                    window.selectedSizeMultiplier = multiplier;
                    
                    // Update preview
                    const baseScale = selectedModel.baseScale;
                    const effectiveScale = baseScale * multiplier;
                    this.modelPreview.loadModel(selectedModel.path, effectiveScale);
                    
                    // Update player model if game is running
                    if (this.game.player && this.game.player.model) {
                        this.game.player.model.setSizeMultiplier(multiplier);
                    }
                }
            });
        }
        
        // Initialize model preview
        if (this.modelPreviewContainer) {
            setTimeout(() => {
                // Create model preview after a short delay to ensure the container is in the DOM
                this.modelPreview = new ModelPreview(this.modelPreviewContainer);
                
                // Load the current model
                const modelId = this.modelSelect ? this.modelSelect.value : null;
                const selectedModel = modelId ? CHARACTER_MODELS.find(m => m.id === modelId) : null;
                
                if (selectedModel) {
                    // Store the initial values
                    window.selectedModelId = modelId;
                    window.selectedSizeMultiplier = parseFloat(this.sizeSelect ? this.sizeSelect.value : 1.0);
                    
                    const baseScale = selectedModel.baseScale;
                    const multiplier = window.selectedSizeMultiplier;
                    const effectiveScale = baseScale * multiplier;
                    
                    // Load the model
                    this.modelPreview.loadModel(selectedModel.path, effectiveScale);
                    
                    // Check for animations after a short delay to ensure model is loaded
                    setTimeout(() => {
                        if (this.animationSelect) {
                            // Clear existing options
                            while (this.animationSelect.options.length > 0) {
                                this.animationSelect.remove(0);
                            }
                            
                            // Get available animations
                            const animations = this.modelPreview.getAnimationNames();
                            
                            if (animations.length > 0) {
                                // Enable dropdown and buttons
                                this.animationSelect.disabled = false;
                                if (this.prevAnimButton) this.prevAnimButton.disabled = false;
                                if (this.nextAnimButton) this.nextAnimButton.disabled = false;
                                
                                // Add animations to dropdown
                                animations.forEach(animName => {
                                    const option = document.createElement('option');
                                    option.value = animName;
                                    option.textContent = animName;
                                    this.animationSelect.appendChild(option);
                                });
                                
                                // Set current animation as selected
                                const currentAnim = this.modelPreview.getCurrentAnimation();
                                if (currentAnim) {
                                    this.animationSelect.value = currentAnim;
                                }
                            } else {
                                // No animations available
                                const noAnimOption = document.createElement('option');
                                noAnimOption.value = '';
                                noAnimOption.textContent = 'No animations available';
                                this.animationSelect.appendChild(noAnimOption);
                                
                                // Disable dropdown and buttons
                                this.animationSelect.disabled = true;
                                if (this.prevAnimButton) this.prevAnimButton.disabled = true;
                                if (this.nextAnimButton) this.nextAnimButton.disabled = true;
                            }
                        }
                    }, 500);
                }
            }, 100);
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
            
            // Auto-pause toggle
            if (this.autoPauseCheckbox) {
                this.autoPauseCheckbox.checked = this.game.audioManager.isAutoPauseEnabled();
                
                this.autoPauseCheckbox.addEventListener('change', () => {
                    this.game.audioManager.toggleAutoPause();
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
                
                if (this.fromInGame) {
                    // Resume the game if we came from in-game
                    this.game.resume();
                } else if (this.mainMenu) {
                    // Return to main menu
                    this.mainMenu.style.display = 'flex';
                }
            });
        }
    }

    /**
     * Show the settings menu
     * @param {HTMLElement} mainMenu - The main menu element to hide (optional)
     * @param {boolean} fromInGame - Whether the menu was opened from in-game
     */
    show(mainMenu = null, fromInGame = false) {
        this.fromInGame = fromInGame;
        this.mainMenu = mainMenu;
        
        // Hide main menu if coming from main menu
        if (mainMenu) {
            mainMenu.style.display = 'none';
        }
        
        // Show the main background when opening settings
        if (this.game.uiManager && this.game.uiManager.mainBackground) {
            this.game.uiManager.mainBackground.show();
        }
        
        // Show settings menu using parent class method
        super.show();
        
        // Override display style to flex instead of block
        if (this.container) {
            this.container.style.display = 'flex';
        }
    }

    /**
     * Hide the settings menu
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        
        // If returning to game, hide the background
        if (this.fromInGame && this.game.isRunning) {
            if (this.game.uiManager && this.game.uiManager.mainBackground) {
                this.game.uiManager.mainBackground.hide();
            }
        }
    }

    /**
     * Clean up resources
     * Overrides the parent class method
     */
    dispose() {
        // Call the parent class dispose method
        super.dispose();
        
        if (this.modelPreview) {
            this.modelPreview.dispose();
        }
        
        this.modelPreview = null;
    }
}