import * as THREE from 'three';
import { Enemy } from './Enemy.js';

export class EnemyManager {
    constructor(scene, player, loadingManager) {
        this.scene = scene;
        this.player = player;
        this.loadingManager = loadingManager;
        this.enemies = [];
        this.maxEnemies = 30; // Increased max enemies for world exploration
        this.spawnRadius = 30;
        this.spawnTimer = 0;
        this.spawnInterval = 5; // Spawn enemy every 5 seconds
        this.game = null; // Will be set by Game.js
        
        // For chunk-based enemy spawning
        this.enemyChunks = {}; // Track enemies per chunk
        this.enemiesPerChunk = 5; // Number of enemies to spawn per chunk
        this.chunkSpawnRadius = 80; // Radius within chunk to spawn enemies
        this.enemyGroupSize = { min: 2, max: 5 }; // Enemies spawn in groups
        
        // Zone-based enemy spawning
        this.zoneEnemies = {
            'forest': ['skeleton', 'zombie', 'shadow_beast'],
            'ruins': ['skeleton', 'skeleton_archer', 'necromancer'],
            'swamp': ['zombie', 'zombie_brute', 'shadow_beast'],
            'mountains': ['demon', 'demon_scout', 'infernal_golem'],
            'dark_sanctum': ['necromancer', 'shadow_beast', 'infernal_golem']
        };
        
        // Enemy types
        this.enemyTypes = [
            {
                type: 'skeleton',
                name: 'Skeleton',
                health: 50,
                damage: 10,
                speed: 3,
                attackRange: 1.5,
                attackSpeed: 1.5,
                experienceValue: 20,
                color: 0xcccccc,
                behavior: 'aggressive',
                zone: 'ruins'
            },
            {
                type: 'skeleton_archer',
                name: 'Skeleton Archer',
                health: 40,
                damage: 15,
                speed: 2.5,
                attackRange: 8,
                attackSpeed: 2,
                experienceValue: 25,
                color: 0xddccbb,
                behavior: 'ranged',
                zone: 'ruins'
            },
            {
                type: 'zombie',
                name: 'Zombie',
                health: 80,
                damage: 15,
                speed: 2,
                attackRange: 1.2,
                attackSpeed: 1,
                experienceValue: 30,
                color: 0x88aa88,
                behavior: 'slow',
                zone: 'swamp'
            },
            {
                type: 'zombie_brute',
                name: 'Zombie Brute',
                health: 120,
                damage: 25,
                speed: 1.5,
                attackRange: 1.8,
                attackSpeed: 0.8,
                experienceValue: 45,
                color: 0x668866,
                behavior: 'tank',
                zone: 'swamp'
            },
            {
                type: 'demon',
                name: 'Demon',
                health: 100,
                damage: 20,
                speed: 4,
                attackRange: 1.8,
                attackSpeed: 2,
                experienceValue: 50,
                color: 0xaa3333,
                behavior: 'aggressive',
                zone: 'mountains'
            },
            {
                type: 'demon_scout',
                name: 'Demon Scout',
                health: 70,
                damage: 15,
                speed: 5,
                attackRange: 1.5,
                attackSpeed: 2.5,
                experienceValue: 40,
                color: 0xcc5555,
                behavior: 'flanker',
                zone: 'mountains'
            },
            {
                type: 'necromancer',
                name: 'Necromancer',
                health: 80,
                damage: 18,
                speed: 2.5,
                attackRange: 6,
                attackSpeed: 1.8,
                experienceValue: 45,
                color: 0x330033,
                behavior: 'caster',
                zone: 'ruins'
            },
            {
                type: 'shadow_beast',
                name: 'Shadow Beast',
                health: 90,
                damage: 22,
                speed: 3.5,
                attackRange: 1.5,
                attackSpeed: 2.2,
                experienceValue: 55,
                color: 0x000000,
                behavior: 'ambusher',
                zone: 'forest'
            },
            {
                type: 'infernal_golem',
                name: 'Infernal Golem',
                health: 150,
                damage: 30,
                speed: 1.8,
                attackRange: 2.0,
                attackSpeed: 1.0,
                experienceValue: 70,
                color: 0x333333,
                behavior: 'tank',
                zone: 'mountains'
            }
        ];
        
        // Boss types
        this.bossTypes = [
            {
                type: 'skeleton_king',
                name: 'Skeleton King',
                health: 300,
                damage: 25,
                speed: 2.5,
                attackRange: 2,
                attackSpeed: 1.2,
                experienceValue: 200,
                color: 0xcccccc,
                scale: 2,
                isBoss: true,
                behavior: 'boss',
                zone: 'ruins',
                abilities: ['summon_minions', 'ground_slam']
            },
            {
                type: 'swamp_horror',
                name: 'Swamp Horror',
                health: 400,
                damage: 30,
                speed: 1.8,
                attackRange: 2.2,
                attackSpeed: 1,
                experienceValue: 250,
                color: 0x446644,
                scale: 2.2,
                isBoss: true,
                behavior: 'boss',
                zone: 'swamp',
                abilities: ['poison_cloud', 'tentacle_grab']
            },
            {
                type: 'demon_lord',
                name: 'Demon Lord',
                health: 500,
                damage: 35,
                speed: 3,
                attackRange: 2.5,
                attackSpeed: 1.5,
                experienceValue: 300,
                color: 0xaa3333,
                scale: 2.5,
                isBoss: true,
                behavior: 'boss',
                zone: 'mountains',
                abilities: ['fire_nova', 'teleport']
            },
            {
                type: 'frost_titan',
                name: 'Frost Titan',
                health: 600,
                damage: 40,
                speed: 2.0,
                attackRange: 3,
                attackSpeed: 1.0,
                experienceValue: 350,
                color: 0x88ccff,
                scale: 3,
                isBoss: true,
                behavior: 'boss',
                zone: 'mountains',
                abilities: ['ice_storm', 'frost_nova', 'ice_barrier']
            },
            {
                type: 'necromancer_lord',
                name: 'Necromancer Lord',
                health: 550,
                damage: 35,
                speed: 2.2,
                attackRange: 8,
                attackSpeed: 1.5,
                experienceValue: 320,
                color: 0x330033,
                scale: 2.2,
                isBoss: true,
                behavior: 'boss',
                zone: 'dark_sanctum',
                abilities: ['summon_undead', 'death_nova', 'life_drain']
            }
        ];
        
        // Difficulty scaling
        this.difficultyMultiplier = 1.0;
    }
    
