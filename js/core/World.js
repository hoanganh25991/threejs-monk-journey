import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class World {
    constructor(scene, loadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.terrainSize = 100;
        this.terrainResolution = 128;
        this.terrainHeight = 10;
        this.objects = [];
        this.zones = [];
        this.interactiveObjects = [];
    }
    
    async init() {
        // Add stronger ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Increased intensity
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Increased intensity
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Add a hemisphere light for better ambient lighting
        const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
        this.scene.add(hemisphereLight);
        
        // Add a point light near the player's starting position
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
        
        console.log("Lights added to scene");
        
        // Create terrain
        await this.createTerrain();
        
        // Create structures
        this.createStructures();
        
        // Create zones
        this.createZones();
        
        // Create interactive objects
        this.createInteractiveObjects();
        
        return true;
    }
    
    async createTerrain() {
        // Create heightmap using SimplexNoise
        const simplex = new SimplexNoise();
        const heightMap = this.generateHeightMap(simplex);
        
        // Create terrain geometry
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize, 
            this.terrainSize, 
            this.terrainResolution - 1, 
            this.terrainResolution - 1
        );
        
        // Apply heightmap to geometry
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = Math.floor((i / 3) % this.terrainResolution);
            const y = Math.floor((i / 3) / this.terrainResolution);
            vertices[i + 2] = heightMap[y * this.terrainResolution + x];
        }
        
        geometry.computeVertexNormals();
        
        // Create terrain material
        const textureLoader = new THREE.TextureLoader(this.loadingManager);
        
        // Create basic textures using procedural patterns
        const grassTexture = this.createProceduralTexture(0x2d572c, 0x1e3b1e, 512);
        const rockTexture = this.createProceduralTexture(0x555555, 0x333333, 512);
        const snowTexture = this.createProceduralTexture(0xffffff, 0xeeeeee, 512);
        const sandTexture = this.createProceduralTexture(0xd2b48c, 0xc2a47c, 512);
        
        // Create terrain material with splatmap
        const material = new THREE.MeshStandardMaterial({
            map: grassTexture,
            roughness: 0.8,
            metalness: 0.2,
            vertexColors: true
        });
        
        // Create terrain mesh
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        terrain.castShadow = true;
        
        // Color the terrain based on height
        this.colorTerrain(terrain, heightMap);
        
        // Make sure terrain is positioned at the center
        terrain.position.set(0, 0, 0);
        
        // Add terrain to scene
        this.scene.add(terrain);
        this.terrain = terrain;
        
        // Log to confirm terrain was added
        console.log("Terrain created and added to scene:", terrain);
        
        // Add water plane
        this.createWater();
    }
    
    generateHeightMap(simplex) {
        const heightMap = new Array(this.terrainResolution * this.terrainResolution);
        
        for (let y = 0; y < this.terrainResolution; y++) {
            for (let x = 0; x < this.terrainResolution; x++) {
                // Normalize coordinates to range [0, 1]
                const nx = x / (this.terrainResolution - 1);
                const ny = y / (this.terrainResolution - 1);
                
                // Scale to terrain size and center
                const px = (nx - 0.5) * this.terrainSize;
                const py = (ny - 0.5) * this.terrainSize;
                
                // Generate height using multiple octaves of noise
                let height = 0;
                let frequency = 0.01;
                let amplitude = 1;
                const octaves = 6;
                
                for (let o = 0; o < octaves; o++) {
                    const noiseValue = simplex.noise(px * frequency, py * frequency) * 0.5 + 0.5;
                    height += noiseValue * amplitude;
                    
                    amplitude *= 0.5;
                    frequency *= 2;
                }
                
                // Scale height to terrain height
                height *= this.terrainHeight;
                
                // Create some flat areas for gameplay
                if (height < this.terrainHeight * 0.3) {
                    height = this.terrainHeight * 0.3;
                }
                
                // Store height in heightmap
                heightMap[y * this.terrainResolution + x] = height;
            }
        }
        
        return heightMap;
    }
    
    colorTerrain(terrain, heightMap) {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const height = positions[i + 2];
            
            // Color based on height
            let color = new THREE.Color();
            
            if (height < 2) {
                // Sand
                color.setHex(0xd2b48c);
            } else if (height < 5) {
                // Grass
                color.setHex(0x2d572c);
            } else if (height < 8) {
                // Rock
                color.setHex(0x555555);
            } else {
                // Snow
                color.setHex(0xffffff);
            }
            
            // Add some variation
            const variation = Math.random() * 0.1 - 0.05;
            color.r = Math.max(0, Math.min(1, color.r + variation));
            color.g = Math.max(0, Math.min(1, color.g + variation));
            color.b = Math.max(0, Math.min(1, color.b + variation));
            
            colors.push(color.r, color.g, color.b);
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    createWater() {
        const waterGeometry = new THREE.PlaneGeometry(this.terrainSize * 1.5, this.terrainSize * 1.5);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x0055ff,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.8
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 1.5; // Water level
        
        this.scene.add(water);
        this.water = water;
    }
    
    createStructures() {
        // Create ruins
        this.createRuins(0, 0);
        this.createRuins(30, 20);
        this.createRuins(-25, -15);
        
        // Create bridges
        this.createBridge(15, 5, 10, 3);
        this.createBridge(-10, -8, 8, 2);
        
        // Create small buildings
        this.createBuilding(5, 15, 5, 5, 4);
        this.createBuilding(-20, 10, 4, 6, 5);
        this.createBuilding(25, -20, 6, 4, 3);
    }
    
    createRuins(x, z) {
        const ruinGroup = new THREE.Group();
        
        // Create broken walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create several wall segments
        for (let i = 0; i < 5; i++) {
            const height = 2 + Math.random() * 3;
            const width = 1 + Math.random() * 2;
            const depth = 0.5;
            
            const wallGeometry = new THREE.BoxGeometry(width, height, depth);
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            
            // Position walls in a rough circle
            const angle = (i / 5) * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            wall.position.set(
                Math.cos(angle) * radius,
                height / 2,
                Math.sin(angle) * radius
            );
            
            // Rotate walls to face center
            wall.rotation.y = angle + Math.PI / 2;
            
            // Add some random rotation to make it look ruined
            wall.rotation.z = (Math.random() - 0.5) * 0.2;
            
            wall.castShadow = true;
            wall.receiveShadow = true;
            
            ruinGroup.add(wall);
        }
        
        // Add some fallen columns
        for (let i = 0; i < 3; i++) {
            const radius = 0.5;
            const height = 3 + Math.random() * 2;
            
            const columnGeometry = new THREE.CylinderGeometry(radius, radius, height, 8);
            const column = new THREE.Mesh(columnGeometry, wallMaterial);
            
            // Position columns randomly within the ruins
            column.position.set(
                (Math.random() - 0.5) * 8,
                radius,
                (Math.random() - 0.5) * 8
            );
            
            // Rotate columns to look fallen
            column.rotation.x = (Math.random() - 0.5) * Math.PI / 2;
            column.rotation.z = (Math.random() - 0.5) * Math.PI / 2;
            
            column.castShadow = true;
            column.receiveShadow = true;
            
            ruinGroup.add(column);
        }
        
        ruinGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        this.scene.add(ruinGroup);
        this.objects.push(ruinGroup);
    }
    
    createBridge(x, z, length, width) {
        const bridgeGroup = new THREE.Group();
        
        // Create bridge deck
        const deckMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const deckGeometry = new THREE.BoxGeometry(length, 0.5, width);
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.25;
        deck.castShadow = true;
        deck.receiveShadow = true;
        
        bridgeGroup.add(deck);
        
        // Create bridge railings
        const railingMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Left railing
        const leftRailingGeometry = new THREE.BoxGeometry(length, 1, 0.3);
        const leftRailing = new THREE.Mesh(leftRailingGeometry, railingMaterial);
        leftRailing.position.set(0, 1, width / 2 - 0.15);
        leftRailing.castShadow = true;
        leftRailing.receiveShadow = true;
        
        bridgeGroup.add(leftRailing);
        
        // Right railing
        const rightRailingGeometry = new THREE.BoxGeometry(length, 1, 0.3);
        const rightRailing = new THREE.Mesh(rightRailingGeometry, railingMaterial);
        rightRailing.position.set(0, 1, -width / 2 + 0.15);
        rightRailing.castShadow = true;
        rightRailing.receiveShadow = true;
        
        bridgeGroup.add(rightRailing);
        
        // Create bridge supports
        const supportMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // Add supports at regular intervals
        const numSupports = Math.floor(length / 2) + 1;
        for (let i = 0; i < numSupports; i++) {
            const supportX = (i / (numSupports - 1) - 0.5) * length;
            
            // Left support
            const leftSupportGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
            const leftSupport = new THREE.Mesh(leftSupportGeometry, supportMaterial);
            leftSupport.position.set(supportX, -1, width / 2 - 0.15);
            leftSupport.castShadow = true;
            leftSupport.receiveShadow = true;
            
            bridgeGroup.add(leftSupport);
            
            // Right support
            const rightSupportGeometry = new THREE.BoxGeometry(0.3, 3, 0.3);
            const rightSupport = new THREE.Mesh(rightSupportGeometry, supportMaterial);
            rightSupport.position.set(supportX, -1, -width / 2 + 0.15);
            rightSupport.castShadow = true;
            rightSupport.receiveShadow = true;
            
            bridgeGroup.add(rightSupport);
        }
        
        bridgeGroup.position.set(x, this.getTerrainHeight(x, z) + 1, z);
        
        this.scene.add(bridgeGroup);
        this.objects.push(bridgeGroup);
    }
    
    createBuilding(x, z, width, depth, height) {
        const buildingGroup = new THREE.Group();
        
        // Create building walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Main building structure
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const building = new THREE.Mesh(buildingGeometry, wallMaterial);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;
        
        buildingGroup.add(building);
        
        // Create roof
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const roofGeometry = new THREE.ConeGeometry(Math.sqrt(width * width + depth * depth) / 2 + 0.5, 2, 4);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + 1;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        roof.receiveShadow = true;
        
        buildingGroup.add(roof);
        
        // Create door
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const doorWidth = Math.min(width / 3, 1.2);
        const doorHeight = Math.min(height / 2, 2);
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, doorHeight / 2, depth / 2 + 0.05);
        
        buildingGroup.add(door);
        
        // Create windows
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            roughness: 0.3,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7
        });
        
        // Add windows to front
        const frontWindowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
        const frontWindow1 = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow1.position.set(-width / 4, height / 2 + 0.5, depth / 2 + 0.05);
        
        const frontWindow2 = new THREE.Mesh(frontWindowGeometry, windowMaterial);
        frontWindow2.position.set(width / 4, height / 2 + 0.5, depth / 2 + 0.05);
        
        buildingGroup.add(frontWindow1);
        buildingGroup.add(frontWindow2);
        
        // Add windows to sides
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.8);
        const sideWindow1 = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        sideWindow1.position.set(width / 2 + 0.05, height / 2 + 0.5, 0);
        
        const sideWindow2 = new THREE.Mesh(sideWindowGeometry, windowMaterial);
        sideWindow2.position.set(-width / 2 - 0.05, height / 2 + 0.5, 0);
        
        buildingGroup.add(sideWindow1);
        buildingGroup.add(sideWindow2);
        
        buildingGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        this.scene.add(buildingGroup);
        this.objects.push(buildingGroup);
    }
    
    createZones() {
        // Define zones with different characteristics
        this.zones = [
            {
                name: 'Forest',
                center: new THREE.Vector3(20, 0, 20),
                radius: 15,
                color: 0x2d572c
            },
            {
                name: 'Desert',
                center: new THREE.Vector3(-20, 0, -20),
                radius: 15,
                color: 0xd2b48c
            },
            {
                name: 'Mountains',
                center: new THREE.Vector3(-20, 0, 20),
                radius: 15,
                color: 0x555555
            },
            {
                name: 'Swamp',
                center: new THREE.Vector3(20, 0, -20),
                radius: 15,
                color: 0x4a7023
            }
        ];
        
        // Visualize zones (for development)
        this.zones.forEach(zone => {
            const marker = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 5, 8),
                new THREE.MeshBasicMaterial({ color: zone.color })
            );
            marker.position.set(
                zone.center.x,
                this.getTerrainHeight(zone.center.x, zone.center.z) + 2.5,
                zone.center.z
            );
            this.scene.add(marker);
        });
    }
    
    createInteractiveObjects() {
        // Create treasure chests
        this.createTreasureChest(10, 10);
        this.createTreasureChest(-15, 5);
        this.createTreasureChest(5, -15);
        
        // Create quest markers
        this.createQuestMarker(25, 15, 'Main Quest');
        this.createQuestMarker(-10, -20, 'Side Quest');
        this.createQuestMarker(15, -5, 'Exploration');
    }
    
    createTreasureChest(x, z) {
        const chestGroup = new THREE.Group();
        
        // Create chest base
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const baseGeometry = new THREE.BoxGeometry(1.5, 1, 1);
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        
        chestGroup.add(base);
        
        // Create chest lid
        const lidGeometry = new THREE.BoxGeometry(1.5, 0.5, 1);
        const lid = new THREE.Mesh(lidGeometry, baseMaterial);
        lid.position.y = 1.25;
        lid.castShadow = true;
        lid.receiveShadow = true;
        
        chestGroup.add(lid);
        
        // Create metal details
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            roughness: 0.3,
            metalness: 0.8
        });
        
        // Create lock
        const lockGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        const lock = new THREE.Mesh(lockGeometry, metalMaterial);
        lock.position.set(0, 1, 0.55);
        
        chestGroup.add(lock);
        
        // Position chest on terrain
        chestGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene and interactive objects
        this.scene.add(chestGroup);
        this.interactiveObjects.push({
            type: 'chest',
            mesh: chestGroup,
            position: new THREE.Vector3(x, this.getTerrainHeight(x, z), z),
            interactionRadius: 2,
            isOpen: false,
            onInteract: () => {
                // Open chest animation and give reward
                if (!this.interactiveObjects[this.interactiveObjects.length - 1].isOpen) {
                    // Rotate lid to open
                    lid.rotation.x = -Math.PI / 3;
                    this.interactiveObjects[this.interactiveObjects.length - 1].isOpen = true;
                    
                    // Return some reward
                    return {
                        type: 'item',
                        item: {
                            name: 'Gold',
                            amount: Math.floor(Math.random() * 100) + 50
                        }
                    };
                }
                return null;
            }
        });
    }
    
    createQuestMarker(x, z, questName) {
        const markerGroup = new THREE.Group();
        
        // Create marker post
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1;
        post.castShadow = true;
        post.receiveShadow = true;
        
        markerGroup.add(post);
        
        // Create marker sign
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const signGeometry = new THREE.BoxGeometry(1, 0.8, 0.1);
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 1.8, 0);
        sign.castShadow = true;
        sign.receiveShadow = true;
        
        markerGroup.add(sign);
        
        // Create glowing marker
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffcc00
        });
        
        const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, 2.2, 0);
        
        markerGroup.add(marker);
        
        // Position marker on terrain
        markerGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene and interactive objects
        this.scene.add(markerGroup);
        this.interactiveObjects.push({
            type: 'quest',
            name: questName,
            mesh: markerGroup,
            position: new THREE.Vector3(x, this.getTerrainHeight(x, z), z),
            interactionRadius: 3,
            onInteract: () => {
                // Return quest information
                return {
                    type: 'quest',
                    quest: {
                        name: questName,
                        description: `This is the ${questName}. Complete it to earn rewards!`,
                        objective: 'Defeat 5 enemies',
                        reward: {
                            experience: 100,
                            gold: 200
                        }
                    }
                };
            }
        });
    }
    
    getTerrainHeight(x, z) {
        // Default height if terrain not yet created
        if (!this.terrain) return 0;
        
        // Check for invalid input values (NaN or undefined)
        if (isNaN(x) || isNaN(z) || x === undefined || z === undefined) {
            console.warn("Invalid coordinates passed to getTerrainHeight:", x, z);
            return 0; // Return a safe default height
        }
        
        // Convert world coordinates to terrain coordinates
        const terrainX = (x / this.terrainSize + 0.5) * this.terrainResolution;
        const terrainZ = (z / this.terrainSize + 0.5) * this.terrainResolution;
        
        // Ensure coordinates are within bounds
        if (terrainX < 0 || terrainX >= this.terrainResolution || 
            terrainZ < 0 || terrainZ >= this.terrainResolution) {
            console.warn("Terrain coordinates out of bounds:", terrainX, terrainZ);
            return 0; // Return a safe default height
        }
        
        // Get terrain indices
        const x1 = Math.floor(terrainX);
        const z1 = Math.floor(terrainZ);
        const x2 = Math.min(x1 + 1, this.terrainResolution - 1);
        const z2 = Math.min(z1 + 1, this.terrainResolution - 1);
        
        // Get fractional part
        const fx = terrainX - x1;
        const fz = terrainZ - z1;
        
        // Get vertex positions
        const vertices = this.terrain.geometry.attributes.position.array;
        
        // Calculate indices in the position array
        const i11 = ((z1 * this.terrainResolution) + x1) * 3;
        const i12 = ((z1 * this.terrainResolution) + x2) * 3;
        const i21 = ((z2 * this.terrainResolution) + x1) * 3;
        const i22 = ((z2 * this.terrainResolution) + x2) * 3;
        
        // Get heights
        const h11 = vertices[i11 + 2];
        const h12 = vertices[i12 + 2];
        const h21 = vertices[i21 + 2];
        const h22 = vertices[i22 + 2];
        
        // Check for invalid height values
        if (isNaN(h11) || isNaN(h12) || isNaN(h21) || isNaN(h22)) {
            console.warn("Invalid height values in terrain:", h11, h12, h21, h22);
            return 0; // Return a safe default height
        }
        
        // Bilinear interpolation
        const h1 = h11 * (1 - fx) + h12 * fx;
        const h2 = h21 * (1 - fx) + h22 * fx;
        const height = h1 * (1 - fz) + h2 * fz;
        
        // Final safety check
        return isNaN(height) ? 0 : height;
    }
    
    getZoneAt(position) {
        for (const zone of this.zones) {
            const distance = position.distanceTo(zone.center);
            if (distance <= zone.radius) {
                return zone;
            }
        }
        return null;
    }
    
    getInteractiveObjectsNear(position, radius) {
        return this.interactiveObjects.filter(obj => {
            const distance = position.distanceTo(obj.position);
            return distance <= (radius + obj.interactionRadius);
        });
    }
    
    createProceduralTexture(color1, color2, size) {
        // Create a canvas for the texture
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        // Fill with base color
        context.fillStyle = `#${color1.toString(16).padStart(6, '0')}`;
        context.fillRect(0, 0, size, size);
        
        // Add noise pattern
        context.fillStyle = `#${color2.toString(16).padStart(6, '0')}`;
        
        const noiseScale = size / 10;
        for (let y = 0; y < size; y += noiseScale) {
            for (let x = 0; x < size; x += noiseScale) {
                if (Math.random() > 0.5) {
                    context.fillRect(x, y, noiseScale, noiseScale);
                }
            }
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        
        return texture;
    }
}