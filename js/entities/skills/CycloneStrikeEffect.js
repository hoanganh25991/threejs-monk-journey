import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for Cyclone Strike skill
 */
export class CycloneStrikeEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.cycloneState = null;
    }

    /**
     * Create a Cyclone Strike effect
     * @param {THREE.Vector3} position - Center position
     * @param {THREE.Vector3} direction - Direction (for oriented AoEs)
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create the Cyclone Strike effect
        this.createCycloneStrikeEffect(effectGroup);
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the Cyclone Strike special effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    createCycloneStrikeEffect(effectGroup) {
        // Create a tornado/cyclone effect
        const cycloneGroup = new THREE.Group();
        
        // Create the base of the cyclone - now smaller
        const baseRadius = this.skill.radius * 0.4; // Reduced base radius
        const baseHeight = 0.2;
        const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.8, baseHeight, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            metalness: 0.2,
            roughness: 0.8,
            side: THREE.DoubleSide
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = baseHeight / 2;
        cycloneGroup.add(base);
        
        // Create the main cyclone body with multiple layers
        const layerCount = 10;
        const maxHeight = 4;
        const spiralFactor = 0.2; // Controls how much the cyclone spirals
        
        for (let i = 0; i < layerCount; i++) {
            const layerHeight = 0.4;
            const heightPosition = baseHeight + (i * layerHeight);
            // Gradually increase radius as we go up (reversed from original)
            const layerRadius = baseRadius * (1 + (i / layerCount) * 1.5);
            
            const layerGeometry = new THREE.TorusGeometry(layerRadius, 0.2, 16, 32);
            const layerMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6 - (i * 0.05), // Gradually decrease opacity
                metalness: 0.3,
                roughness: 0.7,
                side: THREE.DoubleSide
            });
            
            const layer = new THREE.Mesh(layerGeometry, layerMaterial);
            layer.position.y = heightPosition;
            layer.rotation.x = Math.PI / 2; // Lay flat
            layer.rotation.z = i * spiralFactor; // Create spiral effect
            
            // Store initial position and rotation for animation
            layer.userData = {
                initialHeight: heightPosition,
                rotationSpeed: 2 + (i * 0.5), // Layers rotate at different speeds
                verticalSpeed: 0.5 + (Math.random() * 0.5)
            };
            
            cycloneGroup.add(layer);
        }
        
        // Add wind/dust particles swirling around the cyclone
        const particleCount = 50 * 1.5;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random position around the cyclone
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * maxHeight;
            
            // Calculate distance based on height - particles further out at higher heights
            // This creates a cone shape matching our inverted cyclone
            const heightRatio = height / maxHeight;
            const maxDistanceAtHeight = baseRadius * (1 + heightRatio * 2.5) * 1.2;
            const distance = (Math.random() * maxDistanceAtHeight * 0.8) + (maxDistanceAtHeight * 0.2);
            
            // Create particle
            const particleSize = 0.05 + (Math.random() * 0.15);
            let particleGeometry;
            
            // Vary particle shapes
            const shapeType = Math.floor(Math.random() * 3);
            if (shapeType === 0) {
                particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
            } else if (shapeType === 1) {
                particleGeometry = new THREE.BoxGeometry(
                    particleSize * 2, 
                    particleSize * 2, 
                    particleSize * 2
                );
            } else {
                particleGeometry = new THREE.TetrahedronGeometry(particleSize * 1.5);
            }
            
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.4 + (Math.random() * 0.4),
                metalness: 0.2,
                roughness: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            // Random rotation
            particle.rotation.x = Math.random() * Math.PI * 2;
            particle.rotation.y = Math.random() * Math.PI * 2;
            particle.rotation.z = Math.random() * Math.PI * 2;
            
            // Store initial position and animation parameters
            particle.userData = {
                initialAngle: angle,
                initialDistance: distance,
                initialHeight: height,
                rotationSpeed: 0.5 + (Math.random() * 2),
                verticalSpeed: 0.2 + (Math.random() * 0.8),
                orbitSpeed: 1 + (Math.random() * 2)
            };
            
            particles.push(particle);
            cycloneGroup.add(particle);
        }
        
        // Add the cyclone group to the effect group
        effectGroup.add(cycloneGroup);
        
        // Store animation state
        this.cycloneState = {
            age: 0,
            phase: 'growing', // 'growing', 'stable', 'dissipating'
            layers: [],
            particles: particles
        };
        
        // Store layer references for animation
        for (let i = 0; i < cycloneGroup.children.length; i++) {
            const child = cycloneGroup.children[i];
            if (child.userData && child.userData.rotationSpeed) {
                this.cycloneState.layers.push(child);
            }
        }
    }

    /**
     * Update the Cyclone Strike effect
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
        
        // IMPORTANT: Update the skill's position property to match the effect's position
        // This is crucial for collision detection in CollisionManager
        this.skill.position.copy(this.effect.position);
        
        // Update the Cyclone Strike effect
        this.updateCycloneStrikeEffect(delta);
    }

    /**
     * Update the Cyclone Strike special effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    updateCycloneStrikeEffect(delta) {
        // Update cyclone state
        this.cycloneState.age += delta;
        
        // Determine current phase based on elapsed time
        const growDuration = this.skill.duration * 0.2; // First 20% is growing
        const stableDuration = this.skill.duration * 0.6; // Middle 60% is stable
        // Last 20% is dissipating
        
        if (this.elapsedTime < growDuration) {
            this.cycloneState.phase = 'growing';
        } else if (this.elapsedTime < growDuration + stableDuration) {
            this.cycloneState.phase = 'stable';
        } else {
            this.cycloneState.phase = 'dissipating';
        }
        
        // Calculate phase progress (0 to 1)
        let phaseProgress;
        if (this.cycloneState.phase === 'growing') {
            phaseProgress = this.elapsedTime / growDuration;
        } else if (this.cycloneState.phase === 'stable') {
            phaseProgress = (this.elapsedTime - growDuration) / stableDuration;
        } else {
            phaseProgress = (this.elapsedTime - growDuration - stableDuration) / (this.skill.duration - growDuration - stableDuration);
        }
        
        // Get the cyclone group (first child of effect group)
        const cycloneGroup = this.effect.children[0];
        
        // Scale the entire effect based on phase
        let scale = 1.0;
        if (this.cycloneState.phase === 'growing') {
            scale = phaseProgress;
        } else if (this.cycloneState.phase === 'dissipating') {
            scale = 1.0 - phaseProgress;
        }
        
        cycloneGroup.scale.set(scale, scale, scale);
        
        // Animate cyclone layers
        for (const layer of this.cycloneState.layers) {
            if (layer.userData) {
                // Rotate layer
                layer.rotation.z += layer.userData.rotationSpeed * delta;
                
                // Oscillate height
                const heightOffset = Math.sin(this.cycloneState.age * layer.userData.verticalSpeed) * 0.2;
                layer.position.y = layer.userData.initialHeight + heightOffset;
            }
        }
        
        // Animate particles
        for (const particle of this.cycloneState.particles) {
            if (particle.userData) {
                // Orbit around the center
                const orbitSpeed = particle.userData.orbitSpeed;
                const newAngle = particle.userData.initialAngle + (this.cycloneState.age * orbitSpeed);
                
                // Calculate new position
                particle.position.x = Math.cos(newAngle) * particle.userData.initialDistance;
                particle.position.z = Math.sin(newAngle) * particle.userData.initialDistance;
                
                // Oscillate height
                const heightOffset = Math.sin(this.cycloneState.age * particle.userData.verticalSpeed) * 0.5;
                particle.position.y = particle.userData.initialHeight + heightOffset;
                
                // Rotate particle
                particle.rotation.x += delta * particle.userData.rotationSpeed;
                particle.rotation.y += delta * particle.userData.rotationSpeed * 0.7;
                particle.rotation.z += delta * particle.userData.rotationSpeed * 0.5;
            }
        }
    }

    /**
     * Enhanced dispose method to properly clean up all resources
     * Overrides the base class dispose method with more thorough cleanup
     */
    dispose() {
        if (!this.effect) return;
        
        // Clean up Cyclone Strike specific resources
        if (this.cycloneState) {
            // Clear layer references
            if (this.cycloneState.layers) {
                this.cycloneState.layers.length = 0;
            }
            
            // Clear particle references
            if (this.cycloneState.particles) {
                this.cycloneState.particles.length = 0;
            }
            
            // Clear cyclone state
            this.cycloneState = null;
        }
        
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