// Skills configuration
import { SKILL_ICONS } from './skill-icons.js';

// Primary attacks - basic attacks that don't consume mana
export const PRIMARY_ATTACKS = [
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
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        primaryAttack: true,
        sounds: {
            cast: 'skillFistOfThunder', // Sound of lightning charging
            impact: 'thunderStrike', // Crackling lightning impact
            end: 'thunderEcho' // Echo of thunder after strike
        }
    },
    {
        name: "Deadly Reach",
        description: "Extend your reach to strike enemies from a distance.",
        type: "projectile",
        damage: 1,
        manaCost: 0,
        cooldown: 0,
        range: 15, // Increased range for a proper ranged attack
        radius: 0.5, // Small area of effect at impact point
        duration: 1.5, // Duration for the beam to extend and retract
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        piercing: true, // Can pierce through enemies
        knockback: true, // Final strike can knock back enemies
        primaryAttack: true,
        projectileSpeed: 15, // Speed of the projectile
        stationaryAttack: true, // Flag to indicate this skill should not move the hero
        sounds: {
            "cast": "deadlyReachCast", // Sound of energy focusing
            "impact": "deadlyReachImpact", // Sound of strike hitting
            "end": "deadlyReachEnd" // Sound of energy dispersing
        }
    }
];

// Normal skills that consume mana and have various effects
export const NORMAL_SKILLS = [
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
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        sounds: {
            cast: 'skillWaveOfLight', // Monk summoning the bell with chanting
            impact: 'bellRing', // Deep, resonant bell sound
            end: 'bellFade' // Bell sound fading with reverberations
        }
    },
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
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        sounds: {
            cast: 'skillInnerSanctuary', // Reusing Inner Sanctuary sound for now
            impact: 'barrierForm', // Sound of protective barrier forming
            end: 'barrierDissipate' // Sound of barrier fading away
        }
    },
    {
        name: 'Breath of Heaven',
        description: 'A healing skill that restores health to the Monk and nearby allies.',
        type: 'heal',
        damage: 10,
        healing: 20, // Amount of health restored per pulse
        manaCost: 30,
        cooldown: 8, // Longer cooldown for healing ability
        range: 0, // Centered on player
        radius: 8, // Large radius to affect multiple allies/enemies
        duration: 8, // Duration in seconds
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
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
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        sounds: {
            cast: 'skillWaveStrike', // Monk channels energy and releases a wave
            impact: 'waterImpact', // Watery impact sound when hitting enemies
            end: 'waterDissipate' // Sound of water energy dissipating
        }
    },
    {
        name: 'Cyclone Strike',
        description: 'Generate a vortex of wind that pulls in enemies and deals damage.',
        type: 'aoe',
        damage: 15,
        manaCost: 25,
        cooldown: 0.5, // Reduced cooldown
        range: 5,
        radius: 4,
        duration: 2.5, // Further increased duration from 1.5 to 2.5
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
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
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
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
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        sounds: {
            cast: 'skillInnerSanctuary', // Monk chanting a protection mantra
            impact: 'barrierForm', // Sound of protective barrier forming
            end: 'barrierDissipate' // Sound of barrier fading away
        }
    },
    {
        name: 'Mystic Allies',
        description: 'Summon spirit allies to fight alongside you',
        type: 'summon',
        damage: 12,
        manaCost: 35,
        cooldown: 0.5, // Reduced cooldown
        range: 2, // Increased range for summoning
        radius: 10, // Increased radius for summoning circle
        duration: 10, // Increased duration to 30 seconds
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        allyCount: 2, // Number of allies to summon
        sounds: {
            cast: 'skillMysticAlly', // Mystical summoning incantation
            impact: 'allySummonComplete', // Sound of ally materializing
            end: 'allyDismiss' // Sound of ally returning to spirit realm
        }
    },
    {
        name: 'Exploding Palm',
        description: 'A skill that marks an enemy for death, causing them to explode upon death and deal damage to nearby enemies.',
        type: 'mark',
        damage: 15,
        manaCost: 25,
        cooldown: 0.5, // Reduced cooldown
        range: 30,
        radius: 5,
        duration: 5, // Further increased duration from 15 to 20 seconds
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        sounds: {
            cast: 'skillExplodingPalm', // Sound of monk focusing deadly energy
            impact: 'markApplied', // Sound of mark being applied to enemy
            end: 'massiveExplosion' // Powerful explosion when mark detonates
        }
    },
    {
        name: 'Flying Dragon',
        description: 'A powerful attack that launches the Monk into the air, striking enemies with a flurry of kicks.',
        type: 'dash',
        damage: 25,
        manaCost: 35,
        cooldown: 8,
        range: 15, // Increased range for fast forward movement
        radius: 3, // Adjusted radius for the area of effect
        duration: 2, // Slightly reduced duration for a faster, more impactful attack
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        dashSpeed: 20, // Speed of the dash forward
        verticalLeap: true, // Indicates the monk leaps into the air
        multiHit: 5, // Number of kicks in the flurry
        windEffect: true, // Visual wind effect when moving forward
        sounds: {
            cast: 'skillFlyingDragon', // Sound of monk leaping into the air
            impact: 'dragonStrike', // Sound of powerful kicks landing
            end: 'dragonLand' // Sound of monk landing after the attack
        }
    },
    {
        name: 'Flying Kick',
        description: 'A swift kick that propels the Monk forward, dealing damage to enemies in its path.',
        type: 'dash',
        damage: 30,
        manaCost: 20,
        cooldown: 1,
        radius: 2,
        // Configuration parameters for the kick effect:
        range: 30,       // Maximum distance the kick can travel (in units)
        duration: 5,      // Maximum time the effect can last (in seconds)
        kickSpeed: 40,    // Speed of the kick (units per second)
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        sounds: {
            cast: 'skillFlyingKick', // Sound of monk preparing to kick
            impact: 'kickImpact',    // Sound of kick connecting with enemies
            end: 'kickLand'          // Sound of monk landing after the kick
        }
    },
    {
        name: 'Imprisoned Fists',
        description: 'A powerful strike that locks enemies in place, preventing them from moving.',
        type: 'control',
        damage: 1,
        manaCost: 25,
        cooldown: 0,
        range: 25,
        radius: 5,
        get duration() { return this.range / this.moveSpeed },
        moveSpeed: 25, // Speed at which the effect moves forward
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        immobilize: true, // Prevents enemies from moving
        // Ground rectangle properties for collision detection
        groundRectangle: {
            // Width is perpendicular to travel direction (X-Z plane)
            // Width equals the skill's radius
            useSkillRadiusForWidth: true,
            // Length increases along travel direction
            dynamicLength: true,
            // Small Y offset from terrain height
            yOffset: 0.1
        },
        // Apply lock effect to enemies hit during travel
        lockEnemiesDuringTravel: true,
        // Lock effect duration (in seconds)
        lockDuration: 1.5,
        sounds: {
            cast: 'skillImprisonedFists', // Sound of monk focusing energy
            impact: 'chainImpact', // Sound of chains binding enemies
            end: 'chainsBreak' // Sound of chains breaking as effect ends
        }
    },
    // TODO: Add more skills here
];

// For backward compatibility, export a combined array of all skills
export const SKILLS = [...PRIMARY_ATTACKS, ...NORMAL_SKILLS];

export const BATTLE_SKILLS = [
    ...NORMAL_SKILLS.slice(0, 7), // First 7 normal skills
    PRIMARY_ATTACKS[0], // First primary skill
]