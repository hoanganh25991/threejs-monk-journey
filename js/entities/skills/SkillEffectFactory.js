import { SkillEffect } from './SkillEffect.js';
import { WaveStrikeEffect } from './WaveStrikeEffect.js';
import { CycloneStrikeEffect } from './CycloneStrikeEffect.js';
import { SevenSidedStrikeEffect } from './SevenSidedStrikeEffect.js';
import { FistOfThunderEffect } from './FistOfThunderEffect.js';
import { InnerSanctuaryEffect } from './InnerSanctuaryEffect.js';
import { WaveOfLightEffect } from './WaveOfLightEffect.js';
import { MysticAllyEffect } from './MysticAllyEffect.js';
import { ExplodingPalmEffect } from './ExplodingPalmEffect.js';
import { ShieldOfZenEffect } from './ShieldOfZenEffect.js';
import { BreathOfHeavenEffect } from './BreathOfHeavenEffect.js';
import { FlyingDragonEffect } from './FlyingDragonEffect.js';
import { FlyingKickEffect } from './FlyingKickEffect.js';
import { DeadlyReachEffect } from './DeadlyReachEffect.js';
import { ImprisonedFistsEffect } from './ImprisonedFistsEffect.js';

// Import Breath of Heaven variant effects
import { CircleOfLifeEffect } from './variants/BreathOfHeaven/CircleOfLifeEffect.js';
import { InfusedWithLightEffect } from './variants/BreathOfHeaven/InfusedWithLightEffect.js';

// Import Cyclone Strike variant effects
import { FrigidCycloneEffect } from './variants/CycloneStrike/FrigidCycloneEffect.js';
import { MysticWindsEffect } from './variants/CycloneStrike/MysticWindsEffect.js';

// Import Exploding Palm variant effects
import { FieryPalmEffect } from './variants/ExplodingPalm/FieryPalmEffect.js';
import { ShockingPalmEffect } from './variants/ExplodingPalm/ShockingPalmEffect.js';

// Import Flying Dragon variant effects
import { ShadowDragonEffect } from './variants/FlyingDragon/ShadowDragonEffect.js';
import { DragonFlightEffect } from './variants/FlyingDragon/DragonFlightEffect.js';

// Import Flying Kick variant effects
import { BlazingKickEffect } from './variants/FlyingKick/BlazingKickEffect.js';
import { CycloneKickEffect } from './variants/FlyingKick/CycloneKickEffect.js';
import { ThunderousKickEffect } from './variants/FlyingKick/ThunderousKickEffect.js';
import { ShadowKickEffect } from './variants/FlyingKick/ShadowKickEffect.js';
import { GaleKickEffect } from './variants/FlyingKick/GaleKickEffect.js';

/**
 * Factory class for creating skill effects
 */
export class SkillEffectFactory {
    // Flag to track initialization status
    static initialized = false;
    
