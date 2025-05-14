import * as THREE from 'three';
import { ZONE_COLORS } from '../../config/colors.js';

/**
 * Manages world zones and their properties
 */
export class ZoneManager {
    constructor(scene, worldManager) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.game = null;
        
        // Zone collections
        this.zones = [];
        this.zoneMarkers = [];
    }
    
    /**
     * Set the game reference
     * @param {Game} game - The game instance
     */
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Initialize the zone system
     */
    init() {
        this.createZones();
    }
    
    /**
     * Create zones throughout the world
     */
    createZones() {
        // Define zone types with colors from the Monk Journey theme
        const zoneTypes = [
            { name: 'Forest', color: ZONE_COLORS.Forest.foliage, radius: 15 },
            { name: 'Desert', color: ZONE_COLORS.Desert.sand, radius: 15 },
            { name: 'Mountains', color: ZONE_COLORS.Mountains.ice, radius: 15 },
            { name: 'Swamp', color: ZONE_COLORS.Swamp.vegetation, radius: 15 },
            { name: 'Ruins', color: ZONE_COLORS.Ruins.stone, radius: 10 },
            { name: 'Dark Sanctum', color: ZONE_COLORS['Dark Sanctum'].structure, radius: 12 },
            { name: 'Terrant', color: ZONE_COLORS.Terrant.soil, radius: 18 } // Larger radius for Terrant zones
        ];
        
        // Initialize empty zones array
        this.zones = [];
        
        // Create zones in a grid pattern across the world
        const spacing = 30; // Space between zone centers
        const range = 10; // More zones for better coverage
        
        for (let x = -range; x <= range; x++) {
            for (let z = -range; z <= range; z++) {
                // Choose a zone type based on position (deterministic but varied)
                const zoneIndex = Math.abs((x * 3 + z * 5) % zoneTypes.length);
                const zoneType = zoneTypes[zoneIndex];
                
                // Add some randomness to zone positions to make them less grid-like
                const offsetX = (Math.random() - 0.5) * spacing * 0.5;
                const offsetZ = (Math.random() - 0.5) * spacing * 0.5;
                
                // Create the zone
                this.zones.push({
                    name: zoneType.name,
                    center: new THREE.Vector3(
                        x * spacing + offsetX, 
                        0, 
                        z * spacing + offsetZ
                    ),
                    radius: zoneType.radius * (0.8 + Math.random() * 0.4), // Vary radius slightly
                    color: zoneType.color
                });
            }
        }
        
        // Add special zones
        // Dark Sanctum at the center
        this.zones.push({
            name: 'Dark Sanctum',
            center: new THREE.Vector3(0, 0, 0),
            radius: 10,
            color: 0x330033
        });
        
        // Visualize zones (for development)
        this.visualizeZones();
    }
    
    /**
     * Create visual markers for zones
     */
    visualizeZones() {
        // Clear existing markers
        this.clearZoneMarkers();
        
        // Create new markers
        this.zones.forEach(zone => {
            const marker = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 5, 8),
                new THREE.MeshBasicMaterial({ color: zone.color })
            );
            marker.position.set(
                zone.center.x,
                this.worldManager.getTerrainHeight(zone.center.x, zone.center.z) + 2.5,
                zone.center.z
            );
            this.scene.add(marker);
            this.zoneMarkers.push(marker);
        });
    }
    
    /**
     * Clear zone markers
     */
    clearZoneMarkers() {
        this.zoneMarkers.forEach(marker => {
            if (marker.parent) {
                this.scene.remove(marker);
            }
        });
        this.zoneMarkers = [];
    }
    
    /**
     * Get the zone at a specific world position
     * @param {THREE.Vector3} position - The position to check
     * @returns {object|null} - The zone at the specified position, or null if none
     */
    getZoneAt(position) {
        for (const zone of this.zones) {
            const distance = position.distanceTo(zone.center);
            if (distance <= zone.radius) {
                return zone;
            }
        }
        return null;
    }
    
    /**
     * Clear all zones
     */
    clear() {
        this.clearZoneMarkers();
        this.zones = [];
    }
    
    /**
     * Save zone state
     * @returns {object} - The saved zone state
     */
    save() {
        return {
            zones: this.zones.map(zone => ({
                name: zone.name,
                center: {
                    x: zone.center.x,
                    y: zone.center.y,
                    z: zone.center.z
                },
                radius: zone.radius,
                color: zone.color
            }))
        };
    }
    
    /**
     * Load zone state
     * @param {object} zoneState - The zone state to load
     */
    load(zoneState) {
        if (!zoneState || !zoneState.zones) return;
        
        this.zones = zoneState.zones.map(zone => ({
            name: zone.name,
            center: new THREE.Vector3(zone.center.x, zone.center.y, zone.center.z),
            radius: zone.radius,
            color: zone.color
        }));
        
        // Visualize the loaded zones
        this.visualizeZones();
    }
}