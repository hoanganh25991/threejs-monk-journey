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
        this.sanctuaryState = null;
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
        
        // Special handling for Inner Sanctuary
        if (this.skill.name === 'Inner Sanctuary') {
            this._createInnerSanctuaryEffect(effectGroup, position);
        } else {
            // Create the default buff effect
            this._createDefaultBuffEffect(effectGroup, position);
        }
        
        // Position effect at player position
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the Inner Sanctuary effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Player position
     * @private
     */
    _createInnerSanctuaryEffect(effectGroup, position) {
        // Create the main sanctuary area
        const sanctuaryGroup = new THREE.Group();
        
        // Create the base sanctuary circle
        const baseRadius = this.skill.radius || 5;
        const baseGeometry = new THREE.CircleGeometry(baseRadius, 64);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.3,
            emissive: this.skill.color,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2; // Lay flat on ground
        base.position.y = 0.05; // Slightly above ground to avoid z-fighting
        sanctuaryGroup.add(base);
        
        // Create protective dome
        const domeGeometry = new THREE.SphereGeometry(baseRadius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.2,
            emissive: this.skill.color,
            emissiveIntensity: 0.3,
            side: THREE.DoubleSide,
            wireframe: false
        });
        
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = 0; // At ground level
        sanctuaryGroup.add(dome);
        
        // Create edge ring
        const edgeGeometry = new THREE.RingGeometry(baseRadius - 0.1, baseRadius + 0.1, 64);
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            emissive: this.skill.color,
            emissiveIntensity: 1.0,
            side: THREE.DoubleSide
        });
        
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.rotation.x = -Math.PI / 2; // Lay flat on ground
        edge.position.y = 0.06; // Slightly above base
        sanctuaryGroup.add(edge);
        
        // Create runes around the sanctuary
        const runeCount = 8;
        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            const runeRadius = baseRadius * 0.8;
            
            // Create rune container for easier positioning
            const runeContainer = new THREE.Group();
            
            // Create rune (using a simple plane with emissive material)
            const runeGeometry = new THREE.PlaneGeometry(0.7, 0.7);
            const runeMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.9,
                emissive: this.skill.color,
                emissiveIntensity: 1.0,
                side: THREE.DoubleSide
            });
            
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            
            // Position rune
            runeContainer.position.set(
                Math.cos(angle) * runeRadius,
                0.5, // Hover above ground
                Math.sin(angle) * runeRadius
            );
            
            // Rotate rune to face up
            rune.rotation.x = -Math.PI / 2;
            
            // Store animation data
            rune.userData = {
                initialY: runeContainer.position.y,
                rotationSpeed: 0.5 + (Math.random() * 0.5),
                hoverSpeed: 0.2 + (Math.random() * 0.3),
                pulseSpeed: 0.5 + (Math.random() * 1.0)
            };
            
            runeContainer.add(rune);
            sanctuaryGroup.add(runeContainer);
        }
        
        // Create energy pillars at cardinal points
        const pillarCount = 4;
        for (let i = 0; i < pillarCount; i++) {
            const angle = (i / pillarCount) * Math.PI * 2;
            const pillarRadius = baseRadius * 0.6;
            
            // Create pillar
            const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 16);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,
                emissive: this.skill.color,
                emissiveIntensity: 1.0
            });
            
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            
            // Position pillar
            pillar.position.set(
                Math.cos(angle) * pillarRadius,
                1, // Half height above ground
                Math.sin(angle) * pillarRadius
            );
            
            // Store animation data
            pillar.userData = {
                pulseSpeed: 0.3 + (Math.random() * 0.3)
            };
            
            sanctuaryGroup.add(pillar);
        }
        
        // Create central mandala
        const mandalaGroup = new THREE.Group();
        mandalaGroup.position.y = 0.1; // Slightly above ground
        
        // Create concentric circles for mandala
        const circleCount = 3;
        for (let i = 0; i < circleCount; i++) {
            const radius = 0.5 + (i * 0.4);
            const circleGeometry = new THREE.RingGeometry(radius - 0.05, radius, 32);
            const circleMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.8 - (i * 0.2),
                emissive: this.skill.color,
                emissiveIntensity: 1.0 - (i * 0.2),
                side: THREE.DoubleSide
            });
            
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            circle.rotation.x = -Math.PI / 2; // Lay flat
            
            // Store rotation data
            circle.userData = {
                rotationSpeed: 0.2 - (i * 0.05) // Outer circles rotate slower
            };
            
            mandalaGroup.add(circle);
        }
        
        // Create central energy core
        const coreGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            emissive: this.skill.color,
            emissiveIntensity: 1.5
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0.3; // Hover above mandala
        mandalaGroup.add(core);
        
        // Create lotus petals
        const petalCount = 8;
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;
            
            // Create a custom shape for the petal
            const shape = new THREE.Shape();
            shape.moveTo(0, 0);
            shape.quadraticCurveTo(0.2, 0.3, 0.4, 0);
            shape.quadraticCurveTo(0.2, -0.1, 0, 0);
            
            const petalGeometry = new THREE.ShapeGeometry(shape);
            const petalMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.7,
                emissive: this.skill.color,
                emissiveIntensity: 0.8,
                side: THREE.DoubleSide
            });
            
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            // Position and rotate petal
            petal.position.set(0, 0.1, 0);
            petal.rotation.x = -Math.PI / 2; // Lay flat
            petal.rotation.z = angle;
            
            // Move petal outward
            petal.translateOnAxis(new THREE.Vector3(1, 0, 0), 0.5);
            
            // Store animation data
            petal.userData = {
                pulseSpeed: 0.5 + (Math.random() * 0.5)
            };
            
            mandalaGroup.add(petal);
        }
        
        // Add mandala to sanctuary
        sanctuaryGroup.add(mandalaGroup);
        
        // Create particles floating within the sanctuary
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random position within the sanctuary
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * baseRadius * 0.9;
            const height = 0.1 + Math.random() * (baseRadius / 2);
            
            // Create particle
            const particleSize = 0.05 + (Math.random() * 0.1);
            const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6 + (Math.random() * 0.4),
                emissive: this.skill.color,
                emissiveIntensity: 0.5
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            particle.userData = {
                orbitRadius: radius,
                orbitAngle: angle,
                orbitSpeed: 0.1 + (Math.random() * 0.3),
                initialHeight: height,
                verticalSpeed: 0.2 + (Math.random() * 0.4),
                amplitude: 0.1 + (Math.random() * 0.3)
            };
            
            sanctuaryGroup.add(particle);
            particles.push(particle);
        }
        
        // Add sanctuary to effect group
        effectGroup.add(sanctuaryGroup);
        
        // Store animation state
        this.sanctuaryState = {
            age: 0,
            particles: particles,
            mandala: mandalaGroup
        };
    }

    /**
     * Create the default buff effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Player position
     * @private
     */
    _createDefaultBuffEffect(effectGroup, position) {
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
        
        // Special handling for Inner Sanctuary
        if (this.skill.name === 'Inner Sanctuary' && this.sanctuaryState) {
            this._updateInnerSanctuaryEffect(delta);
        } else {
            this._updateDefaultBuffEffect(delta);
        }
    }
    
    /**
     * Update the Inner Sanctuary effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateInnerSanctuaryEffect(delta) {
        // Update sanctuary state
        this.sanctuaryState.age += delta;
        
        // Get the sanctuary group (first child of effect group)
        const sanctuaryGroup = this.effect.children[0];
        
        // Find the dome, edge ring, and base
        const dome = sanctuaryGroup.children.find(
            child => child.geometry && 
            child.geometry.type === 'SphereGeometry' && 
            child.geometry.parameters.phiLength === Math.PI * 2
        );
        
        const edge = sanctuaryGroup.children.find(
            child => child.geometry && 
            child.geometry.type === 'RingGeometry'
        );
        
        const base = sanctuaryGroup.children.find(
            child => child.geometry && 
            child.geometry.type === 'CircleGeometry'
        );
        
        // Animate the dome
        if (dome) {
            // Pulse the dome
            const domeScale = 1 + Math.sin(this.sanctuaryState.age * 0.5) * 0.05;
            dome.scale.set(domeScale, domeScale, domeScale);
            
            // Adjust dome opacity based on damage/attacks
            // This would be connected to game logic in a real implementation
            const baseDomeOpacity = 0.2;
            const pulseOpacity = Math.sin(this.sanctuaryState.age * 3) * 0.05;
            
            // Simulate dome reacting to attacks with random flashes
            if (Math.random() < 0.01) {
                // Random flash
                dome.material.opacity = 0.4;
            } else {
                // Normal opacity
                dome.material.opacity = baseDomeOpacity + pulseOpacity;
            }
        }
        
        // Animate the edge ring
        if (edge) {
            // Rotate the edge ring
            edge.rotation.z += delta * 0.5;
            
            // Pulse the edge
            const edgeScale = 1 + Math.sin(this.sanctuaryState.age * 2) * 0.1;
            edge.scale.set(edgeScale, edgeScale, 1);
            
            // Adjust emissive intensity
            if (edge.material) {
                edge.material.emissiveIntensity = 1 + Math.sin(this.sanctuaryState.age * 3) * 0.5;
            }
        }
        
        // Animate the base
        if (base) {
            // Subtle pulse for the base
            const baseScale = 1 + Math.sin(this.sanctuaryState.age * 0.7) * 0.03;
            base.scale.set(baseScale, 1, baseScale);
        }
        
        // Animate runes
        for (let i = 0; i < sanctuaryGroup.children.length; i++) {
            const child = sanctuaryGroup.children[i];
            
            // Check if this is a rune container (has children and first child is a plane)
            if (child.children && child.children.length > 0 && 
                child.children[0].geometry && 
                child.children[0].geometry.type === 'PlaneGeometry') {
                
                const rune = child.children[0];
                
                // Hover animation
                if (rune.userData && rune.userData.initialY !== undefined) {
                    const hoverOffset = Math.sin(this.sanctuaryState.age * rune.userData.hoverSpeed) * 0.05;
                    child.position.y = rune.userData.initialY + hoverOffset;
                }
                
                // Rotation animation
                if (rune.userData && rune.userData.rotationSpeed) {
                    rune.rotation.z += rune.userData.rotationSpeed * delta;
                }
                
                // Pulse animation
                if (rune.userData && rune.userData.pulseSpeed) {
                    const pulseScale = 0.9 + Math.sin(this.sanctuaryState.age * rune.userData.pulseSpeed) * 0.1;
                    rune.scale.set(pulseScale, pulseScale, pulseScale);
                }
                
                // Adjust emissive intensity
                if (rune.material) {
                    rune.material.emissiveIntensity = 1 + Math.sin(this.sanctuaryState.age * 5) * 0.5;
                }
            }
        }
        
        // Animate energy pillars
        const pillars = sanctuaryGroup.children.filter(
            child => child.geometry && 
            child.geometry.type === 'CylinderGeometry' &&
            child.geometry.parameters.height === 2
        );
        
        for (const pillar of pillars) {
            if (pillar.userData) {
                // Pulse height
                const heightScale = 1 + Math.sin(this.sanctuaryState.age * pillar.userData.pulseSpeed) * 0.2;
                pillar.scale.y = heightScale;
                
                // Adjust position to keep bottom at same level
                pillar.position.y = 1 + ((heightScale - 1) * pillar.geometry.parameters.height / 2);
                
                // Pulse opacity
                if (pillar.material) {
                    pillar.material.opacity = 0.3 + Math.abs(Math.sin(this.sanctuaryState.age * 2)) * 0.3;
                }
            }
        }
        
        // Animate mandala
        if (this.sanctuaryState.mandala) {
            const mandala = this.sanctuaryState.mandala;
            
            // Rotate concentric circles
            for (let i = 0; i < mandala.children.length; i++) {
                const child = mandala.children[i];
                
                if (child.userData && child.userData.rotationSpeed) {
                    // Rotate in alternating directions
                    if (i % 2 === 0) {
                        child.rotation.z += child.userData.rotationSpeed * delta;
                    } else {
                        child.rotation.z -= child.userData.rotationSpeed * delta;
                    }
                }
            }
            
            // Animate central core
            const core = mandala.children.find(child => 
                child.geometry && child.geometry.type === 'SphereGeometry'
            );
            
            if (core) {
                const coreScale = 0.8 + Math.sin(this.sanctuaryState.age * 5) * 0.2;
                core.scale.set(coreScale, coreScale, coreScale);
                
                if (core.material) {
                    core.material.emissiveIntensity = 1.5 + Math.sin(this.sanctuaryState.age * 7) * 0.5;
                }
            }
            
            // Animate lotus petals
            const petals = mandala.children.filter(child => 
                child.geometry && 
                child.geometry.type === 'ShapeGeometry'
            );
            
            for (const petal of petals) {
                if (petal.userData && petal.userData.pulseSpeed) {
                    const petalScale = 0.9 + Math.sin(this.sanctuaryState.age * petal.userData.pulseSpeed) * 0.1;
                    petal.scale.set(petalScale, petalScale, petalScale);
                }
            }
            
            // Rotate entire mandala slowly
            mandala.rotation.z += delta * 0.1;
        }
        
        // Animate particles
        for (const particle of this.sanctuaryState.particles) {
            if (particle.userData) {
                // Update orbit position
                particle.userData.orbitAngle += particle.userData.orbitSpeed * delta;
                
                // Calculate new position
                const newX = Math.cos(particle.userData.orbitAngle) * particle.userData.orbitRadius;
                const newZ = Math.sin(particle.userData.orbitAngle) * particle.userData.orbitRadius;
                
                // Update vertical position with sine wave
                const newY = particle.userData.initialHeight + 
                            Math.sin(this.sanctuaryState.age * particle.userData.verticalSpeed) * 
                            particle.userData.amplitude;
                
                // Update particle position
                particle.position.set(newX, newY, newZ);
                
                // Pulse particle size
                const particleScale = 0.8 + Math.sin(this.sanctuaryState.age * 3 + 
                                                    particle.userData.orbitAngle) * 0.2;
                particle.scale.set(particleScale, particleScale, particleScale);
            }
        }
    }
    
    /**
     * Update the default buff effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateDefaultBuffEffect(delta) {
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
    
    /**
     * Clean up resources when the effect is removed
     */
    dispose() {
        super.dispose();
        
        // Clean up sanctuary state
        this.sanctuaryState = null;
        
        // Clear orbit particles array
        this.orbitParticles = [];
    }
}