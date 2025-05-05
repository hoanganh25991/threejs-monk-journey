import * as THREE from 'three';
import { SkillEffect } from './SkillEffect.js';

/**
 * Specialized effect for multi-hit skills
 */
export class MultiSkillEffect extends SkillEffect {
    constructor(skill) {
        super(skill);
        this.multiState = null;
        this.direction = new THREE.Vector3(0, 0, 1); // Default forward direction
    }

    /**
     * Create a multi-hit effect
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Create a group for the effect
        const effectGroup = new THREE.Group();
        
        // Store the direction vector
        this.direction = direction.clone();
        
        // Create the multi-hit effect
        this._createMultiHitEffect(effectGroup, position, direction);
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Create the multi-hit effect
     * @param {THREE.Group} effectGroup - Group to add the effect to
     * @param {THREE.Vector3} position - Starting position
     * @param {THREE.Vector3} direction - Direction to face
     * @private
     */
    _createMultiHitEffect(effectGroup, position, direction) {
        // Create a multi-hit effect with multiple figures
        const figureCount = this.skill.hits || 3;
        const figures = [];
        
        // Create figures
        for (let i = 0; i < figureCount; i++) {
            const figureGroup = new THREE.Group();
            
            // Create figure body
            const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.8,
                emissive: this.skill.color,
                emissiveIntensity: 0.5
            });
            
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            figureGroup.add(body);
            
            // Create figure trail
            const trailGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
            const trailMaterial = new THREE.MeshBasicMaterial({
                color: this.skill.color,
                transparent: true,
                opacity: 0.5
            });
            
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.rotation.x = Math.PI / 2;
            trail.position.z = -0.5;
            figureGroup.add(trail);
            
            // Add particles
            const particleCount = 5;
            for (let j = 0; j < particleCount; j++) {
                const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: this.skill.color,
                    transparent: true,
                    opacity: 0.6
                });
                
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.set(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    -j * 0.2 - 0.5
                );
                
                figureGroup.add(particle);
            }
            
            // Hide initially
            figureGroup.visible = false;
            
            // Add to effect group
            effectGroup.add(figureGroup);
            figures.push(figureGroup);
        }
        
        // Store multi-hit state
        this.multiState = {
            figures: figures,
            currentFigure: -1,
            figureCount: figureCount,
            figureDelay: this.skill.duration / figureCount,
            nextFigureTime: 0
        };
    }

    /**
     * Update the multi-hit effect
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        if (!this.isActive || !this.effect || !this.multiState) return;
        
        // Ensure we have a valid direction vector
        if (!this.direction) {
            // Create a default forward direction if missing
            this.direction = new THREE.Vector3(0, 0, 1);
        }
        
        this.elapsedTime += delta;
        
        // Check if effect has expired
        if (this.elapsedTime >= this.skill.duration) {
            this.isActive = false;
            return;
        }
        
        // Update multi-hit state
        if (this.elapsedTime >= this.multiState.nextFigureTime) {
            // Deactivate previous figure
            if (this.multiState.currentFigure >= 0) {
                this.multiState.figures[this.multiState.currentFigure].visible = false;
            }
            
            // Activate next figure
            this.multiState.currentFigure++;
            if (this.multiState.currentFigure < this.multiState.figureCount) {
                // Show next figure
                this.multiState.figures[this.multiState.currentFigure].visible = true;
                
                // Set time for next figure
                this.multiState.nextFigureTime = (this.multiState.currentFigure + 1) * this.multiState.figureDelay;
                
                // Move figure forward
                const figure = this.multiState.figures[this.multiState.currentFigure];
                const distance = this.skill.range * (this.multiState.currentFigure / this.multiState.figureCount);
                
                figure.position.set(
                    this.direction.x * distance,
                    0,
                    this.direction.z * distance
                );
            }
        }
        
        // Animate active figure
        if (this.multiState.currentFigure >= 0 && this.multiState.currentFigure < this.multiState.figureCount) {
            const figure = this.multiState.figures[this.multiState.currentFigure];
            
            // Move figure forward
            figure.position.x += this.direction.x * 10 * delta;
            figure.position.z += this.direction.z * 10 * delta;
            
            // Rotate figure
            figure.rotation.y += 5 * delta;
            
            // Pulse effect
            const pulse = 1 + Math.sin(this.elapsedTime * 10) * 0.2;
            figure.scale.set(pulse, pulse, pulse);
        }
    }
}