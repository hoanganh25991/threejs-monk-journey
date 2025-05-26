/**
 * PlayerModel.js
 * Handles the player's 3D model and animations, including loading, positioning,
 * scaling, and animating the player character in the game world.
 * 
 * This class is responsible for:
 * - Loading and managing 3D models from GLTF files
 * - Handling model animations and transitions between them
 * - Managing model position, rotation, and scale
 * - Creating visual effects for player attacks
 * - Providing fallback models when primary models fail to load
 * - Supporting model customization and adjustments
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CHARACTER_MODELS, DEFAULT_CHARACTER_MODEL } from '../../config/player-models.js';
import * as AnimationUtils from '../../utils/AnimationUtils.js';
import { PlayerAttackEffect } from './PlayerAttackEffect.js';

/**
 * @typedef {Object} ModelAdjustment
 * @property {Object} position - Position adjustment for the model
 * @property {number} position.x - X position adjustment
 * @property {number} position.y - Y position adjustment
 * @property {number} position.z - Z position adjustment
 * @property {Object} rotation - Rotation adjustment for the model
 * @property {number} rotation.x - X rotation adjustment in radians
 * @property {number} rotation.y - Y rotation adjustment in radians
 * @property {number} rotation.z - Z rotation adjustment in radians
 * @property {number} [heightOffset] - Optional height offset for player movement
 */

/**
 * @typedef {Object} ModelConfig
 * @property {string} id - Unique identifier for the model
 * @property {string} name - Display name of the model
 * @property {string} path - File path to the 3D model
 * @property {number} baseScale - Base scale factor for the model
 * @property {number} multiplier - Size multiplier for the model
 * @property {ModelAdjustment} [defaultAdjustments] - Default position and rotation adjustments
 * @property {Object} [preview] - Preview settings for the model in character selection
 * @property {Object} [preview.position] - Preview position
 * @property {Object} [preview.rotation] - Preview rotation
 */

/**
 * Class responsible for managing the player's 3D model and animations
 * @extends IPlayerModel
 * 
 * @property {THREE.Scene} scene - The Three.js scene where the model will be rendered
 * @property {THREE.Group} modelGroup - Group containing the player model and effects
 * @property {THREE.Object3D} gltfModel - The loaded GLTF model
 * @property {THREE.AnimationMixer} mixer - Animation mixer for the model
 * @property {Object.<string, THREE.AnimationAction>} animations - Map of animation names to animation actions
 * @property {string} currentAnimation - Name of the currently playing animation
 * @property {boolean} usingFallbackModel - Flag indicating if fallback model is being used
 * @property {import("../../game/Game.js").Game} game - Reference to the main game instance
 * @property {PlayerAttackEffect} attackEffect - Handler for creating visual attack effects
 * @property {string} currentModelId - ID of the currently loaded model
 * @property {ModelConfig} currentModel - Configuration for the current model
 * @property {number} baseScale - Base scale factor for the model
 * @property {number} sizeMultiplier - Size multiplier applied to the model
 * @property {number} modelScale - Effective scale (baseScale * sizeMultiplier)
 * @property {string} modelPath - Path to the 3D model file
 * @property {number} verticalLookDirection - Current vertical look direction (-1 to 1)
 */
export class PlayerModel {
    /**
     * Creates a new PlayerModel instance
     * @param {THREE.Scene} scene - The Three.js scene where the model will be rendered
     * @param {import("../../game/Game.js").Game} [game=null] - Reference to the main game instance
     */
    constructor(scene, game = null) {
        this.scene = scene;
        this.modelGroup = null;
        this.gltfModel = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.game = game; // Reference to the game
        // We'll use the game's clock instead of creating our own
        
        // Create the attack effect handler
        this.attackEffect = new PlayerAttackEffect(scene);
        
        // Try to load model ID from localStorage, or use default
        this.currentModelId = localStorage.getItem('monk_journey_character_model') || DEFAULT_CHARACTER_MODEL;
        this.currentModel = this.getModelConfig(this.currentModelId);
        
        // Configuration options
        this.baseScale = this.currentModel.baseScale; // Base scale factor for the model
        this.sizeMultiplier = this.currentModel.multiplier; // Size multiplier
        this.modelScale = this.baseScale * this.sizeMultiplier; // Effective scale
        this.modelPath = this.currentModel.path; // Path to the 3D model
    }
    
    // setGame method removed - game is now passed in constructor
    
    /**
     * Get model configuration by ID
     * @param {string} modelId - The ID of the model to get
     * @returns {Object} The model configuration
     */
    getModelConfig(modelId) {
        const model = CHARACTER_MODELS.find(m => m.id === modelId);
        return model || CHARACTER_MODELS.find(m => m.id === DEFAULT_CHARACTER_MODEL);
    }
    
