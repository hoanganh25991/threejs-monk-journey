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
     * Apply terrain coloring based on zone type with natural variations
     * @param {THREE.Mesh} terrain - The terrain mesh to color
     * @param {string} zoneType - The type of zone (Forest, Desert, etc.)
     */
    colorTerrainUniform(terrain, zoneType = 'Terrant') {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        // Get colors from the config based on zone type
        // Default to Terrant colors if specified or fall back to Forest
        const zoneColors = ZONE_COLORS[zoneType] || ZONE_COLORS['Terrant'] || ZONE_COLORS['Forest'];
        
        // For Terrant, use soil as the primary color, no green mixing
        let baseColorHex = zoneType === 'Terrant' ? zoneColors.soil : 0x4a9e4a;
        
        // Create deterministic noise patterns for natural variation
        // Use a fixed seed based on chunk position to prevent flickering
        const noiseScale = 0.05;
        const noiseOffset = terrain.position.x * 0.01 + terrain.position.z * 0.01;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Get vertex position for noise calculation
            const x = positions[i];
            const z = positions[i + 2];
            
            // Base color from zone type
            let baseColor = new THREE.Color(baseColorHex);
            
            // For Terrant, add more variety with multiple soil tones, but NO vegetation
            if (zoneType === 'Terrant') {
                // Use deterministic noise pattern for natural variation
                const noiseValue = Math.sin(x * noiseScale + noiseOffset) * Math.cos(z * noiseScale + noiseOffset);
                
                // Only use soil and rock colors for Terrant - NO vegetation mixing
                if (noiseValue > 0.6) {
                    // Rocky areas
                    baseColor = new THREE.Color(zoneColors.rock);
                } else if (Math.random() > 0.95) {
                    // Rare crystal-influenced areas
                    baseColor = new THREE.Color(zoneColors.soil);
                    baseColor.lerp(new THREE.Color(zoneColors.crystal), 0.2);
                }
                
                // Add subtle micro-variation to make terrain look more natural
                // Use deterministic variation to prevent flickering
                const microVariation = (Math.sin(x * 0.1 + z * 0.1) * 0.05);
                
                // Apply variation to each color channel
                const color = new THREE.Color(
                    Math.max(0, Math.min(1, baseColor.r + microVariation)),
                    Math.max(0, Math.min(1, baseColor.g + microVariation)),
                    Math.max(0, Math.min(1, baseColor.b + microVariation))
                );
                
                colors.push(color.r, color.g, color.b);
            } else {
                // Standard variation for other zone types
                const variation = (Math.sin(x * 0.1 + z * 0.1) * 0.05);
                const color = new THREE.Color(
                    Math.max(0, Math.min(1, baseColor.r + variation)),
                    Math.max(0, Math.min(1, baseColor.g + variation)),
                    Math.max(0, Math.min(1, baseColor.b + variation))
                );
                
                colors.push(color.r, color.g, color.b);
            }
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
}