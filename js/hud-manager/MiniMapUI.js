import { UIComponent } from '../UIComponent.js';

/**
 * Mini Map UI component - Clean rewrite
 * Displays a simplified top-down view of the game world using pre-generated minimap data
 * 
 * Convention: For a map file "mapname.json", the minimap data is at "minimaps/mapname_minimap.json"
 */
export class MiniMapUI extends UIComponent {
    /**
     * Create a new MiniMapUI component
     * @param {Object} game - Reference to the game instance
     */
    constructor(game) {
        super('mini-map', game);
        
        // Core properties
        this.canvas = null;
        this.ctx = null;
        this.minimapData = null;
        this.currentMapId = null;
        
        // Display settings
        this.mapSize = this.mobile ? 120 : 200;
        this.canvasSize = this.mapSize;
        
        // Rendering
        this.lastRenderTime = 0;
        this.renderInterval = 100; // Render every 100ms
        
        // Zone colors mapping
        this.zoneColors = {
            forest: '#2d5016',
            mountains: '#8b7355',
            desert: '#daa520',
            swamp: '#556b2f',
            lava: '#dc143c',
            ice: '#b0e0e6',
            ruins: '#696969',
            water: '#4682b4',
            plains: '#9acd32',
            default: '#404040'
        };
        
        // Player representation
        this.playerColor = '#ffff00';
        this.playerSize = 4;
    }
    
    /**
     * Initialize the component
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        const template = `
            <canvas id="mini-map-canvas" width="${this.canvasSize}" height="${this.canvasSize}"></canvas>
        `;
        
        this.render(template);
        
        // Get canvas and context
        this.canvas = document.getElementById('mini-map-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.canvas || !this.ctx) {
            console.error('Failed to initialize minimap canvas');
            return false;
        }
        
        // Load minimap for current world
        this.loadCurrentWorldMinimap();
        
        // Listen for world changes
        if (this.game.events) {
            this.game.events.addEventListener('worldChanged', () => {
                this.loadCurrentWorldMinimap();
            });
        }
        
        return true;
    }
    
    /**
     * Update the component
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        const now = Date.now();
        if (now - this.lastRenderTime >= this.renderInterval) {
            this.renderMinimap();
            this.lastRenderTime = now;
        }
    }
    
    /**
     * Load minimap data for the current world
     */
    async loadCurrentWorldMinimap() {
        const worldId = this.getCurrentWorldId();
        if (!worldId || worldId === this.currentMapId) {
            return;
        }
        
        this.currentMapId = worldId;
        this.minimapData = null;
        
        try {
            const minimapPath = `assets/maps/minimaps/${worldId}_minimap.json`;
            const response = await fetch(minimapPath);
            
            if (response.ok) {
                this.minimapData = await response.json();
                console.log(`Loaded minimap for ${worldId}`);
            } else {
                console.warn(`No minimap found for ${worldId}`);
            }
        } catch (error) {
            console.warn(`Failed to load minimap for ${worldId}:`, error);
        }
    }
    
    /**
     * Get the current world ID
     * @returns {string|null} - The current world ID or null if not available
     */
    getCurrentWorldId() {
        if (!this.game.world) return null;
        
        // Try different ways to get the world ID
        if (this.game.world.currentMapId) {
            return this.game.world.currentMapId;
        }
        
        if (this.game.world.mapId) {
            return this.game.world.mapId;
        }
        
        if (this.game.world.name) {
            return this.game.world.name;
        }
        
        // Try to get from world manager
        if (this.game.world.worldId) {
            return this.game.world.worldId;
        }
        
        if (this.game.world.worldName) {
            return this.game.world.worldName.toLowerCase().replace(/\s+/g, '_');
        }
        
        return null;
    }
    
