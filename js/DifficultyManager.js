import { DIFFICULTY_SETTINGS } from './config/difficulty-settings.js';

export class DifficultyManager {
    constructor(game) {
        this.game = game;
        
        // Difficulty levels
        this.difficultyLevels = [
            {
                name: 'Normal',
                enemyHealthMultiplier: 1.0,
                enemyDamageMultiplier: 1.0,
                enemySpeedMultiplier: 1.0,
                experienceMultiplier: 1.0,
                goldMultiplier: 1.0,
                itemDropRateMultiplier: 1.0
            },
            {
                name: 'Nightmare',
                enemyHealthMultiplier: 1.5,
                enemyDamageMultiplier: 1.3,
                enemySpeedMultiplier: 1.1,
                experienceMultiplier: 1.25,
                goldMultiplier: 1.25,
                itemDropRateMultiplier: 1.2
            },
            {
                name: 'Hell',
                enemyHealthMultiplier: 2.0,
                enemyDamageMultiplier: 1.6,
                enemySpeedMultiplier: 1.2,
                experienceMultiplier: 1.5,
                goldMultiplier: 1.5,
                itemDropRateMultiplier: 1.4
            },
            {
                name: 'Torment',
                enemyHealthMultiplier: 3.0,
                enemyDamageMultiplier: 2.0,
                enemySpeedMultiplier: 1.3,
                experienceMultiplier: 2.0,
                goldMultiplier: 2.0,
                itemDropRateMultiplier: 1.75
            }
        ];
        
        // Current difficulty level (default: Normal)
        this.currentDifficultyIndex = 0;
    }
    
    getCurrentDifficulty() {
        return this.difficultyLevels[this.currentDifficultyIndex];
    }
    
    setDifficulty(index) {
        if (index >= 0 && index < this.difficultyLevels.length) {
            this.currentDifficultyIndex = index;
            this.applyDifficultySettings();
            return true;
        }
        return false;
    }
    
    applyDifficultySettings() {
        const difficulty = this.getCurrentDifficulty();
        
        // Apply difficulty settings to enemy manager
        if (this.game.enemyManager) {
            // Update enemy types with difficulty multipliers
            this.game.enemyManager.enemyTypes.forEach(enemyType => {
                // Store original values if not already stored
                if (!enemyType.originalHealth) {
                    enemyType.originalHealth = enemyType.health;
                    enemyType.originalDamage = enemyType.damage;
                    enemyType.originalSpeed = enemyType.speed;
                }
                
                // Apply multipliers
                enemyType.health = Math.round(enemyType.originalHealth * difficulty.enemyHealthMultiplier);
                enemyType.damage = Math.round(enemyType.originalDamage * difficulty.enemyDamageMultiplier);
                enemyType.speed = enemyType.originalSpeed * difficulty.enemySpeedMultiplier;
            });
        }
        
        // Update existing enemies
        this.updateExistingEnemies();
        
        return true;
    }
    
    updateExistingEnemies() {
        const difficulty = this.getCurrentDifficulty();
        
        // Update existing enemies with new difficulty settings
        if (this.game.enemyManager && this.game.enemyManager.enemies) {
            this.game.enemyManager.enemies.forEach(enemy => {
                // Find the enemy type
                const enemyType = this.game.enemyManager.enemyTypes.find(type => type.type === enemy.type);
                
                if (enemyType) {
                    // Calculate health percentage
                    const healthPercentage = enemy.health / enemy.maxHealth;
                    
                    // Update max health
                    enemy.maxHealth = enemyType.health;
                    
                    // Update current health while maintaining the same percentage
                    enemy.health = Math.round(enemy.maxHealth * healthPercentage);
                    
                    // Update damage
                    enemy.damage = enemyType.damage;
                    
                    // Update speed
                    enemy.speed = enemyType.speed;
                }
            });
        }
    }
    
    getExperienceMultiplier() {
        return this.getCurrentDifficulty().experienceMultiplier;
    }
    
    getGoldMultiplier() {
        return this.getCurrentDifficulty().goldMultiplier;
    }
    
    getItemDropRateMultiplier() {
        return this.getCurrentDifficulty().itemDropRateMultiplier;
    }
    
    getDifficultyLevels() {
        return this.difficultyLevels.map(level => level.name);
    }
    
    getCurrentDifficultyName() {
        return this.getCurrentDifficulty().name;
    }
    
    getCurrentDifficultyIndex() {
        return this.currentDifficultyIndex;
    }
    
    /**
     * Get the difficulty settings from the config
     * @returns {Object} The difficulty settings object
     */
    getDifficultySettings() {
        return DIFFICULTY_SETTINGS;
    }
}