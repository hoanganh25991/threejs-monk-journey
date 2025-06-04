import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator.js';
import { ZONE_COLORS } from '../../config/colors.js';

/**
 * Manages terrain templates and texture caching
 */
export class TerrainTemplateManager {
    constructor() {
        // Cache for terrain templates by zone type
        this.terrainTemplates = {};
        
        // Cache for generated textures by color
        this.textureCache = {};
    }

    /**
     * Create or get a cached texture for terrain
     * @param {number} baseColorHex - Base color for the texture
     * @param {number} secondaryColorHex - Secondary color for the texture
     * @returns {THREE.Texture} - The texture
     */
    getOrCreateTexture(baseColorHex, secondaryColorHex) {
        // Create a unique key for this texture combination
        const textureKey = `${baseColorHex.toString(16)}_${secondaryColorHex.toString(16)}`;
        
        // Return cached texture if it exists
        if (this.textureCache[textureKey]) {
            return this.textureCache[textureKey];
        }
        
        // Create new texture and cache it
        const texture = TextureGenerator.createProceduralTexture(baseColorHex, secondaryColorHex, 512);
        this.textureCache[textureKey] = texture;
        
        return texture;
    }

    /**
     * Create or get a cached terrain template for a zone type
     * @param {string} zoneType - The zone type
     * @param {number} size - Size of the terrain
     * @param {number} resolution - Resolution of the terrain
     * @returns {Object} - Template with geometry and material
     */
    getOrCreateTerrainTemplate(zoneType, size, resolution) {
        // Create a unique key for this template
        const templateKey = `${zoneType}_${size}_${resolution}`;
        
        // Return cached template if it exists
        if (this.terrainTemplates[templateKey]) {
            return this.terrainTemplates[templateKey];
        }
        
        // Create new template
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            size,
            size,
            resolution,
            resolution
        );
        
        // Compute vertex normals for proper lighting
        geometry.computeVertexNormals();
        
        // Get colors from the config based on zone type
        const zoneColors = ZONE_COLORS[zoneType] || ZONE_COLORS['Terrant'] || ZONE_COLORS['Forest'];
        
        // Create terrain material with appropriate base color
        // For Terrant, use soil color; for others, use appropriate ground color
        let baseColorHex = 0x4a9e4a; // Default grass color
        
        if (zoneType === 'Terrant') {
            baseColorHex = zoneColors.soil;
        } else if (zoneColors.ground) {
            baseColorHex = zoneColors.ground;
        }
        
        // Create procedural texture based on zone colors
        const secondaryColorHex = zoneType === 'Terrant' ? 
            zoneColors.rock : // Use rock as secondary color for Terrant
            (baseColorHex === 0x4a9e4a ? 0x3a7a3a : baseColorHex * 0.8); // Darker version of base color
            
        // Get or create texture
        const terrainTexture = this.getOrCreateTexture(baseColorHex, secondaryColorHex);
        
        // Create terrain material with texture
        const material = new THREE.MeshStandardMaterial({
            map: terrainTexture,
            roughness: 0.8,
            metalness: 0.2,
            vertexColors: true
        });
        
        // Store template
        this.terrainTemplates[templateKey] = {
            geometry: geometry,
            material: material,
            zoneType: zoneType
        };
        
        return this.terrainTemplates[templateKey];
    }

    /**
     * Clear all cached templates and textures
     */
    clear() {
        // Dispose of cached textures
        for (const textureKey in this.textureCache) {
            const texture = this.textureCache[textureKey];
            if (texture) {
                texture.dispose();
            }
        }
        
        // Dispose of cached templates
        for (const templateKey in this.terrainTemplates) {
            const template = this.terrainTemplates[templateKey];
            if (template) {
                if (template.geometry) {
                    template.geometry.dispose();
                }
                if (template.material) {
                    template.material.dispose();
                }
            }
        }
        
        // Reset caches
        this.textureCache = {};
        this.terrainTemplates = {};
    }
}