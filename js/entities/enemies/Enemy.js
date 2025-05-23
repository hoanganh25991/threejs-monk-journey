import * as THREE from 'three';
import { EnemyModelFactory } from './models/EnemyModelFactory.js';
import { ENEMY_BEHAVIOR_SETTINGS, ENEMY_TYPE_BEHAVIOR } from '../../config/enemy-behavior.js';

export class Enemy {
    // Static counter for generating unique IDs
    static idCounter = 0;
    
    constructor(scene, player, config) {
        this.scene = scene;
        this.player = player;
        
        // Assign a unique ID to each enemy
        this.id = Enemy.idCounter++;
        
        // Enemy configuration
        this.type = config.type || 'skeleton';
        this.name = config.name || 'Enemy';
        this.health = config.health || 50;
        this.maxHealth = config.health || 50;
        this.damage = config.damage || 10;
        this.speed = config.speed || 3;
        this.attackRange = config.attackRange || 1.5;
        this.attackSpeed = config.attackSpeed || 1.5;
        this.experienceValue = config.experienceValue || 20;
        this.color = config.color || 0xcccccc;
        this.scale = config.scale || 1;
        this.isBoss = config.isBoss || false;
        
        // Flag for minimap identification
        this.isEnemy = true;
        
        // Enemy state
        this.state = {
            isMoving: false,
            isAttacking: false,
            isDead: false,
            attackCooldown: 0,
            isKnockedBack: false,
            knockbackEndTime: 0,
            isAggressive: false,
            aggressionEndTime: 0,
            isStunned: false,
            stunEndTime: 0
        };
        
        // Apply behavior settings from config
        this.applyBehaviorSettings();
        
        // Enemy position and orientation
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Enemy collision
        this.collisionRadius = 0.5 * this.scale;
        this.heightOffset = 0.4 * this.scale; // Adjusted to place enemies on the ground
        
        // Enemy model
        this.modelGroup = null;
        this.model = null;
        
        // Reference to game world for terrain height
        this.world = null;
    }
    
    init() {
        // Create enemy model
        this.createModel();
    }
    
    applyBehaviorSettings() {
        // Get type-specific behavior settings or use default
        const typeBehavior = ENEMY_TYPE_BEHAVIOR[this.type] || ENEMY_TYPE_BEHAVIOR['default'];
        
        // Apply detection range
        this.detectionRange = typeBehavior.detectionRange || ENEMY_BEHAVIOR_SETTINGS.detectionRange;
        
        // Apply attack range multiplier
        this.attackRange *= (typeBehavior.attackRangeMultiplier || ENEMY_BEHAVIOR_SETTINGS.attackRangeMultiplier);
        
        // Apply aggression settings
        this.persistentAggression = typeBehavior.persistentAggression || 
                                   ENEMY_BEHAVIOR_SETTINGS.aggressionSettings.persistentAggression;
        this.aggressionTimeout = typeBehavior.aggressionTimeout || 
                                ENEMY_BEHAVIOR_SETTINGS.aggressionSettings.aggressionTimeout;
    }

    createModel() {
        // Create a group for the enemy
        this.modelGroup = new THREE.Group();
        
        // Create the appropriate model using the factory
        this.model = EnemyModelFactory.createModel(this, this.modelGroup);
        
        // Create the actual 3D model
        this.model.createModel();
        
        // Scale model if needed
        if (this.scale !== 1) {
            this.modelGroup.scale.set(this.scale, this.scale, this.scale);
        }
        
        // Add model to scene
        this.scene.add(this.modelGroup);
    }
    
    updateAnimations(delta) {
        // Use the model's updateAnimations method
        if (this.model && typeof this.model.updateAnimations === 'function') {
            this.model.updateAnimations(delta);
        }
    }

    update(delta) {
        // Skip update if dead
        if (this.state.isDead) {
            return;
        }
        
        // Handle knockback
        if (this.state.isKnockedBack) {
            if (Date.now() < this.state.knockbackEndTime) {
                // Continue knockback
                this.updateTerrainHeight();
                this.updateAnimations(delta);
                return;
            } else {
                // End knockback
                this.state.isKnockedBack = false;
            }
        }
        
        // Handle stun state
        if (this.state.isStunned) {
            if (Date.now() < this.state.stunEndTime) {
                // Enemy is stunned, only update terrain height and animations
                this.updateTerrainHeight();
                this.updateAnimations(delta);
                return;
            } else {
                // Stun has ended
                this.state.isStunned = false;
                console.debug(`${this.name} is no longer stunned`);
            }
        }
        
        // Update terrain height
        this.updateTerrainHeight();
        
        // Update attack cooldown
        if (this.state.attackCooldown > 0) {
            this.state.attackCooldown -= delta;
        }
        
        // Reset movement state
        this.state.isMoving = false;
        
        // Get distance to player
        const playerPosition = this.player.getPosition();
        const distanceToPlayer = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );
        
