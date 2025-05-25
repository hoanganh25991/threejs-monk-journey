// Skills configuration
import { SKILL_ICONS } from './skill-icons.js';
// Type definitions are available in skill-types.d.ts
// @ts-check
/** @typedef {import('./skill-types').SkillConfig} SkillConfig */

// Primary attacks - basic attacks that don't consume mana
/** @type {SkillConfig[]} */
export const PRIMARY_ATTACKS = [
    {
        name: 'Fist of Thunder',
        description: 'Teleport to the nearest enemy and strike them with lightning',
        type: 'teleport',
        damage: 25,
        manaCost: 5,
        cooldown: 0, // Very short cooldown for basic attack
        range: 13, // Teleport range
        radius: 4, // Increased area of effect for more reliable hits
        duration: 0.5, // Short duration
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
        damage: 10,
        manaCost: 10,
        cooldown: 0,
        range: 25, // Increased range for a proper ranged attack
        radius: 1, // Small area of effect at impact point
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
/** @type {SkillConfig[]} */
export const NORMAL_SKILLS = [
    {
        name: 'Wave of Light',
        description: 'Summon a massive bell that crashes down on enemies',
        type: 'wave',
        damage: 50,
        manaCost: 20,
        cooldown: 0, // Reduced cooldown
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
        damage: 2, // This is a defensive skill
        manaCost: 30,
        cooldown: 0, // Reduced cooldown
        range: 0, // Self-cast
        radius: 3, // Area of effect around player
        duration: 8, // 10 seconds duration
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
        damage: 5,
        healing: 10, // Amount of health restored per pulse
        manaCost: 20,
        cooldown: 0, // Longer cooldown for healing ability
        range: 0, // Centered on player
        radius: 8, // Large radius to affect multiple allies/enemies
        duration: 5, // Duration in seconds
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
        manaCost: 20,
        cooldown: 0, // Reduced cooldown
        range: 25,
        radius: 3,
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
        damage: 30,
        manaCost: 40,
        cooldown: 0, // Reduced cooldown
        range: 0,
        radius: 4,
        get duration() { return 1.5 + Math.log(this.radius) },
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
        damage: 50,
        manaCost: 30,
        cooldown: 0, // Reduced cooldown
        range: 0,
        radius: 5,
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
        damage: 5,
        manaCost: 20,
        cooldown: 0, // Reduced cooldown
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
        damage: 50,
        manaCost: 0,
        cooldown: 0, // Reduced cooldown
        range: 0, // Increased range for summoning
        radius: 10, // Increased radius for summoning circle
        duration: 8, // Increased duration to 30 seconds
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
        damage: 55,
        manaCost: 50,
        cooldown: 0, // Reduced cooldown
        range: 30,
        radius: 3,
        duration: 3, // Further increased duration from 15 to 20 seconds
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
        cooldown: 0,
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
        cooldown: 0,
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
        damage: 5,
        manaCost: 25,
        range: 10,
        radius: 5,
        moveSpeed: 30, // Speed at which the effect moves forward
        cooldown: 0,
        get duration() { return this.lockDuration + (this.range / this.moveSpeed) },
        get color() { return SKILL_ICONS[this.name].color; },
        get icon() { return SKILL_ICONS[this.name].emoji; },
        immobilize: true, // Prevents enemies from moving
        // Ground rectangle properties for collision detection
        groundRectangle: {
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
        lockDuration: 5,
        sounds: {
            cast: 'skillImprisonedFists', // Sound of monk focusing energy
            impact: 'chainImpact', // Sound of chains binding enemies
            end: 'chainsBreak' // Sound of chains breaking as effect ends
        }
    },
    {
        name: 'Bul Palm',
        description: 'Giant palm moving, damaging all enemies on the path.',
        type: 'projectile',
        damage: 100,
        manaCost: 25,
        cooldown: 0, // Moderate cooldown
        range: 40, // Long range
        radius: 3, // Explosion radius
        duration: 5, // Duration in seconds
        get color() { return SKILL_ICONS[this.name]?.color; }, // Green color
        get icon() { return SKILL_ICONS[this.name]?.emoji; }, // Leaf emoji as fallback
        sounds: {
            cast: 'skillExplodingPalm', // Reusing sound temporarily
            impact: 'markApplied', // Reusing sound temporarily
            end: 'massiveExplosion' // Reusing sound temporarily
        },
        explosionInterval: 0.1, // Time between explosions in seconds
        explosionDamageMultiplier: 0.5, // Damage multiplier for each explosion
        piercing: true, // Can pierce through enemies
        projectileSpeed: 10, // Speed of the projectile
        isCustomSkill: true,
    },
    {
        name: 'Bul Breath Of Heaven',
        description: 'Same like Breath of Heaven, which allows you to run faster, but x5 current effect, like cast 5 times continuously.',
        type: 'buff',
        damage: 5,
        healing: 10, // Small healing amount per pulse
        manaCost: 25,
        cooldown: 0, // Moderate cooldown
        range: 0, // Self-cast
        radius: 5, // Large radius to affect multiple allies/enemies
        duration: 3, // Duration in seconds
        get color() { return SKILL_ICONS[this.name]?.color; }, // Green color
        get icon() { return SKILL_ICONS[this.name]?.emoji; }, // Leaf emoji as fallback
        sounds: {
            cast: 'skillBreathOfHeaven', // Reusing Breath of Heaven sound
            impact: 'healingPulse', // Soft healing pulse sound
            end: 'divineEcho' // Echoing divine sound as effect fades
        },
        speedBoostMultiplier: 10, // 10x speed boost (5x the normal 2x boost)
        speedBoostDuration: 10, // 10 seconds of speed boost
        isCustomSkill: true,
    },
    // TODO: Add more skills here
];

// For backward compatibility, export a combined array of all skills
/** @type {SkillConfig[]} */
export const SKILLS = [...PRIMARY_ATTACKS, ...NORMAL_SKILLS];

/** @type {SkillConfig[]} */
export const BATTLE_SKILLS = [
    ...NORMAL_SKILLS.slice(0, 7), // First 7 normal skills
    PRIMARY_ATTACKS[0], // First primary skill
]