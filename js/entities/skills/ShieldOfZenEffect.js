import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Specialized effect for Shield of Zen skill
 * Creates a golden aura around the player and a transparent Buddha figure behind them
 */
export class ShieldOfZenEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.rotationSpeed = 0.5; // Rotation speed in radians per second
        this.playerPosition = null;
        this.playerDirection = null;
        this.buddhaFigure = null;
        this.aura = null;
        this.particles = [];
        this.damageReduction = 0.3; // 30% damage reduction
        this.damageReflection = 0.1; // 10% damage reflection
        this.followPlayer = true; // Flag to make the effect follow the player
    }

    /**
     * Create a Shield of Zen effect
     * @param {THREE.Vector3} position - Player position
     * @param {THREE.Vector3} direction - Player direction
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store initial position and direction
        this.playerPosition = position.clone();
        this.playerDirection = direction.clone();
        
        // Create the Shield of Zen effect
        this._createShieldOfZenEffect(effectGroup, position, direction);
        
        // Position effect at player position
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the Shield of Zen effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Player position
     * @param {THREE.Vector3} direction - Player direction
     * @private
     */
    _createShieldOfZenEffect(effectGroup, position, direction) {
        // Create the golden aura around the player
        this._createGoldenAura(effectGroup);
        
        // Create the Buddha figure behind the player
        this._createBuddhaFigure(effectGroup, direction);
        
        // Create particles for the effect
        this._createParticles(effectGroup);
    }

    /**
     * Create the golden aura around the player
     * @param {THREE.Group} effectGroup - Group to add the aura to
     * @private
     */
    _createGoldenAura(effectGroup) {
        const auraGroup = new THREE.Group();
        
        // Create the main aura sphere
        const auraGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const auraMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.4,
            emissive: this.skill.color,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        });
        
        const auraSphere = new THREE.Mesh(auraGeometry, auraMaterial);
        auraGroup.add(auraSphere);
        
        // Create energy rings around the aura
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ringGeometry = new THREE.TorusGeometry(1.5 + (i * 0.1), 0.05, 16, 64);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.7 - (i * 0.2),
                emissive: this.skill.color,
                emissiveIntensity: 1.0 - (i * 0.2)
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            
            // Set random rotation for each ring
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            
            // Store animation data
            ring.userData = {
                rotationAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize(),
                rotationSpeed: 0.2 + (Math.random() * 0.3)
            };
            
            auraGroup.add(ring);
        }
        
        // Add aura to effect group
        effectGroup.add(auraGroup);
        
        // Store reference to aura
        this.aura = auraGroup;
    }

    /**
     * Create the Buddha figure behind the player
     * @param {THREE.Group} effectGroup - Group to add the Buddha to
     * @param {THREE.Vector3} direction - Player direction
     * @private
     */
    _createBuddhaFigure(effectGroup, direction) {
        const buddhaGroup = new THREE.Group();
        
        // Create a material for the Buddha model
        const buddhaMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.6,
            emissive: this.skill.color,
            emissiveIntensity: 0.8
        });
        
        // Load the Buddha model from GLB file
        const loader = new GLTFLoader();
        loader.load('/assets/effects/buddha.glb', (gltf) => {
            // Process the loaded model
            const buddhaModel = gltf.scene;
            
            // Apply the material to all meshes in the model
            buddhaModel.traverse((child) => {
                if (child.isMesh) {
                    // Store the original material for reference if needed
                    child.userData.originalMaterial = child.material;
                    
                    // Apply our custom material
                    child.material = buddhaMaterial.clone();
                }
            });
            
            // Add the model to the group
            buddhaGroup.add(buddhaModel);
            
            // Scale the model appropriately
            buddhaModel.scale.set(1.5, 1.5, 1.5);
            
            // Initial rotation to face forward
            buddhaModel.rotation.y = Math.PI; // Rotate 180 degrees to face forward
        }, 
        // Progress callback
        (xhr) => {
            console.log(`Buddha model ${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        // Error callback
        (error) => {
            console.error('Error loading Buddha model:', error);
            
            // Fallback to a simple placeholder if loading fails
            const buddhaGeometry = new THREE.BoxGeometry(2, 3, 0.5);
            const buddhaBox = new THREE.Mesh(buddhaGeometry, buddhaMaterial);
            buddhaGroup.add(buddhaBox);
        });
        
        // Position the Buddha behind the player
        // Calculate position behind the player based on direction
        const behindPosition = direction.clone().multiplyScalar(-3); // 3 units behind
        buddhaGroup.position.copy(behindPosition);
        buddhaGroup.position.y += 1.5; // Raise the Buddha up
        
        // Make the Buddha face the player
        buddhaGroup.lookAt(new THREE.Vector3(0, buddhaGroup.position.y, 0));
        
        // Add Buddha to effect group
        effectGroup.add(buddhaGroup);
        
        // Store reference to Buddha
        this.buddhaFigure = buddhaGroup;
    }

    /**
     * Create particles for the effect
     * @param {THREE.Group} effectGroup - Group to add the particles to
     * @private
     */
    _createParticles(effectGroup) {
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random position within the aura
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 1.2 + (Math.random() * 0.5);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            // Create particle
            const particleSize = 0.05 + (Math.random() * 0.1);
            const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6 + (Math.random() * 0.4),
                emissive: this.skill.color,
                emissiveIntensity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(x, y, z);
            
            // Store animation data
            particle.userData = {
                initialPosition: new THREE.Vector3(x, y, z),
                orbitSpeed: 0.1 + (Math.random() * 0.3),
                orbitRadius: radius,
                orbitAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };
            
            effectGroup.add(particle);
            particles.push(particle);
        }
        
        // Store particles
        this.particles = particles;
    }

    /**
     * Update the Shield of Zen effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            this.dispose(); // Properly dispose of the effect when it expires
            return;
        }
        
        // If we should follow the player, update the effect's position
        if (this.followPlayer && this.skill.game && this.skill.game.player) {
            // Get the current player position
            const player = this.skill.game.player;
            const currentPlayerPosition = player.movement.getPosition().clone();
            const currentPlayerRotation = player.movement.getRotation();
            
            // Calculate current player direction
            const currentPlayerDirection = new THREE.Vector3(
                Math.sin(currentPlayerRotation.y),
                0,
                Math.cos(currentPlayerRotation.y)
            );
            
            // Update our stored player position and direction
            this.playerPosition = currentPlayerPosition;
            this.playerDirection = currentPlayerDirection;
            
            // Update the effect's position to match the player's position
            this.effect.position.copy(currentPlayerPosition);
            
            // Update the Buddha figure's position relative to the player
            if (this.buddhaFigure) {
                // Calculate position behind the player based on current direction
                const behindPosition = currentPlayerDirection.clone().multiplyScalar(-3); // 3 units behind
                this.buddhaFigure.position.copy(behindPosition);
                this.buddhaFigure.position.y += 1.5; // Raise the Buddha up
                
                // Make the Buddha face the player
                this.buddhaFigure.lookAt(new THREE.Vector3(0, this.buddhaFigure.position.y, 0));
            }
        }
        
        // IMPORTANT: Update the skill's position property to match the effect's position
        // This is crucial for collision detection in CollisionManager
        this.skill.position.copy(this.effect.position);
        
        // Update the Shield of Zen effect
        this._updateShieldOfZenEffect(delta);
    }

    /**
     * Update the Shield of Zen effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateShieldOfZenEffect(delta) {
        // Update aura rings
        if (this.aura) {
            for (let i = 1; i < this.aura.children.length; i++) { // Skip the first child (main sphere)
                const ring = this.aura.children[i];
                if (ring.userData && ring.userData.rotationAxis && ring.userData.rotationSpeed) {
                    // Rotate ring around its custom axis
                    const axis = ring.userData.rotationAxis;
                    const angle = ring.userData.rotationSpeed * delta;
                    
                    ring.rotateOnAxis(axis, angle);
                }
            }
        }
        
        // Gently rotate the Buddha figure
        if (this.buddhaFigure) {
            this.buddhaFigure.rotation.y += this.rotationSpeed * delta * 0.2;
            
            // Make the Buddha figure pulse with a gentle glow
            const pulseScale = 1.0 + 0.05 * Math.sin(this.elapsedTime * 2);
            this.buddhaFigure.scale.set(pulseScale, pulseScale, pulseScale);
            
            // Adjust opacity based on elapsed time for a pulsing effect
            const opacity = 0.6 + 0.2 * Math.sin(this.elapsedTime * 1.5);
            this.buddhaFigure.children.forEach(child => {
                if (child.material) {
                    child.material.opacity = opacity;
                }
            });
        }
        
        // Update particles
        for (const particle of this.particles) {
            if (particle.userData) {
                // Orbit around initial position
                const axis = particle.userData.orbitAxis;
                const angle = particle.userData.orbitSpeed * delta;
                
                // Apply rotation around the orbit axis
                const rotationMatrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
                particle.position.applyMatrix4(rotationMatrix);
                
                // Pulse opacity
                const opacity = 0.6 + 0.3 * Math.sin(this.elapsedTime * 2 + particle.userData.orbitSpeed * 10);
                particle.material.opacity = opacity;
            }
        }
    }

    /**
     * Enhanced dispose method to properly clean up all resources
     * Overrides the base class dispose method with more thorough cleanup
     */
    dispose() {
        if (!this.effect) return;
        
        // Clear particle references
        this.particles.length = 0;
        
        // Clear references to specific parts
        this.aura = null;
        this.buddhaFigure = null;
        
        // Recursively dispose of geometries and materials
        this.effect.traverse(child => {
            // Dispose of geometries
            if (child.geometry) {
                child.geometry.dispose();
            }
            
            // Dispose of materials
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        // Dispose of any textures
                        if (material.map) material.map.dispose();
                        if (material.normalMap) material.normalMap.dispose();
                        if (material.specularMap) material.specularMap.dispose();
                        if (material.emissiveMap) material.emissiveMap.dispose();
                        
                        // Dispose of the material itself
                        material.dispose();
                    });
                } else {
                    // Dispose of any textures
                    if (child.material.map) child.material.map.dispose();
                    if (child.material.normalMap) child.material.normalMap.dispose();
                    if (child.material.specularMap) child.material.specularMap.dispose();
                    if (child.material.emissiveMap) child.material.emissiveMap.dispose();
                    
                    // Dispose of the material itself
                    child.material.dispose();
                }
            }
            
            // Clear any userData
            if (child.userData) {
                child.userData = {};
            }
        });
        
        // Remove from parent
        if (this.effect.parent) {
            this.effect.parent.remove(this.effect);
        }
        
        // Clear references
        this.effect = null;
        this.isActive = false;
        this.playerPosition = null;
    }
    
    /**
     * Override the reset method to properly clean up all resources
     */
    reset() {
        // Call the dispose method to clean up resources
        this.dispose();
        
        // Reset state variables
        this.isActive = false;
        this.elapsedTime = 0;
    }
}