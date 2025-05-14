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
     * Create a skill effect based on the skill name
     * @param {Skill} skill - The skill to create an effect for
     * @returns {SkillEffect} - The created skill effect
     */
    static createEffect(skill) {
        console.debug(`SkillEffectFactory.createEffect called for skill: ${skill.name}, type: ${skill.type}`);
        
        let effect;
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
            default:
                console.debug(`Creating default SkillEffect for ${skill.name}`);
                effect = new SkillEffect(skill);
                break;
        }
        
        console.debug(`Effect created: ${effect.constructor.name}`);
        return effect;
    }
}