    /**
     * Initialize the factory by preloading necessary assets
     * This should be called during game initialization to avoid loading delays during gameplay
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    static async initialize() {
        if (this.initialized) {
            console.debug('SkillEffectFactory already initialized');
            return;
        }
        
        console.debug('Initializing SkillEffectFactory...');
        
        // Preload models for effects that need them
        try {
            // Preload Buddha model for Shield of Zen effect
            await ShieldOfZenEffect.preloadModel();
            
            // Add other model preloading here as needed
            
            this.initialized = true;
            console.debug('SkillEffectFactory initialization complete');
        } catch (error) {
            console.error('Error initializing SkillEffectFactory:', error);
            // Continue even if preloading fails - effects will use fallbacks
        }
    }
    
    /**
     * Create a skill effect based on the skill name and variant
     * @param {Skill} skill - The skill to create an effect for
     * @returns {SkillEffect} - The created skill effect
     */
    static createEffect(skill) {
        console.debug(`SkillEffectFactory.createEffect called for skill: ${skill.name}, type: ${skill.type}, variant: ${skill.variant || 'none'}`);
        
        let effect;
        
        // First check if there's a variant-specific effect class
        if (skill.variant) {
            // Try to create a variant-specific effect
            effect = this.createVariantEffect(skill);
            
            // If a variant-specific effect was created, return it
            if (effect) {
                console.debug(`Created variant-specific effect for ${skill.name} (${skill.variant})`);
                return effect;
            }
            
            // Otherwise, fall back to the base effect
            console.debug(`No variant-specific effect found for ${skill.name} (${skill.variant}), using base effect`);
        }
        
        // Create the base effect for the skill
        switch (skill.name) {
            case 'Wave Strike':
                console.debug(`Creating WaveStrikeEffect for ${skill.name}`);
                effect = new WaveStrikeEffect(skill);
                break;
            case 'Cyclone Strike':
                console.debug(`Creating CycloneStrikeEffect for ${skill.name}`);
                effect = new CycloneStrikeEffect(skill);
                break;
            case 'Seven-Sided Strike':
                console.debug(`Creating SevenSidedStrikeEffect for ${skill.name}`);
                effect = new SevenSidedStrikeEffect(skill);
                break;
            case 'Fist of Thunder':
                console.debug(`Creating FistOfThunderEffect for ${skill.name}`);
                effect = new FistOfThunderEffect(skill);
                break;
            case 'Inner Sanctuary':
                console.debug(`Creating InnerSanctuaryEffect for ${skill.name}`);
                effect = new InnerSanctuaryEffect(skill);
                break;
            case 'Wave of Light':
                console.debug(`Creating WaveOfLightEffect for ${skill.name}`);
                effect = new WaveOfLightEffect(skill);
                break;
            case 'Mystic Allies':
                console.debug(`Creating MysticAllyEffect for ${skill.name}`);
                effect = new MysticAllyEffect(skill);
                break;
            case 'Exploding Palm':
                console.debug(`Creating ExplodingPalmEffect for ${skill.name}`);
                effect = new ExplodingPalmEffect(skill);
                break;
            case 'Breath of Heaven':
                console.debug(`Creating BreathOfHeavenEffect for ${skill.name}`);
                effect = new BreathOfHeavenEffect(skill);
                break;
            case 'Shield of Zen':
                console.debug(`Creating ShieldOfZenEffect for ${skill.name}`);
                effect = new ShieldOfZenEffect(skill);
                break;
            case 'Flying Dragon':
                console.debug(`Creating FlyingDragonEffect for ${skill.name}`);
                effect = new FlyingDragonEffect(skill);
                break;
            case 'Flying Kick':
                console.debug(`Creating FlyingKickEffect for ${skill.name}`);
                effect = new FlyingKickEffect(skill);
                break;
            case 'Deadly Reach':
                console.debug(`Creating DeadlyReachEffect for ${skill.name}`);
                effect = new DeadlyReachEffect(skill);
                break;
            case 'Imprisoned Fists':
                console.debug(`Creating ImprisonedFistsEffect for ${skill.name}`);
                effect = new ImprisonedFistsEffect(skill);
                break;
            default:
                console.debug(`Creating default SkillEffect for ${skill.name}`);
                effect = new SkillEffect(skill);
                break;
        }
        
        console.debug(`Effect created: ${effect.constructor.name}`);
        return effect;
    }
    
