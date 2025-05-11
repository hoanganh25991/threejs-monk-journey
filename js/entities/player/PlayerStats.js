/**
 * PlayerStats.js
 * Handles player statistics, experience, and leveling
 */

import { IPlayerStats } from './PlayerInterface.js';

export class PlayerStats extends IPlayerStats {
    constructor(initialStats = {}) {
        super();
        
        // Default stats
        this.level = initialStats.level || 1;
        this.experience = initialStats.experience || 0;
        this.experienceToNextLevel = initialStats.experienceToNextLevel || 100;
        this.health = initialStats.health || 100_000;
        this.maxHealth = initialStats.maxHealth || 100_000;
        this.mana = initialStats.mana || 100_000;
        this.maxMana = initialStats.maxMana || 100_000;
        this.strength = initialStats.strength || 10;
        this.dexterity = initialStats.dexterity || 10;
        this.intelligence = initialStats.intelligence || 10;
        this.movementSpeed = initialStats.movementSpeed || 15;
        this.attackPower = initialStats.attackPower || 10;
        
        // Track temporary stat boosts
        this.temporaryBoosts = {};
    }
    
    // Getters
    getHealth() {
        return this.health;
    }
    
    getMaxHealth() {
        return this.maxHealth;
    }
    
    getMana() {
        return this.mana;
    }
    
    getMaxMana() {
        return this.maxMana;
    }
    
    getLevel() {
        return this.level;
    }
    
    getExperience() {
        return this.experience;
    }
    
    getExperienceToNextLevel() {
        return this.experienceToNextLevel;
    }
    
    getAttackPower() {
        return this.attackPower;
    }
    
    getMovementSpeed() {
        return this.movementSpeed;
    }
    
    // Setters
    setHealth(value) {
        this.health = Math.max(0, Math.min(value, this.maxHealth));
    }
    
    setMana(value) {
        this.mana = Math.max(0, Math.min(value, this.maxMana));
    }
    
    addExperience(amount) {
        // Add experience
        this.experience += amount;
        
        // Check for level up
        let levelChanged = false;
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            levelChanged = true;
        }
        
        // Return the current level if a level up occurred, otherwise return 0
        return levelChanged ? this.level : 0;
    }
    
    levelUp() {
        // Increase level
        this.level++;
        
        // Subtract experience for this level
        this.experience -= this.experienceToNextLevel;
        
        // Calculate experience for next level
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        
        // Increase stats
        this.maxHealth += 10;
        this.maxMana += 5;
        this.strength += 1;
        this.dexterity += 1;
        this.intelligence += 1;
        this.attackPower += 2;
        
        // Restore health and mana
        this.health = this.maxHealth;
        this.mana = this.maxMana;
        
        return this.level;
    }
    
    /**
     * Add a temporary boost to a stat
     * @param {string} statName - The name of the stat to boost (e.g., 'moveSpeed', 'attackPower')
     * @param {number} amount - The amount to boost by (e.g., 0.3 for 30% increase)
     * @param {number} duration - Duration of the boost in seconds
     */
    addTemporaryBoost(statName, amount, duration) {
        // Store the original value if this is a new boost
        if (!this.temporaryBoosts[statName]) {
            this.temporaryBoosts[statName] = {
                originalValue: this[statName],
                boosts: []
            };
        }
        
        // Add the new boost
        const boost = {
            amount: amount,
            duration: duration,
            remainingTime: duration
        };
        
        this.temporaryBoosts[statName].boosts.push(boost);
        
        // Apply the boost immediately
        this.applyBoosts(statName);
        
        console.debug(`Added temporary boost to ${statName}: +${amount} for ${duration} seconds`);
    }
    
    /**
     * Apply all active boosts for a specific stat
     * @param {string} statName - The name of the stat to apply boosts for
     */
    applyBoosts(statName) {
        if (!this.temporaryBoosts[statName]) return;
        
        // Reset to original value
        this[statName] = this.temporaryBoosts[statName].originalValue;
        
        // Apply all active boosts
        for (const boost of this.temporaryBoosts[statName].boosts) {
            if (boost.remainingTime > 0) {
                // For percentage boosts (e.g., moveSpeed)
                this[statName] += this[statName] * boost.amount;
            }
        }
    }
    
    /**
     * Update all temporary boosts
     * @param {number} delta - Time since last update in seconds
     */
    updateTemporaryBoosts(delta) {
        let boostsChanged = false;
        
        // Update each stat's boosts
        for (const statName in this.temporaryBoosts) {
            const statBoosts = this.temporaryBoosts[statName];
            let activeBoostsChanged = false;
            
            // Update remaining time for each boost
            for (const boost of statBoosts.boosts) {
                if (boost.remainingTime > 0) {
                    boost.remainingTime -= delta;
                    if (boost.remainingTime <= 0) {
                        boost.remainingTime = 0;
                        activeBoostsChanged = true;
                    }
                }
            }
            
            // Clean up expired boosts
            if (activeBoostsChanged) {
                statBoosts.boosts = statBoosts.boosts.filter(boost => boost.remainingTime > 0);
                boostsChanged = true;
                
                // If no more boosts for this stat, revert to original value
                if (statBoosts.boosts.length === 0) {
                    this[statName] = statBoosts.originalValue;
                    delete this.temporaryBoosts[statName];
                } else {
                    // Otherwise, reapply the remaining boosts
                    this.applyBoosts(statName);
                }
            }
        }
        
        return boostsChanged;
    }
    
    regenerateResources(delta) {
        // Update temporary boosts
        this.updateTemporaryBoosts(delta);
        
        // Regenerate health
        if (this.health < this.maxHealth) {
            this.health += delta * 2; // 2 health per second
            if (this.health > this.maxHealth) {
                this.health = this.maxHealth;
            }
        }
        
        // Regenerate mana
        if (this.mana < this.maxMana) {
            this.mana += delta * 5; // 5 mana per second
            if (this.mana > this.maxMana) {
                this.mana = this.maxMana;
            }
        }
    }
}