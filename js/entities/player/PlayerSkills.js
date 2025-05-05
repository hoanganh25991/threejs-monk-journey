/**
 * PlayerSkills.js
 * Manages the player's skills and abilities
 */

import * as THREE from 'three';
import { Skill } from '../Skill.js';
import { IPlayerSkills } from './PlayerInterface.js';

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
        // Initialize monk skills with reduced cooldown and further increased durations
        this.skills = [
            new Skill({
                name: 'Wave Strike',
                description: 'Send a wave of energy towards enemies',
                type: 'ranged',
                damage: 20,
                manaCost: 15,
                cooldown: 0.5, // Reduced cooldown
                range: 25,
                radius: 2,
                duration: 3.5, // Further increased duration from 2.5 to 3.5
                color: 0x00ffff
            }),
            new Skill({
                name: 'Cyclone Strike',
                description: 'Pull enemies towards you and deal area damage',
                type: 'aoe',
                damage: 15,
                manaCost: 25,
                cooldown: 0.5, // Reduced cooldown
                range: 5,
                radius: 4,
                duration: 2.5, // Further increased duration from 1.5 to 2.5
                color: 0xffcc00
            }),
            new Skill({
                name: 'Seven-Sided Strike',
                description: 'Rapidly attack multiple enemies',
                type: 'multi',
                damage: 10,
                manaCost: 30,
                cooldown: 0.5, // Reduced cooldown
                range: 6,
                radius: 10,
                duration: 5.0, // Further increased duration from 3.5 to 5.0
                color: 0xff0000,
                hits: 7
            }),
            new Skill({
                name: 'Inner Sanctuary',
                description: 'Create a protective zone that reduces damage',
                type: 'buff',
                damage: 10,
                manaCost: 20,
                cooldown: 0.5, // Reduced cooldown
                range: 0,
                radius: 5,
                duration: 10, // Further increased duration from 7 to 10
                color: 0xffffff
            }),
            new Skill({
                name: 'Mystic Ally',
                description: 'Summon a spirit ally to fight alongside you',
                type: 'summon',
                damage: 8,
                manaCost: 35,
                cooldown: 0.5, // Reduced cooldown
                range: 2,
                radius: 1,
                duration: 20, // Further increased duration from 15 to 20
                color: 0x00ffff
            }),
            new Skill({
                name: 'Wave of Light',
                description: 'Summon a massive bell that crashes down on enemies',
                type: 'wave',
                damage: 50,
                manaCost: 40,
                cooldown: 0.5, // Reduced cooldown
                range: 25,
                radius: 5,
                duration: 5.0, // Further increased duration from 3.5 to 5.0
                color: 0xffdd22 // Golden color for the bell's light
            }),
            new Skill({
                name: 'Exploding Palm',
                description: 'Giant Palm: Summon a massive ethereal palm that marks enemies, causing them to violently explode on death and unleash devastating damage to all nearby foes',
                type: 'mark',
                damage: 15,
                manaCost: 25,
                cooldown: 0.5, // Reduced cooldown
                range: 100,
                radius: 5,
                duration: 20, // Further increased duration from 15 to 20 seconds
                color: 0xff3333
            }),
            new Skill({
                name: 'Fist of Thunder',
                description: 'Teleport to the nearest enemy and strike them with lightning',
                type: 'teleport',
                damage: 1,
                manaCost: 0,
                cooldown: 0, // Very short cooldown for basic attack
                range: 25, // Teleport range
                radius: 2, // Area of effect after teleport
                duration: 1.0, // Short duration
                color: 0x4169e1, // Royal blue color for lightning,
                basicAttack: true,
            }),
        ];
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
                console.log(`Removing expired skill ${skill.name}`);
                skill.remove();
                this.activeSkills.splice(i, 1);
                continue;
            }
            
            // Force cleanup for skills that are being spammed
            // This prevents UI and particles from persisting when holding keys
            // Reduced from 0.95 to 0.85 to clean up even faster when spamming
            if (skill.isActive && skill.elapsedTime > skill.duration * 0.85) {
                console.log(`Force cleaning up skill ${skill.name} that exceeded 85% of its duration`);
                skill.remove();
                this.activeSkills.splice(i, 1);
                continue;
            }
            
            // Immediately clean up skills of the same type when a new one is cast
            // This is especially important when holding keys to spam skills
            for (let j = this.activeSkills.length - 1; j >= 0; j--) {
                // Safety check for array bounds
                if (j >= this.activeSkills.length) continue;
                
                const otherSkill = this.activeSkills[j];
                if (!otherSkill) continue;
                
                if (i !== j && 
                    otherSkill.name === skill.name && 
                    otherSkill.elapsedTime > otherSkill.duration * 0.2) { // Reduced from 0.3 to 0.2 for faster cleanup
                    // If we have two skills of the same type and the older one is at least 20% through its duration
                    console.log(`Cleaning up older instance of ${otherSkill.name} due to key spamming`);
                    otherSkill.remove();
                    this.activeSkills.splice(j, 1);
                    
                    // Adjust index if we removed an element before the current one
                    if (j < i) {
                        i--;
                    }
                }
            }
        }
        
        // Limit the number of active skills of the same type
        // This prevents visual clutter when spamming the same skill
        const skillTypeCount = {};
        const skillNameCount = {};
        
        for (let i = this.activeSkills.length - 1; i >= 0; i--) {
            // Safety check for array bounds
            if (i >= this.activeSkills.length) continue;
            
            const skill = this.activeSkills[i];
            if (!skill) continue;
            
            // Count by type
            skillTypeCount[skill.type] = (skillTypeCount[skill.type] || 0) + 1;
            
            // Count by name (more specific than type)
            skillNameCount[skill.name] = (skillNameCount[skill.name] || 0) + 1;
            
            // If there are too many skills of the same name, remove the oldest ones
            // Strict limit: only allow 1 instance of each named skill
            const maxSkillsPerName = 1;
            if (skillNameCount[skill.name] > maxSkillsPerName) {
                // Find the oldest skill of this name
                let oldestSkillIndex = i;
                let oldestElapsedTime = skill.elapsedTime;
                
                for (let j = 0; j < this.activeSkills.length; j++) {
                    if (j !== i && 
                        this.activeSkills[j] && 
                        this.activeSkills[j].name === skill.name && 
                        this.activeSkills[j].elapsedTime > oldestElapsedTime) {
                        oldestSkillIndex = j;
                        oldestElapsedTime = this.activeSkills[j].elapsedTime;
                    }
                }
                
                // Remove the oldest skill
                if (oldestSkillIndex !== i && this.activeSkills[oldestSkillIndex]) {
                    console.log(`Removing oldest instance of ${this.activeSkills[oldestSkillIndex].name} to limit to ${maxSkillsPerName} instance`);
                    this.activeSkills[oldestSkillIndex].remove();
                    this.activeSkills.splice(oldestSkillIndex, 1);
                    skillNameCount[skill.name]--;
                    
                    // Adjust index if we removed an element before the current one
                    if (oldestSkillIndex < i) {
                        i--;
                    }
                }
            }
            
            // If there are too many skills of the same type, remove the oldest ones
            // Reduced from 2 to 1 to be more aggressive with cleanup
            const maxSkillsPerType = 1;
            if (skillTypeCount[skill.type] > maxSkillsPerType) {
                // Find the oldest skill of this type (largest elapsedTime means it was created earlier)
                let oldestSkillIndex = i;
                let oldestElapsedTime = skill.elapsedTime;
                
                for (let j = 0; j < this.activeSkills.length; j++) {
                    if (j !== i && 
                        this.activeSkills[j] && 
                        this.activeSkills[j].type === skill.type && 
                        this.activeSkills[j].elapsedTime > oldestElapsedTime) {
                        oldestSkillIndex = j;
                        oldestElapsedTime = this.activeSkills[j].elapsedTime;
                    }
                }
                
                // Remove the oldest skill
                if (oldestSkillIndex !== i && this.activeSkills[oldestSkillIndex]) {
                    console.log(`Removing oldest skill of type ${skill.type} to limit to ${maxSkillsPerType} skills`);
                    this.activeSkills[oldestSkillIndex].remove();
                    this.activeSkills.splice(oldestSkillIndex, 1);
                    skillTypeCount[skill.type]--;
                    
                    // Adjust index if we removed an element before the current one
                    if (oldestSkillIndex < i) {
                        i--;
                    }
                }
            }
        }
        
        // Perform a final cleanup pass to remove any null or undefined skills
        for (let i = this.activeSkills.length - 1; i >= 0; i--) {
            if (!this.activeSkills[i] || !this.activeSkills[i].isActive) {
                console.log(`Removing invalid skill at index ${i}`);
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
        console.log('PlayerSkills.useSkill called with index:', skillIndex);
        
        // Check if skill index is valid
        if (skillIndex < 0 || skillIndex >= this.skills.length) {
            console.log('Invalid skill index:', skillIndex, 'Max index:', this.skills.length - 1);
            return false;
        }
        
        // Get skill
        const skill = this.skills[skillIndex];
        console.log('Using skill:', skill.name);
        
        // Check if skill is on cooldown
        if (skill.isOnCooldown()) {
            console.log('Skill is on cooldown:', skill.name);
            return false;
        }
        
        // Check if player has enough mana
        if (this.playerStats.getMana() < skill.manaCost) {
            console.log('Not enough mana for skill:', skill.name);
            return false;
        }
        
        // Use mana
        this.playerStats.setMana(this.playerStats.getMana() - skill.manaCost);
        
        // Start cooldown
        skill.startCooldown();
        
        // Pass game reference to skill
        skill.game = this.game;
        
        // IMPORTANT: Clean up any existing instances of this skill before creating a new one
        // This is critical for preventing visual clutter when spamming skills
        for (let i = this.activeSkills.length - 1; i >= 0; i--) {
            if (this.activeSkills[i] && this.activeSkills[i].name === skill.name) {
                console.log(`Pre-emptively removing existing instance of ${skill.name} before creating new one`);
                this.activeSkills[i].remove();
                this.activeSkills.splice(i, 1);
            }
        }
        
        // Find the nearest enemy for auto-targeting (for all skill types)
        let targetEnemy = null;
        let targetDirection = null;
        
        if (this.game && this.game.enemyManager) {
            // Use skill range for targeting, or a default range if skill has no range
            const targetRange = skill.range > 0 ? skill.range : 15;
            targetEnemy = this.game.enemyManager.findNearestEnemy(this.playerPosition, targetRange);
            
            if (targetEnemy) {
                // Get enemy position
                const enemyPosition = targetEnemy.getPosition();
                
                // Calculate direction to enemy
                targetDirection = new THREE.Vector3().subVectors(enemyPosition, this.playerPosition).normalize();
                
                // Update player rotation to face enemy
                this.playerRotation.y = Math.atan2(targetDirection.x, targetDirection.z);
                
                console.log(`Auto-targeting enemy for skill ${skill.name}, facing direction: ${this.playerRotation.y}`);
            }
        }
        
        // Special handling for teleport skills
        if (skill.type === 'teleport' && skill.name === 'Fist of Thunder') {
            if (targetEnemy) {
                const enemyPosition = targetEnemy.getPosition();
                
                // Calculate teleport position (slightly before the enemy)
                const teleportDistance = Math.min(this.playerPosition.distanceTo(enemyPosition) - 1.5, skill.range);
                const teleportPosition = new THREE.Vector3(
                    this.playerPosition.x + targetDirection.x * teleportDistance,
                    enemyPosition.y, // Match enemy height
                    this.playerPosition.z + targetDirection.z * teleportDistance
                );
                
                // Teleport player
                this.playerPosition.copy(teleportPosition);
                
                // Create skill effect at the new position
                const skillEffect = skill.createEffect(this.playerPosition, this.playerRotation);
                
                // Add skill effect to scene
                this.scene.add(skillEffect);
                
                // Play teleport sound
                if (this.game && this.game.audioManager) {
                    this.game.audioManager.playSound('playerAttack');
                }
                
                // Reset skill state
                skill.elapsedTime = 0;
                skill.isActive = true;
                
                // Add to active skills
                this.activeSkills.push(skill);
                
                return true;
            } else {
                // No enemy found, show notification
                if (this.game && this.game.uiManager) {
                    this.game.uiManager.showNotification('No enemy in range');
                }
                
                // Refund mana
                this.playerStats.setMana(this.playerStats.getMana() + skill.manaCost);
                
                // Reset cooldown
                skill.currentCooldown = 0;
                
                return false;
            }
        } else {
            // For non-teleport skills, create the effect in the direction of the enemy if found
            // or in the current player direction if no enemy is found
            
            // COMPLETELY REVISED DIRECTION HANDLING
            
            // First priority: If there's a target enemy, face that direction (already handled above)
            if (targetEnemy) {
                // Direction already set in the code above
                console.log("Using enemy direction for skill cast");
            } 
            // Second priority: If player is moving, use movement direction
            else if (this.game && this.game.inputHandler) {
                const moveDir = this.game.inputHandler.getMovementDirection();
                
                if (moveDir.length() > 0) {
                    // Player is actively moving - use that direction
                    this.playerRotation.y = Math.atan2(moveDir.x, moveDir.z);
                    console.log(`Using movement direction for skill: ${moveDir.x.toFixed(2)}, ${moveDir.z.toFixed(2)}`);
                } else {
                    // Player is not moving - use current facing direction
                    console.log(`Using current facing direction: ${Math.sin(this.playerRotation.y).toFixed(2)}, ${Math.cos(this.playerRotation.y).toFixed(2)}`);
                }
            }
            
            // Log the final direction that will be used
            console.log(`Final rotation for skill cast: ${this.playerRotation.y.toFixed(2)} radians`);
            
            // Create the skill effect with the player's position and rotation
            const skillEffect = skill.createEffect(this.playerPosition, this.playerRotation);
            
            // Add skill effect to scene
            this.scene.add(skillEffect);
            
            // Show notification if an enemy was auto-targeted
            if (targetEnemy && this.game && this.game.uiManager) {
                this.game.uiManager.showNotification(`Auto-targeting ${targetEnemy.type} with ${skill.name}`);
            }
        }
        
        // Play skill sound
        if (this.game && this.game.audioManager) {
            // Play specific skill sound based on skill name
            switch (skill.name) {
                case 'Fist of Thunder':
                    this.game.audioManager.playSound('playerAttack');
                    break;
                case 'Wave Strike':
                    this.game.audioManager.playSound('skillWaveStrike');
                    break;
                case 'Cyclone Strike':
                    this.game.audioManager.playSound('skillCycloneStrike');
                    break;
                case 'Seven-Sided Strike':
                    this.game.audioManager.playSound('skillSevenSidedStrike');
                    break;
                case 'Inner Sanctuary':
                    this.game.audioManager.playSound('skillInnerSanctuary');
                    break;
                case 'Exploding Palm':
                    this.game.audioManager.playSound('skillExplodingPalm');
                    break;
                default:
                    // Generic skill sound
                    this.game.audioManager.playSound('playerAttack');
            }
        }
        
        // Reset skill state to ensure clean start
        skill.elapsedTime = 0;
        skill.isActive = true;
        
        // Add to active skills
        this.activeSkills.push(skill);
        
        return true;
    }
    
    useBasicAttack() {
        // Find the Fist of Thunder skill (should be the last skill in the array)
        // This is the basic attack skill with the "h" key
        const basicAttackSkill = this.skills.find(skill => skill.basicAttack === true);
        
        // If no basic attack skill is found, use the first skill as fallback
        const skill = basicAttackSkill || this.skills[0];
        
        console.log('Using basic attack skill:', skill.name);
        
        // Check if skill is on cooldown
        if (skill.isOnCooldown()) {
            return false;
        }
        
        // Check if player has enough mana
        if (this.playerStats.getMana() < skill.manaCost) {
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
                this.playerStats.setMana(this.playerStats.getMana() - skill.manaCost);
                
                // Start cooldown
                skill.startCooldown();
                
                return true;
            } else {
                // No enemy in melee range, try to teleport to a distant enemy
                const teleportEnemy = this.game.enemyManager.findNearestEnemy(this.playerPosition, skill.range);
                
                if (teleportEnemy) {
                    // Use mana
                    this.playerStats.setMana(this.playerStats.getMana() - skill.manaCost);
                    
                    // Start cooldown
                    skill.startCooldown();
                    
                    // Pass game reference to skill
                    skill.game = this.game;
                    
                    // Get enemy position
                    const enemyPosition = teleportEnemy.getPosition();
                    
                    // Calculate direction to enemy
                    const direction = new THREE.Vector3().subVectors(enemyPosition, this.playerPosition).normalize();
                    
                    // Update player rotation to face enemy
                    this.playerRotation.y = Math.atan2(direction.x, direction.z);
                    
                    // Calculate teleport position (slightly before the enemy)
                    const teleportDistance = Math.min(this.playerPosition.distanceTo(enemyPosition) - 1.5, skill.range);
                    const teleportPosition = new THREE.Vector3(
                        this.playerPosition.x + direction.x * teleportDistance,
                        enemyPosition.y, // Match enemy height
                        this.playerPosition.z + direction.z * teleportDistance
                    );
                    
                    // Teleport player
                    this.playerPosition.copy(teleportPosition);
                    
                    // Create skill effect at the new position
                    const skillEffect = skill.createEffect(this.playerPosition, this.playerRotation);
                    
                    // Add skill effect to scene
                    this.scene.add(skillEffect);
                    
                    // Play teleport sound
                    if (this.game && this.game.audioManager) {
                        this.game.audioManager.playSound('playerAttack');
                    }
                    
                    // Reset skill state
                    skill.elapsedTime = 0;
                    skill.isActive = true;
                    
                    // Add to active skills
                    this.activeSkills.push(skill);
                    
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