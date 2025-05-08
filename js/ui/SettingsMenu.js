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
        
        // Fullscreen model preview elements
        this.modelPreviewFullscreenContainer = document.getElementById('model-preview-fullscreen-container');
        this.modelPreviewSelect = document.getElementById('model-preview-select');
        this.prevModelPreviewButton = document.getElementById('prev-model-preview-button');
        this.nextModelPreviewButton = document.getElementById('next-model-preview-button');
        this.animationPreviewSelect = document.getElementById('animation-preview-select');
        this.prevAnimPreviewButton = document.getElementById('prev-anim-preview-button');
        this.nextAnimPreviewButton = document.getElementById('next-anim-preview-button');
        this.resetCameraButton = document.getElementById('reset-camera-button');
        this.autoRotateCheckbox = document.getElementById('auto-rotate-checkbox');
        this.rotationSpeedSlider = document.getElementById('rotation-speed-slider');
        this.rotationSpeedValue = document.getElementById('rotation-speed-value');
        
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
        return true;
    }
    
    /**
     * Initialize tab functionality
     * @private
     */
    initializeTabs() {
        // Get all tab buttons and content
        const tabButtons = document.querySelectorAll('.tab-button');
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
        
        // Set current model
        if (this.game.player && this.game.player.model) {
            selectElement.value = this.game.player.model.getCurrentModelId();
        }
    }
    
    /**
     * Initialize size multiplier options
     * @private
     */
    initializeSizeOptions() {
        if (!this.sizeSelect) return;
        
        // Clear existing options
        while (this.sizeSelect.options.length > 0) {
            this.sizeSelect.remove(0);
        }
        
        // Add size multiplier options
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
    
    /**
     * Set up navigation buttons for model settings tab
     * @private
     */
    setupModelNavigationButtons() {
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
                    
                    // If fullscreen preview exists, sync the animation
                    if (this.modelPreviewFullscreen && this.animationPreviewSelect) {
                        this.modelPreviewFullscreen.playAnimation(animationName);
                        this.syncAnimationSelect(this.animationPreviewSelect, animationName);
                    }
                    
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
                    this.resetAnimationSelect(this.animationSelect);
                    
                    // Update preview
                    const baseScale = selectedModel.baseScale;
                    const multiplier = parseFloat(this.sizeSelect.value);
                    const effectiveScale = baseScale * multiplier;
                    this.modelPreview.loadModel(selectedModel.path, effectiveScale);
                    
                    // Sync with fullscreen preview if it exists
                    if (this.modelPreviewFullscreen && this.modelPreviewSelect) {
                        this.modelPreviewFullscreen.loadModel(selectedModel.path, effectiveScale);
                        this.syncModelSelect(this.modelPreviewSelect, modelId);
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
                        this.updateAnimationOptions(this.modelPreview, this.animationSelect, this.prevAnimButton, this.nextAnimButton);
                        
                        // Also update fullscreen preview animations if it exists
                        if (this.modelPreviewFullscreen && this.animationPreviewSelect) {
                            this.updateAnimationOptions(
                                this.modelPreviewFullscreen, 
                                this.animationPreviewSelect, 
                                this.prevAnimPreviewButton, 
                                this.nextAnimPreviewButton
                            );
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
                    
                    // Sync with fullscreen preview if it exists
                    if (this.modelPreviewFullscreen) {
                        this.modelPreviewFullscreen.loadModel(selectedModel.path, effectiveScale);
                    }
                    
                    // Update player model if game is running
                    if (this.game.player && this.game.player.model) {
                        this.game.player.model.setSizeMultiplier(multiplier);
                    }
                }
            });
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
        
        if (this.autoRotateCheckbox && this.modelPreviewFullscreen) {
            this.autoRotateCheckbox.addEventListener('change', () => {
                if (this.modelPreviewFullscreen) {
                    this.modelPreviewFullscreen.toggleAutoRotation(this.autoRotateCheckbox.checked);
                }
            });
        }
        
        if (this.rotationSpeedSlider && this.rotationSpeedValue && this.modelPreviewFullscreen) {
            this.rotationSpeedSlider.addEventListener('input', () => {
                const speed = parseFloat(this.rotationSpeedSlider.value);
                if (this.modelPreviewFullscreen) {
                    this.modelPreviewFullscreen.setRotationSpeed(speed);
                }
                this.rotationSpeedValue.textContent = speed.toFixed(1);
            });
        }
    }
    
    /**
     * Initialize model preview in settings tab - REMOVED
     * @private
     */
    initializeModelPreviewInSettings() {
        return; // Method disabled
        
        setTimeout(() => {
            // Get the container dimensions for a more appropriate size
            const container = document.querySelector('.model-preview-section');
            let width = 300;
            let height = 300;
            
            if (container) {
                width = container.clientWidth;
                height = container.clientHeight || 300;
            }
            
            // Create model preview with dynamic size
            this.modelPreview = new ModelPreview(this.modelPreviewContainer, width, height);
            
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
                    this.updateAnimationOptions(
                        this.modelPreview, 
                        this.animationSelect, 
                        this.prevAnimButton, 
                        this.nextAnimButton
                    );
                }, 500);
            }
        }, 100);
    }
    
    /**
     * Initialize fullscreen model preview
     * @private
     */
    initializeFullscreenModelPreview() {
        if (!this.modelPreviewFullscreenContainer) return;
        
        setTimeout(() => {
            // Get the container dimensions for a more appropriate size
            const container = document.querySelector('.model-preview-fullscreen-section');
            let width = 500;
            let height = 400;
            
            if (container) {
                width = container.clientWidth;
                height = container.clientHeight || 400;
            }
            
            // Create model preview with dynamic size
            this.modelPreviewFullscreen = new ModelPreview(this.modelPreviewFullscreenContainer, width, height);
            
            // Enable auto-rotation by default for the fullscreen preview
            this.modelPreviewFullscreen.toggleAutoRotation(true);
            if (this.autoRotateCheckbox) {
                this.autoRotateCheckbox.checked = true;
            }
            
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
        loadingOption.textContent = 'Loading animations...';
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
            
            // Set current animation as selected
            const currentAnim = modelPreview.getCurrentAnimation();
            if (currentAnim) {
                selectElement.value = currentAnim;
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
        
        // Hide all UI elements (HUD, joystick, skills, etc.)
        if (this.game.hudManager) {
            this.game.hudManager.hideAllUI();
        }
        
        // Hide specific HUD elements that might not be covered by hideAllUI
        this.hideHUDElements();
        
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
        
        // Resize model preview fullscreen if needed
        if (this.modelPreviewFullscreen) {
            // Use setTimeout to ensure the menu is fully visible
            setTimeout(() => {
                this.resizeModelPreviewFullscreen();
            }, 100);
        }
    }
    
    /**
     * Hide HUD UI elements when settings menu is open
     * @private
     */
    hideHUDElements() {
        // Hide hero portrait
        const heroPortrait = document.getElementById('player-portrait');
        if (heroPortrait) heroPortrait.style.display = 'none';
        
        // Hide joystick (correct IDs)
        const joystickContainer = document.getElementById('virtual-joystick-container');
        if (joystickContainer) joystickContainer.style.display = 'none';
        
        // Also try the old ID just in case
        const joystick = document.getElementById('virtual-joystick');
        if (joystick) joystick.style.display = 'none';
        
        // Hide skill buttons
        const skillsContainer = document.getElementById('skills-container');
        if (skillsContainer) skillsContainer.style.display = 'none';
        
        // Hide mobile buttons
        const mobileButtons = document.getElementById('mobile-buttons');
        if (mobileButtons) mobileButtons.style.display = 'none';
        
        // Hide player stats
        const playerStats = document.getElementById('player-stats-container');
        if (playerStats) playerStats.style.display = 'none';
        
        // Hide enemy info
        const enemyInfo = document.getElementById('enemy-info-container');
        if (enemyInfo) enemyInfo.style.display = 'none';
    }
    
    /**
     * Hide the settings menu
     */
    hide() {
        // Store the last active tab
        const activeTab = document.querySelector('.tab-button.active');
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
}