    /**
     * Create a variant-specific effect for a skill
     * @param {Skill} skill - The skill to create an effect for
     * @returns {SkillEffect|null} - The created effect, or null if no variant-specific effect exists
     */
    static createVariantEffect(skill) {
        const skillName = skill.name;
        const variantName = skill.variant;
        
        if (!skillName || !variantName) return null;
        
        console.debug(`Creating variant effect for ${skillName} (${variantName})`);
        
        // Handle Breath of Heaven variants
        if (skillName === 'Breath of Heaven') {
            switch (variantName) {
                case 'Circle of Life':
                    return new CircleOfLifeEffect(skill);
                    
                case 'Infused with Light':
                    return new InfusedWithLightEffect(skill);
                    
                case 'Radiant Breath':
                    // Add blinding effect to enemies
                    const radiantEffect = new BreathOfHeavenEffect(skill);
                    radiantEffect.blindEffect = true;
                    radiantEffect.blindDuration = 3; // 3 seconds of blindness
                    return radiantEffect;
                    
                case 'Soothing Mist':
                    // Change to healing over time
                    const soothingEffect = new BreathOfHeavenEffect(skill);
                    soothingEffect.healOverTime = true;
                    soothingEffect.healingTickRate = 0.5; // Heal every 0.5 seconds
                    return soothingEffect;
                    
                case 'Zephyr\'s Grace':
                    // Add movement speed boost
                    const zephyrEffect = new BreathOfHeavenEffect(skill);
                    zephyrEffect.speedBoost = true;
                    zephyrEffect.speedBoostMultiplier = 1.3; // 30% speed boost
                    return zephyrEffect;
            }
        }
        
        // Handle Cyclone Strike variants
        else if (skillName === 'Cyclone Strike') {
            switch (variantName) {
                case 'Frigid Cyclone':
                    return new FrigidCycloneEffect(skill);
                    
                case 'Mystic Winds':
                    return new MysticWindsEffect(skill);
                    
                case 'Sandstorm':
                    // Add vision reduction effect
                    const sandstormEffect = new CycloneStrikeEffect(skill);
                    sandstormEffect.visionReduction = true;
                    sandstormEffect.visionReductionDuration = 6; // 6 seconds of reduced vision
                    return sandstormEffect;
                    
                case 'Tempest Rush':
                    // Add knockback immunity
                    const tempestEffect = new CycloneStrikeEffect(skill);
                    tempestEffect.knockbackImmunity = true;
                    return tempestEffect;
                    
                case 'Tornado':
                    // Add continuous damage over a longer duration
                    const tornadoEffect = new CycloneStrikeEffect(skill);
                    tornadoEffect.continuousDamage = true;
                    tornadoEffect.damageTickRate = 1.0; // Damage every 1 second
                    tornadoEffect.durationMultiplier = 1.5; // 50% longer duration
                    return tornadoEffect;
                    
                case 'Vortex':
                    // Add knockback effect
                    const vortexEffect = new CycloneStrikeEffect(skill);
                    vortexEffect.knockbackEffect = true;
                    vortexEffect.knockbackForce = 5; // Knockback force
                    return vortexEffect;
            }
        }
        
        // Handle Exploding Palm variants
        else if (skillName === 'Exploding Palm') {
            switch (variantName) {
                case 'Bleeding Palm':
                    // Add bleeding damage over time
                    const bleedingEffect = new ExplodingPalmEffect(skill);
                    bleedingEffect.bleedingEffect = true;
                    bleedingEffect.bleedingDamage = skill.damage * 0.2; // 20% of base damage per tick
                    bleedingEffect.bleedingTickRate = 0.5; // Bleed every 0.5 seconds
                    return bleedingEffect;
                    
                case 'Shocking Palm':
                    return new ShockingPalmEffect(skill);
                    
                case 'Concussive Palm':
                    // Add stun effect
                    const concussiveEffect = new ExplodingPalmEffect(skill);
                    concussiveEffect.stunEffect = true;
                    concussiveEffect.stunDuration = 2; // 2 seconds stun
                    return concussiveEffect;
                    
                case 'Fiery Palm':
                    return new FieryPalmEffect(skill);
                    
                case 'Icy Palm':
                    // Add slow effect
                    const icyEffect = new ExplodingPalmEffect(skill);
                    icyEffect.slowEffect = true;
                    icyEffect.slowAmount = 0.5; // 50% slow
                    icyEffect.slowDuration = 3; // 3 seconds slow
                    return icyEffect;
            }
        }
        
        // Handle Flying Dragon variants
        else if (skillName === 'Flying Dragon') {
            switch (variantName) {
                case 'Dragon\'s Flight':
                    return new DragonFlightEffect(skill);
                    
                case 'Inferno Dragon':
                    // Add fire damage over time
                    const infernoEffect = new FlyingDragonEffect(skill);
                    infernoEffect.fireDamage = true;
                    infernoEffect.burnDuration = 3; // 3 seconds burn
                    infernoEffect.burnDamage = skill.damage * 0.1; // 10% of base damage per tick
                    return infernoEffect;
                    
                case 'Thunder Dragon':
                    // Add stun effect
                    const thunderEffect = new FlyingDragonEffect(skill);
                    thunderEffect.stunEffect = true;
                    thunderEffect.stunDuration = 1.5; // 1.5 seconds stun
                    thunderEffect.stunChance = 0.3; // 30% chance to stun per hit
                    return thunderEffect;
                    
                case 'Gale Dragon':
                    // Add projectile deflection
                    const galeEffect = new FlyingDragonEffect(skill);
                    galeEffect.projectileDeflection = true;
                    galeEffect.deflectionRadius = 3; // 3 unit radius for deflection
                    return galeEffect;
                    
                case 'Shadow Dragon':
                    return new ShadowDragonEffect(skill);
            }
        }
        
        // Handle Flying Kick variants
        else if (skillName === 'Flying Kick') {
            switch (variantName) {
                case 'Blazing Kick':
                    // Adds fire damage to the kick, leaving a trail of flames
                    return new BlazingKickEffect(skill);
                    
                case 'Cyclone Kick':
                    // Creates a whirlwind effect that pulls in nearby enemies
                    return new CycloneKickEffect(skill);
                    
                case 'Thunderous Kick':
                    // Each kick releases a thunderclap that stuns enemies
                    return new ThunderousKickEffect(skill);
                    
                case 'Shadow Kick':
                    // Leaves a shadow clone that continues to attack enemies
                    return new ShadowKickEffect(skill);
                    
                case 'Gale Kick':
                    // Increases the speed and distance of the kick
                    return new GaleKickEffect(skill);
            }
        }
        
        // No variant-specific effect found
        console.debug(`No variant-specific effect found for ${skillName} (${variantName})`);
        return null;
    }
}