/**
 * CharacterModelTab.js
 * Manages the character model settings tab UI component
 */

import { SettingsTab } from './SettingsTab.js';
import { ModelPreview } from '../ModelPreview.js';
import { CHARACTER_MODELS } from '../../config/player-models.js';
import { STORAGE_KEYS } from '../../config/storage-keys.js';

export class CharacterModelTab extends SettingsTab {
    /**
     * Create a character model settings tab
     * @param {import('../../game/Game.js').Game} game - The game instance
     * @param {SettingsMenu} settingsMenu - The parent settings menu
     */
    constructor(game, settingsMenu) {
        super('model-preview', game, settingsMenu);
        
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
        
        this.modelPreview = null;
        this.modelPreviewFullscreen = null;
        
        this.init();
    }
    
    /**
     * Initialize the character model settings
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        this.initializeModelOptions();
        this.setupModelNavigationButtons();
        this.initializeModelPreviewContainer();
        this.initializeModelPreviewFullscreen();
        this.initializeSizeOptions();
        this.initializeAnimationOptions();
        
        return true;
    }
    
    /**
     * Initialize model options in the select element
     * @private
     */
    initializeModelOptions() {
        if (!this.modelSelect || !this.modelPreviewSelect) return;
        
        // Clear existing options
        while (this.modelSelect.options.length > 0) {
            this.modelSelect.remove(0);
        }
        
        while (this.modelPreviewSelect.options.length > 0) {
            this.modelPreviewSelect.remove(0);
        }
        
        // Add model options
        CHARACTER_MODELS.forEach((model, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = model.name;
            this.modelSelect.appendChild(option);
            
            const previewOption = document.createElement('option');
            previewOption.value = index;
            previewOption.textContent = model.name;
            this.modelPreviewSelect.appendChild(previewOption);
        });
        
        // Get the stored selected model index or default to 0
        let selectedModelIndex = 0;
        const storedModelIndex = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
        
        if (storedModelIndex !== null && !isNaN(parseInt(storedModelIndex)) && 
            parseInt(storedModelIndex) >= 0 && parseInt(storedModelIndex) < CHARACTER_MODELS.length) {
            selectedModelIndex = parseInt(storedModelIndex);
        }
        
        // Set the selected model
        this.modelSelect.value = selectedModelIndex;
        this.modelPreviewSelect.value = selectedModelIndex;
        
        // Add change event listeners
        this.modelSelect.addEventListener('change', () => {
            const selectedIndex = parseInt(this.modelSelect.value);
            localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedIndex);
            
            // Update the model preview
            if (this.modelPreview) {
                const selectedModel = CHARACTER_MODELS[selectedIndex];
                if (selectedModel && selectedModel.modelPath) {
                    this.modelPreview.loadModel(selectedModel.modelPath, selectedModel.scale || 1.0);
                }
            }
            
            // Update the fullscreen model preview select
            this.modelPreviewSelect.value = selectedIndex;
        });
        
