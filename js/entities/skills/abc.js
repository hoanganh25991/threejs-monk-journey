/**
 * ImprisonedFistsEffect.js
 * Implements the Imprisoned Fists skill effect from Diablo Immortal
 * A simplified version that moves a single cylinder in the hero's direction
 * Includes particle effects and ground indicator
 */

import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

export class ImprisonedFistsEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        
        // Movement properties
        this.moveSpeed = skill.moveSpeed || 50; // Speed at which the effect moves (default 50)
        this.targetPosition = null; // Position to move towards
        
        // Effect lifetime
        this.effectDuration = skill.duration || 3; // Total duration of the effect in seconds
        this.remainingDuration = this.effectDuration; // Remaining time for the effect
        
        // Movement tracking
        this.hasReachedTarget = false; // Flag to track if the effect has reached its target
        
        // Visual effects
        this.particleSystem = null; // Particle system for visual effect
        this.particleDirection = null; // Store the direction for particle movement
        this.groundIndicator = null; // Visual indicator on the ground
        this.startPosition = null; // Starting position for ground indicator
    }
    
    /**
     * Create the effect mesh/group
     * @param {THREE.Vector3} position - Position to create the effect at
     * @param {THREE.Vector3} direction - Direction the effect should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group to hold the effect
        const effectGroup = new THREE.Group();
        
        // Create the main effect mesh - cylinder
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 5, 12);
        geometry.rotateX(Math.PI / 2); // Rotate to align with direction
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan color for the effect
            transparent: true,
            opacity: 0.9
        });
        
        const beam = new THREE.Mesh(geometry, material);
        effectGroup.add(beam);
        
        // Create particle system for the effect
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        
        // Create particle positions
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color = new THREE.Color(0x00ffff);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position along the beam with rotation around the cylinder
            const distance = Math.random() * 5; // Length of the beam
            const angle = Math.random() * Math.PI * 2; // Random angle around the cylinder
            const radius = 0.4; // Cylinder radius
            
            // Position particles in a spiral pattern around the cylinder
            positions[i * 3] = Math.cos(angle) * radius;     // X position (rotated around cylinder)
            positions[i * 3 + 1] = Math.sin(angle) * radius; // Y position (rotated around cylinder)
            positions[i * 3 + 2] = distance;                 // Z position (along the beam)
            
            // Color (cyan with slight variations)
            colors[i * 3] = color.r * (0.8 + Math.random() * 0.2);
            colors[i * 3 + 1] = color.g * (0.8 + Math.random() * 0.2);
            colors[i * 3 + 2] = color.b * (0.8 + Math.random() * 0.2);
            
            // Size - increased for better visibility without texture
            sizes[i] = 0.2 + Math.random() * 0.3;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create particle material without texture
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
        effectGroup.add(this.particleSystem);
        
        // Create a ground indicator
        const width = this.skill.radius || 5; // Width equals the skill's radius
        const initialLength = 0.1; // Initial length is small, will grow dynamically
        
        // Create material for the ground indicator
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        // Create initial geometry
        const indicatorGeometry = new THREE.PlaneGeometry(width, initialLength);
        
        // Create the mesh
        this.groundIndicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        
        // Store the starting position for calculating the length
        this.startPosition = position.clone();
        
        // Position the indicator at the starting position
        this.groundIndicator.position.copy(position);
        
        // Initialize with identity rotation
        this.groundIndicator.rotation.set(0, 0, 0);
        
        // Add ground indicator to scene
        if (this.skill.game && this.skill.game.scene) {
            this.skill.game.scene.add(this.groundIndicator);
        }
        
        // Position the effect
        effectGroup.position.copy(position);
        
        // Store the original direction for reference
        this.originalDirection = direction.clone();
        
        // Set target position based on direction
        if (direction && direction.lengthSq() > 0) {
            this.targetPosition = new THREE.Vector3()
                .copy(direction)
                .normalize()
                .multiplyScalar(this.skill.range || 20)
                .add(position);
                
            // Create horizontal direction (XZ plane only)
            const xzDirection = new THREE.Vector3(direction.x, 0, direction.z).normalize();
            
            // Create a level target point and orient the effect
            const levelTarget = new THREE.Vector3(
                position.x + xzDirection.x,
                position.y,
                position.z + xzDirection.z
            );
            effectGroup.lookAt(levelTarget);
            
            console.debug(`Orienting in direction: (${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)})`);
            
            // Update ground indicator initial position
            this.updateGroundIndicator(position);
        }
        
        // Store the effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }
    
    /**
     * Update the ground indicator to show the path of the skill effect
     * @param {THREE.Vector3} currentPosition - Current position of the skill effect
     */
    updateGroundIndicator(currentPosition) {
        if (!this.groundIndicator || !this.startPosition || !this.effect) return;
        
        // Get the direction from the effect's orientation
        const effectDirection = new THREE.Vector3(0, 0, -1); // Forward direction in local space
        effectDirection.applyQuaternion(this.effect.quaternion); // Transform to world space
        effectDirection.normalize();
        
        // Calculate the distance from start to current position
        const distance = this.startPosition.distanceTo(currentPosition);
        
        // Calculate the midpoint between start and current position
        const midpoint = new THREE.Vector3().addVectors(this.startPosition, currentPosition).multiplyScalar(0.5);
        
        // Get terrain height at midpoint if available
        let terrainHeight = 0.1; // Default slight offset from ground
        if (this.skill.game && this.skill.game.world) {
            terrainHeight = this.skill.game.world.getTerrainHeight(midpoint.x, midpoint.z) + 0.1;
        }
        
        // Update the ground indicator's position to be at the midpoint
        midpoint.y = terrainHeight; // Set the correct height above terrain
        this.groundIndicator.position.copy(midpoint);
        
        // Update the geometry to match the new length
        // Dispose of the old geometry to prevent memory leaks
        if (this.groundIndicator.geometry) {
            this.groundIndicator.geometry.dispose();
        }
        
        // Create a new geometry with the updated length
        const width = this.skill.radius || 5; // Width equals the skill's radius
        const cylinderLength = 5; // Length of the cylinder beam
        // Length increases as the skill moves, plus half the cylinder length to cover the beam
        const length = Math.max(0.1, distance + (cylinderLength / 2));
        
        const newGeometry = new THREE.PlaneGeometry(width, length);
        this.groundIndicator.geometry = newGeometry;
        
        // Apply rotation to ensure the indicator is flat on the ground and aligned with direction
        
        // 1. Calculate the angle in the XZ plane based on the effect's direction
        const angle = Math.atan2(effectDirection.x, effectDirection.z);
        
        // 2. Set the rotation to make it flat on the ground (rotated around X) and aligned with direction (rotated around Y)
        this.groundIndicator.rotation.set(Math.PI / 2, 0, angle);
    }
    
    /**
     * Update the effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Update elapsed time (from parent class)
        this.elapsedTime += delta;
        
        // Update the skill's position property to match the effect's position (from parent class)
        if (this.isActive && this.effect) {
            this.skill.position.copy(this.effect.position);
        }
        
        // Decrement remaining duration
        this.remainingDuration -= delta;
        
        // Check if effect has expired based on our own duration
        if (this.remainingDuration <= 0) {
            this.isActive = false;
            return;
        }
        
        if (!this.isActive || !this.effect) return;
        
        // Move the effect towards the target if movement is not complete
        if (this.targetPosition && this.effect && !this.hasReachedTarget) {
            const currentPosition = this.effect.position.clone();
            const distanceToTarget = currentPosition.distanceTo(this.targetPosition);
            
            // Check if we've reached the target or are very close
            if (distanceToTarget < 0.5) {
                // We've reached the target, stop movement
                this.hasReachedTarget = true;
                console.debug(`Reached target position, remaining duration: ${this.remainingDuration.toFixed(2)}s`);
            } else {
                // Continue moving towards target
                const direction = new THREE.Vector3().subVectors(this.targetPosition, currentPosition).normalize();
                
                // Calculate movement distance for this frame
                const moveDistance = Math.min(this.moveSpeed * delta, distanceToTarget);
                
                // Calculate new position
                const newPosition = new THREE.Vector3().copy(currentPosition).add(
                    direction.multiplyScalar(moveDistance)
                );
                
                // Update effect position
                this.effect.position.copy(newPosition);
            }
        }
        
        // Update particle system
        if (this.particleSystem) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            
            // Store the particle system's world direction for consistent movement
            if (!this.particleDirection) {
                // Get the forward direction in world space
                this.particleDirection = new THREE.Vector3();
                this.effect.getWorldDirection(this.particleDirection);
                this.particleDirection.multiplyScalar(-1); // Invert if needed based on your coordinate system
            }
            
            for (let i = 0; i < positions.length; i += 3) {
                // Move particles along the beam in local space
                positions[i + 2] += delta * 5; // Increased speed for better visibility
                
                // Reset particles that reach the end
                if (positions[i + 2] > 5) {
                    positions[i + 2] = 0;
                    
                    // Create a new position around the cylinder
                    const angle = Math.random() * Math.PI * 2; // Random angle around the cylinder
                    const radius = 0.4; // Cylinder radius
                    
                    // Position particles in a spiral pattern around the cylinder
                    positions[i] = Math.cos(angle) * radius;     // X position (rotated around cylinder)
                    positions[i + 1] = Math.sin(angle) * radius; // Y position (rotated around cylinder)
                }
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update ground indicator to show the path of the skill effect
        if (this.groundIndicator && this.effect && this.isActive) {
            // Update the ground indicator to match the effect's current position
            this.updateGroundIndicator(this.effect.position);
        }
    }
    
    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        // Clean up ground indicator
        if (this.groundIndicator) {
            if (this.groundIndicator.parent) {
                this.groundIndicator.parent.remove(this.groundIndicator);
            }
            
            if (this.groundIndicator.geometry) {
                this.groundIndicator.geometry.dispose();
            }
            
            if (this.groundIndicator.material) {
                this.groundIndicator.material.dispose();
            }
            
            this.groundIndicator = null;
        }
        
        // Clean up particle system
        if (this.particleSystem) {
            if (this.particleSystem.geometry) {
                this.particleSystem.geometry.dispose();
            }
            
            if (this.particleSystem.material) {
                this.particleSystem.material.dispose();
            }
        }
        
        // Call parent dispose method
        super.dispose();
    }
    
    /**
     * Reset the effect to its initial state
     */
    reset() {
        // Reset state variables
        this.hasReachedTarget = false;
        this.targetPosition = null;
        this.particleSystem = null;
        this.particleDirection = null;
        this.groundIndicator = null;
        this.startPosition = null;
        
        // Reset duration
        this.remainingDuration = this.effectDuration;
        
        // Call parent reset method
        super.reset();
    }
}