    setGame(game) {
        this.game = game;
    }
    
    async init() {
        // Spawn initial enemies
        for (let i = 0; i < this.maxEnemies / 2; i++) {
            this.spawnEnemy();
        }
        
        return true;
    }
    
    update(delta) {
        // Update spawn timer
        this.spawnTimer += delta;
        
        // Spawn new enemies if needed
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Update enemy
            enemy.update(delta);
            
            // Remove dead enemies
            if (enemy.isDead()) {
                // Check for quest updates
                if (this.game && this.game.questManager) {
                    this.game.questManager.updateEnemyKill(enemy);
                }
                
                // Check for item drops
                this.handleEnemyDrop(enemy);
                
                // Remove enemy
                enemy.remove();
                this.enemies.splice(i, 1);
            }
        }
    }
    
    spawnEnemy(specificType = null, position = null) {
        let enemyType;
        
        if (specificType) {
            // Use specified enemy type
            enemyType = this.enemyTypes.find(type => type.type === specificType) || 
                        this.bossTypes.find(type => type.type === specificType);
            
            if (!enemyType) {
                console.warn(`Enemy type ${specificType} not found, using random type`);
                enemyType = this.getRandomEnemyType();
            }
        } else {
            // Get random enemy type based on current zone
            enemyType = this.getRandomEnemyType();
        }
        
        // Apply difficulty scaling
        const scaledEnemyType = this.applyDifficultyScaling(enemyType);
        
        // Get position
        const spawnPosition = position || this.getRandomSpawnPosition();
        
        // Create enemy
        const enemy = new Enemy(this.scene, this.player, scaledEnemyType);
        
        // Set world reference for terrain height
        if (this.game && this.game.world) {
            enemy.world = this.game.world;
            
            // Adjust initial position to be on terrain
            if (spawnPosition) {
                const terrainHeight = this.game.world.getTerrainHeight(spawnPosition.x, spawnPosition.z);
                spawnPosition.y = terrainHeight + enemy.heightOffset;
            }
        }
        
        enemy.init();
        enemy.setPosition(spawnPosition.x, spawnPosition.y, spawnPosition.z);
        
        // Add to enemies array
        this.enemies.push(enemy);
        
        return enemy;
    }
    
    getRandomEnemyType() {
        // Get current zone if available
        let currentZone = 'forest'; // Default zone
        
        if (this.game && this.game.world) {
            const playerPosition = this.player.getPosition();
            const zone = this.game.world.getZoneAt(playerPosition);
            
            if (zone) {
                currentZone = zone.name.toLowerCase();
            }
        }
        
        // Get enemy types for this zone
        const zoneEnemyTypes = this.zoneEnemies[currentZone] || Object.keys(this.zoneEnemies)[0];
        
        // Select a random enemy type from the zone
        const randomTypeId = zoneEnemyTypes[Math.floor(Math.random() * zoneEnemyTypes.length)];
        
        // Find the enemy type object
        return this.enemyTypes.find(type => type.type === randomTypeId) || this.enemyTypes[0];
    }
    
    applyDifficultyScaling(enemyType) {
        // Create a copy of the enemy type to modify
        const scaledType = { ...enemyType };
        
        // Apply difficulty multiplier to stats
        scaledType.health = Math.round(scaledType.health * this.difficultyMultiplier);
        scaledType.damage = Math.round(scaledType.damage * this.difficultyMultiplier);
        scaledType.experienceValue = Math.round(scaledType.experienceValue * this.difficultyMultiplier);
        
        return scaledType;
    }
    
    handleEnemyDrop(enemy) {
        // Check if enemy should drop an item
        const dropChance = enemy.isBoss ? 1.0 : 0.2; // 100% for bosses, 20% for regular enemies
        
        if (Math.random() < dropChance) {
            // Determine item type
            let item;
            
            if (enemy.isBoss) {
                // Boss drops are better
                item = this.generateBossDrop(enemy);
            } else {
                // Regular enemy drops
                item = this.generateRegularDrop(enemy);
            }
            
            // Add item to player inventory
            if (this.game && this.game.player && item) {
                this.game.player.addToInventory(item);
                
                // Show notification
                if (this.game.uiManager) {
                    this.game.uiManager.showNotification(`Found ${item.name}`);
                }
            }
        }
    }
    
    generateRegularDrop(enemy) {
        // Simple drop table
        const dropTable = [
            { name: 'Health Potion', amount: 1, weight: 40 },
            { name: 'Mana Potion', amount: 1, weight: 30 },
            { name: 'Gold Coin', amount: Math.floor(5 + Math.random() * 20), weight: 20 },
            { name: 'Common Weapon', type: 'weapon', damage: 5 + Math.floor(Math.random() * 5), damageReduction: 0, amount: 1, weight: 5 },
            { name: 'Common Armor', type: 'armor', damage: 0, damageReduction: 0.05 + Math.random() * 0.05, amount: 1, weight: 5 }
        ];
        
        return this.selectWeightedItem(dropTable);
    }
    
    generateBossDrop(enemy) {
        // Boss drop table
        const dropTable = [
            { name: 'Greater Health Potion', amount: 2, weight: 20 },
            { name: 'Greater Mana Potion', amount: 2, weight: 15 },
            { name: 'Gold Pile', amount: Math.floor(50 + Math.random() * 100), weight: 20 },
            { name: 'Rare Weapon', type: 'weapon', damage: 15 + Math.floor(Math.random() * 10), damageReduction: 0, amount: 1, weight: 15 },
            { name: 'Rare Armor', type: 'armor', damage: 0, damageReduction: 0.1 + Math.random() * 0.1, amount: 1, weight: 15 },
            { name: 'Rare Helmet', type: 'helmet', damage: 2 + Math.floor(Math.random() * 3), damageReduction: 0.05 + Math.random() * 0.05, amount: 1, weight: 10 },
            { name: 'Rare Boots', type: 'boots', damage: 0, damageReduction: 0.05 + Math.random() * 0.05, amount: 1, weight: 5 }
        ];
        
        return this.selectWeightedItem(dropTable);
    }
    
    selectWeightedItem(items) {
        // Calculate total weight
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        
        // Get random value
        let random = Math.random() * totalWeight;
        
        // Find selected item
        for (const item of items) {
            random -= item.weight;
            if (random <= 0) {
                return { ...item };
            }
        }
        
        // Fallback
        return { ...items[0] };
    }
    
    getRandomSpawnPosition() {
        // Get random angle
        const angle = Math.random() * Math.PI * 2;
        
        // Get random distance from center
        const distance = this.spawnRadius * 0.5 + Math.random() * this.spawnRadius * 0.5;
        
        // Calculate position
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Get terrain height at position
        const y = this.player.game.world.getTerrainHeight(x, z);
        
        return new THREE.Vector3(x, y, z);
    }
    
    getEnemiesNearPosition(position, radius) {
        return this.enemies.filter(enemy => {
            const distance = position.distanceTo(enemy.getPosition());
            return distance <= radius;
        });
    }
    
    spawnBoss(bossType, position) {
        // Find the boss type
        const bossConfig = this.bossTypes.find(type => type.type === bossType);
        
        if (!bossConfig) {
            console.warn(`Boss type ${bossType} not found`);
            return null;
        }
        
        // Apply difficulty scaling
        const scaledBossConfig = this.applyDifficultyScaling(bossConfig);
        
        // Create boss
        const boss = new Enemy(this.scene, this.player, scaledBossConfig);
        boss.init();
        
        // Position boss
        if (position) {
            boss.setPosition(position.x, position.y + 1, position.z); // Raise slightly above ground
        } else {
            // Use player position as reference
            const playerPos = this.player.getPosition();
            boss.setPosition(playerPos.x, playerPos.y + 1, playerPos.z + 5); // 5 units in front of player
        }
        
        // Add to enemies array
        this.enemies.push(boss);
        
        // Play boss spawn effect
        if (this.game && this.game.audioManager) {
            this.game.audioManager.playSound('bossSpawn');
        }
        
        // Show notification
        if (this.game && this.game.uiManager) {
            this.game.uiManager.showNotification(`${bossConfig.name} has appeared!`, 5);
        }
        
        return boss;
    }
    
    getClosestEnemy(position, maxDistance = Infinity) {
        let closestEnemy = null;
        let closestDistance = maxDistance;
        
        this.enemies.forEach(enemy => {
            const distance = position.distanceTo(enemy.getPosition());
            if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        });
        
        return closestEnemy;
    }
    
    spawnBoss(type, position = null) {
        // Get boss type
        let bossType;
        
        // Find the boss in the boss types array
        if (type === 'random') {
            // Get a random boss
            const randomIndex = Math.floor(Math.random() * this.bossTypes.length);
            bossType = this.bossTypes[randomIndex];
        } else {
            // Find specific boss type
            bossType = this.bossTypes.find(boss => boss.type === type || boss.zone === type);
            
            // If not found, use first boss
            if (!bossType) {
                console.warn(`Boss type ${type} not found, using default boss`);
                bossType = this.bossTypes[0];
            }
        }
        
        // Apply difficulty scaling
        const scaledBossType = this.applyDifficultyScaling(bossType);
        
        // Get position if not provided
        const spawnPosition = position || this.getRandomSpawnPosition();
        
        // Create boss
        const boss = new Enemy(this.scene, this.player, scaledBossType);
        
        // Set world reference for terrain height
        if (this.game && this.game.world) {
            boss.world = this.game.world;
            
            // Adjust initial position to be on terrain
            if (spawnPosition) {
                const terrainHeight = this.game.world.getTerrainHeight(spawnPosition.x, spawnPosition.z);
                spawnPosition.y = terrainHeight + boss.heightOffset;
            }
        }
        
        boss.init();
        boss.setPosition(spawnPosition.x, spawnPosition.y, spawnPosition.z);
        
        // Add to enemies array
        this.enemies.push(boss);
        
        // Announce boss spawn
        if (this.game && this.game.uiManager) {
            this.game.uiManager.showNotification(`${bossType.name} has appeared!`, 5000);
            
            // Play boss music if available
            if (this.game.audioManager) {
                this.game.audioManager.playMusic('bossTheme');
            }
        }
        
        return boss;
    }
    
    spawnBossForQuest(questId) {
        // Determine which boss to spawn based on quest
        let bossType;
        let spawnPosition;
        
        switch (questId) {
            case 'main_quest_3': // Skeleton King quest
                bossType = 'skeleton_king';
                spawnPosition = new THREE.Vector3(10, 0, 10); // Near ruins
                break;
            case 'main_quest_4': // Swamp quest
                bossType = 'swamp_horror';
                spawnPosition = new THREE.Vector3(-15, 0, -15); // In swamp
                break;
            case 'main_quest_5': // Frost Titan quest
                bossType = 'frost_titan';
                spawnPosition = new THREE.Vector3(20, 0, 20); // In snowy mountains
                break;
            case 'main_quest_6': // Final boss quest
                bossType = 'demon_lord';
                spawnPosition = new THREE.Vector3(25, 0, -25); // In mountains
                break;
            default:
                bossType = 'random';
                spawnPosition = null;
        }
        
        // Spawn the boss
        const boss = this.spawnBoss(bossType, spawnPosition);
        
        // Return the boss
        return boss;
    }
    
    removeAllEnemies() {
        // Remove all enemies
        this.enemies.forEach(enemy => {
            enemy.remove();
        });
        
        this.enemies = [];
    }
    
    spawnFrostTitan(x = 0, z = 0) {
        // Spawn the Frost Titan at the specified position
        const position = new THREE.Vector3(x, 0, z);
        return this.spawnBoss('frost_titan', position);
    }
    
    // New methods for screen-based enemy spawning
    
    onPlayerMovedScreenDistance(playerPosition) {
        // Clean up enemies that are too far from the player
        this.cleanupDistantEnemies();
        
        // Spawn new enemies around the player's current position
        this.spawnEnemiesAroundPlayer(playerPosition);
    }
    
    cleanupDistantEnemies() {
        const playerPos = this.player.getPosition();
        const maxDistance = 50; // Maximum distance to keep enemies (in world units)
        
        // Remove enemies that are too far away
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const position = enemy.getPosition();
            
            // Skip if this is a boss
            if (enemy.isBoss) continue;
            
            // Calculate distance to player
            const distance = position.distanceTo(playerPos);
            
            // If enemy is too far away, remove it
            if (distance > maxDistance) {
                enemy.remove();
                this.enemies.splice(i, 1);
            }
        }
    }
    
    spawnEnemiesAroundPlayer(playerPosition) {
        // Skip if we're at max enemies
        if (this.enemies.length >= this.maxEnemies) {
            return;
        }
        
        // Determine how many enemies to spawn
        const enemiesToSpawn = Math.min(
            5 + Math.floor(Math.random() * 5), // 5-9 enemies per screen
            this.maxEnemies - this.enemies.length // Don't exceed max enemies
        );
        
        // Get current zone for appropriate enemy types
        let currentZone = 'forest'; // Default zone
        if (this.game && this.game.world) {
            const zone = this.game.world.getZoneAt(playerPosition);
            if (zone) {
                currentZone = zone.name.toLowerCase();
            }
        }
        
        // Get enemy types for this zone
        const zoneEnemyTypes = this.zoneEnemies[currentZone] || Object.keys(this.zoneEnemies)[0];
        
        // Spawn enemies in 1-3 groups
        const numGroups = 1 + Math.floor(Math.random() * 2);
        const enemiesPerGroup = Math.ceil(enemiesToSpawn / numGroups);
        
        for (let g = 0; g < numGroups; g++) {
            // Select a random enemy type from the zone for this group
            const groupEnemyType = zoneEnemyTypes[Math.floor(Math.random() * zoneEnemyTypes.length)];
            
            // Determine group position (random direction from player, outside screen but not too far)
            const groupAngle = Math.random() * Math.PI * 2;
            const groupDistance = 25 + Math.random() * 10; // Just outside screen view
            const groupX = playerPosition.x + Math.cos(groupAngle) * groupDistance;
            const groupZ = playerPosition.z + Math.sin(groupAngle) * groupDistance;
            
            // Spawn the group of enemies
            for (let i = 0; i < enemiesPerGroup; i++) {
                // Skip if we've reached max enemies
                if (this.enemies.length >= this.maxEnemies) {
                    break;
                }
                
                // Calculate position within group (random spread)
                const spreadRadius = 5 + Math.random() * 5;
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * spreadRadius;
                const x = groupX + Math.cos(angle) * distance;
                const z = groupZ + Math.sin(angle) * distance;
                
                // Get terrain height at position
                const y = this.game.world.getTerrainHeight(x, z);
                
                // Spawn enemy
                const position = new THREE.Vector3(x, y, z);
                this.spawnEnemy(groupEnemyType, position);
            }
        }
    }
    
    ensureEnemyPopulation() {
        // If we're below the max enemies, spawn more in nearby chunks
        if (this.enemies.length < this.maxEnemies) {
            // Get player's current chunk
            const playerPos = this.player.getPosition();
            const playerChunkX = Math.floor(playerPos.x / this.game.world.chunkSize);
            const playerChunkZ = Math.floor(playerPos.z / this.game.world.chunkSize);
            
            // Check nearby chunks for enemy population
            const checkRadius = 2; // How many chunks around player to check
            
            for (let x = playerChunkX - checkRadius; x <= playerChunkX + checkRadius; x++) {
                for (let z = playerChunkZ - checkRadius; z <= playerChunkZ + checkRadius; z++) {
                    // Skip if we've reached max enemies
                    if (this.enemies.length >= this.maxEnemies) break;
                    
                    // Check if this chunk needs more enemies
                    const chunkKey = `${x},${z}`;
                    const chunkEnemyCount = this.enemyChunks[chunkKey] || 0;
                    
                    if (chunkEnemyCount < this.enemiesPerChunk) {
                        // Spawn a group of enemies in this chunk
                        this.spawnEnemyGroup(x, z);
                    }
                }
            }
        }
    }
    
    spawnEnemiesInChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Skip if we already have enough enemies in this chunk
        if (this.enemyChunks[chunkKey] && this.enemyChunks[chunkKey] >= this.enemiesPerChunk) {
            return;
        }
        
        // Skip if we're at max enemies globally
        if (this.enemies.length >= this.maxEnemies) {
            return;
        }
        
        // Spawn 1-3 groups of enemies in this chunk
        const numGroups = 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numGroups; i++) {
            this.spawnEnemyGroup(chunkX, chunkZ);
            
            // Stop if we've reached max enemies
            if (this.enemies.length >= this.maxEnemies) {
                break;
            }
        }
    }
    
    spawnEnemyGroup(chunkX, chunkZ) {
        // Calculate world coordinates for chunk center
        const chunkCenterX = chunkX * this.game.world.chunkSize + this.game.world.chunkSize / 2;
        const chunkCenterZ = chunkZ * this.game.world.chunkSize + this.game.world.chunkSize / 2;
        
        // Determine group size
        const groupSize = this.enemyGroupSize.min + 
            Math.floor(Math.random() * (this.enemyGroupSize.max - this.enemyGroupSize.min + 1));
        
        // Determine group position within chunk (random point within spawn radius)
        const groupAngle = Math.random() * Math.PI * 2;
        const groupDistance = Math.random() * this.chunkSpawnRadius;
        const groupX = chunkCenterX + Math.cos(groupAngle) * groupDistance;
        const groupZ = chunkCenterZ + Math.sin(groupAngle) * groupDistance;
        
        // Get terrain height at group position
        const terrainHeight = this.game.world.getTerrainHeight(groupX, groupZ);
        
        // Get current zone for appropriate enemy types
        let currentZone = 'forest'; // Default zone
        const zone = this.game.world.getZoneAt(new THREE.Vector3(groupX, terrainHeight, groupZ));
        if (zone) {
            currentZone = zone.name.toLowerCase();
        }
        
        // Get enemy types for this zone
        const zoneEnemyTypes = this.zoneEnemies[currentZone] || Object.keys(this.zoneEnemies)[0];
        
        // Select a random enemy type from the zone for this group
        const groupEnemyType = zoneEnemyTypes[Math.floor(Math.random() * zoneEnemyTypes.length)];
        
        // Spawn the group of enemies
        for (let i = 0; i < groupSize; i++) {
            // Skip if we've reached max enemies
            if (this.enemies.length >= this.maxEnemies) {
                break;
            }
            
            // Calculate position within group (random spread)
            const spreadRadius = 5 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spreadRadius;
            const x = groupX + Math.cos(angle) * distance;
            const z = groupZ + Math.sin(angle) * distance;
            
            // Get terrain height at position
            const y = this.game.world.getTerrainHeight(x, z);
            
            // Spawn enemy
            const position = new THREE.Vector3(x, y, z);
            this.spawnEnemy(groupEnemyType, position);
            
            // Update enemy count for this chunk
            const chunkKey = `${chunkX},${chunkZ}`;
            this.enemyChunks[chunkKey] = (this.enemyChunks[chunkKey] || 0) + 1;
        }
    }
}