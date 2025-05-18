/**
 * ImprisonedFistsEffect.js
 * Implements the Imprisoned Fists skill effect that immobilizes enemies
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
        
        // Create a visual indicator for the area of effect
        const geometry = new THREE.CylinderGeometry(this.skill.radius, this.skill.radius, 0.1, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.05; // Slightly above ground
        effectGroup.add(mesh);
        
        // Add a pulsing ring effect
        const ringGeometry = new THREE.RingGeometry(this.skill.radius - 0.1, this.skill.radius, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, material);
        ring.rotation.x = Math.PI / 2; // Lay flat on the ground
        ring.position.y = 0.1; // Slightly above the base
        effectGroup.add(ring);
        
        // Add particle effects (simple version)
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position within the radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.skill.radius;
            
            particlePositions[i * 3] = Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = Math.random() * 2; // Height between 0 and 2
            particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            transparent: true,
            opacity: 0.7
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        effectGroup.add(particles);
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        this.immobilizationEndTime = Date.now() + (this.skill.duration * 1000);
        
        // Store additional references
        this.particles = particles;
        this.ring = ring;
        this.baseMesh = mesh;
        
        return effectGroup;
    }
    
    /**
     * Update the effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect) return;
        
        super.update(delta);
        
        // Animate the ring (pulsing effect)
        if (this.ring) {
            const scale = 1 + 0.2 * Math.sin(this.elapsedTime * 5);
            this.ring.scale.set(scale, scale, 1);
        }
        
        // Animate particles (rising effect)
        if (this.particles && this.particles.geometry) {
            const positions = this.particles.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                // Move particles upward
                positions[i * 3 + 1] += delta * 0.5;
                
                // Reset particles that go too high
                if (positions[i * 3 + 1] > 2) {
                    positions[i * 3 + 1] = 0;
                }
            }
            
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Check if we need to find and immobilize enemies
        if (Date.now() < this.immobilizationEndTime) {
            this.findAndImmobilizeEnemies();
        } else {
            // Release all immobilized enemies when the effect ends
            this.releaseAllEnemies();
        }
    }
    
    /**
     * Find enemies in range and immobilize them
     */
    findAndImmobilizeEnemies() {
        // Get reference to the game
        const game = this.skill.game;
        if (!game || !game.enemyManager) return;
        
        // Get all enemies
        const enemies = game.enemyManager.enemies;
        
        // Check each enemy
        enemies.forEach(enemy => {
            // Skip if enemy is already affected
            if (this.affectedEnemies.has(enemy.id)) return;
            
            // Get enemy position
            const enemyPosition = enemy.getPosition();
            
            // Calculate distance to enemy
            const distance = this.effect.position.distanceTo(enemyPosition);
            
            // Check if enemy is in range
            if (distance <= this.skill.radius) {
                // Immobilize enemy
                this.immobilizeEnemy(enemy);
            }
        });
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
        
        // Create visual chains connecting to the enemy
        this.createChainEffect(enemy);
        
        console.debug(`Immobilized enemy: ${enemy.name}`);
    }
    
    /**
     * Create visual chain effect connecting to the enemy
     * @param {Enemy} enemy - The enemy to connect chains to
     */
    createChainEffect(enemy) {
        // Create a chain mesh connecting the effect center to the enemy
        const enemyPosition = enemy.getPosition();
        
        // Calculate direction and distance
        const direction = new THREE.Vector3().subVectors(enemyPosition, this.effect.position);
        const distance = direction.length();
        
        // Create chain material
        const chainMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.8
        });
        
        // Create chain geometry (a simple cylinder for now)
        const chainGeometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8);
        
        // Create chain mesh
        const chain = new THREE.Mesh(chainGeometry, chainMaterial);
        
        // Position and rotate chain to connect effect center to enemy
        chain.position.copy(this.effect.position);
        chain.position.add(direction.clone().multiplyScalar(0.5));
        
        // Orient the chain to point at the enemy
        chain.lookAt(enemyPosition);
        chain.rotateX(Math.PI / 2);
        
        // Add chain to scene
        if (this.effect.parent) {
            this.effect.parent.add(chain);
        }
        
        // Store chain reference
        this.chainMeshes.set(enemy.id, chain);
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
        
        // Remove chain effect
        if (this.chainMeshes.has(enemy.id)) {
            const chain = this.chainMeshes.get(enemy.id);
            if (chain.parent) {
                chain.parent.remove(chain);
            }
            
            // Dispose of geometry and material
            if (chain.geometry) chain.geometry.dispose();
            if (chain.material) chain.material.dispose();
            
            // Remove from map
            this.chainMeshes.delete(enemy.id);
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
        
        // Dispose of all chain meshes
        this.chainMeshes.forEach(chain => {
            if (chain.parent) {
                chain.parent.remove(chain);
            }
            
            if (chain.geometry) chain.geometry.dispose();
            if (chain.material) chain.material.dispose();
        });
        
        // Clear chain meshes map
        this.chainMeshes.clear();
        
        // Call parent dispose method
        super.dispose();
    }
}