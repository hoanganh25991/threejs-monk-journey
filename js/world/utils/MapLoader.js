import * as THREE from 'three';

/**
 * Map Loader - Loads pre-generated maps into the world
 * Integrates with existing WorldManager, StructureManager, and EnvironmentManager
 * Supports chunked loading for better performance with large maps
 */
export class MapLoader {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.scene = worldManager.scene;
        this.game = worldManager.game;
        
        // Track loaded map data
        this.currentMap = null;
        this.loadedObjects = {}; // Organized by chunk key
        
        // Chunking settings
        this.useChunking = true; // Can be toggled for small maps
        this.chunkSize = 25;     // Size of each chunk in world units
        this.loadRadius = 4;     // How many chunks to load in each direction from player (increased from 2)
        this.loadedChunks = {};  // Track which chunks are currently loaded
        this.lastPlayerChunk = null; // Last player chunk coordinates for change detection
        this.lastPlayerDirection = null; // Last player direction for selective chunk loading
        
        // Anti-eager loading settings
        this.lastUpdateTime = 0;  // Last time chunks were updated
        this.updateCooldown = 500; // Minimum time between chunk updates (ms) (reduced from 3000)
        this.lastPlayerPosition = null; // Last player position for distance-based updates
        this.minMoveDistance = 5; // Minimum distance player must move to trigger update (reduced from 10)
        
