import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for Flying Dragon skill
 */
export class FlyingDragonEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.flightSpeed = 12; // Units per second
        this.initialPosition = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.distanceTraveled = 0;
        this.kickCount = 0;
        this.maxKicks = 7; // Number of kicks to perform
        this.kickInterval = 0.3; // Time between kicks
        this.timeSinceLastKick = 0;
    }

    /**
     * Create a Flying Dragon effect
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to travel
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store initial position and direction for movement
        this.initialPosition.copy(position);
        this.direction.copy(direction);
        this.distanceTraveled = 0;
        this.kickCount = 0;
        this.timeSinceLastKick = 0;
        
        // Create the Flying Dragon effect
        this.createFlyingDragonEffect(effectGroup);
        
        // Position effect
        effectGroup.position.copy(position);
        effectGroup.position.y += 1.5; // Start slightly above ground
        effectGroup.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the Flying Dragon special effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    createFlyingDragonEffect(effectGroup) {
        // Create dragon aura
        const auraGroup = new THREE.Group();
        
        // Create dragon-shaped energy field
        const dragonBodyGeometry = new THREE.CylinderGeometry(0.5, 0.3, 3, 8);
        const dragonBodyMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color || 0xff6600,
            emissive: this.skill.color || 0xff6600,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const dragonBody = new THREE.Mesh(dragonBodyGeometry, dragonBodyMaterial);
        dragonBody.rotation.x = Math.PI / 2;
        auraGroup.add(dragonBody);
        
        // Create dragon head
        const dragonHeadGeometry = new THREE.ConeGeometry(0.7, 1.5, 8);
        const dragonHeadMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color || 0xff6600,
            emissive: this.skill.color || 0xff6600,
            emissiveIntensity: 1.8,
            transparent: true,
            opacity: 0.8
        });
        
        const dragonHead = new THREE.Mesh(dragonHeadGeometry, dragonHeadMaterial);
        dragonHead.position.set(0, 0, -2);
        dragonHead.rotation.x = -Math.PI / 2;
        auraGroup.add(dragonHead);
        
        // Create dragon wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(1, 1, 2, 0);
        wingShape.quadraticCurveTo(1, -0.5, 0, 0);
        
        const wingGeometry = new THREE.ShapeGeometry(wingShape);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color || 0xff6600,
            emissive: this.skill.color || 0xff6600,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        // Left wing
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.5, 0, -1);
        leftWing.rotation.y = Math.PI / 2;
        leftWing.rotation.z = Math.PI / 4;
        leftWing.scale.set(1.5, 1.5, 1.5);
        auraGroup.add(leftWing);
        
        // Right wing
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.5, 0, -1);
        rightWing.rotation.y = -Math.PI / 2;
        rightWing.rotation.z = -Math.PI / 4;
        rightWing.scale.set(1.5, 1.5, 1.5);
        auraGroup.add(rightWing);
        
        // Create energy particles around the dragon
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random position around the dragon
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5 + Math.random() * 1.0;
            const height = (Math.random() * 3) - 1.5;
            
            // Create particle
            const particleSize = 0.05 + Math.random() * 0.1;
            const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color || 0xff6600,
                emissive: this.skill.color || 0xff6600,
                emissiveIntensity: 2,
                transparent: true,
                opacity: 0.7 + Math.random() * 0.3
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            particle.userData = {
                initialPos: particle.position.clone(),
                speed: 0.5 + Math.random() * 1.5,
                direction: new THREE.Vector3(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ).normalize()
            };
            
            auraGroup.add(particle);
            particles.push(particle);
        }
        
        // Create kick effect (initially hidden)
        const kickGroup = new THREE.Group();
        kickGroup.visible = false;
        
        // Create kick energy wave
        const kickWaveGeometry = new THREE.CylinderGeometry(0, 1.5, 2, 8);
        const kickWaveMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color || 0xff6600,
            emissive: this.skill.color || 0xff6600,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const kickWave = new THREE.Mesh(kickWaveGeometry, kickWaveMaterial);
        kickWave.rotation.x = Math.PI / 2;
        kickGroup.add(kickWave);
        
        // Add the groups to the effect group
        effectGroup.add(auraGroup);
        effectGroup.add(kickGroup);
        
        // Store animation state
        this.dragonState = {
            auraGroup: auraGroup,
            kickGroup: kickGroup,
            particles: particles,
            phase: 'rising', // 'rising', 'kicking', 'descending'
            height: 0,
            maxHeight: 5, // Maximum height to rise
            kicksPerformed: 0
        };
    }

    /**
     * Update the Flying Dragon effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        this.timeSinceLastKick += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            this.dispose();
            return;
        }
        
        // Move forward
        const moveDistance = this.flightSpeed * delta;
        this.effect.position.x += this.direction.x * moveDistance;
        this.effect.position.z += this.direction.z * moveDistance;
        
        // IMPORTANT: Update the skill's position property to match the effect's position
        this.skill.position.copy(this.effect.position);
        
        // Update distance traveled
        this.distanceTraveled += moveDistance;
        
        this.updateFlyingDragonEffect(delta);
    }

    /**
     * Update the Flying Dragon special effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    updateFlyingDragonEffect(delta) {
        if (!this.dragonState) return;
        
        const { auraGroup, kickGroup, particles, phase } = this.dragonState;
        
        // Update dragon flight animation based on phase
        switch (phase) {
            case 'rising':
                // Rise up to maximum height
                this.dragonState.height += delta * 5;
                this.effect.position.y = this.initialPosition.y + this.dragonState.height;
                
                // Transition to kicking phase when max height is reached
                if (this.dragonState.height >= this.dragonState.maxHeight) {
                    this.dragonState.phase = 'kicking';
                }
                break;
                
            case 'kicking':
                // Perform kicks at intervals
                if (this.timeSinceLastKick >= this.kickInterval && this.kickCount < this.maxKicks) {
                    this.performKick();
                    this.timeSinceLastKick = 0;
                    this.kickCount++;
                    this.dragonState.kicksPerformed++;
                }
                
                // Transition to descending phase after all kicks
                if (this.dragonState.kicksPerformed >= this.maxKicks) {
                    this.dragonState.phase = 'descending';
                }
                break;
                
            case 'descending':
                // Descend back to ground
                this.dragonState.height -= delta * 5;
                this.effect.position.y = this.initialPosition.y + Math.max(0, this.dragonState.height);
                
                // End effect when reaching ground
                if (this.dragonState.height <= 0) {
                    this.isActive = false;
                }
                break;
        }
        
        // Animate dragon body
        if (auraGroup) {
            auraGroup.rotation.y += delta * 2;
        }
        
        // Animate particles
        for (const particle of particles) {
            if (particle.userData) {
                const initialPos = particle.userData.initialPos;
                const speed = particle.userData.speed;
                const direction = particle.userData.direction;
                
                // Oscillate position
                particle.position.set(
                    initialPos.x + Math.sin(this.elapsedTime * speed) * direction.x * 0.3,
                    initialPos.y + Math.sin(this.elapsedTime * speed) * direction.y * 0.3,
                    initialPos.z + Math.sin(this.elapsedTime * speed) * direction.z * 0.3
                );
            }
        }
        
        // Animate kick effect
        if (kickGroup && kickGroup.visible) {
            // Expand and fade kick wave
            const kickWave = kickGroup.children[0];
            if (kickWave) {
                kickWave.scale.x += delta * 3;
                kickWave.scale.y += delta * 3;
                kickWave.scale.z += delta * 3;
                
                if (kickWave.material) {
                    kickWave.material.opacity -= delta * 2;
                    
                    // Hide kick when fully faded
                    if (kickWave.material.opacity <= 0) {
                        kickGroup.visible = false;
                        // Reset kick wave for next use
                        kickWave.scale.set(1, 1, 1);
                        kickWave.material.opacity = 0.7;
                    }
                }
            }
        }
    }
    
    /**
     * Perform a kick animation
     * @private
     */
    performKick() {
        if (!this.dragonState || !this.dragonState.kickGroup) return;
        
        const kickGroup = this.dragonState.kickGroup;
        
        // Position kick effect in front of the dragon
        kickGroup.position.set(0, 0, -2);
        
        // Show kick effect
        kickGroup.visible = true;
        
        // Reset kick wave
        const kickWave = kickGroup.children[0];
        if (kickWave) {
            kickWave.scale.set(1, 1, 1);
            if (kickWave.material) {
                kickWave.material.opacity = 0.7;
            }
        }
    }

    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        if (!this.effect) return;
        
        // Clean up Flying Dragon specific resources
        if (this.dragonState) {
            // Clear particle references
            if (this.dragonState.particles) {
                this.dragonState.particles.length = 0;
            }
            
            // Clear dragon state
            this.dragonState = null;
        }
        
        // Call parent dispose method to clean up the rest
        super.dispose();
    }
    
    /**
     * Reset the effect to its initial state
     */
    reset() {
        // Call the dispose method to clean up resources
        this.dispose();
        
        // Reset state variables
        this.isActive = false;
        this.elapsedTime = 0;
        this.distanceTraveled = 0;
        this.kickCount = 0;
        this.timeSinceLastKick = 0;
        this.initialPosition.set(0, 0, 0);
        this.direction.set(0, 0, 0);
    }
}