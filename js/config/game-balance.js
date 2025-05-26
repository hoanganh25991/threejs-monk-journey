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
        weaponDamageIncrease: 0.05,
        // Power scaling with level (percentage increase per level)
        powerScalingPerLevel: 0.1, // 10% increase per level
        // Critical hit chance base value
        baseCritChance: 0.05, // 5% base crit chance
        // Critical hit damage multiplier
        critDamageMultiplier: 1.5, // 150% damage on crit
        // Elemental damage bonus multiplier
        elementalDamageMultiplier: 1.2 // 20% bonus for elemental damage
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
        bossDamageMultiplier: 1.5,
        // Elite enemy health multiplier
        eliteHealthMultiplier: 1.8,
        // Elite enemy damage multiplier
        eliteDamageMultiplier: 1.3,
        // Champion enemy health multiplier
        championHealthMultiplier: 2.2,
        // Champion enemy damage multiplier
        championDamageMultiplier: 1.4,
        // Enemy health scaling formula parameters
        healthScaling: {
            base: 1.0,
            levelFactor: 0.1, // 10% per level
            difficultyFactor: 1.0 // Multiplied by difficulty setting
        },
        // Enemy damage scaling formula parameters
        damageScaling: {
            base: 1.0,
            levelFactor: 0.08, // 8% per level
            difficultyFactor: 1.0 // Multiplied by difficulty setting
        },
        // Enemy defense scaling formula parameters
        defenseScaling: {
            base: 1.0,
            levelFactor: 0.05, // 5% per level
            difficultyFactor: 1.0 // Multiplied by difficulty setting
        }
    },
    
    // Item balance settings
    items: {
        // Weapon damage per quality level
        weaponDamagePerQuality: 5,
        // Armor protection per quality level
        armorProtectionPerQuality: 3,
        // Accessory stat bonus per quality level
        accessoryBonusPerQuality: 2,
        // Rarity multipliers for item stats
        rarityMultipliers: {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 2.5,
            mythic: 3.0
        },
        // Level scaling factor for items
        levelScalingFactor: 0.05, // 5% per level
        // Secondary stat value ranges
        secondaryStatBaseValues: {
            critChance: 2,
            critDamage: 10,
            attackSpeed: 5,
            cooldownReduction: 3,
            healthBonus: 5,
            manaBonus: 5,
            elementalDamage: 10,
            damageReduction: 2,
            movementSpeed: 3,
            goldFind: 10,
            magicFind: 5,
            experienceBonus: 5
        }
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
    resistanceStartLevel: 10,
    
    // Difficulty levels configuration
    difficultyLevels: {
        // Basic (Easy) difficulty
        basic: {
            name: "Basic (Easy)",
            enemyLevelOffset: -5, // Enemy Level = Player Level - 5 (minimum 1)
            damageMultiplier: 0.7, // 70% of normal damage
            healthMultiplier: 0.7, // 70% of normal health
            experienceMultiplier: 0.8, // 80% of normal experience
            itemQualityMultiplier: 0.8, // 80% chance for better quality
            itemDropRateMultiplier: 1.2, // 120% normal drop rate
            affixChanceMultiplier: 0.5, // 50% chance for affixes
            specialAbilityChanceMultiplier: 0.5 // 50% chance for special abilities
        },
        
        // Medium (Normal) difficulty - default
        medium: {
            name: "Medium (Normal)",
            enemyLevelOffset: -2, // Enemy Level = Player Level - 2 (minimum 1)
            damageMultiplier: 1.0, // Normal damage
            healthMultiplier: 1.0, // Normal health
            experienceMultiplier: 1.0, // Normal experience
            itemQualityMultiplier: 1.0, // Normal quality chance
            itemDropRateMultiplier: 1.0, // Normal drop rate
            affixChanceMultiplier: 1.0, // Normal chance for affixes
            specialAbilityChanceMultiplier: 1.0 // Normal chance for special abilities
        },
        
        // Hard (Challenging) difficulty
        hard: {
            name: "Hard (Challenging)",
            enemyLevelOffset: 2, // Enemy Level = Player Level + 2
            damageMultiplier: 1.3, // 130% of normal damage
            healthMultiplier: 1.5, // 150% of normal health
            experienceMultiplier: 1.2, // 120% of normal experience
            itemQualityMultiplier: 1.2, // 120% chance for better quality
            itemDropRateMultiplier: 1.0, // Normal drop rate
            affixChanceMultiplier: 1.5, // 150% chance for affixes
            specialAbilityChanceMultiplier: 1.5 // 150% chance for special abilities
        },
        
        // Hell (Very Hard) difficulty
        hell: {
            name: "Hell (Very Hard)",
            enemyLevelOffset: 5, // Enemy Level = Player Level + 5
            damageMultiplier: 2.0, // 200% of normal damage
            healthMultiplier: 2.5, // 250% of normal health
            experienceMultiplier: 1.5, // 150% of normal experience
            itemQualityMultiplier: 1.5, // 150% chance for better quality
            itemDropRateMultiplier: 0.8, // 80% normal drop rate (rarer but better)
            affixChanceMultiplier: 2.0, // 200% chance for affixes
            specialAbilityChanceMultiplier: 2.0 // 200% chance for special abilities
        },
        
        // Inferno (Endgame) difficulty
        inferno: {
            name: "Inferno (Endgame)",
            enemyLevelOffset: 10, // Enemy Level = Player Level + 10
            damageMultiplier: 3.0, // 300% of normal damage
            healthMultiplier: 4.0, // 400% of normal health
            experienceMultiplier: 2.0, // 200% of normal experience
            itemQualityMultiplier: 2.0, // 200% chance for better quality
            itemDropRateMultiplier: 0.7, // 70% normal drop rate (much rarer but much better)
            affixChanceMultiplier: 3.0, // 300% chance for affixes
            specialAbilityChanceMultiplier: 3.0, // 300% chance for special abilities
            guaranteedRareAffix: true // Guarantees at least one rare affix on elite+ enemies
        }
    },
    
    // Enemy affix system
    affixes: {
        // Chance for an elite enemy to have an affix (base value, modified by difficulty)
        eliteAffixChance: 0.8, // 80% chance
        // Chance for a champion enemy to have an affix (base value, modified by difficulty)
        championAffixChance: 1.0, // 100% chance
        // Maximum number of affixes per enemy type
        maxAffixesPerEnemyType: {
            normal: 0,
            elite: 1,
            champion: 2,
            miniBoss: 3,
            boss: 4
        },
        // List of possible affixes and their effects
        affixList: [
            {
                id: "frozen",
                name: "Frozen",
                description: "Creates ice patches that slow and damage players",
                damageMultiplier: 1.0,
                healthMultiplier: 1.1
            },
            {
                id: "molten",
                name: "Molten",
                description: "Leaves fire trails and explodes on death",
                damageMultiplier: 1.2,
                healthMultiplier: 1.0
            },
            {
                id: "teleporter",
                name: "Teleporter",
                description: "Can teleport to avoid attacks",
                damageMultiplier: 1.1,
                healthMultiplier: 1.0
            },
            {
                id: "shielded",
                name: "Shielded",
                description: "Periodically immune to damage",
                damageMultiplier: 1.0,
                healthMultiplier: 1.3
            },
            {
                id: "vampiric",
                name: "Vampiric",
                description: "Heals from damage dealt",
                damageMultiplier: 1.1,
                healthMultiplier: 1.2
            },
            {
                id: "berserker",
                name: "Berserker",
                description: "Gains increased damage at low health",
                damageMultiplier: 1.3,
                healthMultiplier: 1.0
            },
            {
                id: "arcane",
                name: "Arcane",
                description: "Creates arcane beams that deal high damage",
                damageMultiplier: 1.2,
                healthMultiplier: 1.1
            },
            {
                id: "poison",
                name: "Poison",
                description: "Leaves poison clouds that deal damage over time",
                damageMultiplier: 1.1,
                healthMultiplier: 1.1
            }
        ]
    },
    
    // Dynamic difficulty adjustment settings
    dynamicDifficulty: {
        enabled: true, // Whether dynamic difficulty is enabled by default
        // How quickly the system responds to player performance (0-1)
        // Higher values mean faster adjustment
        adjustmentRate: 0.2,
        // Maximum adjustment factor (up or down)
        maxAdjustmentFactor: 0.3, // ±30% adjustment
        // Metrics used for adjustment
        metrics: {
            // Weight of player damage taken in adjustment calculation
            damageTakenWeight: 0.4,
            // Weight of time to kill enemies in adjustment calculation
            timeToKillWeight: 0.4,
            // Weight of player death frequency in adjustment calculation
            deathFrequencyWeight: 0.2
        },
        // Cooldown between adjustments (in seconds)
        adjustmentCooldown: 60,
        // Performance thresholds
        thresholds: {
            // If player is taking too much damage, reduce difficulty
            highDamageTaken: 0.7, // 70% of max health per encounter
            // If player is killing too quickly, increase difficulty
            fastKillTime: 0.5, // 50% faster than expected
            // If player is dying too frequently, reduce difficulty
            highDeathRate: 0.2 // More than 1 death per 5 encounters
        }
    },
    
    // World tier system (endgame progression)
    worldTiers: {
        // Minimum player level to unlock world tiers
        unlockLevel: 30,
        tiers: [
            {
                tier: 1,
                name: "World Tier I",
                difficultyMultiplier: 1.0,
                itemQualityMultiplier: 1.0,
                itemQuantityMultiplier: 1.0,
                experienceMultiplier: 1.0,
                goldMultiplier: 1.0
            },
            {
                tier: 2,
                name: "World Tier II",
                difficultyMultiplier: 1.5,
                itemQualityMultiplier: 1.2,
                itemQuantityMultiplier: 1.1,
                experienceMultiplier: 1.2,
                goldMultiplier: 1.2
            },
            {
                tier: 3,
                name: "World Tier III",
                difficultyMultiplier: 2.0,
                itemQualityMultiplier: 1.4,
                itemQuantityMultiplier: 1.2,
                experienceMultiplier: 1.4,
                goldMultiplier: 1.4
            },
            {
                tier: 4,
                name: "World Tier IV",
                difficultyMultiplier: 2.5,
                itemQualityMultiplier: 1.6,
                itemQuantityMultiplier: 1.3,
                experienceMultiplier: 1.6,
                goldMultiplier: 1.6
            },
            {
                tier: 5,
                name: "World Tier V",
                difficultyMultiplier: 3.0,
                itemQualityMultiplier: 1.8,
                itemQuantityMultiplier: 1.4,
                experienceMultiplier: 1.8,
                goldMultiplier: 1.8
            },
            {
                tier: 6,
                name: "World Tier VI",
                difficultyMultiplier: 4.0,
                itemQualityMultiplier: 2.0,
                itemQuantityMultiplier: 1.5,
                experienceMultiplier: 2.0,
                goldMultiplier: 2.0,
                guaranteedLegendary: true
            }
        ]
    }
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
    goldPerLevel: 100,
    // Special rewards at milestone levels
    milestones: {
        5: {
            description: "First Skill Variant Unlocked",
            skillPoints: 2,
            gold: 250
        },
        10: {
            description: "Second Skill Variant Unlocked",
            skillPoints: 3,
            gold: 500,
            item: {
                type: "accessory",
                minRarity: "rare"
            }
        },
        15: {
            description: "Third Skill Variant Unlocked",
            skillPoints: 3,
            statPoints: 5,
            gold: 750
        },
        20: {
            description: "Special Ability Unlocked",
            skillPoints: 4,
            gold: 1000,
            item: {
                type: "weapon",
                minRarity: "epic"
            }
        },
        30: {
            description: "World Tier System Unlocked",
            skillPoints: 5,
            statPoints: 10,
            gold: 2000,
            item: {
                type: "any",
                minRarity: "legendary"
            }
        }
    },
    // Stat scaling with level
    statScaling: {
        // Base stats at level 1
        baseStats: {
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            vitality: 10
        },
        // How much each stat contributes to derived attributes
        statContributions: {
            // Strength increases attack power and physical resistance
            strength: {
                attackPower: 1.0, // 1 attack power per point
                physicalResistance: 0.1 // 0.1% physical resistance per point
            },
            // Dexterity increases critical hit chance and dodge
            dexterity: {
                critChance: 0.1, // 0.1% crit chance per point
                dodge: 0.1 // 0.1% dodge chance per point
            },
            // Intelligence increases mana and skill effectiveness
            intelligence: {
                manaBonus: 1.0, // 1 mana per point
                skillEffectiveness: 0.5 // 0.5% skill effectiveness per point
            },
            // Vitality increases health and all resistances
            vitality: {
                healthBonus: 2.0, // 2 health per point
                allResistance: 0.05 // 0.05% all resistance per point
            }
        }
    }
};