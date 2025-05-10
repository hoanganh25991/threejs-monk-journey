import * as THREE from 'three';
import { BleedingEffect } from '../../entities/skills/BleedingEffect.js';

/**
 * EffectsManager
 * Manages all visual effects in the game
 */
export class EffectsManager {
    /**
     * Create a new EffectsManager
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;
        this.effects = [];
    }
    
    /**
     * Initialize the EffectsManager
     */
    init() {
        // Nothing to initialize yet
        return true;
    }
    
    /**
     * Update all effects
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update and remove inactive effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Update the effect
            effect.update(delta);
            
            // Remove inactive effects
            if (!effect.isActive) {
                effect.dispose();
                this.effects.splice(i, 1);
            }
        }
    }
    
    /**
     * Create a bleeding effect at the given position
     * @param {number} amount - Damage amount
     * @param {Object} position - 3D position {x, y, z}
     * @param {boolean} isPlayerDamage - Whether the damage was caused to the player (true) or by the player (false)
     * @returns {BleedingEffect|null} - The created bleeding effect or null if creation failed
     */
    createBleedingEffect(amount, position, isPlayerDamage = false) {
        // Create a new bleeding effect
        const bleedingEffect = new BleedingEffect({
            amount: amount,
            duration: 1.5, // 1.5 seconds duration
            isPlayerDamage: isPlayerDamage
        });
        
        // Create the effect at the specified position
        const effectGroup = bleedingEffect.create(position, new THREE.Vector3(0, 1, 0));
        
        // Add the effect to the scene
        if (this.game && this.game.scene) {
            this.game.scene.add(effectGroup);
            
            // Add to the effects array for updates
            this.effects.push(bleedingEffect);
            
            return bleedingEffect;
        }
        
        return null;
    }
    
    /**
     * Clean up all effects
     * Should be called when changing scenes or shutting down the game
     */
    cleanupEffects() {
        // Clean up Three.js effects
        for (const effect of this.effects) {
            effect.dispose();
        }
        this.effects = [];
        
        // Clean up shared resources
        if (typeof BleedingEffect.cleanupSharedResources === 'function') {
            BleedingEffect.cleanupSharedResources();
        }
        
        // Force a garbage collection hint
        if (window.gc) {
            try {
                window.gc();
                console.log("Manual garbage collection triggered after effects cleanup");
            } catch (e) {
                // Ignore if not available
            }
        }
    }
}