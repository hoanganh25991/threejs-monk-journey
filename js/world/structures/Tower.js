import * as THREE from 'three';

/**
 * Represents a tower structure
 */
export class Tower {
    /**
     * Create a new tower
     */
    constructor() {
        // Randomize tower properties
        this.random = Math.random;
        this.height = 10 + this.random() * 15; // Tower height between 10-25 units
        this.radius = 2 + this.random() * 3; // Tower radius between 2-5 units
        this.segments = Math.floor(6 + this.random() * 6); // Tower segments between 6-12
    }
    
    /**
     * Create the tower mesh
     * @returns {THREE.Group} - The tower group
     */
    createMesh() {
        const towerGroup = new THREE.Group();
        
        // Randomize tower color (stone variations)
        const colorVariation = this.random() * 0.2 - 0.1;
        const baseColor = new THREE.Color(0.5 + colorVariation, 0.5 + colorVariation, 0.5 + colorVariation);
        
        // Create tower base (cylinder)
        const towerGeometry = new THREE.CylinderGeometry(this.radius, this.radius * 1.2, this.height, this.segments);
        const towerMaterial = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.8,
            metalness: 0.2
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = this.height / 2;
        tower.castShadow = true;
        tower.receiveShadow = true;
        
        towerGroup.add(tower);
        
        // Create tower roof (cone)
        const roofHeight = this.height * 0.3;
        const roofGeometry = new THREE.ConeGeometry(this.radius * 1.2, roofHeight, this.segments);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.3, 0.1, 0.1), // Reddish roof
            roughness: 0.7,
            metalness: 0.3
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = this.height + roofHeight / 2;
        roof.castShadow = true;
        
        towerGroup.add(roof);
        
        // Add windows
        const windowCount = Math.floor(3 + this.random() * 3); // 3-6 windows
        const windowHeight = this.height / (windowCount + 1);
        
        for (let i = 1; i <= windowCount; i++) {
            const windowGeometry = new THREE.BoxGeometry(1, 1, 0.5);
            const windowMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffaa,
                emissive: 0xffffaa,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.8
            });
            
            // Create windows around the tower
            for (let j = 0; j < this.segments; j += 2) {
                const angle = (j / this.segments) * Math.PI * 2;
                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                
                windowMesh.position.set(
                    Math.sin(angle) * (this.radius - 0.1),
                    i * windowHeight,
                    Math.cos(angle) * (this.radius - 0.1)
                );
                windowMesh.rotation.y = angle + Math.PI / 2;
                
                towerGroup.add(windowMesh);
            }
        }
        
        // Add a flag at the top (optional, based on random chance)
        if (this.random() > 0.5) {
            const flagpoleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
            const flagpoleMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.5,
                metalness: 0.5
            });
            const flagpole = new THREE.Mesh(flagpoleGeometry, flagpoleMaterial);
            flagpole.position.y = this.height + roofHeight + 1.5;
            
            towerGroup.add(flagpole);
            
            // Create flag
            const flagGeometry = new THREE.PlaneGeometry(2, 1);
            const flagColor = new THREE.Color(
                this.random(), 
                this.random(), 
                this.random()
            );
            const flagMaterial = new THREE.MeshStandardMaterial({
                color: flagColor,
                side: THREE.DoubleSide
            });
            const flag = new THREE.Mesh(flagGeometry, flagMaterial);
            flag.position.set(1, this.height + roofHeight + 2, 0);
            flag.rotation.y = Math.PI / 2;
            
            towerGroup.add(flag);
        }
        
        return towerGroup;
    }
}