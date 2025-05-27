/**
 * RemotePlayer.js
 * Represents a remote player in the multiplayer game
 */

import * as THREE from 'three';
import { DEFAULT_CHARACTER_MODEL } from '../config/player-models.js';

export class RemotePlayer {
    /**
     * Initialize a remote player
     * @param {Game} game - The main game instance
     * @param {string} peerId - The ID of the remote player
     * @param {string} [playerColor] - The color assigned to the player
     */
    constructor(game, peerId, playerColor) {
        this.game = game;
        this.peerId = peerId;
        this.model = null;
        this.mixer = null;
        this.animations = new Map();
        this.currentAnimation = null;
        this.targetPosition = new THREE.Vector3();
        this.targetRotation = new THREE.Euler();
        this.interpolationFactor = 0.1; // Smoothing factor for movement
        this.nameTag = null;
        this.playerColor = playerColor || '#FFFFFF'; // Default to white if no color provided
        this.colorIndicator = null;
        
        // Create a group to hold the player model and name tag
        this.group = new THREE.Group();
        this.game.scene.add(this.group);
    }
    
    /**
     * Initialize the remote player
     */
    async init() {
        try {
            // Clone the player model
            await this.clonePlayerModel();
            
            // Create name tag
            this.createNameTag();
            
            // Create color indicator
            this.createColorIndicator();
        } catch (error) {
            console.error(`Error initializing remote player ${this.peerId}:`, error);
        }
    }
    
    /**
     * Create a color indicator circle around the player's feet
     */
    createColorIndicator() {
        // Create a ring geometry for the indicator
        const geometry = new THREE.RingGeometry(0.6, 0.8, 32);
        
        // Create a material with the player's color
        const material = new THREE.MeshBasicMaterial({ 
            color: this.playerColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        // Create the mesh
        this.colorIndicator = new THREE.Mesh(geometry, material);
        
        // Rotate to lay flat on the ground
        this.colorIndicator.rotation.x = -Math.PI / 2;
        
        // Position slightly above ground to avoid z-fighting
        this.colorIndicator.position.y = 0.02;
        
        // Add to group
        this.group.add(this.colorIndicator);
    }
    
    /**
     * Clone the player model from the main player
     */
    async clonePlayerModel() {
        try {
            // Use the same model as the local player
            const modelId = window.selectedModelId || DEFAULT_CHARACTER_MODEL;
            
            // If the game has a player model, clone it
            if (this.game.player && this.game.player.model) {
                // Clone the model
                this.model = this.game.player.model.clone();
                
                // Add to group
                this.group.add(this.model);
                
                // Set up animations
                this.setupAnimations();
            } else {
                // Create a simple placeholder model
                const geometry = new THREE.BoxGeometry(1, 2, 1);
                const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                this.model = new THREE.Mesh(geometry, material);
                this.group.add(this.model);
            }
        } catch (error) {
            console.error(`Error cloning player model for remote player ${this.peerId}:`, error);
            
            // Create a simple placeholder model as fallback
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            this.model = new THREE.Mesh(geometry, material);
            this.group.add(this.model);
        }
    }
    
    /**
     * Set up animations for the remote player
     */
    setupAnimations() {
        try {
            // If the model has animations, set up the mixer
            if (this.model && this.model.animations && this.model.animations.length > 0) {
                // Create animation mixer
                this.mixer = new THREE.AnimationMixer(this.model);
                
                // Store animations
                this.model.animations.forEach(animation => {
                    const action = this.mixer.clipAction(animation);
                    this.animations.set(animation.name, action);
                });
                
                // Set default animation
                this.playAnimation('idle');
            }
        } catch (error) {
            console.error(`Error setting up animations for remote player ${this.peerId}:`, error);
        }
    }
    
    /**
     * Create a name tag for the remote player
     */
    createNameTag() {
        // Create a canvas for the name tag
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        // Draw background
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border with player color
        context.strokeStyle = this.playerColor;
        context.lineWidth = 3;
        context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        
        // Draw text
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`Player ${this.peerId.substring(0, 8)}`, canvas.width / 2, canvas.height / 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ map: texture });
        
        // Create sprite
        this.nameTag = new THREE.Sprite(material);
        this.nameTag.scale.set(2, 0.5, 1);
        this.nameTag.position.y = 3; // Position above player
        
        // Add to group
        this.group.add(this.nameTag);
    }
    
