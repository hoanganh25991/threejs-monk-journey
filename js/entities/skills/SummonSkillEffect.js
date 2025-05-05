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
        this.mysticAllyState = null;
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
        
        // Special handling for Mystic Ally
        if (this.skill.name === 'Mystic Ally') {
            this._createMysticAllyEffect(effectGroup, position, direction);
        } else {
            // Create the default summoning portal
            this._createSummoningPortal(effectGroup);
        }
        
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
     * Create the Mystic Ally effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Summoning position
     * @param {THREE.Vector3} direction - Direction the summon should face
     * @private
     */
    _createMysticAllyEffect(effectGroup, position, direction) {
        // Create summoning circle
        const summoningGroup = new THREE.Group();
        
        // Create base summoning circle
        const circleGeometry = new THREE.CircleGeometry(2, 32);
        const circleMaterial = new THREE.MeshStandardMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.5,
            emissive: this.skill.color,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        });
        
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.rotation.x = -Math.PI / 2; // Lay flat on ground
        circle.position.y = 0.05; // Slightly above ground to avoid z-fighting
        summoningGroup.add(circle);
        
        // Create magical rings
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            const ringRadius = 1.5 - (i * 0.3);
            const ringGeometry = new THREE.RingGeometry(ringRadius - 0.1, ringRadius, 32);
            const ringMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.7 - (i * 0.1),
                emissive: this.skill.color,
                emissiveIntensity: 1.0 - (i * 0.2),
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = -Math.PI / 2; // Lay flat on ground
            ring.position.y = 0.06 + (i * 0.01); // Stack slightly above each other
            
            // Store rotation data
            ring.userData = {
                rotationSpeed: 0.5 - (i * 0.1), // Outer rings rotate slower
                direction: i % 2 === 0 ? 1 : -1 // Alternate directions
            };
            
            summoningGroup.add(ring);
        }
        
        // Create mystical runes
        const runeCount = 5;
        for (let i = 0; i < runeCount; i++) {
            const angle = (i / runeCount) * Math.PI * 2;
            const radius = 1.2;
            
            // Create a custom shape for the rune
            const shape = new THREE.Shape();
            
            // Draw a mystical symbol
            shape.moveTo(0, 0.2);
            shape.lineTo(0.1, 0);
            shape.lineTo(0, -0.2);
            shape.lineTo(-0.1, 0);
            shape.lineTo(0, 0.2);
            
            // Add some details
            shape.moveTo(0, 0.1);
            shape.lineTo(0.05, 0);
            shape.lineTo(0, -0.1);
            shape.lineTo(-0.05, 0);
            shape.lineTo(0, 0.1);
            
            const runeGeometry = new THREE.ShapeGeometry(shape);
            const runeMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                emissive: this.skill.color,
                emissiveIntensity: 1.0,
                side: THREE.DoubleSide
            });
            
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            
            // Position rune
            rune.position.set(
                Math.cos(angle) * radius,
                0.1,
                Math.sin(angle) * radius
            );
            
            // Rotate rune to face up
            rune.rotation.x = -Math.PI / 2;
            
            // Store animation data
            rune.userData = {
                initialPos: rune.position.clone(),
                initialAngle: angle,
                radius: radius,
                pulseSpeed: 0.5 + (Math.random() * 1.0),
                moveSpeed: 0.2 + (Math.random() * 0.3)
            };
            
            summoningGroup.add(rune);
        }
        
        // Create particles
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random position around the summoning circle
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2;
            const height = 0.1 + (Math.random() * 3);
            
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
                initialPos: particle.position.clone(),
                speed: 0.5 + (Math.random() * 1.5)
            };
            
            summoningGroup.add(particle);
            particles.push(particle);
        }
        
        // Create the ally
        const allyGroup = new THREE.Group();
        
        // Create ally body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x8844aa, // Purple-ish color
            transparent: true,
            opacity: 0.0, // Start invisible
            emissive: this.skill.color,
            emissiveIntensity: 0.5
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6; // Half height
        allyGroup.add(body);
        
        // Create ally head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0x8844aa,
            transparent: true,
            opacity: 0.0, // Start invisible
            emissive: this.skill.color,
            emissiveIntensity: 0.5
        });
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.3; // Above body
        allyGroup.add(head);
        
        // Create ally arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0x8844aa,
            transparent: true,
            opacity: 0.0, // Start invisible
            emissive: this.skill.color,
            emissiveIntensity: 0.5
        });
        
        // Left arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.9, 0);
        leftArm.rotation.z = Math.PI / 4; // Angle arm outward
        allyGroup.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.9, 0);
        rightArm.rotation.z = -Math.PI / 4; // Angle arm outward
        allyGroup.add(rightArm);
        
        // Create energy wisps around the ally
        const wispCount = 5;
        for (let i = 0; i < wispCount; i++) {
            const angle = (i / wispCount) * Math.PI * 2;
            const radius = 0.5;
            
            const wispGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const wispMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.0, // Start invisible
                emissive: this.skill.color,
                emissiveIntensity: 1.0
            });
            
            const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
            wisp.position.set(
                Math.cos(angle) * radius,
                0.8,
                Math.sin(angle) * radius
            );
            
            // Store animation data
            wisp.userData = {
                initialAngle: angle,
                orbitSpeed: 1.0 + (Math.random() * 0.5),
                pulseSpeed: 0.5 + (Math.random() * 1.0)
            };
            
            allyGroup.add(wisp);
        }
        
        // Create energy swirls
        const swirlCount = 3;
        for (let i = 0; i < swirlCount; i++) {
            const height = 0.4 + (i * 0.4);
            
            const swirlGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
            const swirlMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.0, // Start invisible
                emissive: this.skill.color,
                emissiveIntensity: 1.0
            });
            
            const swirl = new THREE.Mesh(swirlGeometry, swirlMaterial);
            swirl.position.y = height;
            swirl.rotation.x = Math.PI / 2; // Lay flat
            
            // Store animation data
            swirl.userData = {
                rotationSpeed: 0.5 + (i * 0.2),
                direction: i % 2 === 0 ? 1 : -1 // Alternate directions
            };
            
            allyGroup.add(swirl);
        }
        
        // Position ally above the summoning circle
        allyGroup.position.y = 5; // Start high above
        allyGroup.visible = true;
        
        // Add ally to effect group
        effectGroup.add(allyGroup);
        
        // Add summoning group to effect group
        effectGroup.add(summoningGroup);
        
        // Store animation state
        this.mysticAllyState = {
            age: 0,
            phase: 'summoning', // 'summoning', 'active', 'dissipating'
            particles: particles,
            ally: allyGroup,
            summoningCircle: summoningGroup,
            initialAllyHeight: 5, // Starting height
            allyMesh: body // Reference to main ally mesh for cleanup
        };
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
        
        // Special handling for Mystic Ally
        if (this.skill.name === 'Mystic Ally' && this.mysticAllyState) {
            this._updateMysticAllyEffect(delta);
        } else {
            // Update based on current stage for default summon
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
    }
    
    /**
     * Update the Mystic Ally effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateMysticAllyEffect(delta) {
        // Update state
        this.mysticAllyState.age += delta;
        
        // Get the summoning group and ally
        const summoningGroup = this.mysticAllyState.summoningCircle;
        const ally = this.mysticAllyState.ally;
        
        // Handle different phases of the summon
        const summonDuration = this.skill.duration * 0.2; // First 20% is summoning
        const activeDuration = this.skill.duration * 0.6; // Middle 60% is active
        // Last 20% is dissipating
        
        // Determine current phase
        if (this.elapsedTime < summonDuration) {
            this.mysticAllyState.phase = 'summoning';
        } else if (this.elapsedTime < summonDuration + activeDuration) {
            this.mysticAllyState.phase = 'active';
        } else {
            this.mysticAllyState.phase = 'dissipating';
        }
        
        // Handle summoning phase
        if (this.mysticAllyState.phase === 'summoning') {
            // Calculate progress through summoning phase (0 to 1)
            const summonProgress = this.elapsedTime / summonDuration;
            
            // Animate the summoning circle
            // Rotate magical rings
            for (let i = 0; i < summoningGroup.children.length; i++) {
                const child = summoningGroup.children[i];
                
                // Animate rings
                if (child.geometry && child.geometry.type === 'RingGeometry') {
                    if (child.userData && child.userData.rotationSpeed) {
                        // Rotate ring
                        child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction;
                    }
                    
                    // Pulse opacity during summoning
                    if (child.material) {
                        child.material.opacity = 0.3 + (Math.sin(this.mysticAllyState.age * 5) * 0.2) + (summonProgress * 0.3);
                    }
                }
                
                // Animate runes
                if (child.geometry && child.geometry.type === 'ShapeGeometry') {
                    if (child.userData && child.userData.initialPos) {
                        // Move runes outward and back
                        const moveSpeed = child.userData.moveSpeed || 0.2;
                        const moveAmount = Math.sin(this.mysticAllyState.age * moveSpeed * 5) * 0.1;
                        
                        // Calculate direction from center
                        const direction = new THREE.Vector3(
                            child.position.x,
                            0,
                            child.position.z
                        ).normalize();
                        
                        // Move rune
                        child.position.add(direction.multiplyScalar(moveAmount));
                        
                        // Pulse runes
                        if (child.userData.pulseSpeed) {
                            const pulseScale = 0.8 + Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed) * 0.2;
                            child.scale.set(pulseScale, pulseScale, pulseScale);
                        }
                        
                        // Increase emissive intensity
                        if (child.material) {
                            child.material.emissiveIntensity = 1 + Math.sin(this.mysticAllyState.age * 10) * 0.5 + summonProgress;
                        }
                    }
                }
            }
            
            // Animate ally appearing
            if (ally) {
                // Move ally down from above
                const targetHeight = 0.5;
                const currentHeight = this.mysticAllyState.initialAllyHeight * (1 - summonProgress) + targetHeight * summonProgress;
                ally.position.y = currentHeight;
                
                // Rotate ally during summoning
                ally.rotation.y += delta * 3;
                
                // Pulse ally size
                const pulseScale = 0.5 + (summonProgress * 0.5) + Math.sin(this.mysticAllyState.age * 5) * 0.1;
                ally.scale.set(pulseScale, pulseScale, pulseScale);
                
                // Increase opacity as ally forms
                ally.traverse(child => {
                    if (child.material) {
                        // Fade in gradually
                        child.material.opacity = summonProgress * 0.8;
                        
                        // Increase emissive intensity
                        if (child.material.emissiveIntensity !== undefined) {
                            child.material.emissiveIntensity = 0.5 + summonProgress * 0.5;
                        }
                    }
                });
            }
            
            // Animate particles converging to form the ally
            for (const particle of this.mysticAllyState.particles) {
                if (particle.userData) {
                    // Move particles toward the center and upward
                    const direction = new THREE.Vector3(
                        -particle.position.x * 0.1,
                        (ally.position.y - particle.position.y) * 0.1,
                        -particle.position.z * 0.1
                    );
                    
                    // Move particle
                    particle.position.add(direction.multiplyScalar(delta * particle.userData.speed));
                    
                    // Pulse particle size
                    const pulseScale = 0.8 + Math.sin(this.mysticAllyState.age * 5) * 0.2;
                    particle.scale.set(pulseScale, pulseScale, pulseScale);
                    
                    // Fade out particles as they reach the ally
                    const distanceToAlly = particle.position.distanceTo(new THREE.Vector3(0, ally.position.y, 0));
                    if (distanceToAlly < 1.0) {
                        particle.material.opacity = Math.max(0, particle.material.opacity - delta * 2);
                    }
                }
            }
        }
        // Handle active phase
        else if (this.mysticAllyState.phase === 'active') {
            // Calculate progress through active phase (0 to 1)
            const activeProgress = (this.elapsedTime - summonDuration) / activeDuration;
            
            // Animate the summoning circle (more subtle during active phase)
            // Rotate magical rings
            for (let i = 0; i < summoningGroup.children.length; i++) {
                const child = summoningGroup.children[i];
                
                // Animate rings
                if (child.geometry && child.geometry.type === 'RingGeometry') {
                    if (child.userData && child.userData.rotationSpeed) {
                        // Rotate ring slowly
                        child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction * 0.5;
                    }
                }
                
                // Animate runes
                if (child.geometry && child.geometry.type === 'ShapeGeometry') {
                    if (child.userData) {
                        // Rotate runes slowly
                        child.rotation.z += child.userData.rotationSpeed * delta * 0.3;
                        
                        // Subtle pulse
                        if (child.userData.pulseSpeed) {
                            const pulseScale = 0.9 + Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed * 0.5) * 0.1;
                            child.scale.set(pulseScale, pulseScale, pulseScale);
                        }
                    }
                }
            }
            
            // Animate ally in active state
            if (ally) {
                // Hover animation
                const hoverHeight = 0.5 + Math.sin(this.mysticAllyState.age * 0.7) * 0.1;
                ally.position.y = hoverHeight;
                
                // Gentle rotation
                ally.rotation.y += delta * 0.5;
                
                // Subtle breathing animation
                const breathScale = 1 + Math.sin(this.mysticAllyState.age * 1.5) * 0.05;
                ally.scale.set(breathScale, breathScale, breathScale);
                
                // Animate ally components
                ally.traverse(child => {
                    // Animate energy wisps
                    if (child.geometry && child.geometry.type === 'SphereGeometry' && 
                        child.userData && child.userData.orbitSpeed) {
                        
                        // Orbit around ally
                        const orbitSpeed = child.userData.orbitSpeed;
                        const initialAngle = child.userData.initialAngle;
                        const newAngle = initialAngle + (this.mysticAllyState.age * orbitSpeed);
                        const radius = 0.5;
                        
                        // Calculate new position
                        const orbitX = Math.cos(newAngle) * radius;
                        const orbitZ = Math.sin(newAngle) * radius;
                        
                        // Update position
                        child.position.x = orbitX;
                        child.position.z = orbitZ;
                        
                        // Pulse size
                        if (child.userData.pulseSpeed) {
                            const pulseScale = 0.8 + Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed) * 0.2;
                            child.scale.set(pulseScale, pulseScale, pulseScale);
                        }
                    }
                    
                    // Animate energy swirls
                    if (child.geometry && child.geometry.type === 'TorusGeometry' && 
                        child.userData && child.userData.rotationSpeed) {
                        
                        // Rotate swirl
                        child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction;
                        
                        // Pulse size
                        const pulseScale = 0.9 + Math.sin(this.mysticAllyState.age * 2) * 0.1;
                        child.scale.set(pulseScale, pulseScale, pulseScale);
                    }
                });
            }
        }
        // Handle dissipating phase
        else if (this.mysticAllyState.phase === 'dissipating') {
            // Calculate progress through dissipating phase (0 to 1)
            const dissipateProgress = (this.elapsedTime - summonDuration - activeDuration) / 
                                     (this.skill.duration - summonDuration - activeDuration);
            
            // Fade out ally
            if (ally) {
                // Move ally back up
                const finalHeight = this.mysticAllyState.initialAllyHeight;
                const currentHeight = 0.5 * (1 - dissipateProgress) + finalHeight * dissipateProgress;
                ally.position.y = currentHeight;
                
                // Rotate ally faster during dissipation
                ally.rotation.y += delta * (1 + dissipateProgress * 4);
                
                // Shrink ally
                const scale = 1 - (dissipateProgress * 0.5);
                ally.scale.set(scale, scale, scale);
                
                // Fade out ally
                ally.traverse(child => {
                    if (child.material) {
                        child.material.opacity = 0.8 * (1 - dissipateProgress);
                    }
                });
            }
            
            // Fade out summoning circle
            for (let i = 0; i < summoningGroup.children.length; i++) {
                const child = summoningGroup.children[i];
                
                if (child.material) {
                    child.material.opacity = child.material.opacity * (1 - delta);
                }
                
                // Continue some animations
                if (child.userData && child.userData.rotationSpeed) {
                    // Slow down rotation
                    const slowFactor = 1 - dissipateProgress;
                    child.rotation.z += child.userData.rotationSpeed * delta * slowFactor;
                }
            }
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
    
    /**
     * Clean up resources when the effect is removed
     */
    dispose() {
        // Clean up Mystic Ally state
        if (this.mysticAllyState) {
            // Clean up any specific ally elements if they exist
            if (this.mysticAllyState.allyMesh && this.mysticAllyState.allyMesh.parent) {
                if (this.mysticAllyState.allyMesh.geometry) this.mysticAllyState.allyMesh.geometry.dispose();
                if (this.mysticAllyState.allyMesh.material) this.mysticAllyState.allyMesh.material.dispose();
                this.mysticAllyState.allyMesh.parent.remove(this.mysticAllyState.allyMesh);
            }
            
            // Null out the entire state
            this.mysticAllyState = null;
        }
        
        // Clean up portal state
        if (this.portalState) {
            // Clean up portal elements
            if (this.portalState.portal && this.portalState.portal.parent) {
                if (this.portalState.portal.geometry) this.portalState.portal.geometry.dispose();
                if (this.portalState.portal.material) this.portalState.portal.material.dispose();
            }
            
            // Null out the entire state
            this.portalState = null;
        }
        
        // Call parent dispose
        super.dispose();
    }
}