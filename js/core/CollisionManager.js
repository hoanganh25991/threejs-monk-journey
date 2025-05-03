import * as THREE from 'three';

export class CollisionManager {
    constructor(player, enemyManager, world) {
        this.player = player;
        this.enemyManager = enemyManager;
        this.world = world;
        this.collisionDistance = 1.0; // Default collision distance
    }
    
    update() {
        // Check player-enemy collisions
        this.checkPlayerEnemyCollisions();
        
        // Check player-object collisions
        this.checkPlayerObjectCollisions();
        
        // Check player-terrain collisions
        this.checkPlayerTerrainCollisions();
        
        // Check player skill-enemy collisions
        this.checkSkillEnemyCollisions();
        
        // Check enemy-enemy collisions
        this.checkEnemyEnemyCollisions();
    }
    
    checkPlayerEnemyCollisions() {
        const playerPosition = this.player.getPosition();
        const playerRadius = this.player.getCollisionRadius();
        
        // Check collision with each enemy
        this.enemyManager.enemies.forEach(enemy => {
            const enemyPosition = enemy.getPosition();
            const enemyRadius = enemy.getCollisionRadius();
            
            // Calculate distance between player and enemy
            const distance = playerPosition.distanceTo(enemyPosition);
            
            // Check if collision occurred
            if (distance < playerRadius + enemyRadius) {
                // Handle collision
                this.handlePlayerEnemyCollision(enemy);
            }
        });
    }
    
    handlePlayerEnemyCollision(enemy) {
        // Push player away from enemy
        const playerPosition = this.player.getPosition();
        const enemyPosition = enemy.getPosition();
        
        // Calculate direction from enemy to player
        const direction = new THREE.Vector3().subVectors(playerPosition, enemyPosition).normalize();
        
        // Move player away from enemy
        const pushDistance = 0.1;
        this.player.setPosition(
            playerPosition.x + direction.x * pushDistance,
            playerPosition.y,
            playerPosition.z + direction.z * pushDistance
        );
    }
    
    checkPlayerObjectCollisions() {
        const playerPosition = this.player.getPosition();
        const playerRadius = this.player.getCollisionRadius();
        
        // Check collision with each object
        this.world.objects.forEach(object => {
            // Get object bounding box
            const boundingBox = new THREE.Box3().setFromObject(object);
            
            // Create a sphere that encompasses the bounding box
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            const objectRadius = Math.max(size.x, size.z) / 2;
            
            // Calculate distance between player and object center
            const distance = new THREE.Vector2(playerPosition.x, playerPosition.z)
                .distanceTo(new THREE.Vector2(center.x, center.z));
            
            // Check if collision occurred
            if (distance < playerRadius + objectRadius) {
                // Handle collision
                this.handlePlayerObjectCollision(object, center);
            }
        });
        
        // Check collision with interactive objects
        this.checkPlayerInteractiveObjectsCollisions();
    }
    
    checkPlayerInteractiveObjectsCollisions() {
        const playerPosition = this.player.getPosition();
        
        // Get nearby interactive objects
        const interactiveObjects = this.world.getInteractiveObjectsNear(
            playerPosition, 
            5 // Interaction radius
        );
        
        // Check if player is pressing the interaction key
        if (this.player.isInteracting() && interactiveObjects.length > 0) {
            // Find the closest interactive object
            let closestObject = interactiveObjects[0];
            let closestDistance = playerPosition.distanceTo(closestObject.position);
            
            for (let i = 1; i < interactiveObjects.length; i++) {
                const distance = playerPosition.distanceTo(interactiveObjects[i].position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestObject = interactiveObjects[i];
                }
            }
            
            // Handle interaction
            this.handleInteraction(closestObject);
        }
    }
    
    handleInteraction(interactiveObject) {
        // Call the object's interaction handler
        const result = interactiveObject.onInteract();
        
        // Handle different interaction types
        switch (result.type) {
            case 'quest':
                // Handle quest interaction
                if (this.player.game && this.player.game.questManager) {
                    this.player.game.questManager.startQuest(result.quest);
                }
                break;
                
            case 'treasure':
                // Handle treasure interaction
                if (this.player.game && this.player.game.uiManager) {
                    this.player.game.uiManager.showNotification(`Found ${result.item.name}!`);
                    this.player.addToInventory(result.item);
                }
                break;
                
            case 'boss_spawn':
                // Handle boss spawn interaction
                if (this.player.game && this.player.game.enemyManager) {
                    // Show notification
                    if (this.player.game.uiManager) {
                        this.player.game.uiManager.showNotification(result.message, 5);
                    }
                    
                    // Spawn the boss
                    this.player.game.enemyManager.spawnBoss(
                        result.bossType,
                        interactiveObject.position
                    );
                }
                break;
                
            default:
                console.warn(`Unknown interaction type: ${result.type}`);
                break;
        }
        
        // Reset interaction state
        this.player.setInteracting(false);
    }
    
