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
        
        // Available maps (will be populated from server or local files)
        this.availableMaps = [
            {
                id: 'dark_forest',
                name: 'Dark Forest',
                description: 'Dense forest with winding paths, hidden villages, and ancient towers',
                filename: 'dark_forest_sample.json',
                preview: 'images/map-previews/dark_forest.jpg'
            },
            {
                id: 'frozen_mountains',
                name: 'Frozen Mountains',
                description: 'Icy peaks with mountain villages, watchtowers, and treacherous paths',
                filename: 'frozen_mountains_sample.json',
                preview: 'images/map-previews/frozen_mountains.jpg'
            },
            {
                id: 'lava_zone',
                name: 'Lava Zone',
                description: 'Volcanic landscape with lava flows, dark sanctums, and fire-resistant structures',
                filename: 'lava_zone_sample.json',
                preview: 'images/map-previews/lava_zone.jpg'
            },
            {
                id: 'mystical_swamp',
                name: 'Mystical Swamp',
                description: 'Mysterious wetlands with floating bridges, ancient ruins, and hidden paths',
                filename: 'mystical_swamp_sample.json',
                preview: 'images/map-previews/mystical_swamp.jpg'
            },
            {
                id: 'ancient_ruins',
                name: 'Ancient Ruins',
                description: 'Vast archaeological site with connected ruins, overgrown paths, and forgotten towers',
                filename: 'ancient_ruins_sample.json',
                preview: 'images/map-previews/ancient_ruins.jpg'
            }
        ];
        
        this.selectedMap = null;
        this.isLoading = false;
        
        this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        // Create main container
        this.element = document.createElement('div');
        this.element.className = 'map-selector-overlay';
        this.element.style.display = 'none';
        
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
                        ${this.availableMaps.map(map => `
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
                        `).join('')}
                    </div>
                    
                    <div class="map-actions">
                        <button class="action-button secondary" id="clearCurrentMap">
                            Return to Procedural World
                        </button>
                        <button class="action-button primary" id="generateRandomMap">
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
        
        // Map card selection
        const mapCards = this.element.querySelectorAll('.map-card');
        mapCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('load-map-button')) {
                    this.selectMap(card.dataset.mapId);
                }
            });
        });
        
        // Load map buttons
        const loadButtons = this.element.querySelectorAll('.load-map-button');
        loadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadMap(button.dataset.mapId);
            });
        });
        
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
            const mapPath = `generated-maps/${map.filename}`;
            
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