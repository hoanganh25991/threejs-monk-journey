/**
 * Game Balance Configuration
 * Contains settings for game balance, difficulty scaling, and combat mechanics
 */

// Combat balance settings
export const COMBAT_BALANCE = {
    // Player combat settings
    player: {
        // Base damage multipliers for combo punches (5 punches total)
        comboPunchMultipliers: [1.0, 1.2, 1.5, 1.8, 2.5],
        // Cooldown between punches (seconds)
        comboPunchCooldown: 0.4,
        // Time window to continue combo (seconds)
        comboTimeWindow: 2.0,
        // Base damage for skills - reduced to balance with enemy health
        skillDamageMultiplier: 0.5,
        // Health regeneration per second
        healthRegenPerSecond: 2,
        // Mana regeneration per second
        manaRegenPerSecond: 5,
        // Damage reduction from armor (percentage per point)
        armorDamageReduction: 0.02,
        // Damage increase from weapon (percentage per point)
        weaponDamageIncrease: 0.05
    },
    
    // Enemy combat settings
    enemy: {
        // Base damage multiplier
        damageMultiplier: 1.0,
        // Health multiplier - increased to require 4-5 punches
        healthMultiplier: 2.5,
        // Experience multiplier
        experienceMultiplier: 1.0,
        // Level scaling factor (how much stronger enemies get per player level)
        levelScalingFactor: 0.1,
        // Boss health multiplier
        bossHealthMultiplier: 3.0,
        // Boss damage multiplier
        bossDamageMultiplier: 1.5
    },
    
    // Item balance settings
    items: {
        // Weapon damage per quality level
        weaponDamagePerQuality: 5,
        // Armor protection per quality level
        armorProtectionPerQuality: 3,
        // Accessory stat bonus per quality level
        accessoryBonusPerQuality: 2
    }
};

// Difficulty scaling settings
export const DIFFICULTY_SCALING = {
    // Base difficulty at player level 1
    baseDifficulty: 1.0,
    // Difficulty increase per player level
    difficultyPerLevel: 0.05,
    // Maximum difficulty multiplier
    maxDifficultyMultiplier: 3.0,
    // Level at which enemies start using special abilities
    specialAbilityStartLevel: 5,
    // Level at which enemies start having resistances
    resistanceStartLevel: 10
};

// Level up rewards
export const LEVEL_UP_REWARDS = {
    // Health increase per level
    healthPerLevel: 10,
    // Mana increase per level
    manaPerLevel: 5,
    // Attack power increase per level
    attackPowerPerLevel: 2,
    // Stat points awarded per level
    statPointsPerLevel: 3,
    // Skill points awarded per level
    skillPointsPerLevel: 1,
    // Gold awarded per level
    goldPerLevel: 100
};