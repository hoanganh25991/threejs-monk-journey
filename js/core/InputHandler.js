import * as THREE from 'three';

// Input configuration for UI display and documentation
export const INPUT_CONFIG = {
    movement: {
        title: 'Movement',
        controls: [
            { keys: ['KeyW', 'ArrowUp'], description: 'Move Forward' },
            { keys: ['KeyS', 'ArrowDown'], description: 'Move Backward' },
            { keys: ['KeyA', 'ArrowLeft'], description: 'Move Left' },
            { keys: ['KeyD', 'ArrowRight'], description: 'Move Right' }
        ]
    },
    actions: {
        title: 'Basic Actions',
        controls: [
            { keys: ['KeyH'], description: 'Basic Attack (Fist of Thunder)' },
            { keys: ['KeyE'], description: 'Interact with objects' },
            { keys: ['KeyY'], description: 'Toggle Inventory' },
            { keys: ['Escape'], description: 'Pause Menu' }
        ]
    },
    skills: {
        title: 'Skills',
        controls: [
            { keys: ['Digit1', 'KeyJ'], description: 'Skill 1' },
            { keys: ['Digit2', 'KeyK'], description: 'Skill 2' },
            { keys: ['Digit3', 'KeyL'], description: 'Skill 3' },
            { keys: ['Digit4', 'Semicolon'], description: 'Skill 4' },
            { keys: ['Digit5', 'KeyU'], description: 'Skill 5' },
            { keys: ['Digit6', 'KeyI'], description: 'Skill 6' },
            { keys: ['Digit7', 'KeyO'], description: 'Skill 7' }
        ]
    },
    ui: {
        title: 'UI Settings',
        joystick: {
            sizeMultiplier: 1, // Default to 80% of original size
            baseSize: 140, // Original base size in pixels
            handleSize: 70  // Original handle size in pixels
        }
    }
};

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.mouse = {
            position: new THREE.Vector2(),
            isDown: false,
            target: new THREE.Vector3()
        };
        this.raycaster = new THREE.Raycaster();
        
        // Key mapping for alternative keys
        this.keyMapping = {
            KeyJ: 'Digit1',
            KeyK: 'Digit2',
            KeyL: 'Digit3',
            Semicolon: 'Digit4',
            KeyU: 'Digit5',
            KeyI: 'Digit6',
            KeyO: 'Digit7'
        };
        
        // Track skill keys being held down
        this.skillKeysHeld = {
            KeyH: false, // H key for Fist of Thunder
            Digit1: false,
            Digit2: false,
            Digit3: false,
            Digit4: false,
            Digit5: false,
            Digit6: false,
            Digit7: false,
            // Alternative keys
            KeyJ: false, // Alternative to Digit1
            KeyK: false, // Alternative to Digit2
            KeyL: false, // Alternative to Digit3
            Semicolon: false, // Alternative to Digit4
            KeyU: false, // Alternative to Digit5
            KeyI: false, // Alternative to Digit6
            KeyO: false  // Alternative to Digit7
        };
        
        // Cooldown tracking for continuous casting
        this.skillCastCooldowns = {
            KeyH: 0, // H key for Fist of Thunder
            Digit1: 0,
            Digit2: 0,
            Digit3: 0,
            Digit4: 0,
            Digit5: 0,
            Digit6: 0,
            Digit7: 0,
            // Alternative keys
            KeyJ: 0, // Alternative to Digit1
            KeyK: 0, // Alternative to Digit2
            KeyL: 0, // Alternative to Digit3
            Semicolon: 0, // Alternative to Digit4
            KeyU: 0, // Alternative to Digit5
            KeyI: 0, // Alternative to Digit6
            KeyO: 0  // Alternative to Digit7
        };
        
        // Initialize input event listeners
        this.initKeyboardEvents();
        this.initMouseEvents();
    }
    
    initKeyboardEvents() {
        // Key down event
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Debug: Log key press
            console.log('Key pressed:', event.code);
            
            // Handle special key presses
            switch (event.code) {
                case 'KeyY':
                    // Toggle inventory with Y key
                    this.game.uiManager.toggleInventory();
                    console.log('Toggling inventory with KeyY');
                    break;
                    
                case 'Escape':
                    // Toggle pause menu
                    this.game.uiManager.togglePauseMenu();
                    break;
                    
                case 'KeyH':
                    // Mark H key as held down for basic attack
                    this.skillKeysHeld[event.code] = true;
                    
                    // Use basic attack (teleport or punch)
                    this.game.player.useBasicAttack();
                    break;
                    
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                    // Mark skill key as held down
                    this.skillKeysHeld[event.code] = true;
                    
                    // Initial skill cast when key is first pressed
                    const keyDigit = parseInt(event.code.charAt(5));
                    
                    // On all devices, we subtract 1 to convert from 1-based to 0-based index
                    // This ensures consistent behavior across all devices
                    const skillIndex = keyDigit - 1;
                    
                    console.log(`Using skill with index: ${skillIndex} from key: ${event.code} (key digit: ${keyDigit})`);
                    this.game.player.useSkill(skillIndex);
                    break;
                    
                case 'KeyE':
                    // Interact with objects
                    this.game.player.interact();
                    break;
                    
                // Handle all alternative keys
                default:
                    // Check if this is an alternative key
                    if (this.keyMapping[event.code]) {
                        console.log(`Alternative key ${event.code} pressed`);
                        
                        // Mark alternative skill key as held down
                        this.skillKeysHeld[event.code] = true;
                        
                        // Get the corresponding digit key
                        const mappedKey = this.keyMapping[event.code];
                        console.log(`${event.code} mapped to: ${mappedKey}`);
                        
                        // Also mark the original key as held down for consistency
                        this.skillKeysHeld[mappedKey] = true;
                        
                        // Get the key digit from the mapped key
                        const altKeyDigit = parseInt(mappedKey.charAt(5));
                        
                        // On all devices, we subtract 1 to convert from 1-based to 0-based index
                        // This ensures consistent behavior across all devices
                        const altSkillIndex = altKeyDigit - 1;
                        
                        console.log(`${event.code} skill index: ${altSkillIndex} (key digit: ${altKeyDigit})`);
                        
                        // Use the skill
                        this.game.player.useSkill(altSkillIndex);
                    }
                    break;
            }
        });
        
        // Key up event
        window.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
            
            // Handle skill key release
            if (this.skillKeysHeld[event.code] !== undefined) {
                this.skillKeysHeld[event.code] = false;
                this.skillCastCooldowns[event.code] = 0;
                
                // If this is an alternative key, also reset the original key
                if (this.keyMapping[event.code]) {
                    const mappedKey = this.keyMapping[event.code];
                    this.skillKeysHeld[mappedKey] = false;
                    this.skillCastCooldowns[mappedKey] = 0;
                }
            }
        });
    }
    
    initMouseEvents() {
        // Mouse move event
        window.addEventListener('mousemove', (event) => {
            // Calculate normalized device coordinates
            this.mouse.position.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.position.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update mouse target position on terrain
            this.updateMouseTarget();
        });
        
        // Mouse down event
        window.addEventListener('mousedown', (event) => {
            this.mouse.isDown = true;
            
            // Handle mouse button clicks
            switch (event.button) {
                case 0: // Left click
                    // Check for interactive objects
                    this.checkInteraction();
                    break;
                case 2: // Right click
                    // Use primary attack
                    if (this.mouse.target) {
                        this.game.player.attack(this.mouse.target);
                    }
                    break;
            }
        });
        
        // Mouse up event
        window.addEventListener('mouseup', (event) => {
            this.mouse.isDown = false;
        });
        
        // Prevent context menu on right click
        window.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    updateMouseTarget() {
        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse.position, this.game.camera);
        
        // Create an array of all terrain meshes to check
        const terrainMeshes = [];
        
        // Add base terrain if it exists
        if (this.game.world.terrainManager && this.game.world.terrainManager.terrain) {
            terrainMeshes.push(this.game.world.terrainManager.terrain);
        }
        
        // Add all terrain chunks to the array if they exist
        if (this.game.world.terrainManager && this.game.world.terrainManager.terrainChunks) {
            for (const chunkKey in this.game.world.terrainManager.terrainChunks) {
                const chunk = this.game.world.terrainManager.terrainChunks[chunkKey];
                if (chunk) {
                    terrainMeshes.push(chunk);
                }
            }
        }
        
        // Check for intersections with all terrain meshes only if we have meshes to check
        let terrainIntersects = [];
        if (terrainMeshes.length > 0) {
            terrainIntersects = this.raycaster.intersectObjects(terrainMeshes);
        }
        
        if (terrainIntersects.length > 0) {
            // Update mouse target position from terrain intersection
            this.mouse.target.copy(terrainIntersects[0].point);
        } else {
            // If no terrain intersection, use a plane at y=0 to allow movement beyond terrain
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Horizontal plane at y=0
            const rayCaster = new THREE.Raycaster();
            rayCaster.setFromCamera(this.mouse.position, this.game.camera);
            
            const intersection = new THREE.Vector3();
            if (rayCaster.ray.intersectPlane(plane, intersection)) {
                // Update mouse target position from plane intersection
                this.mouse.target.copy(intersection);
            }
        }
    }
    
    checkInteraction() {
        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(this.mouse.position, this.game.camera);
        
        // Get all interactive objects if they exist
        let interactiveObjects = [];
        if (this.game.world.interactiveManager && this.game.world.interactiveManager.getInteractiveObjects) {
            const objects = this.game.world.interactiveManager.getInteractiveObjects();
            if (objects && objects.length > 0) {
                interactiveObjects = objects.map(obj => obj.mesh).filter(mesh => mesh !== undefined);
            }
        } else if (this.game.world.interactiveObjects) {
            // Fallback to old structure if it exists
            interactiveObjects = this.game.world.interactiveObjects.map(obj => obj.mesh).filter(mesh => mesh !== undefined);
        }
        
        // Check for intersections with interactive objects only if we have objects to check
        if (interactiveObjects.length === 0) {
            return;
        }
        
        // Check for intersections with interactive objects
        const intersects = this.raycaster.intersectObjects(interactiveObjects, true);
        
        if (intersects.length > 0) {
            // Find the interactive object that was clicked
            const clickedMesh = intersects[0].object;
            let parentMesh = clickedMesh;
            
            // Find the top-level parent mesh
            while (parentMesh.parent && parentMesh.parent !== this.game.scene) {
                parentMesh = parentMesh.parent;
            }
            
            // Find the interactive object data
            let interactiveObject;
            if (this.game.world.interactiveManager && this.game.world.interactiveManager.getInteractiveObjectByMesh) {
                interactiveObject = this.game.world.interactiveManager.getInteractiveObjectByMesh(parentMesh);
            } else if (this.game.world.interactiveObjects) {
                interactiveObject = this.game.world.interactiveObjects.find(obj => obj.mesh === parentMesh);
            }
            
            if (interactiveObject) {
                // Trigger interaction
                const result = interactiveObject.onInteract();
                
                // Handle interaction result
                if (result) {
                    switch (result.type) {
                        case 'item':
                            // Add item to inventory
                            this.game.player.addToInventory(result.item);
                            this.game.uiManager.showNotification(`Found ${result.item.name} x${result.item.amount}`);
                            break;
                        case 'quest':
                            // Show quest dialog
                            this.game.questManager.startQuest(result.quest);
                            this.game.uiManager.showDialog(
                                `New Quest: ${result.quest.name}`,
                                result.quest.description
                            );
                            break;
                    }
                }
            }
        }
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    getMovementDirection() {
        const direction = new THREE.Vector3(0, 0, 0);
        
        // Check for keyboard input
        if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) {
            direction.z -= 1;
        }
        
        if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) {
            direction.z += 1;
        }
        
        if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) {
            direction.x -= 1;
        }
        
        if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) {
            direction.x += 1;
        }
        
        // Check for joystick input (if available)
        if (this.game && this.game.uiManager && this.game.uiManager.getJoystickDirection) {
            const joystickDir = this.game.uiManager.getJoystickDirection();
            
            // Only use joystick if it's active (has non-zero values)
            if (joystickDir && (joystickDir.x !== 0 || joystickDir.y !== 0)) {
                // Override keyboard input with joystick input
                direction.x = joystickDir.x;
                direction.z = joystickDir.y; // Y axis of joystick maps to Z axis in 3D space
            }
        }
        
        // Normalize direction vector
        if (direction.length() > 0) {
            direction.normalize();
        }
        
        return direction;
    }
    
    getMouseTarget() {
        return this.mouse.target;
    }
    
    isMouseDown() {
        return this.mouse.isDown;
    }
    
    update(delta) {
        // Skip input processing if game is paused
        if (this.game && this.game.isPaused) {
            return; // Don't process inputs when game is paused
        }
        
        // Handle continuous skill casting for held keys
        const castInterval = 0.1; // Cast every 0.1 seconds when key is held
        
        // Process only the keys that are actually held down
        for (const keyCode in this.skillKeysHeld) {
            if (this.skillKeysHeld[keyCode]) {
                // Reduce cooldown
                this.skillCastCooldowns[keyCode] -= delta;
                
                // If cooldown is up, cast the skill again
                if (this.skillCastCooldowns[keyCode] <= 0) {
                    try {
                        if (keyCode === 'KeyH') {
                            // Special handling for H key (Fist of Thunder)
                            console.log('Continuous casting: Basic attack (KeyH)');
                            this.game.player.useBasicAttack();
                            this.skillCastCooldowns[keyCode] = castInterval;
                        } else if (keyCode.startsWith('Digit')) {
                            // For number keys
                            const keyDigit = parseInt(keyCode.charAt(5));
                            // Subtract 1 to convert from 1-based to 0-based index
                            const skillIndex = keyDigit - 1;
                            console.log('Continuous casting: Digit key', keyCode, 'Key digit:', keyDigit, 'Skill index:', skillIndex);
                            this.game.player.useSkill(skillIndex);
                            this.skillCastCooldowns[keyCode] = castInterval;
                        } else if (this.keyMapping && this.keyMapping[keyCode]) {
                            // For alternative keys (j,k,l,;,u,i,o)
                            const mappedKey = this.keyMapping[keyCode];
                            const keyDigit = parseInt(mappedKey.charAt(5));
                            // Subtract 1 to convert from 1-based to 0-based index
                            const skillIndex = keyDigit - 1;
                            console.log('Continuous casting: Alternative key', keyCode, 'mapped to', mappedKey, 'Key digit:', keyDigit, 'Skill index:', skillIndex);
                            this.game.player.useSkill(skillIndex);
                            
                            // Reset cooldown for both the alternative key and the original key
                            this.skillCastCooldowns[keyCode] = castInterval;
                            this.skillCastCooldowns[mappedKey] = castInterval;
                        }
                    } catch (error) {
                        console.error(`Error in continuous casting for key ${keyCode}:`, error);
                        // Reset the key state to prevent further errors
                        this.skillKeysHeld[keyCode] = false;
                        this.skillCastCooldowns[keyCode] = 0;
                    }
                }
            }
        }
    }
}