        this.modelPreviewSelect.addEventListener('change', () => {
            const selectedIndex = parseInt(this.modelPreviewSelect.value);
            localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedIndex);
            
            // Update the model preview
            if (this.modelPreviewFullscreen) {
                const selectedModel = CHARACTER_MODELS[selectedIndex];
                if (selectedModel && selectedModel.modelPath) {
                    this.modelPreviewFullscreen.loadModel(selectedModel.modelPath, selectedModel.scale || 1.0);
                }
            }
            
            // Update the model select
            this.modelSelect.value = selectedIndex;
        });
    }
    
    /**
     * Set up navigation buttons for model selection
     * @private
     */
    setupModelNavigationButtons() {
        if (this.prevModelButton) {
            this.prevModelButton.addEventListener('click', () => {
                const currentIndex = parseInt(this.modelSelect.value);
                const newIndex = (currentIndex - 1 + CHARACTER_MODELS.length) % CHARACTER_MODELS.length;
                this.modelSelect.value = newIndex;
                this.modelSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.nextModelButton) {
            this.nextModelButton.addEventListener('click', () => {
                const currentIndex = parseInt(this.modelSelect.value);
                const newIndex = (currentIndex + 1) % CHARACTER_MODELS.length;
                this.modelSelect.value = newIndex;
                this.modelSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.prevModelPreviewButton) {
            this.prevModelPreviewButton.addEventListener('click', () => {
                const currentIndex = parseInt(this.modelPreviewSelect.value);
                const newIndex = (currentIndex - 1 + CHARACTER_MODELS.length) % CHARACTER_MODELS.length;
                this.modelPreviewSelect.value = newIndex;
                this.modelPreviewSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.nextModelPreviewButton) {
            this.nextModelPreviewButton.addEventListener('click', () => {
                const currentIndex = parseInt(this.modelPreviewSelect.value);
                const newIndex = (currentIndex + 1) % CHARACTER_MODELS.length;
                this.modelPreviewSelect.value = newIndex;
                this.modelPreviewSelect.dispatchEvent(new Event('change'));
            });
        }
    }
    
    /**
     * Initialize the model preview container
     * @private
     */
    initializeModelPreviewContainer() {
        if (!this.modelPreviewContainer) {
            console.error('ModelPreviewContainer not found in the DOM');
            return;
        }
        
        console.debug('Initializing model preview container');
        
        // Create model preview with specific dimensions
        this.modelPreview = new ModelPreview(this.modelPreviewContainer, 300, 485);
        
        // Get the selected model
        const selectedModelIndex = parseInt(this.modelSelect.value || 0);
        const selectedModel = selectedModelIndex >= 0 && selectedModelIndex < CHARACTER_MODELS.length ? 
            CHARACTER_MODELS[selectedModelIndex] : null;
        
        // Set the model
        if (selectedModel && selectedModel.modelPath) {
            console.debug(`Loading model: ${selectedModel.modelPath}`);
            const scale = selectedModel.baseScale || selectedModel.scale || 1.0;
            this.modelPreview.loadModel(selectedModel.modelPath, scale);
            
            // Get the selected animation
            const selectedAnimationIndex = parseInt(this.animationSelect.value || 0);
            
            // Set the animation
            if (selectedModel.animations && selectedModel.animations.length > 0) {
                const animation = selectedModel.animations[selectedAnimationIndex];
                if (animation && animation.name) {
                    console.debug(`Playing animation: ${animation.name}`);
                    this.modelPreview.playAnimation(animation.name);
                }
            }
        } else {
            console.error('Selected model not found or has no modelPath', selectedModel);
        }
    }
    
    /**
     * Initialize the fullscreen model preview
     * @private
     */
    initializeModelPreviewFullscreen() {
        if (!this.modelPreviewFullscreenContainer) {
            console.error('ModelPreviewFullscreenContainer not found in the DOM');
            return;
        }
        
        console.debug('Initializing fullscreen model preview container');
        
        // Get container dimensions
        const containerWidth = this.modelPreviewFullscreenContainer.clientWidth || 600;
        const containerHeight = this.modelPreviewFullscreenContainer.clientHeight || 400;
        
        // Create model preview with container dimensions
        this.modelPreviewFullscreen = new ModelPreview(
            this.modelPreviewFullscreenContainer, 
            containerWidth, 
            containerHeight
        );
        
        // Get the selected model
        const selectedModelIndex = parseInt(this.modelPreviewSelect.value || 0);
        const selectedModel = selectedModelIndex >= 0 && selectedModelIndex < CHARACTER_MODELS.length ? 
            CHARACTER_MODELS[selectedModelIndex] : null;
        
        // Set the model
        if (selectedModel && selectedModel.modelPath) {
            console.debug(`Loading fullscreen model: ${selectedModel.modelPath}`);
            const scale = selectedModel.baseScale || selectedModel.scale || 1.0;
            this.modelPreviewFullscreen.loadModel(selectedModel.modelPath, scale);
            
            // Get the selected animation
            const selectedAnimationIndex = parseInt(this.animationPreviewSelect.value || 0);
            
            // Set the animation
            if (selectedModel.animations && selectedModel.animations.length > 0) {
                const animation = selectedModel.animations[selectedAnimationIndex];
                if (animation && animation.name) {
                    console.debug(`Playing fullscreen animation: ${animation.name}`);
                    this.modelPreviewFullscreen.playAnimation(animation.name);
                }
            }
        } else {
            console.error('Selected model not found or has no modelPath for fullscreen preview', selectedModel);
        }
        
        // Set up reset camera button
        if (this.resetCameraButton) {
            this.resetCameraButton.addEventListener('click', () => {
                if (this.modelPreviewFullscreen) {
                    this.modelPreviewFullscreen.resetCamera();
                }
            });
        }
    }
    
    /**
     * Initialize size options in the select element
     * @private
     */
    initializeSizeOptions() {
        if (!this.sizeSelect) return;
        
        // Clear existing options
        while (this.sizeSelect.options.length > 0) {
            this.sizeSelect.remove(0);
        }
        
        // Add size options
        const sizeOptions = ['small', 'medium', 'large'];
        sizeOptions.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size.charAt(0).toUpperCase() + size.slice(1);
            this.sizeSelect.appendChild(option);
        });
        
        // Get the stored selected size or default to medium
        const storedSize = localStorage.getItem(STORAGE_KEYS.SELECTED_SIZE) || 'medium';
        this.sizeSelect.value = storedSize;
        
        // Add change event listener
        this.sizeSelect.addEventListener('change', () => {
            localStorage.setItem(STORAGE_KEYS.SELECTED_SIZE, this.sizeSelect.value);
            
            // Update the model preview size
            if (this.modelPreview) {
                this.modelPreview.setSize(this.sizeSelect.value);
            }
        });
        
        // Set up size navigation buttons
        if (this.prevSizeButton) {
            this.prevSizeButton.addEventListener('click', () => {
                const sizeOptions = ['small', 'medium', 'large'];
                const currentIndex = sizeOptions.indexOf(this.sizeSelect.value);
                const newIndex = (currentIndex - 1 + sizeOptions.length) % sizeOptions.length;
                this.sizeSelect.value = sizeOptions[newIndex];
                this.sizeSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.nextSizeButton) {
            this.nextSizeButton.addEventListener('click', () => {
                const sizeOptions = ['small', 'medium', 'large'];
                const currentIndex = sizeOptions.indexOf(this.sizeSelect.value);
                const newIndex = (currentIndex + 1) % sizeOptions.length;
                this.sizeSelect.value = sizeOptions[newIndex];
                this.sizeSelect.dispatchEvent(new Event('change'));
            });
        }
    }
    
    /**
     * Initialize animation options in the select element
     * @private
     */
    initializeAnimationOptions() {
        if (!this.animationSelect || !this.animationPreviewSelect) {
            console.error('Animation select elements not found in the DOM');
            return;
        }
        
        console.debug('Initializing animation options');
        
        // Get the selected model
        const selectedModelIndex = parseInt(this.modelSelect.value || 0);
        const selectedModel = selectedModelIndex >= 0 && selectedModelIndex < CHARACTER_MODELS.length ? 
            CHARACTER_MODELS[selectedModelIndex] : null;
            
        if (!selectedModel) {
            console.error('Selected model not found for animation options');
            return;
        }
        
        // Clear existing options
        while (this.animationSelect.options.length > 0) {
            this.animationSelect.remove(0);
        }
        
        while (this.animationPreviewSelect.options.length > 0) {
            this.animationPreviewSelect.remove(0);
        }
        
        // Add animation options
        if (selectedModel.animations && selectedModel.animations.length > 0) {
            console.debug(`Adding ${selectedModel.animations.length} animation options`);
            selectedModel.animations.forEach((animation, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = animation.displayName || animation.name || `Animation ${index + 1}`;
                this.animationSelect.appendChild(option);
                
                const previewOption = document.createElement('option');
                previewOption.value = index;
                previewOption.textContent = animation.displayName || animation.name || `Animation ${index + 1}`;
                this.animationPreviewSelect.appendChild(previewOption);
            });
        } else {
            console.warn('No animations found for the selected model');
            
            // Add a default "No animations" option
            const noAnimOption = document.createElement('option');
            noAnimOption.value = "0";
            noAnimOption.textContent = "No animations available";
            this.animationSelect.appendChild(noAnimOption);
            
            const noAnimPreviewOption = document.createElement('option');
            noAnimPreviewOption.value = "0";
            noAnimPreviewOption.textContent = "No animations available";
            this.animationPreviewSelect.appendChild(noAnimPreviewOption);
        }
        
        // Get the stored selected animation index or default to 0
        let selectedAnimationIndex = 0;
        const storedAnimationIndex = localStorage.getItem(STORAGE_KEYS.SELECTED_ANIMATION);
        
        if (storedAnimationIndex !== null && !isNaN(parseInt(storedAnimationIndex)) && 
            parseInt(storedAnimationIndex) >= 0 && selectedModel.animations && 
            parseInt(storedAnimationIndex) < selectedModel.animations.length) {
            selectedAnimationIndex = parseInt(storedAnimationIndex);
        }
        
        // Set the selected animation
        this.animationSelect.value = selectedAnimationIndex;
        this.animationPreviewSelect.value = selectedAnimationIndex;
        
        // Add change event listeners
        this.animationSelect.addEventListener('change', () => {
            const selectedIndex = parseInt(this.animationSelect.value);
            localStorage.setItem(STORAGE_KEYS.SELECTED_ANIMATION, selectedIndex);
            
            // Get the current selected model
            const modelIndex = parseInt(this.modelSelect.value || 0);
            const currentModel = modelIndex >= 0 && modelIndex < CHARACTER_MODELS.length ? 
                CHARACTER_MODELS[modelIndex] : null;
            
            // Update the model preview animation
            if (this.modelPreview && currentModel && currentModel.animations && 
                currentModel.animations.length > 0 && selectedIndex < currentModel.animations.length) {
                const animation = currentModel.animations[selectedIndex];
                if (animation && animation.name) {
                    this.modelPreview.playAnimation(animation.name);
                }
            }
            
            // Update the fullscreen model preview animation select
            this.animationPreviewSelect.value = selectedIndex;
        });
        
        this.animationPreviewSelect.addEventListener('change', () => {
            const selectedIndex = parseInt(this.animationPreviewSelect.value);
            localStorage.setItem(STORAGE_KEYS.SELECTED_ANIMATION, selectedIndex);
            
            // Get the current selected model
            const modelIndex = parseInt(this.modelPreviewSelect.value || 0);
            const currentModel = modelIndex >= 0 && modelIndex < CHARACTER_MODELS.length ? 
                CHARACTER_MODELS[modelIndex] : null;
            
            // Update the fullscreen model preview animation
            if (this.modelPreviewFullscreen && currentModel && currentModel.animations && 
                currentModel.animations.length > 0 && selectedIndex < currentModel.animations.length) {
                const animation = currentModel.animations[selectedIndex];
                if (animation && animation.name) {
                    this.modelPreviewFullscreen.playAnimation(animation.name);
                }
            }
            
            // Update the model animation select
            this.animationSelect.value = selectedIndex;
        });
        
        // Set up animation navigation buttons
        if (this.prevAnimButton) {
            this.prevAnimButton.addEventListener('click', () => {
                // Get the current selected model
                const modelIndex = parseInt(this.modelSelect.value || 0);
                const currentModel = modelIndex >= 0 && modelIndex < CHARACTER_MODELS.length ? 
                    CHARACTER_MODELS[modelIndex] : null;
                
                if (!currentModel || !currentModel.animations || currentModel.animations.length === 0) return;
                
                const currentIndex = parseInt(this.animationSelect.value);
                const newIndex = (currentIndex - 1 + currentModel.animations.length) % currentModel.animations.length;
                this.animationSelect.value = newIndex;
                this.animationSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.nextAnimButton) {
            this.nextAnimButton.addEventListener('click', () => {
                // Get the current selected model
                const modelIndex = parseInt(this.modelSelect.value || 0);
                const currentModel = modelIndex >= 0 && modelIndex < CHARACTER_MODELS.length ? 
                    CHARACTER_MODELS[modelIndex] : null;
                
                if (!currentModel || !currentModel.animations || currentModel.animations.length === 0) return;
                
                const currentIndex = parseInt(this.animationSelect.value);
                const newIndex = (currentIndex + 1) % currentModel.animations.length;
                this.animationSelect.value = newIndex;
                this.animationSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.prevAnimPreviewButton) {
            this.prevAnimPreviewButton.addEventListener('click', () => {
                // Get the current selected model
                const modelIndex = parseInt(this.modelPreviewSelect.value || 0);
                const currentModel = modelIndex >= 0 && modelIndex < CHARACTER_MODELS.length ? 
                    CHARACTER_MODELS[modelIndex] : null;
                
                if (!currentModel || !currentModel.animations || currentModel.animations.length === 0) return;
                
                const currentIndex = parseInt(this.animationPreviewSelect.value);
                const newIndex = (currentIndex - 1 + currentModel.animations.length) % currentModel.animations.length;
                this.animationPreviewSelect.value = newIndex;
                this.animationPreviewSelect.dispatchEvent(new Event('change'));
            });
        }
        
        if (this.nextAnimPreviewButton) {
            this.nextAnimPreviewButton.addEventListener('click', () => {
                // Get the current selected model
                const modelIndex = parseInt(this.modelPreviewSelect.value || 0);
                const currentModel = modelIndex >= 0 && modelIndex < CHARACTER_MODELS.length ? 
                    CHARACTER_MODELS[modelIndex] : null;
                
                if (!currentModel || !currentModel.animations || currentModel.animations.length === 0) return;
                
                const currentIndex = parseInt(this.animationPreviewSelect.value);
                const newIndex = (currentIndex + 1) % currentModel.animations.length;
                this.animationPreviewSelect.value = newIndex;
                this.animationPreviewSelect.dispatchEvent(new Event('change'));
            });
        }
    }
    
    /**
     * Resize the model preview to fit the container
     */
    resize() {
        this.resizeModelPreview();
        this.resizeModelPreviewFullscreen();
    }
    
    /**
     * Resize the model preview to fit the container
     * @private
     */
    resizeModelPreview() {
        if (!this.modelPreview) return;
        
        const container = this.modelPreviewContainer;
        if (!container) return;
        
        // Get the container dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update the model preview size
        this.modelPreview.setSize(width, height);
    }
    
    /**
     * Resize the fullscreen model preview to fit the container
     * @private
     */
    resizeModelPreviewFullscreen() {
        if (!this.modelPreviewFullscreen) return;
        
        const container = this.modelPreviewFullscreenContainer;
        if (!container) return;
        
        // Get the container dimensions
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update the model preview size
        this.modelPreviewFullscreen.setSize(width, height);
    }
    
    /**
     * Called when the tab is activated
     */
    onActivate() {
        // Resize the model preview when the tab is activated
        setTimeout(() => {
            this.resize();
        }, 50);
    }
    
    /**
     * Save the character model settings
     */
    saveSettings() {
        if (this.modelSelect) {
            localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, this.modelSelect.value);
        }
        
        if (this.sizeSelect) {
            localStorage.setItem(STORAGE_KEYS.SELECTED_SIZE, this.sizeSelect.value);
        }
        
        if (this.animationSelect) {
            localStorage.setItem(STORAGE_KEYS.SELECTED_ANIMATION, this.animationSelect.value);
        }
    }
}