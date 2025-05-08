import { UIComponent } from '../UIComponent.js';

/**
 * Mini Map UI component
 * Displays a simplified top-down view of the game world
 * 
 * CSS classes used:
 * - #mini-map-container: Outer container for the mini map and header
 * - #mini-map-header: Header text for the mini map (stays visible when map is toggled)
 * - #mini-map: Container for the mini map canvas (can be toggled)
 * - #mini-map-canvas: Canvas element for rendering the circular map
 */
export class MiniMapUI extends UIComponent {
    /**
     * Create a new MiniMapUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('mini-map-container', game);
        this.mapElement = null;
        this.headerElement = null;
        this.canvas = null;
        this.ctx = null;
        this.mapSize = 200; // Size of the mini map in pixels
        this.scale = 0.1; // Scale factor for the world to mini map conversion
        this.lastRenderTime = 0;
        this.renderInterval = 100; // Render every 100ms for performance
        this.isVisible = true;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <div id="mini-map-header" class="mini-map-header">Mini Map</div>
            <div id="mini-map">
                <canvas id="mini-map-canvas" width="${this.mapSize}" height="${this.mapSize}"></canvas>
            </div>
        `;
        
        // Render the template
        this.render(template);
        
        // Store references to elements we need to update
        this.headerElement = document.getElementById('mini-map-header');
        this.mapElement = document.getElementById('mini-map');
        this.canvas = document.getElementById('mini-map-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Make the header clickable to toggle the map
        this.headerElement.addEventListener('click', () => {
            this.toggleMiniMap();
        });
        
        // Update the container width based on mapSize
        this.mapElement.style.width = `${this.mapSize}px`;
        this.mapElement.style.height = `${this.mapSize}px`;
        
        return true;
    }
    
    /**
     * Update the mini map
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        const currentTime = Date.now();
        
        // Only render every renderInterval ms for performance
        if (currentTime - this.lastRenderTime >= this.renderInterval) {
            this.renderMiniMap();
            this.lastRenderTime = currentTime;
        }
    }
    
    /**
     * Render the mini map
     */
    renderMiniMap() {
        if (!this.ctx || !this.game.world) return;
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.mapSize, this.mapSize);
        
        // Get player position
        const player = this.game.player;
        if (!player) return;
        
        const playerX = player.getPosition().x;
        const playerY = player.getPosition().z; // Using z as y for top-down view
        
        // Center of the mini map
        const centerX = this.mapSize / 2;
        const centerY = this.mapSize / 2;
        const radius = this.mapSize / 2 - 2; // Slightly smaller than half the canvas
        
        // Create circular clipping path
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.clip();
        
        // Draw background
        this.ctx.fillStyle = 'rgba(17, 17, 17, 0.6)'; // Semi-transparent dark background
        this.ctx.fillRect(0, 0, this.mapSize, this.mapSize);
        
        // Draw grid lines for reference
        this.drawGrid(centerX, centerY, radius);
        
        // Draw terrain/environment
        this.drawEnvironment(playerX, playerY, centerX, centerY);
        
        // Draw NPCs and enemies
        this.drawEntities(playerX, playerY, centerX, centerY);
        
        // Draw player (always in center)
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw player direction indicator
        const playerRotation = player.getRotation().y;
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(
            centerX + Math.sin(playerRotation) * 8,
            centerY + Math.cos(playerRotation) * 8
        );
        this.ctx.stroke();
        
        // Restore context and draw border
        this.ctx.restore();
        
