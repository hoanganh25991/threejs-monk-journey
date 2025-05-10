import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for bleeding/damage visualization
 * Replaces the DOM-based implementation with a Three.js implementation
 */
export class BleedingEffect extends SkillEffect {
    /**
     * Create a new BleedingEffect
     * @param {Object} config - Configuration object
     */
    constructor(config) {
        // Create a temporary skill object to pass to the parent constructor
        const tempSkill = {
            color: 0xff0000, // Default red color for blood
            duration: config.duration || 1.5, // Default duration of 1.5 seconds
            position: new THREE.Vector3(),
            damage: config.amount || 0
        };
        
        super(tempSkill);
        
        // Store additional configuration
        this.amount = config.amount || 0;
        this.isPlayerDamage = config.isPlayerDamage || false;
        this.particleCount = this.calculateParticleCount(this.amount);
        this.baseColor = this.calculateColor(this.amount);
        this.particles = [];
    }
    
    /**
     * Calculate the number of particles based on damage amount
     * @param {number} amount - Damage amount
     * @returns {number} - Number of particles to create
     * @private
     */
    calculateParticleCount(amount) {
        const minParticles = 3;
        const maxParticles = 15;
        return Math.min(maxParticles, minParticles + Math.floor(amount / 10));
    }
    
    /**
     * Calculate the color based on damage amount
     * @param {number} amount - Damage amount
     * @returns {THREE.Color} - Color for the particles
     * @private
     */
    calculateColor(amount) {
        let color;
        if (amount < 10) {
            color = new THREE.Color(0x780000); // Dark red for low damage
        } else if (amount < 30) {
            color = new THREE.Color(0xb40000); // Medium red
        } else if (amount < 50) {
            color = new THREE.Color(0xdc0000); // Bright red
        } else {
            color = new THREE.Color(0xff1e1e); // Intense red with slight glow for high damage
        }
        return color;
    }
    
    /**
     * Create the bleeding effect
     * @param {THREE.Vector3} position - Position to create the effect at
     * @param {THREE.Vector3} direction - Direction is not used for this effect but required by interface
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group to hold all particles
        const effectGroup = new THREE.Group();
        
        // Position the effect
        effectGroup.position.copy(position);
        effectGroup.position.y += 1; // Raise slightly above the target
        
        // Create blood particles
        for (let i = 0; i < this.particleCount; i++) {
            // Create particle
            const particle = this.createParticle(i);
            effectGroup.add(particle);
            this.particles.push(particle);
        }
        
        // Create a flash effect for high damage
        if (this.amount > 40) {
            const flash = this.createFlashEffect();
            effectGroup.add(flash);
        }
        
        // Store the effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    /**
     * Create a single blood particle
     * @param {number} index - Particle index
     * @returns {THREE.Mesh} - The created particle
     * @private
     */
    createParticle(index) {
        // Randomize particle size based on damage
        const minSize = 0.03;
        const maxSize = 0.08 + (this.amount / 2000); // Larger particles for higher damage
        const size = minSize + Math.random() * (maxSize - minSize);
        
        // Create geometry and material
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        
        // Randomize particle color slightly
        const colorVariation = 0.1; // Amount of random variation
        const color = this.baseColor.clone();
        color.r = Math.max(0, Math.min(1, color.r + (Math.random() * colorVariation - colorVariation/2)));
        color.g = Math.max(0, Math.min(1, color.g + (Math.random() * colorVariation - colorVariation/2)));
        color.b = Math.max(0, Math.min(1, color.b + (Math.random() * colorVariation - colorVariation/2)));
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        // Create mesh
        const particle = new THREE.Mesh(geometry, material);
        
        // Randomize initial position
        const spread = 0.3 + (this.amount / 500); // Higher damage = wider spread
        particle.position.set(
            (Math.random() * spread * 2) - spread,
            (Math.random() * spread * 2) - spread,
            (Math.random() * spread * 2) - spread
        );
        
        // Store initial values and movement data for animation
        particle.userData = {
            initialPos: particle.position.clone(),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(0.5 + Math.random() * 1.5),
            gravity: 0.2 + Math.random() * 0.3,
            lifetime: 0,
            maxLifetime: 0.5 + Math.random() * 1.0
        };
        
        return particle;
    }
    
    /**
     * Create a flash effect for high damage
     * @returns {THREE.Mesh} - The created flash effect
     * @private
     */
    createFlashEffect() {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        
        const flash = new THREE.Mesh(geometry, material);
        
        // Store animation data
        flash.userData = {
            initialScale: 1,
            lifetime: 0,
            maxLifetime: 0.5
        };
        
        return flash;
    }
    
    /**
     * Update the bleeding effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            return;
        }
        
        // Update particles
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const data = particle.userData;
            
            // Update lifetime
            data.lifetime += delta;
            
            // Apply velocity and gravity
            particle.position.x += data.velocity.x * delta;
            particle.position.y += data.velocity.y * delta - (data.gravity * data.lifetime * delta * 10);
            particle.position.z += data.velocity.z * delta;
            
            // Fade out based on lifetime
            const lifeRatio = data.lifetime / data.maxLifetime;
            if (particle.material) {
                particle.material.opacity = Math.max(0, 0.8 * (1 - lifeRatio));
            }
        }
        
        // Update flash effect if it exists (first child of the effect group)
        const flash = this.effect.children.find(child => child.userData && child.userData.hasOwnProperty('initialScale'));
        if (flash) {
            const data = flash.userData;
            data.lifetime += delta;
            
            // Scale up and fade out
            const lifeRatio = data.lifetime / data.maxLifetime;
            const scale = data.initialScale + (lifeRatio * 3);
            flash.scale.set(scale, scale, scale);
            
            if (flash.material) {
                flash.material.opacity = Math.max(0, 0.3 * (1 - lifeRatio));
            }
        }
    }
    
    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        if (!this.effect) return;
        
        // Clear particle references
        this.particles = [];
        
        // Call the parent dispose method to clean up resources
        super.dispose();
    }
    
    /**
     * Reset the effect to its initial state
     */
    reset() {
        // Clear particle references
        this.particles = [];
        
        // Call the parent reset method
        super.reset();
    }
}