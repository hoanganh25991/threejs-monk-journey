import { UIComponent } from '../UIComponent.js';

/**
 * Map Selector UI Component
 * Allows players to select and load different pre-generated maps
 * Uses declarative HTML structure defined in index.html
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
        
        // Get reference to the existing element in the DOM
        this.element = document.getElementById('map-selector-overlay');
        
        // Set initial display style
        if (this.element) {
            this.element.style.display = 'none';
        }
        
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
            
            console.debug(`Loaded ${this.availableMaps.length} maps from index.json`);
            
            // Update the map list with available maps
            this.updateMapList();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error loading map index:', error);
            
            // Set empty maps array
            this.availableMaps = [];
            
            // Update UI with empty maps array
            this.updateMapList();
            this.setupEventListeners();
            
            // Show error message in UI
            if (this.game.ui) {
                this.game.ui.showMessage('Failed to load map data. Please check your connection and try again.', 5000);
            }
        }
    }

    /**
     * Update the map list with available maps
     */
    updateMapList() {
        const mapListElement = this.element.querySelector('#map-list');
        
        if (!mapListElement) {
            console.error('Map list element not found in the DOM');
            return;
        }
        
        // Clear existing content
        mapListElement.innerHTML = '';
        
        console.debug('Updating map list with', this.availableMaps.length, 'maps');
        
        if (this.availableMaps.length > 0) {
            // Add maps to the list
            this.availableMaps.forEach(map => {
                console.debug('Adding map to list:', map.id, map.name);
                
                const mapItem = document.createElement('div');
                mapItem.className = 'map-list-item';
                mapItem.setAttribute('data-map-id', map.id); // Use setAttribute for better compatibility
                
                // Add a direct click handler for immediate functionality
                mapItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.debug('Map item clicked directly from updateMapList:', map.id);
                    this.selectMap(map.id);
                });
                
                mapItem.innerHTML = `
                    <div class="map-list-preview">
                        <div class="map-preview-placeholder">
                            <span class="map-icon">🗺️</span>
                        </div>
                    </div>
                    <div class="map-list-name">${map.name}</div>
                `;
                
                mapListElement.appendChild(mapItem);
            });
            
            // Add a small delay to ensure the list is properly rendered before allowing scrolling
            setTimeout(() => {
                const mapList = this.element.querySelector('#map-list');
                if (mapList) {
                    mapList.style.overflowY = 'auto';
                }
            }, 100);
        } else {
            // Show no maps message
            const noMapsMessage = document.createElement('div');
            noMapsMessage.className = 'no-maps-message';
            noMapsMessage.innerHTML = `
                <p>No maps available. Please check that assets/maps/index.json exists and is properly formatted.</p>
                <button class="action-button secondary" id="retryLoadMaps">
                    Retry Loading Maps
                </button>
            `;
            
            mapListElement.appendChild(noMapsMessage);
        }
    }

    setupEventListeners() {
        if (!this.element) {
            console.error('Map selector element not found in the DOM');
            return;
        }
        
        // Save & Close button - handles loading the selected map
        const closeButton = this.element.querySelector('#closeMapSelector');
        if (closeButton) {
            // Remove any existing event listeners
            closeButton.replaceWith(closeButton.cloneNode(true));
            // Add new event listener
            this.element.querySelector('#closeMapSelector').addEventListener('click', () => this.saveAndClose());
        }
        
        // Click outside to close
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });
        
        // Map list item selection - use event delegation for dynamically created items
        const mapList = this.element.querySelector('#map-list');
        if (mapList) {
            // Remove all existing event listeners to prevent duplicates
            const newMapList = mapList.cloneNode(true);
            mapList.parentNode.replaceChild(newMapList, mapList);
            
            // Add direct click handlers to each map item for maximum compatibility
            const mapItems = newMapList.querySelectorAll('.map-list-item');
            mapItems.forEach(item => {
                if (item.hasAttribute('data-map-id')) {
                    const mapId = item.getAttribute('data-map-id');
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.debug('Map item clicked directly:', mapId);
                        this.selectMap(mapId);
                    });
                }
            });
            
            // Also add event delegation as a fallback
            newMapList.addEventListener('click', (e) => {
                console.debug('Map list clicked', e.target);
                
                // Find the closest map-list-item parent from the clicked element
                const mapItem = e.target.closest('.map-list-item');
                console.debug('Found map item:', mapItem);
                
                if (mapItem && mapItem.hasAttribute('data-map-id')) {
                    const mapId = mapItem.getAttribute('data-map-id');
                    console.debug('Map ID from delegation:', mapId);
                    this.selectMap(mapId);
                }
            });
        }
        
        // Generate New Map button
        const generateNewMapBtn = this.element.querySelector('#generateRandomMap');
        if (generateNewMapBtn) {
            // Remove any existing event listeners
            generateNewMapBtn.replaceWith(generateNewMapBtn.cloneNode(true));
            // Add new event listener
            this.element.querySelector('#generateRandomMap').addEventListener('click', () => this.generateRandomMap());
        }
        
        // Retry loading maps button (only shown when maps failed to load)
        const retryButton = this.element.querySelector('#retryLoadMaps');
        if (retryButton) {
            retryButton.addEventListener('click', async () => {
                // Try loading maps again
                await this.loadMapIndex();
            });
        }
        
        // Clear current map button
        const clearButton = this.element.querySelector('#clearCurrentMap');
        if (clearButton) {
            // Remove any existing event listeners
            clearButton.replaceWith(clearButton.cloneNode(true));
            // Add new event listener
            this.element.querySelector('#clearCurrentMap').addEventListener('click', () => this.clearCurrentMap());
        }
        
        // Escape key to close
        // Use a named function to avoid adding multiple listeners
        if (!this._escapeKeyHandler) {
            this._escapeKeyHandler = (e) => {
                if (e.key === 'Escape' && this.isVisible) {
                    this.hide();
                }
            };
            document.addEventListener('keydown', this._escapeKeyHandler);
        }
    }

    show() {
        this.isVisible = true;
        this.element.style.display = 'flex';
        
        // Pause the game when map selector is opened
        if (this.game && typeof this.game.pause === 'function') {
            this.game.pause(false);
            console.debug('Game paused while map selector is open');
        }
        
        // Add show animation
        requestAnimationFrame(() => {
            this.element.classList.add('show');
            
            // Ensure map list is scrollable
            setTimeout(() => {
                this.setupEventListeners();
            }, 100);
        });
    }

    hide() {
        this.isVisible = false;
        this.element.classList.remove('show');
        
        // Unpause the game when map selector is closed
        if (this.game && typeof this.game.pause === 'function') {
            this.game.resume(false);
            console.debug('Game unpaused after map selector is closed');
        }
        
        // Wait for animation to complete
        setTimeout(() => {
            this.element.style.display = 'none';
        }, 300);
    }

    async saveAndClose() {
        // If a map is selected, load it before closing
        if (this.selectedMap) {
            await this.loadMap(this.selectedMap.id);
        } else {
            // If no map is selected, just close
            this.hide();
        }
    }

    selectMap(mapId) {
        console.debug('Selecting map with ID:', mapId);
        
        // Remove previous selection
        const previousSelected = this.element.querySelector('.map-list-item.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add selection to new item - use attribute selector for better compatibility
        const selectedItem = this.element.querySelector(`.map-list-item[data-map-id="${mapId}"]`);
        console.debug('Found selected item:', selectedItem);
        
        if (selectedItem) {
            selectedItem.classList.add('selected');
            
            // Find the map data in our available maps array
            this.selectedMap = this.availableMaps.find(map => map.id === mapId);
            console.debug('Selected map data:', this.selectedMap);
            
            // Update the selected map details
            if (this.selectedMap) {
                const selectedMapName = this.element.querySelector('#selectedMapName');
                const selectedMapDescription = this.element.querySelector('#selectedMapDescription');
                
                // Update map details
                if (selectedMapName) selectedMapName.textContent = this.selectedMap.name;
                if (selectedMapDescription) selectedMapDescription.textContent = this.selectedMap.description || 'No description available';
                
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
                } else {
                    // Set default values if stats are not available
                    if (structuresStat) structuresStat.textContent = '-';
                    if (pathsStat) pathsStat.textContent = '-';
                    if (environmentStat) environmentStat.textContent = '-';
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
        } else {
            console.error('Could not find map item with ID:', mapId);
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
            const success = await this.game.world.loadMap(map.filename);
            
            if (success) {
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
        // Remove event listeners
        if (this._escapeKeyHandler) {
            document.removeEventListener('keydown', this._escapeKeyHandler);
            this._escapeKeyHandler = null;
        }
        
        // Since we're using the declarative HTML structure, we don't remove the element
        // Just hide it and clean up any dynamic content
        if (this.element) {
            this.hide();
            
            // Clear map list
            const mapList = this.element.querySelector('#map-list');
            if (mapList) {
                mapList.innerHTML = '';
            }
        }
    }
}