        // Spatial index for quick lookup of objects by position
        this.spatialIndex = {
            zones: {},
            paths: {},
            structures: {},
            environment: {}
        };
    }

    /**
     * Load a map from JSON data
     * @param {Object} mapData - The map data to load
     * @param {boolean} useChunking - Whether to use chunking (defaults to this.useChunking)
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadMap(mapData, useChunking = this.useChunking) {
        console.debug(`Loading map: ${mapData.theme.name} (chunking: ${useChunking})`);
        
        try {
            // Clear existing world content
            await this.clearWorld();
            
            // Store current map reference
            this.currentMap = mapData;
            
            // Set theme colors in zone manager if available
            if (mapData.theme && mapData.theme.colors) {
                this.worldManager.zoneManager.setThemeColors(mapData.theme.colors);
            }
            
            // Always load zones globally (zones affect the entire map and are usually small in data size)
            await this.loadZones(mapData.zones);
            
            if (useChunking) {
                // Process and chunk the map data
                const chunkedData = this.chunkifyMapData(mapData);
                
                // Store map metadata and chunked data
                this.currentMap.chunkedData = chunkedData;
                this.currentMap.bounds = this.calculateMapBounds(mapData);
                
                // Initial load of chunks around starting position (usually 0,0,0)
                const startPosition = new THREE.Vector3(0, 0, 0);
                await this.initialChunkLoad(startPosition);
                
                console.debug(`Map "${mapData.theme.name}" loaded successfully (chunked mode)`);
            } else {
                // Load all map components in order (non-chunked mode)
                await this.loadPaths(mapData.paths);
                await this.loadStructures(mapData.structures);
                await this.loadEnvironment(mapData.environment);
                
                console.debug(`Map "${mapData.theme.name}" loaded successfully (non-chunked mode)`);
            }
            
            return true;
            
        } catch (error) {
            console.error('Error loading map:', error);
            return false;
        }
    }

    /**
     * Load a map from a JSON file
     * @param {string} mapFilePath - Path to the map JSON file
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadMapFromFile(mapFilePath) {
        try {
            const response = await fetch(mapFilePath);
            const mapData = await response.json();
            return await this.loadMap(mapData);
        } catch (error) {
            console.error('Error loading map file:', error);
            return false;
        }
    }

    /**
     * Clear the existing world
     */
    async clearWorld() {
        console.debug('Clearing existing world...');
        
        // Clear existing structures
        if (this.worldManager.structureManager) {
            this.worldManager.structureManager.clear();
        }
        
        // Clear existing environment objects
        if (this.worldManager.environmentManager) {
            this.worldManager.environmentManager.clear();
        }
        
        // Clear existing zones and theme colors
        if (this.worldManager.zoneManager) {
            this.worldManager.zoneManager.clear();
            this.worldManager.zoneManager.setThemeColors(null);
        }
        
        // Clear existing procedural paths from WorldManager
        this.clearProceduralPaths();
        
        // Clear our tracked objects (handle both chunked and non-chunked modes)
        if (Array.isArray(this.loadedObjects)) {
            // Non-chunked mode
            this.loadedObjects.forEach(obj => {
                if (obj && obj.parent) {
                    this.scene.remove(obj);
                    this.disposeObject(obj);
                }
            });
            this.loadedObjects = [];
        } else {
            // Chunked mode
            for (const chunkKey in this.loadedObjects) {
                const chunkObjects = this.loadedObjects[chunkKey];
                
                // Clear paths
                if (chunkObjects.paths) {
                    chunkObjects.paths.forEach(obj => {
                        if (obj && obj.parent) {
                            this.scene.remove(obj);
                            this.disposeObject(obj);
                        }
                    });
                }
                
                // Clear structures
                if (chunkObjects.structures) {
                    chunkObjects.structures.forEach(obj => {
                        if (obj && obj.parent) {
                            this.scene.remove(obj);
                            this.disposeObject(obj);
                        }
                    });
                }
                
                // Clear environment objects
                if (chunkObjects.environment) {
                    chunkObjects.environment.forEach(obj => {
                        if (obj && obj.parent) {
                            this.scene.remove(obj);
                            this.disposeObject(obj);
                        }
                    });
                }
            }
            this.loadedObjects = {};
        }
        
        // Reset chunking state
        this.loadedChunks = {};
        this.lastPlayerChunk = null;
        this.lastPlayerPosition = null;
        this.lastPlayerDirection = null;
        this.lastUpdateTime = 0;
        
        // Clear spatial index
        this.spatialIndex = {
            zones: {},
            paths: {},
            structures: {},
            environment: {}
        };
    }

    /**
     * Clear procedural paths from WorldManager
     */
    clearProceduralPaths() {
        if (this.worldManager.paths && this.worldManager.paths.length > 0) {
            console.debug(`Clearing ${this.worldManager.paths.length} procedural paths...`);
            
            // Remove all procedural path meshes from scene
            this.worldManager.paths.forEach(pathMesh => {
                if (pathMesh && pathMesh.parent) {
                    this.scene.remove(pathMesh);
                }
                // Dispose of geometry and material to free memory
                if (pathMesh.geometry) {
                    pathMesh.geometry.dispose();
                }
                if (pathMesh.material) {
                    if (Array.isArray(pathMesh.material)) {
                        pathMesh.material.forEach(mat => mat.dispose());
                    } else {
                        pathMesh.material.dispose();
                    }
                }
            });
            
            // Clear the paths array
            this.worldManager.paths = [];
        }
        
        // Clear loaded map paths
        if (this.worldManager.loadedMapPaths && this.worldManager.loadedMapPaths.length > 0) {
            console.debug(`Clearing ${this.worldManager.loadedMapPaths.length} loaded map paths...`);
            this.worldManager.loadedMapPaths = [];
        }
        
        // Clear path nodes to prevent future connections
        if (this.worldManager.pathNodes) {
            this.worldManager.pathNodes = [];
        }
        
        // Reset path generation position to prevent immediate regeneration
        if (this.worldManager.lastPathGenerationPosition) {
            this.worldManager.lastPathGenerationPosition.set(0, 0, 0);
        }
    }

    /**
     * Load zones from map data
     * @param {Array} zones - Zone data array
     */
    async loadZones(zones) {
        console.debug(`Loading ${zones.length} zones...`);
        
        if (!this.worldManager.zoneManager) {
            console.warn('ZoneManager not available');
            return;
        }
        
        // Convert map zones to ZoneManager format
        const convertedZones = zones.map(zone => {
            // Handle zones with 'center' property
            if (zone.center) {
                return {
                    name: zone.name,
                    center: new THREE.Vector3(zone.center.x, zone.center.y, zone.center.z),
                    radius: zone.radius,
                    color: zone.color
                };
            } 
            // Handle zones with 'points' property (like boundary zones)
            else if (zone.points && zone.points.length > 0) {
                // Calculate center from points
                const center = new THREE.Vector3(0, 0, 0);
                zone.points.forEach(point => {
                    center.x += point.x;
                    center.y += point.y;
                    center.z += point.z;
                });
                center.divideScalar(zone.points.length);
                
                // Calculate radius as distance to furthest point
                let maxDistance = 0;
                zone.points.forEach(point => {
                    const distance = Math.sqrt(
                        Math.pow(point.x - center.x, 2) + 
                        Math.pow(point.z - center.z, 2)
                    );
                    maxDistance = Math.max(maxDistance, distance);
                });
                
                return {
                    name: zone.name,
                    center: center,
                    radius: maxDistance,
                    color: zone.color
                };
            }
            // Skip zones with invalid format
            else {
                console.warn(`Skipping zone "${zone.name}" with invalid format`);
                return null;
            }
        }).filter(zone => zone !== null); // Remove any null zones
        
        // Update zone manager with new zones
        this.worldManager.zoneManager.zones = convertedZones;
        this.worldManager.zoneManager.buildSimpleZoneCache();
        this.worldManager.zoneManager.visualizeZones();
        
        // Update terrain colors based on zones (using ZoneManager's implementation)
        this.worldManager.zoneManager.updateTerrainColors();
    }



    /**
     * Load paths from map data (non-chunked mode)
     * @param {Array} paths - Path data array
     */
    async loadPaths(paths) {
        console.debug(`Loading ${paths.length} paths (non-chunked mode)...`);
        
        // Initialize loadedObjects as array for non-chunked mode if it's not already
        if (!Array.isArray(this.loadedObjects)) {
            this.loadedObjects = [];
        }
        
        paths.forEach(pathData => {
            const pathGroup = this.createPath(pathData);
            
            // Register path points with WorldManager for navigation and AI
            this.registerPathWithWorldManager(pathData, pathGroup);
            
            // Track in non-chunked array
            this.loadedObjects.push(pathGroup);
        });
        
        console.debug(`Loaded ${paths.length} map paths successfully`);
    }

    /**
     * Create a path in the world
     * @param {Object} pathData - Path configuration
     */
    createPath(pathData) {
        const points = pathData.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
        const width = pathData.width || 3;
        
        // Create path geometry
        const pathGeometry = this.createPathGeometry(points, width);
        
        // Get the zone at the first point of the path to determine color
        const zoneAt = this.worldManager.zoneManager.getZoneAt(points[0]);
        const zoneName = zoneAt ? zoneAt.name : 'Terrant';
        
        // Get zone colors from the current map theme
        let pathColor = 0x8B7355; // Default brown path color
        
        if (this.currentMap && this.currentMap.theme) {
            const themeColors = this.currentMap.theme.colors;
            
            // Use zone-specific path color if available
            if (themeColors && themeColors.path) {
                // Convert hex string to number
                pathColor = parseInt(themeColors.path.replace('#', '0x'), 16);
            } else if (zoneName === 'Desert' && themeColors.sand) {
                pathColor = parseInt(themeColors.sand.replace('#', '0x'), 16);
            } else if (zoneName === 'Forest' && themeColors.ground) {
                pathColor = parseInt(themeColors.ground.replace('#', '0x'), 16);
            } else if (zoneName === 'Mountains' && themeColors.rock) {
                pathColor = parseInt(themeColors.rock.replace('#', '0x'), 16);
            }
        }
        
        // Create path material with zone-appropriate color
        const pathMaterial = new THREE.MeshLambertMaterial({
            color: pathColor,
            transparent: true,
            opacity: 0.9, // Increased from 0.8 for better visibility
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Create path mesh
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.receiveShadow = true;
        
        // Ensure path is visible above ground
        pathMesh.position.y = 0.1; // Slightly above ground level
        
        // Add path border/edge for better definition
        const borderWidth = width + 0.3;
        const borderGeometry = this.createPathGeometry(points, borderWidth);
        const borderMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.2,
            roughness: 0.9
        });
        
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.y = 0.05; // Slightly above ground but below the main path
        borderMesh.receiveShadow = true;
        
        // Create a group for the path and its border
        const pathGroup = new THREE.Group();
        pathGroup.add(borderMesh);
        pathGroup.add(pathMesh);
        
        // Ensure the entire path group is visible
        pathGroup.position.y = 0.1; // Raise the entire path group above ground
        
        pathGroup.userData = {
            type: 'path',
            id: pathData.id,
            pattern: pathData.pattern,
            zone: zoneName
        };
        
        this.scene.add(pathGroup);
        
        // Note: We no longer track objects here directly
        // They are now tracked in the chunk-specific arrays in loadChunkPaths
        // or in a temporary array for non-chunked mode
        
        return pathGroup;
    }

    /**
     * Create geometry for a path
     * @param {Array} points - Array of Vector3 points
     * @param {number} width - Path width
     * @returns {THREE.BufferGeometry} - Path geometry
     */
    createPathGeometry(points, width) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        
        const halfWidth = width / 2;
        
        // Default visible height for paths
        const defaultVisibleHeight = 0.1;
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            
            // Use a fixed height to ensure visibility
            // We know getTerrainHeight returns 0, so we add our default height
            const height = defaultVisibleHeight;
            
            // Calculate direction for path width
            let direction;
            if (i === 0) {
                direction = points[1].clone().sub(point).normalize();
            } else if (i === points.length - 1) {
                direction = point.clone().sub(points[i - 1]).normalize();
            } else {
                const dir1 = point.clone().sub(points[i - 1]).normalize();
                const dir2 = points[i + 1].clone().sub(point).normalize();
                direction = dir1.add(dir2).normalize();
            }
            
            // Calculate perpendicular for width
            const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
            
            // Add vertices for both sides of the path
            const leftPoint = point.clone().add(perpendicular.clone().multiplyScalar(halfWidth));
            const rightPoint = point.clone().add(perpendicular.clone().multiplyScalar(-halfWidth));
            
            // Set explicit height to ensure visibility
            leftPoint.y = height;
            rightPoint.y = height;
            
            // If the point has a specific height in the data, use that instead
            if (point.y !== undefined && point.y > 0) {
                leftPoint.y = point.y;
                rightPoint.y = point.y;
            }
            
            vertices.push(leftPoint.x, leftPoint.y, leftPoint.z);
            vertices.push(rightPoint.x, rightPoint.y, rightPoint.z);
            
            // Add UVs
            const u = i / (points.length - 1);
            uvs.push(0, u);
            uvs.push(1, u);
            
            // Add indices for triangles (except for the last point)
            if (i < points.length - 1) {
                const baseIndex = i * 2;
                
                // First triangle
                indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
                // Second triangle
                indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }

    /**
     * Register loaded path with WorldManager for navigation and AI systems
     * @param {Object} pathData - Original path data
     * @param {THREE.Group} pathGroup - Created path group
     */
    registerPathWithWorldManager(pathData, pathGroup) {
        if (!this.worldManager || !pathData.points) {
            return;
        }

        // Add path points as navigation nodes for AI and pathfinding
        pathData.points.forEach((point, index) => {
            const position = new THREE.Vector3(point.x, point.y, point.z);
            
            // Add to path nodes for potential connections (but don't auto-connect)
            this.worldManager.pathNodes.push({
                position: position.clone(),
                type: 'map_path',
                pathId: pathData.id,
                pointIndex: index,
                timestamp: Date.now(),
                isMapPath: true // Flag to distinguish from procedural paths
            });
        });

        // Store reference to the loaded path in WorldManager
        if (!this.worldManager.loadedMapPaths) {
            this.worldManager.loadedMapPaths = [];
        }
        
        this.worldManager.loadedMapPaths.push({
            id: pathData.id,
            points: pathData.points.map(p => new THREE.Vector3(p.x, p.y, p.z)),
            width: pathData.width || 3,
            type: pathData.type || 'road',
            pathGroup: pathGroup
        });

        console.debug(`Registered path ${pathData.id} with ${pathData.points.length} points`);
    }

    /**
     * Load structures from map data (non-chunked mode)
     * @param {Array} structures - Structure data array
     */
    async loadStructures(structures) {
        console.debug(`Loading ${structures.length} structures (non-chunked mode)...`);
        
        if (!this.worldManager.structureManager) {
            console.warn('StructureManager not available');
            return;
        }
        
        // Initialize loadedObjects as array for non-chunked mode if it's not already
        if (!Array.isArray(this.loadedObjects)) {
            this.loadedObjects = [];
        }
        
        for (const structureData of structures) {
            const structure = await this.createStructure(structureData);
            if (structure) {
                // Track in non-chunked array
                this.loadedObjects.push(structure);
            }
        }
    }

    /**
     * Create a structure in the world
     * @param {Object} structureData - Structure configuration
     */
    async createStructure(structureData) {
        const position = structureData.position;
        const structureManager = this.worldManager.structureManager;
        
        let structure = null;
        
        switch (structureData.type) {
            case 'village':
                structure = await this.createVillageFromData(structureData);
                break;
                
            case 'tower':
                structure = structureManager.createTower(position.x, position.z);
                break;
                
            case 'ruins':
                structure = structureManager.createRuins(position.x, position.z);
                break;
                
            case 'darkSanctum':
                structure = structureManager.createDarkSanctum(position.x, position.z);
                break;
                
            case 'bridge':
                structure = structureManager.createBridge(position.x, position.z);
                break;
                
            default:
                console.warn(`Unknown structure type: ${structureData.type}`);
        }
        
        if (structure) {
            // Ensure the structure is positioned at a visible height
            const defaultVisibleHeight = 0.5; // Default height above ground to make structures visible
            
            // Check if position exists before accessing it
            if (structure.position && structure.position.y !== undefined) {
                // Always adjust the height to ensure visibility
                console.debug(`Adjusting height of ${structureData.type} structure from ${structure.position.y} to ${defaultVisibleHeight}`);
                structure.position.y = defaultVisibleHeight;
                
                // If the structure has a specific height in the data, use that instead
                if (position.y !== undefined && position.y > 0) {
                    structure.position.y = position.y;
                    console.debug(`Using specified height for ${structureData.type} structure: ${position.y}`);
                }
            }
            
            structure.userData = {
                ...structure.userData,
                mapId: structureData.id,
                theme: structureData.theme
            };
            
            // Note: We no longer track objects here directly
            // They are now tracked in the chunk-specific arrays or in the non-chunked array
            
            return structure;
        }
        
        return null;
    }

    /**
     * Create a village from map data with enhanced features
     * @param {Object} villageData - Village configuration
     * @returns {THREE.Group} - Village group object
     */
    async createVillageFromData(villageData) {
        const villageGroup = new THREE.Group();
        villageGroup.userData = {
            type: 'village',
            mapId: villageData.id,
            theme: villageData.theme,
            style: villageData.style || 0
        };
        
        // Create buildings with proper rotation and style
        for (const buildingData of villageData.buildings) {
            // Get zone colors for theming
            const zoneAt = this.worldManager.zoneManager.getZoneAt(
                new THREE.Vector3(buildingData.position.x, 0, buildingData.position.z)
            );
            const zoneName = zoneAt ? zoneAt.name : 'Terrant';
            
            // Create the building with appropriate parameters
            const building = this.worldManager.structureManager.createBuilding(
                buildingData.position.x,
                buildingData.position.z,
                buildingData.width,
                buildingData.depth,
                buildingData.height,
                buildingData.type || 'house',
                buildingData.style || 0,
                zoneName
            );
            
            if (building) {
                // Apply rotation if specified
                if (buildingData.rotation !== undefined) {
                    building.rotation.y = buildingData.rotation;
                }
                
                // Apply height position if specified (for terraced villages)
                if (buildingData.position.y !== undefined && buildingData.position.y > 0) {
                    building.position.y = buildingData.position.y;
                }
                
                villageGroup.add(building);
            }
        }
        
        // Create village paths
        if (villageData.paths && villageData.paths.length > 0) {
            for (const pathData of villageData.paths) {
                let pathMesh = null;
                
                if (pathData.type === 'circle') {
                    // Create circular path
                    const points = [];
                    const segments = 16;
                    
                    for (let i = 0; i <= segments; i++) {
                        const angle = (i / segments) * Math.PI * 2;
                        points.push(new THREE.Vector3(
                            pathData.center.x + Math.cos(angle) * pathData.radius,
                            pathData.center.y || 0,
                            pathData.center.z + Math.sin(angle) * pathData.radius
                        ));
                    }
                    
                    pathMesh = this.createPathFromPoints(points, pathData.width || 2, villageData.theme);
                } else if (pathData.type === 'line' && pathData.points && pathData.points.length >= 2) {
                    // Create linear path
                    const points = pathData.points.map(p => new THREE.Vector3(p.x, p.y || 0, p.z));
                    pathMesh = this.createPathFromPoints(points, pathData.width || 2, villageData.theme);
                }
                
                if (pathMesh) {
                    villageGroup.add(pathMesh);
                }
            }
        }
        
        // Create decorations
        if (villageData.decorations && villageData.decorations.length > 0) {
            for (const decorData of villageData.decorations) {
                let decorMesh = null;
                
                switch (decorData.type) {
                    case 'statue':
                        decorMesh = this.worldManager.environmentManager.createEnvironmentObject(
                            'statue',
                            decorData.position.x, 
                            decorData.position.z,
                            decorData.size || 1
                        );
                        break;
                    case 'fountain':
                        decorMesh = this.worldManager.environmentManager.createEnvironmentObject(
                            'fountain',
                            decorData.position.x, 
                            decorData.position.z,
                            decorData.size || 1
                        );
                        break;
                    case 'well':
                        decorMesh = this.worldManager.environmentManager.createEnvironmentObject(
                            'well',
                            decorData.position.x, 
                            decorData.position.z,
                            decorData.size || 1
                        );
                        break;
                    case 'tree':
                        decorMesh = this.worldManager.environmentManager.createEnvironmentObject(
                            'tree',
                            decorData.position.x, 
                            decorData.position.z,
                            decorData.size || 1
                        );
                        break;
                    case 'bush':
                        decorMesh = this.worldManager.environmentManager.createEnvironmentObject(
                            'bush',
                            decorData.position.x, 
                            decorData.position.z
                        );
                        break;
                    case 'rock':
                        decorMesh = this.worldManager.environmentManager.createEnvironmentObject(
                            'rock',
                            decorData.position.x, 
                            decorData.position.z,
                            decorData.size || 1
                        );
                        break;
                    case 'stairs':
                        decorMesh = this.worldManager.environmentFactory.create(
                            'stairs', 
                            new THREE.Vector3(decorData.position.x, decorData.position.y || 0, decorData.position.z),
                            decorData.width || 4,
                            decorData
                        );
                        break;
                }
                
                if (decorMesh) {
                    // Apply position and rotation if needed
                    if (decorData.position.y !== undefined && decorData.position.y > 0) {
                        decorMesh.position.y = decorData.position.y;
                    }
                    
                    if (decorData.rotation !== undefined) {
                        decorMesh.rotation.y = decorData.rotation;
                    }
                    
                    villageGroup.add(decorMesh);
                }
            }
        }
        
        // Create central feature if defined
        if (villageData.centralFeature) {
            const feature = villageData.centralFeature;
            let featureMesh = null;
            
            switch (feature.type) {
                case 'plaza':
                    featureMesh = this.worldManager.environmentFactory.create(
                        'plaza', 
                        new THREE.Vector3(feature.position.x, feature.position.y || 0, feature.position.z),
                        feature.radius || 8,
                        feature
                    );
                    break;
                case 'square':
                    featureMesh = this.worldManager.environmentFactory.create(
                        'square', 
                        new THREE.Vector3(feature.position.x, feature.position.y || 0, feature.position.z),
                        feature.size || 10,
                        feature
                    );
                    break;
                case 'market':
                    featureMesh = this.worldManager.environmentFactory.create(
                        'market', 
                        new THREE.Vector3(feature.position.x, feature.position.y || 0, feature.position.z),
                        feature.size || 8,
                        feature
                    );
                    break;
                case 'temple':
                    // Temple is already created as a building
                    break;
            }
            
            if (featureMesh) {
                // Apply position if needed
                if (feature.position.y !== undefined && feature.position.y > 0) {
                    featureMesh.position.y = feature.position.y;
                }
                
                villageGroup.add(featureMesh);
            }
        }
        
        this.scene.add(villageGroup);
        return villageGroup;
    }
    
    /**
     * Create a path from points
     * @param {Array<THREE.Vector3>} points - Path points
     * @param {number} width - Path width
     * @param {string} theme - Theme name
     * @returns {THREE.Group} - Path group
     */
    createPathFromPoints(points, width, theme) {
        // Get theme colors
        let pathColor = 0x8B7355; // Default brown path color
        
        if (this.currentMap && this.currentMap.theme) {
            const themeColors = this.currentMap.theme.colors;
            
            // Use theme-specific path color if available
            if (themeColors && themeColors.path) {
                // Convert hex string to number
                pathColor = parseInt(themeColors.path.replace('#', '0x'), 16);
            }
        }
        
        // Create path geometry
        const pathGeometry = this.createPathGeometry(points, width);
        
        // Create path material
        const pathMaterial = new THREE.MeshLambertMaterial({
            color: pathColor,
            transparent: true,
            opacity: 0.9,
            roughness: 0.8
        });
        
        // Create path mesh
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.receiveShadow = true;
        
        // Create a group for the path
        const pathGroup = new THREE.Group();
        pathGroup.add(pathMesh);
        pathGroup.userData = { type: 'path' };
        
        return pathGroup;
    }
    
    /**
     * Load environment objects from map data (non-chunked mode)
     * @param {Array} environment - Environment data array
     */
    async loadEnvironment(environment) {
        console.debug(`Loading ${environment.length} environment objects (non-chunked mode)...`);
        
        if (!this.worldManager.environmentManager) {
            console.warn('EnvironmentManager not available');
            return;
        }
        
        // Initialize loadedObjects as array for non-chunked mode if it's not already
        if (!Array.isArray(this.loadedObjects)) {
            this.loadedObjects = [];
        }
        
        for (const envData of environment) {
            const envObject = await this.createEnvironmentObject(envData);
            if (envObject) {
                // Track in non-chunked array
                this.loadedObjects.push(envObject);
            }
        }
    }

    /**
     * Create an environment object in the world
     * @param {Object} envData - Environment object configuration
     */
    async createEnvironmentObject(envData) {
        const position = envData.position;
        const environmentManager = this.worldManager.environmentManager;
        const size = envData.size || 1;
        let envObject = null;
        
        // Handle special case for mountain which is a structure, not an environment object
        if (envData.type === 'mountain') {
            envObject = this.worldManager.structureManager.createMountain(position.x, position.z);
        } else {
            // Use the environment manager's createEnvironmentObject method
            // which uses the factory internally for all environment objects
            envObject = environmentManager.createEnvironmentObject(
                envData.type, 
                position.x, 
                position.z,
                size,
                envData.data
            );
            
            if (!envObject) {
                console.warn(`Failed to create environment object of type: ${envData.type}`);
            }
        }
        
        if (envObject) {
            // Ensure the object is positioned at the correct height
            // Since getTerrainHeight always returns 0, we need to set a default height
            // to ensure objects are visible above the ground
            const defaultVisibleHeight = 0.5; // Default height above ground to make objects visible
            
            // Check if position exists before accessing it
            if (envObject.position && envObject.position.y !== undefined) {
                // Always adjust the height to ensure visibility
                console.debug(`Adjusting height of ${envData.type} from ${envObject.position.y} to ${defaultVisibleHeight}`);
                envObject.position.y = defaultVisibleHeight;
                
                // If the object has a specific height in the data, use that instead
                if (position.y !== undefined && position.y > 0) {
                    envObject.position.y = position.y;
                    console.debug(`Using specified height for ${envData.type}: ${position.y}`);
                }
            } else {
                console.warn(`Environment object of type ${envData.type} has no valid position property`);
            }
            
            envObject.userData = {
                ...envObject.userData,
                theme: envData.theme
            };
            
            // Note: We no longer track objects here directly
            // They are now tracked in the chunk-specific arrays or in the non-chunked array
            
            return envObject;
        }
        
        return null;
    }

    /**
     * Get information about the currently loaded map
     * @returns {Object|null} - Map information or null if no map is loaded
     */
    getCurrentMapInfo() {
        if (!this.currentMap) {
            return null;
        }
        
        return {
            theme: this.currentMap.theme.name,
            description: this.currentMap.theme.description,
            metadata: this.currentMap.metadata,
            objectCounts: {
                zones: this.currentMap.zones.length,
                structures: this.currentMap.structures.length,
                paths: this.currentMap.paths.length,
                environment: this.currentMap.environment.length
            }
        };
    }

    /**
     * Clear the currently loaded map
     */
    async clearCurrentMap() {
        if (this.currentMap) {
            await this.clearWorld();
            this.currentMap = null;
            console.debug('Current map cleared');
        }
    }
    
    /**
     * Dispose of a Three.js object to free memory
     * @param {THREE.Object3D} object - Object to dispose
     */
    disposeObject(object) {
        if (!object) return;
        
        // Recursively dispose of all children
        if (object.children && object.children.length > 0) {
            // Create a copy of the children array to avoid modification during iteration
            const children = [...object.children];
            children.forEach(child => {
                this.disposeObject(child);
            });
        }
        
        // Dispose of geometries and materials
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material.map) material.map.dispose();
                    material.dispose();
                });
            } else {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
            }
        }
    }
    
    /**
     * Calculate the bounds of the map from all objects
     * @param {Object} mapData - The map data
     * @returns {Object} - Bounds object with min and max coordinates
     */
    calculateMapBounds(mapData) {
        const bounds = {
            minX: Infinity,
            maxX: -Infinity,
            minZ: Infinity,
            maxZ: -Infinity
        };
        
        // Process zones
        if (mapData.zones) {
            mapData.zones.forEach(zone => {
                if (zone.center) {
                    bounds.minX = Math.min(bounds.minX, zone.center.x - zone.radius);
                    bounds.maxX = Math.max(bounds.maxX, zone.center.x + zone.radius);
                    bounds.minZ = Math.min(bounds.minZ, zone.center.z - zone.radius);
                    bounds.maxZ = Math.max(bounds.maxZ, zone.center.z + zone.radius);
                } else if (zone.points) {
                    zone.points.forEach(point => {
                        bounds.minX = Math.min(bounds.minX, point.x);
                        bounds.maxX = Math.max(bounds.maxX, point.x);
                        bounds.minZ = Math.min(bounds.minZ, point.z);
                        bounds.maxZ = Math.max(bounds.maxZ, point.z);
                    });
                }
            });
        }
        
        // Process paths
        if (mapData.paths) {
            mapData.paths.forEach(path => {
                if (path.points) {
                    path.points.forEach(point => {
                        bounds.minX = Math.min(bounds.minX, point.x);
                        bounds.maxX = Math.max(bounds.maxX, point.x);
                        bounds.minZ = Math.min(bounds.minZ, point.z);
                        bounds.maxZ = Math.max(bounds.maxZ, point.z);
                    });
                }
            });
        }
        
        // Process structures
        if (mapData.structures) {
            mapData.structures.forEach(structure => {
                if (structure.position) {
                    bounds.minX = Math.min(bounds.minX, structure.position.x);
                    bounds.maxX = Math.max(bounds.maxX, structure.position.x);
                    bounds.minZ = Math.min(bounds.minZ, structure.position.z);
                    bounds.maxZ = Math.max(bounds.maxZ, structure.position.z);
                }
            });
        }
        
        // Process environment objects
        if (mapData.environment) {
            mapData.environment.forEach(env => {
                if (env.position) {
                    bounds.minX = Math.min(bounds.minX, env.position.x);
                    bounds.maxX = Math.max(bounds.maxX, env.position.x);
                    bounds.minZ = Math.min(bounds.minZ, env.position.z);
                    bounds.maxZ = Math.max(bounds.maxZ, env.position.z);
                }
            });
        }
        
        // Add padding to bounds
        const padding = this.chunkSize;
        bounds.minX -= padding;
        bounds.maxX += padding;
        bounds.minZ -= padding;
        bounds.maxZ += padding;
        
        return bounds;
    }
    
    /**
     * Divide map data into chunks for efficient loading
     * @param {Object} mapData - The map data to chunk
     * @returns {Object} - Map data organized by chunks
     */
    chunkifyMapData(mapData) {
        const chunkedData = {
            zones: mapData.zones, // Zones are kept global
            chunks: {}
        };
        
        // Process paths
        if (mapData.paths) {
            mapData.paths.forEach(path => {
                // For paths that span multiple chunks, we need to assign them to all relevant chunks
                if (path.points && path.points.length > 0) {
                    const affectedChunks = new Set();
                    
                    // Find all chunks this path touches
                    path.points.forEach(point => {
                        const chunkKey = this.getChunkKeyFromPosition(point.x, point.z);
                        affectedChunks.add(chunkKey);
                    });
                    
                    // Add path to all affected chunks
                    affectedChunks.forEach(chunkKey => {
                        if (!chunkedData.chunks[chunkKey]) {
                            chunkedData.chunks[chunkKey] = { paths: [], structures: [], environment: [] };
                        }
                        
                        chunkedData.chunks[chunkKey].paths.push(path);
                    });
                }
            });
        }
        
        // Process structures
        if (mapData.structures) {
            mapData.structures.forEach(structure => {
                if (structure.position) {
                    const chunkKey = this.getChunkKeyFromPosition(structure.position.x, structure.position.z);
                    
                    if (!chunkedData.chunks[chunkKey]) {
                        chunkedData.chunks[chunkKey] = { paths: [], structures: [], environment: [] };
                    }
                    
                    chunkedData.chunks[chunkKey].structures.push(structure);
                }
            });
        }
        
        // Process environment objects
        if (mapData.environment) {
            mapData.environment.forEach(env => {
                if (env.position) {
                    const chunkKey = this.getChunkKeyFromPosition(env.position.x, env.position.z);
                    
                    if (!chunkedData.chunks[chunkKey]) {
                        chunkedData.chunks[chunkKey] = { paths: [], structures: [], environment: [] };
                    }
                    
                    chunkedData.chunks[chunkKey].environment.push(env);
                }
            });
        }
        
        return chunkedData;
    }
    
    /**
     * Get chunk key from world position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {string} - Chunk key in format "x_z"
     */
    getChunkKeyFromPosition(x, z) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        return `${chunkX}_${chunkZ}`;
    }
    
    /**
     * Check for any missing chunks that should be loaded in the current radius
     * @param {number} playerChunkX - Player's chunk X coordinate
     * @param {number} playerChunkZ - Player's chunk Z coordinate
     */
    async checkForMissingChunks(playerChunkX, playerChunkZ) {
        if (!this.currentMap || !this.currentMap.chunkedData) {
            return; // No map loaded or not in chunked mode
        }
        
        // Get map bounds if available
        let minChunkX = -Infinity;
        let maxChunkX = Infinity;
        let minChunkZ = -Infinity;
        let maxChunkZ = Infinity;
        
        if (this.currentMap.bounds) {
            minChunkX = Math.floor(this.currentMap.bounds.minX / this.chunkSize);
            maxChunkX = Math.ceil(this.currentMap.bounds.maxX / this.chunkSize);
            minChunkZ = Math.floor(this.currentMap.bounds.minZ / this.chunkSize);
            maxChunkZ = Math.ceil(this.currentMap.bounds.maxZ / this.chunkSize);
        }
        
        // Use a smaller radius for periodic checks
        const checkRadius = 2; // Just check the immediate surroundings
        const chunksToCheck = {};
        
        // Check chunks in a square around player
        for (let xOffset = -checkRadius; xOffset <= checkRadius; xOffset++) {
            for (let zOffset = -checkRadius; zOffset <= checkRadius; zOffset++) {
                const targetChunkX = playerChunkX + xOffset;
                const targetChunkZ = playerChunkZ + zOffset;
                
                // Only check chunks within map bounds
                if (targetChunkX >= minChunkX && targetChunkX <= maxChunkX && 
                    targetChunkZ >= minChunkZ && targetChunkZ <= maxChunkZ) {
                    const targetChunkKey = `${targetChunkX}_${targetChunkZ}`;
                    chunksToCheck[targetChunkKey] = true;
                }
            }
        }
        
        // Load any missing chunks
        let missingChunksCount = 0;
        for (const chunkKey in chunksToCheck) {
            if (!this.loadedChunks[chunkKey]) {
                await this.loadChunk(chunkKey);
                missingChunksCount++;
            }
        }
        
        if (missingChunksCount > 0) {
            console.debug(`Loaded ${missingChunksCount} missing chunks during periodic check`);
        }
    }

    /**
     * Initial load of chunks around a position - used when first loading a map
     * @param {THREE.Vector3} position - Position to load chunks around
     */
    async initialChunkLoad(position) {
        if (!this.currentMap || !this.currentMap.chunkedData) {
            return; // No map loaded or not in chunked mode
        }
        
        console.debug("Performing initial chunk load...");
        
        // Initialize tracking variables
        this.lastPlayerPosition = position.clone();
        this.lastUpdateTime = Date.now();
        
        // Get current chunk
        const chunkX = Math.floor(position.x / this.chunkSize);
        const chunkZ = Math.floor(position.z / this.chunkSize);
        const chunkKey = `${chunkX}_${chunkZ}`;
        this.lastPlayerChunk = chunkKey;
        
        // Get map bounds if available
        let minChunkX = -Infinity;
        let maxChunkX = Infinity;
        let minChunkZ = -Infinity;
        let maxChunkZ = Infinity;
        
        if (this.currentMap.bounds) {
            minChunkX = Math.floor(this.currentMap.bounds.minX / this.chunkSize);
            maxChunkX = Math.ceil(this.currentMap.bounds.maxX / this.chunkSize);
            minChunkZ = Math.floor(this.currentMap.bounds.minZ / this.chunkSize);
            maxChunkZ = Math.ceil(this.currentMap.bounds.maxZ / this.chunkSize);
        }
        
        // Use a larger initial radius for first load
        const initialRadius = this.loadRadius + 2; // Increased from loadRadius + 1
        const chunksToLoad = {};
        
        // Load chunks in all directions for initial load
        for (let xOffset = -initialRadius; xOffset <= initialRadius; xOffset++) {
            for (let zOffset = -initialRadius; zOffset <= initialRadius; zOffset++) {
                const targetChunkX = chunkX + xOffset;
                const targetChunkZ = chunkZ + zOffset;
                
                // Only load chunks within map bounds
                if (targetChunkX >= minChunkX && targetChunkX <= maxChunkX && 
                    targetChunkZ >= minChunkZ && targetChunkZ <= maxChunkZ) {
                    const targetChunkKey = `${targetChunkX}_${targetChunkZ}`;
                    chunksToLoad[targetChunkKey] = true;
                }
            }
        }
        
        // Load all initial chunks
        for (const chunkKey in chunksToLoad) {
            if (!this.loadedChunks[chunkKey]) {
                await this.loadChunk(chunkKey);
            }
        }
        
        console.debug(`Initial chunk load complete (${Object.keys(chunksToLoad).length} chunks)`);
    }
    
    /**
     * Update loaded chunks based on player position with anti-eager loading
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    async updateLoadedChunksForPosition(playerPosition) {
        if (!this.currentMap || !this.currentMap.chunkedData) {
            return; // No map loaded or not in chunked mode
        }
        
        // Special case for first load - initialize position tracking
        if (!this.lastPlayerPosition) {
            this.lastPlayerPosition = playerPosition.clone();
            this.lastUpdateTime = Date.now();
            
            // For first load, we'll do a full chunk load
            await this.initialChunkLoad(playerPosition);
            return;
        }
        
        // Get current player chunk
        const playerChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const playerChunkZ = Math.floor(playerPosition.z / this.chunkSize);
        const playerChunkKey = `${playerChunkX}_${playerChunkZ}`;
        
        // Get player direction if available (from camera or player object)
        let playerDirection = null;
        if (this.game && this.game.player && this.game.player.getDirection) {
            playerDirection = this.game.player.getDirection();
        } else if (this.game && this.game.camera) {
            // Extract direction from camera if player direction not available
            const camera = this.game.camera;
            if (camera.getWorldDirection) {
                playerDirection = new THREE.Vector3();
                camera.getWorldDirection(playerDirection);
            }
        }
        
        // Calculate time since last update and distance moved
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
        const distanceMoved = this.lastPlayerPosition ? 
            playerPosition.distanceTo(this.lastPlayerPosition) : 0;
            
        // Skip if player hasn't moved to a new chunk and direction hasn't changed significantly
        const directionChanged = playerDirection && this.lastPlayerDirection && 
            playerDirection.angleTo(this.lastPlayerDirection) > 0.2; // ~11 degrees threshold (reduced from 0.3)
            
        // Check if we should update chunks based on multiple criteria
        const inSameChunk = this.lastPlayerChunk === playerChunkKey;
        const tooSoon = timeSinceLastUpdate < this.updateCooldown;
        const notMovedEnough = distanceMoved < this.minMoveDistance;
        
        // Only skip if ALL conditions are met (player hasn't moved much, is in same chunk, 
        // it's too soon since last update, AND direction hasn't changed)
        if (inSameChunk && tooSoon && notMovedEnough && !directionChanged) {
            // Even if we're skipping a full update, periodically check if we need to load any missing chunks
            if (timeSinceLastUpdate > 2000) { // Every 2 seconds at minimum
                // Force a check for any missing chunks in the current radius
                this.checkForMissingChunks(playerChunkX, playerChunkZ);
            }
            return; // Skip full update - no significant change in player state
        }
        
        console.debug(`Updating chunks for player at ${playerPosition.x.toFixed(1)}, ${playerPosition.z.toFixed(1)} (chunk ${playerChunkKey})`);
        
        // Get map bounds if available
        let minChunkX = -Infinity;
        let maxChunkX = Infinity;
        let minChunkZ = -Infinity;
        let maxChunkZ = Infinity;
        
        if (this.currentMap.bounds) {
            minChunkX = Math.floor(this.currentMap.bounds.minX / this.chunkSize);
            maxChunkX = Math.ceil(this.currentMap.bounds.maxX / this.chunkSize);
            minChunkZ = Math.floor(this.currentMap.bounds.minZ / this.chunkSize);
            maxChunkZ = Math.ceil(this.currentMap.bounds.maxZ / this.chunkSize);
        }
        
        // Determine chunks to load based on player position and direction
        const chunksToLoad = {};
        
        // If we have player direction, prioritize chunks in that direction
        if (playerDirection) {
            // Normalize to XZ plane for chunk loading
            playerDirection.y = 0;
            playerDirection.normalize();
            
            // Calculate forward vector in chunk space
            const forwardX = Math.round(playerDirection.x);
            const forwardZ = Math.round(playerDirection.z);
            
            // Load chunks in a cone in front of the player
            for (let xOffset = -this.loadRadius; xOffset <= this.loadRadius; xOffset++) {
                for (let zOffset = -this.loadRadius; zOffset <= this.loadRadius; zOffset++) {
                    const targetChunkX = playerChunkX + xOffset;
                    const targetChunkZ = playerChunkZ + zOffset;
                    
                    // Calculate distance from player chunk in chunk units
                    const chunkDistance = Math.sqrt(xOffset * xOffset + zOffset * zOffset);
                    
                    // Calculate dot product to determine if chunk is in front of player
                    const dirX = xOffset / (chunkDistance || 1); // Avoid division by zero
                    const dirZ = zOffset / (chunkDistance || 1);
                    const dotProduct = dirX * playerDirection.x + dirZ * playerDirection.z;
                    
                    // Load chunks that are either:
                    // 1. Close to the player (within inner radius)
                    // 2. In the direction the player is facing (within view cone)
                    const inInnerRadius = chunkDistance <= 1;
                    const inViewCone = dotProduct > 0.5 && chunkDistance <= this.loadRadius;
                    
                    if (inInnerRadius || inViewCone) {
                        // Only load chunks within map bounds
                        if (targetChunkX >= minChunkX && targetChunkX <= maxChunkX && 
                            targetChunkZ >= minChunkZ && targetChunkZ <= maxChunkZ) {
                            const targetChunkKey = `${targetChunkX}_${targetChunkZ}`;
                            chunksToLoad[targetChunkKey] = true;
                        }
                    }
                }
            }
        } else {
            // No direction available, load chunks in a square around player
            for (let xOffset = -this.loadRadius; xOffset <= this.loadRadius; xOffset++) {
                for (let zOffset = -this.loadRadius; zOffset <= this.loadRadius; zOffset++) {
                    const targetChunkX = playerChunkX + xOffset;
                    const targetChunkZ = playerChunkZ + zOffset;
                    
                    // Only load chunks within map bounds
                    if (targetChunkX >= minChunkX && targetChunkX <= maxChunkX && 
                        targetChunkZ >= minChunkZ && targetChunkZ <= maxChunkZ) {
                        const targetChunkKey = `${targetChunkX}_${targetChunkZ}`;
                        chunksToLoad[targetChunkKey] = true;
                    }
                }
            }
        }
        
        // Unload chunks that are no longer needed
        for (const chunkKey in this.loadedChunks) {
            if (!chunksToLoad[chunkKey]) {
                await this.unloadChunk(chunkKey);
            }
        }
        
        // Load new chunks
        for (const chunkKey in chunksToLoad) {
            if (!this.loadedChunks[chunkKey]) {
                await this.loadChunk(chunkKey);
            }
        }
        
        // Update tracking variables
        this.lastPlayerChunk = playerChunkKey;
        this.lastPlayerPosition = playerPosition.clone();
        this.lastUpdateTime = currentTime;
        if (playerDirection) {
            this.lastPlayerDirection = playerDirection.clone();
        }
    }
    
    /**
     * Load a specific chunk
     * @param {string} chunkKey - Chunk key to load
     */
    async loadChunk(chunkKey) {
        if (!this.currentMap || !this.currentMap.chunkedData || this.loadedChunks[chunkKey]) {
            return; // Already loaded or no map
        }
        
        // Check if chunk is within map bounds
        if (this.currentMap.bounds) {
            const [chunkX, chunkZ] = chunkKey.split('_').map(Number);
            const minChunkX = Math.floor(this.currentMap.bounds.minX / this.chunkSize);
            const maxChunkX = Math.ceil(this.currentMap.bounds.maxX / this.chunkSize);
            const minChunkZ = Math.floor(this.currentMap.bounds.minZ / this.chunkSize);
            const maxChunkZ = Math.ceil(this.currentMap.bounds.maxZ / this.chunkSize);
            
            // If chunk is outside map bounds, mark as empty and return
            if (chunkX < minChunkX || chunkX > maxChunkX || chunkZ < minChunkZ || chunkZ > maxChunkZ) {
                // Mark as loaded with empty data to prevent repeated attempts
                this.loadedChunks[chunkKey] = { paths: [], structures: [], environment: [] };
                return;
            }
        }
        
        console.debug(`Loading chunk ${chunkKey}...`);
        
        // Get chunk data directly from the chunked map data
        let chunkData = this.currentMap.chunkedData?.chunks?.[chunkKey];
        
        // If no data exists for this chunk, create an empty chunk structure
        if (!chunkData) {
            console.debug(`No data found for chunk ${chunkKey}, creating empty chunk`);
            chunkData = { paths: [], structures: [], environment: [] };
        }
        
        // Initialize tracking for this chunk
        this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        
        // Load chunk components in order
        if (chunkData.paths && chunkData.paths.length > 0) {
            await this.loadChunkPaths(chunkData.paths, chunkKey);
        }
        
        if (chunkData.structures && chunkData.structures.length > 0) {
            await this.loadChunkStructures(chunkData.structures, chunkKey);
        }
        
        if (chunkData.environment && chunkData.environment.length > 0) {
            await this.loadChunkEnvironment(chunkData.environment, chunkKey);
        }
        
        // Mark chunk as loaded
        this.loadedChunks[chunkKey] = chunkData;
        console.debug(`Chunk ${chunkKey} loaded successfully`);
        
        // Return true to indicate successful loading
        return true;
    }
    
    /**
     * Unload a specific chunk
     * @param {string} chunkKey - Chunk key to unload
     */
    async unloadChunk(chunkKey) {
        if (!this.loadedChunks[chunkKey]) {
            return; // Not loaded
        }
        
        console.debug(`Unloading chunk ${chunkKey}...`);
        
        // Remove all objects in this chunk from the scene
        if (this.loadedObjects[chunkKey]) {
            // Remove paths
            this.loadedObjects[chunkKey].paths.forEach(pathGroup => {
                if (pathGroup && pathGroup.parent) {
                    this.scene.remove(pathGroup);
                    this.disposeObject(pathGroup);
                }
            });
            
            // Remove structures
            this.loadedObjects[chunkKey].structures.forEach(structure => {
                if (structure && structure.parent) {
                    this.scene.remove(structure);
                    this.disposeObject(structure);
                }
            });
            
            // Remove environment objects
            this.loadedObjects[chunkKey].environment.forEach(envObject => {
                if (envObject && envObject.parent) {
                    this.scene.remove(envObject);
                    this.disposeObject(envObject);
                }
            });
            
            // Clear tracking arrays
            delete this.loadedObjects[chunkKey];
        }
        
        // Mark chunk as unloaded
        delete this.loadedChunks[chunkKey];
        console.debug(`Chunk ${chunkKey} unloaded successfully`);
    }
    
    /**
     * Load paths from map data for a specific chunk
     * @param {Array} paths - Path data array
     * @param {string} chunkKey - Chunk key
     */
    async loadChunkPaths(paths, chunkKey) {
        console.debug(`Loading ${paths.length} paths for chunk ${chunkKey}...`);
        
        // Initialize tracking array if needed
        if (!this.loadedObjects[chunkKey]) {
            this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        }
        
        paths.forEach(pathData => {
            const pathGroup = this.createPath(pathData);
            
            // Register path points with WorldManager for navigation and AI
            this.registerPathWithWorldManager(pathData, pathGroup);
            
            // Track this path in the loaded objects for this chunk
            this.loadedObjects[chunkKey].paths.push(pathGroup);
        });
        
        console.debug(`Loaded ${paths.length} map paths for chunk ${chunkKey} successfully`);
    }
    
    /**
     * Load structures from map data for a specific chunk
     * @param {Array} structures - Structure data array
     * @param {string} chunkKey - Chunk key
     */
    async loadChunkStructures(structures, chunkKey) {
        console.debug(`Loading ${structures.length} structures for chunk ${chunkKey}...`);
        
        // Initialize tracking array if needed
        if (!this.loadedObjects[chunkKey]) {
            this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        }
        
        for (const structureData of structures) {
            const structure = await this.createStructure(structureData);
            if (structure) {
                this.loadedObjects[chunkKey].structures.push(structure);
            }
        }
        
        console.debug(`Loaded ${structures.length} structures for chunk ${chunkKey} successfully`);
    }
    
    /**
     * Load environment objects from map data for a specific chunk
     * @param {Array} environment - Environment data array
     * @param {string} chunkKey - Chunk key
     */
    async loadChunkEnvironment(environment, chunkKey) {
        console.debug(`Loading ${environment.length} environment objects for chunk ${chunkKey}...`);
        
        // Initialize tracking array if needed
        if (!this.loadedObjects[chunkKey]) {
            this.loadedObjects[chunkKey] = { paths: [], structures: [], environment: [] };
        }
        
        for (const envData of environment) {
            const envObject = await this.createEnvironmentObject(envData);
            if (envObject) {
                this.loadedObjects[chunkKey].environment.push(envObject);
            }
        }
        
        console.debug(`Loaded ${environment.length} environment objects for chunk ${chunkKey} successfully`);
    }
}