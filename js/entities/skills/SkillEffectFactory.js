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
import { RadiantBreathEffect } from './variants/BreathOfHeaven/RadiantBreathEffect.js';
import { SoothingMistEffect } from './variants/BreathOfHeaven/SoothingMistEffect.js';
import { ZephyrsGraceEffect } from './variants/BreathOfHeaven/ZephyrsGraceEffect.js';

// Import Cyclone Strike variant effects
import { FrigidCycloneEffect } from './variants/CycloneStrike/FrigidCycloneEffect.js';
import { MysticWindsEffect } from './variants/CycloneStrike/MysticWindsEffect.js';
import { SandstormEffect } from './variants/CycloneStrike/SandstormEffect.js';
import { TempestRushEffect } from './variants/CycloneStrike/TempestRushEffect.js';
import { TornadoEffect } from './variants/CycloneStrike/TornadoEffect.js';
import { VortexEffect } from './variants/CycloneStrike/VortexEffect.js';

// Import Exploding Palm variant effects
import { FieryPalmEffect } from './variants/ExplodingPalm/FieryPalmEffect.js';
import { ShockingPalmEffect } from './variants/ExplodingPalm/ShockingPalmEffect.js';
import { BleedingPalmEffect } from './variants/ExplodingPalm/BleedingPalmEffect.js';
import { ConcussivePalmEffect } from './variants/ExplodingPalm/ConcussivePalmEffect.js';
import { IcyPalmEffect } from './variants/ExplodingPalm/IcyPalmEffect.js';

// Import Flying Dragon variant effects
import { ShadowDragonEffect } from './variants/FlyingDragon/ShadowDragonEffect.js';
import { DragonFlightEffect } from './variants/FlyingDragon/DragonFlightEffect.js';
import { InfernoDragonEffect } from './variants/FlyingDragon/InfernoDragonEffect.js';
import { ThunderDragonEffect } from './variants/FlyingDragon/ThunderDragonEffect.js';
import { GaleDragonEffect } from './variants/FlyingDragon/GaleDragonEffect.js';

// Import Flying Kick variant effects
import { BlazingKickEffect } from './variants/FlyingKick/BlazingKickEffect.js';
import { CycloneKickEffect } from './variants/FlyingKick/CycloneKickEffect.js';
import { ThunderousKickEffect } from './variants/FlyingKick/ThunderousKickEffect.js';
import { ShadowKickEffect } from './variants/FlyingKick/ShadowKickEffect.js';
import { GaleKickEffect } from './variants/FlyingKick/GaleKickEffect.js';

// Import Inner Sanctuary variant effects
import { CircleOfWrathEffect } from './variants/InnerSanctuary/CircleOfWrathEffect.js';
import { SanctifiedGroundEffect } from './variants/InnerSanctuary/SanctifiedGroundEffect.js';
import { SafeHavenEffect } from './variants/InnerSanctuary/SafeHavenEffect.js';
import { TempleOfProtectionEffect } from './variants/InnerSanctuary/TempleOfProtectionEffect.js';
import { ForbiddenPalaceEffect } from './variants/InnerSanctuary/ForbiddenPalaceEffect.js';

// Import Mystic Allies variant effects
import { FireAlliesEffect } from './variants/MysticAllies/FireAlliesEffect.js';
import { WaterAlliesEffect } from './variants/MysticAllies/WaterAlliesEffect.js';

// Import Imprisoned Fists variant effects
import { ThunderousGripEffect } from './variants/ImprisonedFists/ThunderousGripEffect.js';
import { FrozenShacklesEffect } from './variants/ImprisonedFists/FrozenShacklesEffect.js';
import { ShadowBindEffect } from './variants/ImprisonedFists/ShadowBindEffect.js';
import { GaleChainsEffect } from './variants/ImprisonedFists/GaleChainsEffect.js';
import { FieryChainsEffect } from './variants/ImprisonedFists/FieryChainsEffect.js';

// Import Wave Strike variant effects
import { TidalForceEffect } from './variants/WaveStrike/TidalForceEffect.js';
import { ShockingWaveEffect } from './variants/WaveStrike/ShockingWaveEffect.js';
import { FreezingWaveEffect } from './variants/WaveStrike/FreezingWaveEffect.js';
import { ExplosiveWaveEffect } from './variants/WaveStrike/ExplosiveWaveEffect.js';
import { HealingSurgeEffect } from './variants/WaveStrike/HealingSurgeEffect.js';

