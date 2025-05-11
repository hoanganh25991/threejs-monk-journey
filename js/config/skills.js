// Skills configuration
export const SKILLS = [
    {
        name: 'Shield of Zen',
        description: 'Envelop yourself in a golden aura with a protective Buddha figure that absorbs 30% of damage and reflects 10% back to attackers',
        type: 'buff',
        damage: 0, // This is a defensive skill
        manaCost: 30,
        cooldown: 0.5, // Reduced cooldown
        range: 0, // Self-cast
        radius: 3, // Area of effect around player
        duration: 10, // 10 seconds duration
        color: 0xffdd00, // Golden color
        icon: '🧘', // Person in lotus position emoji
        sounds: {
            cast: 'skillInnerSanctuary', // Reusing Inner Sanctuary sound for now
            impact: 'barrierForm', // Sound of protective barrier forming
            end: 'barrierDissipate' // Sound of barrier fading away
        }
    },
    {
        name: 'Breath of Heaven',
        description: 'Summon a healing aura that heals allies and damages enemies',
        type: 'heal',
        damage: 10,
        healing: 20, // Amount of health restored per pulse
        manaCost: 30,
        cooldown: 15, // Longer cooldown for healing ability
        range: 0, // Centered on player
        radius: 8, // Large radius to affect multiple allies/enemies
        duration: 8, // Duration in seconds
        color: 0xffdd99, // Golden yellow color for divine energy
        icon: '🌬️', // Wind blowing emoji
        sounds: {
            cast: 'skillBreathOfHeaven', // Heavenly choir sound
            impact: 'healingPulse', // Soft healing pulse sound
            end: 'divineEcho' // Echoing divine sound as effect fades
        }
    },
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
        icon: '🌊', // Wave emoji
        sounds: {
            cast: 'skillWaveStrike', // Monk channels energy and releases a wave
            impact: 'waterImpact', // Watery impact sound when hitting enemies
            end: 'waterDissipate' // Sound of water energy dissipating
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
        icon: '🌀', // Cyclone emoji
        sounds: {
            cast: 'skillCycloneStrike', // Powerful wind gathering sound
            impact: 'windPull', // Sound of enemies being pulled by wind
            end: 'windDissipate' // Wind dissipating after the cyclone ends
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
        duration: 2.5,
        color: 0xff0000,
        icon: '🔄', // Cycle emoji
        hits: 7,
        sounds: {
            cast: 'skillSevenSidedStrike', // Monk chanting and focusing energy
            impact: 'rapidStrike', // Quick succession of strike impacts
            end: 'strikeComplete' // Final strike with emphasis
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
        icon: '🛡️', // Shield emoji
        sounds: {
            cast: 'skillInnerSanctuary', // Monk chanting a protection mantra
            impact: 'barrierForm', // Sound of protective barrier forming
            end: 'barrierDissipate' // Sound of barrier fading away
        }
    },
    {
        name: 'Mystic Ally',
        description: 'Summon spirit allies to fight alongside you',
        type: 'summon',
        damage: 12,
        manaCost: 35,
        cooldown: 0.5, // Reduced cooldown
        range: 2, // Increased range for summoning
        radius: 10, // Increased radius for summoning circle
        duration: 10, // Increased duration to 30 seconds
        color: 0x00ffff,
        icon: '👤', // Person emoji
        allyCount: 2, // Number of allies to summon
        sounds: {
            cast: 'skillMysticAlly', // Mystical summoning incantation
            impact: 'allySummonComplete', // Sound of ally materializing
            end: 'allyDismiss' // Sound of ally returning to spirit realm
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
        icon: '🔔', // Bell emoji
        sounds: {
            cast: 'skillWaveOfLight', // Monk summoning the bell with chanting
            impact: 'bellRing', // Deep, resonant bell sound
            end: 'bellFade' // Bell sound fading with reverberations
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
        icon: '💥', // Explosion emoji
        sounds: {
            cast: 'skillExplodingPalm', // Sound of monk focusing deadly energy
            impact: 'markApplied', // Sound of mark being applied to enemy
            end: 'massiveExplosion' // Powerful explosion when mark detonates
        }
    },
    {
        name: 'Fist of Thunder',
        description: 'Teleport to the nearest enemy and strike them with lightning',
        type: 'teleport',
        damage: 1,
        manaCost: 0,
        cooldown: 0.3, // Very short cooldown for basic attack
        range: 25, // Teleport range
        radius: 2, // Area of effect after teleport
        duration: 1.0, // Short duration
        color: 0x4169e1, // Royal blue color for lightning
        icon: '⚡', // Lightning emoji
        basicAttack: true,
        sounds: {
            cast: 'skillFistOfThunder', // Sound of lightning charging
            impact: 'thunderStrike', // Crackling lightning impact
            end: 'thunderEcho' // Echo of thunder after strike
        }
    }
];
