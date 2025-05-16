/**
 * PlayerSkills.js
 * Manages the player's skills and abilities
 */

import * as THREE from 'three';
import { Skill } from '../skills/Skill.js';
import { IPlayerSkills } from './PlayerInterface.js';
import { SkillEffectFactory } from '../skills/SkillEffectFactory.js';
import { SKILLS, BATTLE_SKILLS } from '../../config/skills.js';
import { STORAGE_KEYS } from '../../config/storage-keys.js';

export class PlayerSkills extends IPlayerSkills {
    constructor(scene, playerStats, playerPosition, playerRotation) {
        super();
        
        this.scene = scene;
        this.playerStats = playerStats;
        this.playerPosition = playerPosition;
        this.playerRotation = playerRotation;
        
        // Initialize skills array
        this.skills = [];
        this.activeSkills = [];
        
        // Game reference
        this.game = null;
    }
    
    setGame(game) {
        this.game = game;
    }
    
    initializeSkills() {
        // Initialize monk skills using the configuration from config/skills.js
        const battleSkills = JSON.parse(localStorage.getItem(STORAGE_KEYS.SELECTED_SKILLS)) || BATTLE_SKILLS;
        this.skills = battleSkills.map(skillConfig => new Skill(skillConfig));
    }
    
    updateSkills(delta) {
        // Update active skills
        for (let i = this.activeSkills.length - 1; i >= 0; i--) {
            // Safety check for array bounds
            if (i >= this.activeSkills.length) continue;
            
            const skill = this.activeSkills[i];
            if (!skill) continue;
            
            try {
                // Update skill
                skill.update(delta);
            } catch (error) {
                console.error(`Error updating skill ${skill.name}:`, error);
                // Remove problematic skill
                skill.remove();
                this.activeSkills.splice(i, 1);
                continue;
            }
            
            // Remove expired skills
            if (skill.isExpired()) {
                console.debug(`Removing expired skill ${skill.name}`);
                skill.remove();
                this.activeSkills.splice(i, 1);
                continue;
            }
            
            // We no longer force cleanup for skills that are being spammed
            // This allows multiple instances of the same skill to exist simultaneously
            // Each skill will naturally expire at the end of its duration
        }
        
        // We no longer limit the number of active skills of the same type
        // This allows multiple instances of the same skill to exist simultaneously
        
        // Optional: Log the number of active skills for debugging
        const skillCounts = {};
        this.activeSkills.forEach(skill => {
            if (skill) {
                skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
            }
        });
        
        // Log only if there are multiple instances of any skill
        const multipleInstances = Object.entries(skillCounts).filter(([_, count]) => count > 1);
        if (multipleInstances.length > 0) {
            console.debug("Multiple skill instances active:", 
                multipleInstances.map(([name, count]) => `${name}: ${count}`).join(", "));
        }
        
        // Perform a final cleanup pass to remove any null or undefined skills
        for (let i = this.activeSkills.length - 1; i >= 0; i--) {
            if (!this.activeSkills[i] || !this.activeSkills[i].isActive) {
                console.debug(`Removing invalid skill at index ${i}`);
                if (this.activeSkills[i]) {
                    this.activeSkills[i].remove();
                }
                this.activeSkills.splice(i, 1);
            }
        }
        
        // Update skill cooldowns
        this.skills.forEach(skill => skill.updateCooldown(delta));
    }
    