    /**
     * Creates and loads the player's 3D model
     * @async
     * @returns {Promise<THREE.Group>} The model group containing the player model
     */
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
        }
        
        return this.modelGroup;
    }
    

    
    /**
     * Updates the model's animations based on player state
     * @param {number} delta - Time in seconds since the last update
     * @param {import("../player/PlayerState.js").PlayerState} playerState - Current state of the player
     * @returns {void}
     */
    updateAnimations(delta, playerState) {
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
    
    /**
     * Plays an animation with crossfade transition
     * @param {string} primaryName - Name of the primary animation to play
     * @param {string} fallbackName - Name of the fallback animation if primary is not found
     * @param {number} [transitionDuration=0.5] - Duration of the crossfade transition in seconds
     * @returns {boolean} True if animation was found and played, false otherwise
     */
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
    
    /**
     * Sets the position of the model in the scene
     * @param {THREE.Vector3} position - The new position vector
     * @returns {void}
     */
    setPosition(position) {
        if (this.modelGroup) {
            this.modelGroup.position.copy(position);
            console.debug("PlayerModel: Position updated to:", this.modelGroup.position);
        }
    }
    
    /**
     * Sets the rotation of the model in the scene
     * @param {Object} rotation - The rotation object with x, y, z properties
     * @returns {void}
     */
    setRotation(rotation) {
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
                
                console.debug("Applied vertical look rotation to head bone:", 
                    THREE.MathUtils.radToDeg(rotationAngle) + "°", 
                    "from vertical direction:", verticalDirection);
            }
            
            // Apply smaller rotation to neck bone if found and head bone wasn't
            if (neckBone && !headBone) {
                // Use a smaller angle for the neck
                const maxNeckAngle = THREE.MathUtils.degToRad(20);
                const neckRotation = verticalDirection * maxNeckAngle;
                
                neckBone.rotation.x = neckRotation;
                
                console.debug("Applied vertical look rotation to neck bone:", 
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
    
    /**
     * Creates a left jab animation (quick straight punch with left hand)
     * @returns {void}
     */
    createLeftPunchAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createLeftPunchAnimation();
            return;
        }
        
        // If we have a GLB model with animations, use the attack effect handler
        if (this.gltfModel && this.mixer) {
            // Create a function that will be passed to the attack effect handler
            const playAnimationFunc = (primaryName, fallbackName, transitionDuration) => {
                return this.playAnimation(primaryName, fallbackName, transitionDuration);
            };
            
            // Delegate to the attack effect handler
            this.attackEffect.createLeftPunchAnimation(
                this.modelGroup, 
                this.animations, 
                this.currentAnimation, 
                playAnimationFunc
            );
        }
    }
    
    /**
     * Creates a right cross animation (powerful straight punch with right hand)
     * @returns {void}
     */
    createRightPunchAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createRightPunchAnimation();
            return;
        }
        
        // If we have a GLB model with animations, use the attack effect handler
        if (this.gltfModel && this.mixer) {
            // Create a function that will be passed to the attack effect handler
            const playAnimationFunc = (primaryName, fallbackName, transitionDuration) => {
                return this.playAnimation(primaryName, fallbackName, transitionDuration);
            };
            
            // Delegate to the attack effect handler
            this.attackEffect.createRightPunchAnimation(
                this.modelGroup, 
                this.animations, 
                this.currentAnimation, 
                playAnimationFunc
            );
        }
    }
    
    /**
     * Creates a left hook animation (circular punch with left hand)
     * @returns {void}
     */
    createLeftHookAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createLeftHookAnimation();
            return;
        }
        
        // If we have a GLB model with animations, use the attack effect handler
        if (this.gltfModel && this.mixer) {
            // Create a function that will be passed to the attack effect handler
            const playAnimationFunc = (primaryName, fallbackName, transitionDuration) => {
                return this.playAnimation(primaryName, fallbackName, transitionDuration);
            };
            
            // Delegate to the attack effect handler
            this.attackEffect.createLeftHookAnimation(
                this.modelGroup, 
                this.animations, 
                this.currentAnimation, 
                playAnimationFunc
            );
        }
    }
    
    /**
     * Creates a heavy uppercut animation (powerful upward punch with right hand)
     * @returns {void}
     */
    createHeavyPunchAnimation() {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createHeavyPunchAnimation();
            return;
        }
        
        // If we have a GLB model with animations, use the attack effect handler
        if (this.gltfModel && this.mixer) {
            // Create a function that will be passed to the attack effect handler
            const playAnimationFunc = (primaryName, fallbackName, transitionDuration) => {
                return this.playAnimation(primaryName, fallbackName, transitionDuration);
            };
            
            // Delegate to the attack effect handler
            this.attackEffect.createHeavyPunchAnimation(
                this.modelGroup, 
                this.animations, 
                this.currentAnimation, 
                playAnimationFunc
            );
        }
    }
    
    /**
     * Creates a standard punch effect for normal punches
     * @param {string} hand - Which hand is punching ('left' or 'right')
     * @param {number} color - Color of the punch effect (hex value)
     * @returns {void}
     */
    createPunchEffect(hand, color) {
        // If using fallback model, delegate to it
        if (this.usingFallbackModel && this.fallbackModel) {
            this.fallbackModel.createPunchEffect(hand, color);
            return;
        }
        
        // Delegate to the attack effect handler
        this.attackEffect.createPunchEffect(this.modelGroup, hand, color);
    }
    
    /**
     * Creates a special effect for the heavy uppercut (combo finisher)
     * @returns {void}
     */
    createHeavyPunchEffect() {
        // Delegate to the attack effect handler
        this.attackEffect.createHeavyPunchEffect(this.modelGroup);
    }
    
    /**
     * Creates an attack effect in the specified direction
     * @param {string} direction - Direction of the attack ('forward', 'left', 'right', etc.)
     * @returns {void}
     */
    createAttackEffect(direction) {
        // Delegate to the attack effect handler
        this.attackEffect.createAttackEffect(this.modelGroup, direction);
    }
    
    /**
     * Creates a knockback effect at the specified position
     * @param {THREE.Vector3} position - Position where the knockback effect should be created
     * @returns {void}
     */
    createKnockbackEffect(position) {
        // Delegate to the attack effect handler
        this.attackEffect.createKnockbackEffect(position);
    }
    
    /**
     * Gets the model group containing the player model
     * @returns {THREE.Group} The model group
     */
    getModelGroup() {
        return this.modelGroup;
    }
}