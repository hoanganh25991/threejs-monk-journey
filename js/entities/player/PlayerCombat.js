/**
 * PlayerCombat.js
 * Handles player combat, damage calculations, and combat effects
 */

import * as THREE from 'three';
import { IPlayerCombat } from './PlayerInterface.js';

export class PlayerCombat extends IPlayerCombat {
    constructor(scene, playerState, playerStats, playerModel, playerInventory) {
        super();
        
        this.scene = scene;
        this.playerState = playerState;
        this.playerStats = playerStats;
        this.playerModel = playerModel;
        this.playerInventory = playerInventory;
        
        // Game reference
        this.game = null;
        
        // Enhanced combo punch system
        this.punchSystem = {
            cooldown: 0,
            cooldownTime: 0.5, // Faster cooldown for combo punches
            range: 2.0, // Melee range for punch
            comboCount: 0, // Current combo count (0-3)
            comboTimer: 0, // Time window to continue combo
            comboTimeWindow: 1.5, // Seconds to continue combo
            lastPunchTime: 0, // When the last punch occurred
            knockbackDistance: 3.0, // Distance to knock back on heavy punch
            knockbackDuration: 0.3, // Duration of knockback animation
            damageMultipliers: [1.0, 1.1, 1.3, 1.8], // Damage multipliers for each combo step
            teleportCounter: 0 // Counter for tracking teleport uses
        };
    }
    
    setGame(game) {
        this.game = game;
    }
    
    updateComboPunch(delta) {
        // Update punch cooldown
        if (this.punchSystem.cooldown > 0) {
            this.punchSystem.cooldown -= delta;
        }
        
        // Update combo timer if combo is active
        if (this.punchSystem.comboCount > 0) {
            this.punchSystem.comboTimer -= delta;
            
            // Reset combo if time window expires
            if (this.punchSystem.comboTimer <= 0) {
                this.punchSystem.comboCount = 0;
                console.debug("Combo reset: time window expired");
            }
        }
        
        // Don't punch if player is already attacking or using a skill
        if (this.playerState.isAttacking() || this.playerState.isUsingSkill()) {
            return;
        }
        
        // Only perform combo punch if H key is being held down
        if (this.game && this.game.inputHandler && this.game.inputHandler.skillKeysHeld.KeyH) {
            // Check if cooldown is ready
            if (this.punchSystem.cooldown <= 0) {
                // Find nearest enemy in melee range
                if (this.game.enemyManager) {
                    const playerPosition = this.playerModel.getModelGroup().position;
                    const nearestEnemy = this.game.enemyManager.findNearestEnemy(playerPosition, this.punchSystem.range);
                    
                    // If there's an enemy in range, perform combo punch
                    if (nearestEnemy) {
                        this.performComboPunch(nearestEnemy);
                        
                        // Reset cooldown
                        this.punchSystem.cooldown = this.punchSystem.cooldownTime;
                        
                        // Update last punch time
                        this.punchSystem.lastPunchTime = Date.now() / 1000;
                    }
                }
            }
        } else if (this.punchSystem.comboCount > 0 && !this.playerState.isAttacking()) {
            // If H key is released and we're in the middle of a combo, let the combo expire naturally
            // but don't start new punches
            console.debug("H key released, waiting for combo to expire");
            
            // Reset teleport counter when H key is released
            this.punchSystem.teleportCounter = 0;
        }
    }
    
    performComboPunch(enemy) {
        // Set attack state
        this.playerState.setAttacking(true);
        
        // Get enemy position
        const enemyPosition = enemy.getPosition();
        const playerPosition = this.playerModel.getModelGroup().position;
        
        // Calculate direction to enemy
        const direction = new THREE.Vector3().subVectors(enemyPosition, playerPosition).normalize();
        
        // Update player rotation to face enemy
        const rotation = new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0);
        this.playerModel.setRotation(rotation);
        
        // Increment combo counter
        this.punchSystem.comboCount = (this.punchSystem.comboCount + 1) % 4;
        
