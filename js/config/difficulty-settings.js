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

/**
 * Enemy affix definitions
 */
export const ENEMY_AFFIXES = [
    {
        id: 'frozen',
        name: 'Frozen',
        description: 'Creates ice patches that slow and damage players',
        visualEffect: 'ice_aura',
        abilities: [
            {
                name: 'Ice Patch',
                cooldown: 5,
                effect: 'createIcePatch',
                params: {
                    duration: 4,
                    slowPercent: 50,
                    damagePerSecond: 5
                }
            }
        ]
    },
    {
        id: 'molten',
        name: 'Molten',
        description: 'Leaves fire trails and explodes on death',
        visualEffect: 'fire_aura',
        abilities: [
            {
                name: 'Fire Trail',
                cooldown: 0, // Passive
                effect: 'createFireTrail',
                params: {
                    duration: 3,
                    damagePerSecond: 10
                }
            },
            {
                name: 'Death Explosion',
                trigger: 'onDeath',
                effect: 'createExplosion',
                params: {
                    radius: 5,
                    damage: 50,
                    delay: 2 // Seconds before explosion
                }
            }
        ]
    },
    {
        id: 'teleporter',
        name: 'Teleporter',
        description: 'Can teleport to avoid attacks',
        visualEffect: 'teleport_aura',
        abilities: [
            {
                name: 'Teleport',
                cooldown: 8,
                effect: 'teleport',
                params: {
                    range: 10,
                    minDistance: 5
                }
            }
        ]
    },
    {
        id: 'shielded',
        name: 'Shielded',
        description: 'Periodically immune to damage',
        visualEffect: 'shield_aura',
        abilities: [
            {
                name: 'Energy Shield',
                cooldown: 15,
                effect: 'createShield',
                params: {
                    duration: 4,
                    absorptionPercent: 100
                }
            }
        ]
    },
    {
        id: 'vampiric',
        name: 'Vampiric',
        description: 'Heals from damage dealt',
        visualEffect: 'blood_aura',
        abilities: [
            {
                name: 'Life Drain',
                trigger: 'onHit',
                effect: 'drainLife',
                params: {
                    healPercent: 30 // Percent of damage dealt
                }
            }
        ]
    },
    {
        id: 'arcane',
        name: 'Arcane',
        description: 'Creates arcane beams that rotate and deal damage',
        visualEffect: 'arcane_aura',
        abilities: [
            {
                name: 'Arcane Beam',
                cooldown: 12,
                effect: 'createArcaneBeam',
                params: {
                    duration: 6,
                    damagePerSecond: 15,
                    rotationSpeed: 45 // Degrees per second
                }
            }
        ]
    },
    {
        id: 'fast',
        name: 'Fast',
        description: 'Moves and attacks more quickly',
        visualEffect: 'speed_aura',
        abilities: [
            {
                name: 'Increased Speed',
                trigger: 'passive',
                effect: 'increaseSpeed',
                params: {
                    movementSpeedPercent: 50,
                    attackSpeedPercent: 30
                }
            }
        ]
    },
    {
        id: 'waller',
        name: 'Waller',
        description: 'Creates walls to block player movement',
        visualEffect: 'earth_aura',
        abilities: [
            {
                name: 'Stone Wall',
                cooldown: 10,
                effect: 'createWall',
                params: {
                    length: 8,
                    duration: 5,
                    orientation: 'random' // 'horizontal', 'vertical', or 'random'
                }
            }
        ]
    }
];
