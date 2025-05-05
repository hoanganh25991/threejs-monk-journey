import { SkillEffect } from './SkillEffect.js';
import { RangedSkillEffect } from './RangedSkillEffect.js';
import { AoESkillEffect } from './AoESkillEffect.js';
import { MultiSkillEffect } from './MultiSkillEffect.js';
import { TeleportSkillEffect } from './TeleportSkillEffect.js';
import { BuffSkillEffect } from './BuffSkillEffect.js';
import { WaveSkillEffect } from './WaveSkillEffect.js';
import { SummonSkillEffect } from './SummonSkillEffect.js';
import { MarkSkillEffect } from './MarkSkillEffect.js';

/**
 * Factory class for creating skill effects
 */
export class SkillEffectFactory {
    /**
     * Create a skill effect based on the skill type
     * @param {Skill} skill - The skill to create an effect for
     * @returns {SkillEffect} - The created skill effect
     */
    static createEffect(skill) {
        console.log(`SkillEffectFactory.createEffect called for skill: ${skill.name}, type: ${skill.type}`);
        
        let effect;
        switch (skill.type) {
            case 'ranged':
                console.log(`Creating RangedSkillEffect for ${skill.name}`);
                effect = new RangedSkillEffect(skill);
                break;
            case 'aoe':
                console.log(`Creating AoESkillEffect for ${skill.name}`);
                effect = new AoESkillEffect(skill);
                break;
            case 'multi':
                console.log(`Creating MultiSkillEffect for ${skill.name}`);
                effect = new MultiSkillEffect(skill);
                break;
            case 'teleport':
                console.log(`Creating TeleportSkillEffect for ${skill.name}`);
                effect = new TeleportSkillEffect(skill);
                break;
            case 'buff':
                console.log(`Creating BuffSkillEffect for ${skill.name}`);
                effect = new BuffSkillEffect(skill);
                break;
            case 'wave':
                console.log(`Creating WaveSkillEffect for ${skill.name}`);
                effect = new WaveSkillEffect(skill);
                break;
            case 'summon':
                console.log(`Creating SummonSkillEffect for ${skill.name}`);
                effect = new SummonSkillEffect(skill);
                break;
            case 'mark':
                console.log(`Creating MarkSkillEffect for ${skill.name}`);
                effect = new MarkSkillEffect(skill);
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