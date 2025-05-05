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
        while (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
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
    
    regenerateResources(delta) {
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