    /**
     * Render the minimap
     */
    renderMinimap() {
        if (!this.ctx) return;
        
        if (!this.minimapData) {
            this.renderEmpty();
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Create circular clipping mask
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2, 0, Math.PI * 2);
        this.ctx.clip();
        
        // Render the minimap grid
        this.renderMinimapGrid();
        
        // Render player position
        this.renderPlayer();
        
        this.ctx.restore();
        
        // Draw border
        this.drawBorder();
    }
    
    /**
     * Render empty minimap when no data is available
     */
    renderEmpty() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Create circular clipping mask
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2, 0, Math.PI * 2);
        this.ctx.clip();
        
        // Fill with dark background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Draw "No Map" text
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No Map', this.canvasSize / 2, this.canvasSize / 2);
        
        this.ctx.restore();
        this.drawBorder();
    }
    
    /**
     * Render the minimap grid from the loaded data
     */
    renderMinimapGrid() {
        if (!this.minimapData || !this.minimapData.grid) return;
        
        const grid = this.minimapData.grid;
        const gridSize = grid.length;
        const cellSize = this.canvasSize / gridSize;
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = grid[row][col];
                if (!cell) continue;
                
                const x = col * cellSize;
                const y = row * cellSize;
                
                // Get color for this cell
                const color = this.getCellColor(cell);
                
                // Draw cell
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }
    
    /**
     * Get color for a minimap cell
     * @param {Object} cell - Cell data from minimap
     * @returns {string} - Color string
     */
    getCellColor(cell) {
        if (cell.type === 'zone' && cell.zoneType) {
            return this.zoneColors[cell.zoneType] || this.zoneColors.default;
        }
        
        if (cell.type === 'structure') {
            return '#8b4513'; // Brown for structures
        }
        
        if (cell.type === 'water') {
            return this.zoneColors.water;
        }
        
        if (cell.type === 'path') {
            return '#a0522d'; // Brown for paths
        }
        
        return this.zoneColors.default;
    }
    
    /**
     * Render player position on the minimap
     */
    renderPlayer() {
        if (!this.game.player) return;
        
        const player = this.game.player;
        const playerPos = player.position;
        
        if (!playerPos) return;
        
        // Convert world position to minimap coordinates
        const mapCoords = this.worldToMapCoordinates(playerPos.x, playerPos.z);
        
        if (mapCoords) {
            // Draw player dot
            this.ctx.fillStyle = this.playerColor;
            this.ctx.beginPath();
            this.ctx.arc(mapCoords.x, mapCoords.y, this.playerSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw player direction indicator
            if (player.rotation) {
                const angle = player.rotation.y;
                const length = this.playerSize + 2;
                const endX = mapCoords.x + Math.sin(angle) * length;
                const endY = mapCoords.y - Math.cos(angle) * length;
                
                this.ctx.strokeStyle = this.playerColor;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(mapCoords.x, mapCoords.y);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }
    }
    
    /**
     * Convert world coordinates to minimap coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldZ - World Z coordinate
     * @returns {Object|null} - Minimap coordinates {x, y} or null if out of bounds
     */
    worldToMapCoordinates(worldX, worldZ) {
        // Assume world bounds are -400 to 400 (adjust based on your world size)
        const worldSize = 800;
        const worldMin = -400;
        
        // Normalize to 0-1 range
        const normalizedX = (worldX - worldMin) / worldSize;
        const normalizedZ = (worldZ - worldMin) / worldSize;
        
        // Check bounds
        if (normalizedX < 0 || normalizedX > 1 || normalizedZ < 0 || normalizedZ > 1) {
            return null;
        }
        
        // Convert to canvas coordinates
        return {
            x: normalizedX * this.canvasSize,
            y: normalizedZ * this.canvasSize
        };
    }
    
    /**
     * Draw border around the minimap
     */
    drawBorder() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.canvasSize / 2, this.canvasSize / 2, this.canvasSize / 2 - 1, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Remove event listeners
     */
    removeEventListeners() {
        // Clean up any event listeners if added in the future
    }
}