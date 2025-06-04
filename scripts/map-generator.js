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

// Enhanced color definitions with more distinctive zone colors
const ZONE_COLORS = {
    'Forest': {
        'foliage': '#1E5631', // Deeper, richer green for forest foliage
        'trunk': '#8B4513',   // Classic brown for trunks
        'ground': '#5E7742',  // More vibrant forest floor green
        'rock': '#708090',
        'structure': '#36454F',
        'accent': '#FFCC00',  // Golden accent for forest (sunlight through trees)
        'path': '#A0522D'     // Brown dirt path
    },
    'Desert': {
        'sand': '#E9BE62',    // Warmer, more vibrant sand color
        'rock': '#A0522D',
        'vegetation': '#7D9C42', // Brighter desert vegetation
        'sky': '#87CEEB',
        'structure': '#D2B48C', // Lighter sandstone structures
        'accent': '#FF4500',    // Bright orange accent (desert sunset)
        'path': '#D2B48C'       // Sandy path
    },
    'Mountains': {
        'snow': '#FFFFFF',      // Pure white snow
        'ice': '#A5D8E6',       // More vibrant ice blue
        'rock': '#6D6552',      // Darker, more defined mountain rock
        'structure': '#8CADD6', // Blueish mountain structures
        'vegetation': '#2E8B57',
        'accent': '#C9E4CA',    // Pale green accent (alpine meadows)
        'path': '#8E7F6D'       // Rocky mountain path
    },
    'Swamp': {
        'water': '#3A7D7D',     // Deeper, murkier swamp water
        'vegetation': '#4A6C2F', // Darker swamp vegetation
        'ground': '#4D5645',    // Darker, muddier swamp ground
        'structure': '#708090',
        'rock': '#36454F',
        'accent': '#40E0D0',    // Cyan accent (glowing swamp elements)
        'path': '#5D4037'       // Dark muddy path
    },
    'Ruins': {
        'stone': '#7D7D7D',     // Darker stone for more dramatic ruins
        'ground': '#6D7254',    // Darker ground around ruins
        'vegetation': '#556B2F',
        'structure': '#4A4A4A', // Darker structure color for ruins
        'accent': '#9370DB',    // Purple accent (magical ruins elements)
        'path': '#696969'       // Ancient stone path
    },
    'Dark Sanctum': {
        'structure': '#0C0C0C',
        'fire': '#FF4500',
        'ground': '#3D2B22',    // Darker ground for more ominous feel
        'accent': '#8B0000',
        'glow': '#E3CF57',
        'path': '#2A0A0A'       // Dark red-black path
    },
    'Terrant': {
        'soil': '#E5C09A',
        'rock': '#696969',
        'vegetation': '#228B22',
        'crystal': '#7B68EE',
        'structure': '#4A4A4A',
        'accent': '#DAA520',
        'water': '#1E90FF',
        'glow': '#32CD32',
        'path': '#B8A888'       // Light dirt path
    }
};