    /**
     * Update the remote player's position
     * @param {Object} position - The new position
     */
    updatePosition(position) {
        if (!position) {
            console.log(`[RemotePlayer ${this.peerId}] Received null position`);
            return;
        }
        
        // Set target position
        console.log(`[RemotePlayer ${this.peerId}] Setting target position:`, position);
        this.targetPosition.set(position.x, position.y, position.z);
    }
    
    /**
     * Update the remote player's rotation
     * @param {Object} rotation - The new rotation
     */
    updateRotation(rotation) {
        if (!rotation) return;
        
        // Set target rotation
        this.targetRotation.set(rotation.x, rotation.y, rotation.z);
    }
    
    /**
     * Update the remote player's animation
     * @param {string} animation - The new animation name
     */
    updateAnimation(animation) {
        if (!animation) {
            console.log(`[RemotePlayer ${this.peerId}] Received null animation`);
            return;
        }
        
        if (animation === this.currentAnimation) {
            console.log(`[RemotePlayer ${this.peerId}] Animation unchanged: ${animation}`);
            return;
        }
        
        // Play the new animation
        console.log(`[RemotePlayer ${this.peerId}] Playing new animation: ${animation}`);
        this.playAnimation(animation);
    }
    
    /**
     * Set the player's color
     * @param {string} color - The color to set
     */
    setPlayerColor(color) {
        if (!color) return;
        
        // Update stored color
        this.playerColor = color;
        
        // Update color indicator if it exists
        if (this.colorIndicator && this.colorIndicator.material) {
            this.colorIndicator.material.color.set(color);
        } else {
            // Create color indicator if it doesn't exist
            this.createColorIndicator();
        }
        
        // Update name tag color if it exists
        if (this.nameTag && this.nameTag.material && this.nameTag.material.map) {
            // Redraw the name tag with the new color
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            // Draw background
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw border with player color
            context.strokeStyle = this.playerColor;
            context.lineWidth = 3;
            context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
            
            // Draw text
            context.fillStyle = '#ffffff';
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(`Player ${this.peerId.substring(0, 8)}`, canvas.width / 2, canvas.height / 2);
            
            // Update texture
            this.nameTag.material.map.dispose();
            this.nameTag.material.map = new THREE.CanvasTexture(canvas);
            this.nameTag.material.needsUpdate = true;
        }
    }
    
    /**
     * Play an animation
     * @param {string} name - The name of the animation to play
     */
    playAnimation(name) {
        if (!this.mixer || !this.animations.has(name)) return;
        
        // Stop current animation
        if (this.currentAnimation && this.animations.has(this.currentAnimation)) {
            const currentAction = this.animations.get(this.currentAnimation);
            currentAction.fadeOut(0.2);
        }
        
        // Play new animation
        const newAction = this.animations.get(name);
        newAction.reset().fadeIn(0.2).play();
        
        // Update current animation
        this.currentAnimation = name;
    }
    
    /**
     * Update the remote player
     * @param {number} deltaTime - Time elapsed since the last frame
     */
    update(deltaTime) {
        // Interpolate position
        this.group.position.lerp(this.targetPosition, this.interpolationFactor);
        
        // Interpolate rotation
        if (this.model) {
            // Create quaternions for smooth rotation
            const currentQuaternion = new THREE.Quaternion().setFromEuler(this.model.rotation);
            const targetQuaternion = new THREE.Quaternion().setFromEuler(this.targetRotation);
            
            // Interpolate quaternions
            currentQuaternion.slerp(targetQuaternion, this.interpolationFactor);
            
            // Apply rotation
            this.model.quaternion.copy(currentQuaternion);
        }
        
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Make name tag face the camera
        if (this.nameTag && this.game.camera) {
            this.nameTag.lookAt(this.game.camera.position);
        }
    }
    
    /**
     * Dispose of the remote player
     */
    dispose() {
        // Remove from scene
        this.game.scene.remove(this.group);
        
        // Dispose of geometries and materials
        if (this.model) {
            this.model.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        
        // Dispose of name tag
        if (this.nameTag && this.nameTag.material) {
            if (this.nameTag.material.map) this.nameTag.material.map.dispose();
            this.nameTag.material.dispose();
        }
        
        // Dispose of color indicator
        if (this.colorIndicator && this.colorIndicator.material) {
            this.colorIndicator.geometry.dispose();
            this.colorIndicator.material.dispose();
        }
        
        // Clear references
        this.model = null;
        this.mixer = null;
        this.animations.clear();
        this.nameTag = null;
        this.colorIndicator = null;
        this.group = null;
    }
}