import * as THREE from 'three';
import { Enemy } from './Enemy.js';
import { ZONE_ENEMIES, ENEMY_TYPES, BOSS_TYPES, ZONE_DIFFICULTY_MULTIPLIERS } from '../../config/enemies.js';
import { DROP_CHANCES, REGULAR_DROP_TABLE, BOSS_DROP_TABLE } from '../../config/drops.js';

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
        
        // Import enemy configuration from config/enemies.js
        this.zoneEnemies = ZONE_ENEMIES;
        this.enemyTypes = ENEMY_TYPES;
        this.bossTypes = BOSS_TYPES;
        
        // Difficulty scaling
        this.difficultyMultiplier = 1.0;
        
        // Import zone difficulty multipliers from config
        this.zoneDifficultyMultipliers = ZONE_DIFFICULTY_MULTIPLIERS;
    }
    
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Pause all enemies in the game
     * Stops animations and movement
     */
    pause() {
        console.debug(`Pausing ${this.enemies.length} enemies`);
        
        for (const enemy of this.enemies) {
            // Pause animation mixer if it exists
            if (enemy.model && enemy.model.mixer) {
                enemy.model.mixer.timeScale = 0;
            }
            
            // Set a paused flag on the enemy
            enemy.isPaused = true;
        }
    }
    
    /**
     * Resume all enemies in the game
     * Restarts animations and movement
     */
    resume() {
        console.debug(`Resuming ${this.enemies.length} enemies`);
        
        for (const enemy of this.enemies) {
            // Resume animation mixer if it exists
            if (enemy.model && enemy.model.mixer) {
                enemy.model.mixer.timeScale = 1;
            }
            
            // Clear the paused flag
            enemy.isPaused = false;
        }
    }
    
    async init() {
        // Spawn initial enemies
        for (let i = 0; i < this.maxEnemies / 2; i++) {
            this.spawnEnemy();
        }
        
        return true;
    }
    
    update(delta) {
        // Check if game is paused - if so, don't update enemies
        if (this.game && this.game.isPaused) {
            return; // Skip all enemy updates when game is paused
        }
        
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
                
                // Check if death animation is still in progress
                if (!enemy.deathAnimationInProgress) {
                    // Remove enemy only after death animation is complete
                    enemy.remove();
                    this.enemies.splice(i, 1);
                }
            }
        }
        
        // Periodically clean up distant enemies (approximately every 10 seconds)
        // This ensures enemies are cleaned up even if the player moves slowly
        if (Math.random() < 0.01) { // ~1% chance per frame, assuming 60fps = ~once per 10 seconds
            this.cleanupDistantEnemies();
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
        
        // Get player level for scaling
        let playerLevel = 1;
        if (this.game && this.game.player) {
            playerLevel = this.game.player.getLevel();
        }
        
        // Get current zone for zone-based difficulty
        let currentZone = 'forest'; // Default zone
        let zoneDifficultyMultiplier = 1.0;
        
        if (this.game && this.game.world) {
            const playerPosition = this.player.getPosition();
            const zone = this.game.world.getZoneAt(playerPosition);
            
            if (zone) {
                currentZone = zone.name.toLowerCase();
                // Get zone difficulty multiplier
                zoneDifficultyMultiplier = this.zoneDifficultyMultipliers[currentZone] || 1.0;
            }
        }
        
        // Calculate level scaling factor (increases by 10% per player level)
        const levelScalingFactor = 1.0 + (playerLevel * 0.1);
        
        // Calculate combined scaling factor
        const combinedScalingFactor = this.difficultyMultiplier * levelScalingFactor * zoneDifficultyMultiplier;
        
        // Apply scaling to enemy stats
        scaledType.health = Math.round(scaledType.health * combinedScalingFactor);
        scaledType.damage = Math.round(scaledType.damage * combinedScalingFactor);
        scaledType.experienceValue = Math.round(scaledType.experienceValue * combinedScalingFactor);
        
        // Store the original health for reference
        scaledType.baseHealth = enemyType.health;
        
        return scaledType;
    }
    
    findNearestEnemy(position, maxDistance = 15) {
        // Find the nearest enemy within maxDistance
        let nearestEnemy = null;
        let nearestDistance = maxDistance;
        
        for (const enemy of this.enemies) {
            // Skip dead enemies
            if (enemy.isDead()) continue;
            
            const enemyPosition = enemy.getPosition();
            const distance = position.distanceTo(enemyPosition);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        return nearestEnemy;
    }
    
    handleEnemyDrop(enemy) {
        // Check if enemy should drop an item
        const dropChance = enemy.isBoss ? DROP_CHANCES.bossDropChance : DROP_CHANCES.normalDropChance;
        
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
                if (this.game.hudManager) {
                    // this.game.hudManager.showNotification(`Found ${item.name}`);
                }
            }
        }
    }
    
    generateRegularDrop(enemy) {
        // Use drop table from config
        return this.selectWeightedItem(REGULAR_DROP_TABLE);
    }
    
    generateBossDrop(enemy) {
        // Use boss drop table from config
        return this.selectWeightedItem(BOSS_DROP_TABLE);
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
        if (this.game && this.game.hudManager) {
            this.game.hudManager.showNotification(`${bossConfig.name} has appeared!`, 5);
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
        if (this.game && this.game.hudManager) {
            this.game.hudManager.showNotification(`${bossType.name} has appeared!`, 5000);
            
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
        
        // Increased distances to keep enemies around longer
        const maxDistance = 80; // Maximum distance to keep enemies (in world units)
        const bossMaxDistance = 120; // Maximum distance to keep bosses (larger than regular enemies)
        
        // Check if we're in a multiplier zone (higher enemy density)
        let inMultiplierZone = false;
        let multiplierValue = 1;
        
        if (this.game && this.game.teleportManager) {
            inMultiplierZone = this.game.teleportManager.activeMultiplier > 1;
            multiplierValue = this.game.teleportManager.activeMultiplier;
        }
        
        // In multiplier zones, keep enemies around longer
        const zoneDistanceMultiplier = inMultiplierZone ? 1.5 : 1.0;
        const adjustedMaxDistance = maxDistance * zoneDistanceMultiplier;
        const adjustedBossMaxDistance = bossMaxDistance * zoneDistanceMultiplier;
        
        let removedCount = 0;
        
        // Remove enemies that are too far away
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const position = enemy.getPosition();
            
            // Calculate distance to player
            const distance = position.distanceTo(playerPos);
            
            // Different distance thresholds for bosses and regular enemies
            const distanceThreshold = enemy.isBoss ? adjustedBossMaxDistance : adjustedMaxDistance;
            
            // If enemy is too far away, remove it
            if (distance > distanceThreshold) {
                // In multiplier zones, don't remove all enemies at once - stagger removal
                // This creates a more gradual transition as player moves
                if (inMultiplierZone && Math.random() > 0.3) {
                    // Skip removal for 70% of enemies in multiplier zones
                    continue;
                }
                
                enemy.remove();
                this.enemies.splice(i, 1);
                removedCount++;
            }
        }
        
        // Log cleanup information if enemies were removed
        if (removedCount > 0) {
            console.debug(`Cleaned up ${removedCount} distant enemies. Remaining: ${this.enemies.length}`);
            
            // Force garbage collection hint if significant cleanup occurred
            if (removedCount > 5 && this.game && this.game.world) {
                this.game.world.hintGarbageCollection();
            }
        }
    }
    
    spawnEnemiesAroundPlayer(playerPosition) {
        // Check if we're in a multiplier zone (higher enemy density)
        let inMultiplierZone = false;
        let multiplierValue = 1;
        
        if (this.game && this.game.teleportManager) {
            inMultiplierZone = this.game.teleportManager.activeMultiplier > 1;
            multiplierValue = this.game.teleportManager.activeMultiplier;
        }
        
        // In multiplier zones, temporarily increase max enemies
        const originalMaxEnemies = this.maxEnemies;
        if (inMultiplierZone) {
            // Scale max enemies based on multiplier, but cap it for performance
            this.maxEnemies = Math.min(200, Math.floor(originalMaxEnemies * Math.sqrt(multiplierValue)));
            console.debug(`In multiplier zone (${multiplierValue}x) - increased max enemies to ${this.maxEnemies}`);
        }
        
        // Skip if we're at max enemies
        if (this.enemies.length >= this.maxEnemies) {
            // Restore original max enemies
            this.maxEnemies = originalMaxEnemies;
            return;
        }
        
        // Determine how many enemies to spawn - scale with multiplier
        let baseEnemyCount = 5 + Math.floor(Math.random() * 5); // 5-9 enemies per screen normally
        
        // In multiplier zones, spawn more enemies per wave
        if (inMultiplierZone) {
            // Scale enemy count based on multiplier, using square root for more reasonable scaling
            baseEnemyCount = Math.floor(baseEnemyCount * Math.sqrt(multiplierValue) * 0.5);
            
            // Ensure we spawn at least some enemies
            baseEnemyCount = Math.max(5, baseEnemyCount);
        }
        
        const enemiesToSpawn = Math.min(
            baseEnemyCount,
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
        
        // Spawn enemies in multiple groups - more groups in multiplier zones
        const numGroups = inMultiplierZone ? 
            2 + Math.floor(Math.random() * 3) : // 2-4 groups in multiplier zones
            1 + Math.floor(Math.random() * 2);  // 1-2 groups normally
            
        const enemiesPerGroup = Math.ceil(enemiesToSpawn / numGroups);
        
        // In multiplier zones, spawn enemies in a more surrounding pattern
        const angleStep = inMultiplierZone ? (Math.PI * 2) / numGroups : 0;
        let startAngle = Math.random() * Math.PI * 2;
        
        for (let g = 0; g < numGroups; g++) {
            // Select a random enemy type from the zone for this group
            const groupEnemyType = zoneEnemyTypes[Math.floor(Math.random() * zoneEnemyTypes.length)];
            
            // Determine group position
            let groupAngle;
            
            if (inMultiplierZone) {
                // In multiplier zones, distribute groups more evenly around the player
                // This creates a surrounding effect that's harder to escape
                groupAngle = startAngle + (angleStep * g);
            } else {
                // Normal random angle
                groupAngle = Math.random() * Math.PI * 2;
            }
            
            // Adjust distance based on multiplier - closer in multiplier zones
            const groupDistance = inMultiplierZone ?
                20 + Math.random() * 10 : // Closer in multiplier zones (20-30 units)
                25 + Math.random() * 10;  // Normal distance (25-35 units)
                
            const groupX = playerPosition.x + Math.cos(groupAngle) * groupDistance;
            const groupZ = playerPosition.z + Math.sin(groupAngle) * groupDistance;
            
            // Spawn the group of enemies
            for (let i = 0; i < enemiesPerGroup; i++) {
                // Skip if we've reached max enemies
                if (this.enemies.length >= this.maxEnemies) {
                    break;
                }
                
                // Calculate position within group (random spread)
                // Tighter groups in multiplier zones
                const spreadRadius = inMultiplierZone ?
                    3 + Math.random() * 4 : // Tighter groups in multiplier zones
                    5 + Math.random() * 5;  // Normal spread
                    
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
        
        // Restore original max enemies
        this.maxEnemies = originalMaxEnemies;
        
        // In multiplier zones, schedule another wave of enemies after a delay
        // This creates continuous waves that will overwhelm the player if they don't defeat enemies quickly
        if (inMultiplierZone) {
            const waveDelay = 5000 + Math.random() * 5000; // 5-10 seconds between waves
            
            setTimeout(() => {
                // Only spawn if still in multiplier zone
                if (this.game && 
                    this.game.teleportManager && 
                    this.game.teleportManager.activeMultiplier > 1) {
                    
                    console.debug(`Spawning additional wave of enemies in multiplier zone`);
                    this.spawnEnemiesAroundPlayer(this.player.getPosition());
                }
            }, waveDelay);
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