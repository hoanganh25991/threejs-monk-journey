import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Effect for the Breath of Heaven skill
 * Creates a healing aura around the player that heals allies and damages enemies
 */
export class BreathOfHeavenEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.healingPulses = [];
        this.healingRate = 0.5; // Heal every 0.5 seconds
        this.lastHealTime = 0;
    }

    /**
     * Create the Breath of Heaven effect
     * @param {THREE.Vector3} position - Position to create the effect at
     * @param {THREE.Vector3} direction - Direction the effect should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group to hold all effect elements
        const effectGroup = new THREE.Group();
        
        // Create the main aura
        const auraGeometry = new THREE.SphereGeometry(this.skill.radius, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
        effectGroup.add(auraMesh);
        
        // Create particles for the healing effect
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions within a sphere
            const radius = Math.random() * this.skill.radius;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particlePositions[i * 3 + 2] = radius * Math.cos(phi);
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        effectGroup.add(particles);
        
        // Store particles for animation
        this.particles = particles;
        
        // Position effect at the player
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        // Play sound if game reference exists
        if (this.skill.game && this.skill.game.audioManager) {
            this.skill.game.audioManager.playSound(this.skill.sounds.cast);
        }
        
        return effectGroup;
    }

    /**
     * Update the Breath of Heaven effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        super.update(delta);
        
        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const count = positions.length / 3;
            
            for (let i = 0; i < count; i++) {
                // Move particles outward slowly
                const x = positions[i * 3];
                const y = positions[i * 3 + 1];
                const z = positions[i * 3 + 2];
                
                const length = Math.sqrt(x * x + y * y + z * z);
                const speed = 0.2 * delta;
                
                // If particle is near the edge, reset it to the center
                if (length > this.skill.radius * 0.9) {
                    positions[i * 3] = (Math.random() - 0.5) * 0.5;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
                } else {
                    // Move outward
                    positions[i * 3] += (x / length) * speed;
                    positions[i * 3 + 1] += (y / length) * speed;
                    positions[i * 3 + 2] += (z / length) * speed;
                }
            }
            
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Pulse the aura
        const pulseFactor = 1 + 0.1 * Math.sin(this.elapsedTime * 5);
        this.effect.children[0].scale.set(pulseFactor, pulseFactor, pulseFactor);
        
        // Apply healing effect at intervals
        this.lastHealTime += delta;
        if (this.lastHealTime >= this.healingRate) {
            this.applyHealingEffect();
            this.lastHealTime = 0;
        }
        
        // Fade out near the end of duration
        if (this.elapsedTime > this.skill.duration * 0.8) {
            const fadeRatio = 1 - (this.elapsedTime - this.skill.duration * 0.8) / (this.skill.duration * 0.2);
            this.effect.children.forEach(child => {
                if (child.material) {
                    child.material.opacity = Math.max(0, child.material.opacity * fadeRatio);
                }
            });
        }
    }

    /**
     * Apply healing effect to player and allies, damage to enemies
     */
    applyHealingEffect() {
        if (!this.skill.game) return;
        
        // Heal the player
        const player = this.skill.game.player;
        if (player && player.stats) {
            const healAmount = this.skill.healing || 10; // Default to 10 if not specified
            player.stats.heal(healAmount);
            
            // Show healing number
            if (this.skill.game.uiManager) {
                this.skill.game.uiManager.showDamageNumber(
                    player.position.x,
                    player.position.y + 2,
                    player.position.z,
                    healAmount,
                    0x00ff00 // Green for healing
                );
            }
        }
        
        // TODO: Heal allies when ally system is implemented
        
        // Damage enemies within range
        if (this.skill.game.enemyManager) {
            const enemies = this.skill.game.enemyManager.getEnemiesInRange(
                this.effect.position,
                this.skill.radius
            );
            
            enemies.forEach(enemy => {
                const damageAmount = this.skill.damage;
                enemy.takeDamage(damageAmount);
                
                // Show damage number
                if (this.skill.game.uiManager) {
                    this.skill.game.uiManager.showDamageNumber(
                        enemy.position.x,
                        enemy.position.y + 1,
                        enemy.position.z,
                        damageAmount,
                        0xffff00 // Yellow for holy damage
                    );
                }
            });
        }
        
        // Create a healing pulse effect
        this.createHealingPulse();
    }
    
    /**
     * Create a visual pulse effect for healing
     */
    createHealingPulse() {
        const pulseGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const pulseMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulseMesh.rotation.x = Math.PI / 2; // Lay flat
        pulseMesh.position.y = 0.1; // Slightly above ground
        
        this.effect.add(pulseMesh);
        
        // Store pulse for animation
        this.healingPulses.push({
            mesh: pulseMesh,
            age: 0
        });
    }
    
    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        // Clean up healing pulses
        this.healingPulses = [];
        
        // Call parent dispose
        super.dispose();
    }
}