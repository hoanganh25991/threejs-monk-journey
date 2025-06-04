#!/usr/bin/env node

/**
 * Meaningful Map Generator Script
 * Creates pre-defined themed maps with roads, villages, towers, and natural formations
 * Based on the existing WorldManager and structure systems
 */

// Simple Vector3 implementation for Node.js (since we can't import THREE.js in Node)
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
}

// Color definitions (copied from colors.js to avoid import issues)
const ZONE_COLORS = {
    'Forest': {
        'foliage': '#2F4F4F',
        'trunk': '#8B4513',
        'ground': '#8F9779',
        'rock': '#708090',
        'structure': '#36454F',
        'accent': '#6B8E23'
    },
    'Desert': {
        'sand': '#F4A460',
        'rock': '#A0522D',
        'vegetation': '#6B8E23',
        'sky': '#87CEEB',
        'structure': '#EDC9AF',
        'accent': '#FF4500'
    },
    'Mountains': {
        'snow': '#FFFAFA',
        'ice': '#B0E0E6',
        'rock': '#A9A9A9',
        'structure': '#ADD8E6',
        'vegetation': '#2E8B57',
        'accent': '#8FBC8F'
    },
    'Swamp': {
        'water': '#4682B4',
        'vegetation': '#556B2F',
        'ground': '#8F9779',
        'structure': '#708090',
        'rock': '#36454F',
        'accent': '#40E0D0'
    },
    'Ruins': {
        'stone': '#A9A9A9',
        'ground': '#8F9779',
        'vegetation': '#556B2F',
        'structure': '#708090',
        'accent': '#D8BFD8'
    },
    'Dark Sanctum': {
        'structure': '#0C0C0C',
        'fire': '#FF4500',
        'ground': '#5C4033',
        'accent': '#8B0000',
        'glow': '#E3CF57'
    },
    'Terrant': {
        'soil': '#E5C09A',
        'rock': '#696969',
        'vegetation': '#228B22',
        'crystal': '#7B68EE',
        'structure': '#4A4A4A',
        'accent': '#DAA520',
        'water': '#1E90FF',
        'glow': '#32CD32'
    }
};

const HOT_ZONE_COLORS = {
    'lava': '#FF4500',
    'magma': '#FF6347',
    'ground': '#2F4F4F',
    'ash': '#BEBEBE',
    'glow': '#FFD700',
    'ember': '#FF8C00'
};

