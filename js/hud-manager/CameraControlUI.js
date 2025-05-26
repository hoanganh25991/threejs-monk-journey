import { UIComponent } from '../UIComponent.js';
import * as THREE from 'three';

/**
 * Camera Control UI component
 * Provides drag-to-rotate camera controls for the game
 * Only active on the right half of the screen
 */
export class CameraControlUI extends UIComponent {
    /**
     * Create a new CameraControlUI component
     * @param {import("../game/Game.js").Game} game - Reference to the game instance
     */
    constructor(game) {
        super('game-container', game);
        
        // Initialize camera control state
        this.cameraState = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            rotationX: 0,
            rotationY: 0,
        };
        
        // Default camera distance (can be modified via settings)
        this.cameraDistance = 20;
        
        // Store the initial camera position and rotation
        this.initialCameraPosition = null;
        this.initialCameraRotation = null;
        
        // Visual indicator elements
        this.baseElement = null;
        this.handleElement = null;
        
        console.debug("CameraControlUI initialized with increased sensitivity");
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        // Create visual indicator elements
        this.createVisualIndicator();
        
        // Set up event listeners
        this.setupCameraControlEvents();
        
        // Store initial camera position and rotation
        if (this.game && this.game.camera) {
            this.initialCameraPosition = this.game.camera.position.clone();
            this.initialCameraRotation = this.game.camera.rotation.clone();
        }
        
        // Load camera distance from settings if available
        this.loadCameraSettings();
        
