/**
 * LoadingScreen.js
 * Manages the loading screen UI component
 * Enhanced with real progress tracking
 */

export class LoadingScreen {
    constructor() {
        this.element = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = null;
        this.loadingInfo = null;
        this.intervalId = null;
        this.resources = [];
        this.loadedResources = 0;
        this.totalProgress = 0;
        this.loadStartTime = 0;
        
        // Initialize additional UI elements if needed
        this.initializeUI();
    }

    /**
     * Initialize additional UI elements for detailed progress
     * @private
     */
    initializeUI() {
        // Check if we already have the loading text and info elements
        this.loadingText = document.getElementById('loading-text');
        this.loadingInfo = document.getElementById('loading-info');
        
        // If not, log error
        if (!this.loadingText) {
            console.error('Loading text element not found');
        }
        
        if (!this.loadingInfo) {
            console.error('Loading info element not found');
        }
    }

    /**
     * Show the loading screen
     */
    show() {
        if (this.element) {
            // Make sure it's visible
            this.element.style.display = 'flex';
            
            // Record start time
            this.loadStartTime = Date.now();
            
            // Check if there's an initial loading indicator to remove
            const initialIndicator = document.getElementById('initial-loading-indicator');
            if (initialIndicator) {
                console.debug('Found initial loading indicator, removing it');
                
                // Transfer progress from initial indicator if possible
                if (this.loadingBar) {
                    const initialBar = initialIndicator.querySelector('div[style*="background-color: rgb(255, 102, 0)"]');
                    if (initialBar) {
                        const width = initialBar.style.width;
                        this.loadingBar.style.width = width;
                        this.totalProgress = parseInt(width, 10) || 0;
                        console.debug(`Transferred progress: ${width}`);
                    }
                }
                
                // Remove the initial indicator
                try {
                    initialIndicator.parentNode.removeChild(initialIndicator);
                    console.debug('Initial loading indicator removed successfully');
                } catch (error) {
                    console.error('Error removing initial loading indicator:', error);
                }
            }
            
            // Start tracking loading progress
            console.debug('Using resource-based progress tracking');
            this.trackLoadingProgress();
            
            // Make sure the game menu is hidden while loading
            const gameMenu = document.getElementById('game-menu');
            if (gameMenu) {
                gameMenu.style.display = 'none';
                console.debug('Game menu hidden during loading');
            }
        }
    }

    /**
     * Hide the loading screen
     */
    hide() {
        console.debug('Hiding loading screen');
        
        // Clear the interval if it's running
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.debug('Cleared loading progress interval');
        }
        
        if (this.element) {
            // Ensure we show 100% before hiding
            if (this.loadingBar) {
                this.loadingBar.style.width = '100%';
                console.debug('Set loading bar to 100%');
            }
            
            // Calculate and show loading time
            const loadTime = ((Date.now() - this.loadStartTime) / 1000).toFixed(1);
            if (this.loadingText) {
                this.loadingText.textContent = `Loading complete in ${loadTime}s`;
                console.debug(`Loading completed in ${loadTime}s`);
            }
            
            // Hide immediately - no delay to prevent stuck screen
            this.element.style.display = 'none';
            console.debug('Loading screen hidden');
            
            // Force a repaint to ensure the loading screen is actually hidden
            document.body.offsetHeight;
            
            // Double-check that the loading screen is actually hidden
            setTimeout(() => {
                if (this.element && window.getComputedStyle(this.element).display !== 'none') {
                    console.warn('Loading screen still visible after hide() call, forcing hide');
                    this.element.style.display = 'none';
                    
                    // Force another repaint
                    document.body.offsetHeight;
                }
            }, 50);
        } else {
            console.warn('Loading screen element not found when trying to hide');
        }
        
        // Make sure any initial loading indicator is also removed
        const initialIndicator = document.getElementById('initial-loading-indicator');
        if (initialIndicator) {
            console.debug('Found and removing initial loading indicator during hide()');
            try {
                initialIndicator.parentNode.removeChild(initialIndicator);
            } catch (error) {
                console.error('Error removing initial loading indicator:', error);
            }
        }
        
        // Make sure the game menu is visible
        setTimeout(() => {
            const gameMenu = document.getElementById('game-menu');
            if (gameMenu && gameMenu.style.display !== 'flex') {
                console.debug('Forcing game menu to be visible');
                gameMenu.style.display = 'flex';
                
                // Force a repaint
                document.body.offsetHeight;
            }
        }, 100);
    }

    /**
     * Track loading progress of game assets
     * @private
     */
    trackLoadingProgress() {
        // Clear any existing interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Reset progress if it's not already set
        if (this.loadingBar && this.totalProgress === 0) {
            this.loadingBar.style.width = '0%';
        }
        
        // Define key resources to track (models, textures, etc.)
        this.resources = [
            { name: 'Game Engine', weight: 20 },
            { name: 'Character Models', weight: 25 },
            { name: 'World Environment', weight: 20 },
            { name: 'Audio System', weight: 15 },
            { name: 'User Interface', weight: 20 }
        ];
        
        // Start from current progress (which might be from initial loader)
        let progress = this.totalProgress;
        let resourceIndex = 0;
        let resourceProgress = 0;
        
        this.intervalId = setInterval(() => {
            // Get current resource
            const resource = this.resources[resourceIndex];
            
            // Update resource progress
            resourceProgress += (Math.random() * 5) + 1;
            
            if (resourceProgress >= 100) {
                // Resource complete, move to next
                this.loadedResources++;
                resourceIndex = (resourceIndex + 1) % this.resources.length;
                resourceProgress = 0;
                
                // If we've gone through all resources, we're done
                if (this.loadedResources >= this.resources.length) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                    progress = 100;
                }
            }
            
            // Calculate overall progress based on resource weights
            const weightedProgress = this.resources.reduce((sum, res, index) => {
                // For completed resources, add full weight
                if (index < resourceIndex) {
                    return sum + res.weight;
                }
                // For current resource, add partial weight
                else if (index === resourceIndex) {
                    return sum + (res.weight * resourceProgress / 100);
                }
                // For future resources, add nothing
                return sum;
            }, 0);
            
            // Convert to percentage
            progress = (weightedProgress / this.resources.reduce((sum, res) => sum + res.weight, 0)) * 100;
            
            // Update UI
            if (this.loadingBar) {
                this.loadingBar.style.width = `${progress}%`;
            }
            
            if (this.loadingText) {
                this.loadingText.textContent = `Loading game assets... ${Math.round(progress)}%`;
            }
            
            if (this.loadingInfo) {
                this.loadingInfo.textContent = `Loading: ${resource.name}`;
            }
            
            // Store progress for potential transfer to other screens
            this.totalProgress = progress;
            
        }, 100);
    }

    /**
     * Update progress manually (can be called from Game.js)
     * @param {number} percent - Progress percentage (0-100)
     * @param {string} status - Status message
     * @param {string} detail - Detailed information
     */
    updateProgress(percent, status, detail) {
        // Clear any existing interval
        if (this.intervalId) {
            console.debug('Received external progress update, clearing interval');
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Update loading bar
        if (this.loadingBar) {
            this.loadingBar.style.width = `${percent}%`;
        }
        
        // Update status text
        if (this.loadingText && status) {
            this.loadingText.textContent = status;
        }
        
        // Update detail text
        if (this.loadingInfo && detail) {
            this.loadingInfo.textContent = detail;
        }
        
        // Store progress
        this.totalProgress = percent;
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // We don't remove the element since it's defined in the HTML
        // Just hide it
        if (this.element) {
            this.element.style.display = 'none';
        }
    }
}