// Import Node.js modules
import fs from 'fs';
import path from 'path';

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

        console.log(`Generating ${theme.name} map...`);
        
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
        console.log('Generating zones...');
        
        const centerZone = {
            name: theme.primaryZone,
            center: { x: 0, y: 0, z: 0 },
            radius: 200,
            color: theme.colors.ground || theme.colors.soil || theme.colors.sand
        };
        
        this.mapData.zones.push(centerZone);

        // Add secondary zones around the edges
        const secondaryZones = [
            { name: 'Terrant', center: { x: 300, y: 0, z: 300 }, radius: 150 },
            { name: 'Forest', center: { x: -300, y: 0, z: 300 }, radius: 150 },
            { name: 'Desert', center: { x: 300, y: 0, z: -300 }, radius: 150 },
            { name: 'Mountains', center: { x: -300, y: 0, z: -300 }, radius: 150 }
        ];

        secondaryZones.forEach(zone => {
            zone.color = ZONE_COLORS[zone.name]?.soil || ZONE_COLORS[zone.name]?.sand || ZONE_COLORS[zone.name]?.foliage;
            this.mapData.zones.push(zone);
        });
    }

    /**
     * Generate main road network
     */
    generateMainPaths(theme) {
        console.log('Generating main paths...');
        
        const pathWidth = theme.features.pathWidth;
        
        // Create main cross roads
        this.createPath('main_horizontal', [
            { x: -400, z: 0 },
            { x: 400, z: 0 }
        ], pathWidth, PATH_PATTERNS.STRAIGHT);

        this.createPath('main_vertical', [
            { x: 0, z: -400 },
            { x: 0, z: 400 }
        ], pathWidth, PATH_PATTERNS.STRAIGHT);

        // Create circular road around center
        this.createCircularPath('center_circle', { x: 0, z: 0 }, 100, pathWidth);

        // Create branching paths to corners
        const corners = [
            { x: 200, z: 200 },
            { x: -200, z: 200 },
            { x: 200, z: -200 },
            { x: -200, z: -200 }
        ];

        corners.forEach((corner, index) => {
            this.createPath(`branch_${index}`, [
                { x: 0, z: 0 },
                { x: corner.x * 0.5, z: corner.z * 0.5 },
                corner
            ], pathWidth * 0.8, PATH_PATTERNS.CURVED);
        });
    }

    /**
     * Generate structures based on theme
     */
    generateStructures(theme) {
        console.log('Generating structures...');
        
        const features = theme.features;
        
        // Generate villages
        for (let i = 0; i < features.villageCount; i++) {
            const position = this.getRandomPosition(150, 350);
            this.createVillage(position, `village_${i}`, theme);
        }

        // Generate towers
        for (let i = 0; i < features.towerCount; i++) {
            const position = this.getRandomPosition(100, 400);
            this.createTower(position, `tower_${i}`, theme);
        }

        // Generate ruins
        for (let i = 0; i < features.ruinsCount; i++) {
            const position = this.getRandomPosition(80, 380);
            this.createRuins(position, `ruins_${i}`, theme);
        }

        // Generate dark sanctums (if applicable)
        if (features.darkSanctumCount) {
            for (let i = 0; i < features.darkSanctumCount; i++) {
                const position = this.getRandomPosition(200, 350);
                this.createDarkSanctum(position, `sanctum_${i}`, theme);
            }
        }

        // Generate bridges
        for (let i = 0; i < features.bridgeCount; i++) {
            const position = this.getRandomPosition(50, 300);
            this.createBridge(position, `bridge_${i}`, theme);
        }
    }

    /**
     * Generate environment objects
     */
    generateEnvironment(theme) {
        console.log('Generating environment...');
        
        const features = theme.features;
        
        // Generate trees along paths
        if (features.treeDensity) {
            this.generateTreesAlongPaths(features.treeDensity, theme);
        }

        // Generate rocks
        this.generateRocks(50, theme);

        // Generate bushes
        this.generateBushes(30, theme);

        // Generate flowers
        this.generateFlowers(40, theme);

        // Theme-specific environment
        switch (theme.primaryZone) {
            case 'Mountains':
                this.generateMountains(20, theme);
                break;
            case 'Swamp':
                this.generateWaterFeatures(15, theme);
                break;
            case 'Desert':
                this.generateLavaFeatures(10, theme);
                break;
        }
    }

    /**
     * Connect structures with smaller paths
     */
    connectStructuresWithPaths(theme) {
        console.log('Connecting structures with paths...');
        
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
     * Create a village structure
     */
    createVillage(position, id, theme) {
        const village = {
            id,
            type: 'village',
            position,
            theme: theme.name,
            buildings: []
        };

        // Generate 5-12 buildings in the village
        const buildingCount = 5 + Math.floor(this.rng() * 8);
        
        for (let i = 0; i < buildingCount; i++) {
            const angle = (i / buildingCount) * Math.PI * 2;
            const distance = 10 + this.rng() * 20;
            
            village.buildings.push({
                type: 'house',
                position: {
                    x: position.x + Math.cos(angle) * distance,
                    y: 0,
                    z: position.z + Math.sin(angle) * distance
                },
                width: 3 + this.rng() * 4,
                depth: 3 + this.rng() * 4,
                height: 2 + this.rng() * 3
            });
        }

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
     * Generate trees along paths
     */
    generateTreesAlongPaths(density, theme) {
        this.mapData.paths.forEach(path => {
            path.points.forEach((point, index) => {
                if (index < path.points.length - 1) {
                    const nextPoint = path.points[index + 1];
                    const distance = Math.sqrt(
                        Math.pow(nextPoint.x - point.x, 2) +
                        Math.pow(nextPoint.z - point.z, 2)
                    );
                    
                    const treeCount = Math.floor(distance * density / 10);
                    
                    for (let i = 0; i < treeCount; i++) {
                        const t = i / treeCount;
                        const x = point.x + (nextPoint.x - point.x) * t;
                        const z = point.z + (nextPoint.z - point.z) * t;
                        
                        // Offset trees to sides of path
                        const offset = path.width + 2 + this.rng() * 5;
                        const side = this.rng() < 0.5 ? -1 : 1;
                        
                        this.mapData.environment.push({
                            type: 'tree',
                            position: {
                                x: x + side * offset,
                                y: 0,
                                z: z + side * offset
                            },
                            theme: theme.name
                        });
                    }
                }
            });
        });
    }

    /**
     * Generate rocks
     */
    generateRocks(count, theme) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(50, 400);
            this.mapData.environment.push({
                type: 'rock',
                position,
                theme: theme.name,
                size: 1 + this.rng() * 3
            });
        }
    }

    /**
     * Generate bushes
     */
    generateBushes(count, theme) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(30, 350);
            this.mapData.environment.push({
                type: 'bush',
                position,
                theme: theme.name
            });
        }
    }

    /**
     * Generate flowers
     */
    generateFlowers(count, theme) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(20, 300);
            this.mapData.environment.push({
                type: 'flower',
                position,
                theme: theme.name
            });
        }
    }

    /**
     * Generate mountains
     */
    generateMountains(count, theme) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(100, 400);
            this.mapData.environment.push({
                type: 'mountain',
                position,
                theme: theme.name,
                height: 20 + this.rng() * 30
            });
        }
    }

    /**
     * Generate water features
     */
    generateWaterFeatures(count, theme) {
        for (let i = 0; i < count; i++) {
            const position = this.getRandomPosition(80, 350);
            this.mapData.environment.push({
                type: 'water',
                position,
                theme: theme.name,
                size: 5 + this.rng() * 10
            });
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
     * Export map data to JSON
     */
    exportToJSON() {
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
        
        console.log(`Map saved to: ${filepath}`);
        return filepath;
    }
}

/**
 * CLI Interface
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Available map themes:');
        Object.keys(MAP_THEMES).forEach(key => {
            const theme = MAP_THEMES[key];
            console.log(`  ${key}: ${theme.description}`);
        });
        console.log('\nUsage: node map-generator.js <THEME_NAME> [output_filename]');
        return;
    }

    const themeName = args[0].toUpperCase();
    const outputFilename = args[1] || `${themeName.toLowerCase()}_map_${Date.now()}.json`;

    if (!MAP_THEMES[themeName]) {
        console.error(`Unknown theme: ${themeName}`);
        console.log('Available themes:', Object.keys(MAP_THEMES).join(', '));
        return;
    }

    console.log(`Generating ${MAP_THEMES[themeName].name} map...`);
    
    const generator = new MapGenerator();
    const mapData = generator.generateMap(themeName);
    
    const filepath = generator.saveToFile(outputFilename);
    
    console.log('\nMap generation complete!');
    console.log(`Theme: ${mapData.theme.name}`);
    console.log(`Zones: ${mapData.zones.length}`);
    console.log(`Structures: ${mapData.structures.length}`);
    console.log(`Paths: ${mapData.paths.length}`);
    console.log(`Environment objects: ${mapData.environment.length}`);
    console.log(`Saved to: ${filepath}`);
}

// Export for use as module
export { MapGenerator, MAP_THEMES, PATH_PATTERNS };

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}