    useSkill(skillIndex) {
        console.debug('PlayerSkills.useSkill called with index:', skillIndex);
        
        // Check if skill index is valid
        if (skillIndex < 0 || skillIndex >= this.skills.length) {
            console.debug('Invalid skill index:', skillIndex, 'Max index:', this.skills.length - 1);
            return false;
        }
        
        // Get skill template
        const skillTemplate = this.skills[skillIndex];
        console.debug('Using skill:', skillTemplate.name);
        
        // Check if skill is on cooldown
        if (skillTemplate.isOnCooldown()) {
            console.debug('Skill is on cooldown:', skillTemplate.name);
            return false;
        }
        
        // Check if player has enough mana
        if (this.playerStats.getMana() < skillTemplate.manaCost) {
            console.debug('Not enough mana for skill:', skillTemplate.name);
            return false;
        }
        
        // Use mana
        this.playerStats.setMana(this.playerStats.getMana() - skillTemplate.manaCost);
        
        // Start cooldown on the template (shared cooldown)
        skillTemplate.startCooldown();
        
        // We no longer clean up existing instances of this skill
        // This allows multiple instances of the same skill to exist simultaneously
        console.debug(`Creating a new instance of ${skillTemplate.name} while keeping existing instances`);
        
        // Optional: Log how many instances of this skill are currently active
        const activeInstancesCount = this.activeSkills.filter(s => s && s.name === skillTemplate.name).length;
        console.debug(`Currently active instances of ${skillTemplate.name}: ${activeInstancesCount}`);
        
        // Find the nearest enemy for auto-targeting (for all skill types)
        let targetEnemy = null;
        let targetDirection = null;
        
        if (this.game && this.game.enemyManager) {
            // Use skill range for targeting, or a default range if skill has no range
            const targetRange = skillTemplate.range > 0 ? skillTemplate.range : 15;
            targetEnemy = this.game.enemyManager.findNearestEnemy(this.playerPosition, targetRange);
            
            if (targetEnemy) {
                // Get enemy position
                const enemyPosition = targetEnemy.getPosition();
                
                // Calculate direction to enemy
                targetDirection = new THREE.Vector3().subVectors(enemyPosition, this.playerPosition).normalize();
                
                // Update player rotation to face enemy
                this.playerRotation.y = Math.atan2(targetDirection.x, targetDirection.z);
                
                console.debug(`Auto-targeting enemy for skill ${skillTemplate.name}, facing direction: ${this.playerRotation.y}`);
            }
        }
        
        // Create a new instance of the skill using the template from BATTLE_SKILLS config
        const skillConfig = SKILLS.find(config => config.name === skillTemplate.name);
        
        // Check if skillConfig exists before creating a new Skill instance
        if (!skillConfig) {
            console.error(`Skill configuration not found for: ${skillTemplate.name}`);
            return false;
        }
        
        const newSkillInstance = new Skill(skillConfig);
        
        // Create a new effect handler for the new skill instance
        newSkillInstance.effectHandler = SkillEffectFactory.createEffect(newSkillInstance);
        
        // Pass game reference to the new skill instance
        newSkillInstance.game = this.game;
        
        // Special handling for teleport skills
        if (skillTemplate.type === 'teleport' && skillTemplate.name === 'Fist of Thunder') {
            if (targetEnemy) {
                const enemyPosition = targetEnemy.getPosition();
                
                // Calculate teleport position (slightly before the enemy)
                const teleportDistance = Math.min(this.playerPosition.distanceTo(enemyPosition) - 1.5, skillTemplate.range);
                const teleportPosition = new THREE.Vector3(
                    this.playerPosition.x + targetDirection.x * teleportDistance,
                    enemyPosition.y, // Match enemy height
                    this.playerPosition.z + targetDirection.z * teleportDistance
                );
                
                // Teleport player
                this.playerPosition.copy(teleportPosition);
                
                // Create skill effect at the new position
                const skillEffect = newSkillInstance.createEffect(this.playerPosition, this.playerRotation);
                
                // Add skill effect to scene
                this.scene.add(skillEffect);
                
                // Play teleport sound
                if (this.game && this.game.audioManager) {
                    this.game.audioManager.playSound('playerAttack');
                }
                
                // Add to active skills
                this.activeSkills.push(newSkillInstance);
                
                return true;
            } else {
                // No enemy found, show notification
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.showNotification('No enemy in range');
                }
                
                // Refund mana
                this.playerStats.setMana(this.playerStats.getMana() + skillTemplate.manaCost);
                
                // Reset cooldown
                skillTemplate.currentCooldown = 0;
                
                return false;
            }
        } else {
            // For non-teleport skills, create the effect in the direction of the enemy if found
            // or in the current player direction if no enemy is found
            
            // COMPLETELY REVISED DIRECTION HANDLING
            
            // First priority: If there's a target enemy, face that direction (already handled above)
            if (targetEnemy) {
                // Direction already set in the code above
                console.debug("Using enemy direction for skill cast");
                
                // For skills with stationaryAttack flag, we don't move the player
                // This is specifically for ranged skills like "Deadly Reach"
                if (!skillTemplate.stationaryAttack) {
                    console.debug(`Skill ${skillTemplate.name} does not have stationaryAttack flag, player may move`);
                } else {
                    console.debug(`Skill ${skillTemplate.name} has stationaryAttack flag, player will not move`);
                }
            } 
            // Second priority: If player is moving, use movement direction
            else if (this.game && this.game.inputHandler) {
                const moveDir = this.game.inputHandler.getMovementDirection();
                
                if (moveDir.length() > 0) {
                    // Player is actively moving - use that direction
                    this.playerRotation.y = Math.atan2(moveDir.x, moveDir.z);
                    console.debug(`Using movement direction for skill: ${moveDir.x.toFixed(2)}, ${moveDir.z.toFixed(2)}`);
                } else {
                    // Player is not moving - use current facing direction
                    console.debug(`Using current facing direction: ${Math.sin(this.playerRotation.y).toFixed(2)}, ${Math.cos(this.playerRotation.y).toFixed(2)}`);
                }
            }
            
            // Log the final direction that will be used
            console.debug(`Final rotation for skill cast: ${this.playerRotation.y.toFixed(2)} radians`);
            
            // Create the skill effect with the player's position and rotation
            const skillEffect = newSkillInstance.createEffect(this.playerPosition, this.playerRotation);
            
            // Add skill effect to scene
            this.scene.add(skillEffect);
            
            // Log enemy was auto-targeted (only if an enemy was found)
            if (targetEnemy) {
                console.debug(`Auto-targeting ${targetEnemy.type} with ${skillTemplate.name}`);
            } else {
                console.debug(`Using ${skillTemplate.name} without a target`);
            }
        }

