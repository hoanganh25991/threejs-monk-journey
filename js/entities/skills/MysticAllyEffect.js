import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for Mystic Ally skill
 */
export class MysticAllyEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.summonTime = 1.0; // Time to complete the summoning animation
        this.summonStage = 'portal'; // 'portal', 'emerging', 'complete'
        this.portalSize = 1.5;
        this.summonHeight = 2.0;
        this.mysticAllyState = null;
    }

    /**
     * Create a Mystic Ally effect
     * @param {THREE.Vector3} position - Summoning position
     * @param {THREE.Vector3} direction - Direction the summon should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Create the Mystic Ally effect
        this._createMysticAllyEffect(effectGroup, position, direction);
        
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
        const circleGeometry = new THREE.CircleGeometry(2, 32 * 5);
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
     * Update the Mystic Ally effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        this.elapsedTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            this.dispose(); // Properly dispose of the effect when it expires
            return;
        }
        
        // IMPORTANT: Update the skill's position property to match the effect's position
        // This is crucial for collision detection in CollisionManager
        this.skill.position.copy(this.effect.position);
        
        // Update the Mystic Ally effect
        this._updateMysticAllyEffect(delta);
    }

    /**
     * Update the Mystic Ally effect
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    _updateMysticAllyEffect(delta) {
        // Update ally state
        this.mysticAllyState.age += delta;
        
        // Determine current phase based on elapsed time
        const summoningDuration = 2.0; // First 2 seconds is summoning
        const dissipatingDuration = 2.0; // Last 2 seconds is dissipating
        
        if (this.elapsedTime < summoningDuration) {
            this.mysticAllyState.phase = 'summoning';
        } else if (this.elapsedTime > this.skill.duration - dissipatingDuration) {
            this.mysticAllyState.phase = 'dissipating';
        } else {
            this.mysticAllyState.phase = 'active';
        }
        
        // Calculate phase progress (0 to 1)
        let phaseProgress;
        if (this.mysticAllyState.phase === 'summoning') {
            phaseProgress = this.elapsedTime / summoningDuration;
        } else if (this.mysticAllyState.phase === 'dissipating') {
            phaseProgress = (this.elapsedTime - (this.skill.duration - dissipatingDuration)) / dissipatingDuration;
        } else {
            phaseProgress = (this.elapsedTime - summoningDuration) / (this.skill.duration - summoningDuration - dissipatingDuration);
        }
        
        // Update summoning circle
        const summoningCircle = this.mysticAllyState.summoningCircle;
        
        // Update magical rings
        for (let i = 0; i < summoningCircle.children.length; i++) {
            const child = summoningCircle.children[i];
            
            // Rotate rings
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction;
            }
            
            // Update runes
            if (child.userData && child.userData.pulseSpeed) {
                // Pulse size
                const scale = 1.0 + 0.2 * Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed);
                child.scale.set(scale, scale, scale);
                
                // Move in a circular pattern
                if (child.userData.initialAngle !== undefined) {
                    const newAngle = child.userData.initialAngle + (this.mysticAllyState.age * child.userData.moveSpeed);
                    child.position.x = Math.cos(newAngle) * child.userData.radius;
                    child.position.z = Math.sin(newAngle) * child.userData.radius;
                }
            }
        }
        
        // Update particles
        for (const particle of this.mysticAllyState.particles) {
            if (particle.userData) {
                // Oscillate position
                const initialPos = particle.userData.initialPos;
                const speed = particle.userData.speed;
                
                particle.position.set(
                    initialPos.x + Math.sin(this.mysticAllyState.age * speed * 0.5) * 0.2,
                    initialPos.y + Math.sin(this.mysticAllyState.age * speed) * 0.3,
                    initialPos.z + Math.sin(this.mysticAllyState.age * speed * 0.7) * 0.2
                );
                
                // Adjust opacity based on phase
                if (this.mysticAllyState.phase === 'summoning') {
                    particle.material.opacity = 0.6 + (Math.random() * 0.4);
                } else if (this.mysticAllyState.phase === 'dissipating') {
                    particle.material.opacity = (0.6 + (Math.random() * 0.4)) * (1 - phaseProgress);
                }
            }
        }
        
        // Update ally
        const ally = this.mysticAllyState.ally;
        
        // Handle summoning phase
        if (this.mysticAllyState.phase === 'summoning') {
            // Lower ally to ground
            const targetHeight = 0;
            const currentHeight = this.mysticAllyState.initialAllyHeight * (1 - phaseProgress);
            ally.position.y = currentHeight;
            
            // Fade in ally
            ally.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = phaseProgress;
                }
            });
        }
        // Handle dissipating phase
        else if (this.mysticAllyState.phase === 'dissipating') {
            // Raise ally back up
            const currentHeight = this.mysticAllyState.initialAllyHeight * phaseProgress;
            ally.position.y = currentHeight;
            
            // Fade out ally
            ally.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = 1 - phaseProgress;
                }
            });
        }
        // Handle active phase
        else {
            // Keep ally on ground
            ally.position.y = 0;
            
            // Ensure ally is fully visible
            ally.traverse(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = 1.0;
                }
            });
            
            // Make ally "breathe" by scaling slightly
            const breathScale = 1.0 + 0.05 * Math.sin(this.mysticAllyState.age * 0.5);
            ally.scale.set(breathScale, breathScale, breathScale);
        }
        
        // Update ally animations
        for (let i = 0; i < ally.children.length; i++) {
            const child = ally.children[i];
            
            // Rotate swirls
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.z += child.userData.rotationSpeed * delta * child.userData.direction;
            }
            
            // Orbit wisps
            if (child.userData && child.userData.orbitSpeed) {
                const newAngle = child.userData.initialAngle + (this.mysticAllyState.age * child.userData.orbitSpeed);
                const radius = 0.5;
                
                child.position.x = Math.cos(newAngle) * radius;
                child.position.z = Math.sin(newAngle) * radius;
                
                // Pulse wisps
                if (child.userData.pulseSpeed) {
                    const scale = 1.0 + 0.3 * Math.sin(this.mysticAllyState.age * child.userData.pulseSpeed);
                    child.scale.set(scale, scale, scale);
                }
            }
        }
        
        // Make ally face the direction of movement if it's active
        if (this.mysticAllyState.phase === 'active') {
            // Simple bobbing motion
            const bobHeight = Math.sin(this.mysticAllyState.age * 2) * 0.1;
            ally.position.y = bobHeight;
            
            // Simple rotation
            ally.rotation.y = Math.sin(this.mysticAllyState.age * 0.5) * 0.5;
        }
    }

    /**
     * Enhanced dispose method to properly clean up all resources
     * Overrides the base class dispose method with more thorough cleanup
     */
    dispose() {
        if (!this.effect) return;
        
        // Clean up Mystic Ally specific resources
        if (this.mysticAllyState) {
            // Clear particle references
            if (this.mysticAllyState.particles) {
                this.mysticAllyState.particles.length = 0;
            }
            
            // Clear ally references
            this.mysticAllyState.ally = null;
            this.mysticAllyState.allyMesh = null;
            this.mysticAllyState.summoningCircle = null;
            
            // Clear ally state
            this.mysticAllyState = null;
        }
        
        // Recursively dispose of geometries and materials
        this.effect.traverse(child => {
            // Dispose of geometries
            if (child.geometry) {
                child.geometry.dispose();
            }
            
            // Dispose of materials
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        // Dispose of any textures
                        if (material.map) material.map.dispose();
                        if (material.normalMap) material.normalMap.dispose();
                        if (material.specularMap) material.specularMap.dispose();
                        if (material.emissiveMap) material.emissiveMap.dispose();
                        
                        // Dispose of the material itself
                        material.dispose();
                    });
                } else {
                    // Dispose of any textures
                    if (child.material.map) child.material.map.dispose();
                    if (child.material.normalMap) child.material.normalMap.dispose();
                    if (child.material.specularMap) child.material.specularMap.dispose();
                    if (child.material.emissiveMap) child.material.emissiveMap.dispose();
                    
                    // Dispose of the material itself
                    child.material.dispose();
                }
            }
            
            // Clear any userData
            if (child.userData) {
                // If userData contains Vector3 objects, null them out
                if (child.userData.initialPos) {
                    child.userData.initialPos = null;
                }
                
                // Clear the userData object
                child.userData = {};
            }
        });
        
        // Remove from parent
        if (this.effect.parent) {
            this.effect.parent.remove(this.effect);
        }
        
        // Clear references
        this.effect = null;
        this.isActive = false;
    }
    
    /**
     * Override the reset method to properly clean up all resources
     */
    reset() {
        // Call the dispose method to clean up resources
        this.dispose();
        
        // Reset state variables
        this.isActive = false;
        this.elapsedTime = 0;
        this.summonStage = 'portal';
        this.stageTime = 0;
    }
}