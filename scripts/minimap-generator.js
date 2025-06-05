/**
 * Minimap Generator
 * 
 * This module generates simplified minimap data and images from full map data.
 * It creates:
 * 1. A simplified JSON structure for in-game minimap rendering
 * 2. Low-resolution image representations of the map
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // Make sure to install: npm install canvas

class MinimapGenerator {
    constructor(mapData, options = {}) {
        this.mapData = mapData;
        this.options = {
            minimapResolution: options.minimapResolution || 200, // Size of minimap data grid
            imageResolutions: options.imageResolutions || [256], // Only generate 256x256 images
            outputDir: options.outputDir || './assets/maps/minimaps',
            ...options
        };
        
        // Map bounds
        this.mapSize = mapData.mapSize || 1000;
        this.halfSize = this.mapSize / 2;
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(this.options.outputDir)) {
            fs.mkdirSync(this.options.outputDir, { recursive: true });
        }
    }
    
    /**
     * Generate all minimap assets
     */
    generate(outputBaseName) {
        console.log('Generating minimap assets...');
        
        // Generate simplified minimap data
        const minimapData = this.generateMinimapData();
        
        // Generate minimap images
        const imageFiles = this.generateMinimapImages(outputBaseName);
        
        // Save minimap data
        const minimapFilename = path.join(this.options.outputDir, `${outputBaseName}_minimap.json`);
        fs.writeFileSync(minimapFilename, JSON.stringify({
            ...minimapData,
            images: imageFiles
        }, null, 2));
        
        console.log(`✓ Minimap data saved to: ${minimapFilename}`);
        console.log(`✓ Generated ${imageFiles.length} minimap images`);
        
        return {
            minimapData,
            imageFiles
        };
    }
    
    /**
     * Generate simplified minimap data structure
     */
    generateMinimapData() {
        const gridSize = this.options.minimapResolution;
        const cellSize = this.mapSize / gridSize;
        
        // Initialize grid with empty cells
        const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
        
        // Track different element types for the minimap
        const minimapData = {
            grid,
            gridSize,
            mapSize: this.mapSize,
            paths: [],
            structures: [],
            zones: [],
            landmarks: []
        };
        
        // Process zones (background)
        this.processZones(minimapData);
        
        // Process environment (simplified as terrain types)
        this.processEnvironment(minimapData);
        
        // Process structures (important landmarks)
        this.processStructures(minimapData);
        
        // Process paths (simplified)
        this.processPaths(minimapData);
        
        return minimapData;
    }
    
    /**
     * Process zones for minimap
     */
    processZones(minimapData) {
        if (!this.mapData.zones || !this.mapData.zones.length) return;
        
        // Simplify zones for minimap
        for (const zone of this.mapData.zones) {
            // Handle zones that use 'center' instead of 'position'
            const position = zone.position || zone.center;
            
            // Skip zones with invalid positions
            if (!position || typeof position.x === 'undefined') {
                console.warn('Skipping zone with invalid position:', zone);
                continue;
            }
            
            minimapData.zones.push({
                id: zone.id,
                type: zone.type || zone.name, // Some zones use 'name' instead of 'type'
                position: position,
                radius: zone.radius,
                color: this.getZoneColor(zone.type || zone.name)
            });
        }
        
        // Fill grid with zone information
        const gridSize = minimapData.gridSize;
        const cellSize = this.mapSize / gridSize;
        
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                // Convert grid coordinates to world coordinates
                const worldX = (x * cellSize) - this.halfSize + (cellSize / 2);
                const worldZ = (y * cellSize) - this.halfSize + (cellSize / 2);
                
                // Find which zone this cell belongs to
                let closestZone = null;
                let minDistance = Infinity;
                
                for (const zone of minimapData.zones) {
                    // Skip zones with invalid positions
                    if (!zone.position || typeof zone.position.x === 'undefined') {
                        continue;
                    }
                    
                    const dx = worldX - zone.position.x;
                    const dz = worldZ - zone.position.z;
                    const distance = Math.sqrt(dx * dx + dz * dz);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestZone = zone;
                    }
                }
                
                if (closestZone) {
                    minimapData.grid[y][x] = {
                        type: 'zone',
                        zoneType: closestZone.type,
                        zoneId: closestZone.id
                    };
                }
            }
        }
    }
    
    /**
     * Process environment objects for minimap
     */
    processEnvironment(minimapData) {
        if (!this.mapData.environment || !this.mapData.environment.length) return;
        
        const gridSize = minimapData.gridSize;
        const cellSize = this.mapSize / gridSize;
        
        // Group environment objects by type and location
        const environmentDensity = Array(gridSize).fill().map(() => 
            Array(gridSize).fill().map(() => ({
                trees: 0,
                rocks: 0,
                water: 0,
                mountains: 0,
                lava: 0
            }))
        );
        
        // Count objects in each grid cell
        for (const obj of this.mapData.environment) {
            // Skip objects with invalid positions
            if (!obj.position || typeof obj.position.x === 'undefined' || typeof obj.position.z === 'undefined') {
                continue;
            }
            
            // Convert world coordinates to grid coordinates
            const gridX = Math.floor((obj.position.x + this.halfSize) / cellSize);
            const gridY = Math.floor((obj.position.z + this.halfSize) / cellSize);
            
            // Skip if outside grid bounds
            if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
                continue;
            }
            
            // Increment appropriate counter based on object type
            if (obj.type === 'tree') {
                environmentDensity[gridY][gridX].trees++;
            } else if (obj.type === 'rock' || obj.type === 'boulder') {
                environmentDensity[gridY][gridX].rocks++;
            } else if (obj.type === 'water' || obj.type === 'pond') {
                environmentDensity[gridY][gridX].water++;
            } else if (obj.type === 'mountain' || obj.type === 'hill') {
                environmentDensity[gridY][gridX].mountains++;
            } else if (obj.type === 'lava' || obj.type === 'lava_pool') {
                environmentDensity[gridY][gridX].lava++;
            }
        }
        
        // Determine dominant terrain type for each cell
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = environmentDensity[y][x];
                
                // Skip if cell already has zone information
                if (minimapData.grid[y][x] && minimapData.grid[y][x].type === 'zone') {
                    const cellData = minimapData.grid[y][x];
                    
                    // Add terrain information to existing cell
                    if (cell.trees > 5) {
                        cellData.terrain = 'forest';
                        cellData.density = Math.min(1, cell.trees / 20); // Normalize density
                    } else if (cell.mountains > 0) {
                        cellData.terrain = 'mountains';
                        cellData.density = Math.min(1, cell.mountains / 3);
                    } else if (cell.water > 0) {
                        cellData.terrain = 'water';
                        cellData.density = Math.min(1, cell.water / 2);
                    } else if (cell.lava > 0) {
                        cellData.terrain = 'lava';
                        cellData.density = Math.min(1, cell.lava / 2);
                    } else if (cell.rocks > 3) {
                        cellData.terrain = 'rocky';
                        cellData.density = Math.min(1, cell.rocks / 10);
                    }
                    
                    continue;
                }
                
                // Determine dominant terrain type
                let terrainType = null;
                let density = 0;
                
                if (cell.trees > 5) {
                    terrainType = 'forest';
                    density = Math.min(1, cell.trees / 20);
                } else if (cell.mountains > 0) {
                    terrainType = 'mountains';
                    density = Math.min(1, cell.mountains / 3);
                } else if (cell.water > 0) {
                    terrainType = 'water';
                    density = Math.min(1, cell.water / 2);
                } else if (cell.lava > 0) {
                    terrainType = 'lava';
                    density = Math.min(1, cell.lava / 2);
                } else if (cell.rocks > 3) {
                    terrainType = 'rocky';
                    density = Math.min(1, cell.rocks / 10);
                }
                
                if (terrainType) {
                    minimapData.grid[y][x] = {
                        type: 'terrain',
                        terrain: terrainType,
                        density
                    };
                }
            }
        }
    }
    
    /**
     * Process structures for minimap
     */
    processStructures(minimapData) {
        if (!this.mapData.structures || !this.mapData.structures.length) return;
        
        const gridSize = minimapData.gridSize;
        const cellSize = this.mapSize / gridSize;
        
        // Add important structures to landmarks list
        for (const structure of this.mapData.structures) {
            // Skip structures with invalid positions
            if (!structure.position || typeof structure.position.x === 'undefined' || typeof structure.position.z === 'undefined') {
                continue;
            }
            
            // Convert world coordinates to grid coordinates
            const gridX = Math.floor((structure.position.x + this.halfSize) / cellSize);
            const gridY = Math.floor((structure.position.z + this.halfSize) / cellSize);
            
            // Skip if outside grid bounds
            if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
                continue;
            }
            
            // Add to landmarks list
            minimapData.landmarks.push({
                id: structure.id,
                type: structure.type,
                position: {
                    x: gridX,
                    y: gridY
                },
                worldPosition: structure.position,
                icon: this.getStructureIcon(structure.type)
            });
            
            // Mark cell as structure
            minimapData.grid[gridY][gridX] = {
                type: 'structure',
                structureType: structure.type,
                structureId: structure.id
            };
            
            // Add to structures list
            minimapData.structures.push({
                id: structure.id,
                type: structure.type,
                position: {
                    x: gridX,
                    y: gridY
                },
                worldPosition: structure.position
            });
        }
    }
    
    /**
     * Process paths for minimap
     */
    processPaths(minimapData) {
        if (!this.mapData.paths || !this.mapData.paths.length) return;
        
        const gridSize = minimapData.gridSize;
        const cellSize = this.mapSize / gridSize;
        
        // Simplify paths for minimap
        for (const path of this.mapData.paths) {
            // Skip paths without points
            if (!path.points || path.points.length < 2) {
                continue;
            }
            
            const simplifiedPoints = [];
            
            // Convert world coordinates to grid coordinates
            for (const point of path.points) {
                // Skip points with invalid coordinates
                if (!point || typeof point.x === 'undefined' || typeof point.z === 'undefined') {
                    continue;
                }
                
                const gridX = Math.floor((point.x + this.halfSize) / cellSize);
                const gridY = Math.floor((point.z + this.halfSize) / cellSize);
                
                // Skip if outside grid bounds
                if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) {
                    continue;
                }
                
                simplifiedPoints.push({
                    x: gridX,
                    y: gridY
                });
                
                // Mark cell as path
                minimapData.grid[gridY][gridX] = {
                    type: 'path',
                    pathType: path.pathType || 'main'
                };
            }
            
            // Add to paths list if we have at least 2 points
            if (simplifiedPoints.length >= 2) {
                minimapData.paths.push({
                    type: path.type,
                    pathType: path.pathType || 'main',
                    points: simplifiedPoints,
                    width: path.width || 1
                });
            }
        }
    }
    
    /**
     * Generate minimap images at different resolutions
     */
    generateMinimapImages(outputBaseName) {
        const imageFiles = [];
        
        for (const resolution of this.options.imageResolutions) {
            const filename = `${outputBaseName}_${resolution}x${resolution}.png`;
            const filePath = path.join(this.options.outputDir, filename);
            
            // Create canvas
            const canvas = createCanvas(resolution, resolution);
            const ctx = canvas.getContext('2d');
            
            // Draw minimap
            this.drawMinimapToCanvas(ctx, resolution);
            
            // Save image
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filePath, buffer);
            
            imageFiles.push({
                resolution,
                filename,
                path: filePath
            });
            
            console.log(`✓ Generated minimap image: ${filePath}`);
        }
        
        return imageFiles;
    }
    
    /**
     * Draw minimap to canvas
     */
    drawMinimapToCanvas(ctx, resolution) {
        const gridSize = this.options.minimapResolution;
        const cellSize = resolution / gridSize;
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, resolution, resolution);
        
        // Draw zones and terrain
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = this.getMinimapData().grid[y][x];
                if (!cell) continue;
                
                const pixelX = x * cellSize;
                const pixelY = y * cellSize;
                
                if (cell.type === 'zone') {
                    ctx.fillStyle = this.getZoneColor(cell.zoneType);
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                    
                    // Draw terrain overlay if present
                    if (cell.terrain) {
                        ctx.fillStyle = this.getTerrainColor(cell.terrain, cell.density);
                        ctx.globalAlpha = 0.5;
                        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                        ctx.globalAlpha = 1.0;
                    }
                } else if (cell.type === 'terrain') {
                    ctx.fillStyle = this.getTerrainColor(cell.terrain, cell.density);
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                }
            }
        }
        
        // Draw paths
        for (const path of this.getMinimapData().paths) {
            if (path.points.length < 2) continue;
            
            ctx.strokeStyle = this.getPathColor(path.pathType);
            ctx.lineWidth = path.width * (cellSize / 5);
            ctx.beginPath();
            
            const startX = path.points[0].x * cellSize + cellSize / 2;
            const startY = path.points[0].y * cellSize + cellSize / 2;
            ctx.moveTo(startX, startY);
            
            for (let i = 1; i < path.points.length; i++) {
                const x = path.points[i].x * cellSize + cellSize / 2;
                const y = path.points[i].y * cellSize + cellSize / 2;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        }
        
        // Draw structures/landmarks
        for (const landmark of this.getMinimapData().landmarks) {
            const x = landmark.position.x * cellSize + cellSize / 2;
            const y = landmark.position.y * cellSize + cellSize / 2;
            const iconSize = cellSize * 1.5;
            
            // Draw icon background
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw icon border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, iconSize / 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw icon symbol (simplified)
            ctx.fillStyle = this.getStructureColor(landmark.type);
            ctx.beginPath();
            
            switch (landmark.icon) {
                case 'village':
                    // House shape
                    ctx.fillRect(x - iconSize/4, y - iconSize/4, iconSize/2, iconSize/2);
                    // Roof
                    ctx.beginPath();
                    ctx.moveTo(x - iconSize/4, y - iconSize/4);
                    ctx.lineTo(x, y - iconSize/2);
                    ctx.lineTo(x + iconSize/4, y - iconSize/4);
                    ctx.fill();
                    break;
                case 'temple':
                    // Temple shape
                    ctx.beginPath();
                    ctx.moveTo(x, y - iconSize/2);
                    ctx.lineTo(x + iconSize/3, y);
                    ctx.lineTo(x - iconSize/3, y);
                    ctx.fill();
                    break;
                case 'cave':
                    // Cave entrance
                    ctx.beginPath();
                    ctx.arc(x, y, iconSize/3, 0, Math.PI, true);
                    ctx.fill();
                    break;
                case 'tower':
                    // Tower shape
                    ctx.fillRect(x - iconSize/6, y - iconSize/3, iconSize/3, iconSize/1.5);
                    break;
                default:
                    // Default dot
                    ctx.beginPath();
                    ctx.arc(x, y, iconSize/4, 0, Math.PI * 2);
                    ctx.fill();
            }
        }
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, resolution, resolution);
    }
    
    /**
     * Get minimap data
     */
    getMinimapData() {
        if (!this._minimapData) {
            this._minimapData = this.generateMinimapData();
        }
        return this._minimapData;
    }
    
    /**
     * Get color for zone type
     */
    getZoneColor(zoneType) {
        // First check if we have theme-specific colors in the map data
        if (this.mapData.theme && this.mapData.theme.colors) {
            const themeColors = this.mapData.theme.colors;
            
            // Convert zone type to lowercase for case-insensitive matching
            const zoneLower = zoneType.toLowerCase();
            
            // Check for direct matches in theme colors
            if (zoneLower === 'forest' && themeColors.foliage) {
                return themeColors.foliage;
            } else if (zoneLower === 'mountains' && themeColors.snow) {
                return themeColors.snow;
            } else if (zoneLower === 'swamp' && themeColors.vegetation) {
                return themeColors.vegetation;
            } else if (zoneLower === 'desert' && themeColors.sand) {
                return themeColors.sand;
            } else if (zoneLower === 'ruins' && themeColors.stone) {
                return themeColors.stone;
            } else if (zoneLower === 'lava' && themeColors.lava) {
                return themeColors.lava;
            } else if (zoneLower === 'terrant' && themeColors.ground) {
                return themeColors.ground;
            }
            
            // If we have a primary color defined, use it for the main theme
            if (this.mapData.theme.primaryZone && 
                this.mapData.theme.primaryZone.toLowerCase() === zoneLower && 
                themeColors.primary) {
                return themeColors.primary;
            }
        }
        
        // Fallback to default colors if theme colors aren't available
        const colors = {
            'forest': '#1a5c1a',
            'mountains': '#6b6b6b',
            'swamp': '#4a6e4a',
            'desert': '#c2b280',
            'ruins': '#8c8c8c',
            'lava': '#8c3c00',
            'snow': '#e0e0e0',
            'terrant': '#8F9779',
            'default': '#3c3c3c'
        };
        
        // Convert to lowercase for case-insensitive matching
        const zoneLower = zoneType.toLowerCase();
        return colors[zoneLower] || colors.default;
    }
    
    /**
     * Get color for terrain type
     */
    getTerrainColor(terrainType, density = 1) {
        // First check if we have theme-specific colors in the map data
        if (this.mapData.theme && this.mapData.theme.colors) {
            const themeColors = this.mapData.theme.colors;
            
            // Convert terrain type to lowercase for case-insensitive matching
            const terrainLower = terrainType.toLowerCase();
            
            // Check for direct matches in theme colors
            if (terrainLower === 'forest' && themeColors.foliage) {
                return this.adjustColorBrightness(themeColors.foliage, density * 0.7 + 0.3);
            } else if (terrainLower === 'mountains' && themeColors.snow) {
                return this.adjustColorBrightness(themeColors.snow, density * 0.7 + 0.3);
            } else if (terrainLower === 'water' && themeColors.water) {
                return this.adjustColorBrightness(themeColors.water, density * 0.7 + 0.3);
            } else if (terrainLower === 'lava' && themeColors.lava) {
                return this.adjustColorBrightness(themeColors.lava, density * 0.7 + 0.3);
            } else if (terrainLower === 'rocky' && themeColors.rock) {
                return this.adjustColorBrightness(themeColors.rock, density * 0.7 + 0.3);
            }
            
            // If we have a primary zone defined, use its color for the main terrain
            if (this.mapData.theme.primaryZone) {
                const primaryZone = this.mapData.theme.primaryZone.toLowerCase();
                
                if (primaryZone === 'forest' && themeColors.foliage) {
                    return this.adjustColorBrightness(themeColors.foliage, density * 0.7 + 0.3);
                } else if (primaryZone === 'mountains' && themeColors.snow) {
                    return this.adjustColorBrightness(themeColors.snow, density * 0.7 + 0.3);
                } else if (primaryZone === 'swamp' && themeColors.vegetation) {
                    return this.adjustColorBrightness(themeColors.vegetation, density * 0.7 + 0.3);
                } else if (primaryZone === 'desert' && themeColors.sand) {
                    return this.adjustColorBrightness(themeColors.sand, density * 0.7 + 0.3);
                } else if (primaryZone === 'ruins' && themeColors.stone) {
                    return this.adjustColorBrightness(themeColors.stone, density * 0.7 + 0.3);
                }
            }
        }
        
        // Fallback to default colors if theme colors aren't available
        const colors = {
            'forest': '#0d4d0d',
            'mountains': '#4d4d4d',
            'water': '#0077be',
            'lava': '#ff4500',
            'rocky': '#696969',
            'default': '#3c3c3c'
        };
        
        // Convert to lowercase for case-insensitive matching
        const terrainLower = terrainType.toLowerCase();
        const baseColor = colors[terrainLower] || colors.default;
        
        // Adjust color based on density
        return this.adjustColorBrightness(baseColor, density * 0.7 + 0.3);
    }
    
    /**
     * Get color for path type
     */
    getPathColor(pathType) {
        const colors = {
            'main': '#ffffff',
            'secondary': '#cccccc',
            'tertiary': '#999999',
            'default': '#aaaaaa'
        };
        
        return colors[pathType] || colors.default;
    }
    
    /**
     * Get icon for structure type
     */
    getStructureIcon(structureType) {
        const icons = {
            'village': 'village',
            'temple': 'temple',
            'cave': 'cave',
            'tower': 'tower',
            'ruins': 'ruins',
            'shrine': 'temple',
            'darkSanctum': 'temple',
            'default': 'default'
        };
        
        return icons[structureType] || icons.default;
    }
    
    /**
     * Get color for structure type
     */
    getStructureColor(structureType) {
        const colors = {
            'village': '#1a5c1a',
            'temple': '#c9a83b',
            'cave': '#4d4d4d',
            'tower': '#8c3c00',
            'ruins': '#8c8c8c',
            'shrine': '#c9a83b',
            'darkSanctum': '#4a0082',
            'default': '#ff0000'
        };
        
        return colors[structureType] || colors.default;
    }
    
    /**
     * Adjust color brightness
     */
    adjustColorBrightness(hex, factor) {
        // Convert hex to RGB
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        // Adjust brightness
        r = Math.round(r * factor);
        g = Math.round(g * factor);
        b = Math.round(b * factor);
        
        // Ensure values are in valid range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}

module.exports = MinimapGenerator;