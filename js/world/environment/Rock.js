import * as THREE from 'three';

/**
 * Represents a rock environment object
 */
export class Rock {
    /**
     * Create a new rock
     */
    constructor() {
        // Randomize rock properties
        this.random = Math.random;
        this.size = 0.5 + this.random() * 1.5; // Rock size between 0.5-2 units
    }
    
    /**
     * Create the rock mesh
     * @returns {THREE.Group} - The rock group
     */
    createMesh() {
        const rockGroup = new THREE.Group();
        
        // Create rock
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.2
        });
        
        // Use a dodecahedron for a more natural rock shape
        const rockGeometry = new THREE.DodecahedronGeometry(this.size, 0);
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.y = this.size / 2;
        
        // Add some random rotation to make it look more natural
        rock.rotation.x = this.random() * Math.PI;
        rock.rotation.y = this.random() * Math.PI;
        rock.rotation.z = this.random() * Math.PI;
        
        // Add some random scaling to make it look more natural
        rock.scale.set(
            0.8 + this.random() * 0.4,
            0.8 + this.random() * 0.4,
            0.8 + this.random() * 0.4
        );
        
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        rockGroup.add(rock);
        
        return rockGroup;
    }
}