        // Sound is now handled by the skill itself in createEffect method
        
        // Add to active skills
        this.activeSkills.push(newSkillInstance);
        
        return true;
    }
    
    usePrimaryAttack() {
        // Find the Fist of Thunder skill (should be the last skill in the array)
        // This is the basic attack skill with the "h" key
        const primaryAttackSkill = this.skills.find(skill => skill.primaryAttack === true);
        
        // If no basic attack skill is found, use the first skill as fallback
        const skillTemplate = primaryAttackSkill || this.skills[0];
        
        console.debug('Using basic attack skill:', skillTemplate.name);
        
        // Check if skill is on cooldown
        if (skillTemplate.isOnCooldown()) {
            return false;
        }
        
        // Check if player has enough mana
        if (this.playerStats.getMana() < skillTemplate.manaCost) {
            return false;
        }
        
        // Find the nearest enemy
        if (this.game && this.game.enemyManager) {
            // First check if there's an enemy in melee range
            const meleeRange = 2.0; // Melee range for punch
            const meleeEnemy = this.game.enemyManager.findNearestEnemy(this.playerPosition, meleeRange);
            
            if (meleeEnemy) {
                // Enemy is in melee range, use combo punch system
                
                // Use mana
                this.playerStats.setMana(this.playerStats.getMana() - skillTemplate.manaCost);
                
                // Start cooldown
                skillTemplate.startCooldown();
                
                return true;
            } else {
                // No enemy in melee range, try to find a distant enemy
                const distantEnemy = this.game.enemyManager.findNearestEnemy(this.playerPosition, skillTemplate.range);
                
                if (distantEnemy) {
                    // Use mana
                    this.playerStats.setMana(this.playerStats.getMana() - skillTemplate.manaCost);
                    
                    // Start cooldown
                    skillTemplate.startCooldown();
                    
                    // Create a new instance of the skill using the template from BATTLE_SKILLS config
                    const skillConfig = SKILLS.find(config => config.name === skillTemplate.name);
                    const newSkillInstance = new Skill(skillConfig);
                    
                    // Create a new effect handler for the new skill instance
                    newSkillInstance.effectHandler = SkillEffectFactory.createEffect(newSkillInstance);
                    
                    // Pass game reference to the new skill instance
                    newSkillInstance.game = this.game;
                    
                    // Get enemy position
                    const enemyPosition = distantEnemy.getPosition();
                    
                    // Calculate direction to enemy
                    const direction = new THREE.Vector3().subVectors(enemyPosition, this.playerPosition).normalize();
                    
                    // Update player rotation to face enemy
                    this.playerRotation.y = Math.atan2(direction.x, direction.z);
                    
                    // Check if this is a stationary attack skill (like Deadly Reach)
                    if (skillTemplate.stationaryAttack) {
                        console.debug(`Primary attack ${skillTemplate.name} has stationaryAttack flag, player will not move`);
                        
                        // Create skill effect at the current position (no teleport)
                        const skillEffect = newSkillInstance.createEffect(this.playerPosition, this.playerRotation);
                        
                        // Add skill effect to scene
                        this.scene.add(skillEffect);
                    } else {
                        // For non-stationary attacks (like Fist of Thunder), teleport to the enemy
                        console.debug(`Primary attack ${skillTemplate.name} does not have stationaryAttack flag, player will move`);
                        
                        // Calculate teleport position (slightly before the enemy)
                        const teleportDistance = Math.min(this.playerPosition.distanceTo(enemyPosition) - 1.5, skillTemplate.range);
                        const teleportPosition = new THREE.Vector3(
                            this.playerPosition.x + direction.x * teleportDistance,
                            enemyPosition.y, // Match enemy height
                            this.playerPosition.z + direction.z * teleportDistance
                        );
                        
                        // Teleport player
                        this.playerPosition.copy(teleportPosition);
                        
                        // Create skill effect at the new position
                        const skillEffect = newSkillInstance.createEffect(this.playerPosition, this.playerRotation);
                        
                        // Add skill effect to scene
                        this.scene.add(skillEffect);
                    }
                    
                    // Play sound
                    if (this.game && this.game.audioManager) {
                        this.game.audioManager.playSound('playerAttack');
                    }
                    
                    // Add to active skills
                    this.activeSkills.push(newSkillInstance);
                    
                    return true;
                } else {
                    // No enemy found, show notification
                    if (this.game && this.game.uiManager) {
                        this.game.uiManager.showNotification('No enemy in range');
                    }
                    
                    return false;
                }
            }
        }
        
        return false;
    }
    
    getSkills() {
        return this.skills;
    }
    
    getActiveSkills() {
        return this.activeSkills;
    }
}