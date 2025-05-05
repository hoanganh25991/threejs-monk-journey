import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for wave-based skills
 */
export class WaveSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.waveSpeed = 10; // Units per second
        this.waveWidth = 3.0;
        this.waveHeight = 1.5;
        this.initialPosition = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.distanceTraveled = 0;
        this.bellCreated = false;
        
        // Get radius from skill or set default
        this.radius = skill && skill.radius ? skill.radius : 2.0;
        this.color = skill && skill.color ? skill.color : 0xffffff;
        this.range = skill && skill.range ? skill.range : 10.0;
        this.game = skill ? skill.game : null;
    }

    /**
     * Create a wave effect
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to travel
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store initial position and direction for movement
        this.initialPosition.copy(position);
        this.direction.copy(direction);
        this.distanceTraveled = 0;
        
        // Check if this is the Wave of Light skill (bell)
        this.createWaveEffect(effectGroup);
        
        // Position effect
        effectGroup.position.copy(position);
        effectGroup.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the bell effect for Wave of Light
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @private
     */
    createWaveEffect(effectGroup) {
        // Ensure radius is valid
        const safeRadius = isNaN(this.radius) || this.radius <= 0 ? 2.0 : this.radius;
        
        // Configuration for bell size and appearance
        const config = {
            bellSizeMultiplier: safeRadius / 5,  // Adjust this value to change the overall bell size
            bellHeight: 8,            // Height above the ground
            bellColor: 0xFFD700,      // Gold color for the bell
            bellOpacity: 0.9,         // Bell transparency
            bellMetalness: 0.8,       // Bell metallic appearance
            bellRoughness: 0.2,       // Bell surface roughness
            strikerColor: 0xAA7722    // Color of the striker inside the bell
        };
        
        // Create the bell - using a combination of shapes to form a bell
        const bellGroup = new THREE.Group();
        
        // Apply size multiplier to all dimensions
        const bellTopRadius = 1.2 * config.bellSizeMultiplier;
        const bellBottomRadius = 2 * config.bellSizeMultiplier;
        const bellHeight = 2.5 * config.bellSizeMultiplier;
        const bellRimRadius = 2 * config.bellSizeMultiplier;
        const bellRimThickness = 0.2 * config.bellSizeMultiplier;
        const strikerRadius = 0.3 * config.bellSizeMultiplier;
        
        // Bell top (dome)
        const bellTopGeometry = new THREE.SphereGeometry(bellTopRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bellMaterial = new THREE.MeshStandardMaterial({
            color: config.bellColor,
            metalness: config.bellMetalness,
            roughness: config.bellRoughness,
            transparent: true,
            opacity: config.bellOpacity
        });
        
        const bellTop = new THREE.Mesh(bellTopGeometry, bellMaterial);
        bellTop.position.y = bellHeight;
        bellGroup.add(bellTop);
        
        // Bell body (inverted cone)
        const bellBodyGeometry = new THREE.CylinderGeometry(bellTopRadius, bellBottomRadius, bellHeight, 16, 1, true);
        const bellBody = new THREE.Mesh(bellBodyGeometry, bellMaterial);
        bellBody.position.y = bellHeight/2;
        bellGroup.add(bellBody);
        
        // Bell rim (torus)
        const bellRimGeometry = new THREE.TorusGeometry(bellRimRadius, bellRimThickness, 16, 32);
        const bellRim = new THREE.Mesh(bellRimGeometry, bellMaterial);
        bellRim.position.y = 0;
        bellRim.rotation.x = Math.PI / 2;
        bellGroup.add(bellRim);
        
        // Bell striker (small sphere inside)
        const strikerGeometry = new THREE.SphereGeometry(strikerRadius, 8, 8);
        const strikerMaterial = new THREE.MeshStandardMaterial({
            color: config.strikerColor,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const striker = new THREE.Mesh(strikerGeometry, strikerMaterial);
        striker.position.y = bellHeight * 0.32; // Position striker proportionally to bell size
        bellGroup.add(striker);
        
        // Position the bell above the player
        bellGroup.position.y = config.bellHeight;
        
        // Add bell to effect group
        effectGroup.add(bellGroup);
        
        // Create impact area (circle on the ground)
        // Ensure we have valid values for radius calculation
        const safeMultiplier = isNaN(config.bellSizeMultiplier) || config.bellSizeMultiplier <= 0 ? 0.4 : config.bellSizeMultiplier;
        const impactRadius = safeRadius * safeMultiplier; // Scale impact area with bell size
        const safeImpactRadius = isNaN(impactRadius) || impactRadius <= 0 ? 1.0 : impactRadius;
        
        const impactGeometry = new THREE.CircleGeometry(safeImpactRadius, 32);
        const impactMaterial = new THREE.MeshBasicMaterial({
            color: this.color || 0xffffff, // Ensure color is valid
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const impactArea = new THREE.Mesh(impactGeometry, impactMaterial);
        impactArea.rotation.x = -Math.PI / 2;
        impactArea.position.y = 0.05;
        
        // Add impact area to effect group
        effectGroup.add(impactArea);
        
        // Create light rays emanating from impact point
        const rayCount = 8;
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            
            // Use the already validated safe radius
            const rayThickness = Math.max(0.1, 0.2 * safeMultiplier); // Ensure positive thickness
            const rayGeometry = new THREE.BoxGeometry(rayThickness, rayThickness, safeImpactRadius);
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: this.color || 0xffffff, // Ensure color is valid
                transparent: true,
                opacity: 0.5
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.set(
                Math.cos(angle) * (safeImpactRadius / 2),
                0.2,
                Math.sin(angle) * (safeImpactRadius / 2)
            );
            
            ray.rotation.y = angle;
            
            effectGroup.add(ray);
        }
        
        // Create particles for visual effect
        const safeParticleMultiplier = Math.max(0.1, safeMultiplier);
        const particleCount = Math.max(5, Math.floor(30 * safeParticleMultiplier)); // Ensure at least 5 particles
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * safeImpactRadius;
            
            const particleSize = Math.max(0.05, 0.1 * safeParticleMultiplier); // Ensure minimum size
            const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: this.color || 0xffffff, // Ensure color is valid
                transparent: true,
                opacity: 0.7
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                Math.cos(angle) * radius,
                Math.random() * 0.5,
                Math.sin(angle) * radius
            );
            
            effectGroup.add(particle);
        }
        
        // Check if we have a game reference and can find a target enemy
        let targetPosition = null;
        
        if (this.game && this.game.enemyManager) {
            // Try to find the nearest enemy within the skill's range
            const nearestEnemy = this.game.enemyManager.findNearestEnemy(this.initialPosition, this.range);
            
            if (nearestEnemy) {
                // Get enemy position
                const enemyPosition = nearestEnemy.getPosition();
                
                // Calculate direction to enemy
                const direction = new THREE.Vector3().subVectors(enemyPosition, this.initialPosition).normalize();
                
                // Calculate target position (at the enemy's location)
                targetPosition = new THREE.Vector3(
                    enemyPosition.x,
                    this.initialPosition.y, // Keep the same Y height as the player
                    enemyPosition.z
                );
                
                // Move the effect group to the target position
                effectGroup.position.copy(targetPosition);
                
                console.log(`Wave of Light targeting enemy at position: ${targetPosition.x}, ${targetPosition.z}`);
                
                // Show notification if UI manager is available
                if (this.game.player && this.game.player.game && this.game.player.game.uiManager) {
                    this.game.player.game.uiManager.showNotification(`Wave of Light targeting ${nearestEnemy.type}`);
                }
            } else {
                console.log('No enemy in range for Wave of Light, dropping bell at current position');
            }
        }
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        // Store animation state with configuration and target position
        this.bellState = {
            phase: 'descending', // 'descending', 'impact', 'ascending'
            initialHeight: config.bellHeight,
            impactTime: 0,
            config: config, // Store config for use in update method
            targetPosition: targetPosition // Store the target position if an enemy was found
        };
        
        return effectGroup;
    }

    /**
     * Update the wave effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        try {
            this.elapsedTime += delta;
            
            // Check if effect has expired
            if (this.elapsedTime >= this.skill.duration) {
                this.isActive = false;
                return;
            }
            
            // Handle different updates based on effect type
            this.updateWaveEffect(delta);
        } catch (error) {
            console.error(`Error updating effect: ${error.message}`);

            // Mark as inactive to prevent further errors
            this.isActive = false;
        }
    }

    /**
     * Update the bell animation for Wave of Light
     * @param {number} delta - Time since last update in seconds
     * @private
     */
    updateWaveEffect(delta) {
        // Get bell group (first child of effect group)
        const bellGroup = this.effect.children[0];
        
        // Get impact area (second child of effect group)
        const impactArea = this.effect.children[1];
        
        // Get config from bell state
        const config = this.bellState.config || {
            bellSizeMultiplier: 2.0,
            bellHeight: 8
        };
        
        // Animation phases for the bell
        switch (this.bellState.phase) {
            case 'descending':
                // Bell descends from the sky
                const descentSpeed = 15 * Math.sqrt(config.bellSizeMultiplier); // Scale speed with bell size
                bellGroup.position.y -= descentSpeed * delta;
                
                // When bell reaches near ground level, switch to impact phase
                const groundClearance = 0.5 * config.bellSizeMultiplier;
                if (bellGroup.position.y <= groundClearance) {
                    bellGroup.position.y = groundClearance; // Ensure bell doesn't go below ground
                    this.bellState.phase = 'impact';
                    this.bellState.impactTime = 0;
                    
                    // Make impact area visible and expand it
                    impactArea.material.opacity = 0.7;
                    impactArea.scale.set(0.1, 0.1, 0.1); // Start small
                }
                break;
                
            case 'impact':
                // Bell impact phase - create shockwave and visual effects
                this.bellState.impactTime += delta;
                
                // Expand impact area - scale with bell size
                const expansionSpeed = 5 * Math.sqrt(config.bellSizeMultiplier);
                const maxScale = 1.5 * config.bellSizeMultiplier;
                const currentScale = Math.min(this.bellState.impactTime * expansionSpeed, maxScale);
                impactArea.scale.set(currentScale, currentScale, currentScale);
                
                // Fade impact area as it expands
                impactArea.material.opacity = 0.7 * (1 - (currentScale / maxScale));
                
                // Make bell vibrate during impact - scale vibration with bell size
                const vibrationIntensity = 0.2 * config.bellSizeMultiplier * (1 - (this.bellState.impactTime / 0.5));
                bellGroup.rotation.z = Math.sin(this.bellState.impactTime * 40) * vibrationIntensity;
                
                // Animate light rays
                for (let i = 2; i < 2 + 8; i++) { // Rays are children 2-9
                    if (this.effect.children[i]) {
                        const ray = this.effect.children[i];
                        ray.scale.z = 1 + Math.sin(this.bellState.impactTime * 10) * 0.5 * config.bellSizeMultiplier;
                        ray.material.opacity = 0.5 * (1 - (this.bellState.impactTime / 0.5));
                    }
                }
                
                // After impact time, switch to ascending phase
                if (this.bellState.impactTime >= 0.5) {
                    this.bellState.phase = 'ascending';
                }
                break;
                
            case 'ascending':
                // Bell ascends back to the sky - scale speed with bell size
                const ascentSpeed = 10 * Math.sqrt(config.bellSizeMultiplier);
                bellGroup.position.y += ascentSpeed * delta;
                
                // Gradually fade out the bell as it ascends
                if (bellGroup.children.length > 0) {
                    for (let i = 0; i < bellGroup.children.length; i++) {
                        const part = bellGroup.children[i];
                        if (part.material) {
                            part.material.opacity = Math.max(0, part.material.opacity - delta);
                        }
                    }
                }
                
                // Fade out impact area and rays
                impactArea.material.opacity = Math.max(0, impactArea.material.opacity - delta);
                
                for (let i = 2; i < 2 + 8; i++) { // Rays are children 2-9
                    if (this.effect.children[i]) {
                        const ray = this.effect.children[i];
                        ray.material.opacity = Math.max(0, ray.material.opacity - delta);
                    }
                }
                
                // Animate particles (last children of effect group)
                for (let i = 2 + 8; i < this.effect.children.length; i++) {
                    const particle = this.effect.children[i];
                    
                    // Move particles outward and upward - scale movement with bell size
                    const directionToCenter = new THREE.Vector3(
                        particle.position.x,
                        0,
                        particle.position.z
                    ).normalize();
                    
                    particle.position.x += directionToCenter.x * delta * 2 * config.bellSizeMultiplier;
                    particle.position.z += directionToCenter.z * delta * 2 * config.bellSizeMultiplier;
                    particle.position.y += delta * 3 * config.bellSizeMultiplier;
                    
                    // Fade out particles
                    particle.material.opacity = Math.max(0, particle.material.opacity - delta);
                }
                break;
        }
    }
    
    /**
     * Reset the wave effect to its initial state
     * Overrides the base class reset method to handle wave-specific state
     */
    reset() {
        // Call the parent class reset method first
        super.reset();
        
        // Reset wave-specific properties
        this.distanceTraveled = 0;
        this.bellCreated = false;
        this.initialPosition = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Reset bell state if it exists
        if (this.bellState) {
            this.bellState = {
                phase: 'descending',
                initialHeight: this.bellState.config ? this.bellState.config.bellHeight : 8,
                impactTime: 0,
                config: this.bellState.config,
                targetPosition: null
            };
        }
    }
}