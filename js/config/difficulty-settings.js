/**
 * Difficulty settings for the game
 * These control enemy scaling and rewards
 */
export const DIFFICULTY_SETTINGS = {
    basic: {
        name: 'Basic',
        description: 'A relaxed experience for casual play.',
        levelOffset: -5, // Enemy level = player level - 5
        damageMultiplier: 0.7,
        healthMultiplier: 0.7,
        experienceMultiplier: 0.8,
        itemQualityMultiplier: 0.8,
        itemDropRateMultiplier: 1.2,
        affixCount: 0, // No special affixes
        bossHealthMultiplier: 1.5,
        bossDamageMultiplier: 0.8
    },
    
    medium: {
        name: 'Medium',
        description: 'The standard game experience.',
        levelOffset: -2, // Enemy level = player level - 2
        damageMultiplier: 1.0,
        healthMultiplier: 1.0,
        experienceMultiplier: 1.0,
        itemQualityMultiplier: 1.0,
        itemDropRateMultiplier: 1.0,
        affixCount: 1, // One affix for elites and champions
        bossHealthMultiplier: 2.0,
        bossDamageMultiplier: 1.0
    },
    
    hard: {
        name: 'Hard',
        description: 'A challenging experience for skilled players.',
        levelOffset: 2, // Enemy level = player level + 2
        damageMultiplier: 1.3,
        healthMultiplier: 1.5,
        experienceMultiplier: 1.2,
        itemQualityMultiplier: 1.2,
        itemDropRateMultiplier: 1.0,
        affixCount: 2, // Two affixes for elites and champions
        bossHealthMultiplier: 2.5,
        bossDamageMultiplier: 1.3
    },
    
    hell: {
        name: 'Hell',
        description: 'An extreme challenge requiring excellent gear and skill.',
        levelOffset: 5, // Enemy level = player level + 5
        damageMultiplier: 2.0,
        healthMultiplier: 2.5,
        experienceMultiplier: 1.5,
        itemQualityMultiplier: 1.5,
        itemDropRateMultiplier: 0.8,
        affixCount: 3, // Three affixes for elites and champions
        bossHealthMultiplier: 3.0,
        bossDamageMultiplier: 1.8
    },
    
    inferno: {
        name: 'Inferno',
        description: 'The ultimate challenge for endgame players.',
        levelOffset: 10, // Enemy level = player level + 10
        damageMultiplier: 3.0,
        healthMultiplier: 4.0,
        experienceMultiplier: 2.0,
        itemQualityMultiplier: 2.0,
        itemDropRateMultiplier: 0.7,
        affixCount: 4, // Four affixes for elites and champions
        bossHealthMultiplier: 4.0,
        bossDamageMultiplier: 2.5
    }
};
