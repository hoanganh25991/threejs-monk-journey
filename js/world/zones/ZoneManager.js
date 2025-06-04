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
     * Create simplified zones throughout the world
     */
    createZones() {
        // Simplified zone types - fewer zones, larger areas
        const zoneTypes = [
            { name: 'Terrant', color: ZONE_COLORS.Terrant.soil, radius: 100 },
            { name: 'Forest', color: ZONE_COLORS.Forest.foliage, radius: 80 },
            { name: 'Desert', color: ZONE_COLORS.Desert.sand, radius: 80 },
            { name: 'Mountains', color: ZONE_COLORS.Mountains.ice, radius: 80 }
        ];
        
        // Initialize zones array with large, simple regions
        this.zones = [
            // Central Terrant zone (starting area)
            {
                name: 'Terrant',
                center: new THREE.Vector3(0, 0, 0),
                radius: 150,
                color: ZONE_COLORS.Terrant.soil
            },
            // Four cardinal direction zones
            {
                name: 'Forest',
                center: new THREE.Vector3(200, 0, 0),
                radius: 120,
                color: ZONE_COLORS.Forest.foliage
            },
            {
                name: 'Desert',
                center: new THREE.Vector3(-200, 0, 0),
                radius: 120,
                color: ZONE_COLORS.Desert.sand
            },
            {
                name: 'Mountains',
                center: new THREE.Vector3(0, 0, 200),
                radius: 120,
                color: ZONE_COLORS.Mountains.ice
            },
            {
                name: 'Swamp',
                center: new THREE.Vector3(0, 0, -200),
                radius: 120,
                color: ZONE_COLORS.Swamp.vegetation
            }
        ];
        
        // Build simple zone cache
        this.buildSimpleZoneCache();
        
        // Visualize zones (for development)
        this.visualizeZones();
    }
    
    /**
     * Seeded random number generator for consistent zone generation
     * @param {number} seed - The seed value
     * @returns {function} - A function that returns a random number between 0 and 1
     */
    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    /**
     * Build a simplified cache of zone data for chunk lookups
     */
    buildSimpleZoneCache() {
        this.zoneCache = {};
        // Cache will be built on-demand in getZoneTypeForChunk
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
     * Get the zone at a specific world position (simplified)
     * @param {THREE.Vector3} position - The position to check
     * @returns {object} - The zone at the specified position
     */
    getZoneAt(position) {
        // If zones array is empty, return default Terrant zone
        if (!this.zones || this.zones.length === 0) {
            return {
                name: 'Terrant',
                color: ZONE_COLORS.Terrant.soil,
                center: position.clone(),
                radius: 1
            };
        }
        
        // Simple distance-based lookup - find the zone that contains this position
        for (const zone of this.zones) {
            const distance = position.distanceTo(zone.center);
            if (distance <= zone.radius) {
                return zone;
            }
        }
        
        // If no zone contains the position, return the closest one
        let closestZone = this.zones[0];
        let closestDistance = position.distanceTo(this.zones[0].center);
        
        for (let i = 1; i < this.zones.length; i++) {
            const distance = position.distanceTo(this.zones[i].center);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestZone = this.zones[i];
            }
        }
        
        return closestZone;
    }
    
    /**
     * Get the zone type for a specific chunk (simplified)
     * @param {number} chunkX - X chunk coordinate
     * @param {number} chunkZ - Z chunk coordinate
     * @returns {string} - The zone type name
     */
    getZoneTypeForChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Check cache first
        if (this.zoneCache && this.zoneCache[chunkKey]) {
            return this.zoneCache[chunkKey];
        }
        
        // Calculate chunk center position
        const chunkSize = this.worldManager?.terrainManager?.terrainChunkSize || 50;
        const worldX = chunkX * chunkSize + chunkSize / 2;
        const worldZ = chunkZ * chunkSize + chunkSize / 2;
        
        const position = new THREE.Vector3(worldX, 0, worldZ);
        const zone = this.getZoneAt(position);
        
        // Cache the result
        if (!this.zoneCache) this.zoneCache = {};
        this.zoneCache[chunkKey] = zone.name;
        
        return zone.name;
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