        // Draw circular border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw cardinal directions
        this.drawCardinalDirections(centerX, centerY, radius);
    }
    
    /**
     * Draw grid lines for reference
     * @param {number} centerX - Center X of the mini map
     * @param {number} centerY - Center Y of the mini map
     * @param {number} radius - Radius of the mini map
     */
    drawGrid(centerX, centerY, radius) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Draw concentric circles
        for (let r = radius / 3; r <= radius; r += radius / 3) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw radial lines
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw cardinal directions (N, E, S, W)
     * @param {number} centerX - Center X of the mini map
     * @param {number} centerY - Center Y of the mini map
     * @param {number} radius - Radius of the mini map
     */
    drawCardinalDirections(centerX, centerY, radius) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // North
        this.ctx.fillText('N', centerX, centerY - radius + 10);
        
        // East
        this.ctx.fillText('E', centerX + radius - 10, centerY);
        
        // South
        this.ctx.fillText('S', centerX, centerY + radius - 10);
        
        // West
        this.ctx.fillText('W', centerX - radius + 10, centerY);
    }
    
    /**
     * Draw environment elements on the mini map
     * @param {number} playerX - Player's X position in the world
     * @param {number} playerY - Player's Y position in the world (Z in 3D space)
     * @param {number} centerX - Center X of the mini map
     * @param {number} centerY - Center Y of the mini map
     */
    drawEnvironment(playerX, playerY, centerX, centerY) {
        // Get world reference
        const world = this.game.world;
        
        // Draw terrain features (walls, obstacles, trees, etc.)
        if (world.getTerrainFeatures) {
            const features = world.getTerrainFeatures();
            
            features.forEach(feature => {
                // Calculate position relative to player
                const relX = (feature.position.x - playerX) * this.scale;
                const relY = (feature.position.z - playerY) * this.scale;
                
                // Calculate screen position
                const screenX = centerX + relX;
                const screenY = centerY + relY;
                
                // Calculate distance from center (for circular bounds check)
                const distFromCenter = Math.sqrt(
                    Math.pow(screenX - centerX, 2) + 
                    Math.pow(screenY - centerY, 2)
                );
                
                // Only draw if within circular mini map bounds
                if (distFromCenter <= (this.mapSize / 2 - 2)) {
                    // Draw based on feature type
                    switch (feature.type) {
                        case 'wall':
                            this.ctx.fillStyle = 'rgba(85, 85, 85, 0.8)';
                            this.ctx.fillRect(
                                screenX - 2, 
                                screenY - 2, 
                                4, 
                                4
                            );
                            break;
                        case 'door':
                            this.ctx.fillStyle = 'rgba(136, 85, 85, 0.8)';
                            this.ctx.beginPath();
                            this.ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
                            this.ctx.fill();
                            break;
                        case 'water':
                            this.ctx.fillStyle = 'rgba(85, 85, 255, 0.5)';
                            this.ctx.fillRect(
                                screenX - 3, 
                                screenY - 3, 
                                6, 
                                6
                            );
                            break;
                        case 'tree':
                            // Draw trees as green circles
                            this.ctx.fillStyle = 'rgba(34, 139, 34, 0.7)';
                            this.ctx.beginPath();
                            this.ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
                            this.ctx.fill();
                            break;
                        case 'rock':
                            // Draw rocks as gray circles
                            this.ctx.fillStyle = 'rgba(120, 120, 120, 0.7)';
                            this.ctx.beginPath();
                            this.ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
                            this.ctx.fill();
                            break;
                        case 'path':
                            // Draw paths as light lines
                            this.ctx.fillStyle = 'rgba(210, 180, 140, 0.5)';
                            this.ctx.fillRect(
                                screenX - 2, 
                                screenY - 2, 
                                4, 
                                4
                            );
                            break;
                        default:
                            // Other features
                            this.ctx.fillStyle = 'rgba(119, 119, 119, 0.5)';
                            this.ctx.fillRect(
                                screenX - 1, 
                                screenY - 1, 
                                2, 
                                2
                            );
                    }
                }
            });
        }
        
        // Try to draw additional world elements if available
        this.drawWorldElements(playerX, playerY, centerX, centerY);
    }
    
    /**
     * Draw additional world elements if available
     * @param {number} playerX - Player's X position in the world
     * @param {number} playerY - Player's Y position in the world (Z in 3D space)
     * @param {number} centerX - Center X of the mini map
     * @param {number} centerY - Center Y of the mini map
     */
    drawWorldElements(playerX, playerY, centerX, centerY) {
        const world = this.game.world;
        
        // Draw trees if available
        if (world.getTrees) {
            const trees = world.getTrees();
            this.drawFeatureGroup(trees, playerX, playerY, centerX, centerY, 'rgba(34, 139, 34, 0.6)', 3);
        }
        
        // Draw rocks if available
        if (world.getRocks) {
            const rocks = world.getRocks();
            this.drawFeatureGroup(rocks, playerX, playerY, centerX, centerY, 'rgba(120, 120, 120, 0.6)', 2);
        }
        
        // Draw buildings if available
        if (world.getBuildings) {
            const buildings = world.getBuildings();
            this.drawFeatureGroup(buildings, playerX, playerY, centerX, centerY, 'rgba(139, 69, 19, 0.7)', 4);
        }
        
        // Draw paths if available
        if (world.getPaths) {
            const paths = world.getPaths();
            this.drawFeatureGroup(paths, playerX, playerY, centerX, centerY, 'rgba(210, 180, 140, 0.5)', 2, true);
        }
    }
    
    /**
     * Draw a group of similar features
     * @param {Array} features - Array of features to draw
     * @param {number} playerX - Player's X position in the world
     * @param {number} playerY - Player's Y position in the world (Z in 3D space)
     * @param {number} centerX - Center X of the mini map
     * @param {number} centerY - Center Y of the mini map
     * @param {string} color - Color to use for drawing
     * @param {number} size - Size of the feature
     * @param {boolean} isPath - Whether the feature is a path (drawn as lines)
     */
    drawFeatureGroup(features, playerX, playerY, centerX, centerY, color, size, isPath = false) {
        if (!features || !features.length) return;
        
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        
        features.forEach(feature => {
            // Calculate position relative to player
            const relX = (feature.position.x - playerX) * this.scale;
            const relY = (feature.position.z - playerY) * this.scale;
            
            // Calculate screen position
            const screenX = centerX + relX;
            const screenY = centerY + relY;
            
            // Calculate distance from center (for circular bounds check)
            const distFromCenter = Math.sqrt(
                Math.pow(screenX - centerX, 2) + 
                Math.pow(screenY - centerY, 2)
            );
            
            // Only draw if within circular mini map bounds
            if (distFromCenter <= (this.mapSize / 2 - 2)) {
                if (isPath) {
                    // Draw as a line if it's a path and has a next point
                    if (feature.nextPoint) {
                        const nextRelX = (feature.nextPoint.x - playerX) * this.scale;
                        const nextRelY = (feature.nextPoint.z - playerY) * this.scale;
                        const nextScreenX = centerX + nextRelX;
                        const nextScreenY = centerY + nextRelY;
                        
                        this.ctx.lineWidth = size;
                        this.ctx.beginPath();
                        this.ctx.moveTo(screenX, screenY);
                        this.ctx.lineTo(nextScreenX, nextScreenY);
                        this.ctx.stroke();
                    } else {
                        // Draw as a point if no next point
                        this.ctx.beginPath();
                        this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                } else {
                    // Draw as a circle
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }
    
    /**
     * Draw entities (NPCs, enemies) on the mini map
     * @param {number} playerX - Player's X position in the world
     * @param {number} playerY - Player's Y position in the world (Z in 3D space)
     * @param {number} centerX - Center X of the mini map
     * @param {number} centerY - Center Y of the mini map
     */
    drawEntities(playerX, playerY, centerX, centerY) {
        // Get all entities
        const entities = this.game.world.getEntities ? this.game.world.getEntities() : [];
        
        entities.forEach(entity => {
            // Skip player entity
            if (entity === this.game.player) return;
            
            // Calculate position relative to player
            const relX = (entity.getPosition().x - playerX) * this.scale;
            const relY = (entity.getPosition().z - playerY) * this.scale;
            
            // Calculate screen position
            const screenX = centerX + relX;
            const screenY = centerY + relY;
            
            // Calculate distance from center (for circular bounds check)
            const distFromCenter = Math.sqrt(
                Math.pow(screenX - centerX, 2) + 
                Math.pow(screenY - centerY, 2)
            );
            
            // Only draw if within circular mini map bounds
            if (distFromCenter <= (this.mapSize / 2 - 2)) {
                // Determine color based on entity type
                let color = 'rgba(255, 255, 255, 0.8)'; // Default white
                let size = 2;
                
                if (entity.isEnemy) {
                    color = 'rgba(255, 0, 0, 0.8)'; // Red for enemies
                    size = 3; // Slightly larger for enemies
                } else if (entity.isNPC) {
                    color = 'rgba(255, 255, 0, 0.8)'; // Yellow for NPCs
                } else if (entity.isItem) {
                    color = 'rgba(0, 255, 255, 0.8)'; // Cyan for items
                }
                
                // Draw entity dot
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw a small pulse effect for important entities
                if (entity.isEnemy || entity.isNPC) {
                    this.ctx.strokeStyle = color;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, size + 2, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        });
    }
    
    /**
     * Set the scale factor for the mini map
     * @param {number} scale - New scale factor
     */
    setScale(scale) {
        this.scale = scale;
    }
    
    /**
     * Toggle the mini map visibility
     * @returns {boolean} - New visibility state
     */
    toggleMiniMap() {
        // Toggle only the map element, not the header
        if (this.mapElement) {
            this.isVisible = this.mapElement.style.display !== 'none';
            this.mapElement.style.display = this.isVisible ? 'none' : 'block';
            return !this.isVisible;
        }
        return false;
    }
}