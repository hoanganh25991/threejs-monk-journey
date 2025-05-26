/**
 * PlayerModel.js
 * Handles the player's 3D model and animations
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { IPlayerModel } from './PlayerInterface.js';
import { FallbackPlayerModel } from './FallbackPlayerModel.js';
import { CHARACTER_MODELS, DEFAULT_CHARACTER_MODEL } from '../../config/player-models.js';
import * as AnimationUtils from '../../utils/AnimationUtils.js';

export class PlayerModel extends IPlayerModel {
    constructor(scene) {
        super();
        
        this.scene = scene;
        this.modelGroup = null;
        this.gltfModel = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.fallbackModel = null;
        this.usingFallbackModel = false;
        this.game = null; // Reference to the game
        // We'll use the game's clock instead of creating our own
        
        // Try to load model ID from localStorage, or use default
        this.currentModelId = localStorage.getItem('monk_journey_character_model') || DEFAULT_CHARACTER_MODEL;
        this.currentModel = this.getModelConfig(this.currentModelId);
        
        // Configuration options
        this.baseScale = this.currentModel.baseScale; // Base scale factor for the model
        this.sizeMultiplier = this.currentModel.multiplier; // Size multiplier
        this.modelScale = this.baseScale * this.sizeMultiplier; // Effective scale
        this.modelPath = this.currentModel.path; // Path to the 3D model
    }
    
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Get model configuration by ID
     * @param {string} modelId - The ID of the model to get
     * @returns {Object} The model configuration
     */
    getModelConfig(modelId) {
        const model = CHARACTER_MODELS.find(m => m.id === modelId);
        return model || CHARACTER_MODELS.find(m => m.id === DEFAULT_CHARACTER_MODEL);
    }
    
    async createModel() {
        // Create a group for the player
        this.modelGroup = new THREE.Group();
        
        try {
            // Load the 3D model specified in the configuration
            const loader = new GLTFLoader();
            
            // Return a promise that resolves when the model is loaded
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    // Resource URL
                    this.modelPath,
                    // Called when the resource is loaded
                    (gltf) => resolve(gltf),
                    // Called while loading is progressing
                    (xhr) => {
                        console.debug(`Loading model: ${(xhr.loaded / xhr.total * 100)}% loaded`);
                    },
                    // Called when loading has errors
                    (error) => {
                        console.error(`Error loading model from ${this.modelPath}:`, error);
                        reject(error);
                    }
                );
            });
            
            // Store the loaded model
            this.gltfModel = gltf.scene;
            
            // Apply shadows to all meshes in the model
            this.gltfModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            
            // Set up animations if they exist
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.gltfModel);
                
                // Store all animations by name for easy access
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = this.mixer.clipAction(clip);
                });
                
                AnimationUtils.playAnimation(this.animations, null, "idle", "walking")
            }
            
            // Scale and position the model appropriately
            // Apply the effective scale (baseScale * sizeMultiplier)
            this.gltfModel.scale.set(
                this.modelScale, 
                this.modelScale, 
                this.modelScale
            ); // Scale according to configuration
            
            this.gltfModel.position.set(0, 0, 0);
            this.gltfModel.rotation.set(0, 0, 0);

            // Try to load saved adjustments for this model
            let adjustmentsLoaded = false;
            if (this.game && this.game.hudManager && this.game.hudManager.loadModelAdjustments) {
                // This will be called again in setModel, but we need it here for initial model creation
                adjustmentsLoaded = this.game.hudManager.loadModelAdjustments(this.currentModelId);
            }
            
            // If no saved adjustments, apply model-specific default positions from config
            if (!adjustmentsLoaded) {
                // Get default adjustments from the model configuration
                const defaultAdjustments = this.currentModel.defaultAdjustments || {
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 }
                };
                
                // Apply the default position
                this.gltfModel.position.set(
                    defaultAdjustments.position.x, 
                    defaultAdjustments.position.y, 
                    defaultAdjustments.position.z
                );
                console.debug(`Applied default position from config: X: ${defaultAdjustments.position.x}, Y: ${defaultAdjustments.position.y}, Z: ${defaultAdjustments.position.z}`);
                
                // Apply the default rotation
                this.gltfModel.rotation.set(
                    defaultAdjustments.rotation.x, 
                    defaultAdjustments.rotation.y, 
                    defaultAdjustments.rotation.z
                );
                console.debug(`Applied default rotation from config: X: ${defaultAdjustments.rotation.x}, Y: ${defaultAdjustments.rotation.y}, Z: ${defaultAdjustments.rotation.z}`);
                
                // Store these defaults in the model's preview property for later reference
                if (!this.currentModel.preview) {
                    this.currentModel.preview = {};
                }
                this.currentModel.preview.position = { ...defaultAdjustments.position };
                this.currentModel.preview.rotation = { ...defaultAdjustments.rotation };
            }

            // Add the loaded model to our group
            this.modelGroup.add(this.gltfModel);
            
            // Add model to scene
            this.scene.add(this.modelGroup);
            
            // Log to confirm player model was added
            console.debug(`Model from ${this.modelPath} loaded and added to scene:`, this.modelGroup);
        } catch (error) {
            console.error(`Failed to load model from ${this.modelPath}:`, error);
            
            // Fallback to simple geometric model if loading fails
            this.createFallbackModel();
        }
        
        return this.modelGroup;
    }
    
    // Create and use the fallback model when the GLB model fails to load
    createFallbackModel() {
        // Remove the existing model group from the scene if it exists
        if (this.modelGroup) {
            this.scene.remove(this.modelGroup);
        }
        
        // Create a new fallback model
        this.fallbackModel = new FallbackPlayerModel(this.scene);
        this.modelGroup = this.fallbackModel.createModel();
        this.usingFallbackModel = true;
    }
    
    updateAnimations(delta, playerState) {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.updateAnimations(delta, playerState);
            return;
        }
        
        // If we have a loaded GLB model with animations
        if (this.mixer && this.gltfModel) {
            // Use the delta time passed from the game's update loop
            // This ensures consistent timing across all game systems
            
            // Use a minimum delta time to ensure animations always progress
            // This prevents the animation from freezing when delta is too small
            const effectiveDelta = Math.max(delta, 0.008); // Minimum 8ms delta (roughly 120fps)
            
            // First, always update the mixer with effective delta time
            // This is crucial for proper animation timing
            this.mixer.update(effectiveDelta);
            
            // For models with animations
            if (this.animations && Object.keys(this.animations).length > 0) {
                const animNames = Object.keys(this.animations);
                
                // Check if this is a Skeleton King model
                const isSkeletonKing = animNames.some(name => 
                    name.includes('_sk_') || name.includes('wk_'));
                
                // For Skeleton King models, use a simpler approach
                if (isSkeletonKing) {
                    // If we don't have an animation playing yet, start one
                    if (!this.currentAnimation && animNames.length > 0) {
                        // If no animation is currently playing, start the first one
                        const takeAnim = animNames.find(name => name === 'Take 001');
                        const animToPlay = takeAnim || animNames[0];
                        
                        this.animations[animToPlay].reset().play();
                        this.currentAnimation = animToPlay;
                        console.debug(`Started animation for Skeleton King: ${animToPlay}`);
                        
                        // Update the mixer multiple times to ensure the animation starts playing immediately
                        for (let i = 0; i < 3; i++) {
                            this.mixer.update(0.016);
                        }
                    } 
                    // If player is attacking, try to play an attack animation
                    else if (playerState && playerState.isAttacking() && this.currentAnimation !== 'wk_arc_sk_attack_versus') {
                        // Look for attack animations
                        const attackAnims = animNames.filter(name => 
                            name.includes('_attack') || 
                            name.includes('_stab') || 
                            name.includes('_kick'));
                            
                        if (attackAnims.length > 0) {
                            const attackAnim = attackAnims[0];
                            this.animations[attackAnim].reset().fadeIn(0.2).play();
                            
                            // If there was a previous animation, fade it out
                            if (this.currentAnimation && this.animations[this.currentAnimation]) {
                                this.animations[this.currentAnimation].fadeOut(0.2);
                            }
                            
                            this.currentAnimation = attackAnim;
                            console.debug(`Playing attack animation for Skeleton King: ${attackAnim}`);
                        }
                    }
                } else {
                    // For standard models, use the state-based animation system
                    const result = AnimationUtils.updateStateBasedAnimations({
                        mixer: this.mixer,
                        animations: this.animations,
                        currentAnimation: this.currentAnimation,
                        playerState: playerState,
                        delta: effectiveDelta // Use the effective delta for consistent timing
                    });
                    
                    // Update the current animation if the utility was successful
                    if (result.success) {
                        this.currentAnimation = result.currentAnimation;
                    }
                }
            }
        }
    }
    
    // Helper method to play animations with crossfade
    // Returns true if animation was found and played, false otherwise
    playAnimation(primaryName, fallbackName, transitionDuration = 0.5) {
        // Use the AnimationUtils to handle animation playback
        const result = AnimationUtils.playAnimation(
            this.animations, 
            this.currentAnimation, 
            primaryName, 
            fallbackName, 
            transitionDuration
        );
        
        // Update the current animation if the utility was successful
        if (result.success) {
            this.currentAnimation = result.currentAnimation;
        }
        
        return result.success;
    }
    
    setPosition(position) {
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.setPosition(position);
            return;
        }
        
        if (this.modelGroup) {
            this.modelGroup.position.copy(position);
            console.debug("PlayerModel: Position updated to:", this.modelGroup.position);
        }
    }
    
    setRotation(rotation) {
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.setRotation(rotation);
            return;
        }
        
        if (this.modelGroup) {
            this.modelGroup.rotation.y = rotation.y;
            // console.debug("PlayerModel: Rotation updated to:", this.modelGroup.rotation.y);
        }
    }
    
    /**
     * Set the vertical look direction for the player model
     * This allows the player to look up and down
     * @param {number} verticalDirection - Vertical direction value (-1 to 1)
     */
    setVerticalLookDirection(verticalDirection) {
        // Store the vertical look direction
        this.verticalLookDirection = verticalDirection;
        
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            if (typeof this.fallbackModel.setVerticalLookDirection === 'function') {
                this.fallbackModel.setVerticalLookDirection(verticalDirection);
            }
            return;
        }
        
        // Apply vertical rotation to the model's head/neck if possible
        if (this.gltfModel) {
            // Find head/neck bones in the model if they exist
            let headBone = null;
            let neckBone = null;
            
            this.gltfModel.traverse((node) => {
                if (node.isBone || node.type === 'Bone') {
                    const name = node.name.toLowerCase();
                    if (name.includes('head')) {
                        headBone = node;
                    } else if (name.includes('neck')) {
                        neckBone = node;
                    }
                }
            });
            
            // Apply rotation to head bone if found
            if (headBone) {
                // Calculate rotation angle based on vertical direction
                // Limit the rotation to a reasonable range (e.g., -30 to +60 degrees)
                const maxLookUpAngle = THREE.MathUtils.degToRad(60);   // Looking up (positive)
                const maxLookDownAngle = THREE.MathUtils.degToRad(30); // Looking down (negative)
                
                // Map verticalDirection (-1 to 1) to rotation angle
                // IMPORTANT: For head bone rotation, we need to INVERT the direction
                // When looking up (positive verticalDirection), the head needs to rotate BACKWARD (negative rotation)
                // When looking down (negative verticalDirection), the head needs to rotate FORWARD (positive rotation)
                let rotationAngle = 0;
                if (verticalDirection > 0) {
                    // Looking up - rotate head backward (negative rotation)
                    rotationAngle = -verticalDirection * maxLookUpAngle;
                } else {
                    // Looking down - rotate head forward (positive rotation)
                    rotationAngle = -verticalDirection * maxLookDownAngle;
                }
                
                // Apply rotation to head bone
                headBone.rotation.x = rotationAngle;
                
                console.log("Applied vertical look rotation to head bone:", 
                    THREE.MathUtils.radToDeg(rotationAngle) + "°", 
                    "from vertical direction:", verticalDirection);
            }
            
            // Apply smaller rotation to neck bone if found and head bone wasn't
            if (neckBone && !headBone) {
                // Use a smaller angle for the neck
                const maxNeckAngle = THREE.MathUtils.degToRad(20);
                const neckRotation = verticalDirection * maxNeckAngle;
                
                neckBone.rotation.x = neckRotation;
                
                console.log("Applied vertical look rotation to neck bone:", 
                    THREE.MathUtils.radToDeg(neckRotation) + "°");
            }
        }
    }
    
    /**
     * Get the model group
     * @returns {THREE.Group} The model group
     */
    getModelGroup() {
        return this.modelGroup;
    }
    
    /**
     * Clone the player model for use by other entities (like Mystic Ally)
     * @param {number} opacity - Opacity for the cloned model (0.0 to 1.0)
     * @param {number} emissiveColor - Emissive color for the cloned model (hex value)
     * @param {number} emissiveIntensity - Intensity of the emissive effect (0.0 to 1.0)
     * @returns {THREE.Group} The cloned model group
     */
    cloneModel(opacity = 0.7, emissiveColor = 0x00ffff, emissiveIntensity = 0.8) {
        // Create a new group for the cloned model
        const clonedGroup = new THREE.Group();
        
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            // Clone the fallback model
            const fallbackClone = this.fallbackModel.createModel();
            
            // Apply spirit appearance to the fallback model
            fallbackClone.traverse(child => {
                if (child.isMesh && child.material) {
                    // Clone the material to avoid affecting the original
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(mat => {
                            const newMat = mat.clone();
                            newMat.transparent = true;
                            newMat.opacity = opacity;
                            newMat.emissive = new THREE.Color(emissiveColor);
                            newMat.emissiveIntensity = emissiveIntensity;
                            return newMat;
                        });
                    } else {
                        child.material = child.material.clone();
                        child.material.transparent = true;
                        child.material.opacity = opacity;
                        child.material.emissive = new THREE.Color(emissiveColor);
                        child.material.emissiveIntensity = emissiveIntensity;
                    }
                }
            });
            
            return fallbackClone;
        }
        
        // If we have a loaded GLB model
        if (this.gltfModel) {
            try {
                // Clone the model
                const clonedModel = this.gltfModel.clone(true); // Deep clone
                
                // Apply spirit appearance to the cloned model
                clonedModel.traverse(child => {
                    if (child.isMesh && child.material) {
                        // Clone the material to avoid affecting the original
                        if (Array.isArray(child.material)) {
                            child.material = child.material.map(mat => {
                                const newMat = mat.clone();
                                newMat.transparent = true;
                                newMat.opacity = opacity;
                                newMat.emissive = new THREE.Color(emissiveColor);
                                newMat.emissiveIntensity = emissiveIntensity;
                                return newMat;
                            });
                        } else {
                            child.material = child.material.clone();
                            child.material.transparent = true;
                            child.material.opacity = opacity;
                            child.material.emissive = new THREE.Color(emissiveColor);
                            child.material.emissiveIntensity = emissiveIntensity;
                        }
                    }
                });
                
                // Add the cloned model to our group
                clonedGroup.add(clonedModel);
                
                return clonedGroup;
            } catch (error) {
                console.error("Error cloning player model:", error);
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * Set the base scale of the model
     * @param {number} scale - Base scale factor to apply to the model
     */
    setBaseScale(scale) {
        this.baseScale = scale;
        this.updateEffectiveScale();
        console.debug(`Model base scale set to: ${scale}`);
        
        // Update the model configuration to persist this change
        if (this.currentModel) {
            this.currentModel.baseScale = scale;
        }
    }
    
    /**
     * Set the size multiplier of the model
     * @param {number} multiplier - Size multiplier to apply to the model
     */
    setSizeMultiplier(multiplier) {
        this.sizeMultiplier = multiplier;
        this.updateEffectiveScale();
        console.debug(`Model size multiplier set to: ${multiplier}x`);
        
        // Update the model configuration to persist this change
        if (this.currentModel) {
            this.currentModel.multiplier = multiplier;
        }
    }
    
    /**
     * Update the effective scale based on base scale and multiplier
     */
    updateEffectiveScale() {
        this.modelScale = this.baseScale * this.sizeMultiplier;
        
        // Apply the new scale if the model is loaded
        if (this.gltfModel) {
            this.gltfModel.scale.set(
                this.modelScale, 
                this.modelScale, 
                this.modelScale
            );
        }
        
        console.debug(`Model effective scale updated to: ${this.modelScale}`);
    }
    
    /**
     * Set the preview position of the model
     * @param {Object} position - Position object with x, y, z properties
     */
    setPreviewPosition(position) {
        if (!this.currentModel.preview) {
            this.currentModel.preview = {};
        }
        
        this.currentModel.preview.position = position;
        
        // Apply the new position if the model is loaded
        if (this.gltfModel) {
            this.gltfModel.position.set(position.x, position.y, position.z);
            console.debug(`Model preview position updated to: X: ${position.x}, Y: ${position.y}, Z: ${position.z}`);
        }
    }
    
    /**
     * Set the preview rotation of the model
     * @param {Object} rotation - Rotation object with x, y, z properties
     */
    setPreviewRotation(rotation) {
        if (!this.currentModel.preview) {
            this.currentModel.preview = {};
        }
        
        this.currentModel.preview.rotation = rotation;
        
        // Apply the new rotation if the model is loaded
        if (this.gltfModel) {
            this.gltfModel.rotation.set(rotation.x, rotation.y, rotation.z);
            console.debug(`Model preview rotation updated to: X: ${rotation.x}, Y: ${rotation.y}, Z: ${rotation.z}`);
        }
    }
    
    /**
     * Get the current preview position
     * @returns {Object} Position object with x, y, z properties
     */
    getPreviewPosition() {
        if (this.currentModel && this.currentModel.preview && this.currentModel.preview.position) {
            return this.currentModel.preview.position;
        }
        return { x: 0, y: 0, z: 0 };
    }
    
    /**
     * Get the current preview rotation
     * @returns {Object} Rotation object with x, y, z properties
     */
    getPreviewRotation() {
        if (this.currentModel && this.currentModel.preview && this.currentModel.preview.rotation) {
            return this.currentModel.preview.rotation;
        }
        return { x: 0, y: 0, z: 0 };
    }
    
    /**
     * Set the model by ID
     * @param {string} modelId - ID of the model to set
     * @returns {Promise<boolean>} - True if model was changed successfully
     */
    async setModel(modelId) {
        // Get the model configuration
        const modelConfig = this.getModelConfig(modelId);
        if (!modelConfig) {
            console.error(`Model with ID ${modelId} not found`);
            return false;
        }
        
        // Update model properties
        this.currentModelId = modelId;
        this.currentModel = modelConfig;
        this.modelPath = modelConfig.path;
        this.baseScale = modelConfig.baseScale;
        
        // Keep the current multiplier
        this.updateEffectiveScale();
        
        // Save the model ID to localStorage for persistence
        try {
            localStorage.setItem('playerModelId', modelId);
            console.debug(`Model set to: ${modelConfig.name} (${modelId}) and saved to localStorage`);
        } catch (e) {
            console.warn('Could not save model ID to localStorage:', e);
            console.debug(`Model set to: ${modelConfig.name} (${modelId})`);
        }
        
        // Remove the current model from the scene
        if (this.modelGroup) {
            this.scene.remove(this.modelGroup);
        }
        
        // Create the new model
        await this.createModel();
        
        // Adjust player movement height offset based on model configuration
        if (this.game && this.game.player && this.game.player.movement) {
            // Get the height offset from the model configuration
            const heightOffset = modelConfig.defaultAdjustments?.heightOffset || 1.0;
            this.game.player.movement.heightOffset = heightOffset;
            console.debug(`Adjusted height offset for ${modelId} model to: ${heightOffset}`);
            
            // For the Ebon Knight model, clear any saved adjustments to ensure our new settings take effect
            if (modelId === 'ebon-knight') {
                this.clearSavedAdjustments(modelId);
            }
        }
        
        // Try to load saved adjustments for this model
        let adjustmentsLoaded = false;
        if (this.game && this.game.hudManager && this.game.hudManager.loadModelAdjustments) {
            adjustmentsLoaded = this.game.hudManager.loadModelAdjustments(modelId);
        }
        
        // If no saved adjustments were found, apply default model-specific adjustments
        if (!adjustmentsLoaded) {
            this.applyModelSpecificAdjustments(modelId);
        }
        
        return true;
    }
    
    /**
     * Apply model-specific adjustments based on model ID
     * @param {string} modelId - ID of the model to adjust
     */
    applyModelSpecificAdjustments(modelId) {
        // Try to get default adjustments from the model configuration first
        const modelConfig = CHARACTER_MODELS.find(model => model.id === modelId);
        if (modelConfig && modelConfig.defaultAdjustments) {
            // Use the configuration from player-models.js
            const defaultPosition = { ...modelConfig.defaultAdjustments.position };
            const defaultRotation = { ...modelConfig.defaultAdjustments.rotation };
            
            // Apply the default position and rotation
            this.setPreviewPosition(defaultPosition);
            this.setPreviewRotation(defaultRotation);
            
            console.debug(`Applied ${modelId} adjustments from config:`, 
                `Position: X: ${defaultPosition.x}, Y: ${defaultPosition.y}, Z: ${defaultPosition.z}`,
                `Rotation: X: ${defaultRotation.x}, Y: ${defaultRotation.y}, Z: ${defaultRotation.z}`);
            
            return;
        }
        
        // Fallback to hardcoded adjustments if no config is found
        let defaultPosition = { x: 0, y: 0, z: 0 };
        let defaultRotation = { x: 0, y: 0, z: 0 };
        
        // Set model-specific default positions
        switch(modelId) {
            case 'knight':
                // Knight-specific adjustments
                defaultPosition = { x: 0, y: 2.0, z: 0 }; // Knight needs to be raised
                break;
                
            case 'skeleton':
                // Skeleton-specific adjustments
                defaultPosition = { x: 0, y: 0.5, z: 0 }; // Skeleton needs slight adjustment
                break;
                
            case 'ebon-knight':
                // Ebon Knight-specific adjustments
                defaultPosition = { x: 0, y: 5.0, z: 0 }; // Ebon Knight needs to be raised significantly
                break;
                
            case 'monk':
            case 'monk-v2':
                // Monk-specific adjustments if needed
                defaultPosition = { x: 0, y: 0, z: 0 };
                break;
                
            // Add more cases for other models as needed
            
            default:
                // Default adjustments for other models
                defaultPosition = { x: 0, y: 0, z: 0 };
                break;
        }
        
        // Apply the default position and rotation
        this.setPreviewPosition(defaultPosition);
        this.setPreviewRotation(defaultRotation);
        
        console.debug(`Applied ${modelId}-specific adjustments from hardcoded values:`, 
            `Position: X: ${defaultPosition.x}, Y: ${defaultPosition.y}, Z: ${defaultPosition.z}`,
            `Rotation: X: ${defaultRotation.x}, Y: ${defaultRotation.y}, Z: ${defaultRotation.z}`);
    }
    
    /**
     * Get the current model ID
     * @returns {string} The current model ID
     */
    getCurrentModelId() {
        return this.currentModelId;
    }
    
    /**
     * Get the current model configuration
     * @returns {Object} The current model configuration
     */
    getCurrentModel() {
        return this.currentModel;
    }
    
    /**
     * Clear saved adjustments for a specific model
     * @param {string} modelId - ID of the model to clear adjustments for
     */
    clearSavedAdjustments(modelId) {
        try {
            // Get current saved adjustments
            const savedAdjustments = JSON.parse(localStorage.getItem('modelAdjustments') || '{}');
            
            // Remove adjustments for the specified model
            if (savedAdjustments[modelId]) {
                delete savedAdjustments[modelId];
                
                // Save back to localStorage
                localStorage.setItem('modelAdjustments', JSON.stringify(savedAdjustments));
                console.debug(`Cleared saved adjustments for model: ${modelId}`);
            }
        } catch (error) {
            console.error('Error clearing saved adjustments:', error);
        }
    }
    
    /**
     * Get the current size multiplier
     * @returns {number} The current size multiplier
     */
    getCurrentSizeMultiplier() {
        return this.sizeMultiplier;
    }
    
    /**
     * Set the path to the 3D model
     * @param {string} path - Path to the 3D model file
     * @deprecated Use setModel instead
     */
    setModelPath(path) {
        this.modelPath = path;
        console.debug(`Model path set to: ${path}`);
        // Note: This won't reload the model - call createModel() again if needed
    }
    
    // Left jab - quick straight punch with left hand
    createLeftPunchAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createLeftPunchAnimation();
            return;
        }
        
        // If we have a GLB model with animations
        if (this.gltfModel && this.mixer) {
            // Try to play a left punch animation from the model
            const animationNames = ['leftPunch', 'leftJab', 'punchLeft', 'jabLeft', 'punch_left', 'jab_left'];
            
            // Try each animation name
            for (const animName of animationNames) {
                if (this.playAnimation(animName, null, 0.1)) {
                    // Create punch effect - blue color for left hand
                    this.createPunchEffect('left', 0x4169e1); // Royal blue
                    return;
                }
            }
            
            // If no specific left punch animation found, try generic punch
            if (this.playAnimation('punch', 'attack', 0.1)) {
                // Create punch effect - blue color for left hand
                this.createPunchEffect('left', 0x4169e1); // Royal blue
                return;
            }
        }
    }
    
    // Right cross - powerful straight punch with right hand
    createRightPunchAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createRightPunchAnimation();
            return;
        }
        
        // If we have a GLB model with animations
        if (this.gltfModel && this.mixer) {
            // Try to play a right punch animation from the model
            const animationNames = ['rightPunch', 'rightCross', 'punchRight', 'crossRight', 'punch_right', 'cross_right'];
            
            // Try each animation name
            for (const animName of animationNames) {
                if (this.playAnimation(animName, null, 0.1)) {
                    // Create punch effect - red color for right hand
                    this.createPunchEffect('right', 0xff4500); // OrangeRed
                    return;
                }
            }
            
            // If no specific right punch animation found, try generic punch
            if (this.playAnimation('punch', 'attack', 0.1)) {
                // Create punch effect - red color for right hand
                this.createPunchEffect('right', 0xff4500); // OrangeRed
                return;
            }
        }
    }
    
    // Left hook - circular punch with left hand
    createLeftHookAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createLeftHookAnimation();
            return;
        }
        
        // If we have a GLB model with animations
        if (this.gltfModel && this.mixer) {
            // Try to play a left hook animation from the model
            const animationNames = ['leftHook', 'hookLeft', 'hook_left'];
            
            // Try each animation name
            for (const animName of animationNames) {
                if (this.playAnimation(animName, null, 0.1)) {
                    // Create punch effect - purple color for hook
                    this.createPunchEffect('left-hook', 0x9932cc); // DarkOrchid
                    return;
                }
            }
            
            // If no specific left hook animation found, try generic hook or punch
            if (this.playAnimation('hook', 'punch', 0.1)) {
                // Create punch effect - purple color for hook
                this.createPunchEffect('left-hook', 0x9932cc); // DarkOrchid
                return;
            }
        }
        
        // Fallback to geometric model animation
        const leftArm = this.modelGroup.children.find(child => 
            child.position.x < 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        const torso = this.modelGroup.children.find(child => 
            Math.abs(child.position.x) < 0.1 && Math.abs(child.position.y - 0.6) < 0.3);
        
        if (!leftArm) return;
        
        // Store original rotations
        const originalArmRotation = leftArm.rotation.clone();
        const originalTorsoRotation = torso ? torso.rotation.clone() : null;
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (rotate torso slightly)
            if (torso) {
                torso.rotation.y = -Math.PI / 12; // Rotate torso right
            }
            
            // Pull arm back and to the side
            leftArm.rotation.z = Math.PI / 8;
            leftArm.rotation.y = -Math.PI / 8;
            
            // After a short delay, execute hook
            setTimeout(() => {
                // Hook punch animation - circular motion
                leftArm.rotation.z = Math.PI / 2.5; // Extend arm
                leftArm.rotation.y = Math.PI / 6; // Swing from side
                
                if (torso) {
                    torso.rotation.y = Math.PI / 12; // Rotate torso left
                }
                
                // Create punch effect - purple color for hook
                this.createPunchEffect('left-hook', 0x9932cc); // DarkOrchid
                
                // Return to original position after the punch
                setTimeout(() => {
                    leftArm.rotation.copy(originalArmRotation);
                    if (torso && originalTorsoRotation) {
                        torso.rotation.copy(originalTorsoRotation);
                    }
                }, 200);
            }, 70);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Heavy uppercut - powerful upward punch with right hand
    createHeavyPunchAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createHeavyPunchAnimation();
            return;
        }
        
        // If we have a GLB model with animations
        if (this.gltfModel && this.mixer) {
            // Try to play an uppercut animation from the model
            const animationNames = ['uppercut', 'heavyPunch', 'heavy_punch', 'heavy_attack'];
            
            // Try each animation name
            for (const animName of animationNames) {
                if (this.playAnimation(animName, null, 0.1)) {
                    // Create heavy punch effect
                    this.createHeavyPunchEffect();
                    return;
                }
            }
            
            // If no specific uppercut animation found, try generic strong attack
            if (this.playAnimation('strong_attack', 'heavy_attack', 0.1)) {
                // Create heavy punch effect
                this.createHeavyPunchEffect();
                return;
            }
        }
        
        // Fallback to geometric model animation
        const rightArm = this.modelGroup.children.find(child => 
            child.position.x > 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        const torso = this.modelGroup.children.find(child => 
            Math.abs(child.position.x) < 0.1 && Math.abs(child.position.y - 0.6) < 0.3);
        
        if (!rightArm) return;
        
        // Store original rotations
        const originalArmRotation = rightArm.rotation.clone();
        const originalTorsoRotation = torso ? torso.rotation.clone() : null;
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (crouch slightly)
            if (torso) {
                torso.position.y -= 0.2; // Lower torso
                torso.rotation.x = Math.PI / 12; // Lean forward
            }
            
            // Pull arm down and back
            rightArm.rotation.x = Math.PI / 6; // Pull down
            rightArm.rotation.z = -Math.PI / 8; // Pull back
            
            // After a delay, execute uppercut
            setTimeout(() => {
                // Uppercut animation - upward motion
                rightArm.rotation.x = -Math.PI / 4; // Swing upward
                rightArm.rotation.z = -Math.PI / 2; // Extend arm
                
                if (torso) {
                    torso.position.y += 0.3; // Rise up
                    torso.rotation.x = -Math.PI / 12; // Lean back
                }
                
                // Create heavy punch effect - fiery red/orange for uppercut
                this.createHeavyPunchEffect();
                
                // Return to original position after the punch
                setTimeout(() => {
                    rightArm.rotation.copy(originalArmRotation);
                    if (torso && originalTorsoRotation) {
                        torso.rotation.copy(originalTorsoRotation);
                        torso.position.y -= 0.1; // Reset height
                    }
                }, 300);
            }, 100);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Standard punch effect for normal punches
    createPunchEffect(hand, color) {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createPunchEffect(hand, color);
            return;
        }
        
        // Calculate position in front of the player based on hand
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.modelGroup.rotation);
        let sideOffset = 0;
        
        // Adjust position based on which hand is punching
        if (hand === 'left') {
            sideOffset = -0.3;
        } else if (hand === 'right') {
            sideOffset = 0.3;
        } else if (hand === 'left-hook') {
            sideOffset = -0.4;
            // Adjust direction for hook punch
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
        }
        
        // Calculate final punch position
        const punchPosition = new THREE.Vector3(
            this.modelGroup.position.x + direction.x * 1.2 + (direction.z * sideOffset),
            this.modelGroup.position.y + 0.6, // At arm height
            this.modelGroup.position.z + direction.z * 1.2 - (direction.x * sideOffset)
        );
        
        // Create main punch effect (sphere)
        const punchGeometry = new THREE.SphereGeometry(0.3, 12, 12);
        const punchMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const punchMesh = new THREE.Mesh(punchGeometry, punchMaterial);
        punchMesh.position.copy(punchPosition);
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create secondary effect (ring)
        const ringGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // White color
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(punchPosition);
        ringMesh.lookAt(this.modelGroup.position); // Orient ring to face player
        
        // Add ring to scene
        this.scene.add(ringMesh);
        
        // Create impact lines (small cylinders radiating outward)
        const impactLines = [];
        const numLines = 8;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).applyEuler(new THREE.Euler(0, this.modelGroup.rotation.y, 0));
            
            const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.7
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.3));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial
            });
        }
        
        // Animate the punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.8;
        let ringScale = 1.0;
        let ringOpacity = 0.6;
        
        const animatePunch = () => {
            // Update main punch effect
            mainScale += 0.15;
            mainOpacity -= 0.06;
            punchMesh.scale.set(mainScale, mainScale, mainScale);
            punchMaterial.opacity = mainOpacity;
            
            // Update ring effect
            ringScale += 0.2;
            ringOpacity -= 0.05;
            ringMesh.scale.set(ringScale, ringScale, ringScale);
            ringMaterial.opacity = ringOpacity;
            
            // Update impact lines
            impactLines.forEach(line => {
                // Move line outward
                line.mesh.position.add(line.direction.clone().multiplyScalar(0.1));
                
                // Fade out
                line.material.opacity -= 0.05;
            });
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animatePunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                this.scene.remove(ringMesh);
                impactLines.forEach(line => this.scene.remove(line.mesh));
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMaterial.dispose();
                ringGeometry.dispose();
                ringMaterial.dispose();
                impactLines.forEach(line => {
                    line.geometry.dispose();
                    line.material.dispose();
                });
            }
        };
        
        // Start animation
        animatePunch();
    }
    
    // Special effect for the heavy uppercut (combo finisher)
    createHeavyPunchEffect() {
        // Calculate position in front of the player
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.modelGroup.rotation);
        const punchPosition = new THREE.Vector3(
            this.modelGroup.position.x + direction.x * 1.3 + (direction.z * 0.3),
            this.modelGroup.position.y + 0.8, // Slightly higher for uppercut
            this.modelGroup.position.z + direction.z * 1.3 - (direction.x * 0.3)
        );
        
        // Create main punch effect (larger sphere)
        const punchGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const punchMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300, // Fiery orange-red
            transparent: true,
            opacity: 0.9
        });
        
        const punchMesh = new THREE.Mesh(punchGeometry, punchMaterial);
        punchMesh.position.copy(punchPosition);
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create shockwave ring
        const ringGeometry = new THREE.RingGeometry(0.3, 0.6, 24);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff7700, // Orange
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(punchPosition);
        ringMesh.lookAt(this.modelGroup.position); // Orient ring to face player
        
        // Add ring to scene
        this.scene.add(ringMesh);
        
        // Create secondary smaller rings
        const smallRings = [];
        for (let i = 0; i < 3; i++) {
            const smallRingGeometry = new THREE.RingGeometry(0.1 + (i * 0.1), 0.2 + (i * 0.1), 16);
            const smallRingMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0xffff00 : (i === 1 ? 0xff9900 : 0xff3300), // Yellow to orange to red
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const smallRingMesh = new THREE.Mesh(smallRingGeometry, smallRingMaterial);
            smallRingMesh.position.copy(punchPosition);
            smallRingMesh.lookAt(this.modelGroup.position);
            
            // Add to scene and store reference
            this.scene.add(smallRingMesh);
            smallRings.push({
                mesh: smallRingMesh,
                geometry: smallRingGeometry,
                material: smallRingMaterial,
                initialScale: 1.0 + (i * 0.3)
            });
        }
        
        // Create fire particles
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            // Random direction with upward bias
            const angle = Math.random() * Math.PI * 2;
            const particleDirection = new THREE.Vector3(
                Math.cos(angle) * 0.7,
                0.5 + Math.random() * 0.5, // Upward bias
                Math.sin(angle) * 0.7
            ).normalize();
            
            // Create particle
            const size = 0.05 + Math.random() * 0.15;
            const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
            
            // Random color from yellow to red
            const colorValue = Math.random();
            let particleColor;
            if (colorValue < 0.3) {
                particleColor = 0xffff00; // Yellow
            } else if (colorValue < 0.6) {
                particleColor = 0xff9900; // Orange
            } else {
                particleColor = 0xff3300; // Red
            }
            
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position at punch point
            particle.position.copy(punchPosition);
            
            // Add to scene and store reference
            this.scene.add(particle);
            particles.push({
                mesh: particle,
                direction: particleDirection,
                speed: 0.05 + Math.random() * 0.15,
                geometry: particleGeometry,
                material: particleMaterial,
                gravity: 0.003 + Math.random() * 0.002
            });
        }
        
        // Create impact lines (thicker for heavy punch)
        const impactLines = [];
        const numLines = 12;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).applyEuler(new THREE.Euler(0, this.modelGroup.rotation.y, 0));
            
            const lineGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: 0xff5500,
                transparent: true,
                opacity: 0.8
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.4));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial
            });
        }
        
        // Animate the heavy punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.9;
        let ringScale = 1.0;
        let ringOpacity = 0.8;
        let time = 0;
        
        const animateHeavyPunch = () => {
            time += 0.05;
            
            // Update main punch effect
            mainScale += 0.2;
            mainOpacity -= 0.04;
            punchMesh.scale.set(mainScale, mainScale, mainScale);
            punchMaterial.opacity = mainOpacity;
            
            // Update main ring effect
            ringScale += 0.25;
            ringOpacity -= 0.04;
            ringMesh.scale.set(ringScale, ringScale, ringScale);
            ringMaterial.opacity = ringOpacity;
            
            // Update small rings with pulsing effect
            smallRings.forEach((ring, index) => {
                const pulseScale = ring.initialScale + Math.sin(time * 3 + index) * 0.2;
                ring.mesh.scale.set(pulseScale + (time * 0.2), pulseScale + (time * 0.2), pulseScale + (time * 0.2));
                ring.material.opacity = Math.max(0, 0.7 - (time * 0.1));
            });
            
            // Update particles
            particles.forEach(particle => {
                // Apply gravity (reduce y component)
                particle.direction.y -= particle.gravity;
                
                // Move particle
                particle.mesh.position.add(
                    particle.direction.clone().multiplyScalar(particle.speed)
                );
                
                // Fade out
                particle.material.opacity -= 0.02;
                
                // Shrink slightly
                particle.mesh.scale.multiplyScalar(0.97);
            });
            
            // Update impact lines
            impactLines.forEach(line => {
                // Move line outward faster
                line.mesh.position.add(line.direction.clone().multiplyScalar(0.15));
                
                // Fade out
                line.material.opacity -= 0.04;
            });
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animateHeavyPunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                this.scene.remove(ringMesh);
                
                smallRings.forEach(ring => {
                    this.scene.remove(ring.mesh);
                    ring.geometry.dispose();
                    ring.material.dispose();
                });
                
                particles.forEach(particle => {
                    this.scene.remove(particle.mesh);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
                
                impactLines.forEach(line => {
                    this.scene.remove(line.mesh);
                    line.geometry.dispose();
                    line.material.dispose();
                });
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMaterial.dispose();
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        // Start animation
        animateHeavyPunch();
    }
    
    createAttackEffect(direction) {
        // Create a simple attack effect (a cone)
        const attackGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const attackMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        const attackMesh = new THREE.Mesh(attackGeometry, attackMaterial);
        
        // Position and rotate attack effect
        attackMesh.position.copy(this.modelGroup.position);
        attackMesh.position.y += 1;
        attackMesh.rotation.x = Math.PI / 2;
        attackMesh.rotation.y = this.modelGroup.rotation.y;
        
        // Move attack effect forward
        attackMesh.position.x += direction.x * 1.5;
        attackMesh.position.z += direction.z * 1.5;
        
        // Add to scene
        this.scene.add(attackMesh);
        
        // Remove after delay
        setTimeout(() => {
            this.scene.remove(attackMesh);
            attackGeometry.dispose();
            attackMaterial.dispose();
        }, 300);
    }
    
    createKnockbackEffect(position) {
        // Create a shockwave effect at the knockback point
        const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.position.y += 0.1; // Slightly above ground
        ring.rotation.x = Math.PI / 2; // Flat on ground
        
        this.scene.add(ring);
        
        // Animate the shockwave
        let scale = 1.0;
        let opacity = 0.7;
        
        const animateShockwave = () => {
            scale += 0.2;
            opacity -= 0.03;
            
            ring.scale.set(scale, scale, scale);
            ringMaterial.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateShockwave);
            } else {
                this.scene.remove(ring);
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        animateShockwave();
    }
    
    getModelGroup() {
        return this.modelGroup;
    }
}