// Import Seven-Sided Strike variant effects
import { BlazingFistsEffect } from './variants/SevenSidedStrike/BlazingFistsEffect.js';
import { FrozenAssaultEffect } from './variants/SevenSidedStrike/FrozenAssaultEffect.js';
import { ThunderclapEffect } from './variants/SevenSidedStrike/ThunderclapEffect.js';
import { PhantomEchoEffect } from './variants/SevenSidedStrike/PhantomEchoEffect.js';
import { CelestialImpactEffect } from './variants/SevenSidedStrike/CelestialImpactEffect.js';

// Import Shield of Zen variant effects
import { RadiantBarrierEffect } from './variants/ShieldOfZen/RadiantBarrierEffect.js';
import { ReflectiveShieldEffect } from './variants/ShieldOfZen/ReflectiveShieldEffect.js';
import { FortifiedWallEffect } from './variants/ShieldOfZen/FortifiedWallEffect.js';
import { MysticVeilEffect } from './variants/ShieldOfZen/MysticVeilEffect.js';
import { ZensRetributionEffect } from './variants/ShieldOfZen/ZensRetributionEffect.js';

// Import Wave of Light variant effects
import { CrashingWaveEffect } from './variants/WaveOfLight/CrashingWaveEffect.js';
import { BlindingLightEffect } from './variants/WaveOfLight/BlindingLightEffect.js';
import { MoltenWaveEffect } from './variants/WaveOfLight/MoltenWaveEffect.js';
import { ThunderousWaveEffect } from './variants/WaveOfLight/ThunderousWaveEffect.js';
import { HealingWaveEffect } from './variants/WaveOfLight/HealingWaveEffect.js';

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
                    return new RadiantBreathEffect(skill);
                    
                case 'Soothing Mist':
                    return new SoothingMistEffect(skill);
                    
                case 'Zephyr\'s Grace':
                    return new ZephyrsGraceEffect(skill);
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
                    return new SandstormEffect(skill);
                    
                case 'Tempest Rush':
                    return new TempestRushEffect(skill);
                    
                case 'Tornado':
                    return new TornadoEffect(skill);
                    
                case 'Vortex':
                    return new VortexEffect(skill);
            }
        }
        
        // Handle Exploding Palm variants
        else if (skillName === 'Exploding Palm') {
            switch (variantName) {
                case 'Bleeding Palm':
                    return new BleedingPalmEffect(skill);
                    
                case 'Shocking Palm':
                    return new ShockingPalmEffect(skill);
                    
                case 'Concussive Palm':
                    return new ConcussivePalmEffect(skill);
                    
                case 'Fiery Palm':
                    return new FieryPalmEffect(skill);
                    
                case 'Icy Palm':
                    return new IcyPalmEffect(skill);
            }
        }
        
        // Handle Flying Dragon variants
        else if (skillName === 'Flying Dragon') {
            switch (variantName) {
                case 'Dragon\'s Flight':
                    return new DragonFlightEffect(skill);
                    
                case 'Inferno Dragon':
                    return new InfernoDragonEffect(skill);
                    
                case 'Thunder Dragon':
                    return new ThunderDragonEffect(skill);
                    
                case 'Gale Dragon':
                    return new GaleDragonEffect(skill);
                    
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
        
        // Handle Inner Sanctuary variants
        else if (skillName === 'Inner Sanctuary') {
            switch (variantName) {
                case 'Circle of Wrath':
                    // Creates a damaging field that harms enemies who enter
                    return new CircleOfWrathEffect(skill);
                    
                case 'Sanctified Ground':
                    // Increases healing for allies standing within the sanctuary
                    return new SanctifiedGroundEffect(skill);
                    
                case 'Safe Haven':
                    // Provides additional damage reduction for allies
                    return new SafeHavenEffect(skill);
                    
                case 'Temple of Protection':
                    // Creates a barrier that blocks projectiles
                    return new TempleOfProtectionEffect(skill);
                    
                case 'Forbidden Palace':
                    // Reduces enemy attack speed and movement within the sanctuary
                    return new ForbiddenPalaceEffect(skill);
            }
        }
        
        // Handle Mystic Allies variants
        else if (skillName === 'Mystic Allies') {
            switch (variantName) {
                case 'Fire Allies':
                    // Summons allies that deal fire damage and burn enemies
                    return new FireAlliesEffect(skill);
                    
                case 'Water Allies':
                    // Summons allies that deal water damage and slow enemies
                    return new WaterAlliesEffect(skill);
            }
        }
        
        // Handle Imprisoned Fists variants
        else if (skillName === 'Imprisoned Fists') {
            switch (variantName) {
                case 'Thunderous Grip':
                    // Adds lightning damage that chains between enemies
                    return new ThunderousGripEffect(skill);
                    
                case 'Frozen Shackles':
                    // Freezes enemies in place for a short duration
                    return new FrozenShacklesEffect(skill);
                    
                case 'Shadow Bind':
                    // Creates shadow tendrils that hold enemies in place
                    return new ShadowBindEffect(skill);
                    
                case 'Gale Chains':
                    // Creates wind chains that pull enemies together
                    return new GaleChainsEffect(skill);
                    
                case 'Fiery Chains':
                    // Creates burning chains that deal damage over time
                    return new FieryChainsEffect(skill);
            }
        }
        
        // Handle Wave Strike variants
        else if (skillName === 'Wave Strike') {
            switch (variantName) {
                case 'Tidal Force':
                    // The wave travels further and deals increased damage to enemies at the end of its path
                    return new TidalForceEffect(skill);
                    
                case 'Shocking Wave':
                    // Enemies hit by the wave are electrified, taking additional lightning damage over time
                    return new ShockingWaveEffect(skill);
                    
                case 'Freezing Wave':
                    // The wave chills enemies, reducing their movement speed for a short duration
                    return new FreezingWaveEffect(skill);
                    
                case 'Explosive Wave':
                    // The wave explodes on impact, dealing area damage to nearby enemies
                    return new ExplosiveWaveEffect(skill);
                    
                case 'Healing Surge':
                    // Allies hit by the wave are healed for a portion of the damage dealt
                    return new HealingSurgeEffect(skill);
            }
        }
        
        // Handle Seven-Sided Strike variants
        else if (skillName === 'Seven-Sided Strike') {
            switch (variantName) {
                case 'Blazing Fists':
                    // Each strike ignites enemies, dealing fire damage over time
                    return new BlazingFistsEffect(skill);
                    
                case 'Frozen Assault':
                    // Each strike has a chance to freeze enemies
                    return new FrozenAssaultEffect(skill);
                    
                case 'Thunderclap':
                    // Each strike releases a shockwave, dealing area damage
                    return new ThunderclapEffect(skill);
                    
                case 'Phantom Echo':
                    // Creates an echo that repeats the strikes after a delay
                    return new PhantomEchoEffect(skill);
                    
                case 'Celestial Impact':
                    // Increases the number of strikes and damage
                    return new CelestialImpactEffect(skill);
            }
        }
        
        // Handle Shield of Zen variants
        else if (skillName === 'Shield of Zen') {
            switch (variantName) {
                case 'Radiant Barrier':
                    // The shield emits a healing aura, restoring health to nearby allies
                    return new RadiantBarrierEffect(skill);
                    
                case 'Reflective Shield':
                    // Reflects a portion of absorbed damage back to attackers
                    return new ReflectiveShieldEffect(skill);
                    
                case 'Fortified Wall':
                    // Increases the shield's absorption capacity and duration
                    return new FortifiedWallEffect(skill);
                    
                case 'Mystic Veil':
                    // Grants invisibility to the Monk while the shield is active
                    return new MysticVeilEffect(skill);
                    
                case 'Zen\'s Retribution':
                    // Upon expiration, the shield explodes, dealing damage to nearby enemies
                    return new ZensRetributionEffect(skill);
            }
        }
        
        // Handle Wave of Light variants
        else if (skillName === 'Wave of Light') {
            switch (variantName) {
                case 'Crashing Wave':
                    // The wave travels further and deals increased damage to distant enemies
                    return new CrashingWaveEffect(skill);
                    
                case 'Blinding Light':
                    // Enemies hit by the wave are blinded for a short duration
                    return new BlindingLightEffect(skill);
                    
                case 'Molten Wave':
                    // The wave leaves a trail of fire, burning enemies over time
                    return new MoltenWaveEffect(skill);
                    
                case 'Thunderous Wave':
                    // The wave emits a thunderous sound, stunning enemies briefly
                    return new ThunderousWaveEffect(skill);
                    
                case 'Healing Wave':
                    // Allies hit by the wave are healed for a portion of the damage dealt
                    return new HealingWaveEffect(skill);
            }
        }
        
        // No variant-specific effect found
        console.debug(`No variant-specific effect found for ${skillName} (${variantName})`);
        return null;
    }
}