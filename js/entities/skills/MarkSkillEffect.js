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
        this.explodingPalmState = null;
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
        
        // Special handling for Exploding Palm
        if (this.skill.name === 'Exploding Palm') {
            this._createExplodingPalmEffect(effectGroup, position, direction);
        } else {
            // Create the default mark effect
            this._createMarkEffect(effectGroup);
        }
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Set the correct rotation to face the direction the player is looking
        if (direction) {
            const rotationAngle = Math.atan2(direction.x, direction.z);
            effectGroup.rotation.y = rotationAngle;
            
            // For Exploding Palm, ensure the palm group is also properly rotated
            if (this.skill.name === 'Exploding Palm' && this.explodingPalmState && this.explodingPalmState.palmGroup) {
                // Set the palm group's initial rotation to match the player's direction
                this.explodingPalmState.palmGroup.rotation.y = rotationAngle;
                
                // Ensure the hand is oriented correctly within the palm group
                if (this.explodingPalmState.handGroup) {
                    // Fine-tune hand orientation if needed
                    this.explodingPalmState.handGroup.rotation.y = 0; // Keep aligned with palm group
                }
            }
        }
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    /**
     * Create the Exploding Palm effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Position to place the mark
     * @param {THREE.Vector3} direction - Direction to face
     * @private
     */
    _createExplodingPalmEffect(effectGroup, position, direction) {
        // Create the main palm group
        const palmGroup = new THREE.Group();
        
        // Create hand group
        const handGroup = new THREE.Group();
        
        // Create palm (hand)
        const handGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.5);
        const handMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa88, // Flesh color
            metalness: 0.1,
            roughness: 0.9
        });
        
        const hand = new THREE.Mesh(handGeometry, handMaterial);
        handGroup.add(hand);
        
        // Create fingers
        const fingerCount = 4;
        for (let i = 0; i < fingerCount; i++) {
            const fingerGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
            const fingerMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa88, // Flesh color
                metalness: 0.1,
                roughness: 0.9
            });
            
            const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
            
            // Position fingers along the front of the hand
            const xOffset = -0.15 + (i * 0.1);
            finger.position.set(xOffset, 0, 0.25);
            finger.rotation.x = -Math.PI / 4; // Angle fingers forward
            
            handGroup.add(finger);
        }
        
        // Create thumb
        const thumbGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
        const thumbMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa88, // Flesh color
            metalness: 0.1,
            roughness: 0.9
        });
        
        const thumb = new THREE.Mesh(thumbGeometry, thumbMaterial);
        thumb.position.set(-0.25, 0, 0.1);
        thumb.rotation.z = -Math.PI / 4; // Angle thumb outward
        handGroup.add(thumb);
        
        // Add energy effect around the hand
        const energyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const energyMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            emissive: this.skill.color,
            emissiveIntensity: 1.0
        });
        
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.scale.y = 0.5; // Flatten the sphere
        handGroup.add(energy);
        
        // Position hand group
        handGroup.position.y = 0.5; // Hover above ground
        handGroup.rotation.x = -Math.PI / 4; // Angle hand downward for striking
        palmGroup.add(handGroup);
        
        // Create particles orbiting the hand
        const particleCount = 15;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
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
            
            // Random position around the hand
            const radius = 0.3 + (Math.random() * 0.3);
            const angle = Math.random() * Math.PI * 2;
            const height = 0.3 + (Math.random() * 0.4);
            
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            particle.userData = {
                initialPosition: particle.position.clone(),
                orbitAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize(),
                orbitSpeed: 1 + (Math.random() * 2),
                orbitRadius: radius
            };
            
            palmGroup.add(particle);
            particles.push(particle);
        }
        
        // Create trailing effect
        const trailCount = 5;
        const trails = [];
        
        for (let i = 0; i < trailCount; i++) {
            const trailGeometry = new THREE.PlaneGeometry(0.5, 0.5);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.5 - (i * 0.1),
                side: THREE.DoubleSide
            });
            
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.z = -i * 0.2; // Position behind the hand
            trail.rotation.x = Math.PI / 2; // Align with movement direction
            
            palmGroup.add(trail);
            trails.push(trail);
        }
        
        // Create explosion effect (initially hidden)
        const explosionGroup = new THREE.Group();
        explosionGroup.visible = false;
        
        // Create explosion core
        const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: this.skill.color,
            emissiveIntensity: 2.0,
            transparent: true,
            opacity: 0.9
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        explosionGroup.add(core);
        
        // Create explosion waves
        const waveCount = 3;
        for (let i = 0; i < waveCount; i++) {
            const waveGeometry = new THREE.RingGeometry(0.5 + (i * 0.5), 0.7 + (i * 0.5), 32);
            const waveMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.8 - (i * 0.2),
                side: THREE.DoubleSide
            });
            
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = -Math.PI / 2; // Lay flat
            wave.position.y = 0.1 + (i * 0.1); // Stack slightly above each other
            
            explosionGroup.add(wave);
        }
        
        // Create explosion particles
        const explosionParticleCount = 20;
        for (let i = 0; i < explosionParticleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1 + (Math.random() * 0.2), 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position within explosion radius
            const radius = Math.random() * 0.5;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 1.0;
            
            particle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Store direction for animation
            particle.userData = {
                direction: new THREE.Vector3(
                    Math.cos(angle),
                    Math.random() * 0.5,
                    Math.sin(angle)
                ).normalize(),
                speed: 1 + (Math.random() * 2)
            };
            
            explosionGroup.add(particle);
        }
        
        // Add explosion group to palm group
        palmGroup.add(explosionGroup);
        
        // Add palm group to effect group
        effectGroup.add(palmGroup);
        
        // Store animation state
        this.explodingPalmState = {
            age: 0,
            phase: 'flying', // 'flying', 'exploding', 'fading'
            particles: particles,
            trails: trails,
            handGroup: handGroup,
            palmGroup: palmGroup,
            explosionGroup: explosionGroup,
            flyingSpeed: 10, // Units per second
            maxDistance: this.skill.range || 15,
            distanceTraveled: 0,
            hitTarget: false,
            targetPosition: null,
            explosionTime: this.skill.duration * 0.8, // Explode at 80% of duration if no target hit
            exploded: false,
            damageApplied: false,
            dustParticles: [],
            impactRings: [],
            lastImpactTime: 0
        };
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
        
        // Special handling for Exploding Palm
        if (this.skill.name === 'Exploding Palm' && this.explodingPalmState) {
            this._updateExplodingPalmEffect(delta);
        } else {
            // Update regular mark animation
            this._updateMarkAnimation(delta);
            
            // If we have a target entity, follow it
            if (this.targetEntity && this.targetEntity.position) {
                this.effect.position.copy(this.targetEntity.position);
                // Adjust height if needed
                this.effect.position.y = 0.1; // Keep mark on the ground
            }
        }
    }

    /**
     * Update the Exploding Palm effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateExplodingPalmEffect(delta) {
        // Update state
        this.explodingPalmState.age += delta;
        
        // Get the palm group
        const palmGroup = this.explodingPalmState.palmGroup;
        const handGroup = this.explodingPalmState.handGroup;
        
        // Check for explosion triggers
        const shouldExplode = 
            // Explode if reached max distance
            this.explodingPalmState.distanceTraveled >= this.explodingPalmState.maxDistance ||
            // Explode if hit a target
            this.explodingPalmState.hitTarget ||
            // Explode if reached explosion time
            this.elapsedTime >= this.explodingPalmState.explosionTime;
        
        // Transition to exploding phase if needed
        if (this.explodingPalmState.phase === 'flying' && shouldExplode) {
            this.explodingPalmState.phase = 'exploding';
            this.explodingPalmState.exploded = true;
            this.explodingPalmState.explosionGroup.visible = true;
            
            // Hide the flying hand
            if (handGroup) {
                handGroup.visible = false;
            }
        }
        
        // Handle flying phase
        if (this.explodingPalmState.phase === 'flying') {
            // Always use the initial direction for the first frame
            let targetDirection;
            
            // On the first frame, use the initial direction (from player facing)
            if (this.explodingPalmState.age < delta * 2) {
                // Use the initial direction set when the skill was created
                targetDirection = new THREE.Vector3(
                    Math.sin(this.effect.rotation.y),
                    0,
                    Math.cos(this.effect.rotation.y)
                );
            } else {
                // After first frame, check for enemies to target
                let targetEnemy = null;
                
                // Default to continuing in the current direction if no enemy found
                targetDirection = new THREE.Vector3(
                    Math.sin(this.effect.rotation.y),
                    0,
                    Math.cos(this.effect.rotation.y)
                );
                
                // Check for nearby enemies to auto-target
                if (this.skill.game && this.skill.game.enemies) {
                    let nearestDistance = Infinity;
                    
                    // Get palm position in world space
                    const palmPosition = new THREE.Vector3();
                    palmGroup.getWorldPosition(palmPosition);
                    
                    // Check each enemy
                    for (const enemy of this.skill.game.enemies) {
                        if (enemy && enemy.position && !enemy.state.isDead) {
                            // Calculate distance to enemy
                            const distance = palmPosition.distanceTo(enemy.position);
                            
                            // Check if enemy is within targeting range and closer than current target
                            if (distance < 10 && distance < nearestDistance) {
                                // Calculate direction to enemy
                                const dirToEnemy = new THREE.Vector3()
                                    .subVectors(enemy.position, palmPosition)
                                    .normalize();
                                
                                // Calculate angle between current direction and direction to enemy
                                const currentDir = new THREE.Vector3(
                                    Math.sin(this.effect.rotation.y),
                                    0,
                                    Math.cos(this.effect.rotation.y)
                                );
                                
                                const angle = currentDir.angleTo(dirToEnemy);
                                
                                // Only target enemies within a 45-degree cone in front
                                if (angle < Math.PI / 4) {
                                    targetEnemy = enemy;
                                    nearestDistance = distance;
                                    targetDirection = dirToEnemy;
                                }
                            }
                        }
                    }
                    
                    // If we found a target, update direction to track it
                    if (targetEnemy) {
                        // Update palm rotation to face the enemy
                        const angle = Math.atan2(targetDirection.x, targetDirection.z);
                        palmGroup.rotation.y = angle;
                    }
                }
            }
            
            // Move the palm forward
            const moveDistance = this.explodingPalmState.flyingSpeed * delta;
            this.explodingPalmState.distanceTraveled += moveDistance;
            
            // Update palm position using the target direction
            palmGroup.position.add(targetDirection.clone().multiplyScalar(moveDistance));
            
            // Animate hand to show power
            if (handGroup) {
                // Add very subtle slow pulse to show power
                const pulseFactor = 1 + Math.sin(this.explodingPalmState.age * 2) * 0.03;
                handGroup.scale.set(pulseFactor, pulseFactor, pulseFactor);
                
                // Create ground effect to show heaviness - dust/debris kicked up by the palm's power
                if (Math.random() < 0.2) { // 20% chance each frame to create effect
                    // Create dust particle
                    const dustSize = 0.05 + (Math.random() * 0.1);
                    const dustGeometry = new THREE.SphereGeometry(dustSize, 8, 8);
                    const dustMaterial = new THREE.MeshBasicMaterial({
                        color: 0xcccccc,
                        transparent: true,
                        opacity: 0.6 + (Math.random() * 0.2)
                    });
                    
                    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
                    
                    // Position dust below hand
                    dust.position.set(
                        (Math.random() - 0.5) * 0.5,
                        -0.3,
                        (Math.random() - 0.5) * 0.5
                    );
                    
                    // Store animation data
                    dust.userData = {
                        age: 0,
                        maxAge: 0.5 + (Math.random() * 0.5),
                        direction: new THREE.Vector3(
                            (Math.random() - 0.5) * 0.5,
                            0.5 + (Math.random() * 0.5),
                            (Math.random() - 0.5) * 0.5
                        ),
                        speed: 1 + (Math.random() * 2)
                    };
                    
                    // Add to hand group
                    handGroup.add(dust);
                    
                    // Add to a list for cleanup
                    if (!this.explodingPalmState.dustParticles) {
                        this.explodingPalmState.dustParticles = [];
                    }
                    this.explodingPalmState.dustParticles.push(dust);
                }
                
                // Animate existing dust particles
                if (this.explodingPalmState.dustParticles) {
                    for (let i = this.explodingPalmState.dustParticles.length - 1; i >= 0; i--) {
                        const dust = this.explodingPalmState.dustParticles[i];
                        if (dust && dust.userData) {
                            // Update age
                            dust.userData.age += delta;
                            
                            // Move dust
                            dust.position.add(dust.userData.direction.clone().multiplyScalar(delta * dust.userData.speed));
                            
                            // Fade out dust
                            if (dust.material) {
                                dust.material.opacity = 0.8 * (1 - (dust.userData.age / dust.userData.maxAge));
                            }
                            
                            // Remove if too old
                            if (dust.userData.age >= dust.userData.maxAge) {
                                handGroup.remove(dust);
                                this.explodingPalmState.dustParticles.splice(i, 1);
                            }
                        }
                    }
                }
            }
            
            // Animate particles
            for (const particle of this.explodingPalmState.particles) {
                if (particle.userData) {
                    // Update orbit position using quaternion rotation
                    const rotationAxis = particle.userData.orbitAxis;
                    const rotationAngle = particle.userData.orbitSpeed * delta;
                    
                    // Create quaternion for rotation
                    const quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(rotationAxis, rotationAngle);
                    
                    // Get current position relative to center
                    const position = particle.position.clone();
                    
                    // Apply rotation
                    position.applyQuaternion(quaternion);
                    
                    // Update particle position
                    particle.position.copy(position);
                    
                    // Store new position as initial for next frame
                    if (particle.userData.initialPosition) {
                        particle.userData.initialPosition.copy(position);
                    }
                }
            }
            
            // Animate trailing effect
            for (let i = 0; i < this.explodingPalmState.trails.length; i++) {
                const trail = this.explodingPalmState.trails[i];
                
                // Fade out trails based on distance
                const trailFade = 1 - (i / this.explodingPalmState.trails.length);
                trail.material.opacity = 0.5 * trailFade;
                
                // Scale trails for a motion blur effect
                const trailScale = 0.8 + (i * 0.1);
                trail.scale.set(trailScale, trailScale, 1);
            }
            
            // Create ground impact effect to show heaviness
            if (!this.explodingPalmState.lastImpactTime || 
                this.explodingPalmState.age - this.explodingPalmState.lastImpactTime > 0.5) { // Every 0.5 seconds
                
                this.explodingPalmState.lastImpactTime = this.explodingPalmState.age;
                
                // Create impact ring on the ground
                const ringGeometry = new THREE.RingGeometry(0.2, 0.8, 16);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff3300,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                });
                
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                
                // Position ring on ground below palm
                ring.position.copy(palmGroup.position);
                ring.position.y = 0.05; // Just above ground
                
                // Rotate ring to lay flat
                ring.rotation.x = -Math.PI / 2;
                
                // Store animation data
                ring.userData = {
                    age: 0,
                    maxAge: 0.5,
                    initialSize: 0.8,
                    finalSize: 2.0
                };
                
                // Add to scene
                if (this.skill.game && this.skill.game.scene) {
                    this.skill.game.scene.add(ring);
                } else if (this.effect.parent) {
                    this.effect.parent.add(ring);
                }
                
                // Add to a list for cleanup
                if (!this.explodingPalmState.impactRings) {
                    this.explodingPalmState.impactRings = [];
                }
                this.explodingPalmState.impactRings.push(ring);
            }
            
            // Animate existing impact rings
            if (this.explodingPalmState.impactRings) {
                for (let i = this.explodingPalmState.impactRings.length - 1; i >= 0; i--) {
                    const ring = this.explodingPalmState.impactRings[i];
                    if (ring && ring.userData) {
                        // Update age
                        ring.userData.age += delta;
                        
                        // Expand ring
                        const progress = ring.userData.age / ring.userData.maxAge;
                        const size = ring.userData.initialSize + (ring.userData.finalSize - ring.userData.initialSize) * progress;
                        
                        // Update ring geometry
                        ring.scale.set(size, size, 1);
                        
                        // Fade out ring
                        if (ring.material) {
                            ring.material.opacity = 0.7 * (1 - progress);
                        }
                        
                        // Remove if too old
                        if (ring.userData.age >= ring.userData.maxAge) {
                            if (this.skill.game && this.skill.game.scene) {
                                this.skill.game.scene.remove(ring);
                            } else if (ring.parent) {
                                ring.parent.remove(ring);
                            }
                            this.explodingPalmState.impactRings.splice(i, 1);
                        }
                    }
                }
            }
            
            // Check for collision with enemies
            if (this.skill.game && this.skill.game.enemies) {
                // Get palm position in world space
                const palmPosition = new THREE.Vector3();
                palmGroup.getWorldPosition(palmPosition);
                
                // Check each enemy
                for (const enemy of this.skill.game.enemies) {
                    if (enemy && enemy.position && !enemy.state.isDead) {
                        const distance = palmPosition.distanceTo(enemy.position);
                        
                        // If palm is close enough to enemy, mark it for explosion
                        if (distance < enemy.collisionRadius + 1) {
                            this.explodingPalmState.hitTarget = true;
                            this.explodingPalmState.targetPosition = enemy.position.clone();
                            
                            // Apply mark to enemy
                            if (enemy.applyMark) {
                                enemy.applyMark('explodingPalm', this.skill.damage);
                            }
                        }
                    }
                }
            }
        }
        // Handle exploding phase
        else if (this.explodingPalmState.phase === 'exploding') {
            // Get explosion group
            const explosionGroup = this.explodingPalmState.explosionGroup;
            
            // Calculate explosion progress (0 to 1)
            const explosionDuration = this.skill.duration * 0.2; // Last 20% of total duration
            const explosionProgress = (this.elapsedTime - (this.skill.duration - explosionDuration)) / explosionDuration;
            
            // Animate explosion
            if (explosionGroup) {
                // Scale explosion based on progress
                const explosionScale = Math.min(3.0, explosionProgress * 5);
                explosionGroup.scale.set(explosionScale, explosionScale, explosionScale);
                
                // Rotate explosion for effect
                explosionGroup.rotation.y += delta * 2;
                
                // Animate explosion components
                explosionGroup.traverse(child => {
                    if (child.isMesh) {
                        // Pulse opacity
                        if (child.material) {
                            // Start strong, then fade
                            if (explosionProgress < 0.3) {
                                child.material.opacity = Math.min(1.0, explosionProgress * 3);
                            } else {
                                child.material.opacity = Math.max(0, 1 - ((explosionProgress - 0.3) / 0.7));
                            }
                            
                            // Increase emissive intensity at start
                            if (child.material.emissiveIntensity !== undefined) {
                                if (explosionProgress < 0.3) {
                                    child.material.emissiveIntensity = 2.0;
                                } else {
                                    child.material.emissiveIntensity = 2.0 * (1 - ((explosionProgress - 0.3) / 0.7));
                                }
                            }
                        }
                        
                        // Move explosion particles outward
                        if (child.userData && child.userData.direction && child.userData.speed) {
                            const moveSpeed = child.userData.speed * (1 + explosionProgress * 2);
                            child.position.add(child.userData.direction.clone().multiplyScalar(delta * moveSpeed));
                        }
                        
                        // Rotate rings
                        if (child.geometry && child.geometry.type === 'RingGeometry') {
                            child.rotation.z += delta * 2;
                        }
                    }
                });
            }
            
            // Apply damage to nearby enemies during explosion
            if (this.skill.game && this.skill.game.enemies && explosionProgress > 0.2 && explosionProgress < 0.4) {
                // Only apply damage once during the explosion
                if (!this.explodingPalmState.damageApplied) {
                    this.explodingPalmState.damageApplied = true;
                    
                    // Get explosion position
                    const explosionPosition = new THREE.Vector3();
                    palmGroup.getWorldPosition(explosionPosition);
                    
                    // Apply damage to all enemies within explosion radius
                    const explosionRadius = 5.0; // Units
                    
                    for (const enemy of this.skill.game.enemies) {
                        if (enemy && enemy.position && !enemy.state.isDead) {
                            const distance = explosionPosition.distanceTo(enemy.position);
                            
                            // If enemy is within explosion radius, apply damage
                            if (distance < explosionRadius) {
                                // Calculate damage falloff based on distance
                                const damageMultiplier = 1 - (distance / explosionRadius);
                                const damage = this.skill.damage * damageMultiplier;
                                
                                // Apply damage to enemy
                                if (enemy.takeDamage) {
                                    enemy.takeDamage(damage);
                                }
                            }
                        }
                    }
                }
            }
            
            // Transition to fading phase at the end of explosion
            if (explosionProgress >= 1.0) {
                this.explodingPalmState.phase = 'fading';
            }
        }
        // Handle fading phase
        else if (this.explodingPalmState.phase === 'fading') {
            // Just wait for skill duration to end
            // The effect will be removed when this.isActive is set to false
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
    
    /**
     * Clean up resources when the effect is removed
     */
    dispose() {
        // Clean up Exploding Palm state
        if (this.explodingPalmState) {
            // Clean up impact rings
            if (this.explodingPalmState.impactRings) {
                for (const ring of this.explodingPalmState.impactRings) {
                    if (ring && ring.parent) {
                        if (ring.geometry) ring.geometry.dispose();
                        if (ring.material) ring.material.dispose();
                        ring.parent.remove(ring);
                    }
                }
                this.explodingPalmState.impactRings = [];
            }
            
            // Clean up dust particles
            if (this.explodingPalmState.dustParticles) {
                for (const dust of this.explodingPalmState.dustParticles) {
                    if (dust && dust.parent) {
                        if (dust.geometry) dust.geometry.dispose();
                        if (dust.material) dust.material.dispose();
                        dust.parent.remove(dust);
                    }
                }
                this.explodingPalmState.dustParticles = [];
            }
            
            // Clean up palm group
            if (this.explodingPalmState.palmGroup) {
                this.explodingPalmState.palmGroup.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
            
            // Null out the entire state
            this.explodingPalmState = null;
        }
        
        // Clean up mark state
        if (this.markState) {
            // Clean up mark elements
            if (this.markState.mark && this.markState.mark.parent) {
                if (this.markState.mark.geometry) this.markState.mark.geometry.dispose();
                if (this.markState.mark.material) this.markState.mark.material.dispose();
            }
            
            // Clean up rings
            if (this.markState.outerRing && this.markState.outerRing.parent) {
                if (this.markState.outerRing.geometry) this.markState.outerRing.geometry.dispose();
                if (this.markState.outerRing.material) this.markState.outerRing.material.dispose();
            }
            
            if (this.markState.innerRing && this.markState.innerRing.parent) {
                if (this.markState.innerRing.geometry) this.markState.innerRing.geometry.dispose();
                if (this.markState.innerRing.material) this.markState.innerRing.material.dispose();
            }
            
            // Null out the entire state
            this.markState = null;
        }
        
        // Call parent dispose
        super.dispose();
    }
}