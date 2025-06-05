import { UIComponent } from '../UIComponent.js';

/**
 * Map Selector UI Component
 * Allows players to select and load different pre-generated maps
 */
export class MapSelectorUI extends UIComponent {
    constructor(game) {
        super("map-selector-overlay", game);
        this.game = game;
        this.isVisible = false;
        
        // Available maps (will be loaded from index.json)
        this.availableMaps = [];
        this.selectedMap = null;
        this.isLoading = false;
        
        // Load maps from index.json
        this.loadMapIndex();
    }
    
    /**
     * Load map index from assets/maps/index.json
     */
    async loadMapIndex() {
        try {
            const response = await fetch('assets/maps/index.json');
            if (!response.ok) {
                throw new Error(`Failed to load map index: ${response.status} ${response.statusText}`);
            }
            
            const indexData = await response.json();
            this.availableMaps = indexData.maps || [];
            
            console.log(`Loaded ${this.availableMaps.length} maps from index.json`);
            
            // Create UI after maps are loaded
            this.createElement();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading map index:', error);
            
            // Set empty maps array instead of using hardcoded fallback
            this.availableMaps = [];
            
            // Create UI with empty maps array
            this.createElement();
            this.setupEventListeners();
            
            // Show error message in UI
            if (this.game.ui) {
                this.game.ui.showMessage('Failed to load map data. Please check your connection and try again.', 5000);
            }
        }
    }

