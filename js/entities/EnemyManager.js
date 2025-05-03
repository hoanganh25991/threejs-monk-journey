import * as THREE from 'three';
import { Enemy } from './Enemy.js';

export class EnemyManager {
    constructor(scene, player, loadingManager) {
        this.scene = scene;
        this.player = player;
        this.loadingManager = loadingManager;
        this.enemies = [];
        this.maxEnemies = 10;
        this.spawnRadius = 30;
        this.spawnTimer = 0;
        this.spawnInterval = 5; // Spawn enemy every 5 seconds
        
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
                color: 0xcccccc
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
                color: 0x88aa88
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
                color: 0xaa3333
            }
        ];
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
                enemy.remove();
                this.enemies.splice(i, 1);
            }
        }
    }
    
    spawnEnemy() {
        // Get random enemy type
        const enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        
        // Get random position
        const position = this.getRandomSpawnPosition();
        
        // Create enemy
        const enemy = new Enemy(this.scene, this.player, enemyType);
        enemy.init();
        enemy.setPosition(position.x, position.y, position.z);
        
        // Add to enemies array
        this.enemies.push(enemy);
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
    
    spawnBoss(type, position) {
        // Get boss type
        let bossType;
        
        switch (type) {
            case 'skeleton':
                bossType = {
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
                    isBoss: true
                };
                break;
            case 'demon':
                bossType = {
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
                    isBoss: true
                };
                break;
            default:
                bossType = {
                    type: 'ancient_evil',
                    name: 'Ancient Evil',
                    health: 400,
                    damage: 30,
                    speed: 2,
                    attackRange: 3,
                    attackSpeed: 1,
                    experienceValue: 250,
                    color: 0x553377,
                    scale: 2.2,
                    isBoss: true
                };
        }
        
        // Create boss
        const boss = new Enemy(this.scene, this.player, bossType);
        boss.init();
        boss.setPosition(position.x, position.y, position.z);
        
        // Add to enemies array
        this.enemies.push(boss);
        
        return boss;
    }
    
    removeAllEnemies() {
        // Remove all enemies
        this.enemies.forEach(enemy => {
            enemy.remove();
        });
        
        this.enemies = [];
    }
}