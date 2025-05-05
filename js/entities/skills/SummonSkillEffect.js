import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for summoning skills
 */
export class SummonSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.summonTime = 1.0; // Time to complete the summoning animation
        this.summonStage = 'portal'; // 'portal', 'emerging', 'complete'
        this.portalSize = 1.5;
        this.summonHeight = 2.0;
    }

    /**
     * Create a summoning effect
     * @param {THREE.Vector3} position - Summoning position
     * @param {THREE.Vector3} direction - Direction the summon should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create the summoning portal
        this._createSummoningPortal(effectGroup);
        
        // Position effect
        effectGroup.position.copy(position);
        effectGroup.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        this.summonStage = 'portal';
        this.stageTime = 0;
        
        return effectGroup;
    }

    /**
     * Create the summoning portal effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    _createSummoningPortal(effectGroup) {
        // Create portal group
        const portalGroup = new THREE.Group();
        
        // Create the main portal (a disc)
        const portalGeometry = new THREE.CircleGeometry(this.portalSize, 32);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            emissive: this.skill.color,
            emissiveIntensity: 0.5
        });
        
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.rotation.x = -Math.PI / 2; // Lay flat on the ground
        portal.position.y = 0.05; // Slightly above ground to avoid z-fighting
        portalGroup.add(portal);
        
        // Create portal rim
        const rimGeometry = new THREE.TorusGeometry(this.portalSize, 0.2, 16, 32);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: this.skill.color,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.9
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2; // Align with portal
        rim.position.y = 0.1;
        portalGroup.add(rim);
        
        // Add runes around the portal
        const runeCount = 5;
        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            const radius = this.portalSize * 1.2;
            
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
            
            // Position rune around portal
            rune.position.set(
                Math.cos(angle) * radius,
                0.1,
                Math.sin(angle) * radius
            );
            
            // Rotate rune to face up
            rune.rotation.x = -Math.PI / 2;
            
            // Store animation data
            rune.userData = {
                initialAngle: angle,
                pulseSpeed: 0.5 + (Math.random() * 1.0),
                pulsePhase: Math.random() * Math.PI * 2
            };
            
            portalGroup.add(rune);
        }
        
        // Add energy beams from the portal
        const beamCount = 8;
        for (let i = 0; i < beamCount; i++) {
            const angle = (i / beamCount) * Math.PI * 2;
            const radius = this.portalSize * 0.7;
            
            // Create beam
            const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8);
            const beamMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: this.skill.color,
                emissiveIntensity: 2.0,
                transparent: true,
                opacity: 0.8
            });
            
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            
            // Position beam
            beam.position.set(
                Math.cos(angle) * radius,
                0.1,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            beam.userData = {
                initialAngle: angle,
                initialHeight: 0.1,
                maxHeight: this.summonHeight,
                growSpeed: 0.5 + (Math.random() * 0.5)
            };
            
            portalGroup.add(beam);
        }
        
        // Add particles around the portal
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            // Random position around the portal
            const angle = Math.random() * Math.PI * 2;
            const radius = this.portalSize * (0.8 + Math.random() * 0.7);
            const height = 0.1 + (Math.random() * 0.5);
            
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
                speed: 0.5 + (Math.random() * 1.5),
                direction: new THREE.Vector3(
                    (Math.random() * 2) - 1,
                    Math.random(), // Mostly upward
                    (Math.random() * 2) - 1
                ).normalize()
            };
            
            portalGroup.add(particle);
        }
        
        // Add the portal group to the effect group
        effectGroup.add(portalGroup);
        
        // Create a placeholder for the summoned entity
        const summonedEntityGroup = new THREE.Group();
        summonedEntityGroup.visible = false; // Hidden initially
        effectGroup.add(summonedEntityGroup);
        
        // Create a simple placeholder mesh
        const entityGeometry = new THREE.CylinderGeometry(0.5, 0.5, this.summonHeight, 16);
        const entityMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.0 // Start invisible
        });
        
        const entityMesh = new THREE.Mesh(entityGeometry, entityMaterial);
        entityMesh.position.y = this.summonHeight / 2;
        summonedEntityGroup.add(entityMesh);
        
        // Store animation state
        this.portalState = {
            age: 0,
            particles: [],
            runes: [],
            beams: [],
            portal: portal,
            rim: rim,
            summonedEntity: summonedEntityGroup
        };
        
        // Store references for animation
        for (let i = 0; i < portalGroup.children.length; i++) {
            const child = portalGroup.children[i];
            if (!child.userData) continue;
            
            if (child.userData.initialPos) {
                this.portalState.particles.push(child);
            } else if (child.userData.initialAngle && child.geometry.type === 'PlaneGeometry') {
                this.portalState.runes.push(child);
            } else if (child.userData.initialAngle && child.geometry.type === 'CylinderGeometry') {
                this.portalState.beams.push(child);
            }
        }
    }

    /**
     * Update the summoning effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        this.stageTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            return;
        }
        
        // Update based on current stage
        switch (this.summonStage) {
            case 'portal':
                this._updatePortalStage(delta);
                // Transition to emerging stage
                if (this.stageTime >= this.summonTime * 0.4) {
                    this.summonStage = 'emerging';
                    this.stageTime = 0;
                }
                break;
                
            case 'emerging':
                this._updateEmergingStage(delta);
                // Transition to complete stage
                if (this.stageTime >= this.summonTime * 0.6) {
                    this.summonStage = 'complete';
                    this.stageTime = 0;
                }
                break;
                
            case 'complete':
                this._updateCompleteStage(delta);
                break;
        }
    }

    /**
     * Update the portal opening stage
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updatePortalStage(delta) {
        // Get the portal group (first child of effect group)
        const portalGroup = this.effect.children[0];
        
        // Calculate stage progress (0-1)
        const progress = Math.min(this.stageTime / (this.summonTime * 0.4), 1.0);
        
        // Animate portal opening
        if (this.portalState.portal) {
            // Scale up the portal
            const portalScale = progress * 1.0;
            this.portalState.portal.scale.set(portalScale, portalScale, portalScale);
        }
        
        // Animate rim
        if (this.portalState.rim) {
            // Scale up and rotate the rim
            const rimScale = progress * 1.0;
            this.portalState.rim.scale.set(rimScale, rimScale, rimScale);
            this.portalState.rim.rotation.z += delta * 2;
        }
        
        // Animate runes
        for (const rune of this.portalState.runes) {
            if (rune.userData) {
                const pulseSpeed = rune.userData.pulseSpeed || 1.0;
                const pulsePhase = rune.userData.pulsePhase || 0;
                
                // Fade in runes
                rune.material.opacity = progress * 0.9;
                
                // Pulse size
                const scale = progress * (0.8 + Math.sin(this.elapsedTime * pulseSpeed + pulsePhase) * 0.2);
                rune.scale.set(scale, scale, scale);
                
                // Rotate runes
                rune.rotation.z = this.elapsedTime * pulseSpeed;
            }
        }
        
        // Animate beams
        for (const beam of this.portalState.beams) {
            if (beam.userData) {
                // Start growing beams at 50% of this stage
                const beamProgress = Math.max(0, (progress - 0.5) * 2);
                if (beamProgress > 0) {
                    const growSpeed = beam.userData.growSpeed || 1.0;
                    const maxHeight = beam.userData.maxHeight || this.summonHeight;
                    
                    // Grow beam height
                    const height = beamProgress * maxHeight * 0.3; // Only grow to 30% in this stage
                    beam.scale.y = height / 0.1; // Adjust for original height
                    beam.position.y = height / 2;
                }
            }
        }
        
        // Animate particles
        for (const particle of this.portalState.particles) {
            if (particle.userData) {
                const initialPos = particle.userData.initialPos;
                const speed = particle.userData.speed;
                const direction = particle.userData.direction;
                
                // Fade in particles
                particle.material.opacity = progress * (0.6 + Math.random() * 0.4);
                
                // Move particles upward and outward
                particle.position.set(
                    initialPos.x + direction.x * progress * speed,
                    initialPos.y + direction.y * progress * speed * 2, // More vertical movement
                    initialPos.z + direction.z * progress * speed
                );
            }
        }
    }

    /**
     * Update the entity emerging stage
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateEmergingStage(delta) {
        // Calculate stage progress (0-1)
        const progress = Math.min(this.stageTime / (this.summonTime * 0.6), 1.0);
        
        // Make summoned entity visible and animate it emerging
        const summonedEntity = this.portalState.summonedEntity;
        if (summonedEntity) {
            summonedEntity.visible = true;
            
            // Get the entity mesh
            const entityMesh = summonedEntity.children[0];
            if (entityMesh) {
                // Fade in the entity
                entityMesh.material.opacity = progress * 0.8;
                
                // Emerge from the portal
                const emergeHeight = progress * this.summonHeight;
                entityMesh.position.y = emergeHeight / 2;
                entityMesh.scale.y = progress;
            }
        }
        
        // Continue animating beams
        for (const beam of this.portalState.beams) {
            if (beam.userData) {
                const growSpeed = beam.userData.growSpeed || 1.0;
                const maxHeight = beam.userData.maxHeight || this.summonHeight;
                
                // Grow beam height (30% to 100% during this stage)
                const height = (0.3 + (progress * 0.7)) * maxHeight;
                beam.scale.y = height / 0.1; // Adjust for original height
                beam.position.y = height / 2;
                
                // Rotate beam around portal
                const angle = beam.userData.initialAngle + (this.elapsedTime * growSpeed);
                const radius = this.portalSize * 0.7;
                beam.position.x = Math.cos(angle) * radius;
                beam.position.z = Math.sin(angle) * radius;
            }
        }
        
        // Animate portal and rim
        if (this.portalState.portal) {
            // Pulse the portal
            const pulseScale = 1.0 + Math.sin(this.elapsedTime * 5) * 0.1;
            this.portalState.portal.scale.set(pulseScale, pulseScale, pulseScale);
        }
        
        if (this.portalState.rim) {
            // Rotate the rim faster
            this.portalState.rim.rotation.z += delta * 3;
        }
        
        // Continue animating particles
        for (const particle of this.portalState.particles) {
            if (particle.userData) {
                const speed = particle.userData.speed;
                const direction = particle.userData.direction;
                
                // Move particles more chaotically
                particle.position.x += direction.x * delta * speed * 2;
                particle.position.y += direction.y * delta * speed * 3;
                particle.position.z += direction.z * delta * speed * 2;
                
                // Fade out particles that go too high
                if (particle.position.y > this.summonHeight) {
                    particle.material.opacity -= delta;
                    if (particle.material.opacity <= 0) {
                        particle.visible = false;
                    }
                }
            }
        }
    }

    /**
     * Update the completed summoning stage
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateCompleteStage(delta) {
        // Fade out the portal
        const portalFadeTime = this.summonTime * 0.3;
        const portalFadeProgress = Math.min(this.stageTime / portalFadeTime, 1.0);
        
        if (this.portalState.portal) {
            this.portalState.portal.material.opacity = 0.7 * (1.0 - portalFadeProgress);
        }
        
        if (this.portalState.rim) {
            this.portalState.rim.material.opacity = 0.9 * (1.0 - portalFadeProgress);
            this.portalState.rim.rotation.z += delta;
        }
        
        // Fade out beams
        for (const beam of this.portalState.beams) {
            if (beam.material) {
                beam.material.opacity = 0.8 * (1.0 - portalFadeProgress);
            }
        }
        
        // Fade out runes
        for (const rune of this.portalState.runes) {
            if (rune.material) {
                rune.material.opacity = 0.9 * (1.0 - portalFadeProgress);
            }
        }
        
        // Make summoned entity fully visible
        const summonedEntity = this.portalState.summonedEntity;
        if (summonedEntity) {
            const entityMesh = summonedEntity.children[0];
            if (entityMesh) {
                // Ensure entity is fully visible
                entityMesh.material.opacity = 0.8;
                entityMesh.position.y = this.summonHeight / 2;
                entityMesh.scale.y = 1.0;
                
                // Add a subtle idle animation
                entityMesh.position.y += Math.sin(this.elapsedTime * 2) * 0.05;
            }
        }
    }
}