        // Reset combo timer
        this.punchSystem.comboTimer = this.punchSystem.comboTimeWindow;
        
        // Get current combo step (0-based index)
        const comboStep = this.punchSystem.comboCount;
        
        // Log combo step
        console.debug(`Executing combo punch ${comboStep + 1}`);
        
        // Create appropriate punch animation based on combo step
        switch (comboStep) {
            case 0: // First punch - left jab
                this.playerModel.createLeftPunchAnimation();
                break;
            case 1: // Second punch - right cross
                this.playerModel.createRightPunchAnimation();
                break;
            case 2: // Third punch - left hook
                this.playerModel.createLeftHookAnimation();
                break;
            case 3: // Fourth punch - heavy right uppercut with knockback
                this.playerModel.createHeavyPunchAnimation();
                break;
        }
        
        // Calculate damage based on player stats, equipment, and combo multiplier
        const damage = this.calculateComboPunchDamage(comboStep);
        
        // Apply damage to the enemy
        enemy.takeDamage(damage);
        
        // Show damage number
        if (this.game && this.game.effectsManager) {
            this.game.effectsManager.createBleedingEffect(damage, enemyPosition, false);
        }
        
        // Apply knockback on heavy punch (combo step 3)
        if (comboStep === 3) {
            this.applyKnockback(enemy, direction);
        }
        
        // Play appropriate punch sound
        if (this.game && this.game.audioManager) {
            if (comboStep === 3) {
                // Heavy punch sound
                this.game.audioManager.playSound('playerHeavyAttack');
            } else {
                // Normal punch sound
                this.game.audioManager.playSound('playerAttack');
            }
        }
        
