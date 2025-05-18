/**
 * ImprisonedFistsEffect.js
 * Implements the Imprisoned Fists skill effect from Diablo Immortal
 * A powerful strike that locks enemies in place, preventing them from moving
 * Now with auto-aiming functionality to target the nearest enemy
 * The skill applies lock effect to enemies hit during travel
 */

import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

export class ImprisonedFistsEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        
        // Specific properties for Imprisoned Fists
        this.lockDuration = skill.lockDuration || 1.5; // Duration in seconds that enemies are locked in place
        this.damageMultiplier = 1.5; // Damage multiplier for locked enemies
        this.maxTargets = 5; // Maximum number of enemies that can be locked
        this.targetedEnemies = []; // Array to store targeted enemies
        this.particleSystem = null; // Particle system for visual effect
        this.lockEffects = []; // Visual effects for locked enemies
        
        // Auto-aim properties
        this.autoAimRange = skill.range || 20; // Range for auto-aiming (default 20)
        this.hasAutoAimed = false; // Flag to track if auto-aim has been used
        this.particleDirection = null; // Store the direction for particle movement
        
        // Movement properties
        this.moveSpeed = skill.moveSpeed || 50; // Speed at which the effect moves (default 50)
        this.targetEnemy = null; // The enemy being targeted
        this.targetPosition = null; // Position to move towards
        this.groundIndicator = null; // Visual indicator on the ground
        
        // Effect lifetime
        this.effectDuration = skill.duration || 3; // Total duration of the effect in seconds
        this.remainingDuration = this.effectDuration; // Remaining time for the effect
        
        // Ground rectangle properties for collision detection
        this.lockEnemiesDuringTravel = skill.lockEnemiesDuringTravel || true; // Apply lock effect to enemies hit during travel
        
        // Ground indicator properties
        this.groundIndicatorOffset = 0.1; // Slight offset from ground
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
        
        // Create a single ground indicator instance that will grow in length as the skill travels
        // For a rectangle lying flat on the ground (X-Z plane):
        // - Width = skill radius (perpendicular to travel direction)
        // - Length = will increase dynamically as the skill moves from the hero (along travel direction)
        const width = this.skill.radius || 5; // Width equals the skill's radius
        const initialLength = 0.1; // Initial length is small, will grow dynamically
        
        // Create material for the ground indicator
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        // Create initial geometry
        const indicatorGeometry = new THREE.PlaneGeometry(width, initialLength);
        
        // Create the mesh
        this.groundIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        
        // Store the starting position for calculating the length
        this.startPosition = position.clone();
        
        // Position the indicator at the starting position
        this.groundIndicator.position.copy(position);
        
        // We'll set the proper rotation in updateGroundIndicator
        // Just initialize with identity rotation here
        this.groundIndicator.rotation.set(0, 0, 0);
        
        // Add ground indicator to scene
        if (this.skill.game && this.skill.game.scene) {
            this.skill.game.scene.add(this.groundIndicator);
            
            // Initialize the ground indicator with the correct orientation
            // This ensures it's properly oriented from the start
            this.updateGroundIndicator(position);
        }
        
        // Position the effect
        effectGroup.position.copy(position);
        
        // Find nearest enemy to target
        this.findTargetEnemy(position, direction);
        
        // Store the original direction for reference
        this.originalDirection = direction.clone();
        
        // If we have a target, orient towards it
        if (this.targetPosition) {
            // Calculate direction to target
            const dirToTarget = new THREE.Vector3().subVectors(this.targetPosition, position).normalize();
            
            // Create a target point to look at
            const target = new THREE.Vector3().copy(position).add(dirToTarget);
            
            // Orient the effect group to face the target
            effectGroup.lookAt(target);
            
            // Log the direction for debugging
            console.debug(`Orienting towards target: (${dirToTarget.x.toFixed(2)}, ${dirToTarget.y.toFixed(2)}, ${dirToTarget.z.toFixed(2)})`)
            
            // Update ground indicator position and rotation to match the skill direction
            this.updateGroundIndicator(position);
        } else {
            // No target found, just use the provided direction
            if (direction && direction.lengthSq() > 0) {
                // Create a target point in the direction
                const target = new THREE.Vector3().copy(position).add(direction);
                
                // Orient the effect group to face the direction
                effectGroup.lookAt(target);
                
                // Log the direction for debugging
                console.debug(`Orienting in direction: (${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)})`)
                
                // Set a target position in the direction
                this.targetPosition = new THREE.Vector3().copy(direction).normalize().multiplyScalar(this.skill.range).add(position);
                
                // Update ground indicator position and rotation to match the skill direction
                this.updateGroundIndicator(position);
            }
        }
        
        // Store the effect's initial quaternion for reference
        this.initialQuaternion = effectGroup.quaternion.clone();
        
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
                
                console.debug("Found target enemy:", nearestEnemy)
                return;
            }
        }
        
        // No enemy found, use the provided direction
        this.hasAutoAimed = true;
    }
    
    /**
     * Update the ground indicator to show the path of the skill effect
     * @param {THREE.Vector3} currentPosition - Current position of the skill effect
     */
    updateGroundIndicator(currentPosition) {
        if (!this.groundIndicator || !this.startPosition || !this.effect) return;
        
        // Get the direction from the effect's orientation
        const effectDirection = new THREE.Vector3(0, 0, -1); // Forward direction in local space
        effectDirection.applyQuaternion(this.effect.quaternion); // Transform to world space
        effectDirection.normalize();
        
        // Calculate the distance from start to current position
        const distance = this.startPosition.distanceTo(currentPosition);
        
        // Calculate the midpoint between start and current position
        const midpoint = new THREE.Vector3().addVectors(this.startPosition, currentPosition).multiplyScalar(0.5);
        
        // Get terrain height at midpoint if available
        let terrainHeight = 0.1; // Default slight offset from ground
        if (this.skill.game && this.skill.game.world) {
            terrainHeight = this.skill.game.world.getTerrainHeight(midpoint.x, midpoint.z) + 0.1;
        }
        
        // Update the ground indicator's position to be at the midpoint
        midpoint.y = terrainHeight; // Set the correct height above terrain
        this.groundIndicator.position.copy(midpoint);
        
        // Get terrain height at the current position for better ground alignment
        if (this.skill.game && this.skill.game.world) {
            // Update the terrain height at the current position
            const currentTerrainHeight = this.skill.game.world.getTerrainHeight(currentPosition.x, currentPosition.z) + 0.1;
            
            // This ensures the indicator follows the terrain height at the current position
            if (Math.abs(terrainHeight - currentTerrainHeight) > 0.5) {
                console.debug(`Terrain height change: ${terrainHeight.toFixed(2)} to ${currentTerrainHeight.toFixed(2)}`);
            }
        }
        
        // Update the geometry to match the new length
        // Dispose of the old geometry to prevent memory leaks
        if (this.groundIndicator.geometry) {
            this.groundIndicator.geometry.dispose();
        }
        
        // Create a new geometry with the updated length
        const width = this.skill.radius || 5; // Width equals the skill's radius
        const length = Math.max(0.1, distance); // Length increases as the skill moves, minimum 0.1
        
        const newGeometry = new THREE.PlaneGeometry(width, length);
        this.groundIndicator.geometry = newGeometry;
        
        // Apply rotation to ensure the indicator is flat on the ground and aligned with direction
        
        // 1. Calculate the angle in the XZ plane based on the effect's direction
        const angle = Math.atan2(effectDirection.x, effectDirection.z);
        
        // 2. Reset rotation and apply in the correct sequence
        this.groundIndicator.quaternion.identity(); // Reset to identity quaternion
        
        // 3. Create and apply the combined rotation in one step
        // First flat on ground (X rotation), then aligned with direction (Y rotation)
        const flatRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        const directionRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        this.groundIndicator.quaternion.multiplyQuaternions(directionRotation, flatRotation);
        
        // Log minimal debug info
        console.debug(`Ground Indicator - Angle: ${(angle * 180 / Math.PI).toFixed(2)}°`)
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
        
        // Update remaining duration
        this.remainingDuration -= delta;
        
        // Check if the effect has expired
        if (this.remainingDuration <= 0) {
            this.isActive = false;
            return;
        }

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
            
            // Check if we've reached the target or exceeded the maximum range
            const distanceToTarget = newPosition.distanceTo(this.targetPosition);
            const distanceFromStart = newPosition.distanceTo(this.startPosition);
            
            // Only deactivate if we've reached the target position or exceeded the maximum range
            if (distanceToTarget < 1 || distanceFromStart >= this.skill.range) {
                // We've reached the target or maximum range, deactivate the effect
                this.isActive = false;
                console.debug(`Skill deactivated: Distance to target: ${distanceToTarget.toFixed(2)}, Distance from start: ${distanceFromStart.toFixed(2)}, Max range: ${this.skill.range}`)
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
        
        // Update ground indicator to show the path of the skill effect
        if (this.groundIndicator && this.effect && this.isActive) {
            // Update the ground indicator to match the effect's current position
            this.updateGroundIndicator(this.effect.position);
        }
        
        // Check for enemies hit during travel
        if (this.isActive && this.effect && this.skill.game && this.skill.game.enemyManager && this.lockEnemiesDuringTravel) {
            const currentPosition = this.effect.position.clone();
            const hitRadius = this.skill.radius || 5; // Use skill radius for hit detection
            
            // Get enemies within the ground rectangle area
            // This uses the same radius as the width of the ground rectangle
            const nearbyEnemies = this.skill.game.enemyManager.getEnemiesNearPosition(currentPosition, hitRadius);
            
            // Check each enemy
            for (const enemy of nearbyEnemies) {
                // Skip dead enemies or already targeted enemies
                if (enemy.isDead()) continue;
                
                // Check if this enemy is already locked
                const alreadyLocked = this.targetedEnemies.some(target => target.enemy === enemy);
                if (alreadyLocked) continue;
                
                // Lock the enemy
                this.targetedEnemies.push({
                    enemy: enemy,
                    lockTime: this.lockDuration,
                    originalPosition: enemy.getPosition().clone()
                });
                
                // Create visual lock effect
                this.createLockEffect(enemy);
                
                // Apply damage
                enemy.takeDamage(this.skill.damage * this.damageMultiplier);
                
                // Play impact sound
                if (this.skill.game && this.skill.game.audioManager && this.skill.sounds) {
                    this.skill.game.audioManager.playSound(this.skill.sounds.impact);
                }
                
                console.debug(`Locked enemy during travel: ${enemy.id || 'unknown'}`)
                
                // Note: We no longer break the loop or stop the skill when hitting max targets
                // The skill will continue to travel until it reaches its maximum range
            }
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
        
        // Reset duration
        this.remainingDuration = this.effectDuration;
        
        // Call parent reset method
        super.reset();
    }
}