#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Import environment configuration
import { 
    ENVIRONMENT_OBJECTS, 
    THEME_SPECIFIC_OBJECTS, 
    CROSS_THEME_FEATURES, 
} from '../js/config/environment.js';

import { 
    ZONE_COLORS, 
    HOT_ZONE_COLORS, 
} from '../js/config/colors.js';

/**
 * Map themes with their characteristics
 */
const MAP_THEMES = {
    DARK_FOREST: {
        name: 'Dark Forest',
        description: 'Dense forest with winding paths, hidden villages, and ancient towers',
        primaryZone: 'Forest',
        colors: ZONE_COLORS.Forest,
        features: {
            treeDensity: 0.8,
            pathWidth: 2,
            villageCount: 3,
            towerCount: 5,
            ruinsCount: 2,
            bridgeCount: 4
        }
    },
    FROZEN_MOUNTAINS: {
        name: 'Frozen Mountains',
        description: 'Icy peaks with mountain villages, watchtowers, and treacherous paths',
        primaryZone: 'Mountains',
        colors: ZONE_COLORS.Mountains,
        features: {
            mountainDensity: 0.9,
            pathWidth: 3,
            villageCount: 2,
            towerCount: 8,
            ruinsCount: 1,
            bridgeCount: 6
        }
    },
    LAVA_ZONE: {
        name: 'Lava Zone',
        description: 'Volcanic landscape with lava flows, dark sanctums, and fire-resistant structures',
        primaryZone: 'Desert',
        colors: HOT_ZONE_COLORS,
        features: {
            lavaDensity: 0.6,
            pathWidth: 4,
            villageCount: 1,
            towerCount: 3,
            darkSanctumCount: 4,
            bridgeCount: 2
        }
    },
    MYSTICAL_SWAMP: {
        name: 'Mystical Swamp',
        description: 'Mysterious wetlands with floating bridges, ancient ruins, and hidden paths',
        primaryZone: 'Swamp',
        colors: ZONE_COLORS.Swamp,
        features: {
            waterDensity: 0.7,
            pathWidth: 2.5,
            villageCount: 2,
            towerCount: 4,
            ruinsCount: 6,
            bridgeCount: 8
        }
    },
    ANCIENT_RUINS: {
        name: 'Ancient Ruins',
        description: 'Vast archaeological site with connected ruins, overgrown paths, and forgotten towers',
        primaryZone: 'Ruins',
        colors: ZONE_COLORS.Ruins,
        features: {
            ruinsDensity: 0.8,
            pathWidth: 3,
            villageCount: 1,
            towerCount: 6,
            ruinsCount: 12,
            bridgeCount: 3
        }
    }
};

/**
 * Path generation patterns
 */
const PATH_PATTERNS = {
    STRAIGHT: 'straight',
    CURVED: 'curved',
    SPIRAL: 'spiral',
    BRANCHING: 'branching',
    CIRCULAR: 'circular'
};

/**
 * Map Generator Class
 */
class MapGenerator {
    constructor() {
        this.mapSize = 1000; // 1000x1000 world units
        this.chunkSize = 50;
        this.seed = Date.now();
        this.rng = this.createSeededRandom(this.seed);
        
        // Generated map data
        this.mapData = {
            theme: null,
            zones: [],
            structures: [],
            paths: [],
            environment: [],
            metadata: {}
        };
    }
    
    /**
     * Generate a random color in hex format
     * @param {number} baseHue - Optional base hue (0-360) to build color around
     * @param {number} satRange - Range of saturation variation [min, max] (0-100)
     * @param {number} lightRange - Range of lightness variation [min, max] (0-100)
     * @returns {string} - Hex color code
     */
    generateRandomColor(baseHue = null, satRange = [50, 100], lightRange = [30, 70]) {
        // Generate random hue or use base hue with slight variation
        let hue;
        if (baseHue !== null) {
            // Add some variation to the base hue (±15 degrees)
            hue = (baseHue + (this.rng() * 30 - 15)) % 360;
            if (hue < 0) hue += 360;
        } else {
            hue = this.rng() * 360;
        }
        
        // Generate random saturation and lightness within specified ranges
        const sat = satRange[0] + this.rng() * (satRange[1] - satRange[0]);
        const light = lightRange[0] + this.rng() * (lightRange[1] - lightRange[0]);
        
        // Convert HSL to RGB
        return this.hslToHex(hue, sat, light);
    }
    