        // Reset attack state after delay
        setTimeout(() => {
            this.playerState.setAttacking(false);
        }, 300);
    }
    
    applyKnockback(enemy, direction) {
        // Calculate knockback vector (opposite of direction to enemy)
        const knockbackVector = direction.clone().multiplyScalar(-this.punchSystem.knockbackDistance);
        
        // Apply knockback to enemy
        if (typeof enemy.applyKnockback === 'function') {
            enemy.applyKnockback(knockbackVector, this.punchSystem.knockbackDuration);
        } else {
            // Fallback if enemy doesn't have knockback method
            const targetPosition = new THREE.Vector3(
                enemy.position.x + knockbackVector.x,
                enemy.position.y,
                enemy.position.z + knockbackVector.z
            );
            
            // Simple animation to move enemy
            const startPosition = enemy.position.clone();
            const startTime = Date.now();
            const duration = this.punchSystem.knockbackDuration * 1000;
            
            const animateKnockback = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic function for natural movement
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                // Interpolate position
                enemy.position.lerpVectors(startPosition, targetPosition, easeOut);
                
                if (progress < 1) {
                    requestAnimationFrame(animateKnockback);
                }
            };
            
            animateKnockback();
        }
        
        // Create knockback effect
        this.playerModel.createKnockbackEffect(enemy.position.clone());
    }
    
    calculateComboPunchDamage(comboStep) {
        // Base damage from attack power
        let damage = this.playerStats.getAttackPower();
        
        // Add bonus from strength (each point adds 0.5 damage)
        damage += this.playerStats.strength * 0.5;
        
        // Add level bonus (each level adds 2 damage)
        damage += (this.playerStats.getLevel() - 1) * 2;
        
        // Add weapon damage if equipped
        const equipment = this.playerInventory.getEquipment();
        if (equipment.weapon) {
            damage += equipment.weapon.damage || 0;
        }
        
        // Apply combo multiplier
        damage *= this.punchSystem.damageMultipliers[comboStep];
        
        // Add small random variation (±10%)
        const variation = damage * 0.2 * (Math.random() - 0.5);
        damage += variation;
        
        // Round to integer
        return Math.round(damage);
    }
    
    attack(target) {
        // Set attack state
        this.playerState.setAttacking(true);
        
        // Calculate direction to target
        const playerPosition = this.playerModel.getModelGroup().position;
        const direction = new THREE.Vector3().subVectors(target, playerPosition).normalize();
        
        // Update rotation to face target
        const rotation = new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0);
        this.playerModel.setRotation(rotation);
        
        // Create attack effect
        this.playerModel.createAttackEffect(direction);
        
        // Play attack sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('playerAttack');
        }
        
        // Reset attack state after delay
        setTimeout(() => {
            this.playerState.setAttacking(false);
        }, 500);
        
        // Check for enemies in attack range
        this.checkAttackHit(direction);
    }
    
    checkAttackHit(direction) {
        // Get attack position
        const playerPosition = this.playerModel.getModelGroup().position;
        const attackPosition = new THREE.Vector3(
            playerPosition.x + direction.x * 1.5,
            playerPosition.y + 1,
            playerPosition.z + direction.z * 1.5
        );
        
        // Get attack range
        const attackRange = 1.5;
        
        // Check each enemy
        this.game.enemyManager.enemies.forEach(enemy => {
            const enemyPosition = enemy.getPosition();
            
            // Calculate distance to enemy
            const distance = attackPosition.distanceTo(enemyPosition);
            
            // Check if enemy is in range
            if (distance <= attackRange) {
                // Calculate damage
                const damage = this.calculateDamage();
                
                // Apply damage to enemy
                enemy.takeDamage(damage);
                
                // Show damage number
                this.game.hudManager.createBleedingEffect(damage, enemyPosition);
                
                // Check if enemy is defeated
                if (enemy.getHealth() <= 0) {
                    // Award experience
                    this.playerStats.addExperience(enemy.getExperienceValue());
                    
                    // Check for quest completion
                    this.game.questManager.updateEnemyKill(enemy);
                }
            }
        });
    }
    
    calculateDamage() {
        // Base damage
        let damage = this.playerStats.getAttackPower();
        
        // Add weapon damage if equipped
        const equipment = this.playerInventory.getEquipment();
        if (equipment.weapon) {
            damage += equipment.weapon.damage;
        }
        
        // Add random variation (±20%)
        damage *= 0.8 + Math.random() * 0.4;
        
        // Round to integer
        return Math.round(damage);
    }
    
    takeDamage(damage) {
        // Apply damage reduction from armor
        let reducedDamage = damage;
        
        // Apply armor reduction if equipped
        const equipment = this.playerInventory.getEquipment();
        if (equipment.armor) {
            reducedDamage *= (1 - equipment.armor.damageReduction);
        }
        
        // Apply damage
        this.playerStats.setHealth(this.playerStats.getHealth() - reducedDamage);
        
        // Play hit sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('playerHit');
        }
        
        // Check if player is dead
        if (this.playerStats.getHealth() <= 0) {
            this.die();
        }
        
        // Show damage taken
        const playerPosition = this.playerModel.getModelGroup().position;
        this.game.hudManager.createBleedingEffect(reducedDamage, playerPosition, true);
        
        return reducedDamage;
    }
    
    die() {
        // Set dead state
        this.playerState.setDead(true);
        
        // Stop movement
        this.playerState.setMoving(false);
        
        // Play death animation
        this.playerModel.getModelGroup().rotation.x = Math.PI / 2;
        
        // Play death sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('playerDeath');
        }
        
        // Show death screen
        this.game.hudManager.showDeathScreen();
    }
    
    revive() {
        // Reset health and mana
        this.playerStats.setHealth(this.playerStats.getMaxHealth() / 2);
        this.playerStats.setMana(this.playerStats.getMaxMana() / 2);
        
        // Reset state
        this.playerState.setDead(false);
        
        // Reset position
        const playerPosition = new THREE.Vector3(0, 0, 0);
        this.playerModel.setPosition(playerPosition);
        
        // Reset rotation
        this.playerModel.getModelGroup().rotation.x = 0;
        
        // Hide death screen
        this.game.hudManager.hideDeathScreen();
    }
}