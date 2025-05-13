import { SkeletonModel } from './SkeletonModel.js';
import { ZombieModel } from './ZombieModel.js';
import { DemonModel } from './DemonModel.js';
import { FrostTitanModel } from './FrostTitanModel.js';
import { NecromancerModel } from './NecromancerModel.js';
import { ShadowBeastModel } from './ShadowBeastModel.js';
import { InfernalGolemModel } from './InfernalGolemModel.js';
import { DefaultModel } from './DefaultModel.js';

/**
 * Factory class for creating enemy models
 */
export class EnemyModelFactory {
    /**
     * Create an appropriate model for the given enemy type
     * @param {Object} enemy - The enemy instance
     * @param {THREE.Group} modelGroup - The THREE.js group to add model parts to
     * @returns {EnemyModel} The created model instance
     */
    static createModel(enemy, modelGroup) {
        switch (enemy.type) {
            case 'skeleton':
            case 'skeleton_king':
                return new SkeletonModel(enemy, modelGroup);
                
            case 'zombie':
                return new ZombieModel(enemy, modelGroup);
                
            case 'demon':
            case 'demon_lord':
                return new DemonModel(enemy, modelGroup);
                
            case 'frost_titan':
                return new FrostTitanModel(enemy, modelGroup);
                
            case 'necromancer':
            case 'necromancer_lord':
                return new NecromancerModel(enemy, modelGroup);
                
            case 'shadow_beast':
                return new ShadowBeastModel(enemy, modelGroup);
                
            case 'infernal_golem':
                return new InfernalGolemModel(enemy, modelGroup);
                
            default:
                return new DefaultModel(enemy, modelGroup);
        }
    }
    
    /**
     * Load a model from a GLB file (for future implementation)
     * @param {Object} enemy - The enemy instance
     * @param {THREE.Group} modelGroup - The THREE.js group to add model parts to
     * @param {string} path - Path to the GLB file
     * @returns {Promise} - Promise that resolves when the model is loaded
     */
    static async loadModelFromGLB(enemy, modelGroup, path) {
        // This is a placeholder for future implementation
        // Will be used to load models from GLB files
        console.log(`Loading model from ${path} for ${enemy.type} - not yet implemented`);
        
        // For now, fall back to the default model creation
        const model = this.createModel(enemy, modelGroup);
        return model;
    }
}