        // Special abilities for certain enemy types
        if (this.type === 'frost_titan') {
            // Initialize special ability cooldowns if not already
            if (!this.specialAbilityCooldowns) {
                this.specialAbilityCooldowns = {
                    iceStorm: 0,
                    frostNova: 0
                };
            }
            
            // Reduce cooldowns
            if (this.specialAbilityCooldowns.iceStorm > 0) {
                this.specialAbilityCooldowns.iceStorm -= delta;
            }
            
            if (this.specialAbilityCooldowns.frostNova > 0) {
                this.specialAbilityCooldowns.frostNova -= delta;
            }
            
            // Ice Storm ability (ranged)
            if (distanceToPlayer <= 10 && distanceToPlayer > this.attackRange && this.specialAbilityCooldowns.iceStorm <= 0) {
                this.castIceStorm(playerPosition);
                this.specialAbilityCooldowns.iceStorm = 8; // 8 second cooldown
                return;
            }
            
            // Frost Nova ability (close range)
            if (distanceToPlayer <= this.attackRange * 1.5 && this.specialAbilityCooldowns.frostNova <= 0) {
                this.castFrostNova();
                this.specialAbilityCooldowns.frostNova = 5; // 5 second cooldown
                return;
            }
        }
        
        // Check if player is in attack range
        if (distanceToPlayer <= this.attackRange) {
            // Attack player if cooldown is ready
            if (this.state.attackCooldown <= 0) {
                this.attackPlayer();
                this.state.attackCooldown = 1 / this.attackSpeed;
            }
            
            // Set aggressive state when player is in attack range
            this.state.isAggressive = true;
            this.state.aggressionEndTime = Date.now() + (this.aggressionTimeout * 1000);
        } else if (distanceToPlayer <= this.detectionRange || this.state.isAggressive) {
            // Move towards player if within detection range or if enemy is in aggressive state
            
            // Check if aggression should end
            if (this.state.isAggressive && Date.now() > this.state.aggressionEndTime && !this.persistentAggression) {
                this.state.isAggressive = false;
            }
            
            // Only chase if within detection range or still aggressive
            if (distanceToPlayer <= this.detectionRange || this.state.isAggressive) {
                this.state.isMoving = true;
                
                // Calculate direction to player
                const directionX = playerPosition.x - this.position.x;
                const directionZ = playerPosition.z - this.position.z;
                
                // Normalize direction
                const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
                const normalizedDirectionX = directionX / length;
                const normalizedDirectionZ = directionZ / length;
                
                // Update rotation to face player
                this.rotation.y = Math.atan2(normalizedDirectionX, normalizedDirectionZ);
                
                // Calculate new position
                const moveSpeed = this.speed * delta;
                const newPosition = {
                    x: this.position.x + normalizedDirectionX * moveSpeed,
                    y: this.position.y,
                    z: this.position.z + normalizedDirectionZ * moveSpeed
                };
                
                // Update position
                this.setPosition(newPosition.x, newPosition.y, newPosition.z);
                
                // If player is within detection range, refresh aggression timer
                if (distanceToPlayer <= this.detectionRange) {
                    this.state.isAggressive = true;
                    this.state.aggressionEndTime = Date.now() + (this.aggressionTimeout * 1000);
                }
            }
        }
        
