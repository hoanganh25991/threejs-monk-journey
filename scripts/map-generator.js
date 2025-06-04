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
            paths: []
        };

        // Determine village style based on theme and random factor
        // 0: Circular village, 1: Grid village, 2: Riverside village, 3: Mountain village
        const villageStyle = Math.floor(this.rng() * 4);
        
        // Generate more buildings for a substantial village
        const buildingCount = 8 + Math.floor(this.rng() * 10); // 8-17 buildings
        
        // Add a central feature based on village style
        let centralFeature = null;
        
        switch(villageStyle) {
            case 0: // Circular village with central plaza
                centralFeature = {
                    type: 'plaza',
                    position: { x: position.x, y: 0, z: position.z },
                    radius: 8 + this.rng() * 4
                };
                
                // Create buildings in a circle around the plaza
                for (let i = 0; i < buildingCount; i++) {
                    const angle = (i / buildingCount) * Math.PI * 2;
                    const distance = centralFeature.radius + 5 + this.rng() * 10;
                    
                    // Vary building sizes and types
                    const buildingType = this.rng() < 0.8 ? 'house' : (this.rng() < 0.5 ? 'shop' : 'temple');
                    const buildingSize = buildingType === 'temple' ? 1.5 : (buildingType === 'shop' ? 1.2 : 1.0);
                    
                    village.buildings.push({
                        type: buildingType,
                        position: {
                            x: position.x + Math.cos(angle) * distance,
                            y: 0,
                            z: position.z + Math.sin(angle) * distance
                        },
                        rotation: angle + Math.PI, // Face toward plaza
                        width: (3 + this.rng() * 3) * buildingSize,
                        depth: (3 + this.rng() * 3) * buildingSize,
                        height: (2 + this.rng() * 2) * buildingSize,
                        style: Math.floor(this.rng() * 3) // 0-2 different building styles
                    });
                }
                
                // Add decorative elements to the plaza
                for (let i = 0; i < 3 + Math.floor(this.rng() * 3); i++) {
                    const angle = this.rng() * Math.PI * 2;
                    const distance = this.rng() * centralFeature.radius * 0.7;
                    
                    village.decorations.push({
                        type: this.rng() < 0.5 ? 'statue' : 'fountain',
                        position: {
                            x: position.x + Math.cos(angle) * distance,
                            y: 0,
                            z: position.z + Math.sin(angle) * distance
                        },
                        size: 1 + this.rng() * 1.5
                    });
                }
                
                // Create circular path around the plaza
                village.paths.push({
                    type: 'circle',
                    center: { x: position.x, y: 0, z: position.z },
                    radius: centralFeature.radius + 2,
                    width: 2 + this.rng()
                });
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
                    const treeCount = Math.floor(distance * density / 5); // Doubled density
                    
                    for (let i = 0; i < treeCount; i++) {
                        const t = i / treeCount;
                        const x = point.x + (nextPoint.x - point.x) * t;
                        const z = point.z + (nextPoint.z - point.z) * t;
                        
                        // Create dense tree lines on both sides of the path
                        for (let side = -1; side <= 1; side += 2) { // Both sides of the path
                            // Vary the offset to create a more natural forest edge
                            const baseOffset = path.width + 2;
                            const variableOffset = this.rng() * 15; // Increased from 5 to 15
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
                            
                            // Add a second row of trees for denser forest
                            if (this.rng() < 0.7) { // 70% chance for second row
                                const secondRowOffset = offset + 5 + this.rng() * 10;
                                this.mapData.environment.push({
                                    type: 'tree',
                                    position: {
                                        x: x + side * secondRowOffset,
                                        y: 0,
                                        z: z + side * secondRowOffset
                                    },
                                    theme: theme.name,
                                    size: 0.8 + this.rng() * 0.4
                                });
                            }
                            
                            // Add occasional bushes and rocks near trees
                            if (this.rng() < 0.3) {
                                const bushOffset = offset + (this.rng() - 0.5) * 5;
                                this.mapData.environment.push({
                                    type: 'bush',
                                    position: {
                                        x: x + side * bushOffset,
                                        y: 0,
                                        z: z + side * bushOffset
                                    },
                                    theme: theme.name
                                });
                            }
                            
                            if (this.rng() < 0.15) {
                                const rockOffset = offset + (this.rng() - 0.5) * 5;
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