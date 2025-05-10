import * as THREE from 'three';
import { BleedingEffect } from '../../entities/skills/BleedingEffect.js';

/**
 * Effects Manager
 * Handles visual effects like bleeding, flashes, etc.
 */
export class EffectsManager {
    /**
     * Create a new EffectsManager
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;
        this.effects = [];
        this.threeJsEffects = [];
    }
    
    /**
     * Initialize the effects manager
     */
    init() {
        // For backward compatibility with any remaining DOM effects
        this.container = document.getElementById('effects-container');
        
        // Ensure the container exists
        if (!this.container) {
            console.warn('Effects container not found in the DOM. This is only needed for legacy DOM effects.');
        }
        
        return true;
    }
    
    /**
     * Update all active effects
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update and remove expired DOM effects (legacy)
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Update effect lifetime
            effect.lifetime -= delta;
            
            // Remove expired effects
            if (effect.lifetime <= 0) {
                if (effect.element && effect.element.parentNode) {
                    effect.element.remove();
                }
                this.effects.splice(i, 1);
            }
        }
        
        // Update Three.js effects
        for (let i = this.threeJsEffects.length - 1; i >= 0; i--) {
            const effect = this.threeJsEffects[i];
            
            // Update the effect
            effect.update(delta);
            
            // Remove inactive effects
            if (!effect.isActive) {
                effect.dispose();
                this.threeJsEffects.splice(i, 1);
            }
        }
    }
    
    /**
     * Create a bleeding effect at the given position
     * @param {number} amount - Damage amount
     * @param {Object} position - 3D position {x, y, z}
     * @param {boolean} isPlayerDamage - Whether the damage was caused by the player
     */
    createBleedingEffect(amount, position, isPlayerDamage = false) {
        // Only show damage particles for player-caused damage
        if (!isPlayerDamage) return;
        
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
            this.threeJsEffects.push(bleedingEffect);
            
            // For very high damage, add a screen flash effect (still using DOM for this)
            if (amount > 40 && this.container) {
                this.createScreenFlash('rgba(255, 0, 0, 0.15)', 0.5);
            }
            
            return bleedingEffect;
        }
        
        return null;
    }
    
    /**
     * Create a screen flash effect (still using DOM for this effect)
     * @param {string} color - CSS color string
     * @param {number} duration - Duration in seconds
     */
    createScreenFlash(color, duration) {
        if (!this.container) return;
        
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = color;
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '90';
        flash.style.transition = `opacity ${duration}s`;
        
        this.container.appendChild(flash);
        
        // Fade out and remove after a short time
        setTimeout(() => {
            flash.style.opacity = '0';
            
            // Add to effects array for cleanup
            this.effects.push({
                element: flash,
                lifetime: duration
            });
        }, 100);
    }
    
    /**
     * Clean up all effects
     * Should be called when changing scenes or shutting down the game
     */
    cleanup() {
        // Clean up DOM effects
        for (const effect of this.effects) {
            if (effect.element && effect.element.parentNode) {
                effect.element.remove();
            }
        }
        this.effects = [];
        
        // Clean up Three.js effects
        for (const effect of this.threeJsEffects) {
            effect.dispose();
        }
        this.threeJsEffects = [];
    }
}