import * as THREE from 'three';

/**
 * Interface for enemy models
 * This class defines the contract that all enemy model implementations must follow
 */
export class EnemyModel {
    /**
     * Create a new enemy model
     * @param {Object} enemy - The enemy instance this model belongs to
     * @param {THREE.Group} modelGroup - The THREE.js group to add model parts to
     */
    constructor(enemy, modelGroup) {
        this.enemy = enemy;
        this.modelGroup = modelGroup;
        
        // Ensure child classes implement required methods
        if (this.constructor === EnemyModel) {
            throw new Error("EnemyModel is an abstract class and cannot be instantiated directly");
        }
    }
    
    /**
     * Create the 3D model for this enemy type
     * Must be implemented by all subclasses
     */
    createModel() {
        throw new Error("Method 'createModel()' must be implemented by subclass");
    }
    
    /**
     * Load a 3D model from a GLB file (for future implementation)
     * @param {string} path - Path to the GLB file
     * @returns {Promise} - Promise that resolves when the model is loaded
     */
    async loadFromGLB(path) {
        // This is a placeholder for future implementation
        // Will be used to load models from GLB files
        console.log(`Loading model from ${path} - not yet implemented`);
        return Promise.resolve();
    }
    
    /**
     * Update model animations
     * @param {number} delta - Time since last update in seconds
     */
    updateAnimations(delta) {
        // Default implementation does nothing
        // Override in subclasses if needed
    }
}