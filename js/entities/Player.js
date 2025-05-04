import * as THREE from 'three';
import { Skill } from './Skill.js';

export class Player {
    constructor(scene, camera, loadingManager) {
        this.scene = scene;
        this.camera = camera;
        this.loadingManager = loadingManager;
        
        // Player stats
        this.stats = {
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            health: 100_000,
            maxHealth: 100_000,
            mana: 100_000,
            maxMana: 100_000,
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            movementSpeed: 15,
            attackPower: 10
        };
        
        // Player state
        this.state = {
            isMoving: false,
            isAttacking: false,
            isUsingSkill: false,
            isDead: false,
            inWater: false,
            isInteracting: false
        };
        
        // Player position and orientation
        this.position = new THREE.Vector3(0, 0, 0);
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Player collision
        this.collisionRadius = 0.5;
        this.heightOffset = 1.0;
        
        // Player inventory
        this.inventory = [];
        this.gold = 0;
        
        // Player equipment
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            accessory: null
        };
        
        // Player skills
        this.skills = [];
        this.activeSkills = [];
        
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
        
        // Reference to game
        this.game = null;
    }
    
    async init() {
        // Create player model
        await this.createModel();
        
        // Initialize skills
        this.initializeSkills();
        
        return true;
    }
    
    async createModel() {
        // Create a group for the player
        this.modelGroup = new THREE.Group();
        
        // Create body (cube)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        
        this.modelGroup.add(body);
        
        // Create head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        
        this.modelGroup.add(head);
        
        // Create arms (cylinders)
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.6, 0);
        leftArm.rotation.z = Math.PI / 2;
        leftArm.castShadow = true;
        
        this.modelGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 0.6, 0);
        rightArm.rotation.z = -Math.PI / 2;
        rightArm.castShadow = true;
        
        this.modelGroup.add(rightArm);
        
        // Create legs (cylinders)
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        // Left leg
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.25, 0, 0);
        leftLeg.castShadow = true;
        
        this.modelGroup.add(leftLeg);
        
        // Right leg
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.25, 0, 0);
        rightLeg.castShadow = true;
        
        this.modelGroup.add(rightLeg);
        
        // Create monk-specific elements
        
        // Monk robe
        const robeGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.8, 8);
        const robeMaterial = new THREE.MeshStandardMaterial({ color: 0xcc8844 });
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = 0.2;
        robe.castShadow = true;
        
        this.modelGroup.add(robe);
        
        // Monk belt
        const beltGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 8);
        const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x553311 });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.5;
        belt.castShadow = true;
        
        this.modelGroup.add(belt);
        
        // Add model to scene
        this.scene.add(this.modelGroup);
        
        // Set initial position - make sure player is visible above terrain
        this.setPosition(0, 2, 0);
        
        // Log to confirm player model was added
        console.log("Player model created and added to scene:", this.modelGroup);
    }
    
    initializeSkills() {
        // Initialize monk skills with reduced cooldown and further increased durations
        this.skills = [
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
                color: 0x4169e1 // Royal blue color for lightning
            }),
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
                range: 10,
                radius: 5,
                duration: 20, // Further increased duration from 15 to 20 seconds
                color: 0xff3333
            })
        ];
    }
    
    update(delta) {
        // Check for keyboard movement input
        if (this.game && this.game.inputHandler) {
            this.handleKeyboardMovement(delta);
        }
        
        // Update movement
        this.updateMovement(delta);
        
        // Ensure player is always at the correct terrain height
        this.updateTerrainHeight();
        
        // Update camera
        this.updateCamera();
        
        // Update skills
        this.updateSkills(delta);
        
        // Update animations
        this.updateAnimations(delta);
        
        // Update combo punch system
        this.updateComboPunch(delta);
        
        // Regenerate resources
        this.regenerateResources(delta);
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
                console.log("Combo reset: time window expired");
            }
        }
        
        // Don't punch if player is already attacking or using a skill
        if (this.state.isAttacking || this.state.isUsingSkill) {
            return;
        }
        
        // Only perform combo punch if H key is being held down
        if (this.game && this.game.inputHandler && this.game.inputHandler.skillKeysHeld.KeyH) {
            // Check if cooldown is ready
            if (this.punchSystem.cooldown <= 0) {
                // Find nearest enemy in melee range
                if (this.game.enemyManager) {
                    const nearestEnemy = this.game.enemyManager.findNearestEnemy(this.position, this.punchSystem.range);
                    
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
        } else if (this.punchSystem.comboCount > 0 && !this.state.isAttacking) {
            // If H key is released and we're in the middle of a combo, let the combo expire naturally
            // but don't start new punches
            console.log("H key released, waiting for combo to expire");
            
            // Reset teleport counter when H key is released
            this.punchSystem.teleportCounter = 0;
        }
    }
    
    performComboPunch(enemy) {
        // Set attack state
        this.state.isAttacking = true;
        
        // Get enemy position
        const enemyPosition = enemy.getPosition();
        
        // Calculate direction to enemy
        const direction = new THREE.Vector3().subVectors(enemyPosition, this.position).normalize();
        
        // Update player rotation to face enemy
        this.rotation.y = Math.atan2(direction.x, direction.z);
        if (this.modelGroup) {
            this.modelGroup.rotation.y = this.rotation.y;
        }
        
        // Increment combo counter
        this.punchSystem.comboCount = (this.punchSystem.comboCount + 1) % 4;
        
        // Reset combo timer
        this.punchSystem.comboTimer = this.punchSystem.comboTimeWindow;
        
        // Get current combo step (0-based index)
        const comboStep = this.punchSystem.comboCount;
        
        // Log combo step
        console.log(`Executing combo punch ${comboStep + 1}`);
        
        // Create appropriate punch animation based on combo step
        switch (comboStep) {
            case 0: // First punch - left jab
                this.createLeftPunchAnimation();
                break;
            case 1: // Second punch - right cross
                this.createRightPunchAnimation();
                break;
            case 2: // Third punch - left hook
                this.createLeftHookAnimation();
                break;
            case 3: // Fourth punch - heavy right uppercut with knockback
                this.createHeavyPunchAnimation();
                break;
        }
        
        // Calculate damage based on player stats, equipment, and combo multiplier
        const damage = this.calculateComboPunchDamage(comboStep);
        
        // Apply damage to the enemy
        enemy.takeDamage(damage);
        
        // Show damage number
        if (this.game && this.game.uiManager) {
            this.game.uiManager.showDamageNumber(damage, enemyPosition);
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
            this.state.isAttacking = false;
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
        this.createKnockbackEffect(enemy.position.clone());
    }
    
    createKnockbackEffect(position) {
        // Create a shockwave effect at the knockback point
        const ringGeometry = new THREE.RingGeometry(0.5, 0.7, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.position.y += 0.1; // Slightly above ground
        ring.rotation.x = Math.PI / 2; // Flat on ground
        
        this.scene.add(ring);
        
        // Animate the shockwave
        let scale = 1.0;
        let opacity = 0.7;
        
        const animateShockwave = () => {
            scale += 0.2;
            opacity -= 0.03;
            
            ring.scale.set(scale, scale, scale);
            ringMaterial.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateShockwave);
            } else {
                this.scene.remove(ring);
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        animateShockwave();
    }
    
    calculateComboPunchDamage(comboStep) {
        // Base damage from attack power
        let damage = this.stats.attackPower;
        
        // Add bonus from strength (each point adds 0.5 damage)
        damage += this.stats.strength * 0.5;
        
        // Add level bonus (each level adds 2 damage)
        damage += (this.stats.level - 1) * 2;
        
        // Add weapon damage if equipped
        if (this.equipment.weapon) {
            damage += this.equipment.weapon.damage || 0;
        }
        
        // Apply combo multiplier
        damage *= this.punchSystem.damageMultipliers[comboStep];
        
        // Add small random variation (±10%)
        const variation = damage * 0.2 * (Math.random() - 0.5);
        damage += variation;
        
        // Round to integer
        return Math.round(damage);
    }
    
    handleKeyboardMovement(delta) {
        // Get movement direction from input handler
        const direction = this.game.inputHandler.getMovementDirection();
        
        // If there's keyboard input, move the player
        if (direction.length() > 0) {
            // Calculate movement step
            const step = this.stats.movementSpeed * delta;
            
            // Calculate new position (only update X and Z)
            const newPosition = new THREE.Vector3(
                this.position.x + direction.x * step,
                this.position.y,
                this.position.z + direction.z * step
            );
            
            // Update position
            this.position.x = newPosition.x;
            this.position.z = newPosition.z;
            
            // Update model position
            if (this.modelGroup) {
                this.modelGroup.position.x = this.position.x;
                this.modelGroup.position.z = this.position.z;
            }
            
            // Update rotation to face movement direction
            this.rotation.y = Math.atan2(direction.x, direction.z);
            if (this.modelGroup) {
                this.modelGroup.rotation.y = this.rotation.y;
            }
            
            // Set moving state
            this.state.isMoving = true;
            
            // Update target position to current position to prevent mouse movement overriding
            this.targetPosition.copy(this.position);
        }
    }
    
    updateTerrainHeight() {
        // Ensure player is always at the correct terrain height
        if (this.game && this.game.world) {
            const terrainHeight = this.game.world.getTerrainHeight(this.position.x, this.position.z);
            
            // Always maintain a fixed height above terrain to prevent vibration
            const targetHeight = terrainHeight + this.heightOffset;
            
            // Check if the world's initial terrain has been created
            if (this.game.world.initialTerrainCreated) {
                // Use a very small smooth factor to prevent vibration
                const smoothFactor = 0.05; // Lower value = smoother transition
                this.position.y += (targetHeight - this.position.y) * smoothFactor;
            } else {
                // If initial terrain isn't created yet, just set the height directly
                this.position.y = targetHeight;
            }
            
            // Update model position
            if (this.modelGroup) {
                this.modelGroup.position.y = this.position.y;
            }
        }
    }
    
    updateMovement(delta) {
        if (this.state.isMoving) {
            // Calculate direction to target
            const direction = new THREE.Vector3().subVectors(this.targetPosition, this.position).normalize();
            
            // Calculate distance to target
            const distance = this.position.distanceTo(this.targetPosition);
            
            // Move towards target
            if (distance > 0.1) {
                // Calculate movement step
                const step = this.stats.movementSpeed * delta;
                
                // Calculate new position (only update X and Z, let updateTerrainHeight handle Y)
                const newPosition = new THREE.Vector3(
                    this.position.x + direction.x * step,
                    this.position.y,
                    this.position.z + direction.z * step
                );
                
                // Update position (only X and Z)
                this.position.x = newPosition.x;
                this.position.z = newPosition.z;
                
                // Update model position
                if (this.modelGroup) {
                    this.modelGroup.position.x = this.position.x;
                    this.modelGroup.position.z = this.position.z;
                }
                
                // Update rotation to face movement direction
                this.rotation.y = Math.atan2(direction.x, direction.z);
                if (this.modelGroup) {
                    this.modelGroup.rotation.y = this.rotation.y;
                }
            } else {
                // Reached target
                this.state.isMoving = false;
            }
        }
        
        // Update the world based on player position
        if (this.game && this.game.world) {
            this.game.world.updateWorldForPlayer(this.position);
        }
    }
    
    updateCamera() {
        // Position camera in a more top-down view with greater height and distance
        const cameraOffset = new THREE.Vector3(0, 15, 20);
        
        // Validate player position before using it
        if (isNaN(this.position.x) || isNaN(this.position.y) || isNaN(this.position.z)) {
            console.warn("Invalid player position detected:", this.position);
            // Reset player position to a safe value
            this.position.set(0, 2, 0);
        }
        
        const cameraTarget = new THREE.Vector3(
            this.position.x,
            this.position.y, // Look directly at player's position for top-down view
            this.position.z
        );
        
        // Calculate camera position
        const cameraPosition = new THREE.Vector3(
            this.position.x + cameraOffset.x,
            this.position.y + cameraOffset.y,
            this.position.z + cameraOffset.z
        );
        
        // Validate camera position before applying
        if (!isNaN(cameraPosition.x) && !isNaN(cameraPosition.y) && !isNaN(cameraPosition.z)) {
            // Update camera position
            this.camera.position.copy(cameraPosition);
            
            // Validate camera target before looking at it
            if (!isNaN(cameraTarget.x) && !isNaN(cameraTarget.y) && !isNaN(cameraTarget.z)) {
                this.camera.lookAt(cameraTarget);
            }
            
            // Log camera position for debugging (only if valid)
            console.log("Camera position updated:", this.camera.position, "Looking at:", cameraTarget);
        } else {
            console.warn("Invalid camera position calculated:", cameraPosition);
        }
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
    
    updateAnimations(delta) {
        // Simple animations for the player model
        if (this.state.isMoving) {
            // Walking animation
            const walkSpeed = 5;
            const walkAmplitude = 0.1;
            
            // Animate legs
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            
            leftLeg.position.z = Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            rightLeg.position.z = -Math.sin(Date.now() * 0.01 * walkSpeed) * walkAmplitude;
            
            // Animate arms
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            leftArm.rotation.x = Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
            rightArm.rotation.x = -Math.sin(Date.now() * 0.01 * walkSpeed) * 0.2;
        } else {
            // Reset to idle position
            const leftLeg = this.modelGroup.children[4];
            const rightLeg = this.modelGroup.children[5];
            const leftArm = this.modelGroup.children[2];
            const rightArm = this.modelGroup.children[3];
            
            leftLeg.position.z = 0;
            rightLeg.position.z = 0;
            leftArm.rotation.x = 0;
            rightArm.rotation.x = 0;
        }
        
        // Attack animation
        if (this.state.isAttacking) {
            // Simple attack animation
            const rightArm = this.modelGroup.children[3];
            rightArm.rotation.x = Math.sin(Date.now() * 0.02) * 0.5;
        }
    }
    
    regenerateResources(delta) {
        // Regenerate health
        if (this.stats.health < this.stats.maxHealth) {
            this.stats.health += delta * 2; // 2 health per second
            if (this.stats.health > this.stats.maxHealth) {
                this.stats.health = this.stats.maxHealth;
            }
        }
        
        // Regenerate mana
        if (this.stats.mana < this.stats.maxMana) {
            this.stats.mana += delta * 5; // 5 mana per second
            if (this.stats.mana > this.stats.maxMana) {
                this.stats.mana = this.stats.maxMana;
            }
        }
    }
    
    moveTo(target) {
        // Set target position
        this.targetPosition.copy(target);
        
        // Start moving
        this.state.isMoving = true;
    }
    
    attack(target) {
        // Set attack state
        this.state.isAttacking = true;
        
        // Calculate direction to target
        const direction = new THREE.Vector3().subVectors(target, this.position).normalize();
        
        // Update rotation to face target
        this.rotation.y = Math.atan2(direction.x, direction.z);
        this.modelGroup.rotation.y = this.rotation.y;
        
        // Create attack effect
        this.createAttackEffect(direction);
        
        // Play attack sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('playerAttack');
        }
        
        // Reset attack state after delay
        setTimeout(() => {
            this.state.isAttacking = false;
        }, 500);
    }
    
    createAttackEffect(direction) {
        // Create a simple attack effect (a cone)
        const attackGeometry = new THREE.ConeGeometry(0.5, 2, 8);
        const attackMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        const attackMesh = new THREE.Mesh(attackGeometry, attackMaterial);
        
        // Position and rotate attack effect
        attackMesh.position.copy(this.position);
        attackMesh.position.y += 1;
        attackMesh.rotation.x = Math.PI / 2;
        attackMesh.rotation.y = this.rotation.y;
        
        // Move attack effect forward
        attackMesh.position.x += direction.x * 1.5;
        attackMesh.position.z += direction.z * 1.5;
        
        // Add to scene
        this.scene.add(attackMesh);
        
        // Remove after delay
        setTimeout(() => {
            this.scene.remove(attackMesh);
        }, 300);
        
        // Check for enemies in attack range
        this.checkAttackHit(direction);
    }
    
    checkAttackHit(direction) {
        // Get attack position
        const attackPosition = new THREE.Vector3(
            this.position.x + direction.x * 1.5,
            this.position.y + 1,
            this.position.z + direction.z * 1.5
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
                this.game.uiManager.showDamageNumber(damage, enemyPosition);
                
                // Check if enemy is defeated
                if (enemy.getHealth() <= 0) {
                    // Award experience
                    this.addExperience(enemy.getExperienceValue());
                    
                    // Check for quest completion
                    this.game.questManager.updateEnemyKill(enemy);
                }
            }
        });
    }
    
    calculateDamage() {
        // Base damage
        let damage = this.stats.attackPower;
        
        // Add weapon damage if equipped
        if (this.equipment.weapon) {
            damage += this.equipment.weapon.damage;
        }
        
        // Add random variation (±20%)
        damage *= 0.8 + Math.random() * 0.4;
        
        // Round to integer
        return Math.round(damage);
    }
    
    useSkill(skillIndex) {
        // Check if skill index is valid
        if (skillIndex < 0 || skillIndex >= this.skills.length) {
            return false;
        }
        
        // Get skill
        const skill = this.skills[skillIndex];
        
        // Check if skill is on cooldown
        if (skill.isOnCooldown()) {
            return false;
        }
        
        // Check if player has enough mana
        if (this.stats.mana < skill.manaCost) {
            return false;
        }
        
        // Use mana
        this.stats.mana -= skill.manaCost;
        
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
            targetEnemy = this.game.enemyManager.findNearestEnemy(this.position, targetRange);
            
            if (targetEnemy) {
                // Get enemy position
                const enemyPosition = targetEnemy.getPosition();
                
                // Calculate direction to enemy
                targetDirection = new THREE.Vector3().subVectors(enemyPosition, this.position).normalize();
                
                // Update player rotation to face enemy
                this.rotation.y = Math.atan2(targetDirection.x, targetDirection.z);
                this.modelGroup.rotation.y = this.rotation.y;
                
                console.log(`Auto-targeting enemy for skill ${skill.name}, facing direction: ${this.rotation.y}`);
            }
        }
        
        // Special handling for teleport skills
        if (skill.type === 'teleport' && skill.name === 'Fist of Thunder') {
            if (targetEnemy) {
                const enemyPosition = targetEnemy.getPosition();
                
                // Calculate teleport position (slightly before the enemy)
                const teleportDistance = Math.min(this.position.distanceTo(enemyPosition) - 1.5, skill.range);
                const teleportPosition = new THREE.Vector3(
                    this.position.x + targetDirection.x * teleportDistance,
                    enemyPosition.y, // Match enemy height
                    this.position.z + targetDirection.z * teleportDistance
                );
                
                // Teleport player
                this.position.copy(teleportPosition);
                this.modelGroup.position.copy(teleportPosition);
                
                // Create skill effect at the new position
                const skillEffect = skill.createEffect(this.position, this.rotation);
                
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
                this.stats.mana += skill.manaCost;
                
                // Reset cooldown
                skill.currentCooldown = 0;
                
                return false;
            }
        } else {
            // For non-teleport skills, create the effect in the direction of the enemy if found
            // or in the current player direction if no enemy is found
            const skillEffect = skill.createEffect(this.position, this.rotation);
            
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
    
    takeDamage(damage) {
        // Apply damage reduction from armor
        let reducedDamage = damage;
        
        // Apply armor reduction if equipped
        if (this.equipment.armor) {
            reducedDamage *= (1 - this.equipment.armor.damageReduction);
        }
        
        // Apply damage
        this.stats.health -= reducedDamage;
        
        // Play hit sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('playerHit');
        }
        
        // Check if player is dead
        if (this.stats.health <= 0) {
            this.stats.health = 0;
            this.die();
        }
        
        // Show damage taken
        this.game.uiManager.showDamageNumber(reducedDamage, this.position, true);
        
        return reducedDamage;
    }
    
    die() {
        // Set dead state
        this.state.isDead = true;
        
        // Stop movement
        this.state.isMoving = false;
        
        // Play death animation
        this.modelGroup.rotation.x = Math.PI / 2;
        
        // Play death sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('playerDeath');
        }
        
        // Show death screen
        this.game.uiManager.showDeathScreen();
    }
    
    revive() {
        // Reset health and mana
        this.stats.health = this.stats.maxHealth / 2;
        this.stats.mana = this.stats.maxMana / 2;
        
        // Reset state
        this.state.isDead = false;
        
        // Reset position
        this.setPosition(0, 0, 0);
        
        // Reset rotation
        this.modelGroup.rotation.x = 0;
        
        // Hide death screen
        this.game.uiManager.hideDeathScreen();
    }
    
    addExperience(amount) {
        // Add experience
        this.stats.experience += amount;
        
        // Check for level up
        while (this.stats.experience >= this.stats.experienceToNextLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        // Increase level
        this.stats.level++;
        
        // Subtract experience for this level
        this.stats.experience -= this.stats.experienceToNextLevel;
        
        // Calculate experience for next level
        this.stats.experienceToNextLevel = Math.floor(this.stats.experienceToNextLevel * 1.5);
        
        // Increase stats
        this.stats.maxHealth += 10;
        this.stats.maxMana += 5;
        this.stats.strength += 1;
        this.stats.dexterity += 1;
        this.stats.intelligence += 1;
        this.stats.attackPower += 2;
        
        // Restore health and mana
        this.stats.health = this.stats.maxHealth;
        this.stats.mana = this.stats.maxMana;
        
        // Play level up sound
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('levelUp');
        }
        
        // Show level up notification
        this.game.uiManager.showLevelUp(this.stats.level);
    }
    
    addToInventory(item) {
        // Check if item already exists in inventory
        const existingItem = this.inventory.find(i => i.name === item.name);
        
        if (existingItem) {
            // Increase amount
            existingItem.amount += item.amount;
        } else {
            // Add new item
            this.inventory.push({ ...item });
        }
    }
    
    removeFromInventory(itemName, amount = 1) {
        // Find item in inventory
        const itemIndex = this.inventory.findIndex(i => i.name === itemName);
        
        if (itemIndex >= 0) {
            // Decrease amount
            this.inventory[itemIndex].amount -= amount;
            
            // Remove item if amount is 0 or less
            if (this.inventory[itemIndex].amount <= 0) {
                this.inventory.splice(itemIndex, 1);
            }
            
            return true;
        }
        
        return false;
    }
    
    equipItem(item) {
        // Check if item is equippable
        if (!item.type || !this.equipment.hasOwnProperty(item.type)) {
            return false;
        }
        
        // Unequip current item if any
        if (this.equipment[item.type]) {
            this.addToInventory(this.equipment[item.type]);
        }
        
        // Equip new item
        this.equipment[item.type] = item;
        
        // Remove from inventory
        this.removeFromInventory(item.name);
        
        return true;
    }
    
    unequipItem(type) {
        // Check if item type is valid
        if (!this.equipment.hasOwnProperty(type)) {
            return false;
        }
        
        // Check if item is equipped
        if (!this.equipment[type]) {
            return false;
        }
        
        // Add to inventory
        this.addToInventory(this.equipment[type]);
        
        // Remove from equipment
        this.equipment[type] = null;
        
        return true;
    }
    
    addGold(amount) {
        this.gold += amount;
    }
    
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
    
    setPosition(x, y, z) {
        // Validate input coordinates
        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            console.warn("Attempted to set invalid player position:", x, y, z);
            // Use last valid position or default to origin
            return;
        }
        
        // Update position
        this.position.set(x, y, z);
        
        // Update model position (if it exists)
        if (this.modelGroup) {
            this.modelGroup.position.copy(this.position);
        }
    }
    
    setInWater(inWater) {
        this.state.inWater = inWater;
        
        // Apply water effects
        if (inWater) {
            // Slow movement in water
            this.stats.movementSpeed = 2.5;
        } else {
            // Normal movement speed
            this.stats.movementSpeed = 5;
        }
    }
    
    getPosition() {
        return this.position;
    }
    
    getRotation() {
        return this.rotation;
    }
    
    getCollisionRadius() {
        return this.collisionRadius;
    }
    
    getHeightOffset() {
        return this.heightOffset;
    }
    
    getHealth() {
        return this.stats.health;
    }
    
    getMaxHealth() {
        return this.stats.maxHealth;
    }
    
    getMana() {
        return this.stats.mana;
    }
    
    getMaxMana() {
        return this.stats.maxMana;
    }
    
    getLevel() {
        return this.stats.level;
    }
    
    getExperience() {
        return this.stats.experience;
    }
    
    getExperienceToNextLevel() {
        return this.stats.experienceToNextLevel;
    }
    
    getInventory() {
        return this.inventory;
    }
    
    getEquipment() {
        return this.equipment;
    }
    
    getGold() {
        return this.gold;
    }
    
    getSkills() {
        return this.skills;
    }
    
    getActiveSkills() {
        return this.activeSkills;
    }
    
    useBasicAttack() {
        // Get the Fist of Thunder skill
        const skill = this.skills[0];
        
        // Check if skill is on cooldown
        if (skill.isOnCooldown()) {
            return false;
        }
        
        // Check if player has enough mana
        if (this.stats.mana < skill.manaCost) {
            return false;
        }
        
        // Find the nearest enemy
        if (this.game && this.game.enemyManager) {
            // First check if there's an enemy in melee range
            const meleeEnemy = this.game.enemyManager.findNearestEnemy(this.position, this.punchSystem.range);
            
            if (meleeEnemy) {
                // Enemy is in melee range, use combo punch system
                
                // Use mana
                this.stats.mana -= skill.manaCost;
                
                // Start cooldown
                skill.startCooldown();
                
                // Reset punch cooldown to allow immediate punch
                this.punchSystem.cooldown = 0;
                
                // The actual punch will be performed in updateComboPunch
                // when the H key is held down
                
                return true;
            } else {
                // No enemy in melee range, try to teleport to a distant enemy
                const teleportEnemy = this.game.enemyManager.findNearestEnemy(this.position, skill.range);
                
                if (teleportEnemy) {
                    // Use mana
                    this.stats.mana -= skill.manaCost;
                    
                    // Start cooldown
                    skill.startCooldown();
                    
                    // Pass game reference to skill
                    skill.game = this.game;
                    
                    // Get enemy position
                    const enemyPosition = teleportEnemy.getPosition();
                    
                    // Calculate direction to enemy
                    const direction = new THREE.Vector3().subVectors(enemyPosition, this.position).normalize();
                    
                    // Update player rotation to face enemy
                    this.rotation.y = Math.atan2(direction.x, direction.z);
                    this.modelGroup.rotation.y = this.rotation.y;
                    
                    // Calculate teleport position (slightly before the enemy)
                    const teleportDistance = Math.min(this.position.distanceTo(enemyPosition) - 1.5, skill.range);
                    const teleportPosition = new THREE.Vector3(
                        this.position.x + direction.x * teleportDistance,
                        enemyPosition.y, // Match enemy height
                        this.position.z + direction.z * teleportDistance
                    );
                    
                    // Teleport player
                    this.position.copy(teleportPosition);
                    this.modelGroup.position.copy(teleportPosition);
                    
                    // Create skill effect at the new position
                    const skillEffect = skill.createEffect(this.position, this.rotation);
                    
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
    
    // Left jab - quick straight punch with left hand
    createLeftPunchAnimation() {
        // Get the left arm of the player model
        const leftArm = this.modelGroup.children.find(child => 
            child.position.x < 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        if (!leftArm) return;
        
        // Store original rotation
        const originalRotation = leftArm.rotation.clone();
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Quick wind up
            leftArm.rotation.z = Math.PI / 6; // Pull back slightly
            
            // After a short delay, punch forward
            setTimeout(() => {
                // Punch forward animation - straight jab
                leftArm.rotation.z = Math.PI / 3; // Extend forward
                
                // Create punch effect - blue color for left hand
                this.createPunchEffect('left', 0x4169e1); // Royal blue
                
                // Return to original position quickly (jab is fast)
                setTimeout(() => {
                    leftArm.rotation.copy(originalRotation);
                }, 100);
            }, 30);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Right cross - powerful straight punch with right hand
    createRightPunchAnimation() {
        // Get the right arm of the player model
        const rightArm = this.modelGroup.children.find(child => 
            child.position.x > 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        if (!rightArm) return;
        
        // Store original rotation
        const originalRotation = rightArm.rotation.clone();
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (pull arm back)
            rightArm.rotation.z = -Math.PI / 5; // Pull back
            
            // After a short delay, punch forward
            setTimeout(() => {
                // Punch forward animation - cross punch
                rightArm.rotation.z = -Math.PI / 2.5; // Extend further forward
                
                // Create punch effect - red color for right hand
                this.createPunchEffect('right', 0xff4500); // OrangeRed
                
                // Return to original position after the punch
                setTimeout(() => {
                    rightArm.rotation.copy(originalRotation);
                }, 150);
            }, 50);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Left hook - circular punch with left hand
    createLeftHookAnimation() {
        // Get the left arm and torso of the player model
        const leftArm = this.modelGroup.children.find(child => 
            child.position.x < 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        const torso = this.modelGroup.children.find(child => 
            Math.abs(child.position.x) < 0.1 && Math.abs(child.position.y - 0.6) < 0.3);
        
        if (!leftArm) return;
        
        // Store original rotations
        const originalArmRotation = leftArm.rotation.clone();
        const originalTorsoRotation = torso ? torso.rotation.clone() : null;
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (rotate torso slightly)
            if (torso) {
                torso.rotation.y = -Math.PI / 12; // Rotate torso right
            }
            
            // Pull arm back and to the side
            leftArm.rotation.z = Math.PI / 8;
            leftArm.rotation.y = -Math.PI / 8;
            
            // After a short delay, execute hook
            setTimeout(() => {
                // Hook punch animation - circular motion
                leftArm.rotation.z = Math.PI / 2.5; // Extend arm
                leftArm.rotation.y = Math.PI / 6; // Swing from side
                
                if (torso) {
                    torso.rotation.y = Math.PI / 12; // Rotate torso left
                }
                
                // Create punch effect - purple color for hook
                this.createPunchEffect('left-hook', 0x9932cc); // DarkOrchid
                
                // Return to original position after the punch
                setTimeout(() => {
                    leftArm.rotation.copy(originalArmRotation);
                    if (torso && originalTorsoRotation) {
                        torso.rotation.copy(originalTorsoRotation);
                    }
                }, 200);
            }, 70);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Heavy uppercut - powerful upward punch with right hand
    createHeavyPunchAnimation() {
        // Get the right arm and torso of the player model
        const rightArm = this.modelGroup.children.find(child => 
            child.position.x > 0 && Math.abs(child.position.y - 0.6) < 0.1);
        
        const torso = this.modelGroup.children.find(child => 
            Math.abs(child.position.x) < 0.1 && Math.abs(child.position.y - 0.6) < 0.3);
        
        if (!rightArm) return;
        
        // Store original rotations
        const originalArmRotation = rightArm.rotation.clone();
        const originalTorsoRotation = torso ? torso.rotation.clone() : null;
        
        // Create punch animation sequence
        const punchSequence = () => {
            // Wind up animation (crouch slightly)
            if (torso) {
                torso.position.y -= 0.2; // Lower torso
                torso.rotation.x = Math.PI / 12; // Lean forward
            }
            
            // Pull arm down and back
            rightArm.rotation.x = Math.PI / 6; // Pull down
            rightArm.rotation.z = -Math.PI / 8; // Pull back
            
            // After a delay, execute uppercut
            setTimeout(() => {
                // Uppercut animation - upward motion
                rightArm.rotation.x = -Math.PI / 4; // Swing upward
                rightArm.rotation.z = -Math.PI / 2; // Extend arm
                
                if (torso) {
                    torso.position.y += 0.3; // Rise up
                    torso.rotation.x = -Math.PI / 12; // Lean back
                }
                
                // Create heavy punch effect - fiery red/orange for uppercut
                this.createHeavyPunchEffect();
                
                // Return to original position after the punch
                setTimeout(() => {
                    rightArm.rotation.copy(originalArmRotation);
                    if (torso && originalTorsoRotation) {
                        torso.rotation.copy(originalTorsoRotation);
                        torso.position.y -= 0.1; // Reset height
                    }
                }, 300);
            }, 100);
        };
        
        // Execute punch animation sequence
        punchSequence();
    }
    
    // Standard punch effect for normal punches
    createPunchEffect(hand, color) {
        // Calculate position in front of the player based on hand
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
        let sideOffset = 0;
        
        // Adjust position based on which hand is punching
        if (hand === 'left') {
            sideOffset = -0.3;
        } else if (hand === 'right') {
            sideOffset = 0.3;
        } else if (hand === 'left-hook') {
            sideOffset = -0.4;
            // Adjust direction for hook punch
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8);
        }
        
        // Calculate final punch position
        const punchPosition = new THREE.Vector3(
            this.position.x + direction.x * 1.2 + (direction.z * sideOffset),
            this.position.y + 0.6, // At arm height
            this.position.z + direction.z * 1.2 - (direction.x * sideOffset)
        );
        
        // Create main punch effect (sphere)
        const punchGeometry = new THREE.SphereGeometry(0.3, 12, 12);
        const punchMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        const punchMesh = new THREE.Mesh(punchGeometry, punchMaterial);
        punchMesh.position.copy(punchPosition);
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create secondary effect (ring)
        const ringGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // White color
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(punchPosition);
        ringMesh.lookAt(this.position); // Orient ring to face player
        
        // Add ring to scene
        this.scene.add(ringMesh);
        
        // Create impact lines (small cylinders radiating outward)
        const impactLines = [];
        const numLines = 8;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).applyEuler(new THREE.Euler(0, this.rotation.y, 0));
            
            const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.7
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.3));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial
            });
        }
        
        // Animate the punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.8;
        let ringScale = 1.0;
        let ringOpacity = 0.6;
        
        const animatePunch = () => {
            // Update main punch effect
            mainScale += 0.15;
            mainOpacity -= 0.06;
            punchMesh.scale.set(mainScale, mainScale, mainScale);
            punchMaterial.opacity = mainOpacity;
            
            // Update ring effect
            ringScale += 0.2;
            ringOpacity -= 0.05;
            ringMesh.scale.set(ringScale, ringScale, ringScale);
            ringMaterial.opacity = ringOpacity;
            
            // Update impact lines
            impactLines.forEach(line => {
                // Move line outward
                line.mesh.position.add(line.direction.clone().multiplyScalar(0.1));
                
                // Fade out
                line.material.opacity -= 0.05;
            });
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animatePunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                this.scene.remove(ringMesh);
                impactLines.forEach(line => this.scene.remove(line.mesh));
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMaterial.dispose();
                ringGeometry.dispose();
                ringMaterial.dispose();
                impactLines.forEach(line => {
                    line.geometry.dispose();
                    line.material.dispose();
                });
            }
        };
        
        // Start animation
        animatePunch();
    }
    
    // Special effect for the heavy uppercut (combo finisher)
    createHeavyPunchEffect() {
        // Calculate position in front of the player
        const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
        const punchPosition = new THREE.Vector3(
            this.position.x + direction.x * 1.3 + (direction.z * 0.3),
            this.position.y + 0.8, // Slightly higher for uppercut
            this.position.z + direction.z * 1.3 - (direction.x * 0.3)
        );
        
        // Create main punch effect (larger sphere)
        const punchGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const punchMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300, // Fiery orange-red
            transparent: true,
            opacity: 0.9
        });
        
        const punchMesh = new THREE.Mesh(punchGeometry, punchMaterial);
        punchMesh.position.copy(punchPosition);
        
        // Add to scene
        this.scene.add(punchMesh);
        
        // Create shockwave ring
        const ringGeometry = new THREE.RingGeometry(0.3, 0.6, 24);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xff7700, // Orange
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.position.copy(punchPosition);
        ringMesh.lookAt(this.position); // Orient ring to face player
        
        // Add ring to scene
        this.scene.add(ringMesh);
        
        // Create secondary smaller rings
        const smallRings = [];
        for (let i = 0; i < 3; i++) {
            const smallRingGeometry = new THREE.RingGeometry(0.1 + (i * 0.1), 0.2 + (i * 0.1), 16);
            const smallRingMaterial = new THREE.MeshBasicMaterial({
                color: i === 0 ? 0xffff00 : (i === 1 ? 0xff9900 : 0xff3300), // Yellow to orange to red
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const smallRingMesh = new THREE.Mesh(smallRingGeometry, smallRingMaterial);
            smallRingMesh.position.copy(punchPosition);
            smallRingMesh.lookAt(this.position);
            
            // Add to scene and store reference
            this.scene.add(smallRingMesh);
            smallRings.push({
                mesh: smallRingMesh,
                geometry: smallRingGeometry,
                material: smallRingMaterial,
                initialScale: 1.0 + (i * 0.3)
            });
        }
        
        // Create fire particles
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            // Random direction with upward bias
            const angle = Math.random() * Math.PI * 2;
            const particleDirection = new THREE.Vector3(
                Math.cos(angle) * 0.7,
                0.5 + Math.random() * 0.5, // Upward bias
                Math.sin(angle) * 0.7
            ).normalize();
            
            // Create particle
            const size = 0.05 + Math.random() * 0.15;
            const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
            
            // Random color from yellow to red
            const colorValue = Math.random();
            let particleColor;
            if (colorValue < 0.3) {
                particleColor = 0xffff00; // Yellow
            } else if (colorValue < 0.6) {
                particleColor = 0xff9900; // Orange
            } else {
                particleColor = 0xff3300; // Red
            }
            
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position at punch point
            particle.position.copy(punchPosition);
            
            // Add to scene and store reference
            this.scene.add(particle);
            particles.push({
                mesh: particle,
                direction: particleDirection,
                speed: 0.05 + Math.random() * 0.15,
                geometry: particleGeometry,
                material: particleMaterial,
                gravity: 0.003 + Math.random() * 0.002
            });
        }
        
        // Create impact lines (thicker for heavy punch)
        const impactLines = [];
        const numLines = 12;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const lineDirection = new THREE.Vector3(
                Math.cos(angle),
                Math.sin(angle),
                0
            ).applyEuler(new THREE.Euler(0, this.rotation.y, 0));
            
            const lineGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 4);
            const lineMaterial = new THREE.MeshBasicMaterial({
                color: 0xff5500,
                transparent: true,
                opacity: 0.8
            });
            
            const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
            
            // Position and rotate line
            lineMesh.position.copy(punchPosition);
            lineMesh.position.add(lineDirection.multiplyScalar(0.4));
            
            // Rotate to point outward
            lineMesh.lookAt(punchPosition.clone().add(lineDirection));
            lineMesh.rotateX(Math.PI / 2);
            
            // Add to scene and store reference
            this.scene.add(lineMesh);
            impactLines.push({
                mesh: lineMesh,
                direction: lineDirection.normalize(),
                geometry: lineGeometry,
                material: lineMaterial
            });
        }
        
        // Animate the heavy punch effect
        let mainScale = 1.0;
        let mainOpacity = 0.9;
        let ringScale = 1.0;
        let ringOpacity = 0.8;
        let time = 0;
        
        const animateHeavyPunch = () => {
            time += 0.05;
            
            // Update main punch effect
            mainScale += 0.2;
            mainOpacity -= 0.04;
            punchMesh.scale.set(mainScale, mainScale, mainScale);
            punchMaterial.opacity = mainOpacity;
            
            // Update main ring effect
            ringScale += 0.25;
            ringOpacity -= 0.04;
            ringMesh.scale.set(ringScale, ringScale, ringScale);
            ringMaterial.opacity = ringOpacity;
            
            // Update small rings with pulsing effect
            smallRings.forEach((ring, index) => {
                const pulseScale = ring.initialScale + Math.sin(time * 3 + index) * 0.2;
                ring.mesh.scale.set(pulseScale + (time * 0.2), pulseScale + (time * 0.2), pulseScale + (time * 0.2));
                ring.material.opacity = Math.max(0, 0.7 - (time * 0.1));
            });
            
            // Update particles
            particles.forEach(particle => {
                // Apply gravity (reduce y component)
                particle.direction.y -= particle.gravity;
                
                // Move particle
                particle.mesh.position.add(
                    particle.direction.clone().multiplyScalar(particle.speed)
                );
                
                // Fade out
                particle.material.opacity -= 0.02;
                
                // Shrink slightly
                particle.mesh.scale.multiplyScalar(0.97);
            });
            
            // Update impact lines
            impactLines.forEach(line => {
                // Move line outward faster
                line.mesh.position.add(line.direction.clone().multiplyScalar(0.15));
                
                // Fade out
                line.material.opacity -= 0.04;
            });
            
            // Continue animation until main effect is nearly invisible
            if (mainOpacity > 0) {
                requestAnimationFrame(animateHeavyPunch);
            } else {
                // Remove all effects from scene
                this.scene.remove(punchMesh);
                this.scene.remove(ringMesh);
                
                smallRings.forEach(ring => {
                    this.scene.remove(ring.mesh);
                    ring.geometry.dispose();
                    ring.material.dispose();
                });
                
                particles.forEach(particle => {
                    this.scene.remove(particle.mesh);
                    particle.geometry.dispose();
                    particle.material.dispose();
                });
                
                impactLines.forEach(line => {
                    this.scene.remove(line.mesh);
                    line.geometry.dispose();
                    line.material.dispose();
                });
                
                // Dispose geometries and materials
                punchGeometry.dispose();
                punchMaterial.dispose();
                ringGeometry.dispose();
                ringMaterial.dispose();
            }
        };
        
        // Start animation
        animateHeavyPunch();
    }
    
    setGame(game) {
        this.game = game;
    }
    
    isInteracting() {
        return this.state.isInteracting;
    }
    
    setInteracting(isInteracting) {
        this.state.isInteracting = isInteracting;
    }
    
    interact() {
        this.state.isInteracting = true;
    }
    
    setInWater(inWater) {
        this.state.inWater = inWater;
    }
}