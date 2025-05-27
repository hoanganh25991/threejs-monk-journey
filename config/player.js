/**
 * player.js
 * Default configuration for player stats and attributes
 */

export const DEFAULT_PLAYER_STATS = {
    // Level and experience
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    
    // Health and mana
    health: 300_000,
    maxHealth: 300_000,
    mana: 200,
    maxMana: 200,
    
    // Base attributes
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    
    // Movement and combat
    movementSpeed: 15,
    attackPower: 10
};

// Experience scaling factor for leveling up
export const LEVEL_UP_EXPERIENCE_MULTIPLIER = 1.5;

// Resource regeneration rates (per second)
export const RESOURCE_REGENERATION = {
    health: 2,
    mana: 5
};

// Stat increases per level
export const LEVEL_UP_STAT_INCREASES = {
    maxHealth: 10,
    maxMana: 5,
    strength: 1,
    dexterity: 1,
    intelligence: 1,
    attackPower: 2
};