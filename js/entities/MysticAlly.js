import * as THREE from 'three';
import { Enemy } from './Enemy.js';

/**
 * MysticAlly class
 * Represents a standalone ally summoned by the Mystic Ally skill
 * Extends the Enemy class to leverage its movement and combat functionality
 */
export class MysticAlly extends Enemy {
    /**
     * Create a new Mystic Ally
     * @param {THREE.Scene} scene - The scene to add the ally to
     * @param {Player} player - The player who summoned the ally
     * @param {Object} config - Configuration for the ally
     * @param {Game} game - Reference to the game
     */
    constructor(scene, player, config, game) {
        // Create base configuration for the ally
        const allyConfig = {
            type: 'mystic_ally',
            name: 'Mystic Ally',
            health: 100,
            maxHealth: 100,
            damage: Math.round(player.getAttackPower() * 0.5), // 50% of player's attack power
            speed: player.getMovementSpeed() * 1.1, // Slightly faster than player
            attackRange: 1.5,
            attackSpeed: 1.5,
            experienceValue: 0, // Allies don't give experience when they die
            color: config.color || 0x00ffff, // Cyan color for spirit allies
            scale: 0.9, // Slightly smaller than player
            isBoss: false
        };
        
        // Call parent constructor
        super(scene, player, allyConfig);
        
        // Store reference to game
        this.game = game;
        
        // Ally-specific properties
        this.isAlly = true; // Flag to identify as an ally, not an enemy
        this.allyColor = config.color || 0x00ffff;
        this.allyIndex = config.index || 0;
        this.isPlayerModelClone = false;
        this.skillCastInterval = 3 + Math.random() * 5; // Random interval between skill casts
        this.lastSkillCastTime = 0;
        this.followDistance = 2.0; // Distance to maintain from player when no enemies
        this.lifespan = config.duration || 30; // How long the ally lives in seconds
        this.creationTime = Date.now() / 1000; // When the ally was created
        this.fadeOutDuration = 2.0; // Time to fade out when expiring
        
        // Override enemy state
        this.state = {
            isMoving: false,
            isAttacking: false,
            isDead: false,
            attackCooldown: 0,
            isKnockedBack: false,
            knockbackEndTime: 0,
            isCastingSkill: false,
            skillCastEndTime: 0
        };
    }
    
    /**
     * Initialize the ally
     * @returns {boolean} - Whether initialization was successful
     */
    init() {
        // Create ally model
        this.createModel();
        
        // Set initial position
        if (this.player) {
            const playerPosition = this.player.getPosition();
            const offset = this.allyIndex === 0 ? 
                new THREE.Vector3(-1.5, 0, 0) : 
                new THREE.Vector3(1.5, 0, 0);
                
            // Rotate offset based on player's rotation
            const playerRotation = this.player.getRotation();
            const rotationMatrix = new THREE.Matrix4().makeRotationY(playerRotation.y);
            offset.applyMatrix4(rotationMatrix);
            
            // Set position
            this.setPosition(
                playerPosition.x + offset.x,
                playerPosition.y,
                playerPosition.z + offset.z
            );
        }
        
        return true;
    }
    
