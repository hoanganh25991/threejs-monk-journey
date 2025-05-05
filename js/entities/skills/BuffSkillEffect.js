import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for buff skills
 */
export class BuffSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.rotationSpeed = 1.5; // Rotation speed in radians per second
        this.orbitRadius = 1.2; // Distance from player
        this.orbitHeight = 1.0; // Height above ground
        this.orbitParticles = [];
    }

    /**
     * Create a buff effect that orbits around the player
     * @param {THREE.Vector3} position - Player position
     * @param {THREE.Vector3} direction - Player direction
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store initial position for orbit calculations
        this.playerPosition = position.clone();
        
        // Create the main buff aura
        const auraGeometry = new THREE.SphereGeometry(this.orbitRadius, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            wireframe: true
        });
        
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        effectGroup.add(aura);
        
        // Create orbiting particles
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            
            // Create particle
            const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position particle in orbit
            particle.position.set(
                Math.cos(angle) * this.orbitRadius,
                this.orbitHeight + Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * this.orbitRadius
            );
            
            // Store initial angle for animation
            particle.userData = {
                initialAngle: angle,
                orbitSpeed: 0.8 + (Math.random() * 0.4), // Slightly different speeds
                pulseSpeed: 0.5 + (Math.random() * 1.0),
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            effectGroup.add(particle);
            this.orbitParticles.push(particle);
        }
        
        // Create central glow
        const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = this.orbitHeight;
        effectGroup.add(glow);
        
        // Add runes/symbols floating around the player
        const runeCount = 3;
        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            
            // Create rune (using a simple plane with emissive material)
            const runeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
            const runeMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.9,
                emissive: this.skill.color,
                emissiveIntensity: 1.0,
                side: THREE.DoubleSide
            });
            
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            
            // Position rune in orbit
            rune.position.set(
                Math.cos(angle) * (this.orbitRadius * 0.7),
                this.orbitHeight + 0.5 + (i * 0.2),
                Math.sin(angle) * (this.orbitRadius * 0.7)
            );
            
            // Rotate rune to face center
            rune.lookAt(new THREE.Vector3(0, rune.position.y, 0));
            
            // Store animation data
            rune.userData = {
                initialAngle: angle,
                orbitSpeed: 0.3 + (Math.random() * 0.2), // Slower than particles
                hoverSpeed: 0.2 + (Math.random() * 0.3),
                hoverPhase: Math.random() * Math.PI * 2,
                initialHeight: rune.position.y
            };
            
            effectGroup.add(rune);
            this.orbitParticles.push(rune); // Add to animation array
        }
        
        // Position effect at player position
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Update the buff effect
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
        
        // Update orbiting particles
        for (const particle of this.orbitParticles) {
            if (particle.userData) {
                const initialAngle = particle.userData.initialAngle;
                const orbitSpeed = particle.userData.orbitSpeed || 1.0;
                
                // Calculate new angle
                const newAngle = initialAngle + (this.elapsedTime * this.rotationSpeed * orbitSpeed);
                
                // Update particle position
                if (particle.geometry.type === 'SphereGeometry') {
                    // For sphere particles
                    const pulseSpeed = particle.userData.pulseSpeed || 1.0;
                    const pulsePhase = particle.userData.pulsePhase || 0;
                    
                    particle.position.set(
                        Math.cos(newAngle) * this.orbitRadius,
                        this.orbitHeight + Math.sin(this.elapsedTime * pulseSpeed + pulsePhase) * 0.3,
                        Math.sin(newAngle) * this.orbitRadius
                    );
                    
                    // Pulse size
                    const scale = 0.8 + Math.sin(this.elapsedTime * pulseSpeed * 2 + pulsePhase) * 0.2;
                    particle.scale.set(scale, scale, scale);
                } else {
                    // For runes
                    const hoverSpeed = particle.userData.hoverSpeed || 0.2;
                    const hoverPhase = particle.userData.hoverPhase || 0;
                    const initialHeight = particle.userData.initialHeight || this.orbitHeight;
                    
                    particle.position.set(
                        Math.cos(newAngle) * (this.orbitRadius * 0.7),
                        initialHeight + Math.sin(this.elapsedTime * hoverSpeed + hoverPhase) * 0.2,
                        Math.sin(newAngle) * (this.orbitRadius * 0.7)
                    );
                    
                    // Make runes always face center
                    particle.lookAt(new THREE.Vector3(
                        this.effect.position.x,
                        particle.position.y,
                        this.effect.position.z
                    ));
                    
                    // Rotate rune for effect
                    particle.rotation.z = this.elapsedTime * 0.5;
                }
            }
        }
        
        // Pulse the aura
        const aura = this.effect.children[0];
        if (aura && aura.geometry.type === 'SphereGeometry') {
            const pulseScale = 1.0 + Math.sin(this.elapsedTime * 2) * 0.1;
            aura.scale.set(pulseScale, pulseScale, pulseScale);
        }
        
        // Pulse the central glow
        const glow = this.effect.children[this.orbitParticles.length + 1];
        if (glow) {
            const glowPulse = 0.8 + Math.sin(this.elapsedTime * 3) * 0.2;
            glow.scale.set(glowPulse, glowPulse, glowPulse);
            
            // Change opacity for breathing effect
            if (glow.material) {
                glow.material.opacity = 0.5 + Math.sin(this.elapsedTime * 2) * 0.3;
            }
        }
    }
}