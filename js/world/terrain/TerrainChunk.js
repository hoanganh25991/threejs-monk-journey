import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator.js';

/**
 * Represents a single terrain chunk
 */
export class TerrainChunk {
    /**
     * Create a new terrain chunk
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @param {number} size - Size of the chunk
     * @param {number} resolution - Resolution of the chunk
     */
    constructor(chunkX, chunkZ, size = 100, resolution = 16) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.size = size;
        this.resolution = resolution;
        this.mesh = null;
        this.worldX = chunkX * size;
        this.worldZ = chunkZ * size;
        this.key = `${chunkX},${chunkZ}`;
    }
    
    /**
     * Create the terrain mesh
     * @returns {THREE.Mesh} - The terrain mesh
     */
    createMesh() {
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            this.resolution,
            this.resolution
        );
        
        // Create terrain material with lighter green color
        const grassTexture = TextureGenerator.createProceduralTexture(0x4a9e4a, 0x3a7a3a, 512);
        
        // Create terrain material with grass texture
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.2,
            vertexColors: true
        });
        
        // Create terrain mesh
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        
        // CRITICAL FIX: Ensure both receiveShadow and castShadow are set to true
        terrain.receiveShadow = true;
        terrain.castShadow = true;
        
        // Apply uniform grass coloring with slight variations
        this.colorTerrainUniform(terrain);
        
        // Position the terrain chunk - ensure y=0 exactly to prevent vibration
        terrain.position.set(
            this.worldX + this.size / 2,
            0,
            this.worldZ + this.size / 2
        );
        
        this.mesh = terrain;
        return terrain;
    }
    
    /**
     * Apply uniform coloring to terrain with slight variations
     * @param {THREE.Mesh} terrain - The terrain mesh to color
     */
    colorTerrainUniform(terrain) {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Use lighter grass color with slight variations
            const baseColor = new THREE.Color(0x4a9e4a); // Lighter base grass color
            
            // Add some variation to make the grass look more natural
            const variation = Math.random() * 0.1 - 0.05;
            const color = new THREE.Color(
                Math.max(0, Math.min(1, baseColor.r + variation)),
                Math.max(0, Math.min(1, baseColor.g + variation)),
                Math.max(0, Math.min(1, baseColor.b + variation))
            );
            
            colors.push(color.r, color.g, color.b);
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    /**
     * Dispose of the terrain chunk resources
     */
    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(material => material.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
        }
    }
    
    /**
     * Get the terrain height at a specific local position
     * @param {number} localX - Local X coordinate within the chunk
     * @param {number} localZ - Local Z coordinate within the chunk
     * @returns {number} - The height of the terrain at the specified position
     */
    getHeight(localX, localZ) {
        // Always return 0 for flat terrain
        return 0;
    }
}