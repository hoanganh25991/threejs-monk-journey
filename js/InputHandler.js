import * as THREE from 'three';

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        
        // Key mapping for alternative keys
        this.keyMapping = {
            KeyJ: 'Digit1',
            KeyK: 'Digit2',
            KeyL: 'Digit3',
            Semicolon: 'Digit4',
            KeyU: 'Digit5',
            KeyI: 'Digit6',
            KeyO: 'Digit7',
            KeyP: 'Digit8',  // P key as alternative to Digit8
            BracketRight: 'Digit9'  // ] key as alternative to Digit9
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
            Digit8: false, // 8 key for Breath of Heaven
            Digit9: false, // 9 key for Shield of Zen
            // Alternative keys
            KeyJ: false, // Alternative to Digit1
            KeyK: false, // Alternative to Digit2
            KeyL: false, // Alternative to Digit3
            Semicolon: false, // Alternative to Digit4
            KeyU: false, // Alternative to Digit5
            KeyI: false, // Alternative to Digit6
            KeyO: false, // Alternative to Digit7
            KeyP: false,  // Alternative to Digit8
            BracketRight: false // Alternative to Digit9
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
            Digit8: 0, // 8 key for Breath of Heaven
            Digit9: 0, // 9 key for Shield of Zen
            // Alternative keys
            KeyJ: 0, // Alternative to Digit1
            KeyK: 0, // Alternative to Digit2
            KeyL: 0, // Alternative to Digit3
            Semicolon: 0, // Alternative to Digit4
            KeyU: 0, // Alternative to Digit5
            KeyI: 0, // Alternative to Digit6
            KeyO: 0, // Alternative to Digit7
            KeyP: 0,  // Alternative to Digit8
            BracketRight: 0 // Alternative to Digit9
        };
        
        // Initialize input event listeners
        this.initKeyboardEvents();
        
        // Prevent context menu on right click
        window.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }
    
    initKeyboardEvents() {
        // Key down event
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Debug: Log key press
            console.debug('Key pressed:', event.code);
            
            // Handle special key presses
            switch (event.code) {
                case 'KeyY':
                    // Toggle inventory with Y key
                    this.game.uiManager.toggleInventory();
                    console.debug('Toggling inventory with KeyY');
                    break;
                    
                case 'KeyT':
                    // Toggle skill tree with T key
                    this.game.uiManager.toggleSkillTree();
                    console.debug('Toggling skill tree with KeyT');
                    break;
                    
                case 'KeyF':
                    // Toggle HUD visibility with F key
                    const hudVisible = this.game.uiManager.toggleHUD();
                    console.debug(`HUD visibility toggled: ${hudVisible ? 'visible' : 'hidden'}`);
                    break;
                    
                case 'KeyM':
                    // Toggle minimap visibility with M key
                    const minimapVisible = this.game.uiManager.toggleMiniMap();
                    console.debug(`Mini map visibility toggled: ${minimapVisible ? 'visible' : 'hidden'}`);
                    break;
                    
                case 'BracketLeft':
                    // Zoom in minimap with [ key
                    this.game.uiManager.decreaseMiniMapScale();
                    break;
                    
                case 'BracketRight':
                    // Zoom out minimap with ] key
                    this.game.uiManager.increaseMiniMapScale();
                    break;
                    
                case 'KeyH':
                    // Mark H key as held down for basic attack
                    this.skillKeysHeld[event.code] = true;
                    
                    // Use basic attack (teleport or punch)
                    this.game.player.usePrimaryAttack();
                    break;
                    
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                case 'Digit9':
                    // Mark skill key as held down
                    this.skillKeysHeld[event.code] = true;
                    
                    // Initial skill cast when key is first pressed
                    const keyDigit = parseInt(event.code.charAt(5));
                    
                    // On all devices, we subtract 1 to convert from 1-based to 0-based index
                    // This ensures consistent behavior across all devices
                    const skillIndex = keyDigit - 1;
                    
                    console.debug(`Using skill with index: ${skillIndex} from key: ${event.code} (key digit: ${keyDigit})`);
                    this.game.player.useSkill(skillIndex);
                    break;
                    
                case 'KeyE':
                    // Interact with objects using the new keyboard-based interaction method
                    this.handleInteractionWithNearestObject();
                    break;
                    
                case 'KeyG':
                    // Only allow starting a new game when the game is not already running
                    if (this.game.isPaused && document.getElementById('game-menu')) {
                        console.debug('G key pressed - starting new game');
                        
                        // Hide any existing game menu
                        const existingGameMenu = document.getElementById('game-menu');
                        if (existingGameMenu) {
                            existingGameMenu.style.display = 'none';
                        }
                        
                        // Hide any existing options menu
                        const existingOptionsMenu = document.getElementById('main-options-menu');
                        if (existingOptionsMenu) {
                            existingOptionsMenu.style.display = 'none';
                        }
                        
                        // Start the game
                        this.game.start();
                        
                        // Make sure settings button is visible
                        const homeButton = document.getElementById('home-button');
                        if (homeButton) {
                            homeButton.style.display = 'block';
                        }
                        
                        console.debug("Game started via G key - enemies and player are now active");
                    } else {
                        console.debug('G key pressed but game is already running or not at main menu');
                    }
                    break;
                    
                // Handle all alternative keys
                default:
                    // Check if this is an alternative key
                    if (this.keyMapping[event.code]) {
                        console.debug(`Alternative key ${event.code} pressed`);
                        
                        // Mark alternative skill key as held down
                        this.skillKeysHeld[event.code] = true;
                        
                        // Get the corresponding digit key
                        const mappedKey = this.keyMapping[event.code];
                        console.debug(`${event.code} mapped to: ${mappedKey}`);
                        
                        // Also mark the original key as held down for consistency
                        this.skillKeysHeld[mappedKey] = true;
                        
                        // Get the key digit from the mapped key
                        const altKeyDigit = parseInt(mappedKey.charAt(5));
                        
                        // On all devices, we subtract 1 to convert from 1-based to 0-based index
                        // This ensures consistent behavior across all devices
                        const altSkillIndex = altKeyDigit - 1;
                        
                        console.debug(`${event.code} skill index: ${altSkillIndex} (key digit: ${altKeyDigit})`);
                        
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
    
    // Method to handle interaction with objects in front of the player
    // This replaces the mouse-based interaction with keyboard-based interaction
    handleInteractionWithNearestObject() {
        // Set player interaction state to true
        this.game.player.setInteracting(true);
        
        // Get player position and forward direction
        const playerPosition = this.game.player.getPosition();
        const playerForward = this.game.player.getForwardDirection();
        
        // Define interaction range
        const interactionRange = 3; // Units in world space
        
        // Calculate interaction point in front of player
        const interactionPoint = new THREE.Vector3()
            .copy(playerPosition)
            .add(
                new THREE.Vector3()
                    .copy(playerForward)
                    .multiplyScalar(interactionRange)
            );
        
        // Get all interactive objects if they exist
        let interactiveObjects = [];
        if (this.game.world.interactiveManager && this.game.world.interactiveManager.getInteractiveObjects) {
            const objects = this.game.world.interactiveManager.getInteractiveObjects();
            if (objects && objects.length > 0) {
                interactiveObjects = objects;
            }
        } else if (this.game.world.interactiveObjects) {
            // Fallback to old structure if it exists
            console.warn('Using legacy interactiveObjects structure');
            interactiveObjects = this.game.world.interactiveObjects;
        } else {
            console.warn('No interactive objects manager found');
            // Reset interaction state after a short delay
            setTimeout(() => {
                this.game.player.setInteracting(false);
            }, 500);
            return;
        }
        
        // Find the nearest interactive object within range
        let nearestObject = null;
        let minDistance = interactionRange;
        
        for (const obj of interactiveObjects) {
            if (obj.mesh) {
                // Get object position
                const objPosition = new THREE.Vector3();
                obj.mesh.getWorldPosition(objPosition);
                
                // Calculate distance to player
                const distance = objPosition.distanceTo(playerPosition);
                
                // Check if this object is closer than the current nearest
                if (distance < minDistance) {
                    nearestObject = obj;
                    minDistance = distance;
                }
            }
        }
        
        // Interact with the nearest object if found
        if (nearestObject) {
            console.debug('Interacting with nearest object:', nearestObject);
            const result = nearestObject.onInteract();
            
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
                    case 'boss_spawn':
                        // Show boss spawn message
                        this.game.uiManager.showNotification(result.message);
                        break;
                }
            }
        } else {
            console.debug('No interactive objects within range');
            this.game.uiManager.showNotification('Nothing to interact with nearby');
        }
        
        // Reset interaction state after a short delay
        setTimeout(() => {
            this.game.player.setInteracting(false);
        }, 500);
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
    
    // Mouse target and state methods removed as per requirements
    
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
                            console.debug('Continuous casting: Basic attack (KeyH)');
                            this.game.player.usePrimaryAttack();
                            this.skillCastCooldowns[keyCode] = castInterval;
                        } else if (keyCode.startsWith('Digit')) {
                            // For number keys
                            const keyDigit = parseInt(keyCode.charAt(5));
                            // Subtract 1 to convert from 1-based to 0-based index
                            const skillIndex = keyDigit - 1;
                            console.debug('Continuous casting: Digit key', keyCode, 'Key digit:', keyDigit, 'Skill index:', skillIndex);
                            this.game.player.useSkill(skillIndex);
                            this.skillCastCooldowns[keyCode] = castInterval;
                        } else if (this.keyMapping && this.keyMapping[keyCode]) {
                            // For alternative keys (j,k,l,;,u,i,o)
                            const mappedKey = this.keyMapping[keyCode];
                            const keyDigit = parseInt(mappedKey.charAt(5));
                            // Subtract 1 to convert from 1-based to 0-based index
                            const skillIndex = keyDigit - 1;
                            console.debug('Continuous casting: Alternative key', keyCode, 'mapped to', mappedKey, 'Key digit:', keyDigit, 'Skill index:', skillIndex);
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