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
            movementSpeed: 5,
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
        // Initialize monk skills with reduced cooldown (0.5 seconds for all skills)
        this.skills = [
            new Skill({
                name: 'Wave Strike',
                description: 'Send a wave of energy towards enemies',
                type: 'ranged',
                damage: 20,
                manaCost: 15,
                cooldown: 0.1, // Reduced cooldown
                range: 10,
                radius: 2,
                duration: 1,
                color: 0x00ffff
            }),
            new Skill({
                name: 'Cyclone Strike',
                description: 'Pull enemies towards you and deal area damage',
                type: 'aoe',
                damage: 15,
                manaCost: 25,
                cooldown: 0.1, // Reduced cooldown
                range: 5,
                radius: 4,
                duration: 0.5,
                color: 0xffcc00
            }),
            new Skill({
                name: 'Seven-Sided Strike',
                description: 'Rapidly attack multiple enemies',
                type: 'multi',
                damage: 10,
                manaCost: 30,
                cooldown: 0.1, // Reduced cooldown
                range: 6,
                radius: 1,
                duration: 2,
                color: 0xff0000,
                hits: 7
            }),
            new Skill({
                name: 'Inner Sanctuary',
                description: 'Create a protective zone that reduces damage',
                type: 'buff',
                damage: 0,
                manaCost: 20,
                cooldown: 0.1, // Reduced cooldown
                range: 0,
                radius: 3,
                duration: 5,
                color: 0xffffff
            }),
            new Skill({
                name: 'Mystic Ally',
                description: 'Summon a spirit ally to fight alongside you',
                type: 'summon',
                damage: 8,
                manaCost: 35,
                cooldown: 0.1, // Reduced cooldown
                range: 2,
                radius: 1,
                duration: 10,
                color: 0x00ffff
            }),
            new Skill({
                name: 'Wave of Light',
                description: 'Slam the ground creating a wave of holy light',
                type: 'wave',
                damage: 30,
                manaCost: 40,
                cooldown: 0.1, // Reduced cooldown
                range: 8,
                radius: 2,
                duration: 1,
                color: 0xffffaa
            }),
            new Skill({
                name: 'Exploding Palm',
                description: 'Mark enemies to explode on death, dealing damage to nearby enemies',
                type: 'mark',
                damage: 15,
                manaCost: 25,
                cooldown: 0.1, // Reduced cooldown
                range: 2,
                radius: 3,
                duration: 5,
                color: 0xff3333
            })
        ];
    }
    
    update(delta) {
        // Update movement
        this.updateMovement(delta);
        
        // Update camera
        this.updateCamera();
        
        // Update skills
        this.updateSkills(delta);
        
        // Update animations
        this.updateAnimations(delta);
        
        // Regenerate resources
        this.regenerateResources(delta);
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
                
                // Calculate new position
                const newPosition = new THREE.Vector3(
                    this.position.x + direction.x * step,
                    this.position.y,
                    this.position.z + direction.z * step
                );
                
                // Get terrain height at new position
                if (this.game && this.game.world) {
                    const terrainHeight = this.game.world.getTerrainHeight(newPosition.x, newPosition.z);
                    newPosition.y = terrainHeight + this.heightOffset;
                }
                
                // Update position
                this.setPosition(newPosition.x, newPosition.y, newPosition.z);
                
                // Update rotation to face movement direction
                this.rotation.y = Math.atan2(direction.x, direction.z);
                this.modelGroup.rotation.y = this.rotation.y;
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
        const cameraOffset = new THREE.Vector3(0, 15, 30);
        
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
            const skill = this.activeSkills[i];
            
            // Update skill
            skill.update(delta);
            
            // Remove expired skills
            if (skill.isExpired()) {
                skill.remove();
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
        
        // Create skill effect
        const skillEffect = skill.createEffect(this.position, this.rotation);
        
        // Add skill effect to scene
        this.scene.add(skillEffect);
        
        // Play skill sound
        if (this.game && this.game.audioManager) {
            // Play specific skill sound based on skill name
            switch (skill.name) {
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
                default:
                    // Generic skill sound
                    this.game.audioManager.playSound('playerAttack');
            }
        }
        
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
        
        // Update model position
        this.modelGroup.position.copy(this.position);
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