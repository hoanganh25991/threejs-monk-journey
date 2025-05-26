import * as THREE from 'three';

/**
 * @typedef {Object} PunchSystem
 * @property {number} cooldown - Current cooldown time remaining
 * @property {number} cooldownTime - Total cooldown time between punches
 * @property {number} range - Maximum range for detecting enemies to punch
 * @property {number} comboCount - Current combo counter (0-3)
 * @property {number} comboTimer - Time remaining in current combo window
 * @property {number} comboTimeWindow - Total time window to continue a combo
 * @property {number[]} damageMultipliers - Damage multipliers for each combo step
 * @property {number} knockbackDistance - Distance to knock back enemies on heavy punch
 * @property {number} knockbackDuration - Duration of knockback effect
 */
export class PlayerCombat {
    /**
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {import('./PlayerInterface.js').IPlayerState} playerState - Player state manager
     * @param {import('./PlayerInterface.js').IPlayerStats} playerStats - Player statistics
     * @param {import('./PlayerInterface.js').IPlayerModel} playerModel - Player model and animations
     * @param {import('./PlayerInterface.js').IPlayerInventory} playerInventory - Player inventory
     */
    constructor(scene, playerState, playerStats, playerModel, playerInventory) {
        /**
         * The Three.js scene
         * @type {THREE.Scene}
         */
        this.scene = scene;
        
        /**
         * Player state manager
         * @type {import('./PlayerInterface.js').IPlayerState}
         */
        this.playerState = playerState;
        
        /**
         * Player statistics
         * @type {import('./PlayerInterface.js').IPlayerStats}
         */
        this.playerStats = playerStats;
        
        /**
         * Player model and animations
         * @type {import('./PlayerInterface.js').IPlayerModel}
         */
        this.playerModel = playerModel;
        
        /**
         * Player inventory
         * @type {import('./PlayerInterface.js').IPlayerInventory}
         */
        this.playerInventory = playerInventory;
        
        /**
         * Game reference
         * @type {Object|null}
         */
        this.game = null;
        
        /**
         * Simplified punch system
         * @type {PunchSystem}
         */
        this.punchSystem = {
            cooldown: 0,
            cooldownTime: 0.5,
            range: 2.0,
            comboCount: 0,
            comboTimer: 0,
            comboTimeWindow: 1.5,
            damageMultipliers: [1.0, 1.1, 1.3, 1.8],
            knockbackDistance: 3.0,
            knockbackDuration: 0.3
        };
    }
    
    /**
     * Sets the game instance reference
     * @param {Object} game - The main game instance
     */
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Performs a standard attack at the target position
     * @param {THREE.Vector3} target - The target position to attack
     */
    attack(target) {
        // Set attack state
        this.playerState.setAttacking(true);
        
        // Face target
        const playerPosition = this.playerModel.getModelGroup().position;
        const direction = new THREE.Vector3().subVectors(target, playerPosition).normalize();
        this.playerModel.setRotation(new THREE.Euler(0, Math.atan2(direction.x, direction.z), 0));
        
        // Visual and sound effects
        this.playerModel.createAttackEffect(direction);
        if (this.game?.audioManager) {
            this.game.audioManager.playSound('playerAttack');
        }
        
        // Reset attack state after delay
        setTimeout(() => this.playerState.setAttacking(false), 500);
        
        // Check for enemies in attack range
        this.checkAttackHit(direction);
    }
    
    /**
     * Checks for enemies hit by an attack in the specified direction
     * @param {THREE.Vector3} direction - The direction of the attack
     */
    checkAttackHit(direction) {
        if (!this.game?.enemyManager) return;
        
        // Get attack position and range
        const playerPosition = this.playerModel.getModelGroup().position;
        const attackPosition = new THREE.Vector3(
            playerPosition.x + direction.x * 1.5,
            playerPosition.y + 1,
            playerPosition.z + direction.z * 1.5
        );
        const attackRange = 1.5;
        
        // Check each enemy
        this.game.enemyManager.enemies.forEach(enemy => {
            const enemyPosition = enemy.getPosition();
            const distance = attackPosition.distanceTo(enemyPosition);
            
            // Apply damage to enemies in range
            if (distance <= attackRange) {
                const damage = this.calculateDamage();
                enemy.takeDamage(damage);
                
                // Visual effects
                if (this.game?.hudManager) {
                    this.game.hudManager.createBleedingEffect(damage, enemyPosition);
                }
                
                // Handle defeated enemies
                if (enemy.getHealth() <= 0) {
                    this.playerStats.addExperience(enemy.getExperienceValue());
                    if (this.game?.questManager) {
                        this.game.questManager.updateEnemyKill(enemy);
                    }
                }
            }
        });
    }
    
    /**
     * Handles player taking damage
     * @param {number} damage - The amount of damage to take
     * @returns {number} The actual amount of damage taken after reductions
     */
    takeDamage(damage) {
        // Apply armor reduction
        let reducedDamage = damage;
        const equipment = this.playerInventory.getEquipment();
        if (equipment.armor) {
            reducedDamage *= (1 - equipment.armor.damageReduction);
        }
        
        // Apply damage to health
        this.playerStats.setHealth(this.playerStats.getHealth() - reducedDamage);
        
        // Sound effect
        if (this.game?.audioManager) {
            this.game.audioManager.playSound('playerHit');
        }
        
        // Check for death
        if (this.playerStats.getHealth() <= 0) {
            this.die();
        }
        
        // Visual effect
        if (this.game?.hudManager) {
            const playerPosition = this.playerModel.getModelGroup().position;
            this.game.hudManager.createBleedingEffect(reducedDamage, playerPosition, true);
        }
        
        return reducedDamage;
    }
    
    /**
     * Handles player death
     */
    die() {
        // Set dead state
        this.playerState.setDead(true);
        this.playerState.setMoving(false);
        
        // Visual and sound effects
        this.playerModel.getModelGroup().rotation.x = Math.PI / 2;
        if (this.game?.audioManager) {
            this.game.audioManager.playSound('playerDeath');
        }
        
        // Show death screen
        if (this.game?.hudManager) {
            this.game.hudManager.showDeathScreen();
        }
    }
    
    /**
     * Revives the player after death
     */
    revive() {
        // Reset health and mana
        this.playerStats.setHealth(this.playerStats.getMaxHealth() * 0.75);
        this.playerStats.setMana(this.playerStats.getMaxMana() * 0.75);
        
        // Reset state
        this.playerState.setDead(false);
        
        // Reset position and rotation
        this.playerModel.setPosition(new THREE.Vector3(0, 0, 0));
        this.playerModel.getModelGroup().rotation.x = 0;
        
        // Hide death screen
        if (this.game?.hudManager) {
            this.game.hudManager.hideDeathScreen();
        }
    }
}