import * as THREE from 'three';

/**
 * TeleportManager - Manages teleport portals in the game world
 */
export class TeleportManager {
    /**
     * Create a new TeleportManager
     * @param {THREE.Scene} scene - The Three.js scene
     * @param {WorldManager} worldManager - Reference to the world manager
     */
    constructor(scene, worldManager) {
        this.scene = scene;
        this.worldManager = worldManager;
        this.game = null;
        
        // Array to store all teleport portals
        this.portals = [];
        
        // Portal visual properties
        this.portalRadius = 3;
        this.portalHeight = 0.5;
        this.portalColor = 0x00ffff; // Cyan color
        this.portalEmissiveColor = 0x00ffff;
        this.portalEmissiveIntensity = 0.8;
        
        // Portal animation properties
        this.animationSpeed = 1.5;
        this.hoverHeight = 0.5;
        this.rotationSpeed = 0.01;
        
        // Portal interaction properties
        this.interactionRadius = 4; // Player must be within this distance to trigger teleport
        this.teleportCooldown = 3000; // 3 seconds cooldown between teleports
        this.lastTeleportTime = 0;
        this.activePortal = null; // Currently active portal for interaction
        
        // Portal effect properties
        this.effectDuration = 2000; // 2 seconds teleport effect for longer distances
        this.fadeOutDuration = 1000; // 1 second fade out
        this.fadeInDuration = 1000; // 1 second fade in
        
        // Minimap properties
        this.minimapColor = 'rgba(0, 255, 255, 0.8)'; // Cyan color for minimap
        this.minimapSize = 6; // Size on minimap
        
        // Setup click/touch event listeners
        this.setupTouchClickEvents();
    }
    
    /**
     * Set the game reference
     * @param {Game} game - The game instance
     */
    setGame(game) {
        this.game = game;
    }
    
