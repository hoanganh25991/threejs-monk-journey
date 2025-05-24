import * as THREE from 'three';
import { TreasureChest } from './TreasureChest.js';
import { QuestMarker } from './QuestMarker.js';
import { BossSpawnPoint } from './BossSpawnPoint.js';
import { InteractionResultHandler } from '../../InteractionResultHandler.js';

/**
 * Manages interactive objects in the world
 */
export class InteractiveObjectManager {
    constructor(scene, worldManager) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.game = null;
        this.interactionHandler = null;
        
        // Interactive object collections
        this.interactiveObjects = [];
        
        // Raycaster for click/touch detection
        this.raycaster = new THREE.Raycaster();
        this.clickableObjects = [];
    }
    
    /**
     * Set the game reference
     * @param {Game} game - The game instance
     */
    setGame(game) {
        this.game = game;
        this.interactionHandler = new InteractionResultHandler(game);
    }
    
    /**
     * Initialize the interactive object system
     */
    init() {
        this.createInteractiveObjects();
        this.setupClickEvents();
    }
    
    /**
     * Set up click/touch event listeners for interactive objects
     */
    setupClickEvents() {
        // Get the canvas element
        const canvas = this.scene.renderer ? this.scene.renderer.domElement : document.querySelector('canvas');
        
        if (!canvas) {
            console.warn('Canvas not found for click/touch events');
            return;
        }
        
        // Track touch start position to prevent accidental interactions during scrolling
        let touchStartX = 0;
        let touchStartY = 0;
        const touchThreshold = 10; // Pixels of movement allowed before canceling the touch
        
        // Add click event listener
        canvas.addEventListener('click', (event) => {
            console.debug('Click event detected');
            this.handleClick(event);
        });
        
        // Touch start - record position
        canvas.addEventListener('touchstart', (event) => {
            if (event.touches && event.touches.length > 0) {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }
        });
        
        // Add touch event listener for mobile
        canvas.addEventListener('touchend', (event) => {
            // Prevent default to avoid double events
            event.preventDefault();
            
            // Use the first touch point
            if (event.changedTouches && event.changedTouches.length > 0) {
                const touch = event.changedTouches[0];
                
                // Check if the touch moved significantly (to avoid triggering on scrolls)
                const touchMoveX = Math.abs(touch.clientX - touchStartX);
                const touchMoveY = Math.abs(touch.clientY - touchStartY);
                
                if (touchMoveX <= touchThreshold && touchMoveY <= touchThreshold) {
                    console.debug('Touch end event detected (within threshold)');
                    this.handleClick(touch);
                } else {
                    console.debug('Touch moved too much, ignoring as interaction');
                }
            }
        });
        
        // Also add touchcancel handler
        canvas.addEventListener('touchcancel', () => {
            console.debug('Touch cancelled');
        });
    }
    
    /**
     * Handle click/touch event
     * @param {Event} event - The click or touch event
     */
    handleClick(event) {
        // Skip if game is paused
        if (this.game && this.game.isPaused) return;
        
        // Get canvas
        const canvas = this.scene.renderer ? this.scene.renderer.domElement : document.querySelector('canvas');
        if (!canvas) return;
        
        // Calculate normalized device coordinates
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Set raycaster
        this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.game.camera);
        
        // Get all meshes from interactive objects
        const clickableObjects = this.interactiveObjects.map(obj => obj.mesh).filter(mesh => mesh);
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects(clickableObjects, true);
        
        if (intersects.length > 0) {
            // Find the interactive object that was clicked
            const clickedMesh = intersects[0].object;
            let clickedObject = null;
            
            // Find the parent interactive object by traversing up the hierarchy
            for (const obj of this.interactiveObjects) {
                // Check if the clicked mesh is the interactive object's mesh
                if (obj.mesh === clickedMesh) {
                    clickedObject = obj;
                    break;
                }
                
                // Check if the clicked mesh is a direct child of the interactive object's mesh
                if (obj.mesh.children.includes(clickedMesh)) {
                    clickedObject = obj;
                    break;
                }
                
                // Check if the clicked mesh is a descendant of the interactive object's mesh
                // by traversing up the parent hierarchy
                let parent = clickedMesh.parent;
                while (parent) {
                    if (parent === obj.mesh) {
                        clickedObject = obj;
                        break;
                    }
                    parent = parent.parent;
                }
                
                if (clickedObject) break;
            }
            
            // If we found the object, interact with it
            if (clickedObject) {
                console.debug('Interacting with clicked object:', clickedObject.type);
                this.interactWithObject(clickedObject);
            } else {
                console.debug('Could not find interactive object for clicked mesh:', clickedMesh);
            }
        }
    }
    
    /**
     * Interact with an interactive object
     * @param {Object} interactiveObject - The interactive object to interact with
     */
    interactWithObject(interactiveObject) {
        // Call the object's interaction handler
        const result = interactiveObject.onInteract();
        
        // Use the shared interaction handler
        if (this.interactionHandler) {
            this.interactionHandler.handleInteractionResult(result, interactiveObject);
        } else {
            console.warn('Interaction handler not initialized');
        }
    }
    
    /**
     * Create initial interactive objects
     */
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
    
    /**
     * Create a treasure chest at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @returns {THREE.Group} - The treasure chest group
     */
    createTreasureChest(x, z) {
        const chest = new TreasureChest();
        const chestGroup = chest.createMesh();
        
        // Position chest on terrain
        chestGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(chestGroup);
        
        // Add to interactive objects
        this.interactiveObjects.push({
            type: 'chest',
            mesh: chestGroup,
            position: new THREE.Vector3(x, this.worldManager.getTerrainHeight(x, z), z),
            interactionRadius: 2,
            isOpen: false,
            onInteract: () => {
                // Open chest animation and give reward
                if (!chest.isOpen) {
                    // Open the chest
                    chest.open();
                    
                    // Return some reward
                    return {
                        type: 'treasure',
                        item: {
                            name: 'Gold',
                            amount: Math.floor(Math.random() * 100) + 50
                        }
                    };
                }
                return null;
            }
        });
        
        return chestGroup;
    }
    
    /**
     * Create a quest marker at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {string} questName - Name of the quest
     * @returns {THREE.Group} - The quest marker group
     */
    createQuestMarker(x, z, questName) {
        const questMarker = new QuestMarker(questName);
        const markerGroup = questMarker.createMesh();
        
        // Position marker on terrain
        markerGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(markerGroup);
        
        // Add to interactive objects
        this.interactiveObjects.push({
            type: 'quest',
            name: questName,
            mesh: markerGroup,
            position: new THREE.Vector3(x, this.worldManager.getTerrainHeight(x, z), z),
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
        
        return markerGroup;
    }
    
    /**
     * Create a boss spawn point at the specified position
     * @param {number} x - X coordinate
     * @param {number} z - Z coordinate
     * @param {string} bossType - Type of boss
     * @returns {THREE.Group} - The boss spawn point group
     */
    createBossSpawnPoint(x, z, bossType) {
        const bossSpawn = new BossSpawnPoint(bossType);
        const markerGroup = bossSpawn.createMesh();
        
        // Position marker on terrain
        markerGroup.position.set(x, this.worldManager.getTerrainHeight(x, z), z);
        
        // Add to scene
        this.scene.add(markerGroup);
        
        // Add to interactive objects
        this.interactiveObjects.push({
            type: 'boss_spawn',
            name: `${bossType} Spawn`,
            mesh: markerGroup,
            position: new THREE.Vector3(x, this.worldManager.getTerrainHeight(x, z), z),
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
        
        return markerGroup;
    }
    
    /**
     * Get interactive objects near a specific position
     * @param {THREE.Vector3} position - The position to check
     * @param {number} radius - The radius to check
     * @returns {Array} - Array of interactive objects within the radius
     */
    getObjectsNear(position, radius) {
        return this.interactiveObjects.filter(obj => {
            const distance = position.distanceTo(obj.position);
            return distance <= (radius + obj.interactionRadius);
        });
    }
    
    /**
     * Get all interactive objects
     * @returns {Array} - Array of all interactive objects
     */
    getInteractiveObjects() {
        return this.interactiveObjects;
    }
    
    /**
     * Get an interactive object by its mesh
     * @param {THREE.Object3D} mesh - The mesh to find the interactive object for
     * @returns {Object|null} - The interactive object or null if not found
     */
    getInteractiveObjectByMesh(mesh) {
        return this.interactiveObjects.find(obj => obj.mesh === mesh);
    }
    
    /**
     * Clear all interactive objects
     */
    clear() {
        // Remove all interactive objects from the scene
        this.interactiveObjects.forEach(obj => {
            if (obj.mesh && obj.mesh.parent) {
                this.scene.remove(obj.mesh);
            }
        });
        
        // Reset collection
        this.interactiveObjects = [];
    }
    
    /**
     * Save interactive object state
     * @returns {object} - The saved interactive object state
     */
    save() {
        return {
            objects: this.interactiveObjects.map(obj => ({
                type: obj.type,
                name: obj.name,
                position: {
                    x: obj.position.x,
                    y: obj.position.y,
                    z: obj.position.z
                },
                interactionRadius: obj.interactionRadius,
                isOpen: obj.isOpen,
                bossType: obj.bossType
            }))
        };
    }
    
    /**
     * Load interactive object state
     * @param {object} interactiveState - The interactive object state to load
     */
    load(interactiveState) {
        if (!interactiveState || !interactiveState.objects) return;
        
        // Clear existing objects
        this.clear();
        
        // Create objects from saved data
        interactiveState.objects.forEach(objData => {
            switch (objData.type) {
                case 'chest':
                    const chest = this.createTreasureChest(objData.position.x, objData.position.z);
                    if (objData.isOpen) {
                        // Find the interactive object and mark it as open
                        const interactiveObj = this.interactiveObjects.find(obj => obj.mesh === chest);
                        if (interactiveObj) {
                            interactiveObj.isOpen = true;
                            // Open the chest visually
                            const treasureChest = new TreasureChest();
                            treasureChest.open(chest);
                        }
                    }
                    break;
                case 'quest':
                    this.createQuestMarker(objData.position.x, objData.position.z, objData.name);
                    break;
                case 'boss_spawn':
                    this.createBossSpawnPoint(objData.position.x, objData.position.z, objData.bossType);
                    break;
            }
        });
    }
}