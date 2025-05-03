import * as THREE from 'three';

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
        
        // Track skill keys being held down
        this.skillKeysHeld = {
            Digit1: false,
            Digit2: false,
            Digit3: false,
            Digit4: false,
            Digit5: false,
            Digit6: false,
            Digit7: false
        };
        
        // Cooldown tracking for continuous casting
        this.skillCastCooldowns = {
            Digit1: 0,
            Digit2: 0,
            Digit3: 0,
            Digit4: 0,
            Digit5: 0,
            Digit6: 0,
            Digit7: 0
        };
        
        // Initialize input event listeners
        this.initKeyboardEvents();
        this.initMouseEvents();
    }
    
    initKeyboardEvents() {
        // Key down event
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Handle special key presses
            switch (event.code) {
                case 'KeyI':
                    // Toggle inventory
                    this.game.uiManager.toggleInventory();
                    break;
                case 'Escape':
                    // Toggle pause menu
                    this.game.uiManager.togglePauseMenu();
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
                    const skillIndex = parseInt(event.code.charAt(5)) - 1;
                    this.game.player.useSkill(skillIndex);
                    break;
                case 'KeyE':
                    // Interact with objects
                    this.game.player.interact();
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
                    // Move player to target location
                    if (this.mouse.target) {
                        this.game.player.moveTo(this.mouse.target);
                    }
                    
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
        
        // First check for intersections with terrain
        const terrainIntersects = this.raycaster.intersectObject(this.game.world.terrain);
        
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
        
        // Get all interactive objects
        const interactiveObjects = this.game.world.interactiveObjects.map(obj => obj.mesh);
        
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
            const interactiveObject = this.game.world.interactiveObjects.find(obj => obj.mesh === parentMesh);
            
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
        // Handle continuous skill casting for held keys
        const castInterval = 0.1; // Cast every 0.1 seconds when key is held
        
        for (const keyCode in this.skillKeysHeld) {
            if (this.skillKeysHeld[keyCode]) {
                // Reduce cooldown
                this.skillCastCooldowns[keyCode] -= delta;
                
                // If cooldown is up, cast the skill again
                if (this.skillCastCooldowns[keyCode] <= 0) {
                    const skillIndex = parseInt(keyCode.charAt(5)) - 1;
                    this.game.player.useSkill(skillIndex);
                    
                    // Reset cooldown
                    this.skillCastCooldowns[keyCode] = castInterval;
                }
            }
        }
    }
}