    /**
     * Setup touch and click event listeners for portal interaction
     */
    setupTouchClickEvents() {
        // Add click/touch event listener to the canvas
        const canvas = document.querySelector('canvas');
        if (canvas) {
            // Use both click and touchend events for better cross-device support
            canvas.addEventListener('click', this.handleTouchClick.bind(this));
            canvas.addEventListener('touchend', this.handleTouchClick.bind(this));
            console.debug('Touch/click event listeners added for portal interaction');
        } else {
            console.warn('Canvas not found, touch/click events for portals not initialized');
            // Try again when the DOM is fully loaded
            window.addEventListener('DOMContentLoaded', () => {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                    canvas.addEventListener('click', this.handleTouchClick.bind(this));
                    canvas.addEventListener('touchend', this.handleTouchClick.bind(this));
                    console.debug('Touch/click event listeners added on DOMContentLoaded');
                }
            });
        }
    }
    
    /**
     * Handle touch or click events for portal interaction
     * @param {Event} event - The touch or click event
     */
    handleTouchClick(event) {
        // Skip if no active portal or on cooldown
        if (!this.activePortal || Date.now() - this.lastTeleportTime < this.teleportCooldown) {
            return;
        }
        
        // Prevent default behavior for touch events
        if (event.type === 'touchend') {
            event.preventDefault();
        }
        
        console.debug('Touch/click detected with active portal - teleporting player');
        this.teleportPlayer(this.activePortal);
    }
    
    /**
     * Initialize the teleport manager
     */
    init() {
        console.debug("Initializing teleport manager...");
        
        // Reset active portal
        this.activePortal = null;
        
        // Create default portals if none exist
        if (this.portals.length === 0) {
            this.createDefaultPortals();
            
            // Also create a teleport network
            this.createTeleportNetwork(3, 2000, 200, 0);
        }
        
        // Re-setup touch/click events to ensure they're properly bound
        this.setupTouchClickEvents();
        
        return true;
    }
    
    /**
     * Create a network of interconnected teleport portals
     * @param {number} portalCount - Number of portals in the network
     * @param {number} radius - Radius of the circle on which to place portals
     * @param {number} height - Height above ground for the network
     * @param {number} yOffset - Y-axis offset for the entire network
     */
    createTeleportNetwork(portalCount = 5, radius = 3000, height = 0, yOffset = 0) {
        console.debug(`Creating teleport network with ${portalCount} portals at radius ${radius}`);
        
        const networkPortals = [];
        const centerPoint = new THREE.Vector3(0, height + yOffset, 0);
        
        // Create portals in a circle
        for (let i = 0; i < portalCount; i++) {
            const angle = (i / portalCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const portalPosition = new THREE.Vector3(x, height + yOffset, z);
            
            // Create a portal with a temporary target (will be updated later)
            const portal = this.createPortal(
                portalPosition,
                centerPoint, // Temporary target
                `Network Node ${i + 1}`,
                `Network Destination ${i + 1}`
            );
            
            networkPortals.push(portal);
        }
        
        // Connect portals in a circular pattern (each portal leads to the next)
        for (let i = 0; i < networkPortals.length; i++) {
            const currentPortal = networkPortals[i];
            const nextPortal = networkPortals[(i + 1) % networkPortals.length];
            
            // Update the target position to the next portal in the network
            currentPortal.targetPosition.copy(nextPortal.sourcePosition);
            currentPortal.targetName = nextPortal.sourceName;
            
            console.debug(`Connected ${currentPortal.sourceName} to ${currentPortal.targetName}`);
        }
        
        return networkPortals;
    }
    
    /**
     * Create default teleport portals
     */
    createDefaultPortals() {
        // Create portals with 10x farther destinations
        
        // Portal 1: Near starting area (original but with 10x farther destination)
        this.createPortal(
            new THREE.Vector3(10, 0, 10),
            new THREE.Vector3(1000, 0, 1000), // 10x farther
            "Temple Entrance",
            "Distant Mountain Peak"
        );
        
        // Portal 2: Far away location (original but with 10x farther destination)
        this.createPortal(
            new THREE.Vector3(-80, 0, -80),
            new THREE.Vector3(500, 0, -1200), // 10x farther
            "Forest Clearing",
            "Far Desert Oasis"
        );
        
        // Portal 3: Another interesting location (original but with 10x farther destination)
        this.createPortal(
            new THREE.Vector3(120, 0, -50),
            new THREE.Vector3(-1000, 0, 800), // 10x farther
            "Waterfall",
            "Distant Ancient Ruins"
        );
        
        // Add new portals with even farther destinations
        
        // Portal 4: Extreme distance portal
        this.createPortal(
            new THREE.Vector3(50, 0, 50),
            new THREE.Vector3(5000, 0, 5000), // 50x farther than original
            "Mystic Gateway",
            "Celestial Realm"
        );
        
        // Portal 5: Another extreme distance portal
        this.createPortal(
            new THREE.Vector3(-50, 0, 50),
            new THREE.Vector3(-5000, 0, -5000), // 50x farther
            "Void Portal",
            "Shadow Dimension"
        );
        
        // Portal 6: Ultra-long distance portal
        this.createPortal(
            new THREE.Vector3(0, 0, 100),
            new THREE.Vector3(10000, 0, 0), // 100x farther
            "Astral Gateway",
            "Edge of Reality"
        );
        
        // Portal 7: Diagonal extreme distance
        this.createPortal(
            new THREE.Vector3(100, 0, 0),
            new THREE.Vector3(-10000, 0, 10000), // 100x farther
            "Quantum Tunnel",
            "Parallel Universe"
        );
    }
    
    /**
     * Create a new teleport portal
     * @param {THREE.Vector3} sourcePosition - The position of the source portal
     * @param {THREE.Vector3} targetPosition - The position to teleport to
     * @param {string} sourceName - Name of the source portal
     * @param {string} targetName - Name of the target location
     * @returns {Object} - The created portal object
     */
    createPortal(sourcePosition, targetPosition, sourceName, targetName) {
        // Adjust Y position based on terrain height
        if (this.worldManager && this.worldManager.getTerrainHeight) {
            sourcePosition.y = this.worldManager.getTerrainHeight(sourcePosition.x, sourcePosition.z) + 0.5;
            targetPosition.y = this.worldManager.getTerrainHeight(targetPosition.x, targetPosition.z) + 0.5;
        }
        
        // Elevate the source position (this will affect the portal's height)
        sourcePosition.y += 2.8;  
        
        // Create portal geometry
        const geometry = new THREE.CylinderGeometry(
            this.portalRadius, // Top radius
            this.portalRadius, // Bottom radius
            this.portalHeight, // Height
            32, // Radial segments
            1, // Height segments
            false // Open ended
        );
        
        // Create portal material with glow effect
        const material = new THREE.MeshStandardMaterial({
            color: this.portalColor,
            transparent: true,
            opacity: 0.7,
            emissive: this.portalEmissiveColor,
            emissiveIntensity: this.portalEmissiveIntensity,
            side: THREE.DoubleSide
        });
        
        // Create portal mesh
        const portalMesh = new THREE.Mesh(geometry, material);
        portalMesh.position.copy(sourcePosition);
        portalMesh.rotation.x = Math.PI / 2; // Lay flat on the ground
        
        // Add to scene
        this.scene.add(portalMesh);
        
        // Create particle effect for the portal
        const particles = this.createPortalParticles(sourcePosition);
        
        // Create portal object
        const portal = {
            id: `portal_${this.portals.length}`,
            sourceName: sourceName || `Portal ${this.portals.length + 1}`,
            targetName: targetName || `Destination ${this.portals.length + 1}`,
            sourcePosition: sourcePosition.clone(),
            targetPosition: targetPosition.clone(),
            mesh: portalMesh,
            particles: particles,
            creationTime: Date.now(),
            lastInteractionTime: 0
        };
        
        // Add to portals array
        this.portals.push(portal);
        
        console.debug(`Created teleport portal from "${portal.sourceName}" to "${portal.targetName}"`);
        
        return portal;
    }
    
    /**
     * Create particle effect for a portal
     * @param {THREE.Vector3} position - The position of the portal
     * @returns {THREE.Points} - The particle system
     */
    createPortalParticles(position) {
        // Create particle geometry
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        // Initialize particle positions in a circle around the portal
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = this.portalRadius * (0.5 + Math.random() * 0.5);
            const x = position.x + Math.cos(angle) * radius;
            const y = position.y + Math.random() * this.portalHeight;
            const z = position.z + Math.sin(angle) * radius;
            
            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        // Create particle material
        const particleMaterial = new THREE.PointsMaterial({
            color: this.portalColor,
            size: 0.3,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        // Create particle system
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        
        // Add to scene
        this.scene.add(particles);
        
        return particles;
    }
    
    /**
     * Update all portals
     * @param {number} deltaTime - Time since last update in seconds
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    update(deltaTime, playerPosition) {
        // Skip if no portals or no player
        if (this.portals.length === 0 || !playerPosition) return;
        
        // Current time for animations
        const time = Date.now() / 1000;
        
        // Update each portal
        this.portals.forEach(portal => {
            // Animate portal
            this.animatePortal(portal, time);
            
            // Check for player interaction
            this.checkPlayerInteraction(portal, playerPosition);
        });
    }
    
    /**
     * Animate a portal
     * @param {Object} portal - The portal to animate
     * @param {number} time - Current time in seconds
     */
    animatePortal(portal, time) {
        if (!portal.mesh) return;
        
        // Hover animation
        portal.mesh.position.y = portal.sourcePosition.y + 
            Math.sin(time * this.animationSpeed) * this.hoverHeight;
        
        // Rotation animation
        portal.mesh.rotation.z += this.rotationSpeed;
        
        // Animate particles
        if (portal.particles) {
            const positions = portal.particles.geometry.attributes.position.array;
            const particleCount = positions.length / 3;
            
            for (let i = 0; i < particleCount; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;
                
                // Calculate angle and radius for this particle
                const angle = (i / particleCount) * Math.PI * 2 + time * this.animationSpeed;
                const radius = this.portalRadius * (0.5 + Math.sin(time + i) * 0.2);
                
                // Update particle position
                positions[ix] = portal.sourcePosition.x + Math.cos(angle) * radius;
                positions[iy] = portal.sourcePosition.y + 0.5 + Math.sin(time * 2 + i) * 0.3;
                positions[iz] = portal.sourcePosition.z + Math.sin(angle) * radius;
            }
            
            // Mark the attribute as needing an update
            portal.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    /**
     * Check for player interaction with a portal
     * @param {Object} portal - The portal to check
     * @param {THREE.Vector3} playerPosition - Current player position
     */
    checkPlayerInteraction(portal, playerPosition) {
        // Calculate distance to portal
        const distance = playerPosition.distanceTo(portal.sourcePosition);
        
        // Check if player is within interaction radius
        if (distance <= this.interactionRadius) {
            // Check cooldown
            const currentTime = Date.now();
            if (currentTime - this.lastTeleportTime < this.teleportCooldown) {
                return; // Still on cooldown
            }
            
            // Check if this is a new interaction (not already standing in portal)
            if (currentTime - portal.lastInteractionTime > 1000) {
                portal.lastInteractionTime = currentTime;
                
                // Show teleport prompt
                if (this.game && this.game.hudManager) {
                    this.game.hudManager.showNotification(
                        `${portal.targetName}`,
                        5000
                    );
                }
                
                // Store the active portal for click/touch interaction
                this.activePortal = portal;
                
                // Check for key press (handled by game's input manager)
                if (this.game && this.game.inputManager) {
                    // Check if E key is pressed
                    if (this.game.inputManager.isKeyPressed('KeyE')) {
                        console.debug('E key pressed - teleporting player');
                        this.teleportPlayer(portal);
                    }
                }
            }
        } else {
            // Player moved away from portal
            if (portal === this.activePortal) {
                this.activePortal = null;
            }
        }
    }
    
    /**
     * Teleport the player to the target location
     * @param {Object} portal - The portal to teleport through
     */
    teleportPlayer(portal) {
        // Skip if no game or player
        if (!this.game || !this.game.player) {
            console.error("Cannot teleport: game or player is null");
            return;
        }
        
        console.debug(`Starting teleport from ${portal.sourceName} to ${portal.targetName}`);
        console.debug(`Current player position: ${this.game.player.getPosition().x}, ${this.game.player.getPosition().y}, ${this.game.player.getPosition().z}`);
        console.debug(`Target position: ${portal.targetPosition.x}, ${portal.targetPosition.y}, ${portal.targetPosition.z}`);
        
        // Set cooldown
        this.lastTeleportTime = Date.now();
        
        // Show teleport effect
        this.showTeleportEffect(portal);
        
        // Teleport the player after a short delay
        setTimeout(() => {
            // Ensure target position has correct terrain height
            let targetY = portal.targetPosition.y;
            
            // If we have terrain height information, use it
            if (this.worldManager && this.worldManager.getTerrainHeight) {
                targetY = this.worldManager.getTerrainHeight(portal.targetPosition.x, portal.targetPosition.z) + 0.5;
                console.debug(`Adjusted target height to terrain: ${targetY}`);
            }
            
            // Move player to target position
            // Extract x, y, z coordinates from the Vector3 object
            this.game.player.setPosition(
                portal.targetPosition.x,
                targetY,
                portal.targetPosition.z
            );
            
            // Force update the player's target position if it has one
            if (this.game.player.movement && this.game.player.movement.targetPosition) {
                this.game.player.movement.targetPosition.set(
                    portal.targetPosition.x,
                    targetY,
                    portal.targetPosition.z
                );
            }
            
            // Also update the player's model position directly if available
            if (this.game.player.model && typeof this.game.player.model.setPosition === 'function') {
                const position = new THREE.Vector3(portal.targetPosition.x, targetY, portal.targetPosition.z);
                this.game.player.model.setPosition(position);
                console.debug('Updated player model position directly');
            }
            
            console.debug(`Teleported player to: ${portal.targetPosition.x}, ${targetY}, ${portal.targetPosition.z}`);
            
            // Force an immediate camera update if the player has a movement component
            if (this.game.player.movement && typeof this.game.player.movement.updateCamera === 'function') {
                this.game.player.movement.updateCamera();
                console.debug('Forced camera update after teleport');
            }
            
            // Show arrival notification
            if (this.game && this.game.hudManager) {
                this.game.hudManager.showNotification(
                    `Arrived at ${portal.targetName}`,
                    3000
                );
            }
            
            // Zoom out minimap temporarily to show both locations
            if (this.game && this.game.hudManager && 
                this.game.hudManager.components && 
                this.game.hudManager.components.miniMapUI) {
                
                const miniMap = this.game.hudManager.components.miniMapUI;
                
                // Store original scale
                const originalScale = miniMap.scale;
                
                // Calculate zoom factor based on distance
                const distance = portal.sourcePosition.distanceTo(portal.targetPosition);
                const zoomFactor = Math.min(10, Math.max(3, Math.floor(distance / 500)));
                
                console.debug(`Teleport distance: ${distance.toFixed(2)}, using zoom factor: ${zoomFactor}`);
                
                // Zoom out based on distance
                miniMap.setScale(originalScale * zoomFactor);
                
                // Zoom back in after 8 seconds for longer distances
                setTimeout(() => {
                    miniMap.setScale(originalScale);
                }, 8000);
            }
        }, this.effectDuration);
    }
    
    /**
     * Show teleport effect
     * @param {Object} portal - The portal being used
     */
    showTeleportEffect(portal) {
        // Skip if no game or player
        if (!this.game || !this.game.player) return;
        
        // Calculate distance to determine effect intensity
        const distance = portal.sourcePosition.distanceTo(portal.targetPosition);
        const isLongDistance = distance > 1000;
        const isExtremeDistance = distance > 5000;
        
        console.debug(`Teleport distance: ${distance.toFixed(2)}, long: ${isLongDistance}, extreme: ${isExtremeDistance}`);
        
        // Create a flash effect
        if (this.game.hudManager) {
            // Create a full-screen flash element
            const flash = document.createElement('div');
            flash.style.position = 'fixed';
            flash.style.top = '0';
            flash.style.left = '0';
            flash.style.width = '100%';
            flash.style.height = '100%';
            flash.style.backgroundColor = 'rgba(0, 255, 255, 0)';
            flash.style.transition = `background-color ${this.fadeOutDuration / 1000}s ease-in-out`;
            flash.style.pointerEvents = 'none';
            flash.style.zIndex = '9999';
            
            // Add to DOM
            document.body.appendChild(flash);
            
            // For extreme distances, add a more dramatic effect
            if (isExtremeDistance) {
                // Add pulsing stars for extreme distances
                const starsContainer = document.createElement('div');
                starsContainer.style.position = 'fixed';
                starsContainer.style.top = '0';
                starsContainer.style.left = '0';
                starsContainer.style.width = '100%';
                starsContainer.style.height = '100%';
                starsContainer.style.pointerEvents = 'none';
                starsContainer.style.zIndex = '10000';
                
                // Create 100 stars
                for (let i = 0; i < 100; i++) {
                    const star = document.createElement('div');
                    star.style.position = 'absolute';
                    star.style.width = `${Math.random() * 4 + 1}px`;
                    star.style.height = star.style.width;
                    star.style.backgroundColor = 'white';
                    star.style.borderRadius = '50%';
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    star.style.opacity = '0';
                    star.style.animation = `starPulse ${Math.random() * 1 + 0.5}s ease-in-out infinite alternate`;
                    
                    // Add keyframe animation
                    const style = document.createElement('style');
                    style.innerHTML = `
                        @keyframes starPulse {
                            0% { opacity: 0; transform: scale(0.5); }
                            100% { opacity: 1; transform: scale(1.5); }
                        }
                    `;
                    document.head.appendChild(style);
                    
                    starsContainer.appendChild(star);
                }
                
                document.body.appendChild(starsContainer);
                
                // Remove stars after effect
                setTimeout(() => {
                    document.body.removeChild(starsContainer);
                }, this.effectDuration + 500);
            }
            
            // Fade in with color based on distance
            setTimeout(() => {
                if (isExtremeDistance) {
                    flash.style.backgroundColor = 'rgba(255, 0, 255, 0.8)'; // Purple for extreme distances
                } else if (isLongDistance) {
                    flash.style.backgroundColor = 'rgba(0, 100, 255, 0.8)'; // Blue for long distances
                } else {
                    flash.style.backgroundColor = 'rgba(0, 255, 255, 0.7)'; // Original cyan
                }
            }, 10);
            
            // Fade out
            setTimeout(() => {
                flash.style.backgroundColor = 'rgba(0, 255, 255, 0)';
                
                // Remove after fade out
                setTimeout(() => {
                    document.body.removeChild(flash);
                }, this.fadeInDuration);
            }, this.fadeOutDuration);
        }
        
        // Play teleport sound if available
        if (this.game.audioManager) {
            // Adjust volume based on distance
            const volume = isExtremeDistance ? 0.8 : (isLongDistance ? 0.7 : 0.5);
            this.game.audioManager.playSound('teleport', volume);
            
            // For extreme distances, add a second sound effect
            if (isExtremeDistance && this.game.audioManager.playSound) {
                setTimeout(() => {
                    this.game.audioManager.playSound('teleport', 0.4);
                }, 300);
            }
        }
    }
    
    /**
     * Get all portals for the minimap
     * @returns {Array} - Array of portal objects for the minimap
     */
    getPortals() {
        return this.portals.map(portal => ({
            position: portal.sourcePosition,
            targetPosition: portal.targetPosition,
            name: portal.sourceName,
            targetName: portal.targetName,
            type: 'portal'
        }));
    }
    
    /**
     * Remove a portal
     * @param {string} portalId - ID of the portal to remove
     */
    removePortal(portalId) {
        const portalIndex = this.portals.findIndex(p => p.id === portalId);
        
        if (portalIndex !== -1) {
            const portal = this.portals[portalIndex];
            
            // Remove from scene
            if (portal.mesh) {
                this.scene.remove(portal.mesh);
                portal.mesh.geometry.dispose();
                portal.mesh.material.dispose();
            }
            
            // Remove particles
            if (portal.particles) {
                this.scene.remove(portal.particles);
                portal.particles.geometry.dispose();
                portal.particles.material.dispose();
            }
            
            // Remove from array
            this.portals.splice(portalIndex, 1);
            
            console.debug(`Removed teleport portal: ${portal.sourceName}`);
        }
    }
    
    /**
     * Clear all portals
     */
    clear() {
        // Remove all portals from scene
        this.portals.forEach(portal => {
            if (portal.mesh) {
                this.scene.remove(portal.mesh);
                portal.mesh.geometry.dispose();
                portal.mesh.material.dispose();
            }
            
            if (portal.particles) {
                this.scene.remove(portal.particles);
                portal.particles.geometry.dispose();
                portal.particles.material.dispose();
            }
        });
        
        // Clear array and reset active portal
        this.portals = [];
        this.activePortal = null;
        
        console.debug("Cleared all teleport portals");
    }
}