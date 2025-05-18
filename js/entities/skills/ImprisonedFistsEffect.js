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
        this.maxTargets = 3; // Maximum number of enemies that can be targeted
        this.targetedEnemies = []; // Array to store targeted enemies
        this.particleSystem = null; // Particle system for visual effect
        this.lockEffects = []; // Visual effects for locked enemies
        
        // Auto-aim properties
        this.autoAimRange = skill.range || 15; // Range for auto-aiming
        this.hasAutoAimed = false; // Flag to track if auto-aim has been used
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
            
            // Size
            sizes[i] = 0.1 + Math.random() * 0.2;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        effectGroup.add(this.particleSystem);
        
        // Position and orient the effect
        effectGroup.position.copy(position);
        
        // Look at the direction
        if (direction.lengthSq() > 0) {
            const target = new THREE.Vector3().copy(position).add(direction);
            effectGroup.lookAt(target);
        }
        
        // Store the effect
        this.effect = effectGroup;
        this.isActive = true;
        
        // Find and target the nearest enemies
        this.findAndTargetEnemies(position, direction);
        
        return effectGroup;
    }
    
    /**
     * Find and target the nearest enemies
     * @param {THREE.Vector3} position - Position to search from
     * @param {THREE.Vector3} direction - Direction to search in
     */
    findAndTargetEnemies(position, direction) {
        // Check if we have access to the game and enemy manager
        if (!this.skill.game || !this.skill.game.enemyManager) {
            console.warn('No access to enemy manager for auto-aiming');
            return;
        }
        
        // Get all enemies within range
        const enemiesInRange = this.skill.game.enemyManager.getEnemiesNearPosition(position, this.autoAimRange);
        
        if (enemiesInRange.length === 0) {
            console.debug('No enemies in range for Imprisoned Fists');
            return;
        }
        
        // Sort enemies by distance
        enemiesInRange.sort((a, b) => {
            const distA = position.distanceTo(a.getPosition());
            const distB = position.distanceTo(b.getPosition());
            return distA - distB;
        });
        
        // Target up to maxTargets enemies
        const targetsToLock = Math.min(enemiesInRange.length, this.maxTargets);
        
        for (let i = 0; i < targetsToLock; i++) {
            const enemy = enemiesInRange[i];
            
            // Skip dead enemies
            if (enemy.isDead()) continue;
            
            // Add to targeted enemies
            this.targetedEnemies.push({
                enemy: enemy,
                originalPosition: enemy.getPosition().clone(),
                lockTime: this.lockDuration
            });
            
            // Create lock effect for this enemy
            this.createLockEffect(enemy);
            
            // Apply initial damage
            const damage = this.skill.damage * this.damageMultiplier;
            enemy.takeDamage(damage);
            
            console.debug(`Imprisoned Fists locked enemy at distance ${position.distanceTo(enemy.getPosition()).toFixed(2)}`);
        }
        
        // Set auto-aim flag
        this.hasAutoAimed = this.targetedEnemies.length > 0;
        
        // Play sound effect if enemies were targeted
        if (this.hasAutoAimed && this.skill.game && this.skill.game.audioManager) {
            this.skill.game.audioManager.playSound('playerAttack');
        }
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
        if (!this.isActive || !this.effect) return;
        
        super.update(delta);
        
        // Update particle system
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Move particles along the beam
                positions[i + 2] += delta * 2;
                
                // Reset particles that reach the end
                if (positions[i + 2] > 5) {
                    positions[i + 2] = 0;
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
        
        // Call parent reset method
        super.reset();
    }
}