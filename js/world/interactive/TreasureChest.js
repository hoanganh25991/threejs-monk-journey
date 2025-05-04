import * as THREE from 'three';

/**
 * Represents a treasure chest interactive object
 */
export class TreasureChest {
    /**
     * Create a new treasure chest
     */
    constructor() {
        this.isOpen = false;
        this.lid = null;
    }
    
    /**
     * Create the treasure chest mesh
     * @returns {THREE.Group} - The treasure chest group
     */
    createMesh() {
        const chestGroup = new THREE.Group();
        
        // Create chest base
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const baseGeometry = new THREE.BoxGeometry(1.5, 1, 1);
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        
        chestGroup.add(base);
        
        // Create chest lid
        const lidGeometry = new THREE.BoxGeometry(1.5, 0.5, 1);
        const lid = new THREE.Mesh(lidGeometry, baseMaterial);
        lid.position.y = 1.25;
        lid.castShadow = true;
        lid.receiveShadow = true;
        
        chestGroup.add(lid);
        this.lid = lid;
        
        // Create metal details
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            roughness: 0.3,
            metalness: 0.8
        });
        
        // Create lock
        const lockGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const lock = new THREE.Mesh(lockGeometry, metalMaterial);
        lock.position.set(0, 1, 0.55);
        
        chestGroup.add(lock);
        
        return chestGroup;
    }
    
    /**
     * Open the chest
     * @param {THREE.Group} chestGroup - The chest group to open (optional)
     */
    open(chestGroup) {
        // If a chest group is provided, find the lid
        if (chestGroup) {
            // Find the lid (second child)
            if (chestGroup.children.length > 1) {
                this.lid = chestGroup.children[1];
            }
        }
        
        // Rotate lid to open
        if (this.lid) {
            this.lid.rotation.x = -Math.PI / 3;
        }
        
        this.isOpen = true;
    }
}