        // Update animations
        this.updateAnimations(delta);
    }

    attackPlayer() {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create attack effect
        // (This could be expanded with different attack types based on enemy type)
        
        // Deal damage to player
        const damageDealt = this.player.takeDamage(this.damage);
        
        // Reset attack state after a short delay
        setTimeout(() => {
            this.state.isAttacking = false;
        }, 500);
    }
    
    castIceStorm(targetPosition) {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create ice storm effect
        // (This would be implemented with particle effects and area damage)
        console.debug(`${this.name} casts Ice Storm at position ${targetPosition.x}, ${targetPosition.z}`);
        
        // Deal damage to player if in area
        const distanceToPlayer = Math.sqrt(
            Math.pow(targetPosition.x - this.player.getPosition().x, 2) +
            Math.pow(targetPosition.z - this.player.getPosition().z, 2)
        );
        
        if (distanceToPlayer < 3) {
            this.player.takeDamage(this.damage * 1.5);
            // Apply slow effect to player
            this.player.applyEffect('slow', 3);
        }
        
        // Reset attack state after a delay
        setTimeout(() => {
            this.state.isAttacking = false;
        }, 1000);
    }
    
    castFrostNova() {
        // Set attack state
        this.state.isAttacking = true;
        
        // Create frost nova effect
        // (This would be implemented with particle effects and area damage)
        console.debug(`${this.name} casts Frost Nova`);
        
        // Deal damage to player if in area
        const distanceToPlayer = Math.sqrt(
            Math.pow(this.position.x - this.player.getPosition().x, 2) +
            Math.pow(this.position.z - this.player.getPosition().z, 2)
        );
        
        if (distanceToPlayer < this.attackRange * 1.5) {
            this.player.takeDamage(this.damage);
            // Apply freeze effect to player
            this.player.applyEffect('freeze', 2);
        }
        
        // Reset attack state after a delay
        setTimeout(() => {
            this.state.isAttacking = false;
        }, 800);
    }
    
    takeDamage(amount, knockback = false, knockbackDirection = null) {
        // Reduce health
        this.health -= amount;
        
        // Check if dead
        if (this.health <= 0) {
            this.die();
            return amount;
        }
        
        // Apply knockback if specified
        if (knockback) {
            this.applyKnockback(knockbackDirection);
        }
        
        return amount;
    }
    
    applyKnockback(direction) {
        // Set knockback state
        this.state.isKnockedBack = true;
        this.state.knockbackEndTime = Date.now() + 300; // 300ms knockback duration
        
        // Apply knockback movement
        if (direction) {
            const knockbackDistance = 1.0; // Knockback distance in units
            const newPosition = {
                x: this.position.x + direction.x * knockbackDistance,
                y: this.position.y,
                z: this.position.z + direction.z * knockbackDistance
            };
            
            this.setPosition(newPosition.x, newPosition.y, newPosition.z);
        }
    }
    
    die() {
        // Set dead state
        this.state.isDead = true;
        
        // Award experience to player
        this.player.addExperience(this.experienceValue);
        
        // Set a flag to track animation completion
        this.deathAnimationInProgress = true;
        
        // Trigger death animation or effects
        this.playDeathAnimation();
        
        // We no longer need to remove the enemy here
        // The EnemyManager will handle removal after the animation completes
        // This prevents the modelGroup from being null during the animation
    }
    
    playDeathAnimation() {
        // Implement death animation
        // This could be different based on enemy type
        if (this.modelGroup) {
            // Simple death animation - fall over
            const targetPosition = new THREE.Vector3(
                this.position.x,
                this.position.y - 0.5,
                this.position.z
            );
            
            const targetRotation = new THREE.Euler(
                Math.PI / 2,
                this.rotation.y,
                this.rotation.z
            );
            
            // Animate falling over
            const startPosition = this.position.clone();
            const startRotation = this.rotation.clone();
            const startTime = Date.now();
            const duration = 1000; // 1 second animation
            
            const animateDeath = () => {
                // Check if modelGroup still exists
                if (!this.modelGroup) {
                    console.warn('Enemy model group is null during death animation');
                    return;
                }
                
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out function
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                // Update position and rotation
                this.position.x = startPosition.x + (targetPosition.x - startPosition.x) * easeOut;
                this.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeOut;
                this.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeOut;
                
                // Safely update rotation
                if (this.modelGroup && this.modelGroup.rotation) {
                    this.modelGroup.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easeOut;
                }
                
                // Continue animation if not complete
                if (progress < 1 && this.modelGroup) {
                    requestAnimationFrame(animateDeath);
                } else if (this.modelGroup) {
                    // Final position and rotation
                    this.position.x = targetPosition.x;
                    this.position.y = targetPosition.y;
                    this.position.z = targetPosition.z;
                    
                    if (this.modelGroup.rotation) {
                        this.modelGroup.rotation.x = targetRotation.x;
                    }
                    
                    // Mark animation as complete
                    this.deathAnimationInProgress = false;
                } else {
                    // If modelGroup is null, also mark animation as complete
                    this.deathAnimationInProgress = false;
                }
            };
            
            // Start animation
            animateDeath();
        }
    }

    removeFromScene() {
        // Remove model from scene
        if (this.modelGroup) {
            this.scene.remove(this.modelGroup);
            
            // Clean up geometry and materials
            this.modelGroup.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            
            this.modelGroup = null;
        }
    }

    updateTerrainHeight() {
        // Update position based on terrain height if world is available
        if (this.world) {
            const terrainHeight = this.world.getTerrainHeight(this.position.x, this.position.z);
            if (terrainHeight !== null) {
                this.position.y = terrainHeight + this.heightOffset;
                
                if (this.modelGroup) {
                    this.modelGroup.position.copy(this.position);
                    this.modelGroup.rotation.y = this.rotation.y;
                }
            }
        } else if (this.modelGroup) {
            // If no world, just update model position and rotation
            this.modelGroup.position.copy(this.position);
            this.modelGroup.rotation.y = this.rotation.y;
        }
    }

    setPosition(x, y, z) {
        // Update position
        this.position.set(x, y, z);
        
        // Update model position
        if (this.modelGroup) {
            this.modelGroup.position.copy(this.position);
        }
    }

    getPosition() {
        return this.position;
    }
    
    getCollisionRadius() {
        return this.collisionRadius;
    }
    
    /**
     * Stun the enemy for a specified duration
     * @param {number} duration - Duration of stun in seconds
     */
    stun(duration) {
        this.state.isStunned = true;
        this.state.stunEndTime = Date.now() + (duration * 1000);
        console.debug(`${this.name} stunned for ${duration} seconds`);
    }
    
    getHealth() {
        return this.health;
    }
    
    getExperienceValue() {
        return this.experienceValue;
    }
    
    getType() {
        return this.type;
    }
    
    getName() {
        return this.name;
    }
    
    getMaxHealth() {
        return this.maxHealth;
    }
    
    isBossEnemy() {
        return this.isBoss;
    }
    
    isDead() {
        return this.state.isDead;
    }
    
    remove() {
        this.removeFromScene();
    }
}