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
        
        // Grid settings
        this.showGrid = true;
        this.gridCellCount = 8; // Number of cells in each direction
        this.gridColor = 'rgba(255, 255, 255, 0.4)'; // Increased opacity for better visibility
        
        // Direction indicators
        this.showDirections = true;
        this.directionColor = '#ffffff';
        this.directionFont = '12px Arial';
        this.directionPadding = 10; // Padding from the edge of the minimap
        
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
        
        // Indicator settings
        this.indicatorColors = {
            enemy: '#ff0000',       // Red for enemies
            boss: '#ff00ff',        // Magenta for bosses
            quest: '#00ffff',       // Cyan for quest objectives
            npc: '#00ff00',         // Green for NPCs
            item: '#ff8800',        // Orange for items
            point_of_interest: '#ffffff' // White for points of interest
        };
        
        // Indicator sizes
        this.indicatorSizes = {
            enemy: 3,
            boss: 5,
            quest: 4,
            npc: 3,
            item: 3,
            point_of_interest: 4
        };
        
        // Store active indicators
        this.indicators = [];
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
        
        // Draw grid if enabled
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Render indicators
        this.renderIndicators();
        
        // Render player position (on top of everything)
        this.renderPlayer();
        
        this.ctx.restore();
        
        // Draw border
        this.drawBorder();
        
        // Draw direction indicators if enabled
        if (this.showDirections) {
            this.drawDirectionIndicators();
        }
    }
    
    /**
     * Draw grid on the minimap
     */
    drawGrid() {
        const cellSize = this.canvasSize / this.gridCellCount;
        
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let i = 0; i <= this.gridCellCount; i++) {
            const x = i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasSize);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let i = 0; i <= this.gridCellCount; i++) {
            const y = i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasSize, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw direction indicators (N, S, E, W) around the minimap
     */
    drawDirectionIndicators() {
        const center = this.canvasSize / 2;
        const radius = this.canvasSize / 2;
        
        this.ctx.fillStyle = this.directionColor;
        this.ctx.font = this.directionFont;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // North (top)
        this.ctx.fillText('N', center, this.directionPadding);
        
        // South (bottom)
        this.ctx.fillText('S', center, this.canvasSize - this.directionPadding);
        
        // East (right)
        this.ctx.fillText('E', this.canvasSize - this.directionPadding, center);
        
        // West (left)
        this.ctx.fillText('W', this.directionPadding, center);
    }
    
    /**
     * Render all active indicators on the minimap
     */
    renderIndicators() {
        if (!this.indicators || this.indicators.length === 0) return;
        
        // Update and render each indicator
        this.indicators.forEach(indicator => {
            // Skip indicators that don't have a position
            if (!indicator.position) return;
            
            // Convert world position to minimap coordinates
            const mapCoords = this.worldToMapCoordinates(indicator.position.x, indicator.position.z);
            if (!mapCoords) return;
            
            // Get indicator properties
            const color = this.indicatorColors[indicator.type] || this.indicatorColors.point_of_interest;
            const size = this.indicatorSizes[indicator.type] || 3;
            
            // Draw indicator based on its type
            switch (indicator.type) {
                case 'quest':
                    this.drawQuestIndicator(mapCoords, color, size);
                    break;
                case 'boss':
                    this.drawBossIndicator(mapCoords, color, size);
                    break;
                case 'enemy':
                    this.drawEnemyIndicator(mapCoords, color, size);
                    break;
                case 'npc':
                    this.drawNPCIndicator(mapCoords, color, size);
                    break;
                case 'item':
                    this.drawItemIndicator(mapCoords, color, size);
                    break;
                case 'point_of_interest':
                default:
                    this.drawPointOfInterestIndicator(mapCoords, color, size);
                    break;
            }
        });
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
        
        // Draw grid if enabled
        if (this.showGrid) {
            this.drawGrid();
        }
        
        // Draw "No Map" text with a subtle background to make it readable
        const textX = this.canvasSize / 2;
        const textY = this.canvasSize / 2;
        
        // Add a semi-transparent background for the text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(textX - 30, textY - 10, 60, 20);
        
        // Draw the text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No Map', textX, textY);
        
        this.ctx.restore();
        
        // Draw border
        this.drawBorder();
        
        // Draw direction indicators if enabled
        if (this.showDirections) {
            this.drawDirectionIndicators();
        }
    }
    
    /**
     * Render the minimap grid from the loaded data
     */
    renderMinimapGrid() {
        if (!this.minimapData || !this.minimapData.grid) return;
        
        const grid = this.minimapData.grid;
        const gridSize = grid.length;
        const cellSize = this.canvasSize / gridSize;
        
        // We're not filling the cells with color to keep the background transparent
        // Only special elements like water, paths, or structures will be drawn
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = grid[row][col];
                if (!cell) continue;
                
                // Only draw special elements, not regular terrain
                if (cell.type === 'water' || cell.type === 'path' || cell.type === 'structure') {
                    const x = col * cellSize;
                    const y = row * cellSize;
                    
                    // Get color for this cell
                    const color = this.getCellColor(cell);
                    
                    // Draw cell with semi-transparency
                    this.ctx.fillStyle = color.replace(')', ', 0.5)').replace('rgb', 'rgba');
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
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
     * Draw a quest indicator (diamond shape)
     * @param {Object} position - Position {x, y} on the minimap
     * @param {string} color - Color of the indicator
     * @param {number} size - Size of the indicator
     */
    drawQuestIndicator(position, color, size) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        // Draw diamond shape
        this.ctx.moveTo(position.x, position.y - size);
        this.ctx.lineTo(position.x + size, position.y);
        this.ctx.lineTo(position.x, position.y + size);
        this.ctx.lineTo(position.x - size, position.y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add pulsing effect
        const pulseSize = size + 2;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(position.x, position.y - pulseSize);
        this.ctx.lineTo(position.x + pulseSize, position.y);
        this.ctx.lineTo(position.x, position.y + pulseSize);
        this.ctx.lineTo(position.x - pulseSize, position.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    /**
     * Draw a boss indicator (skull-like shape)
     * @param {Object} position - Position {x, y} on the minimap
     * @param {string} color - Color of the indicator
     * @param {number} size - Size of the indicator
     */
    drawBossIndicator(position, color, size) {
        // Draw a skull-like shape for bosses
        this.ctx.fillStyle = color;
        
        // Draw circle for the base
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw X inside the circle
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(position.x - size/2, position.y - size/2);
        this.ctx.lineTo(position.x + size/2, position.y + size/2);
        this.ctx.moveTo(position.x + size/2, position.y - size/2);
        this.ctx.lineTo(position.x - size/2, position.y + size/2);
        this.ctx.stroke();
    }
    
    /**
     * Draw an enemy indicator (small red dot)
     * @param {Object} position - Position {x, y} on the minimap
     * @param {string} color - Color of the indicator
     * @param {number} size - Size of the indicator
     */
    drawEnemyIndicator(position, color, size) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Draw an NPC indicator (green triangle)
     * @param {Object} position - Position {x, y} on the minimap
     * @param {string} color - Color of the indicator
     * @param {number} size - Size of the indicator
     */
    drawNPCIndicator(position, color, size) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        // Draw triangle pointing up
        this.ctx.moveTo(position.x, position.y - size);
        this.ctx.lineTo(position.x + size, position.y + size);
        this.ctx.lineTo(position.x - size, position.y + size);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * Draw an item indicator (small square)
     * @param {Object} position - Position {x, y} on the minimap
     * @param {string} color - Color of the indicator
     * @param {number} size - Size of the indicator
     */
    drawItemIndicator(position, color, size) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(position.x - size/2, position.y - size/2, size, size);
    }
    
    /**
     * Draw a point of interest indicator (star shape)
     * @param {Object} position - Position {x, y} on the minimap
     * @param {string} color - Color of the indicator
     * @param {number} size - Size of the indicator
     */
    drawPointOfInterestIndicator(position, color, size) {
        this.ctx.fillStyle = color;
        
        // Draw a simple star shape
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
            const x = position.x + Math.cos(angle) * size;
            const y = position.y + Math.sin(angle) * size;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            // Draw inner points of the star
            const innerAngle = angle + Math.PI / 5;
            const innerX = position.x + Math.cos(innerAngle) * (size / 2);
            const innerY = position.y + Math.sin(innerAngle) * (size / 2);
            this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    /**
     * Add an indicator to the minimap
     * @param {string} type - Type of indicator ('enemy', 'boss', 'quest', 'npc', 'item', 'point_of_interest')
     * @param {Object} position - World position {x, y, z}
     * @param {string} id - Unique identifier for the indicator
     * @param {Object} options - Additional options for the indicator
     * @returns {Object} - The created indicator
     */
    addIndicator(type, position, id, options = {}) {
        // Create indicator object
        const indicator = {
            id: id || `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type || 'point_of_interest',
            position: position,
            options: options
        };
        
        // Add to indicators array
        this.indicators.push(indicator);
        
        return indicator;
    }
    
    /**
     * Update an existing indicator
     * @param {string} id - Indicator ID
     * @param {Object} updates - Properties to update
     * @returns {boolean} - True if indicator was found and updated
     */
    updateIndicator(id, updates) {
        const index = this.indicators.findIndex(indicator => indicator.id === id);
        
        if (index === -1) return false;
        
        // Update indicator properties
        this.indicators[index] = {
            ...this.indicators[index],
            ...updates
        };
        
        return true;
    }
    
    /**
     * Remove an indicator from the minimap
     * @param {string} id - Indicator ID
     * @returns {boolean} - True if indicator was found and removed
     */
    removeIndicator(id) {
        const index = this.indicators.findIndex(indicator => indicator.id === id);
        
        if (index === -1) return false;
        
        // Remove indicator
        this.indicators.splice(index, 1);
        
        return true;
    }
    
    /**
     * Clear all indicators of a specific type
     * @param {string} type - Type of indicators to clear (optional, if not provided, clears all)
     */
    clearIndicators(type) {
        if (type) {
            this.indicators = this.indicators.filter(indicator => indicator.type !== type);
        } else {
            this.indicators = [];
        }
    }
    
    /**
     * Update indicators from game entities
     * This method should be called periodically to update indicators based on game state
     */
    updateIndicatorsFromGameState() {
        // Clear existing enemy indicators
        this.clearIndicators('enemy');
        this.clearIndicators('boss');
        
        // Add enemy indicators if enemy manager exists
        if (this.game.enemyManager && this.game.enemyManager.enemies) {
            this.game.enemyManager.enemies.forEach(enemy => {
                if (!enemy || enemy.isDead()) return;
                
                const position = enemy.getPosition();
                if (!position) return;
                
                // Determine if this is a boss
                const isBoss = enemy.isBoss || (enemy.type && enemy.type.includes('boss'));
                const type = isBoss ? 'boss' : 'enemy';
                
                this.addIndicator(type, position, `enemy_${enemy.id || Math.random()}`, {
                    name: enemy.getName ? enemy.getName() : 'Enemy'
                });
            });
        }
        
        // Add quest indicators if quest manager exists
        if (this.game.questManager && this.game.questManager.activeQuests) {
            this.game.questManager.activeQuests.forEach(quest => {
                if (!quest.objective || !quest.objective.position) return;
                
                this.addIndicator('quest', quest.objective.position, `quest_${quest.id}`, {
                    name: quest.name,
                    description: quest.objective.description
                });
            });
        }
        
        // Add NPC indicators if NPC manager exists
        if (this.game.npcManager && this.game.npcManager.npcs) {
            this.game.npcManager.npcs.forEach(npc => {
                if (!npc || !npc.position) return;
                
                this.addIndicator('npc', npc.position, `npc_${npc.id}`, {
                    name: npc.name
                });
            });
        }
    }
    
    /**
     * Update method - called every frame
     * @param {number} delta - Time since last update in seconds
     */
    update(delta) {
        const now = Date.now();
        if (now - this.lastRenderTime >= this.renderInterval) {
            // Update indicators from game state
            this.updateIndicatorsFromGameState();
            
            // Render the minimap
            this.renderMinimap();
            this.lastRenderTime = now;
        }
    }
    
    /**
     * Remove event listeners
     */
    removeEventListeners() {
        // Clean up any event listeners if added in the future
    }
}