const HOT_ZONE_COLORS = {
    'lava': '#FF5722',      // Brighter, more vibrant lava
    'magma': '#FF8A65',     // Lighter magma for contrast
    'ground': '#2D2D2D',    // Darker ground for contrast with lava
    'ash': '#BEBEBE',
    'glow': '#FFEB3B',      // Brighter yellow glow
    'ember': '#FF9800',     // Brighter orange ember
    'path': '#3E2723'       // Dark volcanic path
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
        
        // Generate dense forest clusters
        if (features.treeDensity) {
            this.generateForestClusters(features.treeDensity, theme);
        }

        // Generate rocks in clusters
        this.generateRockClusters(50, theme);

        // Generate bushes in clusters
        this.generateBushClusters(30, theme);

        // Generate flowers in patches
        this.generateFlowerPatches(40, theme);

        // Theme-specific environment
        switch (theme.primaryZone) {
            case 'Mountains':
                this.generateMountainRanges(20, theme);
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
                    
                    // Significantly increase tree density along paths
                    const treeCount = Math.floor(distance * density / 3); // Higher density
                    
                    for (let i = 0; i < treeCount; i++) {
                        const t = i / treeCount;
                        const x = point.x + (nextPoint.x - point.x) * t;
                        const z = point.z + (nextPoint.z - point.z) * t;
                        
                        // Create dense tree lines on both sides of the path
                        for (let side = -1; side <= 1; side += 2) { // Both sides of the path
                            // Vary the offset to create a more natural forest edge
                            const baseOffset = path.width + 2;
                            const variableOffset = this.rng() * 8; // Smaller variation for tighter grouping
                            const offset = baseOffset + variableOffset;
                            
                            // Add trees with varying sizes
                            const treeSize = 0.7 + this.rng() * 0.6; // 0.7 to 1.3 size multiplier
                            
                            this.mapData.environment.push({
                                type: 'tree',
                                position: {
                                    x: x + side * offset,
                                    y: 0,
                                    z: z + side * offset
                                },
                                theme: theme.name,
                                size: treeSize
                            });
                            
                            // Add multiple rows of trees for denser forest
                            for (let row = 1; row <= 3; row++) { // Up to 3 additional rows
                                if (this.rng() < 0.85 - (row * 0.15)) { // Decreasing chance for each row
                                    const rowOffset = offset + (row * 3) + this.rng() * 4; // Tighter spacing
                                    
                                    // Add slight lateral variation
                                    const lateralShift = this.rng() * 4 - 2; // -2 to 2 units shift
                                    
                                    this.mapData.environment.push({
                                        type: 'tree',
                                        position: {
                                            x: x + side * rowOffset + lateralShift,
                                            y: 0,
                                            z: z + side * rowOffset + lateralShift
                                        },
                                        theme: theme.name,
                                        size: 0.6 + this.rng() * 0.8 // More size variation
                                    });
                                }
                            }
                            
                            // Add occasional bushes and rocks near trees
                            if (this.rng() < 0.4) { // Increased chance
                                const bushOffset = offset + (this.rng() - 0.5) * 3; // Tighter clustering
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
                            
                            if (this.rng() < 0.2) { // Slightly increased chance
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
        });
    }
    
    /**
     * Generate dense forest clusters throughout the map
     */
    generateForestClusters(density, theme) {
        // Number of forest clusters based on map size and density
        const clusterCount = Math.floor((this.mapSize / 100) * density);
        
        for (let i = 0; i < clusterCount; i++) {
            // Create forest clusters away from paths and structures
            const clusterCenter = this.getRandomPosition(100, 400);
            
            // Skip if too close to structures or paths
            if (!this.isPositionValid(clusterCenter, 30, 20)) {
                continue;
            }
            
            // Determine forest cluster size
            const clusterSize = 20 + Math.floor(this.rng() * 30); // 20-50 trees per cluster
            const clusterRadius = 15 + this.rng() * 25; // 15-40 units radius
            
            // Generate trees in the cluster with tight spacing
            for (let j = 0; j < clusterSize; j++) {
                // Trees get denser toward the center of the cluster
                const distanceFromCenter = this.rng() * this.rng() * clusterRadius; // Squared distribution
                const angle = this.rng() * Math.PI * 2;
                
                const treePosition = {
                    x: clusterCenter.x + Math.cos(angle) * distanceFromCenter,
                    y: 0,
                    z: clusterCenter.z + Math.sin(angle) * distanceFromCenter
                };
                
                // Add some randomness to tree size - smaller trees more common
                const treeSize = 0.6 + this.rng() * this.rng() * 0.8; // 0.6-1.4 with bias toward smaller
                
                this.mapData.environment.push({
                    type: 'tree',
                    position: treePosition,
                    theme: theme.name,
                    size: treeSize,
                    cluster: `forest_${i}` // Tag trees as part of a cluster
                });
                
                // Add undergrowth - bushes, flowers, fallen logs, etc.
                if (this.rng() < 0.4) {
                    const undergrowthType = this.rng() < 0.6 ? 'bush' : 
                                          (this.rng() < 0.5 ? 'flower' : 'fallen_log');
                    
                    const undergrowthPosition = this.getNearbyPosition(treePosition, 1, 3);
                    
                    this.mapData.environment.push({
                        type: undergrowthType,
                        position: undergrowthPosition,
                        theme: theme.name,
                        size: 0.3 + this.rng() * 0.3,
                        cluster: `forest_${i}`
                    });
                }
            }
            
            // Add some clearings within the forest
            if (this.rng() < 0.4 && clusterRadius > 25) {
                const clearingCount = 1 + Math.floor(this.rng() * 2);
                
                for (let c = 0; c < clearingCount; c++) {
                    const clearingPosition = this.getNearbyPosition(clusterCenter, 5, clusterRadius * 0.7);
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
     */
    generateMountainRanges(count, theme) {
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
     */
    isPositionValid(position, minDistanceToStructures = 10, minDistanceToPaths = 5) {
        // Check distance to structures
        for (const structure of this.mapData.structures) {
            const dx = position.x - structure.position.x;
            const dz = position.z - structure.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < minDistanceToStructures) {
                return false;
            }
        }
        
        // Check distance to paths
        for (const path of this.mapData.paths) {
            for (const point of path.points) {
                const dx = position.x - point.x;
                const dz = position.z - point.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < minDistanceToPaths + path.width) {
                    return false;
                }
            }
        }
        
        return true;
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