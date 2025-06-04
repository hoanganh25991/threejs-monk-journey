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
        console.log(`Loading map: ${mapData.theme.name}`);
        
        try {
            // Clear existing world content
            await this.clearWorld();
            
            // Store current map reference
            this.currentMap = mapData;
            
            // Load map components in order
            await this.loadZones(mapData.zones);
            await this.loadPaths(mapData.paths);
            await this.loadStructures(mapData.structures);
            await this.loadEnvironment(mapData.environment);
            
            console.log(`Map "${mapData.theme.name}" loaded successfully`);
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
        console.log('Clearing existing world...');
        
        // Clear existing structures
        if (this.worldManager.structureManager) {
            this.worldManager.structureManager.clear();
        }
        
        // Clear existing environment objects
        if (this.worldManager.environmentManager) {
            this.worldManager.environmentManager.clear();
        }
        
        // Clear existing zones
        if (this.worldManager.zoneManager) {
            this.worldManager.zoneManager.clear();
        }
        
        // Clear our tracked objects
        this.loadedObjects.forEach(obj => {
            if (obj.parent) {
                this.scene.remove(obj);
            }
        });
        this.loadedObjects = [];
    }

    /**
     * Load zones from map data
     * @param {Array} zones - Zone data array
     */
    async loadZones(zones) {
        console.log(`Loading ${zones.length} zones...`);
        
        if (!this.worldManager.zoneManager) {
            console.warn('ZoneManager not available');
            return;
        }
        
        // Convert map zones to ZoneManager format
        const convertedZones = zones.map(zone => ({
            name: zone.name,
            center: new THREE.Vector3(zone.center.x, zone.center.y, zone.center.z),
            radius: zone.radius,
            color: zone.color
        }));
        
        // Update zone manager with new zones
        this.worldManager.zoneManager.zones = convertedZones;
        this.worldManager.zoneManager.buildSimpleZoneCache();
        this.worldManager.zoneManager.visualizeZones();
    }

    /**
     * Load paths from map data
     * @param {Array} paths - Path data array
     */
    async loadPaths(paths) {
        console.log(`Loading ${paths.length} paths...`);
        
        paths.forEach(pathData => {
            this.createPath(pathData);
        });
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
        
        // Create path material
        const pathMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B7355, // Brown path color
            transparent: true,
            opacity: 0.8
        });
        
        // Create path mesh
        const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
        pathMesh.receiveShadow = true;
        pathMesh.userData = {
            type: 'path',
            id: pathData.id,
            pattern: pathData.pattern
        };
        
        this.scene.add(pathMesh);
        this.loadedObjects.push(pathMesh);
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
     * Load structures from map data
     * @param {Array} structures - Structure data array
     */
    async loadStructures(structures) {
        console.log(`Loading ${structures.length} structures...`);
        
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
     * Create a village from map data
     * @param {Object} villageData - Village configuration
     * @returns {THREE.Group} - Village group object
     */
    async createVillageFromData(villageData) {
        const villageGroup = new THREE.Group();
        villageGroup.userData = {
            type: 'village',
            mapId: villageData.id,
            theme: villageData.theme
        };
        
        // Create buildings
        for (const buildingData of villageData.buildings) {
            const building = this.worldManager.structureManager.createBuilding(
                buildingData.position.x,
                buildingData.position.z,
                buildingData.width,
                buildingData.depth,
                buildingData.height
            );
            
            if (building) {
                villageGroup.add(building);
            }
        }
        
        this.scene.add(villageGroup);
        return villageGroup;
    }

    /**
     * Load environment objects from map data
     * @param {Array} environment - Environment data array
     */
    async loadEnvironment(environment) {
        console.log(`Loading ${environment.length} environment objects...`);
        
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
                
            case 'mountain':
                envObject = this.worldManager.structureManager.createMountain(position.x, position.z);
                break;
                
            case 'water':
                envObject = this.createWaterFeature(position, envData.size || 5);
                break;
                
            case 'lava':
                envObject = this.createLavaFeature(position, envData.size || 5);
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
            console.log('Current map cleared');
        }
    }
}