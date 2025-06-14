import * as THREE from 'three';

// Import environment configuration
import { ENVIRONMENT_OBJECTS } from '../../config/environment.js';

// Import environment objects
import { WaterFeature } from './WaterFeature.js';
import { LavaFeature } from './LavaFeature.js';
import { CrystalFormation } from './CrystalFormation.js';
import { RarePlant } from './RarePlant.js';
import { MagicalStone } from './MagicalStone.js';
import { AncientArtifact } from './AncientArtifact.js';
import { Moss } from './Moss.js';
import { Oasis } from './Oasis.js';
import { ObsidianFormation } from './ObsidianFormation.js';
import { DesertShrine } from './DesertShrine.js';
import { TreeCluster } from './TreeCluster.js';
import { SmallPeak } from './SmallPeak.js';
import { SnowPatch } from './SnowPatch.js';

// Import traditional environment objects
import { Tree } from './Tree.js';
import { Rock } from './Rock.js';
import { Bush } from './Bush.js';
import { Flower } from './Flower.js';
import { TallGrass } from './TallGrass.js';
import { AncientTree } from './AncientTree.js';
import { Waterfall } from './Waterfall.js';

// Import village and urban environment objects
import { Market } from './Market.js';
import { Square } from './Square.js';
import { Plaza } from './Plaza.js';
import { Stairs } from './Stairs.js';
import { Well } from './Well.js';
import { Statue } from './Statue.js';
import { Foutain } from './Foutain.js';

/**
 * Environment Factory - Creates environment objects based on type
 * Centralizes environment object creation and provides a registry for all types
 */
export class EnvironmentFactory {
    constructor(scene, worldManager) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.registry = new Map();
        