    createElement() {
        // Create main container
        this.element = document.createElement('div');
        this.element.className = 'map-selector-overlay';
        this.element.style.display = 'none';
        
        // Generate map list content based on available maps
        let mapListContent = '';
        
        // Add "Generate New Map" button at the top of the list
        const generateNewMapButton = `
            <div class="map-list-item generate-new-map" id="generateNewMapBtn">
                <div class="map-list-preview">
                </div>
                <button class="action-button secondary" id="clearCurrentMap">
                    Return to Procedural World
                </button>
                <div class="map-list-name">Generate New Map</div>
            </div>
        `;
        
        if (this.availableMaps.length > 0) {
            // Add the generate button followed by the map list
            mapListContent = generateNewMapButton + this.availableMaps.map(map => `
                <div class="map-list-item" data-map-id="${map.id}">
                    <div class="map-list-preview">
                        <div class="map-preview-placeholder">
                            <span class="map-icon">🗺️</span>
                        </div>
                    </div>
                    <div class="map-list-name">${map.name}</div>
                </div>
            `).join('');
        } else {
            mapListContent = `
                <div class="no-maps-message">
                    <p>No maps available. Please check that assets/maps/index.json exists and is properly formatted.</p>
                    <button class="action-button secondary" id="retryLoadMaps">
                        Retry Loading Maps
                    </button>
                </div>
            `;
        }
        
        this.element.innerHTML = `
            <div class="map-selector-modal">
                <div class="map-selector-header">
                    <h2>Select Map</h2>
                    <button class="close-button" id="closeMapSelector">×</button>
                </div>
                
                <div class="map-selector-content">
                    <div class="map-selector-layout">
                        <div class="map-list-container">
                            <div class="map-list">
                                ${mapListContent}
                            </div>
                        </div>
                        
                        <div class="map-detail-container">
                            <div class="current-map-info">
                                <h3>Current Map</h3>
                                <div id="currentMapDisplay">
                                    <span class="current-map-name">Procedural World</span>
                                    <span class="current-map-description">Randomly generated world</span>
                                </div>
                            </div>
                            
                            <div class="selected-map-info" id="selectedMapInfo">
                                <h3>Selected Map</h3>
                                <div class="map-preview-large">
                                    <div class="map-preview-placeholder">
                                        <span class="map-icon">🗺️</span>
                                    </div>
                                </div>
                                <div class="map-detail-content">
                                    <h4 class="map-name" id="selectedMapName">Select a map</h4>
                                    <p class="map-description" id="selectedMapDescription">Choose a map from the list to view details</p>
                                    
                                    <div class="map-stats" id="selectedMapStats">
                                        <div class="map-stat">
                                            <span class="stat-label">Size:</span>
                                            <span class="stat-value" id="mapSizeStat">-</span>
                                        </div>
                                        <div class="map-stat">
                                            <span class="stat-label">Structures:</span>
                                            <span class="stat-value" id="structuresStat">-</span>
                                        </div>
                                        <div class="map-stat">
                                            <span class="stat-label">Paths:</span>
                                            <span class="stat-value" id="pathsStat">-</span>
                                        </div>
                                        <div class="map-stat">
                                            <span class="stat-label">Environment:</span>
                                            <span class="stat-value" id="environmentStat">-</span>
                                        </div>
                                    </div>
                                    
                                    <button class="load-map-button" id="loadSelectedMap" disabled>
                                        Load Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="loading-overlay" id="mapLoadingOverlay" style="display: none;">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading map...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.element);
    }

    setupEventListeners() {
        // Close button
        const closeButton = this.element.querySelector('#closeMapSelector');
        closeButton.addEventListener('click', () => this.hide());
        
        // Click outside to close
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });
        
        // Map list item selection
        const mapListItems = this.element.querySelectorAll('.map-list-item[data-map-id]');
        mapListItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectMap(item.dataset.mapId);
            });
        });
        
        // Generate New Map button in the list
        const generateNewMapBtn = this.element.querySelector('#generateNewMapBtn');
        if (generateNewMapBtn) {
            generateNewMapBtn.addEventListener('click', () => this.generateRandomMap());
        }
        
        // Load selected map button
        const loadSelectedMapButton = this.element.querySelector('#loadSelectedMap');
        if (loadSelectedMapButton) {
            loadSelectedMapButton.addEventListener('click', () => {
                if (this.selectedMap) {
                    this.loadMap(this.selectedMap.id);
                }
            });
        }
        
        // Retry loading maps button (only shown when maps failed to load)
        const retryButton = this.element.querySelector('#retryLoadMaps');
        if (retryButton) {
            retryButton.addEventListener('click', async () => {
                // Remove the current UI
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                
                // Try loading maps again
                await this.loadMapIndex();
            });
        }
        
        // Clear current map button
        const clearButton = this.element.querySelector('#clearCurrentMap');
        clearButton.addEventListener('click', () => this.clearCurrentMap());
        
        // Generate random map button (bottom button)
        const generateButton = this.element.querySelector('#generateRandomMap');
        if (generateButton) {
            generateButton.addEventListener('click', () => this.generateRandomMap());
        }
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show() {
        this.isVisible = true;
        this.element.style.display = 'flex';
        this.updateCurrentMapDisplay();
        
        // Add show animation
        requestAnimationFrame(() => {
            this.element.classList.add('show');
        });
    }

    hide() {
        this.isVisible = false;
        this.element.classList.remove('show');
        
        // Wait for animation to complete
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 300);
    }

    selectMap(mapId) {
        // Remove previous selection
        const previousSelected = this.element.querySelector('.map-list-item.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add selection to new item
        const selectedItem = this.element.querySelector(`.map-list-item[data-map-id="${mapId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            this.selectedMap = this.availableMaps.find(map => map.id === mapId);
            
            // Update the selected map details
            if (this.selectedMap) {
                const selectedMapName = this.element.querySelector('#selectedMapName');
                const selectedMapDescription = this.element.querySelector('#selectedMapDescription');
                const loadSelectedMapButton = this.element.querySelector('#loadSelectedMap');
                
                // Update map details
                if (selectedMapName) selectedMapName.textContent = this.selectedMap.name;
                if (selectedMapDescription) selectedMapDescription.textContent = this.selectedMap.description;
                if (loadSelectedMapButton) loadSelectedMapButton.disabled = false;
                
                // Update map stats if available
                const mapSizeStat = this.element.querySelector('#mapSizeStat');
                const structuresStat = this.element.querySelector('#structuresStat');
                const pathsStat = this.element.querySelector('#pathsStat');
                const environmentStat = this.element.querySelector('#environmentStat');
                
                if (mapSizeStat && this.selectedMap.mapSize) {
                    mapSizeStat.textContent = `${this.selectedMap.mapSize}x${this.selectedMap.mapSize}`;
                } else if (mapSizeStat) {
                    mapSizeStat.textContent = 'Standard';
                }
                
                if (this.selectedMap.stats) {
                    if (structuresStat) structuresStat.textContent = this.selectedMap.stats.structures || 0;
                    if (pathsStat) pathsStat.textContent = this.selectedMap.stats.paths || 0;
                    if (environmentStat) environmentStat.textContent = this.selectedMap.stats.environment || 0;
                }
                
                // Update preview image if available
                const previewContainer = this.element.querySelector('.map-preview-large');
                if (previewContainer && this.selectedMap.preview) {
                    previewContainer.innerHTML = `<img src="${this.selectedMap.preview}" alt="${this.selectedMap.name}" class="map-preview-image">`;
                } else if (previewContainer) {
                    previewContainer.innerHTML = `
                        <div class="map-preview-placeholder">
                            <span class="map-icon">🗺️</span>
                        </div>
                    `;
                }
            }
        }
    }

