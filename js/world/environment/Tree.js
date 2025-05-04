import * as THREE from 'three';

/**
 * Represents a tree environment object
 */
export class Tree {
    /**
     * Create a new tree
     */
    constructor() {
        // Randomize tree properties
        this.random = Math.random;
        this.trunkHeight = 2 + this.random() * 1; // Trunk height between 2-3 units
        this.trunkRadius = 0.3 + this.random() * 0.2; // Trunk radius between 0.3-0.5 units
        this.foliageSize = 1.5 + this.random() * 0.5; // Foliage size between 1.5-2 units
    }
    
    /**
     * Create the tree mesh
     * @returns {THREE.Group} - The tree group
     */
    createMesh() {
        const treeGroup = new THREE.Group();
        
        // Create trunk
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const trunkGeometry = new THREE.CylinderGeometry(this.trunkRadius, this.trunkRadius * 1.2, this.trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = this.trunkHeight / 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        treeGroup.add(trunk);
        
        // Create foliage
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d572c,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create multiple layers of foliage for a more realistic look
        const foliageLayers = 2 + Math.floor(this.random() * 2); // 2-3 layers
        
        for (let i = 0; i < foliageLayers; i++) {
            const layerSize = this.foliageSize * (1 - i * 0.15); // Each layer is slightly smaller
            const layerHeight = this.trunkHeight + i * this.foliageSize * 0.5;
            
            const foliageGeometry = new THREE.ConeGeometry(layerSize, this.foliageSize, 8);
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = layerHeight;
            foliage.castShadow = true;
            
            treeGroup.add(foliage);
        }
        
        return treeGroup;
    }
}