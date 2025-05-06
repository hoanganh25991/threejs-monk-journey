// Skills configuration
export const SKILLS = [
    {
        name: 'Wave Strike',
        description: 'Send a wave of energy towards enemies',
        type: 'ranged',
        damage: 20,
        manaCost: 15,
        cooldown: 0.5, // Reduced cooldown
        range: 25,
        radius: 2,
        duration: 3.5, // Further increased duration from 2.5 to 3.5
        color: 0x00ffff,
        sounds: {
            cast: 'skillWaveStrike',
            impact: 'enemyHit',
            end: null
        }
    },
    {
        name: 'Cyclone Strike',
        description: 'Pull enemies towards you and deal area damage',
        type: 'aoe',
        damage: 15,
        manaCost: 25,
        cooldown: 0.5, // Reduced cooldown
        range: 5,
        radius: 4,
        duration: 2.5, // Further increased duration from 1.5 to 2.5
        color: 0xffcc00,
        sounds: {
            cast: 'skillCycloneStrike',
            impact: 'enemyHit',
            end: null
        }
    },
    {
        name: 'Seven-Sided Strike',
        description: 'Rapidly attack multiple enemies',
        type: 'multi',
        damage: 10,
        manaCost: 30,
        cooldown: 0.5, // Reduced cooldown
        range: 6,
        radius: 10,
        duration: 5.0, // Further increased duration from 3.5 to 5.0
        color: 0xff0000,
        hits: 7,
        sounds: {
            cast: 'skillSevenSidedStrike',
            impact: 'enemyHit',
            end: null
        }
    },
    {
        name: 'Inner Sanctuary',
        description: 'Create a protective zone that reduces damage',
        type: 'buff',
        damage: 10,
        manaCost: 20,
        cooldown: 0.5, // Reduced cooldown
        range: 0,
        radius: 5,
        duration: 10, // Further increased duration from 7 to 10
        color: 0xffffff,
        sounds: {
            cast: 'skillInnerSanctuary',
            impact: null,
            end: null
        }
    },
    {
        name: 'Mystic Ally',
        description: 'Summon a spirit ally to fight alongside you',
        type: 'summon',
        damage: 8,
        manaCost: 35,
        cooldown: 0.5, // Reduced cooldown
        range: 2,
        radius: 1,
        duration: 20, // Further increased duration from 15 to 20
        color: 0x00ffff,
        sounds: {
            cast: 'skillMysticAlly',
            impact: null,
            end: null
        }
    },
    {
        name: 'Wave of Light',
        description: 'Summon a massive bell that crashes down on enemies',
        type: 'wave',
        damage: 50,
        manaCost: 40,
        cooldown: 0.5, // Reduced cooldown
        range: 25,
        radius: 5,
        duration: 5.0, // Further increased duration from 3.5 to 5.0
        color: 0xffdd22, // Golden color for the bell's light
        sounds: {
            cast: 'skillWaveOfLight',
            impact: 'bellRing', // New sound for bell impact
            end: null
        }
    },
    {
        name: 'Exploding Palm',
        description: 'Giant Palm: Summon a massive ethereal palm that marks enemies, causing them to violently explode on death and unleash devastating damage to all nearby foes',
        type: 'mark',
        damage: 15,
        manaCost: 25,
        cooldown: 0.5, // Reduced cooldown
        range: 30,
        radius: 5,
        duration: 5, // Further increased duration from 15 to 20 seconds
        color: 0xff3333,
        sounds: {
            cast: 'skillExplodingPalm',
            impact: 'enemyHit',
            end: 'explosion'
        }
    },
    {
        name: 'Fist of Thunder',
        description: 'Teleport to the nearest enemy and strike them with lightning',
        type: 'teleport',
        damage: 1,
        manaCost: 0,
        cooldown: 0, // Very short cooldown for basic attack
        range: 25, // Teleport range
        radius: 2, // Area of effect after teleport
        duration: 1.0, // Short duration
        color: 0x4169e1, // Royal blue color for lightning
        basicAttack: true,
        sounds: {
            cast: 'skillFistOfThunder',
            impact: 'enemyHit',
            end: null
        }
    }
];
