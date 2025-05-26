/**
 * PlayerCombat.js
 * Simplified combat system for player character
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
        
        // Simplified punch system
        this.punchSystem = {
            cooldown: 0,
            cooldownTime: 0.5,
            range: 2.0,
            comboCount: 0,
            comboTimer: 0,
            comboTimeWindow: 1.5,
            damageMultipliers: [1.0, 1.1, 1.3, 1.8],
            knockbackDistance: 3.0,
            knockbackDuration: 0.3
        };
    }
    
    setGame(game) {
        this.game = game;
    }
    
    updateComboPunch(delta) {
        // Update cooldowns
        if (this.punchSystem.cooldown > 0) {
            this.punchSystem.cooldown -= delta;
        }
        
        // Update combo timer
        if (this.punchSystem.comboCount > 0) {
            this.punchSystem.comboTimer -= delta;
            if (this.punchSystem.comboTimer <= 0) {
                this.punchSystem.comboCount = 0;
            }
        }
        
        // Don't punch if player is already in an action
        if (this.playerState.isAttacking() || this.playerState.isUsingSkill()) {
            return;
        }
        
        // Check for punch input
        if (this.game?.inputHandler?.skillKeysHeld.KeyH && this.punchSystem.cooldown <= 0) {
            // Find nearest enemy in range
            const playerPosition = this.playerModel.getModelGroup().position;
            const nearestEnemy = this.game?.enemyManager?.findNearestEnemy(playerPosition, this.punchSystem.range);
            
            if (nearestEnemy) {
                this.performComboPunch(nearestEnemy);
                this.punchSystem.cooldown = this.punchSystem.cooldownTime;
            }
        }
    }
    
    performComboPunch(enemy) {
        // Set attack state
        this.playerState.setAttacking(true);
        
        // Face enemy
        const playerPosition = this.playerModel.getModelGroup().position;
        const enemyPosition = enemy.getPosition();
        const direction = new THREE.Vector3().subVectors(enemyPosition, playerPosition).normalize();
        this.playerModel.setRotation(new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0));
        
        // Update combo
        this.punchSystem.comboCount = (this.punchSystem.comboCount + 1) % 4;
        this.punchSystem.comboTimer = this.punchSystem.comboTimeWindow;
        const comboStep = this.punchSystem.comboCount;
        
        // Play appropriate animation
        switch (comboStep) {
            case 0: this.playerModel.createLeftPunchAnimation(); break;
            case 1: this.playerModel.createRightPunchAnimation(); break;
            case 2: this.playerModel.createLeftHookAnimation(); break;
            case 3: this.playerModel.createHeavyPunchAnimation(); break;
        }
        
        // Calculate and apply damage
        const damage = this.calculateComboPunchDamage(comboStep);
        enemy.takeDamage(damage);
        
        // Visual effects
        if (this.game?.effectsManager) {
            this.game.effectsManager.createBleedingEffect(damage, enemyPosition, false);
        }
        
        // Apply knockback on heavy punch
        if (comboStep === 3) {
            this.applyKnockback(enemy, direction);
        }
        
        // Sound effects
        if (this.game?.audioManager) {
            this.game.audioManager.playSound(comboStep === 3 ? 'playerHeavyAttack' : 'playerAttack');
        }
        
        // Reset attack state after delay
        setTimeout(() => this.playerState.setAttacking(false), 300);
    }
    
    applyKnockback(enemy, direction) {
        // Calculate knockback vector
        const knockbackVector = direction.clone().multiplyScalar(-this.punchSystem.knockbackDistance);
        
        // Apply knockback to enemy
        if (typeof enemy.applyKnockback === 'function') {
            enemy.applyKnockback(knockbackVector, this.punchSystem.knockbackDuration);
        }
        
        // Create visual effect
        this.playerModel.createKnockbackEffect(enemy.getPosition().clone());
    }
    
    calculateComboPunchDamage(comboStep) {
        // Base damage calculation
        let damage = this.playerStats.getAttackPower();
        damage += this.playerStats.strength * 0.5;
        damage += (this.playerStats.getLevel() - 1) * 2;
        
        // Add weapon damage
        const equipment = this.playerInventory.getEquipment();
        if (equipment.weapon) {
            damage += equipment.weapon.damage || 0;
        }
        
        // Apply combo multiplier
        damage *= this.punchSystem.damageMultipliers[comboStep];
        
        // Add variation and round
        const variation = damage * 0.2 * (Math.random() - 0.5);
        return Math.round(damage + variation);
    }
    
    attack(target) {
        // Set attack state
        this.playerState.setAttacking(true);
        
        // Face target
        const playerPosition = this.playerModel.getModelGroup().position;
        const direction = new THREE.Vector3().subVectors(target, playerPosition).normalize();
        this.playerModel.setRotation(new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0));
        
        // Visual and sound effects
        this.playerModel.createAttackEffect(direction);
        if (this.game?.audioManager) {
            this.game.audioManager.playSound('playerAttack');
        }
        
        // Reset attack state after delay
        setTimeout(() => this.playerState.setAttacking(false), 500);
        
        // Check for enemies in attack range
        this.checkAttackHit(direction);
    }
    
    checkAttackHit(direction) {
        if (!this.game?.enemyManager) return;
        
        // Get attack position and range
        const playerPosition = this.playerModel.getModelGroup().position;
        const attackPosition = new THREE.Vector3(
            playerPosition.x + direction.x * 1.5,
            playerPosition.y + 1,
            playerPosition.z + direction.z * 1.5
        );
        const attackRange = 1.5;
        
        // Check each enemy
        this.game.enemyManager.enemies.forEach(enemy => {
            const enemyPosition = enemy.getPosition();
            const distance = attackPosition.distanceTo(enemyPosition);
            
            // Apply damage to enemies in range
            if (distance <= attackRange) {
                const damage = this.calculateDamage();
                enemy.takeDamage(damage);
                
                // Visual effects
                if (this.game?.hudManager) {
                    this.game.hudManager.createBleedingEffect(damage, enemyPosition);
                }
                
                // Handle defeated enemies
                if (enemy.getHealth() <= 0) {
                    this.playerStats.addExperience(enemy.getExperienceValue());
                    if (this.game?.questManager) {
                        this.game.questManager.updateEnemyKill(enemy);
                    }
                }
            }
        });
    }
    
    calculateDamage() {
        // Basic damage calculation
        let damage = this.playerStats.getAttackPower();
        
        // Add weapon damage
        const equipment = this.playerInventory.getEquipment();
        if (equipment.weapon) {
            damage += equipment.weapon.damage || 0;
        }
        
        // Add variation and round
        return Math.round(damage * (0.8 + Math.random() * 0.4));
    }
    
    takeDamage(damage) {
        // Apply armor reduction
        let reducedDamage = damage;
        const equipment = this.playerInventory.getEquipment();
        if (equipment.armor) {
            reducedDamage *= (1 - equipment.armor.damageReduction);
        }
        
        // Apply damage to health
        this.playerStats.setHealth(this.playerStats.getHealth() - reducedDamage);
        
        // Sound effect
        if (this.game?.audioManager) {
            this.game.audioManager.playSound('playerHit');
        }
        
        // Check for death
        if (this.playerStats.getHealth() <= 0) {
            this.die();
        }
        
        // Visual effect
        if (this.game?.hudManager) {
            const playerPosition = this.playerModel.getModelGroup().position;
            this.game.hudManager.createBleedingEffect(reducedDamage, playerPosition, true);
        }
        
        return reducedDamage;
    }
    
    die() {
        // Set dead state
        this.playerState.setDead(true);
        this.playerState.setMoving(false);
        
        // Visual and sound effects
        this.playerModel.getModelGroup().rotation.x = Math.PI / 2;
        if (this.game?.audioManager) {
            this.game.audioManager.playSound('playerDeath');
        }
        
        // Show death screen
        if (this.game?.hudManager) {
            this.game.hudManager.showDeathScreen();
        }
    }
    
    revive() {
        // Reset health and mana
        this.playerStats.setHealth(this.playerStats.getMaxHealth() * 0.75);
        this.playerStats.setMana(this.playerStats.getMaxMana() * 0.75);
        
        // Reset state
        this.playerState.setDead(false);
        
        // Reset position and rotation
        this.playerModel.setPosition(new THREE.Vector3(0, 0, 0));
        this.playerModel.getModelGroup().rotation.x = 0;
        
        // Hide death screen
        if (this.game?.hudManager) {
            this.game.hudManager.hideDeathScreen();
        }
    }
}