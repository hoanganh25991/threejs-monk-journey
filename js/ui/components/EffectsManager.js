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
    }
    
    /**
     * Initialize the effects manager
     */
    init() {
        // Create effects container if it doesn't exist
        if (!document.getElementById('effects-container')) {
            this.container = document.createElement('div');
            this.container.id = 'effects-container';
            this.container.style.position = 'absolute';
            this.container.style.top = '0';
            this.container.style.left = '0';
            this.container.style.width = '100%';
            this.container.style.height = '100%';
            this.container.style.pointerEvents = 'none';
            this.container.style.zIndex = '90';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('effects-container');
        }
        
        return true;
    }
    
    /**
     * Update all active effects
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update and remove expired effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Update effect lifetime
            effect.lifetime -= delta;
            
            // Remove expired effects
            if (effect.lifetime <= 0) {
                effect.element.remove();
                this.effects.splice(i, 1);
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
        
        // Convert 3D position to screen position
        const vector = position.clone();
        vector.project(this.game.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        
        // Create blood particle container
        const particleContainer = document.createElement('div');
        particleContainer.style.position = 'absolute';
        particleContainer.style.top = `${y}px`;
        particleContainer.style.left = `${x}px`;
        particleContainer.style.width = '0';
        particleContainer.style.height = '0';
        particleContainer.style.zIndex = '100';
        
        // Determine particle count and color based on damage amount
        const minParticles = 3;
        const maxParticles = 15;
        const particleCount = Math.min(maxParticles, minParticles + Math.floor(amount / 10));
        
        // Determine color based on damage amount
        // Higher damage = brighter/more intense red
        let baseColor;
        if (amount < 10) {
            baseColor = [120, 0, 0]; // Dark red for low damage
        } else if (amount < 30) {
            baseColor = [180, 0, 0]; // Medium red
        } else if (amount < 50) {
            baseColor = [220, 0, 0]; // Bright red
        } else {
            baseColor = [255, 30, 30]; // Intense red with slight glow for high damage
        }
        
        // Create blood particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            // Randomize particle size based on damage
            const minSize = 3;
            const maxSize = 8 + (amount / 20); // Larger particles for higher damage
            const size = minSize + Math.random() * (maxSize - minSize);
            
            // Randomize particle color slightly
            const colorVariation = 30; // Amount of random variation
            const r = Math.max(0, Math.min(255, baseColor[0] + (Math.random() * colorVariation - colorVariation/2)));
            const g = Math.max(0, Math.min(255, baseColor[1] + (Math.random() * colorVariation - colorVariation/2)));
            const b = Math.max(0, Math.min(255, baseColor[2] + (Math.random() * colorVariation - colorVariation/2)));
            
            // Set particle styles
            particle.style.position = 'absolute';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            particle.style.boxShadow = `0 0 ${size/2}px rgba(${r}, ${g}, ${b}, 0.7)`;
            
            // Randomize particle position
            const spread = 30 + (amount / 5); // Higher damage = wider spread
            const posX = (Math.random() * spread * 2) - spread;
            const posY = (Math.random() * spread * 2) - spread;
            particle.style.transform = `translate(${posX}px, ${posY}px)`;
            
            // Add animation for particle
            const duration = 0.5 + (Math.random() * 1);
            particle.style.transition = `all ${duration}s ease-out`;
            
            // Add particle to container
            particleContainer.appendChild(particle);
            
            // Animate particle after a small delay
            setTimeout(() => {
                // Move particle outward
                const distance = 20 + (Math.random() * 40);
                const angle = Math.random() * Math.PI * 2;
                const endX = posX + Math.cos(angle) * distance;
                const endY = posY + Math.sin(angle) * distance;
                
                // Apply gravity effect
                const gravity = 20 + (Math.random() * 30);
                
                // Update particle position and fade out
                particle.style.transform = `translate(${endX}px, ${endY + gravity}px)`;
                particle.style.opacity = '0';
            }, 10);
        }
        
        // Add particle container to effects container
        this.container.appendChild(particleContainer);
        
        // Add to effects array for cleanup
        this.effects.push({
            element: particleContainer,
            lifetime: 2.0 // Lifetime in seconds
        });
        
        // For very high damage, add a brief screen flash effect
        if (amount > 40) {
            this.createScreenFlash('rgba(255, 0, 0, 0.15)', 0.5);
        }
    }
    
    /**
     * Create a screen flash effect
     * @param {string} color - CSS color string
     * @param {number} duration - Duration in seconds
     */
    createScreenFlash(color, duration) {
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
}