import * as THREE from 'three';
import { ZONE_COLORS } from '../../config/colors.js';

/**
 * Manages terrain coloring and zone-based styling
 */
export class TerrainColoringManager {
    constructor() {
        // No state needed for this utility class
    }

    /**
     * Apply consistent terrain coloring based on zone type with minimal variation
     * @param {THREE.Mesh} terrain - The terrain mesh to color
     * @param {string} zoneType - The type of zone (Forest, Desert, etc.)
     */
    colorTerrainUniform(terrain, zoneType = 'Terrant') {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        // Get colors from the config based on zone type
        const zoneColors = ZONE_COLORS[zoneType] || ZONE_COLORS['Terrant'];
        
        // Define base colors for each zone type
        let baseColorHex;
        switch (zoneType) {
            case 'Terrant':
                baseColorHex = zoneColors.soil;
                break;
            case 'Forest':
                baseColorHex = zoneColors.ground;
                break;
            case 'Desert':
                baseColorHex = zoneColors.sand;
                break;
            case 'Mountains':
                baseColorHex = zoneColors.rock;
                break;
            case 'Swamp':
                baseColorHex = zoneColors.vegetation;
                break;
            default:
                baseColorHex = zoneColors.soil || 0x8B4513;
        }
        
        // Create base color
        const baseColor = new THREE.Color(baseColorHex);
        
        // Use terrain position for consistent variation across chunks
        const terrainX = terrain.position.x;
        const terrainZ = terrain.position.z;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Get vertex position
            const x = positions[i] + terrainX;
            const z = positions[i + 2] + terrainZ;
            
            // Very subtle variation for consistency across large areas
            // Use larger scale for smoother transitions
            const variation = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 0.02;
            
            // Apply minimal variation to maintain consistency
            const color = new THREE.Color(
                Math.max(0, Math.min(1, baseColor.r + variation)),
                Math.max(0, Math.min(1, baseColor.g + variation)),
                Math.max(0, Math.min(1, baseColor.b + variation))
            );
            
            colors.push(color.r, color.g, color.b);
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
}