    handlePlayerObjectCollision(object, objectCenter) {
        const playerPosition = this.player.getPosition();
        
        // Calculate direction from object to player
        const direction = new THREE.Vector2(
            playerPosition.x - objectCenter.x,
            playerPosition.z - objectCenter.z
        ).normalize();
        
        // Move player away from object
        const pushDistance = 0.1;
        this.player.setPosition(
            playerPosition.x + direction.x * pushDistance,
            playerPosition.y,
            playerPosition.z + direction.z * pushDistance
        );
    }
    
    checkPlayerTerrainCollisions() {
        const playerPosition = this.player.getPosition();
        
        // Validate player position
        if (isNaN(playerPosition.x) || isNaN(playerPosition.y) || isNaN(playerPosition.z)) {
            console.warn("Invalid player position in terrain collision check:", playerPosition);
            // Reset player to a safe position
            this.player.setPosition(0, 2, 0);
            return;
        }
        
        // Get terrain height at player position
        const terrainHeight = this.world.getTerrainHeight(playerPosition.x, playerPosition.z);
        
        // Validate terrain height
        if (isNaN(terrainHeight)) {
            console.warn("Invalid terrain height calculated:", terrainHeight);
            // Use a safe default height
            const safeHeight = 2;
            this.player.setPosition(playerPosition.x, safeHeight, playerPosition.z);
            return;
        }
        
        // Adjust player height to terrain height
        this.player.setPosition(
            playerPosition.x,
            terrainHeight + this.player.getHeightOffset(),
            playerPosition.z
        );
        
        // Check if player is in water
        if (terrainHeight < this.world.water.position.y) {
            // Player is in water, apply water effects
            this.player.setInWater(true);
        } else {
            this.player.setInWater(false);
        }
    }
    
    checkSkillEnemyCollisions() {
        // Get active player skills
        const activeSkills = this.player.getActiveSkills();
        
        // Check each active skill for collisions with enemies
        activeSkills.forEach(skill => {
            const skillPosition = skill.getPosition();
            const skillRadius = skill.getRadius();
            
            // Check collision with each enemy
            this.enemyManager.enemies.forEach(enemy => {
                const enemyPosition = enemy.getPosition();
                const enemyRadius = enemy.getCollisionRadius();
                
                // Calculate distance between skill and enemy
                const distance = skillPosition.distanceTo(enemyPosition);
                
                // Check if collision occurred
                if (distance < skillRadius + enemyRadius) {
                    // Handle collision
                    this.handleSkillEnemyCollision(skill, enemy);
                }
            });
        });
    }
    
    handleSkillEnemyCollision(skill, enemy) {
        // Apply skill damage to enemy
        const damage = skill.getDamage();
        enemy.takeDamage(damage);
        
        // Show damage number
        this.player.game.uiManager.showDamageNumber(damage, enemy.getPosition());
        
        // Check if enemy is defeated
        if (enemy.getHealth() <= 0) {
            // Award experience to player
            this.player.addExperience(enemy.getExperienceValue());
            
            // Check for quest completion
            this.player.game.questManager.updateEnemyKill(enemy);
        }
    }
    
    checkEnemyEnemyCollisions() {
        const enemies = this.enemyManager.enemies;
        
        // Check each pair of enemies for collisions
        for (let i = 0; i < enemies.length; i++) {
            for (let j = i + 1; j < enemies.length; j++) {
                const enemy1 = enemies[i];
                const enemy2 = enemies[j];
                
                const position1 = enemy1.getPosition();
                const position2 = enemy2.getPosition();
                
                const radius1 = enemy1.getCollisionRadius();
                const radius2 = enemy2.getCollisionRadius();
                
                // Calculate distance between enemies
                const distance = position1.distanceTo(position2);
                
                // Check if collision occurred
                if (distance < radius1 + radius2) {
                    // Handle collision
                    this.handleEnemyEnemyCollision(enemy1, enemy2);
                }
            }
        }
    }
    
    handleEnemyEnemyCollision(enemy1, enemy2) {
        const position1 = enemy1.getPosition();
        const position2 = enemy2.getPosition();
        
        // Calculate direction from enemy2 to enemy1
        const direction = new THREE.Vector3().subVectors(position1, position2).normalize();
        
        // Move enemies away from each other
        const pushDistance = 0.05;
        
        enemy1.setPosition(
            position1.x + direction.x * pushDistance,
            position1.y,
            position1.z + direction.z * pushDistance
        );
        
        enemy2.setPosition(
            position2.x - direction.x * pushDistance,
            position2.y,
            position2.z - direction.z * pushDistance
        );
    }
}