        // Register all environment object creators
        this.registerEnvironmentObjects();
    }
    
    /**
     * Register all environment object creators
     */
    registerEnvironmentObjects() {
        // Register environment objects with dedicated classes
        this.register(ENVIRONMENT_OBJECTS.WATER, (position, size) => new WaterFeature(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.LAVA, (position, size) => new LavaFeature(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.CRYSTAL_FORMATION, (position, size) => new CrystalFormation(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.RARE_PLANT, (position, size) => new RarePlant(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.MAGICAL_STONE, (position, size) => new MagicalStone(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.ANCIENT_ARTIFACT, (position, size) => new AncientArtifact(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.MOSS, (position, size) => new Moss(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.OASIS, (position, size) => new Oasis(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.OBSIDIAN_FORMATION, (position, size) => new ObsidianFormation(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.DESERT_SHRINE, (position, size) => new DesertShrine(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.TREE_CLUSTER, (data) => new TreeCluster(this.scene, this.worldManager, data));
        this.register(ENVIRONMENT_OBJECTS.SMALL_PEAK, (position, size) => new SmallPeak(this.scene, this.worldManager, position, size));
        this.register(ENVIRONMENT_OBJECTS.SNOW_PATCH, (position, size) => new SnowPatch(this.scene, this.worldManager, position, size));
        
        // Register village and urban environment objects
        this.register(ENVIRONMENT_OBJECTS.MARKET, (position, size, data) => {
            const market = new Market(this.scene, this.worldManager);
            return market.createMesh({ position, size, ...data });
        });
        this.register(ENVIRONMENT_OBJECTS.SQUARE, (position, size, data) => {
            const square = new Square(this.scene, this.worldManager);
            return square.createMesh({ position, size, ...data });
        });
        this.register(ENVIRONMENT_OBJECTS.PLAZA, (position, size, data) => {
            const plaza = new Plaza(this.scene, this.worldManager);
            return plaza.createMesh({ position, size, ...data });
        });
        this.register(ENVIRONMENT_OBJECTS.STAIRS, (position, size, data) => {
            const stairs = new Stairs(this.scene, this.worldManager);
            return stairs.createMesh({ position, size, ...data });
        });
        
        this.register(ENVIRONMENT_OBJECTS.WELL, (position, size, data) => {
            const well = new Well(this.scene, this.worldManager);
            return well.createMesh({ position, size, ...data });
        });
        
        this.register(ENVIRONMENT_OBJECTS.STATUE, (position, size, data) => {
            const statue = new Statue(this.scene, this.worldManager);
            return statue.createMesh({ position, size, ...data });
        });
        
        this.register(ENVIRONMENT_OBJECTS.FOUTAIN, (position, size, data) => {
            const foutain = new Foutain(this.scene, this.worldManager);
            return foutain.createMesh({ position, size, ...data });
        });
        
        // Register traditional environment objects
        this.register(ENVIRONMENT_OBJECTS.TREE, (position, size) => {
            const tree = new Tree();
            const treeGroup = tree.createMesh();
            treeGroup.position.copy(position);
            if (size !== 1) {
                treeGroup.scale.set(size, size, size);
            }
            this.scene.add(treeGroup);
            return treeGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.ROCK, (position, size) => {
            const rock = new Rock();
            const rockGroup = rock.createMesh();
            rockGroup.position.copy(position);
            if (size !== 1) {
                rockGroup.scale.set(size, size, size);
            }
            this.scene.add(rockGroup);
            return rockGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.BUSH, (position, size) => {
            const bush = new Bush();
            const bushGroup = bush.createMesh();
            bushGroup.position.copy(position);
            if (size !== 1) {
                bushGroup.scale.set(size, size, size);
            }
            this.scene.add(bushGroup);
            return bushGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.FLOWER, (position, size) => {
            const flower = new Flower();
            const flowerGroup = flower.createMesh();
            flowerGroup.position.copy(position);
            if (size !== 1) {
                flowerGroup.scale.set(size, size, size);
            }
            this.scene.add(flowerGroup);
            return flowerGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.TALL_GRASS, (position, size) => {
            const tallGrass = new TallGrass();
            const grassGroup = tallGrass.createMesh();
            grassGroup.position.copy(position);
            if (size !== 1) {
                grassGroup.scale.set(size, size, size);
            }
            this.scene.add(grassGroup);
            return grassGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.ANCIENT_TREE, (position, size) => {
            const ancientTree = new AncientTree();
            const treeGroup = ancientTree.createMesh();
            treeGroup.position.copy(position);
            if (size !== 1) {
                treeGroup.scale.set(size, size, size);
            }
            this.scene.add(treeGroup);
            return treeGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.WATERFALL, (position, size) => {
            const waterfall = new Waterfall(this.scene, this.worldManager);
            const waterfallGroup = waterfall.createMesh(position);
            if (size !== 1) {
                waterfallGroup.scale.set(size, size, size);
            }
            return waterfallGroup;
        });
        
        // Register simple objects that don't have dedicated classes yet
        this.register(ENVIRONMENT_OBJECTS.SMALL_PLANT, (position, size) => {
            // Create a simple small plant using a scaled-down bush
            const bush = new Bush();
            const plantGroup = bush.createMesh();
            plantGroup.position.copy(position);
            // Scale it down to make it a small plant
            const plantSize = size * 0.3;
            plantGroup.scale.set(plantSize, plantSize, plantSize);
            this.scene.add(plantGroup);
            return plantGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.FALLEN_LOG, (position, size) => {
            // Create a simple fallen log using a cylinder
            const geometry = new THREE.CylinderGeometry(0.5 * size, 0.4 * size, 4 * size, 8);
            const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const log = new THREE.Mesh(geometry, material);
            
            // Rotate to make it horizontal
            log.rotation.z = Math.PI / 2;
            log.rotation.y = Math.random() * Math.PI;
            
            // Position on terrain
            log.position.copy(position);
            log.position.y -= 0.2; // Slightly embed in ground
            
            // Add some detail
            const barkGeometry = new THREE.CylinderGeometry(0.55 * size, 0.45 * size, 4.1 * size, 8);
            const barkMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x5D4037,
                wireframe: true,
                transparent: true,
                opacity: 0.5
            });
            const bark = new THREE.Mesh(barkGeometry, barkMaterial);
            bark.rotation.z = Math.PI / 2;
            
            // Create a group for the log
            const logGroup = new THREE.Group();
            logGroup.add(log);
            logGroup.add(bark);
            
            // Add to scene
            this.scene.add(logGroup);
            
            return logGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.MUSHROOM, (position, size) => {
            // Create a simple mushroom
            const stemGeometry = new THREE.CylinderGeometry(0.1 * size, 0.15 * size, 0.5 * size, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xECEFF1 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            
            // Create cap
            const capGeometry = new THREE.SphereGeometry(0.3 * size, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const capMaterial = new THREE.MeshLambertMaterial({ color: 0xE53935 });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.25 * size;
            cap.scale.set(1.2, 1, 1.2);
            
            // Create a group for the mushroom
            const mushroomGroup = new THREE.Group();
            mushroomGroup.add(stem);
            mushroomGroup.add(cap);
            
            // Position on terrain
            mushroomGroup.position.copy(position);
            
            // Add to scene
            this.scene.add(mushroomGroup);
            
            return mushroomGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.ROCK_FORMATION, (position, size) => {
            // Create a rock formation with multiple rocks
            const rockFormationGroup = new THREE.Group();
            
            // Add 3-5 rocks of varying sizes
            const rockCount = 3 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < rockCount; i++) {
                const rock = new Rock();
                const rockMesh = rock.createMesh();
                
                // Position rocks in a cluster
                const angle = Math.random() * Math.PI * 2;
                const distance = (0.5 + Math.random() * 1.5) * size;
                
                rockMesh.position.x = position.x + Math.cos(angle) * distance;
                rockMesh.position.y = position.y;
                rockMesh.position.z = position.z + Math.sin(angle) * distance;
                
                // Random scale for each rock
                const rockScale = (0.6 + Math.random() * 0.8) * size;
                rockMesh.scale.set(rockScale, rockScale, rockScale);
                
                // Random rotation
                rockMesh.rotation.y = Math.random() * Math.PI * 2;
                
                rockFormationGroup.add(rockMesh);
            }
            
            // Add to scene
            this.scene.add(rockFormationGroup);
            
            return rockFormationGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.SHRINE, (position, size) => {
            // Create a simple shrine
            const baseGeometry = new THREE.BoxGeometry(2 * size, 0.5 * size, 2 * size);
            const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            
            // Create pillars
            const pillarGeometry = new THREE.CylinderGeometry(0.15 * size, 0.15 * size, 1.5 * size, 8);
            const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x757575 });
            
            const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar1.position.set(0.7 * size, 0.75 * size, 0.7 * size);
            
            const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar2.position.set(-0.7 * size, 0.75 * size, 0.7 * size);
            
            const pillar3 = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar3.position.set(0.7 * size, 0.75 * size, -0.7 * size);
            
            const pillar4 = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar4.position.set(-0.7 * size, 0.75 * size, -0.7 * size);
            
            // Create roof
            const roofGeometry = new THREE.BoxGeometry(2.4 * size, 0.3 * size, 2.4 * size);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x616161 });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 1.5 * size;
            
            // Create a small altar in the center
            const altarGeometry = new THREE.BoxGeometry(0.8 * size, 0.8 * size, 0.8 * size);
            const altarMaterial = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
            const altar = new THREE.Mesh(altarGeometry, altarMaterial);
            altar.position.y = 0.4 * size;
            
            // Create a group for the shrine
            const shrineGroup = new THREE.Group();
            shrineGroup.add(base);
            shrineGroup.add(pillar1);
            shrineGroup.add(pillar2);
            shrineGroup.add(pillar3);
            shrineGroup.add(pillar4);
            shrineGroup.add(roof);
            shrineGroup.add(altar);
            
            // Position on terrain
            shrineGroup.position.copy(position);
            
            // Add to scene
            this.scene.add(shrineGroup);
            
            return shrineGroup;
        });
        
        this.register(ENVIRONMENT_OBJECTS.STUMP, (position, size) => {
            // Create a tree stump
            const trunkGeometry = new THREE.CylinderGeometry(0.6 * size, 0.7 * size, 0.8 * size, 12);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            // Create top of stump with rings
            const topGeometry = new THREE.CylinderGeometry(0.6 * size, 0.6 * size, 0.1 * size, 12);
            const topMaterial = new THREE.MeshLambertMaterial({ color: 0xA1887F });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = 0.45 * size;
            
            // Create rings on top
            const ringGeometry = new THREE.RingGeometry(0.2 * size, 0.25 * size, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x795548, 
                side: THREE.DoubleSide 
            });
            const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
            ring1.rotation.x = -Math.PI / 2;
            ring1.position.y = 0.51 * size;
            
            const ring2 = new THREE.Mesh(
                new THREE.RingGeometry(0.35 * size, 0.4 * size, 32),
                ringMaterial
            );
            ring2.rotation.x = -Math.PI / 2;
            ring2.position.y = 0.51 * size;
            
            const ring3 = new THREE.Mesh(
                new THREE.RingGeometry(0.5 * size, 0.55 * size, 32),
                ringMaterial
            );
            ring3.rotation.x = -Math.PI / 2;
            ring3.position.y = 0.51 * size;
            
            // Create a group for the stump
            const stumpGroup = new THREE.Group();
            stumpGroup.add(trunk);
            stumpGroup.add(top);
            stumpGroup.add(ring1);
            stumpGroup.add(ring2);
            stumpGroup.add(ring3);
            
            // Position on terrain
            stumpGroup.position.copy(position);
            stumpGroup.position.y -= 0.3 * size; // Slightly embed in ground
            
            // Add to scene
            this.scene.add(stumpGroup);
            
            return stumpGroup;
        });
    }
    
    /**
     * Register an environment object creator
     * @param {string} type - The type of environment object
     * @param {Function} creator - The creator function
     */
    register(type, creator) {
        this.registry.set(type, creator);
    }
    
    /**
     * Create an environment object
     * @param {string} type - The type of environment object to create
     * @param {THREE.Vector3} position - Position vector with x, y, z coordinates
     * @param {number} size - Size of the object
     * @param {Object} data - Additional data for complex objects
     * @returns {THREE.Object3D} - The created environment object
     */
    create(type, position, size, data = null) {
        const creator = this.registry.get(type);
        
        if (!creator) {
            console.warn(`Unknown environment object type: ${type}`);
            return null;
        }
        
        // For objects that need the full data object (like tree_cluster)
        if (type === 'tree_cluster') {
            return creator(data);
        }
        
        // Ensure position is a valid Vector3
        if (!(position instanceof THREE.Vector3)) {
            console.warn(`Invalid position for environment object ${type}. Using default position.`);
            position = new THREE.Vector3(0, 0, 0);
        }
        
        // For standard objects that just need position and size
        return creator(position, size);
    }
    
    /**
     * Check if an environment object type is registered
     * @param {string} type - The type to check
     * @returns {boolean} - True if the type is registered
     */
    hasType(type) {
        return this.registry.has(type);
    }
    
    /**
     * Check if the factory can create an environment object of the given type
     * @param {string} type - The type to check
     * @returns {boolean} - True if the factory can create the type
     */
    canCreate(type) {
        return this.registry.has(type);
    }
    
    /**
     * Get all registered environment object types
     * @returns {Array<string>} - Array of registered types
     */
    getRegisteredTypes() {
        return Array.from(this.registry.keys());
    }
}