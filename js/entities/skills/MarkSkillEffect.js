import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for mark/debuff skills
 */
export class MarkSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.markSize = 1.0;
        this.markHeight = 2.0;
        this.targetEntity = null;
    }

    /**
     * Create a mark effect
     * @param {THREE.Vector3} position - Position to place the mark
     * @param {THREE.Vector3} direction - Direction (not used for marks)
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create the mark effect
        this._createMarkEffect(effectGroup);
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Set the target entity for the mark
     * @param {Object} entity - The entity to mark
     */
    setTarget(entity) {
        this.targetEntity = entity;
    }

    /**
     * Create the mark effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    _createMarkEffect(effectGroup) {
        // Create mark group
        const markGroup = new THREE.Group();
        
        // Create the main mark symbol (a pentagram or rune)
        const markGeometry = new THREE.CircleGeometry(this.markSize, 5); // Pentagram shape
        const markMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        mark.rotation.x = -Math.PI / 2; // Lay flat
        mark.position.y = 0.1; // Slightly above ground
        markGroup.add(mark);
        
        // Create outer ring
        const ringGeometry = new THREE.RingGeometry(this.markSize, this.markSize + 0.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2; // Lay flat
        ring.position.y = 0.11; // Slightly above the mark
        markGroup.add(ring);
        
        // Create inner ring
        const innerRingGeometry = new THREE.RingGeometry(this.markSize * 0.6, this.markSize * 0.7, 32);
        const innerRingMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
        innerRing.rotation.x = -Math.PI / 2; // Lay flat
        innerRing.position.y = 0.12; // Slightly above the outer ring
        markGroup.add(innerRing);
        
        // Add runes/symbols around the mark
        const runeCount = 5;
        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            const radius = this.markSize * 1.3;
            
            // Create rune (using a simple plane with emissive material)
            const runeGeometry = new THREE.PlaneGeometry(0.3, 0.3);
            const runeMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.9,
                emissive: this.skill.color,
                emissiveIntensity: 1.0,
                side: THREE.DoubleSide
            });
            
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            
            // Position rune around mark
            rune.position.set(
                Math.cos(angle) * radius,
                0.15,
                Math.sin(angle) * radius
            );
            
            // Rotate rune to face up
            rune.rotation.x = -Math.PI / 2;
            
            // Store animation data
            rune.userData = {
                initialAngle: angle,
                radius: radius,
                rotationSpeed: 0.2 + (Math.random() * 0.3),
                pulseSpeed: 0.5 + (Math.random() * 1.0),
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            markGroup.add(rune);
        }
        
        // Add vertical energy beams
        const beamCount = 3;
        for (let i = 0; i < beamCount; i++) {
            const angle = (i / beamCount) * Math.PI * 2;
            const radius = this.markSize * 0.5;
            
            // Create beam
            const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, this.markHeight, 8);
            const beamMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.skill.color,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 0.6
            });
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            
            // Position beam
            beam.position.set(
                Math.cos(angle) * radius,
                this.markHeight / 2,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            beam.userData = {
                initialAngle: angle,
                radius: radius,
                rotationSpeed: 0.3 + (Math.random() * 0.2),
                pulseSpeed: 0.5 + (Math.random() * 1.0),
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            markGroup.add(beam);
        }
        
        // Add particles around the mark
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            // Random position around the mark
            const angle = Math.random() * Math.PI * 2;
            const radius = this.markSize * (0.8 + Math.random() * 0.7);
            const height = 0.1 + (Math.random() * this.markHeight * 0.7);
            
            // Create particle
            const particleSize = 0.05 + (Math.random() * 0.1);
            const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.6 + (Math.random() * 0.4)
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Store initial position for animation
            particle.userData = {
                initialPos: particle.position.clone(),
                initialAngle: angle,
                radius: radius,
                height: height,
                speed: 0.5 + (Math.random() * 1.5),
                direction: new THREE.Vector3(
                    (Math.random() * 2) - 1,
                    (Math.random() * 2) - 1,
                    (Math.random() * 2) - 1
                ).normalize()
            };
            
            markGroup.add(particle);
        }
        
        // Add the mark group to the effect group
        effectGroup.add(markGroup);
        
        // Store animation state
        this.markState = {
            age: 0,
            particles: [],
            runes: [],
            beams: [],
            mark: mark,
            outerRing: ring,
            innerRing: innerRing
        };
        
        // Store references for animation
        for (let i = 0; i < markGroup.children.length; i++) {
            const child = markGroup.children[i];
            if (!child.userData) continue;
            
            if (child.userData.initialPos) {
                this.markState.particles.push(child);
            } else if (child.userData.initialAngle && child.geometry.type === 'PlaneGeometry') {
                this.markState.runes.push(child);
            } else if (child.userData.initialAngle && child.geometry.type === 'CylinderGeometry') {
                this.markState.beams.push(child);
            }
        }
    }

    /**
     * Update the mark effect
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
        
        // Update mark animation
        this._updateMarkAnimation(delta);
        
        // If we have a target entity, follow it
        if (this.targetEntity && this.targetEntity.position) {
            this.effect.position.copy(this.targetEntity.position);
            // Adjust height if needed
            this.effect.position.y = 0.1; // Keep mark on the ground
        }
    }

    /**
     * Update the mark animation
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateMarkAnimation(delta) {
        // Update mark state
        this.markState.age += delta;
        
        // Animate the main mark
        if (this.markState.mark) {
            // Pulse opacity
            this.markState.mark.material.opacity = 0.5 + Math.sin(this.markState.age * 2) * 0.2;
            
            // Rotate the mark
            this.markState.mark.rotation.z += delta * 0.5;
        }
        
        // Animate the outer ring
        if (this.markState.outerRing) {
            // Rotate the ring
            this.markState.outerRing.rotation.z -= delta * 0.3;
            
            // Pulse opacity
            this.markState.outerRing.material.opacity = 0.6 + Math.sin(this.markState.age * 3) * 0.2;
        }
        
        // Animate the inner ring
        if (this.markState.innerRing) {
            // Rotate the ring in opposite direction
            this.markState.innerRing.rotation.z += delta * 0.4;
            
            // Pulse opacity
            this.markState.innerRing.material.opacity = 0.6 + Math.sin(this.markState.age * 2.5) * 0.2;
        }
        
        // Animate runes
        for (const rune of this.markState.runes) {
            if (rune.userData) {
                const initialAngle = rune.userData.initialAngle;
                const radius = rune.userData.radius;
                const rotationSpeed = rune.userData.rotationSpeed || 0.2;
                const pulseSpeed = rune.userData.pulseSpeed || 1.0;
                const pulsePhase = rune.userData.pulsePhase || 0;
                
                // Rotate rune around mark
                const newAngle = initialAngle + (this.markState.age * rotationSpeed);
                rune.position.x = Math.cos(newAngle) * radius;
                rune.position.z = Math.sin(newAngle) * radius;
                
                // Rotate rune itself
                rune.rotation.z = this.markState.age * pulseSpeed;
                
                // Pulse size
                const scale = 0.8 + Math.sin(this.markState.age * pulseSpeed + pulsePhase) * 0.2;
                rune.scale.set(scale, scale, scale);
            }
        }
        
        // Animate beams
        for (const beam of this.markState.beams) {
            if (beam.userData) {
                const initialAngle = beam.userData.initialAngle;
                const radius = beam.userData.radius;
                const rotationSpeed = beam.userData.rotationSpeed || 0.3;
                const pulseSpeed = beam.userData.pulseSpeed || 1.0;
                const pulsePhase = beam.userData.pulsePhase || 0;
                
                // Rotate beam around mark
                const newAngle = initialAngle + (this.markState.age * rotationSpeed);
                beam.position.x = Math.cos(newAngle) * radius;
                beam.position.z = Math.sin(newAngle) * radius;
                
                // Pulse height
                const heightScale = 0.9 + Math.sin(this.markState.age * pulseSpeed + pulsePhase) * 0.1;
                beam.scale.y = heightScale;
                
                // Pulse opacity
                beam.material.opacity = 0.4 + Math.sin(this.markState.age * pulseSpeed * 2 + pulsePhase) * 0.2;
            }
        }
        
        // Animate particles
        for (const particle of this.markState.particles) {
            if (particle.userData) {
                const initialPos = particle.userData.initialPos;
                const initialAngle = particle.userData.initialAngle;
                const radius = particle.userData.radius;
                const height = particle.userData.height;
                const speed = particle.userData.speed;
                
                // Spiral movement
                const spiralSpeed = speed * 0.5;
                const newAngle = initialAngle + (this.markState.age * spiralSpeed);
                const newRadius = radius * (1.0 - Math.min(this.markState.age * 0.1, 0.5));
                
                particle.position.set(
                    Math.cos(newAngle) * newRadius,
                    height + Math.sin(this.markState.age * speed) * 0.2,
                    Math.sin(newAngle) * newRadius
                );
                
                // Fade out particles that get too close to center
                if (newRadius < radius * 0.3) {
                    particle.material.opacity -= delta;
                    if (particle.material.opacity <= 0) {
                        // Reset particle
                        const newAngle = Math.random() * Math.PI * 2;
                        const newRadius = this.markSize * (0.8 + Math.random() * 0.7);
                        particle.position.set(
                            Math.cos(newAngle) * newRadius,
                            height,
                            Math.sin(newAngle) * newRadius
                        );
                        particle.userData.initialAngle = newAngle;
                        particle.userData.radius = newRadius;
                        particle.material.opacity = 0.6 + (Math.random() * 0.4);
                    }
                }
            }
        }
    }
}