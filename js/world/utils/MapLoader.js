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
        
        // Re-enable procedural path generation for when returning to procedural maps
        this.enableProceduralPathGeneration();
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
        
        // Disable procedural path generation while loading map paths
        this.disableProceduralPathGeneration();
        
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
     * Disable procedural path generation to prevent conflicts with loaded paths
     */
    disableProceduralPathGeneration() {
        if (this.worldManager) {
            // Set a flag to indicate that map paths are loaded
            this.worldManager.mapPathsLoaded = true;
            
            // Increase the path generation distance to effectively disable it
            this.worldManager.originalPathGenerationDistance = this.worldManager.pathGenerationDistance;
            this.worldManager.pathGenerationDistance = Number.MAX_SAFE_INTEGER;
            
            console.debug('Procedural path generation disabled - using map paths');
        }
    }

    /**
     * Re-enable procedural path generation (for when returning to procedural maps)
     */
    enableProceduralPathGeneration() {
        if (this.worldManager) {
            // Clear the flag
            this.worldManager.mapPathsLoaded = false;
            
            // Restore original path generation distance
            if (this.worldManager.originalPathGenerationDistance !== undefined) {
                this.worldManager.pathGenerationDistance = this.worldManager.originalPathGenerationDistance;
            } else {
                this.worldManager.pathGenerationDistance = 30; // Default value
            }
            
            console.debug('Procedural path generation re-enabled');
        }
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
                        decorMesh = this.createStatue(decorData);
                        break;
                    case 'fountain':
                        decorMesh = this.createFountain(decorData);
                        break;
                    case 'well':
                        decorMesh = this.createWell(decorData);
                        break;
                    case 'tree':
                        decorMesh = this.worldManager.environmentManager.createTree(
                            decorData.position.x, 
                            decorData.position.z,
                            null,
                            decorData.size || 1
                        );
                        break;
                    case 'bush':
                        decorMesh = this.worldManager.environmentManager.createBush(
                            decorData.position.x, 
                            decorData.position.z
                        );
                        break;
                    case 'rock':
                        decorMesh = this.worldManager.environmentManager.createRock(
                            decorData.position.x, 
                            decorData.position.z,
                            decorData.size || 1
                        );
                        break;
                    case 'stairs':
                        decorMesh = this.createStairs(decorData);
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
                    featureMesh = this.createPlaza(feature);
                    break;
                case 'square':
                    featureMesh = this.createSquare(feature);
                    break;
                case 'market':
                    featureMesh = this.createMarket(feature);
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
     * Create a statue decoration
     * @param {Object} data - Statue data
     * @returns {THREE.Mesh} - Statue mesh
     */
    createStatue(data) {
        // Create a simple statue (can be enhanced later)
        const baseGeometry = new THREE.CylinderGeometry(data.size * 0.5, data.size * 0.7, data.size * 0.5, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        const statueGeometry = new THREE.CylinderGeometry(data.size * 0.2, data.size * 0.2, data.size * 2, 8);
        const statueMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.5 });
        const statue = new THREE.Mesh(statueGeometry, statueMaterial);
        statue.position.y = data.size * 1.25;
        
        const group = new THREE.Group();
        group.add(base);
        group.add(statue);
        
        group.position.set(data.position.x, 0, data.position.z);
        group.userData = { type: 'statue' };
        
        return group;
    }
    
    /**
     * Create a fountain decoration
     * @param {Object} data - Fountain data
     * @returns {THREE.Mesh} - Fountain mesh
     */
    createFountain(data) {
        // Create a simple fountain (can be enhanced later)
        const baseGeometry = new THREE.CylinderGeometry(data.size * 1.5, data.size * 1.8, data.size * 0.5, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        const waterGeometry = new THREE.CylinderGeometry(data.size * 1.2, data.size * 1.2, data.size * 0.2, 16);
        const waterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3399FF, 
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y = data.size * 0.35;
        
        const centerGeometry = new THREE.CylinderGeometry(data.size * 0.3, data.size * 0.4, data.size * 0.8, 8);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.6 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = data.size * 0.65;
        
        const group = new THREE.Group();
        group.add(base);
        group.add(water);
        group.add(center);
        
        group.position.set(data.position.x, 0, data.position.z);
        group.userData = { type: 'fountain' };
        
        return group;
    }
    
    /**
     * Create a well decoration
     * @param {Object} data - Well data
     * @returns {THREE.Mesh} - Well mesh
     */
    createWell(data) {
        // Create a simple well
        const wellSize = data.size || 1;
        const wellGeometry = new THREE.CylinderGeometry(wellSize, wellSize, wellSize * 1.2, 12);
        const wellMaterial = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
        const well = new THREE.Mesh(wellGeometry, wellMaterial);
        
        // Create water inside
        const waterGeometry = new THREE.CylinderGeometry(wellSize * 0.8, wellSize * 0.8, 0.1, 12);
        const waterMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3377AA, 
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.position.y = wellSize * 0.5;
        
        // Create roof structure
        const roofGeometry = new THREE.ConeGeometry(wellSize * 1.5, wellSize, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = wellSize * 2.2;
        
        // Create support posts
        const postGeometry = new THREE.BoxGeometry(0.3, wellSize * 2, 0.3);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        
        const post1 = new THREE.Mesh(postGeometry, postMaterial);
        post1.position.set(wellSize * 0.7, wellSize * 0.9, wellSize * 0.7);
        
        const post2 = new THREE.Mesh(postGeometry, postMaterial);
        post2.position.set(-wellSize * 0.7, wellSize * 0.9, wellSize * 0.7);
        
        const post3 = new THREE.Mesh(postGeometry, postMaterial);
        post3.position.set(wellSize * 0.7, wellSize * 0.9, -wellSize * 0.7);
        
        const post4 = new THREE.Mesh(postGeometry, postMaterial);
        post4.position.set(-wellSize * 0.7, wellSize * 0.9, -wellSize * 0.7);
        
        const group = new THREE.Group();
        group.add(well);
        group.add(water);
        group.add(roof);
        group.add(post1);
        group.add(post2);
        group.add(post3);
        group.add(post4);
        
        group.position.set(data.position.x, 0, data.position.z);
        group.userData = { type: 'well' };
        
        return group;
    }
    
    /**
     * Create stairs for terraced villages
     * @param {Object} data - Stairs data
     * @returns {THREE.Mesh} - Stairs mesh
     */
    createStairs(data) {
        const width = data.width || 4;
        const height = data.height || 2;
        const steps = 5; // Number of steps
        const stepHeight = height / steps;
        const stepDepth = width / steps;
        
        const stairsGroup = new THREE.Group();
        
        // Create each step
        for (let i = 0; i < steps; i++) {
            const stepGeometry = new THREE.BoxGeometry(width, stepHeight, stepDepth);
            const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 });
            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            
            // Position each step
            step.position.set(
                0,
                i * stepHeight + stepHeight / 2,
                i * stepDepth - width / 2 + stepDepth / 2
            );
            
            stairsGroup.add(step);
        }
        
        stairsGroup.position.set(data.position.x, data.position.y || 0, data.position.z);
        
        if (data.rotation !== undefined) {
            stairsGroup.rotation.y = data.rotation;
        }
        
        stairsGroup.userData = { type: 'stairs' };
        
        return stairsGroup;
    }
    
    /**
     * Create a plaza for circular villages
     * @param {Object} data - Plaza data
     * @returns {THREE.Mesh} - Plaza mesh
     */
    createPlaza(data) {
        const radius = data.radius || 8;
        
        // Create plaza ground
        const plazaGeometry = new THREE.CircleGeometry(radius, 32);
        
        // Get theme colors
        let plazaColor = 0xCCCCCC; // Default plaza color
        
        if (this.currentMap && this.currentMap.theme) {
            const themeColors = this.currentMap.theme.colors;
            
            // Use theme-specific path color if available
            if (themeColors && themeColors.path) {
                // Convert hex string to number
                plazaColor = parseInt(themeColors.path.replace('#', '0x'), 16);
            }
        }
        
        const plazaMaterial = new THREE.MeshStandardMaterial({ 
            color: plazaColor,
            roughness: 0.7
        });
        
        const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
        plaza.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        plaza.position.set(data.position.x, 0.05, data.position.z); // Slightly above ground
        
        plaza.userData = { type: 'plaza' };
        
        return plaza;
    }
    
    /**
     * Create a square for grid villages
     * @param {Object} data - Square data
     * @returns {THREE.Mesh} - Square mesh
     */
    createSquare(data) {
        const size = data.size || 10;
        
        // Create square ground
        const squareGeometry = new THREE.PlaneGeometry(size, size);
        
        // Get theme colors
        let squareColor = 0xCCCCCC; // Default square color
        
        if (this.currentMap && this.currentMap.theme) {
            const themeColors = this.currentMap.theme.colors;
            
            // Use theme-specific path color if available
            if (themeColors && themeColors.path) {
                // Convert hex string to number
                squareColor = parseInt(themeColors.path.replace('#', '0x'), 16);
            }
        }
        
        const squareMaterial = new THREE.MeshStandardMaterial({ 
            color: squareColor,
            roughness: 0.7
        });
        
        const square = new THREE.Mesh(squareGeometry, squareMaterial);
        square.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        square.position.set(data.position.x, 0.05, data.position.z); // Slightly above ground
        
        square.userData = { type: 'square' };
        
        return square;
    }
    
    /**
     * Create a market for riverside villages
     * @param {Object} data - Market data
     * @returns {THREE.Group} - Market group
     */
    createMarket(data) {
        const size = data.size || 8;
        const marketGroup = new THREE.Group();
        
        // Create market ground
        const groundGeometry = new THREE.PlaneGeometry(size, size);
        
        // Get theme colors
        let groundColor = 0xCCCCCC; // Default ground color
        
        if (this.currentMap && this.currentMap.theme) {
            const themeColors = this.currentMap.theme.colors;
            
            // Use theme-specific path color if available
            if (themeColors && themeColors.path) {
                // Convert hex string to number
                groundColor = parseInt(themeColors.path.replace('#', '0x'), 16);
            }
        }
        
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: groundColor,
            roughness: 0.7
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = 0.05; // Slightly above ground
        
        marketGroup.add(ground);
        
        // Add market stalls
        const stallCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < stallCount; i++) {
            const stallSize = 1 + Math.random() * 0.5;
            
            // Create stall base
            const baseGeometry = new THREE.BoxGeometry(stallSize * 2, stallSize * 0.5, stallSize * 2);
            const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            
            // Create stall roof
            const roofGeometry = new THREE.BoxGeometry(stallSize * 2.5, stallSize * 0.2, stallSize * 2.5);
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xA52A2A, roughness: 0.7 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = stallSize * 1.5;
            
            // Create stall posts
            const postGeometry = new THREE.CylinderGeometry(stallSize * 0.1, stallSize * 0.1, stallSize * 1.5, 6);
            const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
            
            const posts = [];
            const postPositions = [
                { x: stallSize * 0.8, z: stallSize * 0.8 },
                { x: -stallSize * 0.8, z: stallSize * 0.8 },
                { x: stallSize * 0.8, z: -stallSize * 0.8 },
                { x: -stallSize * 0.8, z: -stallSize * 0.8 }
            ];
            
            for (const pos of postPositions) {
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(pos.x, stallSize * 0.75, pos.z);
                posts.push(post);
            }
            
            // Create stall group
            const stall = new THREE.Group();
            stall.add(base);
            stall.add(roof);
            posts.forEach(post => stall.add(post));
            
            // Position stall in market
            const angle = (i / stallCount) * Math.PI * 2;
            const distance = size * 0.3;
            stall.position.set(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            );
            
            // Random rotation
            stall.rotation.y = Math.random() * Math.PI * 2;
            
            marketGroup.add(stall);
        }
        
        marketGroup.position.set(data.position.x, data.position.y || 0, data.position.z);
        marketGroup.userData = { type: 'market' };
        
        return marketGroup;
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
        
        let envObject = null;
        
        switch (envData.type) {
            case 'tree':
                envObject = environmentManager.createTree(position.x, position.z);
                break;
                
            case 'rock':
                envObject = environmentManager.createRock(position.x, position.z);
                break;
                
            case 'bush':
                envObject = environmentManager.createBush(position.x, position.z);
                break;
                
            case 'flower':
                envObject = environmentManager.createFlower(position.x, position.z);
                break;
                
            case 'tall_grass':
                envObject = environmentManager.createTallGrass(position.x, position.z);
                break;
                
            case 'ancient_tree':
                envObject = environmentManager.createAncientTree(position.x, position.z);
                break;
                
            case 'small_plant':
                envObject = environmentManager.createSmallPlant(position.x, position.z);
                break;
                
            case 'fallen_log':
                envObject = environmentManager.createFallenLog(position.x, position.z);
                break;
                
            case 'mushroom':
                envObject = environmentManager.createMushroom(position.x, position.z);
                break;
                
            case 'rock_formation':
                envObject = environmentManager.createRockFormation(position.x, position.z);
                break;
                
            case 'shrine':
                envObject = environmentManager.createShrine(position.x, position.z);
                break;
                
            case 'stump':
                envObject = environmentManager.createStump(position.x, position.z);
                break;
                
            case 'mountain':
                envObject = this.worldManager.structureManager.createMountain(position.x, position.z);
                break;
                
            case 'water':
                envObject = this.createWaterFeature(position, envData.size || 5);
                break;
                
            case 'lava':
                envObject = this.createLavaFeature(position, envData.size || 5);
                break;
                
            case 'tree_cluster':
                envObject = this.createTreeCluster(envData);
                break;
                
            // Handle special/magical environment objects
            case 'crystal_formation':
                envObject = this.createCrystalFormation(position, envData.size || 3);
                break;
                
            case 'rare_plant':
                envObject = this.createRarePlant(position, envData.size || 1);
                break;
                
            case 'magical_stone':
                envObject = this.createMagicalStone(position, envData.size || 2);
                break;
                
            case 'ancient_artifact':
                envObject = this.createAncientArtifact(position, envData.size || 2);
                break;
                
            case 'moss':
                envObject = this.createMoss(position, envData.size || 1);
                break;
                
            case 'oasis':
                envObject = this.createOasis(position, envData.size || 8);
                break;
                
            case 'obsidian_formation':
                envObject = this.createObsidianFormation(position, envData.size || 5);
                break;
                
            case 'desert_shrine':
                envObject = this.createDesertShrine(position, envData.size || 6);
                break;
                
            default:
                console.warn(`Unknown environment object type: ${envData.type}`);
        }
        
        if (envObject) {
            envObject.userData = {
                ...envObject.userData,
                theme: envData.theme
            };
            
            this.loadedObjects.push(envObject);
        }
    }

    /**
     * Create a water feature
     * @param {Object} position - Position object
     * @param {number} size - Size of the water feature
     * @returns {THREE.Mesh} - Water mesh
     */
    createWaterFeature(position, size) {
        const geometry = new THREE.CircleGeometry(size, 16);
        const material = new THREE.MeshLambertMaterial({
            color: 0x4682B4,
            transparent: true,
            opacity: 0.7
        });
        
        const water = new THREE.Mesh(geometry, material);
        water.rotation.x = -Math.PI / 2;
        water.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z) + 0.1,
            position.z
        );
        
        water.userData = { type: 'water' };
        this.scene.add(water);
        
        return water;
    }
    
    /**
     * Create a moss patch
     * @param {Object} position - Position object
     * @param {number} size - Size of the moss patch
     * @returns {THREE.Mesh} - Moss mesh
     */
    createMoss(position, size) {
        const geometry = new THREE.CircleGeometry(size, 8);
        const material = new THREE.MeshLambertMaterial({
            color: 0x2E8B57, // Sea green color for moss
            transparent: true,
            opacity: 0.9
        });
        
        const moss = new THREE.Mesh(geometry, material);
        moss.rotation.x = -Math.PI / 2;
        moss.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z) + 0.05, // Slightly above terrain
            position.z
        );
        
        moss.userData = { type: 'moss' };
        this.scene.add(moss);
        
        return moss;
    }
    
    /**
     * Create an oasis
     * @param {Object} position - Position object
     * @param {number} size - Size of the oasis
     * @returns {THREE.Group} - Oasis group
     */
    createOasis(position, size) {
        const group = new THREE.Group();
        
        // Create water pool
        const waterGeometry = new THREE.CircleGeometry(size, 16);
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x4682B4, // Steel blue water
            transparent: true,
            opacity: 0.8
        });
        
        const waterPool = new THREE.Mesh(waterGeometry, waterMaterial);
        waterPool.rotation.x = -Math.PI / 2;
        waterPool.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z) + 0.1, // Slightly above terrain
            position.z
        );
        
        // Create sand border around the water
        const sandGeometry = new THREE.RingGeometry(size, size + 2, 16);
        const sandMaterial = new THREE.MeshLambertMaterial({
            color: 0xE9BE62, // Desert sand color
            transparent: false
        });
        
        const sandBorder = new THREE.Mesh(sandGeometry, sandMaterial);
        sandBorder.rotation.x = -Math.PI / 2;
        sandBorder.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z) + 0.05, // Slightly above terrain
            position.z
        );
        
        // Add palm trees around the oasis
        const palmCount = 3 + Math.floor(Math.random() * 4); // 3-6 palm trees
        
        for (let i = 0; i < palmCount; i++) {
            // Position palms around the oasis
            const angle = (i / palmCount) * Math.PI * 2;
            const distance = size + 1 + Math.random() * 2; // Place just outside the sand border
            
            const palmX = position.x + Math.cos(angle) * distance;
            const palmZ = position.z + Math.sin(angle) * distance;
            const palmY = this.worldManager.getTerrainHeight(palmX, palmZ);
            
            // Create palm tree trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2 + Math.random() * 2, 6);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown trunk
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Create palm leaves
            const leavesGroup = new THREE.Group();
            const leafCount = 5 + Math.floor(Math.random() * 4); // 5-8 leaves
            
            for (let j = 0; j < leafCount; j++) {
                const leafAngle = (j / leafCount) * Math.PI * 2;
                const leafGeometry = new THREE.PlaneGeometry(1.5 + Math.random(), 0.5 + Math.random());
                const leafMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x2E8B57, // Green leaves
                    side: THREE.DoubleSide
                });
                
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                
                // Position and rotate leaf
                leaf.position.y = 0.5;
                leaf.position.x = Math.cos(leafAngle) * 0.5;
                leaf.position.z = Math.sin(leafAngle) * 0.5;
                
                // Rotate leaf to point outward and downward
                leaf.rotation.x = Math.PI / 4; // Tilt down
                leaf.rotation.y = leafAngle; // Rotate around trunk
                
                leavesGroup.add(leaf);
            }
            
            // Position leaves at top of trunk
            leavesGroup.position.y = trunk.geometry.parameters.height / 2;
            
            // Create palm tree group
            const palmTree = new THREE.Group();
            palmTree.add(trunk);
            palmTree.add(leavesGroup);
            
            // Position palm tree
            palmTree.position.set(palmX, palmY, palmZ);
            
            // Add slight random rotation to palm tree
            palmTree.rotation.y = Math.random() * Math.PI * 2;
            
            // Add palm tree to oasis group
            group.add(palmTree);
        }
        
        // Add water and sand to group
        group.add(waterPool);
        group.add(sandBorder);
        
        // Set position and user data
        group.position.set(position.x, 0, position.z);
        group.userData = { type: 'oasis' };
        
        this.scene.add(group);
        
        return group;
    }
    
    /**
     * Create an obsidian formation
     * @param {Object} position - Position object
     * @param {number} size - Size of the obsidian formation
     * @returns {THREE.Group} - Obsidian formation group
     */
    createObsidianFormation(position, size) {
        const group = new THREE.Group();
        
        // Create multiple obsidian shards
        const numShards = Math.floor(4 + Math.random() * 5); // 4-8 shards
        
        for (let i = 0; i < numShards; i++) {
            // Create a shard with random geometry
            const shardHeight = 1 + Math.random() * 3;
            const shardWidth = 0.5 + Math.random() * 1.5;
            
            // Use either a cone or a prism for variety
            let shardGeometry;
            if (Math.random() > 0.5) {
                shardGeometry = new THREE.ConeGeometry(shardWidth, shardHeight, 5);
            } else {
                shardGeometry = new THREE.BoxGeometry(shardWidth, shardHeight, shardWidth);
            }
            
            // Obsidian material - dark with slight reflection
            const shardMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111, // Very dark gray, almost black
                roughness: 0.3,
                metalness: 0.7
            });
            
            const shard = new THREE.Mesh(shardGeometry, shardMaterial);
            
            // Position shard within the formation
            const angle = (i / numShards) * Math.PI * 2;
            const distance = Math.random() * (size / 2);
            
            const shardX = Math.cos(angle) * distance;
            const shardZ = Math.sin(angle) * distance;
            const shardY = shardHeight / 2; // Position at half height to sit on ground
            
            shard.position.set(shardX, shardY, shardZ);
            
            // Random rotation for more natural look
            shard.rotation.y = Math.random() * Math.PI * 2;
            shard.rotation.x = Math.random() * 0.3; // Slight tilt
            
            group.add(shard);
        }
        
        // Add a base/ground effect
        const baseGeometry = new THREE.CircleGeometry(size / 2 + 1, 16);
        const baseMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333, // Dark gray
            transparent: true,
            opacity: 0.7
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2; // Lay flat
        base.position.y = 0.05; // Slightly above ground
        
        group.add(base);
        
        // Position the entire formation
        group.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z),
            position.z
        );
        
        group.userData = { type: 'obsidian_formation' };
        
        this.scene.add(group);
        
        return group;
    }
    
    /**
     * Create a desert shrine
     * @param {Object} position - Position object
     * @param {number} size - Size of the desert shrine
     * @returns {THREE.Group} - Desert shrine group
     */
    createDesertShrine(position, size) {
        const group = new THREE.Group();
        
        // Create main shrine structure (a small temple-like structure)
        const baseHeight = 0.5;
        const baseWidth = size;
        const baseDepth = size;
        
        // Base/platform
        const baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C, // Tan/sandstone color
            roughness: 0.8
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = baseHeight / 2;
        
        group.add(base);
        
        // Create pillars
        const pillarHeight = 3;
        const pillarRadius = 0.3;
        const pillarGeometry = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0xD2B48C, // Same as base
            roughness: 0.7
        });
        
        // Create 4 pillars at corners
        const pillarPositions = [
            { x: baseWidth/2 - 0.5, z: baseDepth/2 - 0.5 },
            { x: -baseWidth/2 + 0.5, z: baseDepth/2 - 0.5 },
            { x: baseWidth/2 - 0.5, z: -baseDepth/2 + 0.5 },
            { x: -baseWidth/2 + 0.5, z: -baseDepth/2 + 0.5 }
        ];
        
        for (const pos of pillarPositions) {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos.x, baseHeight + pillarHeight/2, pos.z);
            group.add(pillar);
        }
        
        // Create roof/top
        const roofGeometry = new THREE.BoxGeometry(baseWidth + 1, 0.5, baseDepth + 1);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0xC19A6B, // Slightly darker than base
            roughness: 0.7
        });
        
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = baseHeight + pillarHeight + 0.25;
        
        group.add(roof);
        
        // Create altar in the center
        const altarGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
        const altarMaterial = new THREE.MeshStandardMaterial({
            color: 0xA0522D, // Brown
            roughness: 0.6
        });
        
        const altar = new THREE.Mesh(altarGeometry, altarMaterial);
        altar.position.y = baseHeight + 0.5;
        
        group.add(altar);
        
        // Add decorative elements - a glowing orb on the altar
        const orbGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Gold
            emissive: 0xFFD700,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.8
        });
        
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.y = baseHeight + 1.2;
        
        group.add(orb);
        
        // Add sand circle around the shrine
        const sandGeometry = new THREE.CircleGeometry(size + 2, 16);
        const sandMaterial = new THREE.MeshLambertMaterial({
            color: 0xE9BE62, // Desert sand color
            transparent: false
        });
        
        const sand = new THREE.Mesh(sandGeometry, sandMaterial);
        sand.rotation.x = -Math.PI / 2;
        sand.position.y = 0.05; // Slightly above ground
        
        group.add(sand);
        
        // Position the entire shrine
        group.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z),
            position.z
        );
        
        group.userData = { type: 'desert_shrine' };
        
        this.scene.add(group);
        
        return group;
    }
    
    /**
     * Create a crystal formation
     * @param {Object} position - Position object
     * @param {number} size - Size of the crystal formation
     * @returns {THREE.Group} - Crystal formation group
     */
    createCrystalFormation(position, size) {
        const group = new THREE.Group();
        
        // Create multiple crystal shards
        const numCrystals = Math.floor(3 + Math.random() * 5); // 3-7 crystals
        
        for (let i = 0; i < numCrystals; i++) {
            // Create a crystal shard
            const height = size * (0.5 + Math.random() * 1.5);
            const geometry = new THREE.ConeGeometry(size * 0.3, height, 5);
            
            // Random crystal color (blue/purple hues)
            const hue = 0.6 + Math.random() * 0.2; // Blue to purple
            const saturation = 0.7 + Math.random() * 0.3;
            const lightness = 0.5 + Math.random() * 0.3;
            
            const color = new THREE.Color().setHSL(hue, saturation, lightness);
            
            const material = new THREE.MeshStandardMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                roughness: 0.2,
                metalness: 0.8
            });
            
            const crystal = new THREE.Mesh(geometry, material);
            
            // Position within the group
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 0.7;
            crystal.position.set(
                Math.cos(angle) * distance,
                height * 0.5,
                Math.sin(angle) * distance
            );
            
            // Random rotation
            crystal.rotation.x = (Math.random() - 0.5) * 0.5;
            crystal.rotation.z = (Math.random() - 0.5) * 0.5;
            
            group.add(crystal);
        }
        
        // Position the group
        group.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z),
            position.z
        );
        
        group.userData = { type: 'crystal_formation' };
        this.scene.add(group);
        
        return group;
    }
    
    /**
     * Create a rare plant
     * @param {Object} position - Position object
     * @param {number} size - Size of the rare plant
     * @returns {THREE.Group} - Rare plant group
     */
    createRarePlant(position, size) {
        const group = new THREE.Group();
        
        // Create stem
        const stemHeight = size * 2;
        const stemGeometry = new THREE.CylinderGeometry(size * 0.1, size * 0.15, stemHeight, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = stemHeight * 0.5;
        group.add(stem);
        
        // Create flower/bloom
        const bloomGeometry = new THREE.SphereGeometry(size * 0.5, 8, 8);
        const bloomMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF1493, // Deep pink for rare flower
            emissive: 0x800080,
            emissiveIntensity: 0.3
        });
        const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial);
        bloom.position.y = stemHeight + size * 0.3;
        group.add(bloom);
        
        // Add some leaves
        const numLeaves = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numLeaves; i++) {
            const leafGeometry = new THREE.PlaneGeometry(size * 0.8, size * 0.4);
            const leafMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x32CD32,
                side: THREE.DoubleSide
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position leaf along stem
            const heightPercent = 0.3 + (i / numLeaves) * 0.7;
            leaf.position.y = stemHeight * heightPercent;
            
            // Rotate leaf
            const angle = (i / numLeaves) * Math.PI * 2;
            leaf.rotation.y = angle;
            leaf.rotation.x = Math.PI * 0.25;
            
            group.add(leaf);
        }
        
        // Position the group
        group.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z),
            position.z
        );
        
        group.userData = { type: 'rare_plant' };
        this.scene.add(group);
        
        return group;
    }
    
    /**
     * Create a magical stone
     * @param {Object} position - Position object
     * @param {number} size - Size of the magical stone
     * @returns {THREE.Group} - Magical stone group
     */
    createMagicalStone(position, size) {
        const group = new THREE.Group();
        
        // Create the main stone
        const stoneGeometry = new THREE.DodecahedronGeometry(size, 0);
        const stoneMaterial = new THREE.MeshStandardMaterial({
            color: 0x696969,
            roughness: 0.7,
            metalness: 0.2
        });
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        
        // Add some random rotation
        stone.rotation.x = Math.random() * Math.PI;
        stone.rotation.y = Math.random() * Math.PI;
        stone.rotation.z = Math.random() * Math.PI;
        
        group.add(stone);
        
        // Add glowing runes/symbols
        const runeGeometry = new THREE.TorusGeometry(size * 0.7, size * 0.05, 8, 16);
        const runeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.8
        });
        const rune = new THREE.Mesh(runeGeometry, runeMaterial);
        rune.rotation.x = Math.PI * 0.5;
        group.add(rune);
        
        // Position the group
        group.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z) + size * 0.5,
            position.z
        );
        
        group.userData = { type: 'magical_stone' };
        this.scene.add(group);
        
        return group;
    }
    
    /**
     * Create an ancient artifact
     * @param {Object} position - Position object
     * @param {number} size - Size of the ancient artifact
     * @returns {THREE.Group} - Ancient artifact group
     */
    createAncientArtifact(position, size) {
        const group = new THREE.Group();
        
        // Create base/pedestal
        const baseGeometry = new THREE.CylinderGeometry(size * 0.8, size, size * 0.5, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = size * 0.25;
        group.add(base);
        
        // Create artifact
        const artifactGeometry = new THREE.OctahedronGeometry(size * 0.5, 0);
        const artifactMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            roughness: 0.3,
            metalness: 0.8
        });
        const artifact = new THREE.Mesh(artifactGeometry, artifactMaterial);
        artifact.position.y = size * 1.0;
        artifact.rotation.y = Math.PI * 0.25;
        group.add(artifact);
        
        // Position the group
        group.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z),
            position.z
        );
        
        group.userData = { type: 'ancient_artifact' };
        this.scene.add(group);
        
        return group;
    }

    /**
     * Create a lava feature
     * @param {Object} position - Position object
     * @param {number} size - Size of the lava feature
     * @returns {THREE.Mesh} - Lava mesh
     */
    createLavaFeature(position, size) {
        const geometry = new THREE.CircleGeometry(size, 16);
        const material = new THREE.MeshLambertMaterial({
            color: 0xFF4500,
            emissive: 0xFF2200,
            emissiveIntensity: 0.3
        });
        
        const lava = new THREE.Mesh(geometry, material);
        lava.rotation.x = -Math.PI / 2;
        lava.position.set(
            position.x,
            this.worldManager.getTerrainHeight(position.x, position.z) + 0.1,
            position.z
        );
        
        lava.userData = { type: 'lava' };
        this.scene.add(lava);
        
        return lava;
    }

    /**
     * Create a tree cluster from map data
     * @param {Object} clusterData - Tree cluster configuration
     * @returns {THREE.Group} - Tree cluster group
     */
    createTreeCluster(clusterData) {
        const clusterGroup = new THREE.Group();
        const position = clusterData.position;
        const environmentManager = this.worldManager.environmentManager;
        
        // Set cluster position
        clusterGroup.position.set(position.x, position.y || 0, position.z);
        
        // Create individual trees based on the cluster data
        if (clusterData.trees && clusterData.trees.length > 0) {
            // Use the stored tree positions from the map data
            clusterData.trees.forEach(treeData => {
                const tree = environmentManager.createTree(
                    treeData.relativePosition.x,
                    treeData.relativePosition.z,
                    clusterData.theme || 'Forest',
                    treeData.size || 1.0
                );
                
                // Position is relative to cluster center
                tree.position.set(
                    treeData.relativePosition.x,
                    treeData.relativePosition.y || 0,
                    treeData.relativePosition.z
                );
                
                clusterGroup.add(tree);
            });
        } else {
            // Fallback: create trees in a circular pattern if no tree data is provided
            const treeCount = clusterData.treeCount || 5;
            const radius = clusterData.radius || 10;
            
            for (let i = 0; i < treeCount; i++) {
                const angle = (i / treeCount) * Math.PI * 2;
                const distance = Math.random() * radius;
                const x = Math.cos(angle) * distance;
                const z = Math.sin(angle) * distance;
                
                const tree = environmentManager.createTree(
                    position.x + x,
                    position.z + z,
                    clusterData.theme || 'Forest',
                    clusterData.avgSize || 1.0
                );
                
                tree.position.set(x, 0, z);
                clusterGroup.add(tree);
            }
        }
        
        clusterGroup.userData = {
            type: 'tree_cluster',
            theme: clusterData.theme,
            treeCount: clusterData.treeCount
        };
        
        this.scene.add(clusterGroup);
        return clusterGroup;
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