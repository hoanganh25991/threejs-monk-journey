import * as THREE from 'three';

/**
 * Represents a building structure
 */
export class Building {
    /**
     * Create a new building
     * @param {number} width - Building width
     * @param {number} depth - Building depth
     * @param {number} height - Building height
     */
    constructor(width = 5, depth = 5, height = 4) {
        this.width = width;
        this.depth = depth;
        this.height = height;
    }
    
    /**
     * Create the building mesh
     * @returns {THREE.Group} - The building group
     */
    createMesh() {
        const buildingGroup = new THREE.Group();
        
        // Create wall material
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Main building structure
        const buildingGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const building = new THREE.Mesh(buildingGeometry, wallMaterial);
        building.position.y = this.height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        buildingGroup.add(building);
        
        // Create roof
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const roofGeometry = new THREE.ConeGeometry(Math.sqrt(this.width * this.width + this.depth * this.depth) / 2 + 0.5, 2, 4);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.height + 1;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        roof.receiveShadow = true;
        
        buildingGroup.add(roof);
        
        // Create door
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const doorWidth = Math.min(this.width / 3, 1.2);
        const doorHeight = Math.min(this.height / 2, 2);
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, doorHeight / 2, this.depth / 2 + 0.05);
        
        buildingGroup.add(door);
        
        // Create windows
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        
        // Add windows to front
        const frontWindowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const frontWindow1 = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow1.position.set(-this.width / 4, this.height / 2 + 0.5, this.depth / 2 + 0.05);
        
        const frontWindow2 = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow2.position.set(this.width / 4, this.height / 2 + 0.5, this.depth / 2 + 0.05);
        
        buildingGroup.add(frontWindow1);
        buildingGroup.add(frontWindow2);
        
        // Add windows to sides
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.8);
        const sideWindow1 = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        sideWindow1.position.set(this.width / 2 + 0.05, this.height / 2 + 0.5, 0);
        
        const sideWindow2 = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        sideWindow2.position.set(-this.width / 2 - 0.05, this.height / 2 + 0.5, 0);
        
        buildingGroup.add(sideWindow1);
        buildingGroup.add(sideWindow2);
        
        return buildingGroup;
    }
}