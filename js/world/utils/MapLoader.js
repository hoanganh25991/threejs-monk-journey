import * as THREE from 'three';

/**
 * Map Loader - Loads pre-generated maps into the world
 * Integrates with existing WorldManager, StructureManager, and EnvironmentManager
 */
export class MapLoader {
    constructor(worldManager) {
        this.worldManager = worldManager;
        this.scene = worldManager.scene;
        this.game = worldManager.game;
        
        // Track loaded map data
        this.currentMap = null;
        this.loadedObjects = [];
    }

    /**
     * Load a map from JSON data
     * @param {Object} mapData - The map data to load
     * @returns {Promise<boolean>} - True if loading was successful
     */
    async loadMap(mapData) {
        console.debug(`Loading map: ${mapData.theme.name}`);
        
        try {
            // Clear existing world content
            await this.clearWorld();
            
            // Store current map reference
            this.currentMap = mapData;
            
            // Set theme colors in zone manager if available
            if (mapData.theme && mapData.theme.colors) {
                this.worldManager.zoneManager.setThemeColors(mapData.theme.colors);
            }
            
            // Load map components in order
            await this.loadZones(mapData.zones);
            await this.loadPaths(mapData.paths);
            await this.loadStructures(mapData.structures);
            await this.loadEnvironment(mapData.environment);
            
            console.debug(`Map "${mapData.theme.name}" loaded successfully`);
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
        
        // Clear our tracked objects
        this.loadedObjects.forEach(obj => {
            if (obj.parent) {
                this.scene.remove(obj);
            }
        });
        this.loadedObjects = [];
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
     * Load paths from map data
     * @param {Array} paths - Path data array
     */
    async loadPaths(paths) {
        console.debug(`Loading ${paths.length} paths...`);
        
        paths.forEach(pathData => {
            const pathGroup = this.createPath(pathData);
            
            // Register path points with WorldManager for navigation and AI
            this.registerPathWithWorldManager(pathData, pathGroup);
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
        borderMesh.position.y = -0.05; // Slightly below the main path
        borderMesh.receiveShadow = true;
        
        // Create a group for the path and its border
        const pathGroup = new THREE.Group();
        pathGroup.add(borderMesh);
        pathGroup.add(pathMesh);
        
        pathGroup.userData = {
            type: 'path',
            id: pathData.id,
            pattern: pathData.pattern,
            zone: zoneName
        };
        
        this.scene.add(pathGroup);
        this.loadedObjects.push(pathGroup);
        
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
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const height = this.worldManager.getTerrainHeight(point.x, point.z) + 0.1;
            
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
            
            leftPoint.y = height;
            rightPoint.y = height;
            
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
     * Load structures from map data
     * @param {Array} structures - Structure data array
     */
    async loadStructures(structures) {
        console.debug(`Loading ${structures.length} structures...`);
        
        if (!this.worldManager.structureManager) {
            console.warn('StructureManager not available');
            return;
        }
        
        for (const structureData of structures) {
            await this.createStructure(structureData);
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
            structure.userData = {
                ...structure.userData,
                mapId: structureData.id,
                theme: structureData.theme
            };
            
            this.loadedObjects.push(structure);
        }
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
     * Load environment objects from map data
     * @param {Array} environment - Environment data array
     */
    async loadEnvironment(environment) {
        console.debug(`Loading ${environment.length} environment objects...`);
        
        if (!this.worldManager.environmentManager) {
            console.warn('EnvironmentManager not available');
            return;
        }
        
        for (const envData of environment) {
            await this.createEnvironmentObject(envData);
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
            // This is a safety check in case the object wasn't positioned correctly by the factory
            const terrainHeight = this.worldManager.getTerrainHeight(position.x, position.z);
            
            // Check if position exists before accessing it
            if (envObject.position && envObject.position.y !== undefined) {
                // Only adjust if the object is significantly below the terrain
                if (envObject.position.y < terrainHeight - 0.5) {
                    console.debug(`Adjusting height of ${envData.type} from ${envObject.position.y} to ${terrainHeight}`);
                    envObject.position.y = terrainHeight;
                }
            } else {
                console.warn(`Environment object of type ${envData.type} has no valid position property`);
            }
            
            envObject.userData = {
                ...envObject.userData,
                theme: envData.theme
            };
            
            this.loadedObjects.push(envObject);
        }
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
}