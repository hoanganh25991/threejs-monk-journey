import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for teleport skills
 */
export class TeleportSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.teleportState = null;
    }

    /**
     * Create a teleport effect
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to teleport
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Special handling for Fist of Thunder
        if (this.skill.name === 'Fist of Thunder') {
            this._createFistOfThunderEffect(effectGroup);
        } else {
            this._createDefaultTeleportEffect(effectGroup);
        }
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the Fist of Thunder special effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    _createFistOfThunderEffect(effectGroup) {
        // Create a lightning teleport effect
        const teleportGroup = new THREE.Group();
        
        // Create lightning trail effect
        const trailCount = 20;
        const trailSegments = [];
        
        // Create lightning segments
        for (let i = 0; i < trailCount; i++) {
            const segmentGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
            const segmentMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                emissive: this.skill.color,
                emissiveIntensity: 1.5,
                transparent: true,
                opacity: 0.8
            });
            
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            
            // Random position around the player
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5 + Math.random() * 1.5;
            
            segment.position.set(
                Math.cos(angle) * radius,
                Math.random() * 2 - 1,
                Math.sin(angle) * radius
            );
            
            // Random rotation
            segment.rotation.x = Math.random() * Math.PI;
            segment.rotation.y = Math.random() * Math.PI;
            segment.rotation.z = Math.random() * Math.PI;
            
            // Store initial values for animation
            segment.userData = {
                initialPos: segment.position.clone(),
                initialRot: segment.rotation.clone(),
                speed: 0.5 + Math.random() * 1.5,
                direction: new THREE.Vector3(
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1,
                    Math.random() * 2 - 1
                ).normalize()
            };
            
            trailSegments.push(segment);
            teleportGroup.add(segment);
        }
        
        // Create central lightning core
        const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: this.skill.color,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        teleportGroup.add(core);
        
        // Create flash effect
        const flashGeometry = new THREE.SphereGeometry(1, 16, 16);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0
        });
        
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        teleportGroup.add(flash);
        
        // Add teleport group to effect group
        effectGroup.add(teleportGroup);
        
        // Store teleport state
        this.teleportState = {
            age: 0,
            phase: 'appearing', // 'appearing', 'stable', 'dissipating'
            trailSegments: trailSegments,
            flash: flash,
            core: core
        };
    }

    /**
     * Create the default teleport effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    _createDefaultTeleportEffect(effectGroup) {
        // Create a simple teleport effect
        const teleportGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const teleportMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.8
        });
        
        const teleportMesh = new THREE.Mesh(teleportGeometry, teleportMaterial);
        effectGroup.add(teleportMesh);
        
        // Add particles
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position around the center
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 1.5;
            particle.position.set(
                Math.cos(angle) * radius,
                Math.random() * 2 - 1,
                Math.sin(angle) * radius
            );
            
            // Store initial position for animation
            particle.userData = {
                initialPos: particle.position.clone(),
                speed: 0.5 + Math.random() * 1.5
            };
            
            effectGroup.add(particle);
        }
    }

    /**
     * Update the teleport effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            return;
        }
        
        // Special handling for Fist of Thunder
        if (this.skill.name === 'Fist of Thunder' && this.teleportState) {
            this._updateFistOfThunderEffect(delta);
        } else {
            this._updateDefaultTeleportEffect(delta);
        }
    }

    /**
     * Update the Fist of Thunder special effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateFistOfThunderEffect(delta) {
        // Get teleport group (first child of effect group)
        const teleportGroup = this.effect.children[0];
        
        // Update teleport state
        this.teleportState.age += delta;
        
        // Handle different phases of the teleport effect
        if (this.teleportState.phase === 'appearing') {
            // Scale up the effect during appearing phase
            const scale = Math.min(1.0, this.teleportState.age * 5); // Reach full size in 0.2 seconds
            teleportGroup.scale.set(scale, scale, scale);
            
            // Flash effect
            if (this.teleportState.flash) {
                this.teleportState.flash.material.opacity = Math.min(1.0, 2.0 - this.teleportState.age * 10);
                this.teleportState.flash.scale.set(1 + this.teleportState.age * 5, 1 + this.teleportState.age * 5, 1 + this.teleportState.age * 5);
            }
            
            // Transition to stable phase
            if (this.teleportState.age >= 0.2) {
                this.teleportState.phase = 'stable';
                this.teleportState.age = 0;
            }
        } else if (this.teleportState.phase === 'stable') {
            // Animate lightning segments during stable phase
            if (this.teleportState.trailSegments) {
                for (const segment of this.teleportState.trailSegments) {
                    if (segment.userData) {
                        // Oscillate position
                        const initialPos = segment.userData.initialPos;
                        const speed = segment.userData.speed;
                        const direction = segment.userData.direction;
                        
                        segment.position.set(
                            initialPos.x + Math.sin(this.teleportState.age * speed * 5) * direction.x * 0.3,
                            initialPos.y + Math.sin(this.teleportState.age * speed * 5) * direction.y * 0.3,
                            initialPos.z + Math.sin(this.teleportState.age * speed * 5) * direction.z * 0.3
                        );
                        
                        // Rotate
                        segment.rotation.x += delta * speed;
                        segment.rotation.y += delta * speed * 0.7;
                        segment.rotation.z += delta * speed * 0.5;
                    }
                }
            }
            
            // Pulse the flash
            if (this.teleportState.flash) {
                this.teleportState.flash.material.opacity = 0.2 + Math.sin(this.teleportState.age * 10) * 0.1;
            }
            
            // Pulse the core
            if (this.teleportState.core) {
                const pulseScale = 1 + Math.sin(this.teleportState.age * 15) * 0.2;
                this.teleportState.core.scale.set(pulseScale, pulseScale, pulseScale);
            }
            
            // Transition to dissipating phase near the end of duration
            if (this.elapsedTime >= this.skill.duration * 0.8) {
                this.teleportState.phase = 'dissipating';
                this.teleportState.age = 0;
            }
        } else if (this.teleportState.phase === 'dissipating') {
            // Scale down the effect during dissipating phase
            const scale = Math.max(0.0, 1.0 - (this.teleportState.age * 5)); // Shrink to nothing in 0.2 seconds
            teleportGroup.scale.set(scale, scale, scale);
            
            // Fade out all materials
            teleportGroup.traverse(child => {
                if (child.material && child.material.opacity) {
                    child.material.opacity = Math.max(0, child.material.opacity - delta * 5);
                }
            });
        }
        
        // Check for enemies hit by the teleport effect
        if (this.skill.game && this.skill.game.enemyManager && this.teleportState.phase === 'stable') {
            // Check every 0.2 seconds to avoid too frequent checks
            if (Math.floor(this.teleportState.age * 5) > Math.floor((this.teleportState.age - delta) * 5)) {
                // Get all enemies within range
                const hitRadius = this.skill.radius;
                
                for (const enemy of this.skill.game.enemyManager.enemies) {
                    if (enemy.isDead()) continue;
                    
                    const enemyPos = enemy.getPosition();
                    const distance = this.skill.position.distanceTo(enemyPos);
                    
                    if (distance <= hitRadius) {
                        // Apply damage
                        enemy.takeDamage(this.skill.damage);
                        
                        // Show hit effect
                        this._createTeleportHitEffect(enemyPos);
                    }
                }
            }
        }
    }

    /**
     * Update the default teleport effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateDefaultTeleportEffect(delta) {
        // Simple rotation and pulsing
        this.effect.rotation.y += delta * 2;
        
        // Pulse the main sphere
        const pulseScale = 1 + Math.sin(this.elapsedTime * 5) * 0.2;
        if (this.effect.children[0]) {
            this.effect.children[0].scale.set(pulseScale, pulseScale, pulseScale);
        }
        
        // Animate particles
        for (let i = 1; i < this.effect.children.length; i++) {
            const particle = this.effect.children[i];
            if (particle.userData && particle.userData.initialPos) {
                // Orbit around the center
                const angle = this.elapsedTime * particle.userData.speed;
                const radius = particle.userData.initialPos.length();
                
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
                
                // Oscillate height
                particle.position.y = particle.userData.initialPos.y + Math.sin(this.elapsedTime * 3) * 0.3;
            }
        }
    }

    /**
     * Create a hit effect when the teleport skill hits an enemy
     * @param {THREE.Vector3} position - Position to create the hit effect
     * @private
     */
    _createTeleportHitEffect(position) {
        // Create a lightning hit effect at the enemy position
        const hitGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const hitMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.8
        });
        
        const hitMesh = new THREE.Mesh(hitGeometry, hitMaterial);
        hitMesh.position.copy(position);
        
        // Add to scene
        if (this.skill.game && this.skill.game.scene) {
            this.skill.game.scene.add(hitMesh);
            
            // Remove after a short delay
            setTimeout(() => {
                if (hitMesh.parent) {
                    hitMesh.parent.remove(hitMesh);
                }
                if (hitMesh.geometry) hitMesh.geometry.dispose();
                if (hitMesh.material) hitMesh.material.dispose();
            }, 300);
        }
    }
}