    async loadMap(mapId) {
        if (this.isLoading) return;
        
        const map = this.availableMaps.find(m => m.id === mapId);
        if (!map) {
            console.error('Map not found:', mapId);
            return;
        }
        
        this.setLoading(true, `Loading ${map.name}...`);
        
        try {
            // Construct the path to the map file
            const mapPath = `assets/maps/${map.filename}`;
            
            // Load the map using WorldManager (accessed via this.game.world)
            const success = await this.game.world.loadPreGeneratedMapFromFile(mapPath);
            
            if (success) {
                this.updateCurrentMapDisplay();
                this.hide();
                
                // Show success message
                if (this.game.ui) {
                    this.game.ui.showMessage(`${map.name} loaded successfully!`, 3000);
                }
            } else {
                // Show error message
                if (this.game.ui) {
                    this.game.ui.showMessage(`Failed to load ${map.name}`, 3000);
                }
            }
        } catch (error) {
            console.error('Error loading map:', error);
            
            if (this.game.ui) {
                this.game.ui.showMessage('Error loading map', 3000);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async clearCurrentMap() {
        if (this.isLoading) return;
        
        this.setLoading(true, 'Returning to procedural world...');
        
        try {
            const success = await this.game.world.clearCurrentMap();
            
            if (success) {
                this.updateCurrentMapDisplay();
                this.hide();
            }
        } catch (error) {
            console.error('Error clearing map:', error);
            
            if (this.game.ui) {
                this.game.ui.showMessage('Error clearing map', 3000);
            }
        } finally {
            this.setLoading(false);
        }
    }

    async generateRandomMap() {
        if (this.isLoading) return;
        
        // Check if maps are available
        if (this.availableMaps.length === 0) {
            if (this.game.ui) {
                this.game.ui.showMessage('No maps available to generate from. Please check assets/maps/index.json', 3000);
            }
            return;
        }
        
        // Select a random map theme
        const randomMap = this.availableMaps[Math.floor(Math.random() * this.availableMaps.length)];
        
        this.setLoading(true, `Generating random ${randomMap.name}...`);
        
        try {
            // For now, just load the sample map
            // In the future, this could generate a new random map with the same theme
            await this.loadMap(randomMap.id);
        } catch (error) {
            console.error('Error generating random map:', error);
            this.setLoading(false);
            
            if (this.game.ui) {
                this.game.ui.showMessage('Error generating random map', 3000);
            }
        }
    }

    updateCurrentMapDisplay() {
        const currentMapDisplay = this.element.querySelector('#currentMapDisplay');
        
        // Check if world exists before trying to access it
        if (this.game && this.game.world) {
            const mapInfo = this.game.world.getCurrentMapInfo();
            
            if (mapInfo) {
                currentMapDisplay.innerHTML = `
                    <span class="current-map-name">${mapInfo.theme}</span>
                    <span class="current-map-description">${mapInfo.description}</span>
                    <div class="current-map-stats">
                        Structures: ${mapInfo.objectCounts.structures} | 
                        Paths: ${mapInfo.objectCounts.paths} | 
                        Environment: ${mapInfo.objectCounts.environment}
                    </div>
                `;
                return;
            }
        }
        
        // Default display if no worldManager or no mapInfo
        currentMapDisplay.innerHTML = `
            <span class="current-map-name">Procedural World</span>
            <span class="current-map-description">Randomly generated world</span>
        `;
    }

    setLoading(loading, message = 'Loading...') {
        this.isLoading = loading;
        const loadingOverlay = this.element.querySelector('#mapLoadingOverlay');
        const loadingText = this.element.querySelector('.loading-text');
        
        if (loading) {
            loadingText.textContent = message;
            loadingOverlay.style.display = 'flex';
        } else {
            loadingOverlay.style.display = 'none';
        }
        
        // Disable/enable buttons
        const buttons = this.element.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = loading;
        });
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}