    /**
     * Create the ally model
     * Attempts to clone the player model, falls back to a simple model if that fails
     */
    createModel() {
        // Create a group for the ally
        this.modelGroup = new THREE.Group();
        
        // Try to get the player model from the game
        let playerModel = null;
        
        // Check if we can access the player model
        if (this.player && this.player.model) {
            try {
                // First try to use the PlayerModel's cloneModel method if available
                if (typeof this.player.model.cloneModel === 'function') {
                    console.log(`Attempting to use PlayerModel.cloneModel for ally ${this.allyIndex+1}`);
                    
                    // Clone the player model using the dedicated method with the ally color
                    playerModel = this.player.model.cloneModel(0.7, this.allyColor, 0.8);
                    
                    if (playerModel) {
                        this.isPlayerModelClone = true;
                        console.log(`Successfully cloned player model using cloneModel for ally ${this.allyIndex+1}`);
                        
                        // Scale the model slightly smaller
                        playerModel.scale.set(0.9, 0.9, 0.9);
                        
                        // Add the player model to the ally group
                        this.modelGroup.add(playerModel);
                        
                        // Try to copy animations if the player model has them
                        if (this.player.model.mixer && this.player.model.animations) {
                            try {
                                // Create a new animation mixer for the ally
                                this.mixer = new THREE.AnimationMixer(playerModel);
                                
                                // Clone the animations from the player
                                if (Array.isArray(this.player.model.animations)) {
                                    this.animations = {};
                                    
                                    // Create animation actions for each animation
                                    for (const anim of this.player.model.animations) {
                                        if (anim && anim.name) {
                                            const clipAction = this.mixer.clipAction(anim);
                                            this.animations[anim.name] = clipAction;
                                        }
                                    }
                                    
                                    // Play idle animation by default
                                    if (this.animations['idle']) {
                                        this.animations['idle'].play();
                                    }
                                    
                                    console.log(`Successfully copied animations for ally ${this.allyIndex+1}`);
                                }
                            } catch (error) {
                                console.error(`Error copying animations for ally ${this.allyIndex+1}:`, error);
                            }
                        }
                    }
                } 
                // Fallback to manual cloning if cloneModel is not available
                else if (this.player.model.getModelGroup) {
                    console.log(`Attempting manual model clone for ally ${this.allyIndex+1}`);
                    
                    // Get the player model
                    const originalModel = this.player.model.getModelGroup();
                    
                    if (originalModel) {
                        // Clone the player model
                        playerModel = originalModel.clone(true); // Deep clone to include all children
                        this.isPlayerModelClone = true;
                        
                        console.log(`Successfully cloned player model for ally ${this.allyIndex+1}`);
                        
                        // Make the model transparent and apply the spirit color
                        playerModel.traverse(child => {
                            if (child.isMesh && child.material) {
                                // Clone the material to avoid affecting the original
                                if (Array.isArray(child.material)) {
                                    child.material = child.material.map(mat => {
                                        const newMat = mat.clone();
                                        newMat.transparent = true;
                                        newMat.opacity = 0.7;
                                        newMat.emissive = new THREE.Color(this.allyColor);
                                        newMat.emissiveIntensity = 0.8;
                                        return newMat;
                                    });
                                } else {
                                    child.material = child.material.clone();
                                    child.material.transparent = true;
                                    child.material.opacity = 0.7;
                                    child.material.emissive = new THREE.Color(this.allyColor);
                                    child.material.emissiveIntensity = 0.8;
                                }
                            }
                        });
                        
                        // Scale the model slightly smaller
                        playerModel.scale.set(0.9, 0.9, 0.9);
                        
                        // Add the player model to the ally group
                        this.modelGroup.add(playerModel);
                        
                        // Try to copy animations if the player model has them
                        if (this.player.model.mixer && this.player.model.animations) {
                            try {
                                // Create a new animation mixer for the ally
                                this.mixer = new THREE.AnimationMixer(playerModel);
                                
                                // Clone the animations from the player
                                if (Array.isArray(this.player.model.animations)) {
                                    this.animations = {};
                                    
                                    // Create animation actions for each animation
                                    for (const anim of this.player.model.animations) {
                                        if (anim && anim.name) {
                                            const clipAction = this.mixer.clipAction(anim);
                                            this.animations[anim.name] = clipAction;
                                        }
                                    }
                                    
                                    // Play idle animation by default
                                    if (this.animations['idle']) {
                                        this.animations['idle'].play();
                                    }
                                    
                                    console.log(`Successfully copied animations for ally ${this.allyIndex+1}`);
                                }
                            } catch (error) {
                                console.error(`Error copying animations for ally ${this.allyIndex+1}:`, error);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error cloning player model for ally ${this.allyIndex+1}:`, error);
                playerModel = null;
                this.isPlayerModelClone = false;
            }
        }
        
        // If we couldn't clone the player model, create a fallback model
        if (!playerModel) {
            console.log(`Using fallback model for ally ${this.allyIndex+1}`);
            this.createFallbackModel();
        }
        
        // Create energy wisps around the ally
        this.createEnergyWisps();
        
        // Add model to scene
        this.scene.add(this.modelGroup);
    }
    
    /**
     * Create a fallback model for the ally
     * Used when player model cloning fails
     */
    createFallbackModel() {
        // Create ally body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.allyColor,
            transparent: true,
            opacity: 0.7,
            emissive: this.allyColor,
            emissiveIntensity: 0.5
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6; // Half height
        body.castShadow = true;
        this.modelGroup.add(body);
        
        // Create ally head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.allyColor,
            transparent: true,
            opacity: 0.7,
            emissive: this.allyColor,
            emissiveIntensity: 0.5
        });
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.3; // Above body
        head.castShadow = true;
        this.modelGroup.add(head);
        
        // Create ally arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: this.allyColor,
            transparent: true,
            opacity: 0.7,
            emissive: this.allyColor,
            emissiveIntensity: 0.5
        });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.9, 0);
        leftArm.rotation.z = Math.PI / 4; // Angle arm outward
        leftArm.castShadow = true;
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.9, 0);
        rightArm.rotation.z = -Math.PI / 4; // Angle arm outward
        rightArm.castShadow = true;
        this.modelGroup.add(rightArm);
    }
    
    /**
     * Create energy wisps around the ally
     */
    createEnergyWisps() {
        const wispCount = 5;
        for (let j = 0; j < wispCount; j++) {
            const angle = (j / wispCount) * Math.PI * 2;
            const radius = 0.5;
            
            const wispGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const wispMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                emissive: this.allyColor,
                emissiveIntensity: 1.0
            });
            
            const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
            wisp.position.set(
                Math.cos(angle) * radius,
                0.8,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            wisp.userData = {
                initialAngle: angle,
                orbitSpeed: 1.0 + (Math.random() * 0.5),
                pulseSpeed: 0.5 + (Math.random() * 1.0)
            };
            
            this.modelGroup.add(wisp);
        }
    }
    
    /**
     * Override the update method to implement ally-specific behavior
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Check if ally has expired
        const currentTime = Date.now() / 1000;
        const allyAge = currentTime - this.creationTime;
        
        if (allyAge >= this.lifespan) {
            // Start fading out if near the end of lifespan
            if (allyAge <= this.lifespan + this.fadeOutDuration) {
                const fadeProgress = (allyAge - this.lifespan) / this.fadeOutDuration;
                this.fadeOut(fadeProgress);
            } else {
                // Remove ally when fully faded
                this.remove();
                return;
            }
        }
        
        // Skip update if dead
        if (this.state.isDead) return;
        
        // Update animation mixer if it exists
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Ensure ally is always at the correct terrain height
        this.updateTerrainHeight();
        
        // Update attack cooldown
        if (this.state.attackCooldown > 0) {
            this.state.attackCooldown -= delta;
        }
        
        // Update skill cast state
        if (this.state.isCastingSkill) {
            if (Date.now() > this.state.skillCastEndTime) {
                this.state.isCastingSkill = false;
                
                // Return to idle animation after casting
                this.playAnimation('idle');
            } else {
                // Animate casting
                this.animateSkillCasting(delta);
                return; // Skip other updates while casting
            }
        }
        
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDistance = 15; // Search radius
        
        if (this.game && this.game.enemyManager) {
            nearestEnemy = this.game.enemyManager.findNearestEnemy(this.position, nearestDistance);
        }
        
        // If we found an enemy, attack it
        if (nearestEnemy) {
            const enemyPosition = nearestEnemy.getPosition();
            const distanceToEnemy = this.position.distanceTo(enemyPosition);
            
            // Check if enemy is in attack range
            if (distanceToEnemy <= this.attackRange) {
                // Attack enemy if cooldown is ready
                if (this.state.attackCooldown <= 0) {
                    // Randomly choose between basic attack and casting a skill
                    if (currentTime - this.lastSkillCastTime > this.skillCastInterval && Math.random() < 0.3) {
                        // Cast a skill
                        this.castRandomSkill(nearestEnemy);
                        this.lastSkillCastTime = currentTime;
                        this.skillCastInterval = 3 + Math.random() * 5; // 3-8 seconds between casts
                        
                        // Play attack animation
                        this.playAnimation('attack');
                    } else {
                        // Basic attack
                        this.attackEnemy(nearestEnemy);
                        this.state.attackCooldown = 1 / this.attackSpeed;
                        
                        // Play attack animation
                        this.playAnimation('attack');
                    }
                }
                
                // Stop moving
                this.state.isMoving = false;
                
                // Face the enemy
                this.faceTarget(enemyPosition);
            } else {
                // Move towards enemy
                this.state.isMoving = true;
                
                // Play run animation
                this.playAnimation('run');
                
                // Calculate direction to enemy
                const direction = new THREE.Vector3().subVectors(enemyPosition, this.position).normalize();
                
                // Calculate movement step
                const step = this.speed * delta;
                
                // Move towards enemy
                this.position.x += direction.x * step;
                this.position.z += direction.z * step;
                
                // Update model position
                this.modelGroup.position.copy(this.position);
                
                // Face the enemy
                this.faceTarget(enemyPosition);
            }
        } else {
            // No enemies, follow the player
            const playerPosition = this.player.getPosition();
            const distanceToPlayer = this.position.distanceTo(playerPosition);
            
            // Only move if too far from player
            if (distanceToPlayer > this.followDistance) {
                // Move towards player, but maintain some distance
                this.state.isMoving = true;
                
                // Play run animation
                this.playAnimation('run');
                
                // Calculate direction to player
                const direction = new THREE.Vector3().subVectors(playerPosition, this.position).normalize();
                
                // Calculate movement step
                const step = this.speed * delta;
                
                // Move towards player
                this.position.x += direction.x * step;
                this.position.z += direction.z * step;
                
                // Update model position
                this.modelGroup.position.copy(this.position);
                
                // Face the player
                this.faceTarget(playerPosition);
            } else {
                // Idle behavior
                this.state.isMoving = false;
                
                // Play idle animation
                this.playAnimation('idle');
                
                // Face the same direction as the player, but with a slight offset
                const playerRotation = this.player.getRotation();
                this.modelGroup.rotation.y = playerRotation.y + (this.allyIndex === 0 ? -0.3 : 0.3);
            }
        }
        
        // Update animations for wisps
        this.updateWispAnimations(delta, currentTime);
    }
    
    /**
     * Play an animation if available
     * @param {string} animationName - Name of the animation to play
     */
    playAnimation(animationName) {
        // Skip if no animations or mixer
        if (!this.animations || !this.mixer) return;
        
        // Get the requested animation
        const animation = this.animations[animationName];
        
        // If animation exists and is not already playing
        if (animation && !animation.isRunning()) {
            // Stop all current animations
            for (const name in this.animations) {
                if (this.animations[name].isRunning()) {
                    this.animations[name].stop();
                }
            }
            
            // Play the requested animation
            animation.reset();
            animation.play();
        }
    }
    
    /**
     * Update animations for the energy wisps
     * @param {number} delta - Time since last update in seconds
     * @param {number} currentTime - Current time in seconds
     */
    updateWispAnimations(delta, currentTime) {
        // Update ally animations (wisps and swirls)
        for (let i = 0; i < this.modelGroup.children.length; i++) {
            const child = this.modelGroup.children[i];
            
            // Orbit wisps
            if (child.userData && child.userData.orbitSpeed) {
                const newAngle = child.userData.initialAngle + (currentTime * child.userData.orbitSpeed);
                const radius = 0.5;
                
                child.position.x = Math.cos(newAngle) * radius;
                child.position.z = Math.sin(newAngle) * radius;
                
                // Pulse wisps
                if (child.userData.pulseSpeed) {
                    const scale = 1.0 + 0.3 * Math.sin(currentTime * child.userData.pulseSpeed);
                    child.scale.set(scale, scale, scale);
                }
            }
        }
    }
    
    /**
     * Animate the ally while casting a skill
     * @param {number} delta - Time since last update in seconds
     */
    animateSkillCasting(delta) {
        const currentTime = Date.now();
        const castProgress = (currentTime - (this.state.skillCastEndTime - 1000)) / 1000;
        
        if (castProgress < 1.0) {
            // Try to play the cast animation if available
            if (this.animations && this.animations['cast']) {
                // If we haven't started the cast animation yet
                if (!this.animations['cast'].isRunning()) {
                    // Stop all other animations
                    for (const name in this.animations) {
                        if (this.animations[name].isRunning()) {
                            this.animations[name].stop();
                        }
                    }
                    
                    // Play the cast animation
                    this.animations['cast'].reset();
                    this.animations['cast'].play();
                }
            } 
            // Fallback to manual animation if no cast animation is available
            else {
                // Slight hovering and glowing effect
                this.modelGroup.position.y = this.position.y + 0.2 * Math.sin(castProgress * Math.PI);
                
                // Increase emissive intensity during cast
                const emissiveIntensity = 0.5 + (castProgress < 0.5 ? castProgress : 1 - castProgress) * 1.0;
                this.modelGroup.traverse(child => {
                    if (child.material && child.material.emissiveIntensity !== undefined) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.emissiveIntensity = emissiveIntensity;
                            });
                        } else {
                            child.material.emissiveIntensity = emissiveIntensity;
                        }
                    }
                });
            }
            
            // Create casting particles
            if (Math.random() < 0.2) { // Limit particle creation to avoid too many
                this.createCastingParticle();
            }
        }
    }
    
    /**
     * Create a particle effect for skill casting
     */
    createCastingParticle() {
        // Create a small particle
        const particleSize = 0.05 + (Math.random() * 0.1);
        const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: this.allyColor,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Position the particle randomly around the ally
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.5 + (Math.random() * 0.5);
        const height = 0.5 + (Math.random() * 1.0);
        
        particle.position.set(
            this.position.x + Math.cos(angle) * radius,
            this.position.y + height,
            this.position.z + Math.sin(angle) * radius
        );
        
        // Add to scene
        this.scene.add(particle);
        
        // Animate the particle
        const duration = 500 + Math.random() * 500; // 0.5-1 second
        const startTime = Date.now();
        const initialY = particle.position.y;
        const initialScale = 1.0;
        
        // Store the animation function
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1.0) {
                // Move upward
                particle.position.y = initialY + progress * 1.0;
                
                // Fade out
                particle.material.opacity = 0.8 * (1.0 - progress);
                
                // Grow slightly
                const scale = initialScale + progress * 1.0;
                particle.scale.set(scale, scale, scale);
                
                // Continue animation
                requestAnimationFrame(animate);
            } else {
                // Remove particle when animation is complete
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
            }
        };
        
        // Start animation
        animate();
    }
    
    /**
     * Make the ally face a target position
     * @param {THREE.Vector3} targetPosition - Position to face
     */
    faceTarget(targetPosition) {
        // Calculate direction to target
        const direction = new THREE.Vector3().subVectors(targetPosition, this.position);
        
        // Update rotation to face target
        if (direction.length() > 0.001) {
            this.rotation.y = Math.atan2(direction.x, direction.z);
            this.modelGroup.rotation.y = this.rotation.y;
        }
    }
    
    /**
     * Attack an enemy
     * @param {Enemy} enemy - The enemy to attack
     */
    attackEnemy(enemy) {
        // Create a hit effect
        this.createHitEffect(enemy.getPosition());
        
        // Deal damage to the enemy
        if (enemy.takeDamage) {
            enemy.takeDamage(this.damage);
            
            // Play attack sound if available
            if (this.game && this.game.audioManager) {
                this.game.audioManager.playSound('playerAttack');
            }
        }
    }
    
    /**
     * Create a hit effect at the target position
     * @param {THREE.Vector3} targetPosition - Position to create the hit effect
     */
    createHitEffect(targetPosition) {
        // Create a simple hit effect
        const hitGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const hitMaterial = new THREE.MeshBasicMaterial({
            color: this.allyColor,
            transparent: true,
            opacity: 0.8
        });
        
        const hitEffect = new THREE.Mesh(hitGeometry, hitMaterial);
        
        // Position the hit effect at the target
        hitEffect.position.copy(targetPosition);
        hitEffect.position.y += 0.5; // Slightly above ground
        
        // Add to scene
        this.scene.add(hitEffect);
        
        // Store animation data
        hitEffect.userData = {
            age: 0,
            maxAge: 0.3 // Short duration
        };
        
        // Remove after duration
        setTimeout(() => {
            this.scene.remove(hitEffect);
            hitEffect.geometry.dispose();
            hitEffect.material.dispose();
        }, 300);
    }
    
    /**
     * Cast a random skill from the player's skill set
     * @param {Enemy} enemy - The enemy to target with the skill
     */
    castRandomSkill(enemy) {
        // Set casting state
        this.state.isCastingSkill = true;
        this.state.skillCastEndTime = Date.now() + 1000; // 1 second cast time
        
        // Check if we have access to the player's skills
        if (!this.game || !this.player || !this.player.skills) {
            console.log("Cannot cast skill: no access to player skills");
            return;
        }
        
        // Try to use the player's skill system directly if possible
        if (typeof this.player.skills.castSkillByAlly === 'function') {
            try {
                // Use the dedicated method for ally skill casting if available
                const success = this.player.skills.castSkillByAlly(this, enemy);
                if (success) {
                    console.log(`Ally ${this.allyIndex + 1} cast skill using player skill system`);
                    return;
                }
            } catch (error) {
                console.error(`Error using player skill system for ally ${this.allyIndex + 1}:`, error);
                // Continue with fallback method
            }
        }
        
        // Fallback to manual skill casting
        // Get the player's skills
        const playerSkills = this.player.skills.getSkills();
        
        if (!playerSkills || playerSkills.length === 0) {
            console.log("Cannot cast skill: no player skills available");
            return;
        }
        
        // Choose a random skill (excluding Mystic Ally to avoid recursion)
        const availableSkills = playerSkills.filter(skill => 
            skill.name !== 'Mystic Ally' && 
            skill.type !== 'passive' && 
            skill.type !== 'buff'
        );
        
        if (availableSkills.length === 0) {
            console.log("No available skills to cast");
            return;
        }
        
        // Select a random skill
        const randomSkillIndex = Math.floor(Math.random() * availableSkills.length);
        const skillToCast = availableSkills[randomSkillIndex];
        
        console.log(`Ally ${this.allyIndex + 1} casting skill: ${skillToCast.name}`);
        
        // Create a temporary skill instance
        const tempSkill = {
            name: skillToCast.name,
            description: skillToCast.description,
            type: skillToCast.type,
            damage: skillToCast.damage * 0.5, // Allies deal 50% of normal damage
            manaCost: 0, // Allies don't use mana
            cooldown: 0, // No cooldown for ally skills
            range: skillToCast.range,
            radius: skillToCast.radius,
            duration: skillToCast.duration,
            color: this.allyColor, // Use ally color for the skill
            game: this.game,
            position: new THREE.Vector3().copy(this.position), // Important for collision detection
            id: `ally_${this.allyIndex}_skill_${Date.now()}` // Unique ID for the skill
        };
        
        // Try to create and cast the skill
        try {
            // Create a skill effect using the SkillEffectFactory
            const effectHandler = this.player.skills.createSkillEffect(tempSkill);
            
            if (effectHandler) {
                // Create a direction vector based on the ally's rotation
                const direction = new THREE.Vector3(
                    Math.sin(this.rotation.y),
                    0,
                    Math.cos(this.rotation.y)
                );
                
                // If we have a target enemy, aim in that direction instead
                if (enemy && enemy.getPosition) {
                    const enemyPosition = enemy.getPosition();
                    direction.subVectors(enemyPosition, this.position).normalize();
                }
                
                // Create the effect at the ally's position with the calculated direction
                const effect = effectHandler.create(this.position, direction);
                
                // Add the effect to the scene
                if (effect) {
                    this.scene.add(effect);
                    
                    // Play sound effect if available
                    if (this.game && this.game.audioManager) {
                        this.game.audioManager.playSound(skillToCast.name.toLowerCase().replace(/\s+/g, '_'));
                    }
                    
                    // Add to game's active skills if possible
                    if (this.game && this.game.activeSkills) {
                        tempSkill.effect = effectHandler;
                        this.game.activeSkills.push(tempSkill);
                    }
                }
            }
        } catch (error) {
            console.error(`Error casting skill ${skillToCast.name} by ally ${this.allyIndex + 1}:`, error);
        }
    }
    
    /**
     * Fade out the ally as it expires
     * @param {number} progress - Fade progress from 0 to 1
     */
    fadeOut(progress) {
        // Fade out opacity
        const opacity = 0.7 * (1 - progress);
        
        this.modelGroup.traverse(child => {
            if (child.material && child.material.opacity !== undefined) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.opacity = opacity;
                    });
                } else {
                    child.material.opacity = opacity;
                }
            }
        });
        
        // Rise up as fading
        const riseHeight = progress * 5;
        this.modelGroup.position.y = this.position.y + riseHeight;
    }
    
    /**
     * Override the takeDamage method to make allies immune to damage
     * @param {number} damage - Amount of damage
     * @returns {boolean} - Whether damage was taken
     */
    takeDamage(damage) {
        // Allies are immune to damage
        return false;
    }
    
    /**
     * Override the isDead method
     * @returns {boolean} - Whether the ally is dead
     */
    isDead() {
        return this.state.isDead;
    }
    
    /**
     * Override the remove method to properly clean up
     */
    remove() {
        // Set state to dead
        this.state.isDead = true;
        
        // Remove from scene
        if (this.modelGroup) {
            this.scene.remove(this.modelGroup);
            
            // Dispose of geometries and materials
            this.modelGroup.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            
            this.modelGroup = null;
        }
    }
}