    /**
     * Convert HSL color values to hex string
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string} - Hex color code
     */
    hslToHex(h, s, l) {
        // Convert HSL percentages to decimals
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (h >= 0 && h < 60) {
            [r, g, b] = [c, x, 0];
        } else if (h >= 60 && h < 120) {
            [r, g, b] = [x, c, 0];
        } else if (h >= 120 && h < 180) {
            [r, g, b] = [0, c, x];
        } else if (h >= 180 && h < 240) {
            [r, g, b] = [0, x, c];
        } else if (h >= 240 && h < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        // Convert to hex
        const toHex = (value) => {
            const hex = Math.round((value + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    /**
     * Generate a random theme with unique colors
     * @param {string} themeName - Name for the theme
     * @param {string} description - Description of the theme
     * @param {string} baseTheme - Optional base theme to derive from
     * @returns {Object} - Complete theme object
     */
    generateRandomTheme(themeName, description, baseTheme = null) {
        // Select a base hue for the theme's color palette
        const baseHue = this.rng() * 360;
        
        // Create a new theme object
        const newTheme = {
            name: themeName,
            description: description,
            primaryZone: baseTheme ? MAP_THEMES[baseTheme].primaryZone : 'Terrant',
            features: {}
        };
        
        // Generate colors based on the base hue
        const colors = {
            // Ground/base colors
            ground: this.generateRandomColor(baseHue, [20, 60], [30, 50]),
            soil: this.generateRandomColor(baseHue, [30, 70], [40, 60]),
            
            // Vegetation colors
            foliage: this.generateRandomColor((baseHue + 120) % 360, [50, 90], [20, 40]),
            vegetation: this.generateRandomColor((baseHue + 120) % 360, [60, 90], [25, 45]),
            trunk: this.generateRandomColor((baseHue + 30) % 360, [50, 80], [20, 40]),
            
            // Structure colors
            structure: this.generateRandomColor(baseHue, [10, 40], [20, 50]),
            rock: this.generateRandomColor(baseHue, [5, 30], [30, 60]),
            
            // Water and special elements
            water: this.generateRandomColor((baseHue + 210) % 360, [60, 90], [40, 70]),
            ice: this.generateRandomColor((baseHue + 210) % 360, [20, 50], [70, 90]),
            
            // Accent and glow colors
            accent: this.generateRandomColor((baseHue + 180) % 360, [70, 100], [50, 70]),
            glow: this.generateRandomColor((baseHue + 60) % 360, [80, 100], [60, 80]),
            
            // Path color
            path: this.generateRandomColor(baseHue, [30, 60], [30, 50])
        };
        
        // Add special colors based on theme type
        if (themeName.includes('Lava') || themeName.includes('Volcanic') || themeName.includes('Fire')) {
            colors.lava = this.generateRandomColor(20, [80, 100], [50, 60]);
            colors.magma = this.generateRandomColor(30, [90, 100], [60, 70]);
            colors.ember = this.generateRandomColor(40, [90, 100], [70, 80]);
        }
        
        if (themeName.includes('Ice') || themeName.includes('Frozen') || themeName.includes('Snow')) {
            colors.snow = this.generateRandomColor(210, [5, 20], [85, 95]);
            colors.ice = this.generateRandomColor(200, [30, 50], [70, 85]);
        }
        
        if (themeName.includes('Crystal') || themeName.includes('Gem') || themeName.includes('Magic')) {
            colors.crystal = this.generateRandomColor((baseHue + 150) % 360, [70, 90], [60, 80]);
            colors.glow = this.generateRandomColor((baseHue + 180) % 360, [80, 100], [70, 90]);
        }
        
        // Set the colors
        newTheme.colors = colors;
        
        // Generate random features based on theme name
        newTheme.features = {
            treeDensity: 0.2 + this.rng() * 0.8,
            pathWidth: 2 + this.rng() * 3,
            villageCount: 1 + Math.floor(this.rng() * 5),
            towerCount: 2 + Math.floor(this.rng() * 8),
            ruinsCount: Math.floor(this.rng() * 10),
            bridgeCount: 2 + Math.floor(this.rng() * 8)
        };
        
        // Add special features based on theme type
        if (themeName.includes('Lava') || themeName.includes('Volcanic')) {
            newTheme.features.lavaDensity = 0.3 + this.rng() * 0.5;
            newTheme.features.darkSanctumCount = Math.floor(this.rng() * 5);
        }
        
        if (themeName.includes('Water') || themeName.includes('Swamp') || themeName.includes('Lake')) {
            newTheme.features.waterDensity = 0.4 + this.rng() * 0.5;
            newTheme.features.bridgeCount += Math.floor(this.rng() * 5);
        }
        
        if (themeName.includes('Mountain') || themeName.includes('Hill')) {
            newTheme.features.mountainDensity = 0.4 + this.rng() * 0.5;
        }
        
        return newTheme;
    }

    /**
     * Create a seeded random number generator
     */
    createSeededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    /**
     * Generate a themed map
     */
    generateMap(themeName, options = {}) {
        const theme = MAP_THEMES[themeName];
        if (!theme) {
            throw new Error(`Unknown theme: ${themeName}`);
        }

        console.debug(`Generating ${theme.name} map...`);
        
        this.mapData.theme = theme;
        this.mapData.metadata = {
            generated: new Date().toISOString(),
            seed: this.seed,
            size: this.mapSize,
            ...options
        };

        // Generate map components in order
        this.generateZones(theme);
        this.generateMainPaths(theme);
        this.generateStructures(theme);
        this.generateEnvironment(theme);
        this.connectStructuresWithPaths(theme);

        return this.mapData;
    }

    /**
     * Generate zone layout for the map
     */
    generateZones(theme) {
        console.debug('Generating zones...');
        
        // Create a square boundary for the map
        const mapHalfSize = this.mapSize / 2;
        const boundarySize = this.mapSize * 0.95; // 95% of map size to create a clear boundary
        const boundaryHalfSize = boundarySize / 2;
        
        // Create a square boundary zone
        const boundaryZone = {
            name: 'Boundary',
            type: 'boundary',
            // Define the boundary as a square
            points: [
                { x: -boundaryHalfSize, y: 0, z: -boundaryHalfSize },
                { x: boundaryHalfSize, y: 0, z: -boundaryHalfSize },
                { x: boundaryHalfSize, y: 0, z: boundaryHalfSize },
                { x: -boundaryHalfSize, y: 0, z: boundaryHalfSize }
            ],
            color: theme.colors.boundary || '#444444'
        };
        
        this.mapData.zones.push(boundaryZone);
        
        // Create a central zone that covers 70% of the map
        const centerZone = {
            name: theme.primaryZone,
            center: { x: 0, y: 0, z: 0 },
            radius: boundaryHalfSize * 0.7, // 70% of the map area
            color: theme.colors.ground || theme.colors.soil || theme.colors.sand
        };
        
        this.mapData.zones.push(centerZone);

        // Add more complex zone layout with multiple zones
        // Create 8 zones in a grid pattern
        const zoneSize = boundaryHalfSize * 0.6;
        const zoneOffset = zoneSize * 0.8; // Slight overlap between zones
        
        const zonePositions = [
            // Center row
            { x: -zoneOffset, y: 0, z: 0 },
            { x: zoneOffset, y: 0, z: 0 },
            // Top row
            { x: -zoneOffset, y: 0, z: -zoneOffset },
            { x: 0, y: 0, z: -zoneOffset },
            { x: zoneOffset, y: 0, z: -zoneOffset },
            // Bottom row
            { x: -zoneOffset, y: 0, z: zoneOffset },
            { x: 0, y: 0, z: zoneOffset },
            { x: zoneOffset, y: 0, z: zoneOffset }
        ];
        
        // Zone types based on theme
        const zoneTypes = [
            theme.primaryZone,
            theme.secondaryZone || theme.primaryZone,
            'Forest',
            'Mountains',
            'Desert',
            'Swamp',
            'Ruins',
            'Lava'
        ];

        // Create zones with different types and sizes
        for (let i = 0; i < zonePositions.length; i++) {
            const pos = zonePositions[i];
            const zoneType = zoneTypes[i % zoneTypes.length];
            
            // Add some randomness to zone size
            const sizeVariation = 0.7 + (this.rng() * 0.6); // 0.7 to 1.3
            const radius = zoneSize * sizeVariation;
            
            // Create the zone
            const zone = {
                id: `zone_${i}`,
                name: zoneType,
                type: zoneType.toLowerCase(),
                center: { x: pos.x, y: 0, z: pos.z },
                position: { x: pos.x, y: 0, z: pos.z },
                radius: radius,
                color: ZONE_COLORS[zoneType]?.soil || 
                       ZONE_COLORS[zoneType]?.sand || 
                       ZONE_COLORS[zoneType]?.foliage || 
                       '#555555'
            };
            
            this.mapData.zones.push(zone);
        }
        
        // Add some smaller sub-zones for more complexity
        const subZoneCount = Math.floor(5 + this.rng() * 10); // 5-15 sub-zones
        
        for (let i = 0; i < subZoneCount; i++) {
            // Random position within the boundary
            const angle = this.rng() * Math.PI * 2;
            const distance = this.rng() * boundaryHalfSize * 0.8;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            // Random zone type
            const zoneType = zoneTypes[Math.floor(this.rng() * zoneTypes.length)];
            
            // Smaller radius for sub-zones
            const radius = 30 + this.rng() * 70; // 30-100
            
            const subZone = {
                id: `subzone_${i}`,
                name: zoneType,
                type: zoneType.toLowerCase(),
                center: { x, y: 0, z },
                position: { x, y: 0, z },
                radius: radius,
                color: ZONE_COLORS[zoneType]?.soil || 
                       ZONE_COLORS[zoneType]?.sand || 
                       ZONE_COLORS[zoneType]?.foliage || 
                       '#555555'
            };
            
            this.mapData.zones.push(subZone);
        }
        
        console.debug(`Created ${this.mapData.zones.length} zones`);
    }

    /**
     * Generate main road network
     */
    generateMainPaths(theme) {
        console.debug('Generating main paths...');
        
        const pathWidth = theme.features.pathWidth || 3;
        const boundarySize = this.mapSize * 0.95;
        const boundaryHalfSize = boundarySize / 2;
        
        // Create a grid of paths
        const gridSize = 3; // 3x3 grid
        const cellSize = boundarySize / gridSize;
        
        // Create horizontal grid lines
        for (let i = 0; i <= gridSize; i++) {
            const z = -boundaryHalfSize + (i * cellSize);
            
            // Add some randomness to the path
            const points = [];
            const segmentCount = 10; // Number of segments for the path
            const segmentLength = boundarySize / segmentCount;
            
            for (let j = 0; j <= segmentCount; j++) {
                const x = -boundaryHalfSize + (j * segmentLength);
                // Add some randomness to the path
                const randomZ = z + (this.rng() * 30 - 15); // +/- 15 units
                points.push({ x, z: randomZ });
            }
            
            this.createPath(`horizontal_${i}`, points, pathWidth, PATH_PATTERNS.NATURAL);
        }
        
        // Create vertical grid lines
        for (let i = 0; i <= gridSize; i++) {
            const x = -boundaryHalfSize + (i * cellSize);
            
            // Add some randomness to the path
            const points = [];
            const segmentCount = 10; // Number of segments for the path
            const segmentLength = boundarySize / segmentCount;
            
            for (let j = 0; j <= segmentCount; j++) {
                const z = -boundaryHalfSize + (j * segmentLength);
                // Add some randomness to the path
                const randomX = x + (this.rng() * 30 - 15); // +/- 15 units
                points.push({ x: randomX, z });
            }
            
            this.createPath(`vertical_${i}`, points, pathWidth, PATH_PATTERNS.NATURAL);
        }
        
        // Create diagonal paths
        this.createPath('diagonal_1', [
            { x: -boundaryHalfSize, z: -boundaryHalfSize },
            { x: -boundaryHalfSize/2, z: -boundaryHalfSize/2 },
            { x: 0, z: 0 },
            { x: boundaryHalfSize/2, z: boundaryHalfSize/2 },
            { x: boundaryHalfSize, z: boundaryHalfSize }
        ], pathWidth, PATH_PATTERNS.NATURAL);
        
        this.createPath('diagonal_2', [
            { x: boundaryHalfSize, z: -boundaryHalfSize },
            { x: boundaryHalfSize/2, z: -boundaryHalfSize/2 },
            { x: 0, z: 0 },
            { x: -boundaryHalfSize/2, z: boundaryHalfSize/2 },
            { x: -boundaryHalfSize, z: boundaryHalfSize }
        ], pathWidth, PATH_PATTERNS.NATURAL);
        
        // Create circular roads at different radii
        this.createCircularPath('center_circle_1', { x: 0, z: 0 }, boundaryHalfSize * 0.3, pathWidth);
        this.createCircularPath('center_circle_2', { x: 0, z: 0 }, boundaryHalfSize * 0.6, pathWidth);
        
        // Create some random circular paths
        for (let i = 0; i < 3; i++) {
            const centerX = (this.rng() * boundarySize - boundaryHalfSize) * 0.7;
            const centerZ = (this.rng() * boundarySize - boundaryHalfSize) * 0.7;
            const radius = 50 + this.rng() * 100; // 50-150
            
            this.createCircularPath(`random_circle_${i}`, { x: centerX, z: centerZ }, radius, pathWidth);
        }
        
        // Create some random curved paths
        for (let i = 0; i < 5; i++) {
            const startX = (this.rng() * boundarySize - boundaryHalfSize) * 0.8;
            const startZ = (this.rng() * boundarySize - boundaryHalfSize) * 0.8;
            const endX = (this.rng() * boundarySize - boundaryHalfSize) * 0.8;
            const endZ = (this.rng() * boundarySize - boundaryHalfSize) * 0.8;
            
            // Create a curved path with control points
            const controlX = (startX + endX) / 2 + (this.rng() * 200 - 100);
            const controlZ = (startZ + endZ) / 2 + (this.rng() * 200 - 100);
            
            // Generate points along a quadratic curve
            const points = [];
            const steps = 10;
            
            for (let t = 0; t <= steps; t++) {
                const progress = t / steps;
                // Quadratic Bezier curve formula
                const x = (1-progress)*(1-progress)*startX + 2*(1-progress)*progress*controlX + progress*progress*endX;
                const z = (1-progress)*(1-progress)*startZ + 2*(1-progress)*progress*controlZ + progress*progress*endZ;
                points.push({ x, z });
            }
            
            this.createPath(`curved_path_${i}`, points, pathWidth, PATH_PATTERNS.NATURAL);
        }

        // Create paths to the corners of the map
        const corners = [
            { x: -boundaryHalfSize, z: -boundaryHalfSize },
            { x: boundaryHalfSize, z: -boundaryHalfSize },
            { x: boundaryHalfSize, z: boundaryHalfSize },
            { x: -boundaryHalfSize, z: boundaryHalfSize }
        ];
        
        corners.forEach((corner, index) => {
            // Create a path with multiple control points for more natural look
            const points = [];
            const steps = 8;
            
            // Start from center
            const startX = 0;
            const startZ = 0;
            
            // End at corner
            const endX = corner.x;
            const endZ = corner.z;
            
            // Add some randomness to the control points
            const controlPoints = [
                { 
                    x: startX + (endX - startX) * 0.25 + (this.rng() * 50 - 25),
                    z: startZ + (endZ - startZ) * 0.25 + (this.rng() * 50 - 25)
                },
                { 
                    x: startX + (endX - startX) * 0.5 + (this.rng() * 80 - 40),
                    z: startZ + (endZ - startZ) * 0.5 + (this.rng() * 80 - 40)
                },
                { 
                    x: startX + (endX - startX) * 0.75 + (this.rng() * 50 - 25),
                    z: startZ + (endZ - startZ) * 0.75 + (this.rng() * 50 - 25)
                }
            ];
            
            // Start point
            points.push({ x: startX, z: startZ });
            
            // Add points along the path with some randomness
            for (let i = 1; i < steps; i++) {
                const progress = i / steps;
                
                // Find the appropriate segment
                let segment = 0;
                if (progress < 0.25) segment = 0;
                else if (progress < 0.5) segment = 1;
                else if (progress < 0.75) segment = 2;
                else segment = 3;
                
                // Calculate position along the segment
                let segmentProgress = 0;
                if (segment === 0) segmentProgress = progress / 0.25;
                else if (segment === 1) segmentProgress = (progress - 0.25) / 0.25;
                else if (segment === 2) segmentProgress = (progress - 0.5) / 0.25;
                else segmentProgress = (progress - 0.75) / 0.25;
                
                let x, z;
                
                if (segment === 0) {
                    x = startX + (controlPoints[0].x - startX) * segmentProgress;
                    z = startZ + (controlPoints[0].z - startZ) * segmentProgress;
                } else if (segment === 1) {
                    x = controlPoints[0].x + (controlPoints[1].x - controlPoints[0].x) * segmentProgress;
                    z = controlPoints[0].z + (controlPoints[1].z - controlPoints[0].z) * segmentProgress;
                } else if (segment === 2) {
                    x = controlPoints[1].x + (controlPoints[2].x - controlPoints[1].x) * segmentProgress;
                    z = controlPoints[1].z + (controlPoints[2].z - controlPoints[1].z) * segmentProgress;
                } else {
                    x = controlPoints[2].x + (endX - controlPoints[2].x) * segmentProgress;
                    z = controlPoints[2].z + (endZ - controlPoints[2].z) * segmentProgress;
                }
                
                // Add some randomness
                x += this.rng() * 20 - 10;
                z += this.rng() * 20 - 10;
                
                points.push({ x, z });
            }
            
            // End point
            points.push({ x: endX, z: endZ });
            
            this.createPath(`corner_path_${index}`, points, pathWidth * 0.8, PATH_PATTERNS.NATURAL);
        });
    }

    /**
     * Generate structures based on theme
     */
    generateStructures(theme) {
        console.debug('Generating structures...');
        
        const features = theme.features;
        const boundarySize = this.mapSize * 0.95;
        const boundaryHalfSize = boundarySize / 2;
        
        // Increase structure counts for more complexity
        const villageCount = features.villageCount ? features.villageCount * 2 : 10;
        const towerCount = features.towerCount ? features.towerCount * 2 : 15;
        const ruinsCount = features.ruinsCount ? features.ruinsCount * 2 : 20;
        const darkSanctumCount = features.darkSanctumCount ? features.darkSanctumCount * 2 : 5;
        
        // Create structure clusters
        const clusterCount = 5 + Math.floor(this.rng() * 5); // 5-10 clusters
        const clusters = [];
        
        // Generate cluster centers
        for (let i = 0; i < clusterCount; i++) {
            // Random position within the boundary
            const angle = this.rng() * Math.PI * 2;
            const distance = this.rng() * boundaryHalfSize * 0.8;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            clusters.push({
                position: { x, y: 0, z },
                radius: 50 + this.rng() * 100 // 50-150
            });
        }
        
        // Generate villages in clusters
        for (let i = 0; i < villageCount; i++) {
            let position;
            
            if (i < clusterCount && this.rng() < 0.7) {
                // Place village at cluster center
                const cluster = clusters[i % clusterCount];
                position = { ...cluster.position };
            } else if (this.rng() < 0.6) {
                // Place village near a cluster
                const cluster = clusters[Math.floor(this.rng() * clusterCount)];
                const angle = this.rng() * Math.PI * 2;
                const distance = this.rng() * cluster.radius;
                position = {
                    x: cluster.position.x + Math.cos(angle) * distance,
                    y: 0,
                    z: cluster.position.z + Math.sin(angle) * distance
                };
            } else {
                // Random position
                position = this.getRandomPosition(0, boundaryHalfSize * 0.9);
            }
            
            this.createVillage(position, `village_${i}`, theme);
        }

        // Generate towers along paths and at strategic locations
        for (let i = 0; i < towerCount; i++) {
            let position;
            
            if (i < 8) {
                // Place towers at strategic locations (near corners and midpoints of boundary)
                const locations = [
                    { x: -boundaryHalfSize * 0.8, z: -boundaryHalfSize * 0.8 }, // Near corners
                    { x: boundaryHalfSize * 0.8, z: -boundaryHalfSize * 0.8 },
                    { x: boundaryHalfSize * 0.8, z: boundaryHalfSize * 0.8 },
                    { x: -boundaryHalfSize * 0.8, z: boundaryHalfSize * 0.8 },
                    { x: 0, z: -boundaryHalfSize * 0.8 }, // Midpoints of sides
                    { x: boundaryHalfSize * 0.8, z: 0 },
                    { x: 0, z: boundaryHalfSize * 0.8 },
                    { x: -boundaryHalfSize * 0.8, z: 0 }
                ];
                
                position = locations[i];
                // Add some randomness
                position.x += this.rng() * 40 - 20;
                position.z += this.rng() * 40 - 20;
            } else if (this.rng() < 0.4) {
                // Place tower near a cluster
                const cluster = clusters[Math.floor(this.rng() * clusterCount)];
                const angle = this.rng() * Math.PI * 2;
                const distance = cluster.radius + 20 + this.rng() * 30; // Just outside the cluster
                position = {
                    x: cluster.position.x + Math.cos(angle) * distance,
                    y: 0,
                    z: cluster.position.z + Math.sin(angle) * distance
                };
            } else {
                // Random position
                position = this.getRandomPosition(0, boundaryHalfSize * 0.9);
            }
            
            this.createTower(position, `tower_${i}`, theme);
        }

        // Generate ruins scattered throughout the map
        for (let i = 0; i < ruinsCount; i++) {
            let position;
            
            if (this.rng() < 0.3) {
                // Place ruins near a cluster
                const cluster = clusters[Math.floor(this.rng() * clusterCount)];
                const angle = this.rng() * Math.PI * 2;
                const distance = this.rng() * (cluster.radius + 50);
                position = {
                    x: cluster.position.x + Math.cos(angle) * distance,
                    y: 0,
                    z: cluster.position.z + Math.sin(angle) * distance
                };
            } else {
                // Random position
                position = this.getRandomPosition(0, boundaryHalfSize * 0.95);
            }
            
            this.createRuins(position, `ruins_${i}`, theme);
        }

        // Generate dark sanctums in remote locations
        if (darkSanctumCount) {
            for (let i = 0; i < darkSanctumCount; i++) {
                let position;
                
                if (i < 4 && this.rng() < 0.7) {
                    // Place some dark sanctums in the corners of the map
                    const corners = [
                        { x: -boundaryHalfSize * 0.7, z: -boundaryHalfSize * 0.7 },
                        { x: boundaryHalfSize * 0.7, z: -boundaryHalfSize * 0.7 },
                        { x: boundaryHalfSize * 0.7, z: boundaryHalfSize * 0.7 },
                        { x: -boundaryHalfSize * 0.7, z: boundaryHalfSize * 0.7 }
                    ];
                    
                    position = corners[i];
                    // Add some randomness
                    position.x += this.rng() * 60 - 30;
                    position.z += this.rng() * 60 - 30;
                } else {
                    // Random remote position
                    const angle = this.rng() * Math.PI * 2;
                    const distance = boundaryHalfSize * (0.6 + this.rng() * 0.3); // 60-90% of distance to boundary
                    position = {
                        x: Math.cos(angle) * distance,
                        y: 0,
                        z: Math.sin(angle) * distance
                    };
                }
                
                this.createDarkSanctum(position, `sanctum_${i}`, theme);
            }
        }

        // Generate bridges at strategic locations
        const bridgeCount = features.bridgeCount ? features.bridgeCount * 1.5 : 15;
        
        for (let i = 0; i < bridgeCount; i++) {
            let position;
            
            if (i < 8) {
                // Place bridges at strategic locations along the grid paths
                const gridSize = 3;
                const cellSize = boundarySize / gridSize;
                
                // Calculate grid positions
                const gridPositions = [];
                for (let x = 1; x < gridSize; x++) {
                    for (let z = 1; z < gridSize; z++) {
                        gridPositions.push({
                            x: -boundaryHalfSize + x * cellSize,
                            z: -boundaryHalfSize + z * cellSize
                        });
                    }
                }
                
                position = gridPositions[i % gridPositions.length];
                // Add some randomness
                position.x += this.rng() * 50 - 25;
                position.z += this.rng() * 50 - 25;
            } else if (this.rng() < 0.4) {
                // Place bridge near a cluster
                const cluster = clusters[Math.floor(this.rng() * clusterCount)];
                const angle = this.rng() * Math.PI * 2;
                const distance = cluster.radius * (0.8 + this.rng() * 0.4); // Near the edge of the cluster
                position = {
                    x: cluster.position.x + Math.cos(angle) * distance,
                    y: 0,
                    z: cluster.position.z + Math.sin(angle) * distance
                };
            } else {
                // Random position
                position = this.getRandomPosition(0, boundaryHalfSize * 0.9);
            }
            
            // Randomize bridge orientation
            const rotation = this.rng() * Math.PI;
            this.createBridge(position, `bridge_${i}`, theme, rotation);
        }
    }

    /**
     * Generate environment objects
     */
    generateEnvironment(theme) {
        console.debug('Generating environment...');
        
        const features = theme.features;
        const boundarySize = this.mapSize * 0.95;
        const boundaryHalfSize = boundarySize / 2;
        
        // Generate background coverage first (dense tree/object coverage across the entire map)
        this.generateBackgroundCoverage(theme);
        
        // Generate trees along paths with much higher density
        if (features.treeDensity) {
            this.generateTreesAlongPaths(features.treeDensity * 3, theme); // Tripled density
        }
        
        // Generate dense forest clusters with much higher density
        if (features.treeDensity) {
            this.generateForestClusters(features.treeDensity * 4, theme); // Quadrupled density
        }

        // Generate rocks in clusters with much higher density
        this.generateRockClusters(150, theme); // Significantly increased

        // Generate bushes in clusters with much higher density
        this.generateBushClusters(120, theme); // Significantly increased
        
        // Generate mountain ranges along the boundary
        this.generateMountainRanges(theme, boundaryHalfSize);
        
        // Generate water features (lakes, ponds, rivers)
        this.generateWaterFeatures(theme, boundaryHalfSize);
        
        // Generate special environment features based on theme
        this.generateSpecialEnvironmentFeatures(theme, boundaryHalfSize);

        // Generate flowers in patches
        this.generateFlowerPatches(80, theme); // Increased from 40

        // Theme-specific environment
        switch (theme.primaryZone) {
            case 'Mountains':
                this.generateMountainRanges(30, theme); // Increased from 20
                break;
            case 'Swamp':
                this.generateWaterFeatures(25, theme); // Increased from 15
                break;
            case 'Desert':
                this.generateLavaFeatures(20, theme); // Increased from 10
                break;
        }
        
        // Add final layer of scattered objects for even more density
        this.generateScatteredObjects(theme);
    }
    
    /**
     * Generate background coverage - dense trees and objects across the entire map
     * This ensures the map doesn't look like a flat ground with sparse objects
     */
    generateBackgroundCoverage(theme) {
        const mapRadius = this.mapSize / 2;
        const gridSize = 12; // Smaller grid size for denser coverage (was 20)
        const gridCount = Math.ceil(this.mapSize / gridSize);
        
        // Create a grid across the entire map
        for (let x = -gridCount/2; x < gridCount/2; x++) {
            for (let z = -gridCount/2; z < gridCount/2; z++) {
                const cellX = x * gridSize;
                const cellZ = z * gridSize;
                
                // Calculate distance from center
                const distFromCenter = Math.sqrt(cellX * cellX + cellZ * cellZ);
                
                // Skip if outside map bounds
                if (distFromCenter > mapRadius) {
                    continue;
                }
                
                // Add random offset within the cell
                const offsetX = (this.rng() - 0.5) * gridSize * 0.8;
                const offsetZ = (this.rng() - 0.5) * gridSize * 0.8;
                
                const position = {
                    x: cellX + offsetX,
                    y: 0,
                    z: cellZ + offsetZ
                };
                
                // Skip if too close to paths or structures
                // Use the isBackgroundObject flag to ensure proper clearings
                if (!this.isPositionValid(position, 8, 5, true)) {
                    continue;
                }
                
                // Determine what to place based on distance from center and random factor
                const objectType = this.determineBackgroundObjectType(distFromCenter, mapRadius, theme);
                
                // Add the object
                if (objectType === 'tree') {
                    // Trees get smaller toward the edges for a natural boundary
                    const edgeFactor = 1 - (distFromCenter / mapRadius) * 0.3;
                    const treeSize = (0.6 + this.rng() * 0.6) * edgeFactor;
                    
                    this.mapData.environment.push({
                        type: 'tree',
                        position,
                        theme: theme.name,
                        size: treeSize,
                        background: true // Mark as background object
                    });
                    
                    // Add undergrowth near some trees
                    if (this.rng() < 0.4) {
                        const undergrowthPosition = this.getNearbyPosition(position, 0.5, 2);
                        const undergrowthType = this.rng() < 0.6 ? 'bush' : 
                                              (this.rng() < 0.5 ? 'flower' : 'small_plant');
                        
                        this.mapData.environment.push({
                            type: undergrowthType,
                            position: undergrowthPosition,
                            theme: theme.name,
                            size: 0.3 + this.rng() * 0.3,
                            background: true
                        });
                    }
                } else if (objectType === 'rock') {
                    this.mapData.environment.push({
                        type: 'rock',
                        position,
                        theme: theme.name,
                        size: 0.5 + this.rng() * 0.8,
                        background: true
                    });
                } else if (objectType === 'bush') {
                    this.mapData.environment.push({
                        type: 'bush',
                        position,
                        theme: theme.name,
                        size: 0.4 + this.rng() * 0.5,
                        background: true
                    });
                } else if (objectType === 'flower') {
                    this.mapData.environment.push({
                        type: 'flower',
                        position,
                        theme: theme.name,
                        size: 0.3 + this.rng() * 0.3,
                        background: true
                    });
                } else if (objectType === 'tall_grass') {
                    this.mapData.environment.push({
                        type: 'tall_grass',
                        position,
                        theme: theme.name,
                        size: 0.4 + this.rng() * 0.4,
                        background: true
                    });
                }
            }
        }
    }
    
    /**
     * Determine what type of background object to place based on distance and theme
     */
    determineBackgroundObjectType(distance, mapRadius, theme) {
        // Base probabilities adjusted by theme
        let treeProbability = theme.features.treeDensity * 0.7; // 0-0.7 based on theme
        let rockProbability = 0.1;
        let bushProbability = 0.15;
        let flowerProbability = 0.1;
        let grassProbability = 0.2;
        
        // Adjust based on distance from center
        const normalizedDistance = distance / mapRadius;
        
        // More trees in the middle, more rocks and sparse vegetation near edges
        if (normalizedDistance < 0.3) {
            // Inner area - dense trees
            treeProbability *= 1.3;
            rockProbability *= 0.7;
        } else if (normalizedDistance > 0.7) {
            // Outer area - more rocks, fewer trees
            treeProbability *= 0.8;
            rockProbability *= 1.5;
            bushProbability *= 1.2;
        }
        
        // Adjust based on theme
        switch (theme.primaryZone) {
            case 'Forest':
                treeProbability *= 1.5;
                bushProbability *= 1.2;
                break;
            case 'Mountains':
                rockProbability *= 2;
                treeProbability *= 0.7;
                break;
            case 'Swamp':
                bushProbability *= 1.5;
                grassProbability *= 1.5;
                treeProbability *= 0.8;
                break;
            case 'Desert':
                rockProbability *= 1.5;
                treeProbability *= 0.5;
                bushProbability *= 0.7;
                break;
        }
        
        // Determine object type based on probabilities
        const rand = this.rng();
        if (rand < treeProbability) {
            return 'tree';
        } else if (rand < treeProbability + rockProbability) {
            return 'rock';
        } else if (rand < treeProbability + rockProbability + bushProbability) {
            return 'bush';
        } else if (rand < treeProbability + rockProbability + bushProbability + flowerProbability) {
            return 'flower';
        } else {
            return 'tall_grass';
        }
    }
    
    /**
     * Generate final scattered objects to fill any remaining gaps
     */
    generateScatteredObjects(theme) {
        // Determine if this is a small map that needs special handling
        const isSmallMap = this.mapSize < 100;
        
        // Calculate object count based on map size with quadratic scaling for small maps
        // This ensures very small maps (e.g., size 50) have proportionally fewer objects
        let objectCount;
        if (isSmallMap) {
            // For small maps, use quadratic scaling to reduce object count more aggressively
            const scaleFactor = Math.pow(this.mapSize / 500, 2);
            objectCount = Math.floor(this.mapSize * 2.0 * scaleFactor);
            console.debug(`Small map detected (${this.mapSize}). Reducing scattered objects to ${objectCount} (scale: ${scaleFactor.toFixed(3)})`);
        } else {
            // For normal maps, use linear scaling
            objectCount = Math.floor(this.mapSize * 2.0);
        }
        
        // Define theme-specific object types with weights
        const objectTypes = this.getThemeSpecificScatteredObjects(theme);
        
        // Create weighted selection array
        const weightedTypes = [];
        objectTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate objects
        for (let i = 0; i < objectCount; i++) {
            const position = this.getRandomPosition(20, this.mapSize / 2);
            
            // Skip if too close to paths or structures
            // Use the isBackgroundObject flag for proper clearings
            if (!this.isPositionValid(position, 5, 3, true)) {
                continue;
            }
            
            // Select object type based on weighted distribution
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Determine if this should be a cluster
            const shouldCluster = typeInfo.canCluster && this.rng() < 0.3; // 30% chance for clustering
            
            if (shouldCluster) {
                // Create a small cluster of 2-5 objects
                const clusterSize = 2 + Math.floor(this.rng() * 4);
                const clusterRadius = 1 + this.rng() * 3;
                
                for (let j = 0; j < clusterSize; j++) {
                    const clusterPos = this.getNearbyPosition(position, 0.5, clusterRadius);
                    
                    // Add variation to size within the cluster
                    const sizeVariation = 0.8 + (this.rng() * 0.4); // 80-120% of base size
                    const objectSize = (typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize)) * sizeVariation;
                    
                    this.mapData.environment.push({
                        type: typeInfo.type,
                        position: clusterPos,
                        theme: theme.name,
                        size: objectSize,
                        variant: Math.floor(this.rng() * typeInfo.variants),
                        rotation: this.rng() * Math.PI * 2, // Random rotation
                        scattered: true, // Mark as scattered fill object
                        clustered: true, // Mark as part of a cluster
                        glowing: typeInfo.canGlow && this.rng() < 0.1 // 10% chance of glowing for applicable objects
                    });
                }
            } else {
                // Add single object
                this.mapData.environment.push({
                    type: typeInfo.type,
                    position,
                    theme: theme.name,
                    size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                    variant: Math.floor(this.rng() * typeInfo.variants),
                    rotation: this.rng() * Math.PI * 2, // Random rotation
                    scattered: true, // Mark as scattered fill object
                    glowing: typeInfo.canGlow && this.rng() < 0.05 // 5% chance of glowing for applicable objects
                });
            }
        }
    }
    
    /**
     * Get theme-specific scattered object types
     * @param {Object} theme - The current theme
     * @returns {Array} - Array of object type definitions with weights
     */
    getThemeSpecificScatteredObjects(theme) {
        // Common objects for all themes
        const commonObjects = THEME_SPECIFIC_OBJECTS.COMMON;
        
        // Theme-specific objects
        let themeObjects = [];
        
        switch (theme.primaryZone) {
            case 'Forest':
                themeObjects = THEME_SPECIFIC_OBJECTS.FOREST;
                break;
                
            case 'Mountains':
                themeObjects = THEME_SPECIFIC_OBJECTS.MOUNTAINS;
                break;
                
            case 'Desert':
                themeObjects = THEME_SPECIFIC_OBJECTS.DESERT;
                break;
                
            case 'Swamp':
                themeObjects = THEME_SPECIFIC_OBJECTS.SWAMP;
                break;
                
            case 'Ruins':
                themeObjects = THEME_SPECIFIC_OBJECTS.RUINS;
                break;
                
            default: // Terrant or other zones
                themeObjects = [
                    { type: ENVIRONMENT_OBJECTS.TREE, minSize: 0.7, maxSize: 1.8, weight: 5, variants: 4, canCluster: false, canGlow: false },
                    { type: 'crystal', minSize: 0.4, maxSize: 1.0, weight: 3, variants: 3, canCluster: true, canGlow: true },
                    { type: 'strange_plant', minSize: 0.5, maxSize: 1.2, weight: 4, variants: 4, canCluster: true, canGlow: true },
                    { type: ENVIRONMENT_OBJECTS.MAGICAL_STONE, minSize: 0.6, maxSize: 1.5, weight: 3, variants: 2, canCluster: false, canGlow: true }
                ];
                break;
        }
        
        // Combine common and theme-specific objects
        return [...commonObjects, ...themeObjects];
    }

    /**
     * Connect structures with smaller paths
     */
    connectStructuresWithPaths(theme) {
        console.debug('Connecting structures with paths...');
        
        const structures = this.mapData.structures;
        const pathWidth = theme.features.pathWidth * 0.6;

        // Connect nearby structures
        for (let i = 0; i < structures.length; i++) {
            for (let j = i + 1; j < structures.length; j++) {
                const struct1 = structures[i];
                const struct2 = structures[j];
                
                const distance = Math.sqrt(
                    Math.pow(struct1.position.x - struct2.position.x, 2) +
                    Math.pow(struct1.position.z - struct2.position.z, 2)
                );

                // Connect structures within 150 units
                if (distance < 150 && this.rng() < 0.4) {
                    this.createPath(`connection_${i}_${j}`, [
                        { x: struct1.position.x, z: struct1.position.z },
                        { x: struct2.position.x, z: struct2.position.z }
                    ], pathWidth, PATH_PATTERNS.CURVED);
                }
            }
        }
    }

    /**
     * Create a path between points
     */
    createPath(id, points, width, pattern) {
        const path = {
            id,
            points: points.map(p => ({ x: p.x, y: 0, z: p.z })),
            width,
            pattern,
            type: 'road'
        };

        // Add curve points for curved paths
        if (pattern === PATH_PATTERNS.CURVED && points.length === 2) {
            const start = points[0];
            const end = points[1];
            const midX = (start.x + end.x) / 2 + (this.rng() - 0.5) * 50;
            const midZ = (start.z + end.z) / 2 + (this.rng() - 0.5) * 50;
            
            path.points = [
                { x: start.x, y: 0, z: start.z },
                { x: midX, y: 0, z: midZ },
                { x: end.x, y: 0, z: end.z }
            ];
        }

        this.mapData.paths.push(path);
    }

    /**
     * Create a circular path
     */
    createCircularPath(id, center, radius, width) {
        const points = [];
        const segments = 16;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push({
                x: center.x + Math.cos(angle) * radius,
                y: 0,
                z: center.z + Math.sin(angle) * radius
            });
        }

        this.mapData.paths.push({
            id,
            points,
            width,
            pattern: PATH_PATTERNS.CIRCULAR,
            type: 'road'
        });
    }

    /**
     * Create a village structure with more unique and structured layout
     */
    createVillage(position, id, theme) {
        const village = {
            id,
            type: 'village',
            position,
            theme: theme.name,
            buildings: [],
            decorations: [],
            paths: [],
            connections: [] // Track building connections
        };

        // Determine village style based on theme and random factor
        // 0: Circular village, 1: Grid village, 2: Riverside village, 3: Mountain village
        const villageStyle = Math.floor(this.rng() * 4);
        
        // Generate more buildings for a substantial village
        const buildingCount = 10 + Math.floor(this.rng() * 12); // 10-22 buildings for denser villages
        
        // Add a central feature based on village style
        let centralFeature = null;
        
        switch(villageStyle) {
            case 0: // Circular village with central plaza
                centralFeature = {
                    type: 'plaza',
                    position: { x: position.x, y: 0, z: position.z },
                    radius: 6 + this.rng() * 3 // Smaller plaza for tighter village
                };
                
                // Create buildings in a circle around the plaza
                // First ring - important buildings
                const firstRingCount = 3 + Math.floor(this.rng() * 3); // 3-5 buildings
                for (let i = 0; i < firstRingCount; i++) {
                    const angle = (i / firstRingCount) * Math.PI * 2;
                    const distance = centralFeature.radius + 2 + this.rng() * 3; // Much closer to plaza
                    
                    // First ring has important buildings
                    const buildingType = this.rng() < 0.4 ? 'temple' : 
                                       (this.rng() < 0.6 ? 'shop' : 'tavern');
                    const buildingSize = buildingType === 'temple' ? 1.5 : 
                                       (buildingType === 'tavern' ? 1.3 : 1.2);
                    
                    village.buildings.push({
                        type: buildingType,
                        position: {
                            x: position.x + Math.cos(angle) * distance,
                            y: 0,
                            z: position.z + Math.sin(angle) * distance
                        },
                        rotation: angle + Math.PI, // Face toward plaza
                        width: (3 + this.rng() * 2) * buildingSize,
                        depth: (3 + this.rng() * 2) * buildingSize,
                        height: (2 + this.rng() * 1.5) * buildingSize,
                        style: Math.floor(this.rng() * 3), // 0-2 different building styles
                        ring: 1 // Track which ring this building is in
                    });
                }
                
                // Second ring - regular houses, tightly packed
                const secondRingCount = buildingCount - firstRingCount;
                for (let i = 0; i < secondRingCount; i++) {
                    // Stagger the angles to avoid direct alignment with first ring
                    const angleOffset = (0.5 / secondRingCount) * Math.PI * 2;
                    const angle = angleOffset + (i / secondRingCount) * Math.PI * 2;
                    
                    // Vary distance slightly but keep buildings close together
                    const ringRadius = centralFeature.radius + 8 + this.rng() * 4;
                    
                    // Add some radial variation to create clusters
                    const clusterVariation = (i % 3 === 0) ? (this.rng() * 3) : 0;
                    const distance = ringRadius + clusterVariation;
                    
                    // Second ring is mostly houses
                    const buildingType = this.rng() < 0.85 ? 'house' : 'shop';
                    const buildingSize = buildingType === 'shop' ? 1.1 : 1.0;
                    
                    // Add some lateral variation to create a less perfect circle
                    const lateralVariation = this.rng() * 2 - 1;
                    const lateralAngle = angle + Math.PI/2;
                    
                    const buildingPosition = {
                        x: position.x + Math.cos(angle) * distance + Math.cos(lateralAngle) * lateralVariation,
                        y: 0,
                        z: position.z + Math.sin(angle) * distance + Math.sin(lateralAngle) * lateralVariation
                    };
                    
                    // Vary rotation slightly to create more organic feel
                    const rotationVariation = (this.rng() * 0.4) - 0.2; // -0.2 to 0.2 radians
                    
                    village.buildings.push({
                        type: buildingType,
                        position: buildingPosition,
                        rotation: angle + Math.PI + rotationVariation, // Face toward plaza with slight variation
                        width: (2.5 + this.rng() * 1.5) * buildingSize, // Smaller, more consistent sizes
                        depth: (2.5 + this.rng() * 1.5) * buildingSize,
                        height: (2 + this.rng() * 1) * buildingSize,
                        style: Math.floor(this.rng() * 3),
                        ring: 2
                    });
                    
                    // Add small decorations near houses - gardens, wells, etc.
                    if (this.rng() < 0.4) {
                        const decorType = this.rng() < 0.5 ? 'garden' : 
                                        (this.rng() < 0.5 ? 'well' : 'woodpile');
                        
                        const decorDist = 2 + this.rng() * 1.5;
                        const decorAngle = angle + (this.rng() * Math.PI/2 - Math.PI/4);
                        
                        village.decorations.push({
                            type: decorType,
                            position: {
                                x: buildingPosition.x + Math.cos(decorAngle) * decorDist,
                                y: 0,
                                z: buildingPosition.z + Math.sin(decorAngle) * decorDist
                            },
                            rotation: this.rng() * Math.PI * 2,
                            size: 0.6 + this.rng() * 0.4
                        });
                    }
                }
                
                // Add decorative elements to the plaza
                for (let i = 0; i < 2 + Math.floor(this.rng() * 2); i++) {
                    const angle = this.rng() * Math.PI * 2;
                    const distance = this.rng() * centralFeature.radius * 0.6;
                    
                    village.decorations.push({
                        type: this.rng() < 0.4 ? 'statue' : 
                             (this.rng() < 0.6 ? 'fountain' : 'market_stall'),
                        position: {
                            x: position.x + Math.cos(angle) * distance,
                            y: 0,
                            z: position.z + Math.sin(angle) * distance
                        },
                        rotation: this.rng() * Math.PI * 2,
                        size: 0.8 + this.rng() * 0.4
                    });
                }
                
                // Create multiple paths - main circular path plus connecting paths
                // Main circular path around the plaza
                village.paths.push({
                    type: 'circle',
                    center: { x: position.x, y: 0, z: position.z },
                    radius: centralFeature.radius + 2,
                    width: 2 + this.rng(),
                    pathType: 'main'
                });
                
                // Add secondary paths connecting buildings
                for (let i = 0; i < village.buildings.length; i++) {
                    const building = village.buildings[i];
                    
                    // Connect to plaza
                    village.paths.push({
                        type: 'line',
                        points: [
                            { x: position.x, y: 0, z: position.z },
                            { x: building.position.x, y: 0, z: building.position.z }
                        ],
                        width: 1 + this.rng() * 0.5,
                        pathType: 'secondary'
                    });
                    
                    // Connect some buildings to each other
                    if (i > 0 && this.rng() < 0.7) {
                        // Find a nearby building to connect to
                        let nearestIdx = -1;
                        let minDist = 999;
                        
                        for (let j = 0; j < village.buildings.length; j++) {
                            if (i === j) continue;
                            
                            const otherBuilding = village.buildings[j];
                            const dx = building.position.x - otherBuilding.position.x;
                            const dz = building.position.z - otherBuilding.position.z;
                            const dist = Math.sqrt(dx * dx + dz * dz);
                            
                            if (dist < minDist && dist < 20) { // Only connect if reasonably close
                                minDist = dist;
                                nearestIdx = j;
                            }
                        }
                        
                        if (nearestIdx >= 0) {
                            const otherBuilding = village.buildings[nearestIdx];
                            
                            // Add a slightly curved path between buildings
                            const midX = (building.position.x + otherBuilding.position.x) / 2;
                            const midZ = (building.position.z + otherBuilding.position.z) / 2;
                            
                            // Add slight curve
                            const perpX = -(otherBuilding.position.z - building.position.z);
                            const perpZ = otherBuilding.position.x - building.position.x;
                            const perpLen = Math.sqrt(perpX * perpX + perpZ * perpZ);
                            const curveFactor = (this.rng() * 2 - 1) * 0.2; // -0.2 to 0.2
                            
                            const controlX = midX + (perpX / perpLen) * curveFactor * minDist;
                            const controlZ = midZ + (perpZ / perpLen) * curveFactor * minDist;
                            
                            village.paths.push({
                                type: 'curve',
                                points: [
                                    { x: building.position.x, y: 0, z: building.position.z },
                                    { x: controlX, y: 0, z: controlZ },
                                    { x: otherBuilding.position.x, y: 0, z: otherBuilding.position.z }
                                ],
                                width: 1 + this.rng() * 0.5,
                                pathType: 'tertiary'
                            });
                            
                            // Record the connection
                            village.connections.push({
                                from: i,
                                to: nearestIdx,
                                type: 'path'
                            });
                        }
                    }
                }
                break;
                
            case 1: // Grid village with streets
                // Create a grid of buildings
                const gridSize = Math.floor(Math.sqrt(buildingCount)) + 1;
                const gridSpacing = 12 + this.rng() * 4;
                const gridOffset = (gridSize - 1) * gridSpacing / 2;
                
                // Create main square in the center
                centralFeature = {
                    type: 'square',
                    position: { x: position.x, y: 0, z: position.z },
                    size: gridSpacing * 1.5
                };
                
                // Add buildings in a grid pattern
                let buildingIndex = 0;
                for (let row = 0; row < gridSize; row++) {
                    for (let col = 0; col < gridSize; col++) {
                        // Skip the center for the main square
                        if (row === Math.floor(gridSize/2) && col === Math.floor(gridSize/2)) {
                            continue;
                        }
                        
                        if (buildingIndex < buildingCount) {
                            const buildingX = position.x - gridOffset + col * gridSpacing;
                            const buildingZ = position.z - gridOffset + row * gridSpacing;
                            
                            // Add some randomness to grid positions
                            const offsetX = (this.rng() - 0.5) * 3;
                            const offsetZ = (this.rng() - 0.5) * 3;
                            
                            // Vary building types
                            const buildingType = this.rng() < 0.7 ? 'house' : (this.rng() < 0.5 ? 'shop' : 'temple');
                            const buildingSize = buildingType === 'temple' ? 1.5 : (buildingType === 'shop' ? 1.2 : 1.0);
                            
                            // Determine building rotation (face the street)
                            let rotation = 0;
                            if (row === 0) rotation = Math.PI / 2; // Face south
                            else if (col === 0) rotation = 0; // Face east
                            else if (row === gridSize - 1) rotation = -Math.PI / 2; // Face north
                            else if (col === gridSize - 1) rotation = Math.PI; // Face west
                            else rotation = Math.floor(this.rng() * 4) * (Math.PI / 2); // Random cardinal direction
                            
                            village.buildings.push({
                                type: buildingType,
                                position: {
                                    x: buildingX + offsetX,
                                    y: 0,
                                    z: buildingZ + offsetZ
                                },
                                rotation: rotation,
                                width: (3 + this.rng() * 3) * buildingSize,
                                depth: (3 + this.rng() * 3) * buildingSize,
                                height: (2 + this.rng() * 2) * buildingSize,
                                style: Math.floor(this.rng() * 3) // 0-2 different building styles
                            });
                            
                            buildingIndex++;
                        }
                    }
                }
                
                // Create grid of streets
                for (let i = 0; i <= gridSize; i++) {
                    // Horizontal streets
                    village.paths.push({
                        type: 'line',
                        points: [
                            { x: position.x - gridOffset - 5, y: 0, z: position.z - gridOffset + i * gridSpacing },
                            { x: position.x + gridOffset + 5, y: 0, z: position.z - gridOffset + i * gridSpacing }
                        ],
                        width: i === Math.floor(gridSize/2) ? 4 : 3 // Main street is wider
                    });
                    
                    // Vertical streets
                    village.paths.push({
                        type: 'line',
                        points: [
                            { x: position.x - gridOffset + i * gridSpacing, y: 0, z: position.z - gridOffset - 5 },
                            { x: position.x - gridOffset + i * gridSpacing, y: 0, z: position.z + gridOffset + 5 }
                        ],
                        width: i === Math.floor(gridSize/2) ? 4 : 3 // Main street is wider
                    });
                }
                
                // Add decorations to the main square
                for (let i = 0; i < 2 + Math.floor(this.rng() * 3); i++) {
                    village.decorations.push({
                        type: this.rng() < 0.6 ? 'statue' : (this.rng() < 0.5 ? 'fountain' : 'well'),
                        position: {
                            x: position.x + (this.rng() - 0.5) * centralFeature.size * 0.6,
                            y: 0,
                            z: position.z + (this.rng() - 0.5) * centralFeature.size * 0.6
                        },
                        size: 1 + this.rng() * 1.5
                    });
                }
                break;
                
            case 2: // Riverside/linear village
                // Create a main street along a curve
                const pathPoints = [];
                const pathLength = 60 + this.rng() * 40;
                const pathSegments = 5 + Math.floor(this.rng() * 3);
                
                // Generate a curved path
                for (let i = 0; i <= pathSegments; i++) {
                    const t = i / pathSegments;
                    const pathX = position.x + (t - 0.5) * pathLength;
                    // Create a gentle curve
                    const pathZ = position.z + Math.sin(t * Math.PI) * (10 + this.rng() * 15) * (this.rng() < 0.5 ? 1 : -1);
                    
                    pathPoints.push({ x: pathX, y: 0, z: pathZ });
                }
                
                // Create the main street
                village.paths.push({
                    type: 'line',
                    points: pathPoints,
                    width: 4
                });
                
                // Place buildings along the path
                for (let i = 0; i < buildingCount; i++) {
                    // Choose a random segment of the path
                    const segmentIndex = Math.floor(this.rng() * pathSegments);
                    const t = this.rng(); // Position along the segment
                    
                    const startPoint = pathPoints[segmentIndex];
                    const endPoint = pathPoints[segmentIndex + 1];
                    
                    // Interpolate position along the segment
                    const buildingX = startPoint.x + (endPoint.x - startPoint.x) * t;
                    const buildingZ = startPoint.z + (endPoint.z - startPoint.z) * t;
                    
                    // Determine which side of the path to place the building
                    const side = this.rng() < 0.5 ? 1 : -1;
                    
                    // Calculate perpendicular direction to path
                    const pathDirX = endPoint.x - startPoint.x;
                    const pathDirZ = endPoint.z - startPoint.z;
                    const perpX = -pathDirZ;
                    const perpZ = pathDirX;
                    
                    // Normalize perpendicular vector
                    const perpLength = Math.sqrt(perpX * perpX + perpZ * perpZ);
                    const normPerpX = perpX / perpLength;
                    const normPerpZ = perpZ / perpLength;
                    
                    // Distance from path
                    const distance = 6 + this.rng() * 4;
                    
                    // Building position
                    const finalX = buildingX + normPerpX * distance * side;
                    const finalZ = buildingZ + normPerpZ * distance * side;
                    
                    // Calculate rotation to face the path
                    const rotation = Math.atan2(normPerpX, normPerpZ) + (side > 0 ? Math.PI : 0);
                    
                    // Vary building types
                    const buildingType = this.rng() < 0.7 ? 'house' : (this.rng() < 0.5 ? 'shop' : 'temple');
                    const buildingSize = buildingType === 'temple' ? 1.5 : (buildingType === 'shop' ? 1.2 : 1.0);
                    
                    village.buildings.push({
                        type: buildingType,
                        position: {
                            x: finalX,
                            y: 0,
                            z: finalZ
                        },
                        rotation: rotation,
                        width: (3 + this.rng() * 3) * buildingSize,
                        depth: (3 + this.rng() * 3) * buildingSize,
                        height: (2 + this.rng() * 2) * buildingSize,
                        style: Math.floor(this.rng() * 3) // 0-2 different building styles
                    });
                }
                
                // Add a central feature (like a market or temple) somewhere along the path
                const centralIndex = Math.floor(pathSegments / 2);
                const centralPoint = pathPoints[centralIndex];
                
                centralFeature = {
                    type: 'market',
                    position: {
                        x: centralPoint.x,
                        y: 0,
                        z: centralPoint.z + (this.rng() < 0.5 ? 10 : -10)
                    },
                    size: 8 + this.rng() * 4
                };
                
                // Add decorations near the central feature
                for (let i = 0; i < 2 + Math.floor(this.rng() * 2); i++) {
                    village.decorations.push({
                        type: this.rng() < 0.5 ? 'well' : 'statue',
                        position: {
                            x: centralFeature.position.x + (this.rng() - 0.5) * 10,
                            y: 0,
                            z: centralFeature.position.z + (this.rng() - 0.5) * 10
                        },
                        size: 1 + this.rng() * 1
                    });
                }
                break;
                
            case 3: // Mountain/hillside village with terraced layout
                // Create a terraced layout with buildings at different heights
                const terraceCount = 3 + Math.floor(this.rng() * 2);
                const terraceRadius = 15 + this.rng() * 10;
                const terraceStep = 2; // Height difference between terraces
                
                // Central feature is a temple or shrine at the top
                centralFeature = {
                    type: 'temple',
                    position: {
                        x: position.x,
                        y: terraceCount * terraceStep,
                        z: position.z
                    },
                    size: 6 + this.rng() * 3
                };
                
                // Add the central temple/shrine
                village.buildings.push({
                    type: 'temple',
                    position: centralFeature.position,
                    rotation: this.rng() * Math.PI * 2,
                    width: 6 + this.rng() * 2,
                    depth: 6 + this.rng() * 2,
                    height: 5 + this.rng() * 2,
                    style: Math.floor(this.rng() * 3)
                });
                
                // Distribute remaining buildings on terraces
                const buildingsPerTerrace = Math.floor(buildingCount / terraceCount);
                
                for (let terrace = 0; terrace < terraceCount; terrace++) {
                    const terraceHeight = terrace * terraceStep;
                    const currentRadius = terraceRadius + (terraceCount - terrace) * 8;
                    
                    // Create a circular path for this terrace
                    village.paths.push({
                        type: 'circle',
                        center: { x: position.x, y: terraceHeight, z: position.z },
                        radius: currentRadius,
                        width: 2.5
                    });
                    
                    // Add buildings on this terrace
                    const currentBuildingCount = terrace === 0 ? buildingsPerTerrace + (buildingCount % terraceCount) : buildingsPerTerrace;
                    
                    for (let i = 0; i < currentBuildingCount; i++) {
                        const angle = (i / currentBuildingCount) * Math.PI * 2 + (this.rng() - 0.5) * 0.2;
                        const distance = currentRadius - 3 - this.rng() * 2;
                        
                        // Vary building types, with more important buildings on higher terraces
                        const typeRandom = this.rng();
                        const buildingType = terrace >= terraceCount - 2 ? 
                            (typeRandom < 0.6 ? 'house' : (typeRandom < 0.8 ? 'shop' : 'temple')) :
                            (typeRandom < 0.8 ? 'house' : 'shop');
                            
                        const buildingSize = buildingType === 'temple' ? 1.4 : (buildingType === 'shop' ? 1.1 : 1.0);
                        
                        village.buildings.push({
                            type: buildingType,
                            position: {
                                x: position.x + Math.cos(angle) * distance,
                                y: terraceHeight,
                                z: position.z + Math.sin(angle) * distance
                            },
                            rotation: angle + Math.PI, // Face inward
                            width: (2.5 + this.rng() * 2) * buildingSize,
                            depth: (2.5 + this.rng() * 2) * buildingSize,
                            height: (2 + this.rng() * 1.5) * buildingSize,
                            style: Math.floor(this.rng() * 3)
                        });
                    }
                }
                
                // Add stairs connecting terraces
                for (let terrace = 0; terrace < terraceCount; terrace++) {
                    const stairAngle = (terrace / terraceCount) * Math.PI * 2;
                    
                    village.decorations.push({
                        type: 'stairs',
                        position: {
                            x: position.x + Math.cos(stairAngle) * (terraceRadius + (terraceCount - terrace) * 8),
                            y: terrace * terraceStep,
                            z: position.z + Math.sin(stairAngle) * (terraceRadius + (terraceCount - terrace) * 8)
                        },
                        rotation: stairAngle + Math.PI,
                        width: 4 + this.rng(),
                        height: terraceStep
                    });
                }
                
                // Add decorative elements
                for (let i = 0; i < 3 + Math.floor(this.rng() * 3); i++) {
                    const terrace = Math.floor(this.rng() * terraceCount);
                    const terraceHeight = terrace * terraceStep;
                    const angle = this.rng() * Math.PI * 2;
                    const distance = (terraceRadius + (terraceCount - terrace) * 8) * 0.8 * this.rng();
                    
                    village.decorations.push({
                        type: this.rng() < 0.7 ? 'statue' : 'fountain',
                        position: {
                            x: position.x + Math.cos(angle) * distance,
                            y: terraceHeight,
                            z: position.z + Math.sin(angle) * distance
                        },
                        size: 1 + this.rng()
                    });
                }
                break;
        }
        
        // Add village-specific environment objects
        const environmentObjectCount = 5 + Math.floor(this.rng() * 10);
        for (let i = 0; i < environmentObjectCount; i++) {
            const angle = this.rng() * Math.PI * 2;
            const distance = 20 + this.rng() * 15;
            
            const envType = this.rng() < 0.5 ? 'tree' : (this.rng() < 0.7 ? 'bush' : 'rock');
            
            village.decorations.push({
                type: envType,
                position: {
                    x: position.x + Math.cos(angle) * distance,
                    y: 0,
                    z: position.z + Math.sin(angle) * distance
                },
                size: 0.8 + this.rng() * 0.4
            });
        }
        
        // Store the village style and central feature
        village.style = villageStyle;
        village.centralFeature = centralFeature;
        
        this.mapData.structures.push(village);
    }

    /**
     * Create a tower structure
     */
    createTower(position, id, theme) {
        this.mapData.structures.push({
            id,
            type: 'tower',
            position,
            theme: theme.name,
            height: 15 + this.rng() * 10,
            radius: 3 + this.rng() * 2
        });
    }

    /**
     * Create ruins structure
     */
    createRuins(position, id, theme) {
        this.mapData.structures.push({
            id,
            type: 'ruins',
            position,
            theme: theme.name,
            size: 5 + this.rng() * 10
        });
    }

    /**
     * Create dark sanctum structure
     */
    createDarkSanctum(position, id, theme) {
        this.mapData.structures.push({
            id,
            type: 'darkSanctum',
            position,
            theme: theme.name,
            size: 8 + this.rng() * 6
        });
    }

    /**
     * Create bridge structure
     */
    createBridge(position, id, theme) {
        this.mapData.structures.push({
            id,
            type: 'bridge',
            position,
            theme: theme.name,
            length: 10 + this.rng() * 15,
            width: 3 + this.rng() * 2
        });
    }

    /**
     * Generate trees along paths using tree clusters for better performance
     */
    generateTreesAlongPaths(density, theme) {
        // Check if tree clustering is enabled in the theme features
        const useTreeClustering = theme.features?.useTreeClustering === true;
        const clusterThreshold = theme.features?.clusterThreshold || 5;
        const clusterRadius = theme.features?.clusterRadius || 20;
        const maxTreesPerCluster = theme.features?.maxTreesPerCluster || 25;
        
        // Determine if this is a small map that needs special handling
        const isSmallMap = this.mapSize < 100;
        
        // Adjust density for small maps
        let adjustedDensity = density;
        if (isSmallMap) {
            // For small maps, use quadratic scaling to reduce tree density more aggressively
            const scaleFactor = Math.pow(this.mapSize / 500, 2);
            adjustedDensity = density * scaleFactor;
            console.debug(`Small map detected (${this.mapSize}). Reducing path tree density to ${adjustedDensity.toFixed(3)} (scale: ${scaleFactor.toFixed(3)})`);
        }
        
        console.debug(`Generating trees along paths with tree clustering ${useTreeClustering ? 'enabled' : 'disabled'}`);
        
        // Process each path segment
        this.mapData.paths.forEach((path, pathIndex) => {
            // Create clusters for each path segment
            const pathClusters = [];
            
            path.points.forEach((point, index) => {
                if (index < path.points.length - 1) {
                    const nextPoint = path.points[index + 1];
                    const distance = Math.sqrt(
                        Math.pow(nextPoint.x - point.x, 2) +
                        Math.pow(nextPoint.z - point.z, 2)
                    );
                    
                    // Calculate tree count based on adjusted density
                    const treeCount = Math.floor(distance * adjustedDensity / 4); // Lower density
                    
                    // Create tree positions for left and right sides of the path
                    const leftSideTrees = [];
                    const rightSideTrees = [];
                    
                    for (let i = 0; i < treeCount; i++) {
                        const t = i / treeCount;
                        const x = point.x + (nextPoint.x - point.x) * t;
                        const z = point.z + (nextPoint.z - point.z) * t;
                        
                        // Create trees on both sides of the path
                        for (let side = -1; side <= 1; side += 2) { // -1 = left, 1 = right
                            // Vary the offset to create a more natural forest edge
                            const baseOffset = path.width + 2;
                            const variableOffset = this.rng() * 8; // Smaller variation for tighter grouping
                            const offset = baseOffset + variableOffset;
                            
                            // Add trees with varying sizes
                            const treeSize = 0.7 + this.rng() * 0.6; // 0.7 to 1.3 size multiplier
                            
                            // Create tree position
                            const treePosition = {
                                x: x + side * offset,
                                y: 0,
                                z: z + side * offset,
                                size: treeSize
                            };
                            
                            // Add to appropriate side collection
                            if (side < 0) {
                                leftSideTrees.push(treePosition);
                            } else {
                                rightSideTrees.push(treePosition);
                            }
                            
                            // Add multiple rows of trees for denser forest (but fewer than before)
                            for (let row = 1; row <= 2; row++) { // Reduced from 3 to 2 rows
                                if (this.rng() < 0.7 - (row * 0.2)) { // Lower chance for additional rows
                                    const rowOffset = offset + (row * 3) + this.rng() * 4;
                                    
                                    // Add slight lateral variation
                                    const lateralShift = this.rng() * 4 - 2; // -2 to 2 units shift
                                    
                                    // Create additional tree position
                                    const additionalTreePosition = {
                                        x: x + side * rowOffset + lateralShift,
                                        y: 0,
                                        z: z + side * rowOffset + lateralShift,
                                        size: 0.6 + this.rng() * 0.8 // More size variation
                                    };
                                    
                                    // Add to appropriate side collection
                                    if (side < 0) {
                                        leftSideTrees.push(additionalTreePosition);
                                    } else {
                                        rightSideTrees.push(additionalTreePosition);
                                    }
                                }
                            }
                        }
                    }
                    
                    // Create tree clusters for each side if there are enough trees and clustering is enabled
                    if (useTreeClustering && leftSideTrees.length >= clusterThreshold) {
                        const clusterCenter = this.calculateCenter(leftSideTrees);
                        pathClusters.push({
                            position: clusterCenter,
                            treePositions: leftSideTrees,
                            clusterName: `path_${pathIndex}_segment_${index}_left`,
                            useTreeClustering: true,
                            clusterThreshold: clusterThreshold,
                            clusterRadius: clusterRadius,
                            maxTreesPerCluster: maxTreesPerCluster
                        });
                    } else {
                        // Add individual trees if clustering is disabled or not enough for a cluster
                        leftSideTrees.forEach(treePos => {
                            this.mapData.environment.push({
                                type: 'tree',
                                position: {
                                    x: treePos.x,
                                    y: treePos.y,
                                    z: treePos.z
                                },
                                theme: theme.name,
                                size: treePos.size
                            });
                        });
                    }
                    
                    if (useTreeClustering && rightSideTrees.length >= clusterThreshold) {
                        const clusterCenter = this.calculateCenter(rightSideTrees);
                        pathClusters.push({
                            position: clusterCenter,
                            treePositions: rightSideTrees,
                            clusterName: `path_${pathIndex}_segment_${index}_right`,
                            useTreeClustering: true,
                            clusterThreshold: clusterThreshold,
                            clusterRadius: clusterRadius,
                            maxTreesPerCluster: maxTreesPerCluster
                        });
                    } else {
                        // Add individual trees if clustering is disabled or not enough for a cluster
                        rightSideTrees.forEach(treePos => {
                            this.mapData.environment.push({
                                type: 'tree',
                                position: {
                                    x: treePos.x,
                                    y: treePos.y,
                                    z: treePos.z
                                },
                                theme: theme.name,
                                size: treePos.size
                            });
                        });
                    }
                }
            });
            
            // Add all path clusters to the environment
            pathClusters.forEach(cluster => {
                this.mapData.environment.push({
                    type: 'tree_cluster',
                    position: cluster.position,
                    theme: theme.name,
                    treePositions: cluster.treePositions,
                    clusterName: cluster.clusterName
                });
            });
        });
    }
    
    /**
     * Calculate the center position of a group of tree positions
     * @param {Array} positions - Array of position objects with x, y, z properties
     * @returns {Object} - Center position
     */
    calculateCenter(positions) {
        if (positions.length === 0) {
            return { x: 0, y: 0, z: 0 };
        }
        
        let sumX = 0, sumY = 0, sumZ = 0;
        
        positions.forEach(pos => {
            sumX += pos.x;
            sumY += pos.y || 0;
            sumZ += pos.z;
        });
        
        return {
            x: sumX / positions.length,
            y: sumY / positions.length,
            z: sumZ / positions.length
        };
    }
    
    /**
     * Add vegetation along paths
     * @param {Object} path - Path object
     * @param {Object} theme - Theme object
     */
    addVegetationAlongPath(path, theme) {
        path.points.forEach((point, index) => {
            if (index < path.points.length - 1) {
                const nextPoint = path.points[index + 1];
                const distance = Math.sqrt(
                    Math.pow(nextPoint.x - point.x, 2) +
                    Math.pow(nextPoint.z - point.z, 2)
                );
                
                const vegetationCount = Math.floor(distance / 5);
                
                for (let i = 0; i < vegetationCount; i++) {
                    const t = i / vegetationCount;
                    const x = point.x + (nextPoint.x - point.x) * t;
                    const z = point.z + (nextPoint.z - point.z) * t;
                    
                    // Add vegetation on both sides of the path
                    for (let side = -1; side <= 1; side += 2) {
                        // Vary the offset
                        const baseOffset = path.width + 1;
                        const variableOffset = this.rng() * 2;
                        const offset = baseOffset + variableOffset;
                        
                        // Add bushes
                        if (this.rng() < 0.2) {
                            const bushOffset = offset + (this.rng() - 0.5) * 3;
                            this.mapData.environment.push({
                                type: 'bush',
                                position: {
                                    x: x + side * bushOffset,
                                    y: 0,
                                    z: z + side * bushOffset
                                },
                                theme: theme.name,
                                size: 0.4 + this.rng() * 0.3 // Smaller bushes
                            });
                        }
                        
                        // Add rocks
                        if (this.rng() < 0.1) {
                            const rockOffset = offset + (this.rng() - 0.5) * 3;
                            this.mapData.environment.push({
                                type: 'rock',
                                position: {
                                    x: x + side * rockOffset,
                                    y: 0,
                                    z: z + side * rockOffset
                                },
                                theme: theme.name,
                                size: 0.5 + this.rng() * 0.5
                            });
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Generate dense forest clusters throughout the map
     * Optimized to use tree_cluster objects for better performance
     */
    generateForestClusters(density, theme) {
        // Check if tree clustering is enabled in the theme features
        const useTreeClustering = theme.features?.useTreeClustering === true;
        const clusterThreshold = theme.features?.clusterThreshold || 5;
        const clusterRadius = theme.features?.clusterRadius || 20;
        const maxTreesPerCluster = theme.features?.maxTreesPerCluster || 25;
        
        // Determine if this is a small map that needs special handling
        const isSmallMap = this.mapSize < 100;
        
        // Number of forest clusters based on map size and density
        let clusterCount;
        
        if (isSmallMap) {
            // For small maps, use cubic scaling to reduce cluster count even more aggressively
            const scaleFactor = Math.pow(this.mapSize / 500, 3);
            clusterCount = Math.max(1, Math.floor((this.mapSize / 100) * density * 0.7 * scaleFactor));
            console.debug(`Small map detected (${this.mapSize}). Reducing forest clusters to ${clusterCount} (scale: ${scaleFactor.toFixed(3)})`);
        } else {
            // For normal maps, use standard calculation with 30% fewer clusters
            clusterCount = Math.floor((this.mapSize / 100) * density * 0.7);
        }
        
        console.debug(`Generating ${clusterCount} forest clusters with tree clustering ${useTreeClustering ? 'enabled' : 'disabled'}`);
        
        for (let i = 0; i < clusterCount; i++) {
            // Create forest clusters away from paths and structures
            const clusterCenter = this.getRandomPosition(100, 400);
            
            // Skip if too close to structures or paths
            if (!this.isPositionValid(clusterCenter, 30, 20)) {
                continue;
            }
            
            // Determine forest cluster size - larger clusters for better performance
            // If tree clustering is enabled, we can have more trees per cluster
            const clusterSize = useTreeClustering 
                ? clusterThreshold + Math.floor(this.rng() * (maxTreesPerCluster - clusterThreshold))
                : 15 + Math.floor(this.rng() * 20); // 15-35 trees per cluster (reduced)
            
            // If tree clustering is enabled, we can have larger clusters
            const forestClusterRadius = useTreeClustering
                ? clusterRadius + this.rng() * 10 // 20-30 units radius
                : 15 + this.rng() * 25; // 15-40 units radius
            
            // Create a tree cluster object with tree positions
            const treePositions = [];
            const undergrowthObjects = [];
            
            // Generate trees in the cluster with tight spacing
            for (let j = 0; j < clusterSize; j++) {
                // Trees get denser toward the center of the cluster
                const distanceFromCenter = this.rng() * this.rng() * forestClusterRadius; // Squared distribution
                const angle = this.rng() * Math.PI * 2;
                
                const treePosition = {
                    x: clusterCenter.x + Math.cos(angle) * distanceFromCenter,
                    y: 0,
                    z: clusterCenter.z + Math.sin(angle) * distanceFromCenter
                };
                
                // Add some randomness to tree size - smaller trees more common
                const treeSize = 0.6 + this.rng() * this.rng() * 0.8; // 0.6-1.4 with bias toward smaller
                
                // Add tree to positions array
                treePositions.push({
                    x: treePosition.x,
                    y: treePosition.y,
                    z: treePosition.z,
                    size: treeSize
                });
                
                // Add undergrowth - bushes, flowers, fallen logs, etc.
                if (this.rng() < 0.3) { // Reduced undergrowth density
                    const undergrowthType = this.rng() < 0.6 ? 'bush' : 
                                          (this.rng() < 0.5 ? 'flower' : 'fallen_log');
                    
                    const undergrowthPosition = this.getNearbyPosition(treePosition, 1, 3);
                    
                    undergrowthObjects.push({
                        type: undergrowthType,
                        position: undergrowthPosition,
                        theme: theme.name,
                        size: 0.3 + this.rng() * 0.3,
                        cluster: `forest_${i}`
                    });
                }
            }
            
            // Create a tree cluster object instead of individual trees
            if (treePositions.length > 0) {
                this.mapData.environment.push({
                    type: 'tree_cluster',
                    position: clusterCenter, // Center position of the cluster
                    theme: theme.name,
                    treePositions: treePositions,
                    clusterName: `forest_${i}`,
                    clusterRadius: forestClusterRadius,
                    // Add clustering parameters for the renderer
                    useTreeClustering: useTreeClustering,
                    clusterThreshold: clusterThreshold,
                    maxTreesPerCluster: maxTreesPerCluster
                });
                
                // Add undergrowth objects separately
                undergrowthObjects.forEach(obj => {
                    this.mapData.environment.push(obj);
                });
            }
            
            // Add some clearings within the forest
            if (this.rng() < 0.4 && forestClusterRadius > 25) {
                const clearingCount = 1 + Math.floor(this.rng() * 2);
                
                for (let c = 0; c < clearingCount; c++) {
                    const clearingPosition = this.getNearbyPosition(clusterCenter, 5, forestClusterRadius * 0.7);
                    const clearingRadius = 3 + this.rng() * 5;
                    
                    // Add special features to clearings
                    if (this.rng() < 0.7) {
                        // Add a special feature - rock formation, small shrine, etc.
                        const featureType = this.rng() < 0.5 ? 'rock_formation' : 
                                          (this.rng() < 0.5 ? 'shrine' : 'stump');
                        
                        this.mapData.environment.push({
                            type: featureType,
                            position: clearingPosition,
                            theme: theme.name,
                            size: 1 + this.rng() * 0.5,
                            cluster: `forest_${i}`
                        });
                    }
                    
                    // Add flowers or mushrooms in the clearing
                    const smallFeatureCount = 3 + Math.floor(this.rng() * 5);
                    for (let f = 0; f < smallFeatureCount; f++) {
                        const featurePosition = this.getNearbyPosition(clearingPosition, 0.5, clearingRadius);
                        const featureType = this.rng() < 0.6 ? 'flower' : 'mushroom';
                        
                        this.mapData.environment.push({
                            type: featureType,
                            position: featurePosition,
                            theme: theme.name,
                            size: 0.2 + this.rng() * 0.3,
                            cluster: `forest_${i}`
                        });
                    }
                }
            }
        }
    }

    /**
     * Generate rock clusters
     */
    generateRockClusters(count, theme) {
        // Create several rock formations/clusters
        const clusterCount = Math.floor(count / 5); // Create fewer, denser clusters
        
        for (let i = 0; i < clusterCount; i++) {
            const clusterCenter = this.getRandomPosition(50, 400);
            
            // Skip if too close to structures
            if (!this.isPositionValid(clusterCenter, 20, 10)) {
                continue;
            }
            
            // Determine cluster size
            const rocksInCluster = 3 + Math.floor(this.rng() * 7); // 3-10 rocks per cluster
            const clusterRadius = 5 + this.rng() * 10; // 5-15 units radius
            
            // Generate rocks in the cluster
            for (let j = 0; j < rocksInCluster; j++) {
                // Rocks get denser toward the center
                const distanceFromCenter = this.rng() * clusterRadius;
                const angle = this.rng() * Math.PI * 2;
                
                const rockPosition = {
                    x: clusterCenter.x + Math.cos(angle) * distanceFromCenter,
                    y: 0,
                    z: clusterCenter.z + Math.sin(angle) * distanceFromCenter
                };
                
                // Vary rock sizes - create some large boulders and smaller rocks
                const isLargeBoulder = j === 0 || this.rng() < 0.2;
                const rockSize = isLargeBoulder ? 
                    (2 + this.rng() * 3) : // 2-5 size for boulders
                    (0.5 + this.rng() * 1.5); // 0.5-2 size for regular rocks
                
                this.mapData.environment.push({
                    type: 'rock',
                    position: rockPosition,
                    theme: theme.name,
                    size: rockSize,
                    cluster: `rock_formation_${i}`
                });
                
                // Add moss or small plants around rocks
                if (this.rng() < 0.3) {
                    const plantPosition = this.getNearbyPosition(rockPosition, 0.5, 1.5);
                    this.mapData.environment.push({
                        type: this.rng() < 0.7 ? 'moss' : 'small_plant',
                        position: plantPosition,
                        theme: theme.name,
                        size: 0.3 + this.rng() * 0.2,
                        cluster: `rock_formation_${i}`
                    });
                }
            }
        }
        
        // Add some individual rocks scattered around
        const remainingRocks = count - (clusterCount * 5);
        for (let i = 0; i < remainingRocks; i++) {
            const position = this.getRandomPosition(50, 400);
            if (this.isPositionValid(position, 10, 5)) {
                this.mapData.environment.push({
                    type: 'rock',
                    position,
                    theme: theme.name,
                    size: 0.8 + this.rng() * 1.5
                });
            }
        }
    }

    /**
     * Generate bush clusters
     */
    generateBushClusters(count, theme) {
        // Create several bush clusters/thickets
        const clusterCount = Math.floor(count / 4);
        
        for (let i = 0; i < clusterCount; i++) {
            const clusterCenter = this.getRandomPosition(30, 350);
            
            // Skip if too close to structures
            if (!this.isPositionValid(clusterCenter, 15, 8)) {
                continue;
            }
            
            // Determine cluster size
            const bushesInCluster = 4 + Math.floor(this.rng() * 8); // 4-12 bushes per cluster
            const clusterRadius = 4 + this.rng() * 8; // 4-12 units radius
            
            // Generate bushes in the cluster
            for (let j = 0; j < bushesInCluster; j++) {
                // Bushes get denser toward the center
                const distanceFromCenter = this.rng() * this.rng() * clusterRadius; // Squared distribution
                const angle = this.rng() * Math.PI * 2;
                
                const bushPosition = {
                    x: clusterCenter.x + Math.cos(angle) * distanceFromCenter,
                    y: 0,
                    z: clusterCenter.z + Math.sin(angle) * distanceFromCenter
                };
                
                // Vary bush sizes
                const bushSize = 0.5 + this.rng() * 0.7; // 0.5-1.2 size
                
                this.mapData.environment.push({
                    type: 'bush',
                    position: bushPosition,
                    theme: theme.name,
                    size: bushSize,
                    cluster: `bush_thicket_${i}`
                });
                
                // Add flowers or small plants among bushes
                if (this.rng() < 0.4) {
                    const flowerPosition = this.getNearbyPosition(bushPosition, 0.5, 1.5);
                    this.mapData.environment.push({
                        type: this.rng() < 0.6 ? 'flower' : 'small_plant',
                        position: flowerPosition,
                        theme: theme.name,
                        size: 0.3 + this.rng() * 0.2,
                        cluster: `bush_thicket_${i}`
                    });
                }
            }
        }
        
        // Add some individual bushes scattered around
        const remainingBushes = count - (clusterCount * 6);
        for (let i = 0; i < remainingBushes; i++) {
            const position = this.getRandomPosition(30, 350);
            if (this.isPositionValid(position, 8, 4)) {
                this.mapData.environment.push({
                    type: 'bush',
                    position,
                    theme: theme.name,
                    size: 0.6 + this.rng() * 0.5
                });
            }
        }
    }

    /**
     * Generate flower patches
     */
    generateFlowerPatches(count, theme) {
        // Create several flower patches/meadows
        const patchCount = Math.floor(count / 8); // Fewer, denser patches
        
        for (let i = 0; i < patchCount; i++) {
            const patchCenter = this.getRandomPosition(20, 300);
            
            // Skip if too close to structures
            if (!this.isPositionValid(patchCenter, 10, 5)) {
                continue;
            }
            
            // Determine patch size
            const flowersInPatch = 8 + Math.floor(this.rng() * 12); // 8-20 flowers per patch
            const patchRadius = 3 + this.rng() * 7; // 3-10 units radius
            
            // Choose a dominant flower type for this patch
            const flowerTypes = ['wildflower', 'daisy', 'tulip', 'rose', 'sunflower', 'lily'];
            const dominantType = flowerTypes[Math.floor(this.rng() * flowerTypes.length)];
            
            // Generate flowers in the patch
            for (let j = 0; j < flowersInPatch; j++) {
                // Flowers get denser toward the center
                const distanceFromCenter = this.rng() * this.rng() * patchRadius; // Squared distribution
                const angle = this.rng() * Math.PI * 2;
                
                const flowerPosition = {
                    x: patchCenter.x + Math.cos(angle) * distanceFromCenter,
                    y: 0,
                    z: patchCenter.z + Math.sin(angle) * distanceFromCenter
                };
                
                // 80% chance to use dominant flower type, 20% chance for variety
                const flowerType = this.rng() < 0.8 ? 
                    dominantType : 
                    flowerTypes[Math.floor(this.rng() * flowerTypes.length)];
                
                // Vary flower sizes
                const flowerSize = 0.3 + this.rng() * 0.4; // 0.3-0.7 size
                
                this.mapData.environment.push({
                    type: 'flower',
                    flowerType: flowerType,
                    position: flowerPosition,
                    theme: theme.name,
                    size: flowerSize,
                    cluster: `flower_patch_${i}`
                });
                
                // Add tall grass among flowers
                if (this.rng() < 0.3) {
                    const grassPosition = this.getNearbyPosition(flowerPosition, 0.3, 1.0);
                    this.mapData.environment.push({
                        type: 'tall_grass',
                        position: grassPosition,
                        theme: theme.name,
                        size: 0.4 + this.rng() * 0.3,
                        cluster: `flower_patch_${i}`
                    });
                }
            }
        }
        
        // Add some individual flowers scattered around
        const remainingFlowers = count - (patchCount * 10);
        for (let i = 0; i < remainingFlowers; i++) {
            const position = this.getRandomPosition(20, 300);
            if (this.isPositionValid(position, 5, 3)) {
                this.mapData.environment.push({
                    type: 'flower',
                    position,
                    theme: theme.name,
                    size: 0.3 + this.rng() * 0.3
                });
            }
        }
    }

    /**
     * Generate mountain ranges
     * This method can be called in two ways:
     * 1. generateMountainRanges(count, theme) - Generate a specific number of mountain ranges
     * 2. generateMountainRanges(theme, boundaryHalfSize) - Generate mountain ranges based on theme and boundary
     */
    generateMountainRanges(countOrTheme, themeOrBoundaryHalfSize) {
        // Check if first parameter is a number (count) or an object (theme)
        if (typeof countOrTheme === 'number') {
            // Called with (count, theme)
            const count = countOrTheme;
            const theme = themeOrBoundaryHalfSize;
            
            // Create several mountain ranges
            const rangeCount = Math.floor(count / 4); // Fewer, connected ranges
            
            for (let i = 0; i < rangeCount; i++) {
            const rangeCenter = this.getRandomPosition(150, 400);
            
            // Skip if too close to structures
            if (!this.isPositionValid(rangeCenter, 40, 30)) {
                continue;
            }
            
            // Determine range size
            const mountainsInRange = 4 + Math.floor(this.rng() * 6); // 4-10 mountains per range
            const rangeLength = 40 + this.rng() * 60; // 40-100 units length
            const rangeWidth = 15 + this.rng() * 25; // 15-40 units width
            
            // Choose a direction for the range
            const rangeAngle = this.rng() * Math.PI * 2;
            const dirX = Math.cos(rangeAngle);
            const dirZ = Math.sin(rangeAngle);
            
            // Generate mountains along the range direction
            for (let j = 0; j < mountainsInRange; j++) {
                // Position along the range length
                const t = j / (mountainsInRange - 1); // 0 to 1
                const distanceAlongRange = -rangeLength/2 + rangeLength * t;
                
                // Add some randomness perpendicular to the range direction
                const perpOffset = (this.rng() - 0.5) * rangeWidth;
                
                const mountainPosition = {
                    x: rangeCenter.x + dirX * distanceAlongRange - dirZ * perpOffset,
                    y: 0,
                    z: rangeCenter.z + dirZ * distanceAlongRange + dirX * perpOffset
                };
                
                // Vary mountain heights - taller in the middle of the range
                const heightFactor = 1 - Math.abs(t - 0.5) * 2; // 1 at center, 0 at edges
                const mountainHeight = (20 + this.rng() * 20) * (0.7 + heightFactor * 0.6);
                
                this.mapData.environment.push({
                    type: 'mountain',
                    position: mountainPosition,
                    theme: theme.name,
                    height: mountainHeight,
                    cluster: `mountain_range_${i}`
                });
                
                // Add smaller features around mountains - rocks, snow patches, etc.
                const smallFeatureCount = 1 + Math.floor(this.rng() * 3);
                for (let f = 0; f < smallFeatureCount; f++) {
                    const featurePosition = this.getNearbyPosition(mountainPosition, 5, 15);
                    const featureType = this.rng() < 0.6 ? 'rock' : 
                                      (this.rng() < 0.5 ? 'snow_patch' : 'small_peak');
                    
                    this.mapData.environment.push({
                        type: featureType,
                        position: featurePosition,
                        theme: theme.name,
                        size: 1 + this.rng() * 2,
                        cluster: `mountain_range_${i}`
                    });
                }
            }
            
            // Add a mountain pass or valley
            if (this.rng() < 0.7) {
                const passPosition = {
                    x: rangeCenter.x + (this.rng() - 0.5) * rangeLength * 0.6,
                    y: 0,
                    z: rangeCenter.z + (this.rng() - 0.5) * rangeLength * 0.6
                };
                
                this.mapData.environment.push({
                    type: 'mountain_pass',
                    position: passPosition,
                    theme: theme.name,
                    width: 5 + this.rng() * 10,
                    cluster: `mountain_range_${i}`
                });
                
                // Add a structure near the pass - watchtower, shrine, etc.
                if (this.rng() < 0.5) {
                    const structurePosition = this.getNearbyPosition(passPosition, 5, 15);
                    const structureType = this.rng() < 0.7 ? 'watchtower' : 'mountain_shrine';
                    
                    this.mapData.structures.push({
                        type: structureType,
                        position: structurePosition,
                        theme: theme.name,
                        size: 1 + this.rng() * 0.5,
                        cluster: `mountain_range_${i}`
                    });
                }
            }
        }
        
        // Add some individual mountains scattered around
        const remainingMountains = count - (rangeCount * 5);
        for (let i = 0; i < remainingMountains; i++) {
            const position = this.getRandomPosition(100, 400);
            if (this.isPositionValid(position, 30, 20)) {
                this.mapData.environment.push({
                    type: 'mountain',
                    position,
                    theme: theme.name,
                    height: 15 + this.rng() * 25
                });
            }
        }
        } else {
            // Called with (theme, boundaryHalfSize)
            const theme = countOrTheme;
            const boundaryHalfSize = themeOrBoundaryHalfSize;
            
            // Determine count based on theme
            let count = 16; // Default count (4 ranges with 4 mountains each)
            
            if (theme.features && theme.features.mountainRangeCount) {
                count = theme.features.mountainRangeCount;
            } else if (theme.primaryZone === 'Mountains') {
                count = 32; // More mountains in mountain zones
            }
            
            // Create boundary mountains - mountains around the edge of the map
            const boundaryMountainCount = 24; // Mountains around the boundary
            const boundaryRadius = boundaryHalfSize * 0.9; // Slightly inside the boundary
            
            for (let i = 0; i < boundaryMountainCount; i++) {
                const angle = (i / boundaryMountainCount) * Math.PI * 2;
                const x = Math.cos(angle) * boundaryRadius;
                const z = Math.sin(angle) * boundaryRadius;
                
                // Add some randomness to position
                const position = {
                    x: x + (this.rng() - 0.5) * 30,
                    y: 0,
                    z: z + (this.rng() - 0.5) * 30
                };
                
                // Create mountain
                this.mapData.environment.push({
                    type: 'mountain',
                    position,
                    theme: theme.name,
                    height: 40 + this.rng() * 80 // 40-120 height (taller boundary mountains)
                });
            }
            
            // Also create some internal mountain ranges
            this.generateMountainRanges(count, theme);
        }
    }

    /**
     * Generate water features
     * This method can be called in two ways:
     * 1. generateWaterFeatures(count, theme) - Generate a specific number of water features
     * 2. generateWaterFeatures(theme, boundaryHalfSize) - Generate water features based on theme and boundary
     */
    generateWaterFeatures(countOrTheme, themeOrBoundaryHalfSize) {
        // Check if first parameter is a number (count) or an object (theme)
        if (typeof countOrTheme === 'number') {
            // Called with (count, theme)
            const count = countOrTheme;
            const theme = themeOrBoundaryHalfSize;
            
            for (let i = 0; i < count; i++) {
                const position = this.getRandomPosition(80, 350);
                this.mapData.environment.push({
                    type: 'water',
                    position,
                    theme: theme.name,
                    size: 5 + this.rng() * 10
                });
            }
        } else {
            // Called with (theme, boundaryHalfSize)
            const theme = countOrTheme;
            const boundaryHalfSize = themeOrBoundaryHalfSize;
            
            // Determine count based on theme
            let count = 20; // Default count
            
            if (theme.features && theme.features.waterFeatureCount) {
                count = theme.features.waterFeatureCount;
            } else if (theme.primaryZone === 'Swamp') {
                count = 30; // More water in swamps
            }
            
            // Generate water features
            for (let i = 0; i < count; i++) {
                const position = this.getRandomPosition(80, boundaryHalfSize * 0.8);
                this.mapData.environment.push({
                    type: 'water',
                    position,
                    theme: theme.name,
                    size: 5 + this.rng() * 10
                });
            }
        }
    }

    /**
     * Generate lava features
     */
    generateLavaFeatures(count, theme) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(100, 350);
            this.mapData.environment.push({
                type: 'lava',
                position,
                theme: theme.name,
                size: 3 + this.rng() * 8
            });
        }
    }

    /**
     * Generate special environment features based on theme
     * This method handles the theme-specific special features
     */
    generateSpecialEnvironmentFeatures(theme, boundaryHalfSize) {
        // Determine count based on theme - significantly increased for more interesting maps
        let count = 30; // Default count doubled from 15
        
        if (theme.features && theme.features.specialFeatureCount) {
            // If specified in theme, use that value but increase it by 50%
            count = Math.ceil(theme.features.specialFeatureCount * 1.5);
        }
        
        console.debug(`Generating ${count} special environment features for ${theme.name}...`);
        
        // Generate different special features based on theme
        switch (theme.primaryZone) {
            case 'Forest':
                this.generateForestSpecialFeatures(count, theme);
                // Add some generic features for variety (20% of the count)
                this.generateGenericSpecialFeatures(Math.ceil(count * 0.2), theme);
                break;
            case 'Mountains':
                this.generateMountainSpecialFeatures(count, theme);
                // Add some generic features for variety (20% of the count)
                this.generateGenericSpecialFeatures(Math.ceil(count * 0.2), theme);
                break;
            case 'Desert':
                this.generateDesertSpecialFeatures(count, theme);
                // Add some generic features for variety (20% of the count)
                this.generateGenericSpecialFeatures(Math.ceil(count * 0.2), theme);
                break;
            case 'Swamp':
                this.generateSwampSpecialFeatures(count, theme);
                // Add some generic features for variety (20% of the count)
                this.generateGenericSpecialFeatures(Math.ceil(count * 0.2), theme);
                break;
            case 'Ruins':
                this.generateRuinsSpecialFeatures(count, theme);
                // Add some generic features for variety (20% of the count)
                this.generateGenericSpecialFeatures(Math.ceil(count * 0.2), theme);
                break;
            default:
                // For any other theme, generate generic special features
                this.generateGenericSpecialFeatures(count, theme);
                break;
        }
        
        // Add some cross-theme features for more variety (10% of the count)
        // This adds features from other themes to create more interesting and diverse maps
        this.generateCrossThemeFeatures(Math.ceil(count * 0.1), theme);
    }
    
    /**
     * Generate cross-theme features - adds features from other themes for variety
     */
    generateCrossThemeFeatures(count, theme) {
        // Skip the current theme's primary zone
        const availableZones = ['Forest', 'Mountains', 'Desert', 'Swamp', 'Ruins'].filter(
            zone => zone !== theme.primaryZone
        );
        
        for (let i = 0; i < count; i++) {
            // Select a random zone different from the current theme
            const randomZone = availableZones[Math.floor(this.rng() * availableZones.length)];
            const position = this.getRandomPosition(150, 400); // Place further out
            
            // Generate a feature based on the selected zone
            switch (randomZone) {
                case 'Forest':
                    const forestTypes = CROSS_THEME_FEATURES.FOREST;
                    const forestType = forestTypes[Math.floor(this.rng() * forestTypes.length)];
                    this.mapData.environment.push({
                        type: forestType,
                        position,
                        theme: theme.name,
                        size: 3 + this.rng() * 8,
                        variant: Math.floor(this.rng() * 3),
                        crossTheme: true // Mark as cross-theme feature
                    });
                    break;
                    
                case 'Mountains':
                    const mountainTypes = CROSS_THEME_FEATURES.MOUNTAINS;
                    const mountainType = mountainTypes[Math.floor(this.rng() * mountainTypes.length)];
                    this.mapData.environment.push({
                        type: mountainType,
                        position,
                        theme: theme.name,
                        size: 4 + this.rng() * 8,
                        variant: Math.floor(this.rng() * 3),
                        crossTheme: true
                    });
                    break;
                    
                case 'Desert':
                    const desertTypes = CROSS_THEME_FEATURES.DESERT;
                    const desertType = desertTypes[Math.floor(this.rng() * desertTypes.length)];
                    this.mapData.environment.push({
                        type: desertType,
                        position,
                        theme: theme.name,
                        size: 4 + this.rng() * 7,
                        variant: Math.floor(this.rng() * 3),
                        crossTheme: true
                    });
                    break;
                    
                case 'Swamp':
                    const swampTypes = CROSS_THEME_FEATURES.SWAMP;
                    const swampType = swampTypes[Math.floor(this.rng() * swampTypes.length)];
                    this.mapData.environment.push({
                        type: swampType,
                        position,
                        theme: theme.name,
                        size: 3 + this.rng() * 6,
                        variant: Math.floor(this.rng() * 3),
                        glowing: swampType === 'swamp_light' || this.rng() < 0.3,
                        crossTheme: true
                    });
                    break;
                    
                case 'Ruins':
                    const ruinsTypes = CROSS_THEME_FEATURES.RUINS;
                    const ruinsType = ruinsTypes[Math.floor(this.rng() * ruinsTypes.length)];
                    this.mapData.environment.push({
                        type: ruinsType,
                        position,
                        theme: theme.name,
                        size: 3 + this.rng() * 7,
                        variant: Math.floor(this.rng() * 3),
                        glowing: ruinsType === 'magic_circle' || this.rng() < 0.2,
                        crossTheme: true
                    });
                    break;
            }
        }
    }
    
    /**
     * Generate forest-specific special features
     */
    generateForestSpecialFeatures(count, theme) {
        // Forest special features
        const forestSpecialTypes = [
            { type: 'ancient_tree', minSize: 8, maxSize: 20, weight: 3 },
            { type: 'fairy_circle', minSize: 4, maxSize: 8, weight: 2 },
            { type: 'mushroom_cluster', minSize: 2, maxSize: 5, weight: 3 },
            { type: 'fallen_log', minSize: 5, maxSize: 12, weight: 2 },
            { type: 'forest_shrine', minSize: 3, maxSize: 7, weight: 1 },
            { type: 'glowing_flowers', minSize: 2, maxSize: 4, weight: 2 },
            { type: 'treehouse', minSize: 6, maxSize: 10, weight: 1 }
        ];
        
        // Create weighted selection array
        const weightedTypes = [];
        forestSpecialTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate the features
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(80, 350);
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Create feature clusters for some types
            if (typeInfo.type === 'mushroom_cluster' || typeInfo.type === 'glowing_flowers') {
                // Create a cluster of 3-8 objects
                const clusterSize = 3 + Math.floor(this.rng() * 6);
                const clusterRadius = 2 + this.rng() * 4;
                
                for (let j = 0; j < clusterSize; j++) {
                    const clusterPos = this.getNearbyPosition(position, 0.5, clusterRadius);
                    this.mapData.environment.push({
                        type: typeInfo.type,
                        position: clusterPos,
                        theme: theme.name,
                        size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                        variant: Math.floor(this.rng() * 3) // Add variants for visual diversity
                    });
                }
            } else {
                // Add single feature
                this.mapData.environment.push({
                    type: typeInfo.type,
                    position,
                    theme: theme.name,
                    size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                    variant: Math.floor(this.rng() * 3) // Add variants for visual diversity
                });
                
                // Add smaller decorative elements around some features
                if (typeInfo.type === 'ancient_tree' || typeInfo.type === 'forest_shrine') {
                    const decorCount = 2 + Math.floor(this.rng() * 4);
                    for (let j = 0; j < decorCount; j++) {
                        const decorPos = this.getNearbyPosition(position, 1, 3);
                        const decorType = this.rng() < 0.5 ? 'small_mushroom' : 'forest_flower';
                        this.mapData.environment.push({
                            type: decorType,
                            position: decorPos,
                            theme: theme.name,
                            size: 0.5 + this.rng() * 1.0,
                            variant: Math.floor(this.rng() * 3)
                        });
                    }
                }
            }
        }
    }
    
    /**
     * Generate mountain-specific special features
     */
    generateMountainSpecialFeatures(count, theme) {
        // Mountain special features
        const mountainSpecialTypes = [
            { type: 'ice_formation', minSize: 5, maxSize: 15, weight: 3 },
            { type: 'snow_drift', minSize: 4, maxSize: 10, weight: 2 },
            { type: 'mountain_cave', minSize: 6, maxSize: 12, weight: 2 },
            { type: 'frozen_waterfall', minSize: 8, maxSize: 18, weight: 1 },
            { type: 'crystal_outcrop', minSize: 4, maxSize: 9, weight: 2 },
            { type: 'mountain_shrine', minSize: 5, maxSize: 8, weight: 1 },
            { type: 'alpine_hut', minSize: 4, maxSize: 7, weight: 1 }
        ];
        
        // Create weighted selection array
        const weightedTypes = [];
        mountainSpecialTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate the features
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(100, 350);
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Add the feature
            this.mapData.environment.push({
                type: typeInfo.type,
                position,
                theme: theme.name,
                size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                variant: Math.floor(this.rng() * 3) // Add variants for visual diversity
            });
            
            // Add snow drifts or ice patches around some features
            if (typeInfo.type === 'mountain_cave' || typeInfo.type === 'frozen_waterfall' || typeInfo.type === 'alpine_hut') {
                const decorCount = 2 + Math.floor(this.rng() * 3);
                for (let j = 0; j < decorCount; j++) {
                    const decorPos = this.getNearbyPosition(position, 1, 4);
                    const decorType = this.rng() < 0.6 ? 'snow_patch' : 'ice_shard';
                    this.mapData.environment.push({
                        type: decorType,
                        position: decorPos,
                        theme: theme.name,
                        size: 1 + this.rng() * 2,
                        variant: Math.floor(this.rng() * 3)
                    });
                }
            }
        }
    }
    
    /**
     * Generate desert-specific special features
     */
    generateDesertSpecialFeatures(count, theme) {
        // Desert special features
        const desertSpecialTypes = [
            { type: 'oasis', minSize: 6, maxSize: 14, weight: 2 },
            { type: 'lava_pool', minSize: 5, maxSize: 12, weight: 3 },
            { type: 'volcanic_vent', minSize: 3, maxSize: 8, weight: 2 },
            { type: 'obsidian_formation', minSize: 4, maxSize: 10, weight: 2 },
            { type: 'fire_pit', minSize: 3, maxSize: 6, weight: 1 },
            { type: 'desert_shrine', minSize: 5, maxSize: 9, weight: 1 },
            { type: 'ash_dune', minSize: 7, maxSize: 15, weight: 2 }
        ];
        
        // Create weighted selection array
        const weightedTypes = [];
        desertSpecialTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate the features
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(100, 350);
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Add the feature
            this.mapData.environment.push({
                type: typeInfo.type,
                position,
                theme: theme.name,
                size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                variant: Math.floor(this.rng() * 3) // Add variants for visual diversity
            });
            
            // Add special decorations around oases and shrines
            if (typeInfo.type === 'oasis' || typeInfo.type === 'desert_shrine') {
                const palmCount = 2 + Math.floor(this.rng() * 4);
                for (let j = 0; j < palmCount; j++) {
                    const palmPos = this.getNearbyPosition(position, 1, 5);
                    this.mapData.environment.push({
                        type: 'desert_palm',
                        position: palmPos,
                        theme: theme.name,
                        size: 2 + this.rng() * 3,
                        variant: Math.floor(this.rng() * 3)
                    });
                }
            }
            
            // Add lava rocks around volcanic features
            if (typeInfo.type === 'lava_pool' || typeInfo.type === 'volcanic_vent') {
                const rockCount = 3 + Math.floor(this.rng() * 5);
                for (let j = 0; j < rockCount; j++) {
                    const rockPos = this.getNearbyPosition(position, 1, 4);
                    this.mapData.environment.push({
                        type: 'lava_rock',
                        position: rockPos,
                        theme: theme.name,
                        size: 1 + this.rng() * 2,
                        variant: Math.floor(this.rng() * 3),
                        glowing: this.rng() < 0.3 // Some rocks glow
                    });
                }
            }
        }
    }
    
    /**
     * Generate swamp-specific special features
     */
    generateSwampSpecialFeatures(count, theme) {
        // Swamp special features
        const swampSpecialTypes = [
            { type: 'swamp_light', minSize: 3, maxSize: 8, weight: 3 },
            { type: 'giant_mushroom', minSize: 5, maxSize: 12, weight: 2 },
            { type: 'hanging_vines', minSize: 4, maxSize: 9, weight: 2 },
            { type: 'bog_pit', minSize: 6, maxSize: 14, weight: 2 },
            { type: 'witch_hut', minSize: 5, maxSize: 8, weight: 1 },
            { type: 'swamp_idol', minSize: 4, maxSize: 7, weight: 1 },
            { type: 'twisted_tree', minSize: 7, maxSize: 15, weight: 2 }
        ];
        
        // Create weighted selection array
        const weightedTypes = [];
        swampSpecialTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate the features
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(80, 350);
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Add the feature
            this.mapData.environment.push({
                type: typeInfo.type,
                position,
                theme: theme.name,
                size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                variant: Math.floor(this.rng() * 3), // Add variants for visual diversity
                glowing: typeInfo.type === 'swamp_light' || this.rng() < 0.2 // Swamp lights and some other features glow
            });
            
            // Add clusters of smaller swamp elements
            if (typeInfo.type === 'bog_pit' || typeInfo.type === 'witch_hut' || typeInfo.type === 'swamp_idol') {
                const decorCount = 3 + Math.floor(this.rng() * 5);
                for (let j = 0; j < decorCount; j++) {
                    const decorPos = this.getNearbyPosition(position, 1, 4);
                    const decorTypes = ['swamp_flower', 'small_mushroom', 'lily_pad', 'cattail'];
                    const decorType = decorTypes[Math.floor(this.rng() * decorTypes.length)];
                    
                    this.mapData.environment.push({
                        type: decorType,
                        position: decorPos,
                        theme: theme.name,
                        size: 0.8 + this.rng() * 1.5,
                        variant: Math.floor(this.rng() * 3),
                        glowing: this.rng() < 0.15 // Some small elements glow
                    });
                }
            }
        }
    }
    
    /**
     * Generate ruins-specific special features
     */
    generateRuinsSpecialFeatures(count, theme) {
        // Ruins special features
        const ruinsSpecialTypes = [
            { type: 'ancient_statue', minSize: 4, maxSize: 12, weight: 3 },
            { type: 'broken_column', minSize: 3, maxSize: 8, weight: 3 },
            { type: 'ruined_arch', minSize: 5, maxSize: 10, weight: 2 },
            { type: 'stone_altar', minSize: 4, maxSize: 7, weight: 2 },
            { type: 'forgotten_tomb', minSize: 6, maxSize: 12, weight: 1 },
            { type: 'magic_circle', minSize: 5, maxSize: 9, weight: 1 },
            { type: 'ancient_mechanism', minSize: 3, maxSize: 6, weight: 1 }
        ];
        
        // Create weighted selection array
        const weightedTypes = [];
        ruinsSpecialTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate the features
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(100, 350);
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Add the feature
            this.mapData.environment.push({
                type: typeInfo.type,
                position,
                theme: theme.name,
                size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                variant: Math.floor(this.rng() * 3), // Add variants for visual diversity
                glowing: typeInfo.type === 'magic_circle' || typeInfo.type === 'ancient_mechanism' || this.rng() < 0.2
            });
            
            // Add rubble and smaller ruins around major features
            if (typeInfo.type !== 'broken_column') {
                const rubbleCount = 3 + Math.floor(this.rng() * 4);
                for (let j = 0; j < rubbleCount; j++) {
                    const rubblePos = this.getNearbyPosition(position, 1, 5);
                    const rubbleTypes = ['stone_rubble', 'broken_tile', 'small_statue', 'ancient_debris'];
                    const rubbleType = rubbleTypes[Math.floor(this.rng() * rubbleTypes.length)];
                    
                    this.mapData.environment.push({
                        type: rubbleType,
                        position: rubblePos,
                        theme: theme.name,
                        size: 0.8 + this.rng() * 1.5,
                        variant: Math.floor(this.rng() * 3),
                        glowing: this.rng() < 0.1 // Some pieces might glow with ancient magic
                    });
                }
            }
            
            // Create column formations for certain types
            if (typeInfo.type === 'ruined_arch' || typeInfo.type === 'stone_altar' || typeInfo.type === 'forgotten_tomb') {
                const columnCount = 2 + Math.floor(this.rng() * 3);
                const columnRadius = 3 + this.rng() * 3;
                
                for (let j = 0; j < columnCount; j++) {
                    const angle = (j / columnCount) * Math.PI * 2;
                    const columnPos = {
                        x: position.x + Math.cos(angle) * columnRadius,
                        y: position.y,
                        z: position.z + Math.sin(angle) * columnRadius
                    };
                    
                    this.mapData.environment.push({
                        type: 'broken_column',
                        position: columnPos,
                        theme: theme.name,
                        size: 2 + this.rng() * 4,
                        variant: Math.floor(this.rng() * 3),
                        rotation: angle // Add rotation for better arrangement
                    });
                }
            }
        }
    }
    
    /**
     * Generate generic special features for any theme
     */
    generateGenericSpecialFeatures(count, theme) {
        // Generic special features that work in any theme
        const genericSpecialTypes = [
            { type: 'crystal_formation', minSize: 3, maxSize: 8, weight: 2 },
            { type: 'rare_plant', minSize: 2, maxSize: 6, weight: 2 },
            { type: 'magical_stone', minSize: 3, maxSize: 7, weight: 2 },
            { type: 'ancient_artifact', minSize: 2, maxSize: 5, weight: 1 },
            { type: 'mysterious_portal', minSize: 4, maxSize: 8, weight: 1 },
            { type: 'enchanted_pool', minSize: 5, maxSize: 10, weight: 1 },
            { type: 'stone_circle', minSize: 6, maxSize: 12, weight: 1 },
            { type: 'abandoned_camp', minSize: 4, maxSize: 8, weight: 1 },
            { type: 'strange_monolith', minSize: 5, maxSize: 10, weight: 1 }
        ];
        
        // Create weighted selection array
        const weightedTypes = [];
        genericSpecialTypes.forEach(item => {
            for (let i = 0; i < item.weight; i++) {
                weightedTypes.push(item);
            }
        });
        
        // Generate the features
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(100, 350);
            const typeInfo = weightedTypes[Math.floor(this.rng() * weightedTypes.length)];
            
            // Add the feature
            this.mapData.environment.push({
                type: typeInfo.type,
                position,
                theme: theme.name,
                size: typeInfo.minSize + this.rng() * (typeInfo.maxSize - typeInfo.minSize),
                variant: Math.floor(this.rng() * 3), // Add variants for visual diversity
                glowing: typeInfo.type === 'crystal_formation' || 
                         typeInfo.type === 'magical_stone' || 
                         typeInfo.type === 'mysterious_portal' || 
                         this.rng() < 0.3
            });
            
            // Add decorative elements around some features
            if (typeInfo.type === 'stone_circle' || 
                typeInfo.type === 'enchanted_pool' || 
                typeInfo.type === 'mysterious_portal') {
                
                const decorCount = 3 + Math.floor(this.rng() * 4);
                const decorRadius = 3 + this.rng() * 2;
                
                // Create a circle of decorative elements
                for (let j = 0; j < decorCount; j++) {
                    const angle = (j / decorCount) * Math.PI * 2;
                    const decorPos = {
                        x: position.x + Math.cos(angle) * decorRadius,
                        y: position.y,
                        z: position.z + Math.sin(angle) * decorRadius
                    };
                    
                    const decorTypes = ['small_crystal', 'magical_flower', 'rune_stone', 'glowing_mushroom'];
                    const decorType = decorTypes[Math.floor(this.rng() * decorTypes.length)];
                    
                    this.mapData.environment.push({
                        type: decorType,
                        position: decorPos,
                        theme: theme.name,
                        size: 0.8 + this.rng() * 1.2,
                        variant: Math.floor(this.rng() * 3),
                        glowing: this.rng() < 0.5, // Higher chance of glowing
                        rotation: angle // Add rotation for better arrangement
                    });
                }
            }
            
            // Add scattered objects for abandoned camp
            if (typeInfo.type === 'abandoned_camp') {
                const itemCount = 4 + Math.floor(this.rng() * 5);
                for (let j = 0; j < itemCount; j++) {
                    const itemPos = this.getNearbyPosition(position, 0.5, 3);
                    const campItems = ['tent', 'campfire', 'crate', 'barrel', 'backpack', 'bedroll'];
                    const itemType = campItems[Math.floor(this.rng() * campItems.length)];
                    
                    this.mapData.environment.push({
                        type: itemType,
                        position: itemPos,
                        theme: theme.name,
                        size: 0.8 + this.rng() * 1.0,
                        variant: Math.floor(this.rng() * 3),
                        glowing: itemType === 'campfire' // Only campfires glow
                    });
                }
            }
        }
    }

    /**
     * Get a random position within specified radius range
     */
    getRandomPosition(minRadius, maxRadius) {
        const angle = this.rng() * Math.PI * 2;
        const radius = minRadius + this.rng() * (maxRadius - minRadius);
        
        return {
            x: Math.cos(angle) * radius,
            y: 0,
            z: Math.sin(angle) * radius
        };
    }
    
    /**
     * Get a position near another position (for clustering)
     */
    getNearbyPosition(center, minDistance, maxDistance) {
        const angle = this.rng() * Math.PI * 2;
        const distance = minDistance + this.rng() * (maxDistance - minDistance);
        
        return {
            x: center.x + Math.cos(angle) * distance,
            y: center.y,
            z: center.z + Math.sin(angle) * distance
        };
    }
    
    /**
     * Check if a position is too close to existing structures or paths
     * For background objects, we want to ensure proper clearings around paths and structures
     */
    isPositionValid(position, minDistanceToStructures = 10, minDistanceToPaths = 5, isBackgroundObject = false) {
        // For background objects, use larger clearings around structures
        const structureDistance = isBackgroundObject ? minDistanceToStructures * 1.5 : minDistanceToStructures;
        const pathDistance = isBackgroundObject ? minDistanceToPaths * 1.2 : minDistanceToPaths;
        
        // Check distance to structures
        for (const structure of this.mapData.structures) {
            const dx = position.x - structure.position.x;
            const dz = position.z - structure.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Use structure size if available to create proper clearings
            const structureSize = structure.size || 10;
            if (distance < structureDistance + structureSize) {
                return false;
            }
        }
        
        // Check distance to villages (which are collections of buildings)
        for (const structure of this.mapData.structures) {
            if (structure.type === 'village') {
                // Villages need larger clearings
                const villageRadius = 30; // Approximate village radius
                const dx = position.x - structure.position.x;
                const dz = position.z - structure.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < villageRadius + structureDistance) {
                    return false;
                }
            }
        }
        
        // Check distance to paths - more sophisticated path checking
        for (const path of this.mapData.paths) {
            // For circular paths
            if (path.type === 'circle') {
                const dx = position.x - path.center.x;
                const dz = position.z - path.center.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                // Check if we're too close to the circular path
                const pathWidth = path.width || 2;
                if (Math.abs(distance - path.radius) < pathDistance + pathWidth) {
                    return false;
                }
            } 
            // For line and curve paths
            else if (path.points && path.points.length > 1) {
                // Check each segment of the path
                for (let i = 0; i < path.points.length - 1; i++) {
                    const point1 = path.points[i];
                    const point2 = path.points[i + 1];
                    
                    // Calculate distance from position to line segment
                    const distance = this.distanceToLineSegment(
                        position.x, position.z,
                        point1.x, point1.z,
                        point2.x, point2.z
                    );
                    
                    const pathWidth = path.width || 2;
                    if (distance < pathDistance + pathWidth) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * Calculate distance from a point to a line segment
     * Used for more accurate path clearance checking
     */
    distanceToLineSegment(px, pz, x1, z1, x2, z2) {
        const A = px - x1;
        const B = pz - z1;
        const C = x2 - x1;
        const D = z2 - z1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, zz;
        
        if (param < 0) {
            xx = x1;
            zz = z1;
        } else if (param > 1) {
            xx = x2;
            zz = z2;
        } else {
            xx = x1 + param * C;
            zz = z1 + param * D;
        }
        
        const dx = px - xx;
        const dz = pz - zz;
        
        return Math.sqrt(dx * dx + dz * dz);
    }

    /**
     * Batch trees to reduce file size
     * Groups nearby trees into tree clusters to significantly reduce file size
     */
    batchTrees() {
        if (!this.mapData.environment || this.mapData.environment.length === 0) {
            return;
        }

        console.debug('Batching trees to reduce file size...');
        
        // Separate trees from other environment objects
        const trees = this.mapData.environment.filter(obj => obj.type === 'tree');
        const otherObjects = this.mapData.environment.filter(obj => obj.type !== 'tree');
        
        // Skip if no trees
        if (trees.length === 0) {
            return;
        }
        
        console.debug(`Found ${trees.length} trees to batch`);
        
        // Create grid for spatial partitioning
        const gridSize = 20; // Size of each grid cell
        const grid = {};
        
        // Assign trees to grid cells
        trees.forEach(tree => {
            // Calculate grid cell coordinates
            const cellX = Math.floor(tree.position.x / gridSize);
            const cellZ = Math.floor(tree.position.z / gridSize);
            const cellKey = `${cellX},${cellZ}`;
            
            // Create cell if it doesn't exist
            if (!grid[cellKey]) {
                grid[cellKey] = [];
            }
            
            // Add tree to cell
            grid[cellKey].push(tree);
        });
        
        // Create tree clusters
        const treeClusters = [];
        
        Object.keys(grid).forEach(cellKey => {
            const cellTrees = grid[cellKey];
            
            // Skip cells with only one tree
            if (cellTrees.length <= 1) {
                otherObjects.push(...cellTrees);
                return;
            }
            
            // Calculate average position and size
            let avgX = 0, avgY = 0, avgZ = 0;
            let avgSize = 0;
            let minX = Infinity, maxX = -Infinity;
            let minZ = Infinity, maxZ = -Infinity;
            
            cellTrees.forEach(tree => {
                avgX += tree.position.x;
                avgY += tree.position.y;
                avgZ += tree.position.z;
                avgSize += tree.size || 1;
                
                // Track bounds
                minX = Math.min(minX, tree.position.x);
                maxX = Math.max(maxX, tree.position.x);
                minZ = Math.min(minZ, tree.position.z);
                maxZ = Math.max(maxZ, tree.position.z);
            });
            
            avgX /= cellTrees.length;
            avgY /= cellTrees.length;
            avgZ /= cellTrees.length;
            avgSize /= cellTrees.length;
            
            // Calculate cluster radius
            const radius = Math.max(
                Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxZ - minZ, 2)) / 2,
                gridSize / 2
            );
            
            // Create tree cluster
            treeClusters.push({
                type: 'tree_cluster',
                position: { x: avgX, y: avgY, z: avgZ },
                theme: cellTrees[0].theme,
                treeCount: cellTrees.length,
                avgSize: avgSize,
                radius: radius,
                // Store original trees for rendering if needed
                trees: cellTrees.map(tree => ({
                    relativePosition: {
                        x: tree.position.x - avgX,
                        y: tree.position.y - avgY,
                        z: tree.position.z - avgZ
                    },
                    size: tree.size
                }))
            });
        });
        
        console.debug(`Created ${treeClusters.length} tree clusters from ${trees.length} trees`);
        
        // Replace environment with batched trees
        this.mapData.environment = [...otherObjects, ...treeClusters];
        
        // Add metadata about tree batching
        if (!this.mapData.metadata) {
            this.mapData.metadata = {};
        }
        
        this.mapData.metadata.treeBatching = {
            originalTreeCount: trees.length,
            clusterCount: treeClusters.length,
            compressionRatio: trees.length / (treeClusters.length + otherObjects.filter(obj => obj.type === 'tree').length)
        };
        
        console.debug(`Tree compression ratio: ${this.mapData.metadata.treeBatching.compressionRatio.toFixed(2)}x`);
    }

    /**
     * Export map data to JSON
     */
    exportToJSON() {
        // Batch trees before exporting to reduce file size
        this.batchTrees();
        
        return JSON.stringify(this.mapData, null, 2);
    }

    /**
     * Save map to file
     */
    saveToFile(filename) {
        
        const outputDir = path.join(process.cwd(), 'assets/maps');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, this.exportToJSON());
        
        console.debug(`Map saved to: ${filepath}`);
        return filepath;
    }
}

/**
 * CLI Interface
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.debug('Available map themes:');
        Object.keys(MAP_THEMES).forEach(key => {
            const theme = MAP_THEMES[key];
            console.debug(`  ${key}: ${theme.description}`);
        });
        console.debug('\nUsage: node map-generator.js <THEME_NAME> [output_filename]');
        return;
    }

    const themeName = args[0].toUpperCase();
    const outputFilename = args[1] || `${themeName.toLowerCase()}_map_${Date.now()}.json`;

    if (!MAP_THEMES[themeName]) {
        console.error(`Unknown theme: ${themeName}`);
        console.debug('Available themes:', Object.keys(MAP_THEMES).join(', '));
        return;
    }

    console.debug(`Generating ${MAP_THEMES[themeName].name} map...`);
    
    const generator = new MapGenerator();
    const mapData = generator.generateMap(themeName);
    
    const filepath = generator.saveToFile(outputFilename);
    
    console.debug('\nMap generation complete!');
    console.debug(`Theme: ${mapData.theme.name}`);
    console.debug(`Zones: ${mapData.zones.length}`);
    console.debug(`Structures: ${mapData.structures.length}`);
    console.debug(`Paths: ${mapData.paths.length}`);
    console.debug(`Environment objects: ${mapData.environment.length}`);
    console.debug(`Saved to: ${filepath}`);
}

// Export for use as module
export { MapGenerator, MAP_THEMES, PATH_PATTERNS };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}