        return true;
    }
    
    /**
     * Load camera settings from localStorage
     */
    loadCameraSettings() {
        // Import storage keys
        import('../config/storage-keys.js').then(module => {
            const STORAGE_KEYS = module.STORAGE_KEYS;
            
            // Load camera zoom setting
            const storedZoom = localStorage.getItem(STORAGE_KEYS.CAMERA_ZOOM);
            if (storedZoom) {
                this.cameraDistance = parseInt(storedZoom);
                console.debug("Loaded camera distance from settings:", this.cameraDistance);
                
                // Apply the camera distance immediately if the game and player are available
                if (this.game && this.game.camera && this.game.player) {
                    // If we have rotation values, update the camera orbit
                    if (this.cameraState.rotationX !== undefined && this.cameraState.rotationY !== undefined) {
                        this.updateCameraOrbit(this.cameraState.rotationX, this.cameraState.rotationY);
                    } else {
                        // Otherwise, just set the initial position with the new distance
                        const playerPosition = this.game.player.getPosition();
                        if (playerPosition) {
                            // Calculate a default position behind the player
                            const defaultRotationX = 0.3; // Slight angle from horizontal
                            const defaultRotationY = Math.PI; // Behind the player
                            
                            // Store these as the initial rotation values
                            this.cameraState.rotationX = defaultRotationX;
                            this.cameraState.rotationY = defaultRotationY;
                            
                            // Update the camera position
                            this.updateCameraOrbit(defaultRotationX, defaultRotationY);
                        }
                    }
                }
            }
        }).catch(error => {
            console.error("Error loading storage keys:", error);
        });
    }
    
    /**
     * Get references to the visual indicator elements for camera control
     */
    createVisualIndicator() {
        // Get references to the existing elements in the DOM
        this.indicatorContainer = document.getElementById('camera-control-indicator');
        this.baseElement = document.getElementById('camera-control-base');
        this.handleElement = document.getElementById('camera-control-handle');
        
        // Ensure the indicator is initially hidden
        if (this.indicatorContainer) {
            this.indicatorContainer.style.display = 'none';
        }
    }
    
    /**
     * Set up camera control event listeners
     */
    setupCameraControlEvents() {
        // Get the game canvas element
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Game canvas not found');
            return;
        }
        
        // Touch start event
        canvas.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            
            // Only handle touches on the right half of the screen
            if (touch.clientX < window.innerWidth / 2) {
                return;
            }
            
            this.handleCameraControlStart(touch.clientX, touch.clientY);
            // Prevent default to avoid scrolling
            event.preventDefault();
        }, { passive: false });
        
        // Mouse down event (for testing on desktop)
        canvas.addEventListener('mousedown', (event) => {
            // Only handle clicks on the right half of the screen
            if (event.clientX < window.innerWidth / 2) {
                return;
            }
            
            this.handleCameraControlStart(event.clientX, event.clientY);
            
            // Add global mouse move and up events
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        });
        
        // Touch move event
        canvas.addEventListener('touchmove', (event) => {
            if (this.cameraState.active) {
                const touch = event.touches[0];
                this.handleCameraControlMove(touch.clientX, touch.clientY);
                // Prevent default to avoid scrolling
                event.preventDefault();
            }
        }, { passive: false });
        
        // Touch end event
        canvas.addEventListener('touchend', () => {
            this.handleCameraControlEnd();
        });
        
        // Touch cancel event
        canvas.addEventListener('touchcancel', () => {
            this.handleCameraControlEnd();
        });
        
        // Mouse move handler (defined as property to allow removal)
        this.handleMouseMove = (event) => {
            if (this.cameraState.active) {
                this.handleCameraControlMove(event.clientX, event.clientY);
            }
        };
        
        // Mouse up handler (defined as property to allow removal)
        this.handleMouseUp = () => {
            this.handleCameraControlEnd();
            
            // Remove global mouse move and up events
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
        };
    }
    
    /**
     * Handle camera control start event
     * @param {number} clientX - X position of touch/mouse
     * @param {number} clientY - Y position of touch/mouse
     */
    handleCameraControlStart(clientX, clientY) {
        console.debug("Camera control start:", {clientX, clientY});
        
        // Set camera control state
        this.cameraState.active = true;
        this.cameraState.startX = clientX;
        this.cameraState.startY = clientY;
        this.cameraState.currentX = clientX;
        this.cameraState.currentY = clientY;
        
        // Calculate the current camera rotation based on its position relative to the player
        if (this.game && this.game.camera && this.game.player) {
            const playerPosition = this.game.player.getPosition();
            const cameraPosition = this.game.camera.position;
            
            // Calculate the horizontal angle (around Y axis)
            // This is the angle in the XZ plane
            const dx = cameraPosition.x - playerPosition.x;
            const dz = cameraPosition.z - playerPosition.z;
            const horizontalAngle = Math.atan2(dx, dz);
            
            // Calculate the vertical angle (around X axis)
            // This is the angle from the XZ plane to the camera
            const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
            const dy = cameraPosition.y - (playerPosition.y + 10); // Adjust for height offset
            const verticalAngle = Math.atan2(dy, horizontalDistance);
            
            // Store the calculated angles
            this.cameraState.rotationY = horizontalAngle;
            this.cameraState.rotationX = verticalAngle;
            
            console.debug("Initial camera rotation calculated:", {
                x: this.cameraState.rotationX,
                y: this.cameraState.rotationY,
                verticalDegrees: THREE.MathUtils.radToDeg(verticalAngle),
                horizontalDegrees: THREE.MathUtils.radToDeg(horizontalAngle)
            });
            
            // Make sure orbit controls are enabled
            if (this.game.controls) {
                this.game.controls.enabled = true;
            }
        } else {
            // Fallback to using camera rotation directly if we can't calculate from position
            if (this.game && this.game.camera) {
                this.cameraState.rotationX = this.game.camera.rotation.x;
                this.cameraState.rotationY = this.game.camera.rotation.y;
                
                console.debug("Initial camera rotation (fallback):", {
                    x: this.cameraState.rotationX,
                    y: this.cameraState.rotationY
                });
            }
        }
        
        // Show and position the visual indicator
        this.showVisualIndicator(clientX, clientY);
    }
    
    /**
     * Show and position the visual indicator
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    showVisualIndicator(x, y) {
        if (!this.indicatorContainer) return;
        
        // Position the indicator container at the start position
        this.indicatorContainer.style.left = `${x}px`;
        this.indicatorContainer.style.top = `${y}px`;
        
        // Position the handle at the center of the base
        this.handleElement.style.left = '50%';
        this.handleElement.style.top = '50%';
        
        // Show the indicator
        this.indicatorContainer.style.display = 'block';
    }
    
    /**
     * Handle camera control move event
     * @param {number} clientX - X position of touch/mouse
     * @param {number} clientY - Y position of touch/mouse
     */
    handleCameraControlMove(clientX, clientY) {
        if (!this.cameraState.active || !this.game || !this.game.camera) return;
        
        // Calculate delta from CURRENT position (not start position)
        // This allows for continuous dragging to accumulate rotation
        const deltaX = clientX - this.cameraState.currentX;
        const deltaY = clientY - this.cameraState.currentY;
        
        // Update current position
        this.cameraState.currentX = clientX;
        this.cameraState.currentY = clientY;
        
        // Calculate new rotation based on delta and sensitivity
        // Use different sensitivity for horizontal and vertical movement
        const horizontalSensitivity = 0.005; // Reduced for left/right movement
        const verticalSensitivity = 0.005;    // Reduced for up/down movement
        
        // Calculate horizontal rotation (around Y axis)
        // Accumulate rotation from previous state
        const rotationY = this.cameraState.rotationY - deltaX * horizontalSensitivity;
        
        // Calculate vertical rotation (around X axis)
        // Allow full vertical rotation range from -89° to +89° (in radians)
        const maxVerticalRotation = THREE.MathUtils.degToRad(89);
        
        // Accumulate vertical rotation from previous state
        let newRotationX = this.cameraState.rotationX - deltaY * verticalSensitivity;
        
        // Clamp to prevent flipping
        newRotationX = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, newRotationX));
        
        // Store the new rotation values for next frame
        this.cameraState.rotationX = newRotationX;
        this.cameraState.rotationY = rotationY;
        
        // Log detailed information for debugging
        console.debug("Camera drag detected:", {
            deltaX, 
            deltaY, 
            rotationX: newRotationX, 
            rotationY,
            verticalDegrees: THREE.MathUtils.radToDeg(newRotationX), // Show degrees for easier debugging
            accumulatedVerticalDegrees: THREE.MathUtils.radToDeg(this.cameraState.rotationX)
        });
        
        // Update camera position to orbit around the player
        this.updateCameraOrbit(newRotationX, rotationY);
        
        // Update visual indicator
        this.updateVisualIndicator(clientX - this.cameraState.startX, clientY - this.cameraState.startY);
        
        // Prevent default behavior to avoid scrolling
        return false;
    }
    
    /**
     * Update the visual indicator based on drag distance
     * @param {number} deltaX - X distance from start position
     * @param {number} deltaY - Y distance from start position
     */
    updateVisualIndicator(deltaX, deltaY) {
        if (!this.handleElement) return;
        
        // Calculate distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Maximum distance the handle can move from center (in pixels)
        const maxDistance = 30;
        
        // Limit distance
        const limitedDistance = Math.min(distance, maxDistance);
        
        // Calculate normalized direction
        let normalizedX = 0;
        let normalizedY = 0;
        
        if (distance > 0) {
            normalizedX = deltaX / distance;
            normalizedY = deltaY / distance;
        }
        
        // Calculate new position
        const newX = normalizedX * limitedDistance;
        const newY = normalizedY * limitedDistance;
        
        // Update handle position
        this.handleElement.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`;
    }
    
    /**
     * Update camera position to orbit around the player
     * @param {number} rotationX - X rotation (vertical)
     * @param {number} rotationY - Y rotation (horizontal)
     */
    updateCameraOrbit(rotationX, rotationY) {
        console.debug("updateCameraOrbit", {rotationX, rotationY});
        if (!this.game || !this.game.camera || !this.game.player) {
            console.debug("Missing required references:", {
                game: !!this.game,
                camera: !!(this.game && this.game.camera),
                player: !!(this.game && this.game.player)
            });
            return;
        }
        
        // Get player position
        const playerPosition = this.game.player.getPosition();
        console.debug("Player position:", playerPosition);
        
        // Use the camera distance from settings or default
        const distance = this.cameraDistance;
        
        // Create a new THREE.Spherical to handle the orbital position calculation
        // This is a more reliable way to position a camera in an orbit
        const spherical = new THREE.Spherical(
            distance,                    // radius
            Math.PI/2 - rotationX,       // phi (vertical angle from top)
            rotationY                    // theta (horizontal angle)
        );
        
        // Convert spherical coordinates to cartesian
        const cameraOffset = new THREE.Vector3();
        cameraOffset.setFromSpherical(spherical);
        
        // Add the player position to get the final camera position
        const cameraPosition = new THREE.Vector3(
            playerPosition.x + cameraOffset.x,
            playerPosition.y + cameraOffset.y + 10, // Add height offset
            playerPosition.z + cameraOffset.z
        );
        
        console.debug("New camera position calculated:", cameraPosition);
        console.debug("Vertical angle in degrees:", THREE.MathUtils.radToDeg(rotationX));
        
        // Store original camera position for comparison
        const originalPosition = this.game.camera.position.clone();
        
        // Update camera position
        this.game.camera.position.copy(cameraPosition);
        
        console.debug("Camera position updated from:", originalPosition, "to:", this.game.camera.position);
        
        // Calculate look direction based on rotation
        // When looking up (positive rotationX), we want to look higher than the player's head
        // When looking down (negative rotationX), we want to look lower
        
        // Use a more dramatic vertical offset for extreme angles
        // This will make the sky more visible when looking up
        const verticalOffset = 5 + (rotationX * 50); // Increased multiplier for more dramatic effect
        
        // Look at position that changes with vertical rotation
        const lookAtPosition = new THREE.Vector3(
            playerPosition.x,
            playerPosition.y + verticalOffset, // Adjust vertical look target based on rotation
            playerPosition.z
        );
        this.game.camera.lookAt(lookAtPosition);
        
        console.debug("Camera lookAt set to:", lookAtPosition, "with vertical offset:", verticalOffset);
        
        // Update orbit controls target if available
        if (this.game.controls) {
            const originalTarget = this.game.controls.target.clone();
            
            this.game.controls.target.copy(lookAtPosition);
            
            console.debug("OrbitControls target updated from:", originalTarget, "to:", this.game.controls.target);
            
            // Check if controls are enabled
            console.debug("OrbitControls enabled:", this.game.controls.enabled);
            
            // Make sure controls are enabled and updated
            this.game.controls.enabled = true;
            this.game.controls.update();
            
            console.debug("OrbitControls updated");
        } else {
            console.debug("OrbitControls not available");
        }
        
        // Update player's view direction if needed
        if (this.game.player && typeof this.game.player.setLookDirection === 'function') {
            // Create a look direction vector directly from the rotation angles
            // This is more reliable than calculating from positions
            const lookDirection = new THREE.Vector3();
            
            // Use spherical coordinates to create a direction vector
            // This ensures the vertical component is correct
            const sphericalLook = new THREE.Spherical(
                1,                      // unit radius
                Math.PI/2 - rotationX,  // phi (vertical angle from top)
                rotationY               // theta (horizontal angle)
            );
            
            lookDirection.setFromSpherical(sphericalLook);
            
            // Log the raw rotation values for debugging
            console.debug("Creating look direction from rotations:", {
                rotationX: rotationX,
                rotationY: rotationY,
                verticalDegrees: THREE.MathUtils.radToDeg(rotationX),
                horizontalDegrees: THREE.MathUtils.radToDeg(rotationY)
            });
            
            // Update the player's look direction
            this.game.player.setLookDirection(lookDirection);
            console.debug("Player look direction updated to:", lookDirection);
        } else {
            console.debug("Player look direction update not available");
        }
        
        // Force a render to update the scene
        if (this.game.renderer) {
            // Disable orbit controls temporarily to prevent them from overriding our camera position
            const orbitControlsEnabled = this.game.controls ? this.game.controls.enabled : false;
            if (this.game.controls) {
                this.game.controls.enabled = false;
            }
            
            // Force the camera to update its matrix
            this.game.camera.updateMatrixWorld(true);
            
            // Force a render with our camera settings
            this.game.renderer.render(this.game.scene, this.game.camera);
            
            // Restore orbit controls state
            if (this.game.controls) {
                this.game.controls.enabled = orbitControlsEnabled;
            }
            
            console.debug("Forced scene render with camera matrix update");
        } else {
            console.debug("Game renderer not available");
        }
        
        // Set a flag to ensure the camera position is maintained in the next frame
        this.cameraUpdatePending = true;
    }
    
    /**
     * Handle camera control end event
     */
    handleCameraControlEnd() {
        // Reset camera control state
        this.cameraState.active = false;
        
        // Hide the visual indicator
        if (this.indicatorContainer) {
            this.indicatorContainer.style.display = 'none';
        }
        
        // Check if the drag was minimal (user just tapped or made a very small movement)
        const dragDistanceX = Math.abs(this.cameraState.currentX - this.cameraState.startX);
        const dragDistanceY = Math.abs(this.cameraState.currentY - this.cameraState.startY);
        const minDragDistance = 5; // Threshold in pixels
        
        if (dragDistanceX < minDragDistance && dragDistanceY < minDragDistance) {
            // If it was just a tap or minimal movement, reset to the initial camera position
            // This allows users to quickly return to the default view
            if (this.initialCameraPosition && this.initialCameraRotation && this.game && this.game.camera) {
                // Calculate the initial rotation values based on the initial position
                if (this.game.player) {
                    const playerPosition = this.game.player.getPosition();
                    const initialPos = this.initialCameraPosition;
                    
                    // Calculate the horizontal angle (around Y axis)
                    const dx = initialPos.x - playerPosition.x;
                    const dz = initialPos.z - playerPosition.z;
                    const horizontalAngle = Math.atan2(dx, dz);
                    
                    // Calculate the vertical angle (around X axis)
                    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
                    const dy = initialPos.y - (playerPosition.y + 10);
                    const verticalAngle = Math.atan2(dy, horizontalDistance);
                    
                    // Store the calculated angles
                    this.cameraState.rotationY = horizontalAngle;
                    this.cameraState.rotationX = verticalAngle;
                    
                    // Update camera to the initial position
                    this.updateCameraOrbit(verticalAngle, horizontalAngle);
                }
            }
        }
        
        // Keep the camera update pending flag true
        // This ensures the camera position is maintained even after the control is released
        // The player should be able to look around and maintain that view
    }
    
    /**
     * Update method called every frame
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Check if we have a pending camera update from the last frame
        if (this.cameraUpdatePending && this.game && this.game.camera && this.game.player) {
            // Get the current camera state
            const rotationX = this.cameraState.rotationX;
            const rotationY = this.cameraState.rotationY;
            
            // Only update if we have valid rotation values
            if (rotationX !== undefined && rotationY !== undefined) {
                // Get player position
                const playerPosition = this.game.player.getPosition();
                
                // Use the camera distance from settings or default
                const distance = this.cameraDistance;
                
                // Create a new THREE.Spherical to handle the orbital position calculation
                const spherical = new THREE.Spherical(
                    distance,                    // radius
                    Math.PI/2 - rotationX,       // phi (vertical angle from top)
                    rotationY                    // theta (horizontal angle)
                );
                
                // Convert spherical coordinates to cartesian
                const cameraOffset = new THREE.Vector3();
                cameraOffset.setFromSpherical(spherical);
                
                // Add the player position to get the final camera position
                const cameraPosition = new THREE.Vector3(
                    playerPosition.x + cameraOffset.x,
                    playerPosition.y + cameraOffset.y + 10, // Add height offset
                    playerPosition.z + cameraOffset.z
                );
                
                // Update camera position
                this.game.camera.position.copy(cameraPosition);
                
                // Calculate look direction based on rotation
                const verticalOffset = 5 + (rotationX * 50); // Same as in updateCameraOrbit
                
                // Look at position that changes with vertical rotation
                const lookAtPosition = new THREE.Vector3(
                    playerPosition.x,
                    playerPosition.y + verticalOffset,
                    playerPosition.z
                );
                
                // Update camera look-at
                this.game.camera.lookAt(lookAtPosition);
                
                // Update orbit controls target if available
                if (this.game.controls) {
                    this.game.controls.target.copy(lookAtPosition);
                }
                
                // Force the camera to update its matrix
                this.game.camera.updateMatrixWorld(true);
                
                // Log that we're maintaining the camera position
                console.debug("Maintaining camera position in update loop");
            }
        }
    }
    
    /**
     * Set the camera distance and update the camera position
     * @param {number} distance - New camera distance
     */
    setCameraDistance(distance) {
        // Update the camera distance
        this.cameraDistance = distance;
        console.debug("Camera distance set to:", distance);
        
        // Apply the new distance if we have rotation values
        if (this.cameraState.rotationX !== undefined && this.cameraState.rotationY !== undefined) {
            this.updateCameraOrbit(this.cameraState.rotationX, this.cameraState.rotationY);
        }
        
        // Save the setting to localStorage
        import('../config/storage-keys.js').then(module => {
            const STORAGE_KEYS = module.STORAGE_KEYS;
            localStorage.setItem(STORAGE_KEYS.CAMERA_ZOOM, distance);
        }).catch(error => {
            console.error("Error saving camera distance to localStorage:", error);
        });
    }
    
    /**
     * Remove event listeners when component is disposed
     */
    removeEventListeners() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            // We can't remove anonymous function listeners directly
            // But we can ensure the indicator is hidden
        }
        
        // We can remove the named handlers we stored as properties
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        // Hide the indicator instead of removing it
        if (this.indicatorContainer) {
            this.indicatorContainer.style.display = 'none';
        }
    }
}