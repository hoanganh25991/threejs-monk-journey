import { SkillEffect } from './SkillEffect.js';
import { WaveStrikeEffect } from './WaveStrikeEffect.js';
import { CycloneStrikeEffect } from './CycloneStrikeEffect.js';
import { SevenSidedStrikeEffect } from './SevenSidedStrikeEffect.js';
import { FistOfThunderEffect } from './FistOfThunderEffect.js';
import { InnerSanctuaryEffect } from './InnerSanctuaryEffect.js';
import { WaveOfLightEffect } from './WaveOfLightEffect.js';
import { MysticAllyEffect } from './MysticAllyEffect.js';
import { ExplodingPalmEffect } from './ExplodingPalmEffect.js';

/**
 * Factory class for creating skill effects
 */
export class SkillEffectFactory {
    /**
     * Create a skill effect based on the skill name
     * @param {Skill} skill - The skill to create an effect for
     * @returns {SkillEffect} - The created skill effect
     */
    static createEffect(skill) {
        console.log(`SkillEffectFactory.createEffect called for skill: ${skill.name}, type: ${skill.type}`);
        
        let effect;
        switch (skill.name) {
            case 'Wave Strike':
                console.log(`Creating WaveStrikeEffect for ${skill.name}`);
                effect = new WaveStrikeEffect(skill);
                break;
            case 'Cyclone Strike':
                console.log(`Creating CycloneStrikeEffect for ${skill.name}`);
                effect = new CycloneStrikeEffect(skill);
                break;
            case 'Seven-Sided Strike':
                console.log(`Creating SevenSidedStrikeEffect for ${skill.name}`);
                effect = new SevenSidedStrikeEffect(skill);
                break;
            case 'Fist of Thunder':
                console.log(`Creating FistOfThunderEffect for ${skill.name}`);
                effect = new FistOfThunderEffect(skill);
                break;
            case 'Inner Sanctuary':
                console.log(`Creating InnerSanctuaryEffect for ${skill.name}`);
                effect = new InnerSanctuaryEffect(skill);
                break;
            case 'Wave of Light':
                console.log(`Creating WaveOfLightEffect for ${skill.name}`);
                effect = new WaveOfLightEffect(skill);
                break;
            case 'Mystic Ally':
                console.log(`Creating MysticAllyEffect for ${skill.name}`);
                effect = new MysticAllyEffect(skill);
                break;
            case 'Exploding Palm':
                console.log(`Creating ExplodingPalmEffect for ${skill.name}`);
                effect = new ExplodingPalmEffect(skill);
                break;
            default:
                console.log(`Creating default SkillEffect for ${skill.name}`);
                effect = new SkillEffect(skill);
                break;
        }
        
        console.log(`Effect created: ${effect.constructor.name}`);
        return effect;
    }
}