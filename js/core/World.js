import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class World {
    constructor(scene, loadingManager) {
        this.scene = scene;
        this.loadingManager = loadingManager;
        this.terrainSize = 100; // Smaller initial terrain (1/10 of previous size)
        this.terrainResolution = 128; // Adjusted resolution for smaller terrain
        this.terrainHeight = 10;
        this.objects = [];
        this.zones = [];
        this.interactiveObjects = [];
        
        // For infinite terrain
        this.currentChunk = { x: 0, z: 0 };
        this.chunkSize = 20; // Smaller chunks for more frequent updates (1/10 of previous size)
        this.visibleChunks = {}; // Store currently visible chunks
        this.objectDensity = 0.005; // Increased density for smaller chunks
        
        // For persistent environment objects
        this.environmentObjects = {}; // Store environment objects by chunk key
        this.environmentObjectTypes = ['tree', 'rock', 'bush', 'flower']; // Types of environment objects
        this.environmentObjectDensity = {
            'tree': 0.003,
            'rock': 0.002,
            'bush': 0.004,
            'flower': 0.005
        };
        
        // Screen-based enemy spawning
        this.lastPlayerPosition = new THREE.Vector3(0, 0, 0);
        this.screenSpawnDistance = 20; // Distance to move before spawning new enemies
        
        // Reference to the game instance (will be set by Game.js)
        this.game = null;
    }
    
    setGame(game) {
        this.game = game;
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
        // Create a completely flat terrain for consistency with endless terrain
        const geometry = new THREE.PlaneGeometry(
            this.terrainSize, 
            this.terrainSize, 
            this.terrainResolution - 1, 
            this.terrainResolution - 1
        );
        
        // No need to apply heightmap since we want a flat terrain
        geometry.computeVertexNormals();
        
        // Create terrain material
        const grassTexture = this.createProceduralTexture(0x2d572c, 0x1e3b1e, 512);
        
        // Create terrain material with grass texture
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
        
        // Apply uniform grass coloring with slight variations
        this.colorTerrainUniform(terrain);
        
        // Make sure terrain is positioned at the center
        terrain.position.set(0, 0, 0);
        
        // Add terrain to scene
        this.scene.add(terrain);
        this.terrain = terrain;
        
        console.log("Flat terrain created and added to scene");
        
        // Add water plane
        this.createWater();
        
        // Initialize the first chunks around the player
        this.updateWorldForPlayer(new THREE.Vector3(0, 0, 0));
    }
    
    colorTerrainUniform(terrain) {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Use grass color with slight variations
            const baseColor = new THREE.Color(0x2d572c); // Base grass color
            
            // Add some variation to make the grass look more natural
            const variation = Math.random() * 0.1 - 0.05;
            const color = new THREE.Color(
                Math.max(0, Math.min(1, baseColor.r + variation)),
                Math.max(0, Math.min(1, baseColor.g + variation)),
                Math.max(0, Math.min(1, baseColor.b + variation))
            );
            
            colors.push(color.r, color.g, color.b);
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    generateHeightMap(simplex) {
        const heightMap = new Array(this.terrainResolution * this.terrainResolution);
        
        // Fill the entire heightmap with zeros for a completely flat terrain
        for (let y = 0; y < this.terrainResolution; y++) {
            for (let x = 0; x < this.terrainResolution; x++) {
                // Set all heights to 0 for completely flat terrain
                heightMap[y * this.terrainResolution + x] = 0;
            }
        }
        
        return heightMap;
    }
    
    colorTerrain(terrain, heightMap) {
        const colors = [];
        const positions = terrain.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Always use grass color for flat terrain
            let color = new THREE.Color(0x2d572c); // Grass color
            
            // Add some variation to make the grass look more natural
            const variation = Math.random() * 0.1 - 0.05;
            color.r = Math.max(0, Math.min(1, color.r + variation));
            color.g = Math.max(0, Math.min(1, color.g + variation));
            color.b = Math.max(0, Math.min(1, color.b + variation));
            
            colors.push(color.r, color.g, color.b);
        }
        
        terrain.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    
    createWater() {
        // Create a much larger water plane that extends beyond the visible terrain
        const waterGeometry = new THREE.PlaneGeometry(2000, 2000); // Very large water plane
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x0055ff,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.8
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.1; // Slightly below terrain to avoid z-fighting
        
        this.scene.add(water);
        this.water = water;
    }
    
    createStructures() {
        // Create initial structures near the player's starting position
        this.createRuins(0, 0);
        
        // Create Dark Sanctum as a landmark
        this.createDarkSanctum(0, -40);
        
        // Initialize the first chunks around the player
        this.updateWorldForPlayer(new THREE.Vector3(0, 0, 0));
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
        // Define zone types
        const zoneTypes = [
            { name: 'Forest', color: 0x2d572c, radius: 15 },
            { name: 'Desert', color: 0xd2b48c, radius: 15 },
            { name: 'Mountains', color: 0x555555, radius: 15 },
            { name: 'Swamp', color: 0x4a7023, radius: 15 },
            { name: 'Ruins', color: 0x999999, radius: 10 },
            { name: 'Dark Sanctum', color: 0x330033, radius: 12 }
        ];
        
        // Initialize empty zones array
        this.zones = [];
        
        // Create zones in a grid pattern across the world
        const spacing = 30; // Space between zone centers (smaller for smaller world)
        const range = 10; // More zones for better coverage
        
        for (let x = -range; x <= range; x++) {
            for (let z = -range; z <= range; z++) {
                // Choose a zone type based on position (deterministic but varied)
                const zoneIndex = Math.abs((x * 3 + z * 5) % zoneTypes.length);
                const zoneType = zoneTypes[zoneIndex];
                
                // Add some randomness to zone positions to make them less grid-like
                const offsetX = (Math.random() - 0.5) * spacing * 0.5;
                const offsetZ = (Math.random() - 0.5) * spacing * 0.5;
                
                // Create the zone
                this.zones.push({
                    name: zoneType.name,
                    center: new THREE.Vector3(
                        x * spacing + offsetX, 
                        0, 
                        z * spacing + offsetZ
                    ),
                    radius: zoneType.radius * (0.8 + Math.random() * 0.4), // Vary radius slightly
                    color: zoneType.color
                });
            }
        }
        
        // Add special zones
        // Dark Sanctum at the center
        this.zones.push({
            name: 'Dark Sanctum',
            center: new THREE.Vector3(0, 0, 0),
            radius: 10,
            color: 0x330033
        });
        
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
    
    createDarkSanctum(x, z) {
        const sanctumGroup = new THREE.Group();
        
        // Create main structure (dark temple)
        const baseGeometry = new THREE.BoxGeometry(20, 1, 20);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9,
            metalness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.receiveShadow = true;
        
        sanctumGroup.add(base);
        
        // Create pillars
        const pillarGeometry = new THREE.CylinderGeometry(1, 1, 8, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x330033,
            roughness: 0.7,
            metalness: 0.3
        });
        
        // Create 8 pillars in a circle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 8;
            
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                Math.cos(angle) * radius,
                4,
                Math.sin(angle) * radius
            );
            pillar.castShadow = true;
            
            sanctumGroup.add(pillar);
        }
        
        // Create central altar
        const altarGeometry = new THREE.BoxGeometry(4, 2, 4);
        const altarMaterial = new THREE.MeshStandardMaterial({
            color: 0x330033,
            roughness: 0.6,
            metalness: 0.4
        });
        const altar = new THREE.Mesh(altarGeometry, altarMaterial);
        altar.position.y = 1.5;
        altar.castShadow = true;
        
        sanctumGroup.add(altar);
        
        // Create magical orb on altar
        const orbGeometry = new THREE.SphereGeometry(1, 16, 16);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0x9900cc,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x330066,
            emissiveIntensity: 0.8
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.y = 3.5;
        
        sanctumGroup.add(orb);
        
        // Create floating runes around the orb
        const runeGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
        const runeMaterial = new THREE.MeshBasicMaterial({
            color: 0x9900cc,
            transparent: true,
            opacity: 0.7
        });
        
        // Create 5 floating runes
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 2;
            
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(
                Math.cos(angle) * radius,
                3.5,
                Math.sin(angle) * radius
            );
            rune.rotation.x = Math.PI / 2;
            
            sanctumGroup.add(rune);
        }
        
        // Create dark aura around the sanctum
        const auraGeometry = new THREE.RingGeometry(10, 12, 32);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0x330033,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = 0.1;
        
        sanctumGroup.add(aura);
        
        // Position the sanctum
        sanctumGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(sanctumGroup);
        
        // Add a boss spawn point
        this.createBossSpawnPoint(x, z, 'necromancer_lord');
    }
    
    createBossSpawnPoint(x, z, bossType) {
        // Create a special marker for boss spawn
        const markerGroup = new THREE.Group();
        
        // Create base
        const baseGeometry = new THREE.CircleGeometry(3, 32);
        const baseMaterial = new THREE.MeshBasicMaterial({
            color: 0x9900cc,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2;
        base.position.y = 0.1;
        
        markerGroup.add(base);
        
        // Create runes on the ground
        const runeGeometry = new THREE.TorusGeometry(2.5, 0.2, 8, 32);
        const runeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const rune = new THREE.Mesh(runeGeometry, runeMaterial);
        rune.rotation.x = -Math.PI / 2;
        rune.position.y = 0.15;
        
        markerGroup.add(rune);
        
        // Position marker
        markerGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(markerGroup);
        
        // Add to interactive objects
        this.interactiveObjects.push({
            type: 'boss_spawn',
            name: `${bossType} Spawn`,
            mesh: markerGroup,
            position: new THREE.Vector3(x, this.getTerrainHeight(x, z), z),
            interactionRadius: 5,
            bossType: bossType,
            onInteract: () => {
                // Return boss spawn information
                return {
                    type: 'boss_spawn',
                    bossType: bossType,
                    message: `You have awakened the ${bossType.replace('_', ' ')}!`
                };
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
        // Always return 0 for completely flat terrain
        return 0;
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
    
    // New methods for infinite terrain with random objects
    
    updateWorldForPlayer(playerPosition) {
        // Get the chunk coordinates for the player's position
        const chunkX = Math.floor(playerPosition.x / this.chunkSize);
        const chunkZ = Math.floor(playerPosition.z / this.chunkSize);
        
        // If player has moved to a new chunk
        if (chunkX !== this.currentChunk.x || chunkZ !== this.currentChunk.z) {
            this.currentChunk = { x: chunkX, z: chunkZ };
            
            // Generate objects in the new chunks around the player
            this.updateVisibleChunks(chunkX, chunkZ);
        }
        
        // Check if player has moved far enough for screen-based enemy spawning
        const distanceMoved = playerPosition.distanceTo(this.lastPlayerPosition);
        if (distanceMoved >= this.screenSpawnDistance) {
            // Update last position
            this.lastPlayerPosition.copy(playerPosition);
            
            // Notify game that player has moved a screen distance (for enemy spawning)
            if (this.game && this.game.enemyManager) {
                this.game.enemyManager.onPlayerMovedScreenDistance(playerPosition);
            }
        }
    }
    
    updateVisibleChunks(centerX, centerZ) {
        // Track which chunks should be visible
        const newVisibleChunks = {};
        const renderDistance = 2; // How many chunks in each direction to render
        const newChunks = []; // Track newly created chunks for enemy spawning
        
        // Generate or update chunks in render distance
        for (let x = centerX - renderDistance; x <= centerX + renderDistance; x++) {
            for (let z = centerZ - renderDistance; z <= centerZ + renderDistance; z++) {
                const chunkKey = `${x},${z}`;
                newVisibleChunks[chunkKey] = true;
                
                // If this chunk doesn't exist yet, create it
                if (!this.visibleChunks[chunkKey]) {
                    this.generateChunkObjects(x, z);
                    newChunks.push({ x, z, key: chunkKey });
                }
            }
        }
        
        // Remove objects from chunks that are no longer visible
        for (const chunkKey in this.visibleChunks) {
            if (!newVisibleChunks[chunkKey]) {
                this.removeChunkObjects(chunkKey);
            }
        }
        
        // Update the visible chunks
        this.visibleChunks = newVisibleChunks;
        
        // Spawn enemies in new chunks if game and enemy manager are available
        if (this.game && this.game.enemyManager && newChunks.length > 0) {
            newChunks.forEach(chunk => {
                this.game.enemyManager.spawnEnemiesInChunk(chunk.x, chunk.z);
            });
        }
    }
    
    generateChunkObjects(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const chunkObjects = [];
        
        // Calculate world coordinates for this chunk
        const worldX = chunkX * this.chunkSize;
        const worldZ = chunkZ * this.chunkSize;
        
        // Seed the random number generator based on chunk coordinates for consistency
        const seed = (chunkX * 16777259 + chunkZ * 16807) % 2147483647;
        const random = this.seededRandom(seed);
        
        // Check if we've already generated environment objects for this chunk
        if (!this.environmentObjects[chunkKey]) {
            // Generate environment objects (trees, rocks, etc.)
            this.generateEnvironmentObjects(chunkX, chunkZ, random);
        } else {
            // Restore previously generated environment objects
            this.restoreEnvironmentObjects(chunkKey);
        }
        
        // Determine number of structures to generate based on chunk size and density
        const numStructures = Math.floor(this.chunkSize * this.chunkSize * this.objectDensity * 0.2); // Reduced density for structures
        
        // Generate random structures
        for (let i = 0; i < numStructures; i++) {
            // Random position within the chunk
            const x = worldX + random() * this.chunkSize;
            const z = worldZ + random() * this.chunkSize;
            
            // Determine object type based on random value
            const objectType = random();
            
            // Create different types of structures based on random value
            if (objectType < 0.3) {
                // Create a ruin
                this.createRuins(x, z);
            } else if (objectType < 0.5) {
                // Create a building
                const width = 3 + random() * 5;
                const depth = 3 + random() * 5;
                const height = 2 + random() * 5;
                this.createBuilding(x, z, width, depth, height);
            } else if (objectType < 0.6) {
                // Create a bridge
                const length = 5 + random() * 10;
                const width = 2 + random() * 3;
                this.createBridge(x, z, length, width);
            } else if (objectType < 0.7) {
                // Create a chest
                this.createChest(x, z);
            } else if (objectType < 0.8) {
                // Create a quest marker
                const questNames = ["Demon Hunt", "Lost Treasure", "Ancient Ritual", "Forgotten Tomb"];
                const questName = questNames[Math.floor(random() * questNames.length)];
                this.createQuestMarker(x, z, questName);
            }
        }
        
        // Store the objects for this chunk
        this.visibleChunks[chunkKey] = chunkObjects;
    }
    
    generateEnvironmentObjects(chunkX, chunkZ, random) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const environmentObjects = [];
        
        // Calculate world coordinates for this chunk
        const worldX = chunkX * this.chunkSize;
        const worldZ = chunkZ * this.chunkSize;
        
        // Generate environment objects for each type
        for (const objectType of this.environmentObjectTypes) {
            // Determine number of objects to generate based on density
            const density = this.environmentObjectDensity[objectType];
            const numObjects = Math.floor(this.chunkSize * this.chunkSize * density);
            
            for (let i = 0; i < numObjects; i++) {
                // Random position within the chunk
                const x = worldX + random() * this.chunkSize;
                const z = worldZ + random() * this.chunkSize;
                
                // Create the object based on type
                let object;
                switch (objectType) {
                    case 'tree':
                        object = this.createTree(x, z);
                        break;
                    case 'rock':
                        object = this.createRock(x, z);
                        break;
                    case 'bush':
                        object = this.createBush(x, z);
                        break;
                    case 'flower':
                        object = this.createFlower(x, z);
                        break;
                }
                
                if (object) {
                    // Store object with its type and position for persistence
                    environmentObjects.push({
                        type: objectType,
                        object: object,
                        position: new THREE.Vector3(x, this.getTerrainHeight(x, z), z)
                    });
                }
            }
        }
        
        // Store environment objects for this chunk
        this.environmentObjects[chunkKey] = environmentObjects;
    }
    
    restoreEnvironmentObjects(chunkKey) {
        // Get the stored environment objects for this chunk
        const environmentObjects = this.environmentObjects[chunkKey];
        
        if (environmentObjects) {
            // Add each object back to the scene
            environmentObjects.forEach(item => {
                if (item.object && !item.object.parent) {
                    this.scene.add(item.object);
                }
            });
        }
    }
    
    removeChunkObjects(chunkKey) {
        // Remove all objects in this chunk from the scene
        const objects = this.visibleChunks[chunkKey];
        if (objects) {
            objects.forEach(object => {
                this.scene.remove(object);
                
                // Also remove from interactive objects if applicable
                const interactiveIndex = this.interactiveObjects.findIndex(obj => obj.mesh === object);
                if (interactiveIndex >= 0) {
                    this.interactiveObjects.splice(interactiveIndex, 1);
                }
            });
        }
        
        // Remove environment objects from scene but keep their data
        if (this.environmentObjects[chunkKey]) {
            this.environmentObjects[chunkKey].forEach(item => {
                if (item.object && item.object.parent) {
                    this.scene.remove(item.object);
                }
            });
        }
        
        // Remove the chunk from the visible chunks
        delete this.visibleChunks[chunkKey];
    }
    
    // Helper method to create a bush
    createBush(x, z) {
        const bushGroup = new THREE.Group();
        
        // Create bush foliage
        const bushMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d6a4f, // Dark green
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Create several spheres for the bush
        const numSpheres = 3 + Math.floor(Math.random() * 3);
        const baseSize = 0.5 + Math.random() * 0.5;
        
        for (let i = 0; i < numSpheres; i++) {
            const size = baseSize * (0.7 + Math.random() * 0.6);
            const bushGeometry = new THREE.SphereGeometry(size, 8, 6);
            const bushPart = new THREE.Mesh(bushGeometry, bushMaterial);
            
            // Position spheres to form a bush shape
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.3;
            bushPart.position.set(
                Math.cos(angle) * radius,
                size * 0.8,
                Math.sin(angle) * radius
            );
            
            // Add some random scaling
            bushPart.scale.set(
                1.0 + Math.random() * 0.2,
                0.8 + Math.random() * 0.4,
                1.0 + Math.random() * 0.2
            );
            
            bushPart.castShadow = true;
            bushPart.receiveShadow = true;
            
            bushGroup.add(bushPart);
        }
        
        // Position bush at specified coordinates
        bushGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(bushGroup);
        
        return bushGroup;
    }
    
    // Helper method to create flowers
    createFlower(x, z) {
        const flowerGroup = new THREE.Group();
        
        // Random flower color
        const flowerColors = [
            0xff5555, // Red
            0xffff55, // Yellow
            0x5555ff, // Blue
            0xff55ff, // Purple
            0xffffff  // White
        ];
        const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        
        // Create stem
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d6a4f, // Dark green
            roughness: 0.8,
            metalness: 0.2
        });
        
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.25;
        stem.castShadow = true;
        stem.receiveShadow = true;
        
        flowerGroup.add(stem);
        
        // Create flower head
        const flowerMaterial = new THREE.MeshStandardMaterial({
            color: flowerColor,
            roughness: 0.8,
            metalness: 0.2
        });
        
        // Randomly choose between different flower shapes
        const flowerType = Math.random();
        
        if (flowerType < 0.33) {
            // Daisy-like flower (cone + disc)
            const petalGeometry = new THREE.ConeGeometry(0.2, 0.1, 8);
            const flowerHead = new THREE.Mesh(petalGeometry, flowerMaterial);
            flowerHead.rotation.x = Math.PI / 2;
            flowerHead.position.y = 0.55;
            
            const centerMaterial = new THREE.MeshStandardMaterial({
                color: 0xffff00, // Yellow center
                roughness: 0.8,
                metalness: 0.2
            });
            
            const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.6;
            
            flowerGroup.add(flowerHead);
            flowerGroup.add(center);
        } else if (flowerType < 0.66) {
            // Tulip-like flower (sphere)
            const flowerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const flowerHead = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flowerHead.scale.set(1, 1.5, 1);
            flowerHead.position.y = 0.6;
            
            flowerGroup.add(flowerHead);
        } else {
            // Multiple small petals
            const numPetals = 5 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < numPetals; i++) {
                const petalGeometry = new THREE.SphereGeometry(0.08, 8, 8);
                const petal = new THREE.Mesh(petalGeometry, flowerMaterial);
                
                const angle = (i / numPetals) * Math.PI * 2;
                const radius = 0.12;
                
                petal.position.set(
                    Math.cos(angle) * radius,
                    0.55,
                    Math.sin(angle) * radius
                );
                
                flowerGroup.add(petal);
            }
            
            // Add center
            const centerMaterial = new THREE.MeshStandardMaterial({
                color: 0xffff00, // Yellow center
                roughness: 0.8,
                metalness: 0.2
            });
            
            const centerGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.55;
            
            flowerGroup.add(center);
        }
        
        // Position flower at specified coordinates
        flowerGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(flowerGroup);
        
        return flowerGroup;
    }
    
    // Seeded random number generator for consistent chunk generation
    seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }
    
    // Helper method to create a tree
    createTree(x, z) {
        const treeGroup = new THREE.Group();
        
        // Create trunk
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        
        treeGroup.add(trunk);
        
        // Create foliage
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d572c,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 3;
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        
        treeGroup.add(foliage);
        
        // Position tree on terrain
        treeGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(treeGroup);
        this.objects.push(treeGroup);
        
        return treeGroup;
    }
    
    // Helper method to create a rock
    createRock(x, z) {
        const rockGroup = new THREE.Group();
        
        // Create rock
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.9,
            metalness: 0.2
        });
        
        const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.5, 0);
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.y = 0.5;
        rock.rotation.x = Math.random() * Math.PI;
        rock.rotation.y = Math.random() * Math.PI;
        rock.rotation.z = Math.random() * Math.PI;
        rock.scale.set(
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4,
            0.8 + Math.random() * 0.4
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        rockGroup.add(rock);
        
        // Position rock on terrain
        rockGroup.position.set(x, this.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(rockGroup);
        this.objects.push(rockGroup);
        
        return rockGroup;
    }
}