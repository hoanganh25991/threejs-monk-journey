import * as THREE from 'three';

/**
 * Base class for all skill effects
 * Provides common functionality for creating and updating skill effects
 */
export class SkillEffect {
    constructor(skill) {
        this.skill = skill;
        this.effect = null;
        this.isActive = false;
        this.elapsedTime = 0;
    }

    /**
     * Utility method to validate vector values
     * @param {THREE.Vector3} vector - The vector to validate
     * @returns {boolean} - Whether the vector is valid
     */
    validateVector(vector) {
        if (!vector) return false;
        
        // Check if any component is NaN or infinite
        if (isNaN(vector.x) || isNaN(vector.y) || isNaN(vector.z) ||
            !isFinite(vector.x) || !isFinite(vector.y) || !isFinite(vector.z)) {
            console.warn("Invalid vector detected:", vector);
            return false;
        }
        
        return true;
    }

    /**
     * Create the effect mesh/group
     * @param {THREE.Vector3} position - Position to create the effect at
     * @param {THREE.Vector3} direction - Direction the effect should face
     * @returns {THREE.Group} - The created effect
     */
    create(position, direction) {
        // Base implementation creates a simple effect
        const effectGroup = new THREE.Group();
        
        // Create a simple mesh
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: this.skill.color,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        effectGroup.add(mesh);
        
        // Position effect
        effectGroup.position.copy(position);
        
        // Store effect
        this.effect = effectGroup;
        this.isActive = true;
        
        return effectGroup;
    }

    /**
     * Update the effect
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
        
        // IMPORTANT: Update the skill's position property to match the effect's position
        // This is crucial for collision detection in CollisionManager
        this.skill.position.copy(this.effect.position);
        
        // Basic rotation animation
        if (this.effect.rotation) {
            this.effect.rotation.y += delta;
        }
    }

    /**
     * Dispose of the effect and clean up resources
     */
    dispose() {
        if (!this.effect) return;
        
        // Recursively dispose of geometries and materials
        this.effect.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        // Remove from parent
        if (this.effect.parent) {
            this.effect.parent.remove(this.effect);
        }
        
        this.effect = null;
        this.isActive = false;
    }
    
    /**
     * Reset the effect to its initial state
     * This allows the effect to be reused without creating a new instance
     */
    reset() {
        // Dispose of any existing effect
        this.dispose();
        
        // Reset state variables
        this.isActive = false;
        this.elapsedTime = 0;
        
        // Additional reset logic can be added in derived classes
    }
}