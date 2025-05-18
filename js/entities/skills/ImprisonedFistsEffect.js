/**
 * ImprisonedFistsEffect.js
 * Implements the Imprisoned Fists skill effect from Diablo Immortal
 * The Monk strikes in a direction, dealing damage and immobilizing enemies
 */

import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

export class ImprisonedFistsEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        
        // Additional properties for this effect
        this.affectedEnemies = new Set(); // Track which enemies are affected
        this.chainMeshes = new Map(); // Store chain meshes for each enemy
        this.immobilizationEndTime = 0; // When the immobilization effect ends
        
        // Animation properties
        this.animationPhase = 'strike'; // 'strike', 'chains', 'hold'
        this.strikeDistance = 8; // How far the strike travels
        this.strikeSpeed = 15; // Speed of the strike animation
        this.strikeProgress = 0; // Progress of the strike animation (0-1)
        
        // Fist model properties
        this.fistModel = null;
        this.fistTrail = null;
        
        // Chain properties
        this.chains = [];
        this.chainCount = 6; // Number of chains to create
    }
    
    /**
     * Create the effect mesh/group
     * @param {THREE.Vector3} position - Position to create the effect at
     * @param {THREE.Vector3} direction - Direction the effect should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        console.debug(`Creating ImprisonedFistsEffect at position: ${position.x}, ${position.y}, ${position.z}`);
        
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Normalize direction
        const normalizedDirection = direction.clone().normalize();
        
        // Create the fist model
        this.createFistModel(effectGroup, normalizedDirection);
        
        // Create the trail effect
        this.createTrailEffect(effectGroup, normalizedDirection);
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        this.strikeDirection = normalizedDirection;
        this.startPosition = position.clone();
        this.targetPosition = position.clone().add(normalizedDirection.clone().multiplyScalar(this.strikeDistance));
        
        // Play sound if game reference exists
        if (this.skill.game && this.skill.game.audioManager) {
            this.skill.game.audioManager.playSound(this.skill.sounds.cast);
        }
        
        return effectGroup;
    }
    
    /**
     * Create the fist model
     * @param {THREE.Group} parent - Parent group to add the model to
     * @param {THREE.Vector3} direction - Direction the fist should face
     */
    createFistModel(parent, direction) {
        // Create a stylized fist
        const fistGroup = new THREE.Group();
        
        // Create the main fist shape
        const fistGeometry = new THREE.BoxGeometry(0.8, 0.5, 1.2);
        const fistMaterial = new THREE.MeshBasicMaterial({
            color: 0xd4af37, // Gold color
            transparent: true,
            opacity: 0.9
        });
        
        const fistMesh = new THREE.Mesh(fistGeometry, fistMaterial);
        fistGroup.add(fistMesh);
        
        // Add knuckle details
        for (let i = 0; i < 4; i++) {
            const knuckleGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            const knuckleMaterial = new THREE.MeshBasicMaterial({
                color: 0xffd700, // Brighter gold for knuckles
                transparent: true,
                opacity: 0.95
            });
            
            const knuckle = new THREE.Mesh(knuckleGeometry, knuckleMaterial);
            knuckle.position.set(-0.3 + i * 0.2, 0.2, -0.5);
            fistGroup.add(knuckle);
        }
        
        // Add glowing effect around the fist
        const glowGeometry = new THREE.SphereGeometry(1, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.scale.set(1, 0.6, 1.5);
        fistGroup.add(glowMesh);
        
        // Rotate fist to face the direction
        fistGroup.lookAt(direction);
        
        // Add to parent
        parent.add(fistGroup);
        
        // Store reference
        this.fistModel = fistGroup;
    }
    
    /**
     * Create the trail effect behind the fist
     * @param {THREE.Group} parent - Parent group to add the trail to
     * @param {THREE.Vector3} direction - Direction the trail should follow
     */
    createTrailEffect(parent, direction) {
        // Create a trail that follows behind the fist
        const trailGeometry = new THREE.BufferGeometry();
        const trailVertices = [];
        const trailColors = [];
        
        // Create a trail with fading colors
        const trailLength = 20;
        for (let i = 0; i < trailLength; i++) {
            // Position will be updated in the update method
            trailVertices.push(0, 0, 0);
            
            // Color fades from skill color to transparent
            const color = new THREE.Color(this.skill.color);
            const opacity = 1 - (i / trailLength);
            trailColors.push(color.r, color.g, color.b);
        }
        
        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
        trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));
        
        const trailMaterial = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const trail = new THREE.Points(trailGeometry, trailMaterial);
        parent.add(trail);
        
        // Store reference
        this.trailPoints = trail;
    }
    
    /**
     * Update the effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        super.update(delta);
        
        // Update based on current animation phase
        switch (this.animationPhase) {
            case 'strike':
                this.updateStrikePhase(delta);
                break;
            case 'chains':
                this.updateChainsPhase(delta);
                break;
            case 'hold':
                this.updateHoldPhase(delta);
                break;
        }
        
        // Update trail effect
        this.updateTrailEffect(delta);
        
        // Update chain effects if they exist
        this.updateChainEffects(delta);
    }
    
    /**
     * Update the strike phase animation
     * @param {number} delta - Time since last update in seconds
     */
    updateStrikePhase(delta) {
        // Progress the strike animation
        this.strikeProgress += delta * this.strikeSpeed;
        
        if (this.strikeProgress >= 1) {
            // Strike completed, transition to chains phase
            this.strikeProgress = 1;
            this.animationPhase = 'chains';
            
            // Find enemies hit by the strike
            this.findAndImmobilizeEnemies();
            
            // Create chain effects
            this.createChainEffects();
            
            // Play impact sound
            if (this.skill.game && this.skill.game.audioManager) {
                this.skill.game.audioManager.playSound(this.skill.sounds.impact);
            }
            
            return;
        }
        
        // Move the fist model along the strike path
        if (this.fistModel) {
            // Use easeOutQuad for a more natural movement
            const easeOutProgress = 1 - Math.pow(1 - this.strikeProgress, 2);
            
            // Calculate current position
            const currentPosition = new THREE.Vector3().lerpVectors(
                this.startPosition,
                this.targetPosition,
                easeOutProgress
            );
            
            // Update effect position
            this.effect.position.copy(currentPosition);
            
            // Scale up slightly during strike
            const scale = 1 + this.strikeProgress * 0.5;
            this.fistModel.scale.set(scale, scale, scale);
            
            // Update skill position for collision detection
            this.skill.position.copy(currentPosition);
        }
    }
    
    /**
     * Update the chains phase animation
     * @param {number} delta - Time since last update in seconds
     */
    updateChainsPhase(delta) {
        // Animate chains extending for a short duration (0.5 seconds)
        const chainsAnimationDuration = 0.5;
        
        if (this.elapsedTime - this.strikeProgress / this.strikeSpeed > chainsAnimationDuration) {
            // Chains animation completed, transition to hold phase
            this.animationPhase = 'hold';
            this.immobilizationEndTime = Date.now() + (this.skill.duration * 1000);
            
            // Fade out the fist model
            if (this.fistModel) {
                this.fistModel.traverse(child => {
                    if (child.material) {
                        child.material.opacity = 0.3;
                    }
                });
            }
            
            return;
        }
        
        // Animate chains extending
        const chainsProgress = Math.min(1, (this.elapsedTime - this.strikeProgress / this.strikeSpeed) / chainsAnimationDuration);
        
        this.chains.forEach(chain => {
            // Scale the chain to its target length
            chain.scale.z = chainsProgress;
            
            // Increase opacity as chains extend
            if (chain.material) {
                chain.material.opacity = chainsProgress * 0.8;
            }
        });
    }
    
    /**
     * Update the hold phase animation
     * @param {number} delta - Time since last update in seconds
     */
    updateHoldPhase(delta) {
        // Check if immobilization duration has ended
        if (Date.now() >= this.immobilizationEndTime) {
            // Release all immobilized enemies
            this.releaseAllEnemies();
            
            // Play chain break sound
            if (this.skill.game && this.skill.game.audioManager) {
                this.skill.game.audioManager.playSound(this.skill.sounds.end);
            }
            
            // Deactivate effect
            this.isActive = false;
            return;
        }
        
        // Pulse the chains
        const pulseFrequency = 2;
        const pulseAmount = 0.1;
        const pulseFactor = 1 + pulseAmount * Math.sin(this.elapsedTime * pulseFrequency);
        
        this.chains.forEach(chain => {
            if (chain.originalScale) {
                chain.scale.x = chain.originalScale.x * pulseFactor;
                chain.scale.y = chain.originalScale.y * pulseFactor;
            }
        });
        
        // Update affected enemies to ensure they stay immobilized
        this.updateAffectedEnemies();
    }
    
    /**
     * Update the trail effect
     * @param {number} delta - Time since last update in seconds
     */
    updateTrailEffect(delta) {
        if (!this.trailPoints || !this.fistModel) return;
        
        // Get current fist position
        const fistPosition = this.effect.position.clone();
        
        // Update trail positions
        const positions = this.trailPoints.geometry.attributes.position.array;
        const count = positions.length / 3;
        
        // Shift all points back
        for (let i = count - 1; i > 0; i--) {
            positions[i * 3] = positions[(i - 1) * 3];
            positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
            positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
        }
        
        // Set first point to current position
        positions[0] = fistPosition.x - this.effect.position.x;
        positions[1] = fistPosition.y - this.effect.position.y;
        positions[2] = fistPosition.z - this.effect.position.z;
        
        // Add some randomness to the trail
        for (let i = 1; i < count; i++) {
            positions[i * 3] += (Math.random() - 0.5) * 0.05;
            positions[i * 3 + 1] += (Math.random() - 0.5) * 0.05;
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.05;
        }
        
        this.trailPoints.geometry.attributes.position.needsUpdate = true;
        
        // Fade out trail during hold phase
        if (this.animationPhase === 'hold') {
            this.trailPoints.material.opacity = Math.max(0, this.trailPoints.material.opacity - delta * 0.5);
        }
    }
    
    /**
     * Find enemies in the strike path and immobilize them
     */
    findAndImmobilizeEnemies() {
        // Get reference to the game
        const game = this.skill.game;
        if (!game || !game.enemyManager) return;
        
        // Get all enemies
        const enemies = game.enemyManager.enemies;
        
        // Check each enemy
        enemies.forEach(enemy => {
            // Get enemy position
            const enemyPosition = enemy.getPosition();
            
            // Calculate distance to the strike line
            const distanceToLine = this.distanceToStrikeLine(enemyPosition);
            
            // Check if enemy is in range of the strike
            if (distanceToLine <= this.skill.radius) {
                // Deal damage to the enemy
                enemy.takeDamage(this.skill.damage);
                
                // Immobilize enemy
                this.immobilizeEnemy(enemy);
                
                // Show damage number
                if (game.effectsManager) {
                    game.effectsManager.createBleedingEffect(this.skill.damage, enemyPosition, false);
                }
            }
        });
    }
    
    /**
     * Calculate distance from a point to the strike line
     * @param {THREE.Vector3} point - The point to check
     * @returns {number} - Distance from the point to the strike line
     */
    distanceToStrikeLine(point) {
        // Create a line from start to target position
        const lineStart = this.startPosition.clone();
        const lineEnd = this.targetPosition.clone();
        
        // Calculate the closest point on the line
        const line = new THREE.Line3(lineStart, lineEnd);
        const closestPoint = new THREE.Vector3();
        line.closestPointToPoint(point, true, closestPoint);
        
        // Return the distance from the point to the closest point on the line
        return point.distanceTo(closestPoint);
    }
    
    /**
     * Immobilize an enemy
     * @param {Enemy} enemy - The enemy to immobilize
     */
    immobilizeEnemy(enemy) {
        // Add enemy to affected set
        if (!enemy.id) {
            enemy.id = Math.random().toString(36).substr(2, 9); // Generate a random ID if none exists
        }
        
        this.affectedEnemies.add(enemy.id);
        
        // Store original state
        enemy._originalState = {
            isMoving: enemy.state.isMoving,
            speed: enemy.speed
        };
        
        // Immobilize enemy
        enemy.state.isMoving = false;
        enemy.speed = 0;
        
        console.debug(`Immobilized enemy: ${enemy.name}`);
    }
    
    /**
     * Create chain effects for the skill
     */
    createChainEffects() {
        // Create chains that emanate from the impact point
        for (let i = 0; i < this.chainCount; i++) {
            // Calculate angle for this chain
            const angle = (i / this.chainCount) * Math.PI * 2;
            
            // Calculate direction
            const direction = new THREE.Vector3(
                Math.cos(angle),
                0.2, // Slight upward angle
                Math.sin(angle)
            ).normalize();
            
            // Create chain
            const chain = this.createChain(direction, 3 + Math.random() * 2); // Random length between 3-5
            
            // Add to effect group
            this.effect.add(chain);
            
            // Store chain
            this.chains.push(chain);
            
            // Store original scale for pulsing effect
            chain.originalScale = chain.scale.clone();
            
            // Initially set scale to 0 for animation
            chain.scale.z = 0;
        }
    }
    
    /**
     * Create a single chain
     * @param {THREE.Vector3} direction - Direction the chain extends in
     * @param {number} length - Length of the chain
     * @returns {THREE.Mesh} - The created chain mesh
     */
    createChain(direction, length) {
        // Create chain material with glowing effect
        const chainMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        
        // Create chain geometry
        const chainGeometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
        
        // Create chain mesh
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        
        // Position and rotate chain
        chain.position.copy(direction.clone().multiplyScalar(length / 2));
        
        // Orient the chain along the direction
        chain.lookAt(direction);
        chain.rotateX(Math.PI / 2);
        
        return chain;
    }
    
    /**
     * Update chain effects
     * @param {number} delta - Time since last update in seconds
     */
    updateChainEffects(delta) {
        // Skip if no chains
        if (this.chains.length === 0) return;
        
        // In hold phase, make chains connect to affected enemies
        if (this.animationPhase === 'hold') {
            this.updateChainsToEnemies();
        }
    }
    
    /**
     * Update chains to connect to affected enemies
     */
    updateChainsToEnemies() {
        // Get reference to the game
        const game = this.skill.game;
        if (!game || !game.enemyManager) return;
        
        // Get all enemies
        const enemies = game.enemyManager.enemies;
        
        // Get affected enemies
        const affectedEnemiesList = enemies.filter(enemy => 
            enemy.id && this.affectedEnemies.has(enemy.id)
        );
        
        // Update chains to point to enemies
        const chainsPerEnemy = Math.max(1, Math.floor(this.chains.length / Math.max(1, affectedEnemiesList.length)));
        
        affectedEnemiesList.forEach((enemy, enemyIndex) => {
            const enemyPosition = enemy.getPosition();
            const startChainIndex = enemyIndex * chainsPerEnemy;
            const endChainIndex = Math.min(startChainIndex + chainsPerEnemy, this.chains.length);
            
            for (let i = startChainIndex; i < endChainIndex; i++) {
                if (i >= this.chains.length) break;
                
                const chain = this.chains[i];
                
                // Calculate direction to enemy
                const direction = new THREE.Vector3().subVectors(
                    enemyPosition,
                    this.effect.position
                );
                
                // Update chain length to match distance to enemy
                const distance = direction.length();
                chain.scale.z = distance / chain.geometry.parameters.height;
                
                // Orient chain towards enemy
                chain.position.copy(direction.clone().normalize().multiplyScalar(distance / 2));
                chain.lookAt(direction.clone().add(this.effect.position));
                chain.rotateX(Math.PI / 2);
            }
        });
    }
    
    /**
     * Update affected enemies to ensure they stay immobilized
     */
    updateAffectedEnemies() {
        // Get reference to the game
        const game = this.skill.game;
        if (!game || !game.enemyManager) return;
        
        // Get all enemies
        const enemies = game.enemyManager.enemies;
        
        // Check each affected enemy
        enemies.forEach(enemy => {
            if (enemy.id && this.affectedEnemies.has(enemy.id)) {
                // Ensure enemy remains immobilized
                enemy.state.isMoving = false;
                enemy.speed = 0;
            }
        });
    }
    
    /**
     * Release all immobilized enemies
     */
    releaseAllEnemies() {
        // Skip if already released
        if (this.affectedEnemies.size === 0) return;
        
        // Get reference to the game
        const game = this.skill.game;
        if (!game || !game.enemyManager) return;
        
        // Get all enemies
        const enemies = game.enemyManager.enemies;
        
        // Release each affected enemy
        enemies.forEach(enemy => {
            if (enemy.id && this.affectedEnemies.has(enemy.id)) {
                this.releaseEnemy(enemy);
            }
        });
        
        // Clear affected enemies set
        this.affectedEnemies.clear();
    }
    
    /**
     * Release a specific enemy from immobilization
     * @param {Enemy} enemy - The enemy to release
     */
    releaseEnemy(enemy) {
        // Skip if enemy is not affected
        if (!enemy.id || !this.affectedEnemies.has(enemy.id)) return;
        
        // Restore original state
        if (enemy._originalState) {
            enemy.state.isMoving = enemy._originalState.isMoving;
            enemy.speed = enemy._originalState.speed;
            delete enemy._originalState;
        }
        
        // Remove from affected enemies set
        this.affectedEnemies.delete(enemy.id);
        
        console.debug(`Released enemy from immobilization: ${enemy.name}`);
    }
    
    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        // Release all immobilized enemies
        this.releaseAllEnemies();
        
        // Clear chains array
        this.chains = [];
        
        // Call parent dispose method
        super.dispose();
    }
}