import { UIComponent } from '../UIComponent.js';

/**
 * Camera Control UI component
 * Provides drag-to-rotate camera controls for the game
 * Only active on the right half of the screen
 */
export class CameraControlUI extends UIComponent {
    /**
     * Create a new CameraControlUI component
     * @param {Object} game - Reference to the game instance
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
            sensitivity: 0.005 // Adjust this value to control rotation sensitivity
        };
        
        // Store the initial camera position and rotation
        this.initialCameraPosition = null;
        this.initialCameraRotation = null;
        
        // Visual indicator elements
        this.baseElement = null;
        this.handleElement = null;
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
        
        return true;
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
        // Set camera control state
        this.cameraState.active = true;
        this.cameraState.startX = clientX;
        this.cameraState.startY = clientY;
        this.cameraState.currentX = clientX;
        this.cameraState.currentY = clientY;
        
        // Store current camera rotation
        if (this.game && this.game.camera) {
            this.cameraState.rotationX = this.game.camera.rotation.x;
            this.cameraState.rotationY = this.game.camera.rotation.y;
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
        
        // Calculate delta from start position
        const deltaX = clientX - this.cameraState.startX;
        const deltaY = clientY - this.cameraState.startY;
        
        // Update current position
        this.cameraState.currentX = clientX;
        this.cameraState.currentY = clientY;
        
        // Calculate new rotation based on delta and sensitivity
        const rotationY = this.cameraState.rotationY - deltaX * this.cameraState.sensitivity;
        
        // Limit vertical rotation to prevent flipping
        const maxVerticalRotation = Math.PI / 4; // 45 degrees
        const rotationX = Math.max(
            -maxVerticalRotation,
            Math.min(
                maxVerticalRotation,
                this.cameraState.rotationX - deltaY * this.cameraState.sensitivity
            )
        );
        
        // Update camera position to orbit around the player
        this.updateCameraOrbit(rotationX, rotationY);
        
        // Update visual indicator
        this.updateVisualIndicator(deltaX, deltaY);
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
        if (!this.game || !this.game.camera || !this.game.player) return;
        
        // Get player position
        const playerPosition = this.game.player.getPosition();
        
        // Calculate camera distance from player
        const distance = 20; // Adjust this value to control camera distance
        
        // Calculate new camera position based on rotation
        const x = playerPosition.x + distance * Math.sin(rotationY) * Math.cos(rotationX);
        const y = playerPosition.y + distance * Math.sin(rotationX) + 10; // Add height offset
        const z = playerPosition.z + distance * Math.cos(rotationY) * Math.cos(rotationX);
        
        // Update camera position
        this.game.camera.position.set(x, y, z);
        
        // Look at player
        this.game.camera.lookAt(
            playerPosition.x,
            playerPosition.y + 5, // Look at player's head
            playerPosition.z
        );
        
        // Update orbit controls target if available
        if (this.game.controls) {
            this.game.controls.target.set(
                playerPosition.x,
                playerPosition.y + 5,
                playerPosition.z
            );
        }
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
    }
    
    /**
     * Update method called every frame
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        // Nothing to update here as camera position is updated in handleCameraControlMove
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