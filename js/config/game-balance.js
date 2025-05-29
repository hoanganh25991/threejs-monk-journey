/**
 * Game Balance Configuration
 * Contains settings for game balance, difficulty scaling, and combat mechanics
 */

// Player progression and stats configuration
export const PLAYER_PROGRESSION = {
    DEFAULT_PLAYER_STATS: {
        // Level and experience
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        
        // Health and mana
        health: 500,
        maxHealth: 500,
        mana: 200,
        maxMana: 200,
        
        // Base attributes
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        
        // Movement and combat
        movementSpeed: 15,
        attackPower: 10
    },

    // Experience scaling factor for leveling up
    LEVEL_UP_EXPERIENCE_MULTIPLIER : 1.5,

    // Resource regeneration rates (per second)
    RESOURCE_REGENERATION: {
        health: 2,
        mana: 5
    },

    // Stat increases per level
    LEVEL_UP_STAT_INCREASES: {
        maxHealth: 10,
        maxMana: 5,
        strength: 1,
        dexterity: 1,
        intelligence: 1,
        attackPower: 2
    },
};

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
        },
        
        // Rarity drop chances (base values, modified by player level and difficulty)
        rarityDropChances: {
            common: 60,
            uncommon: 25,
            rare: 10,
            epic: 4,
            legendary: 1,
            mythic: 0.1
        },
        
        // Level influence on rarity chances (percentage points per level)
        levelRarityInfluence: {
            common: -0.5,    // Decreases by 0.5% per level
            uncommon: 0.2,   // Increases by 0.2% per level
            rare: 0.15,      // Increases by 0.15% per level
            epic: 0.1,       // Increases by 0.1% per level
            legendary: 0.04, // Increases by 0.04% per level
            mythic: 0.01     // Increases by 0.01% per level
        },
        
        // Minimum level requirements for rarities
        rarityMinLevel: {
            common: 1,
            uncommon: 1,
            rare: 5,
            epic: 10,
            legendary: 20,
            mythic: 30
        },
        
        // Secondary stat count by rarity
        secondaryStatCount: {
            common: 0,
            uncommon: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
            mythic: 5
        },
        
        // Special effect count by rarity
        specialEffectCount: {
            common: 0,
            uncommon: 0,
            rare: 1,
            epic: 1,
            legendary: 2,
            mythic: 3
        },
        
        // Set item chances by rarity
        setItemChances: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0.2,      // 20% chance
            legendary: 0.3, // 30% chance
            mythic: 0.5     // 50% chance
        },
        
        // Item type drop weights
        itemTypeWeights: {
            weapon: 40,
            armor: 30,
            accessory: 20,
            consumable: 10
        },
        
        // Elemental damage types
        elementalTypes: ['fire', 'ice', 'lightning', 'holy'],
        
        // Elemental effects
        elementalEffects: {
            fire: {
                name: "Fire",
                description: "Burns enemies over time",
                damageOverTime: true,
                duration: 3,
                tickDamagePercent: 10
            },
            ice: {
                name: "Ice",
                description: "Slows enemy movement and attack speed",
                slowPercent: 30,
                duration: 2
            },
            lightning: {
                name: "Lightning",
                description: "Has a chance to chain to nearby enemies",
                chainChance: 0.3,
                chainCount: 2,
                chainDamagePercent: 50
            },
            holy: {
                name: "Holy",
                description: "Heals the player for a portion of damage dealt",
                healPercent: 10
            }
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
// Item set definitions
export const ITEM_SETS = {
    // Monk-specific sets
    monkSets: {
        // The Enlightened One set
        enlightenedOne: {
            id: "enlightenedOne",
            name: "The Enlightened One",
            description: "Ancient garments worn by the first monks to achieve enlightenment.",
            pieces: [
                { type: "armor", subType: "helmet", name: "Crown of Wisdom" },
                { type: "armor", subType: "robe", name: "Vestments of Clarity" },
                { type: "armor", subType: "gloves", name: "Fists of Serenity" },
                { type: "armor", subType: "belt", name: "Sash of Balance" },
                { type: "armor", subType: "boots", name: "Steps of Tranquility" },
                { type: "accessory", subType: "amulet", name: "Pendant of Enlightenment" }
            ],
            bonuses: [
                { 
                    count: 2, 
                    description: "+20% Meditation effectiveness",
                    effects: [{ type: "meditationEffectiveness", value: 20 }]
                },
                { 
                    count: 4, 
                    description: "+30% Spirit regeneration and +15% cooldown reduction",
                    effects: [
                        { type: "spiritRegen", value: 30 },
                        { type: "cooldownReduction", value: 15 }
                    ]
                },
                { 
                    count: 6, 
                    description: "Wave of Light creates 3 smaller waves that each deal 40% damage",
                    effects: [{ type: "skillModifier", skill: "waveOfLight", modifier: "tripleWave" }]
                }
            ]
        },
        
        // Thunderfist set
        thunderfist: {
            id: "thunderfist",
            name: "Thunderfist",
            description: "Harness the power of lightning with every strike.",
            pieces: [
                { type: "weapon", subType: "fist", name: "Fist of Thunder" },
                { type: "armor", subType: "gloves", name: "Storm Grips" },
                { type: "armor", subType: "belt", name: "Lightning Coil" },
                { type: "accessory", subType: "ring", name: "Thundergod's Vigor" }
            ],
            bonuses: [
                { 
                    count: 2, 
                    description: "+50% Lightning damage",
                    effects: [{ type: "elementalDamage", element: "lightning", value: 50 }]
                },
                { 
                    count: 4, 
                    description: "Your attacks have a 20% chance to call down lightning, dealing 150% weapon damage",
                    effects: [{ type: "proc", procType: "lightning", chance: 20, damage: 150 }]
                }
            ]
        },
        
        // Jade Harmony set
        jadeHarmony: {
            id: "jadeHarmony",
            name: "Jade Harmony",
            description: "Find inner peace and outward strength through perfect balance.",
            pieces: [
                { type: "weapon", subType: "staff", name: "Staff of Harmony" },
                { type: "armor", subType: "helmet", name: "Jade Crown" },
                { type: "armor", subType: "robe", name: "Jade Vestments" },
                { type: "armor", subType: "boots", name: "Jade Footwraps" },
                { type: "accessory", subType: "amulet", name: "Jade Pendant" }
            ],
            bonuses: [
                { 
                    count: 2, 
                    description: "+25% Healing effectiveness",
                    effects: [{ type: "healingEffectiveness", value: 25 }]
                },
                { 
                    count: 3, 
                    description: "+15% Damage reduction and +10% Movement speed",
                    effects: [
                        { type: "damageReduction", value: 15 },
                        { type: "movementSpeed", value: 10 }
                    ]
                },
                { 
                    count: 5, 
                    description: "Exploding Palm affects 2 additional enemies and its damage is increased by 100%",
                    effects: [
                        { type: "skillModifier", skill: "explodingPalm", modifier: "additionalTargets", value: 2 },
                        { type: "skillDamage", skill: "explodingPalm", value: 100 }
                    ]
                }
            ]
        }
    },
    
    // Generic sets that any class can use
    genericSets: {
        // Ancient Wisdom set
        ancientWisdom: {
            id: "ancientWisdom",
            name: "Ancient Wisdom",
            description: "Knowledge from the ancients flows through these artifacts.",
            pieces: [
                { type: "accessory", subType: "amulet", name: "Pendant of Knowledge" },
                { type: "accessory", subType: "ring", name: "Band of Secrets" },
                { type: "accessory", subType: "ring", name: "Circle of Truth" }
            ],
            bonuses: [
                { 
                    count: 2, 
                    description: "+20% Experience gained",
                    effects: [{ type: "experienceBonus", value: 20 }]
                },
                { 
                    count: 3, 
                    description: "+15% Cooldown reduction and +10% Resource cost reduction",
                    effects: [
                        { type: "cooldownReduction", value: 15 },
                        { type: "resourceCostReduction", value: 10 }
                    ]
                }
            ]
        },
        
        // Celestial Guardian set
        celestialGuardian: {
            id: "celestialGuardian",
            name: "Celestial Guardian",
            description: "Protected by the spirits of ancient guardians.",
            pieces: [
                { type: "armor", subType: "helmet", name: "Celestial Crown" },
                { type: "armor", subType: "robe", name: "Celestial Vestments" },
                { type: "armor", subType: "gloves", name: "Celestial Grips" },
                { type: "armor", subType: "boots", name: "Celestial Treads" }
            ],
            bonuses: [
                { 
                    count: 2, 
                    description: "+20% Health and +10% All resistances",
                    effects: [
                        { type: "healthBonus", value: 20 },
                        { type: "allResistance", value: 10 }
                    ]
                },
                { 
                    count: 4, 
                    description: "When you take damage, you have a 15% chance to become invulnerable for 2 seconds",
                    effects: [{ type: "proc", procType: "invulnerability", chance: 15, duration: 2 }]
                }
            ]
        }
    }
};

// Skill modification system
export const SKILL_MODIFICATIONS = {
    // Modifications for Wave of Light skill
    waveOfLight: {
        tripleWave: {
            name: "Triple Wave",
            description: "Wave of Light creates 3 smaller waves that each deal 40% damage",
            damageMultiplier: 0.4,
            waveCount: 3,
            visualEffect: "tripleWaveEffect"
        },
        fireWave: {
            name: "Fire Wave",
            description: "Wave of Light becomes a wave of fire that burns enemies for 3 seconds",
            elementType: "fire",
            burnDuration: 3,
            burnDamagePercent: 50,
            visualEffect: "fireWaveEffect"
        },
        wideWave: {
            name: "Wide Wave",
            description: "Wave of Light is 50% wider and pushes enemies back",
            widthMultiplier: 1.5,
            knockbackDistance: 5,
            visualEffect: "wideWaveEffect"
        }
    },
    
    // Modifications for Flying Kick skill
    flyingKick: {
        lightningKick: {
            name: "Lightning Kick",
            description: "Flying Kick charges you with lightning, dealing damage to nearby enemies",
            elementType: "lightning",
            aoeRadius: 3,
            aoeDamagePercent: 60,
            visualEffect: "lightningKickEffect"
        },
        teleportKick: {
            name: "Teleport Kick",
            description: "Flying Kick can be used again within 2 seconds at no spirit cost",
            cooldownReset: true,
            resetWindow: 2,
            noResourceCost: true,
            visualEffect: "teleportKickEffect"
        },
        explosiveKick: {
            name: "Explosive Kick",
            description: "Flying Kick creates an explosion on impact, dealing 80% weapon damage",
            explosionRadius: 4,
            explosionDamagePercent: 80,
            visualEffect: "explosiveKickEffect"
        }
    },
    
    // Modifications for Exploding Palm skill
    explodingPalm: {
        essenceBleed: {
            name: "Essence Bleed",
            description: "Exploding Palm's bleed effect lasts twice as long and deals 50% more damage",
            durationMultiplier: 2.0,
            damageMultiplier: 1.5,
            visualEffect: "essenceBleedEffect"
        },
        chainExplosion: {
            name: "Chain Explosion",
            description: "When an enemy affected by Exploding Palm dies, the explosion has a 40% chance to apply Exploding Palm to nearby enemies",
            chainChance: 0.4,
            chainRadius: 5,
            visualEffect: "chainExplosionEffect"
        },
        frostPalm: {
            name: "Frost Palm",
            description: "Exploding Palm becomes cold damage and freezes enemies for 2 seconds when they die",
            elementType: "ice",
            freezeDuration: 2,
            visualEffect: "frostPalmEffect"
        }
    }
};

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
