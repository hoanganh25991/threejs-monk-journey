import { UIComponent } from '../UIComponent.js';

/**
 * Map Selector UI Component
 * Allows players to select and load different pre-generated maps
 */
export class MapSelectorUI extends UIComponent {
    constructor(game) {
        super();
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
        
        // Generate map grid content based on available maps
        let mapGridContent = '';
        
        if (this.availableMaps.length > 0) {
            mapGridContent = this.availableMaps.map(map => `
                <div class="map-card" data-map-id="${map.id}">
                    <div class="map-preview">
                        <div class="map-preview-placeholder">
                            <span class="map-icon">🗺️</span>
                        </div>
                    </div>
                    <div class="map-info">
                        <h4 class="map-name">${map.name}</h4>
                        <p class="map-description">${map.description}</p>
                        <button class="load-map-button" data-map-id="${map.id}">
                            Load Map
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            mapGridContent = `
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
                    <div class="current-map-info">
                        <h3>Current Map</h3>
                        <div id="currentMapDisplay">
                            <span class="current-map-name">Procedural World</span>
                            <span class="current-map-description">Randomly generated world</span>
                        </div>
                    </div>
                    
                    <div class="map-grid">
                        ${mapGridContent}
                    </div>
                    
                    <div class="map-actions">
                        <button class="action-button secondary" id="clearCurrentMap">
                            Return to Procedural World
                        </button>
                        <button class="action-button primary" id="generateRandomMap" ${this.availableMaps.length === 0 ? 'disabled' : ''}>
                            Generate Random Map
                        </button>
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
        
        // Map card selection (only if maps are available)
        const mapCards = this.element.querySelectorAll('.map-card');
        mapCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('load-map-button')) {
                    this.selectMap(card.dataset.mapId);
                }
            });
        });
        
        // Load map buttons (only if maps are available)
        const loadButtons = this.element.querySelectorAll('.load-map-button');
        loadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadMap(button.dataset.mapId);
            });
        });
        
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
        
        // Generate random map button
        const generateButton = this.element.querySelector('#generateRandomMap');
        generateButton.addEventListener('click', () => this.generateRandomMap());
        
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
        const previousSelected = this.element.querySelector('.map-card.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add selection to new card
        const selectedCard = this.element.querySelector(`[data-map-id="${mapId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedMap = this.availableMaps.find(map => map.id === mapId);
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
            
            // Load the map using WorldManager
            const success = await this.game.worldManager.loadPreGeneratedMapFromFile(mapPath);
            
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
            const success = await this.game.worldManager.clearCurrentMap();
            
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
        const mapInfo = this.game.worldManager.getCurrentMapInfo();
        
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
        } else {
            currentMapDisplay.innerHTML = `
                <span class="current-map-name">Procedural World</span>
                <span class="current-map-description">Randomly generated world</span>
            `;
        }
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