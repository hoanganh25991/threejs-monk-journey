/**
 * ImprisonedFistsEffect.js
 * Implements the Imprisoned Fists skill effect from Diablo Immortal
 * A powerful strike that locks enemies in place, preventing them from moving
 * Now with auto-aiming functionality to target the nearest enemy
 */

import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

export class ImprisonedFistsEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        
        // Specific properties for Imprisoned Fists
        this.lockDuration = 3.0; // Duration in seconds that enemies are locked in place
        this.damageMultiplier = 1.5; // Damage multiplier for locked enemies
        this.maxTargets = 1; // Only target 1 enemy at a time
        this.targetedEnemies = []; // Array to store targeted enemies
        this.particleSystem = null; // Particle system for visual effect
        this.lockEffects = []; // Visual effects for locked enemies
        
        // Auto-aim properties
        this.autoAimRange = skill.range || 15; // Range for auto-aiming
        this.hasAutoAimed = false; // Flag to track if auto-aim has been used
        this.particleDirection = null; // Store the direction for particle movement
        
        // Movement properties
        this.moveSpeed = skill.moveSpeed || 15; // Speed at which the effect moves
        this.targetEnemy = null; // The enemy being targeted
        this.targetPosition = null; // Position to move towards
        this.groundIndicator = null; // Visual indicator on the ground
    }
    
    /**
     * Create the effect mesh/group
     * @param {THREE.Vector3} position - Position to create the effect at
     * @param {THREE.Vector3} direction - Direction the effect should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group to hold all effect elements
        const effectGroup = new THREE.Group();
        
        // Create the main effect mesh
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
        geometry.rotateX(Math.PI / 2); // Rotate to align with direction
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan color for the effect
            transparent: true,
            opacity: 0.7
        });
        
        const beam = new THREE.Mesh(geometry, material);
        effectGroup.add(beam);
        
        // Create particle system for the effect
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        
        // Create particle positions
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color(0x00ffff);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position along the beam
            const distance = Math.random() * 5; // Length of the beam
            
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = distance;
            
            // Color (cyan with slight variations)
            colors[i * 3] = color.r * (0.8 + Math.random() * 0.2);
            colors[i * 3 + 1] = color.g * (0.8 + Math.random() * 0.2);
            colors[i * 3 + 2] = color.b * (0.8 + Math.random() * 0.2);
            
            // Size - increased for better visibility without texture
            sizes[i] = 0.2 + Math.random() * 0.3;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create particle material without texture
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.3, // Slightly larger size to make particles more visible without texture
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        effectGroup.add(this.particleSystem);
        
        // Create ground indicator (rectangle)
        const indicatorGeometry = new THREE.PlaneGeometry(1, 5); // Width, length
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.groundIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        this.groundIndicator.rotation.x = Math.PI / 2; // Lay flat on the ground
        
        // Add ground indicator to scene
        if (this.skill.game && this.skill.game.scene) {
            this.skill.game.scene.add(this.groundIndicator);
        }
        
        // Position and orient the effect
        effectGroup.position.copy(position);
        
        // Find nearest enemy to target
        this.findTargetEnemy(position, direction);
        
        // If we have a target, orient towards it
        if (this.targetPosition) {
            const target = new THREE.Vector3().copy(this.targetPosition);
            effectGroup.lookAt(target);
            
            // Update ground indicator position and rotation
            this.updateGroundIndicator(position, this.targetPosition);
        } else {
            // No target found, just use the provided direction
            if (direction && direction.lengthSq() > 0) {
                const target = new THREE.Vector3().copy(position).add(direction);
                effectGroup.lookAt(target);
                
                // Set a target position in the direction
                this.targetPosition = new THREE.Vector3().copy(direction).normalize().multiplyScalar(this.skill.range).add(position);
                
                // Update ground indicator
                this.updateGroundIndicator(position, this.targetPosition);
            }
        }
        
        // Store the effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    /**
     * Find the nearest enemy to target
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Default direction if no enemy found
     */
    findTargetEnemy(position, direction) {
        // Only find a target if we haven't already
        if (this.hasAutoAimed) return;
        
        // Find nearest enemy if game and enemy manager are available
        if (this.skill.game && this.skill.game.enemyManager) {
            const nearestEnemy = this.skill.game.enemyManager.findNearestEnemy(position, this.autoAimRange);
            
            if (nearestEnemy) {
                // Store the target enemy
                this.targetEnemy = nearestEnemy;
                this.targetPosition = nearestEnemy.getPosition();
                
                // Mark as auto-aimed
                this.hasAutoAimed = true;
                
                console.log("Found target enemy:", nearestEnemy);
                return;
            }
        }
        
        // No enemy found, use the provided direction
        this.hasAutoAimed = true;
    }
    
    /**
     * Update the ground indicator to show the path
     * @param {THREE.Vector3} start - Start position
     * @param {THREE.Vector3} end - End position
     */
    updateGroundIndicator(start, end) {
        if (!this.groundIndicator) return;
        
        // Calculate midpoint
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        
        // Get terrain height at midpoint if available
        let y = 0.1; // Default slight offset from ground
        if (this.skill.game && this.skill.game.world) {
            y = this.skill.game.world.getTerrainHeight(midpoint.x, midpoint.z) + 0.1;
        }
        
        // Position at midpoint
        midpoint.y = y;
        this.groundIndicator.position.copy(midpoint);
        
        // Calculate direction and distance
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const distance = start.distanceTo(end);
        
        // Scale the indicator to match the distance
        this.groundIndicator.scale.set(1, distance, 1);
        
        // Rotate to face the direction
        const angle = Math.atan2(direction.x, direction.z);
        this.groundIndicator.rotation.y = angle;
    }
    
    /**
     * Create a visual lock effect for an enemy
     * @param {Enemy} enemy - The enemy to create a lock effect for
     */
    createLockEffect(enemy) {
        const enemyPosition = enemy.getPosition();
        
        // Create a ring effect around the enemy
        const ringGeometry = new THREE.RingGeometry(1, 1.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(enemyPosition);
        ring.position.y += 0.1; // Slightly above ground
        ring.rotation.x = Math.PI / 2; // Lay flat
        
        // Add to scene
        if (this.skill.game && this.skill.game.scene) {
            this.skill.game.scene.add(ring);
            
            // Store for cleanup
            this.lockEffects.push(ring);
        }
    }
    
    /**
     * Update the effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        super.update(delta);

        if (!this.isActive || !this.effect) return;

        // Move the effect towards the target
        if (this.targetPosition && this.effect) {
            const currentPosition = this.effect.position.clone();
            const direction = new THREE.Vector3().subVectors(this.targetPosition, currentPosition).normalize();
            
            // Calculate movement distance for this frame
            const moveDistance = this.moveSpeed * delta;
            
            // Calculate new position
            const newPosition = new THREE.Vector3().copy(currentPosition).add(
                direction.multiplyScalar(moveDistance)
            );
            
            // Update effect position
            this.effect.position.copy(newPosition);
            
            // Check if we've reached the target
            const distanceToTarget = newPosition.distanceTo(this.targetPosition);
            if (distanceToTarget < 1) {
                // We've reached the target, apply effect to enemy
                if (this.targetEnemy && !this.targetEnemy.isDead() && this.targetedEnemies.length === 0) {
                    // Lock the enemy
                    this.targetedEnemies.push({
                        enemy: this.targetEnemy,
                        lockTime: this.lockDuration,
                        originalPosition: this.targetEnemy.getPosition().clone()
                    });
                    
                    // Create visual lock effect
                    this.createLockEffect(this.targetEnemy);
                    
                    // Apply initial damage
                    this.targetEnemy.takeDamage(this.skill.damage * this.damageMultiplier);
                    
                    // Play impact sound
                    if (this.skill.game && this.skill.game.audioManager && this.skill.sounds) {
                        this.skill.game.audioManager.playSound(this.skill.sounds.impact);
                    }
                }
                
                // Deactivate the effect after reaching target
                this.isActive = false;
            }
        }

        // Update particle system
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            
            // Store the particle system's world direction for consistent movement
            if (!this.particleDirection) {
                // Get the forward direction in world space
                this.particleDirection = new THREE.Vector3();
                this.effect.getWorldDirection(this.particleDirection);
                this.particleDirection.multiplyScalar(-1); // Invert if needed based on your coordinate system
            }
            
            for (let i = 0; i < positions.length; i += 3) {
                // Move particles along the beam in local space
                positions[i + 2] += delta * 5; // Increased speed for better visibility
                
                // Reset particles that reach the end
                if (positions[i + 2] > 5) {
                    positions[i + 2] = 0;
                    
                    // Add some randomness to x and y for a more natural look
                    positions[i] = (Math.random() - 0.5) * 0.3;
                    positions[i + 1] = (Math.random() - 0.5) * 0.3;
                }
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update locked enemies
        for (let i = this.targetedEnemies.length - 1; i >= 0; i--) {
            const targetData = this.targetedEnemies[i];
            
            // Skip if enemy is dead or no longer exists
            if (!targetData.enemy || targetData.enemy.isDead()) {
                this.targetedEnemies.splice(i, 1);
                continue;
            }
            
            // Update lock time
            targetData.lockTime -= delta;
            
            // Keep enemy in place while locked
            if (targetData.lockTime > 0) {
                // Force enemy position to original position
                targetData.enemy.setPosition(
                    targetData.originalPosition.x,
                    targetData.originalPosition.y,
                    targetData.originalPosition.z
                );
                
                // Apply damage over time (25% of initial damage per second)
                const dotDamage = (this.skill.damage * 0.25) * delta;
                targetData.enemy.takeDamage(dotDamage);
            } else {
                // Lock expired, remove from array
                this.targetedEnemies.splice(i, 1);
            }
        }
        
        // Update lock effects opacity based on remaining time
        this.lockEffects.forEach((effect, index) => {
            if (index < this.targetedEnemies.length) {
                const remainingTime = this.targetedEnemies[index].lockTime;
                const normalizedTime = remainingTime / this.lockDuration;
                
                // Update opacity
                if (effect.material) {
                    effect.material.opacity = 0.7 * normalizedTime;
                }
                
                // Pulse effect
                const scale = 1 + 0.2 * Math.sin(this.elapsedTime * 5);
                effect.scale.set(scale, scale, scale);
            } else {
                // No corresponding enemy, fade out
                if (effect.material) {
                    effect.material.opacity -= delta;
                    
                    // Remove when fully transparent
                    if (effect.material.opacity <= 0) {
                        if (effect.parent) {
                            effect.parent.remove(effect);
                        }
                    }
                }
            }
        });
        
        // Update ground indicator position
        if (this.groundIndicator && this.effect) {
            const startPos = this.effect.position.clone();
            this.updateGroundIndicator(startPos, this.targetPosition);
        }
    }
    
    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        // Clean up lock effects
        this.lockEffects.forEach(effect => {
            if (effect.parent) {
                effect.parent.remove(effect);
            }
            
            if (effect.geometry) {
                effect.geometry.dispose();
            }
            
            if (effect.material) {
                effect.material.dispose();
            }
        });
        
        // Clean up ground indicator
        if (this.groundIndicator) {
            if (this.groundIndicator.parent) {
                this.groundIndicator.parent.remove(this.groundIndicator);
            }
            
            if (this.groundIndicator.geometry) {
                this.groundIndicator.geometry.dispose();
            }
            
            if (this.groundIndicator.material) {
                this.groundIndicator.material.dispose();
            }
            
            this.groundIndicator = null;
        }
        
        this.lockEffects = [];
        this.targetedEnemies = [];
        
        // Call parent dispose method
        super.dispose();
    }
    
    /**
     * Reset the effect to its initial state
     */
    reset() {
        // Clean up any existing effects
        this.dispose();
        
        // Reset state variables
        this.hasAutoAimed = false;
        this.targetedEnemies = [];
        this.lockEffects = [];
        this.particleSystem = null;
        this.particleDirection = null;
        this.targetEnemy = null;
        this.targetPosition = null;
        
        // Call parent reset method
        super.reset();
    }
}