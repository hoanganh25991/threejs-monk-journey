/**
 * initial-load-progress.js
 * Tracks the loading progress of critical resources during initial page load
 */

(function() {
    // Configuration
    const CRITICAL_RESOURCES = [
        { type: 'html', url: 'index.html', weight: 5 },
        { type: 'css', url: 'css/main.css', weight: 10 },
        { type: 'css', url: 'css/core/menu-system.css', weight: 10 },
        { type: 'css', url: 'css/core/hud-manager.css', weight: 10 },
        { type: 'css', url: 'css/layout.css', weight: 5 },
        { type: 'js', url: 'js/main.js', weight: 15 },
        { type: 'js', url: 'js/core/game/Game.js', weight: 15 },
        { type: 'image', url: 'assets/images/background.jpg', weight: 30 }
    ];
    
    // Total weight of all resources
    const TOTAL_WEIGHT = CRITICAL_RESOURCES.reduce((sum, resource) => sum + resource.weight, 0);
    
    // State variables
    let loadedResources = 0;
    let totalProgress = 0;
    let loadingStartTime = Date.now();
    let loadingElement = null;
    let loadingBarElement = null;
    let loadingTextElement = null;
    let loadingInfoElement = null;
    
    // Create and show loading indicator
    function createLoadingIndicator() {
        // Check if loading screen already exists in the DOM
        loadingElement = document.getElementById('loading-screen');
        
        if (loadingElement) {
            // Get existing elements
            loadingBarElement = document.getElementById('loading-bar');
            
            // Create additional elements for detailed progress
            const loadingContainer = loadingElement.querySelector('h2').parentNode;
            
            // Create loading text element if it doesn't exist
            loadingTextElement = document.createElement('p');
            loadingTextElement.id = 'loading-text';
            loadingTextElement.style.fontSize = '14px';
            loadingTextElement.style.color = '#ccc';
            loadingTextElement.style.margin = '10px 0';
            loadingTextElement.textContent = 'Loading resources...';
            
            // Create loading info element if it doesn't exist
            loadingInfoElement = document.createElement('p');
            loadingInfoElement.id = 'loading-info';
            loadingInfoElement.style.fontSize = '12px';
            loadingInfoElement.style.color = '#999';
            loadingInfoElement.style.margin = '5px 0';
            loadingInfoElement.style.maxWidth = '80%';
            loadingInfoElement.style.textAlign = 'center';
            loadingInfoElement.textContent = 'Preparing game assets...';
            
            // Add elements to the loading container
            loadingContainer.appendChild(loadingTextElement);
            loadingContainer.appendChild(loadingInfoElement);
        } else {
            // Create loading indicator from scratch if it doesn't exist yet
            loadingElement = document.createElement('div');
            loadingElement.id = 'initial-loading-indicator';
            loadingElement.style.position = 'fixed';
            loadingElement.style.top = '0';
            loadingElement.style.left = '0';
            loadingElement.style.width = '100%';
            loadingElement.style.height = '100%';
            loadingElement.style.backgroundColor = '#000';
            loadingElement.style.display = 'flex';
            loadingElement.style.flexDirection = 'column';
            loadingElement.style.justifyContent = 'center';
            loadingElement.style.alignItems = 'center';
            loadingElement.style.zIndex = '9999';
            
            // Create loading title
            const loadingTitle = document.createElement('h2');
            loadingTitle.textContent = 'Loading Monk Journey...';
            loadingTitle.style.color = '#fff';
            loadingTitle.style.marginBottom = '20px';
            loadingTitle.style.fontSize = '24px';
            
            // Create loading bar container
            const loadingBarContainer = document.createElement('div');
            loadingBarContainer.style.width = '300px';
            loadingBarContainer.style.height = '20px';
            loadingBarContainer.style.backgroundColor = '#333';
            loadingBarContainer.style.borderRadius = '10px';
            loadingBarContainer.style.overflow = 'hidden';
            
            // Create loading bar
            loadingBarElement = document.createElement('div');
            loadingBarElement.style.height = '100%';
            loadingBarElement.style.width = '0%';
            loadingBarElement.style.backgroundColor = '#ff6600';
            loadingBarElement.style.transition = 'width 0.3s';
            
            // Create loading text
            loadingTextElement = document.createElement('p');
            loadingTextElement.id = 'loading-text';
            loadingTextElement.style.fontSize = '14px';
            loadingTextElement.style.color = '#ccc';
            loadingTextElement.style.margin = '10px 0';
            loadingTextElement.textContent = 'Loading resources...';
            
            // Create loading info
            loadingInfoElement = document.createElement('p');
            loadingInfoElement.id = 'loading-info';
            loadingInfoElement.style.fontSize = '12px';
            loadingInfoElement.style.color = '#999';
            loadingInfoElement.style.margin = '5px 0';
            loadingInfoElement.style.maxWidth = '80%';
            loadingInfoElement.style.textAlign = 'center';
            loadingInfoElement.textContent = 'Preparing game assets...';
            
            // Assemble the loading indicator
            loadingBarContainer.appendChild(loadingBarElement);
            loadingElement.appendChild(loadingTitle);
            loadingElement.appendChild(loadingBarContainer);
            loadingElement.appendChild(loadingTextElement);
            loadingElement.appendChild(loadingInfoElement);
            
            // Add to document body as soon as it's available
            if (document.body) {
                document.body.appendChild(loadingElement);
            } else {
                // If body is not available yet, wait for it
                window.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(loadingElement);
                });
            }
        }
    }
    
    // Update loading progress
    function updateProgress(resource, loaded) {
        if (!loadingBarElement) return;
        
        // Calculate progress based on resource weight
        const resourceProgress = (loaded ? resource.weight : 0) / TOTAL_WEIGHT * 100;
        totalProgress += resourceProgress;
        
        // Update loading bar
        loadingBarElement.style.width = `${Math.min(totalProgress, 100)}%`;
        
        // Update loading text
        if (loadingTextElement) {
            loadingTextElement.textContent = `Loading resources... ${Math.round(totalProgress)}%`;
        }
        
        // Update loading info
        if (loadingInfoElement) {
            loadingInfoElement.textContent = `Loading: ${resource.url.split('/').pop()}`;
        }
        
        // If all resources are loaded, show 100%
        if (++loadedResources >= CRITICAL_RESOURCES.length) {
            loadingBarElement.style.width = '100%';
            if (loadingTextElement) {
                const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
                loadingTextElement.textContent = `Loading complete in ${loadTime}s`;
            }
            if (loadingInfoElement) {
                loadingInfoElement.textContent = 'Initializing game...';
            }
        }
    }
    
    // Track resource loading using Performance API
    function trackResourceLoading() {
        // Create a map of resources to track
        const resourceMap = new Map(
            CRITICAL_RESOURCES.map(resource => [resource.url.split('/').pop(), resource])
        );
        
        // Use Performance Observer to track resource loading
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    // Extract filename from URL
                    const url = entry.name;
                    const filename = url.split('/').pop();
                    
                    // Check if this is one of our tracked resources
                    if (resourceMap.has(filename)) {
                        const resource = resourceMap.get(filename);
                        updateProgress(resource, true);
                        resourceMap.delete(filename); // Remove from tracking
                    }
                });
            });
            
            // Start observing resource timing entries
            observer.observe({ entryTypes: ['resource'] });
        }
        
        // Fallback for browsers without PerformanceObserver
        window.addEventListener('load', () => {
            // Mark all remaining resources as loaded
            resourceMap.forEach(resource => {
                updateProgress(resource, true);
            });
            
            // Ensure we show 100% at the end
            if (loadingBarElement) {
                loadingBarElement.style.width = '100%';
            }
        });
    }
    
    // Initialize loading tracking
    function init() {
        // Create loading indicator
        createLoadingIndicator();
        
        // Start tracking resource loading
        trackResourceLoading();
        
        // Set a minimum loading time to prevent flickering
        setTimeout(() => {
            // If loading is taking too long, show a message
            if (totalProgress < 100 && loadingInfoElement) {
                loadingInfoElement.textContent = 'Loading is taking longer than expected. Please wait...';
            }
        }, 5000);
        
        // Fallback for slow connections - simulate progress if nothing happens
        let fallbackProgress = 0;
        const fallbackInterval = setInterval(() => {
            if (totalProgress < 5) {
                fallbackProgress += 1;
                if (loadingBarElement) {
                    loadingBarElement.style.width = `${fallbackProgress}%`;
                }
                if (loadingTextElement) {
                    loadingTextElement.textContent = `Preparing resources... ${fallbackProgress}%`;
                }
                
                // Stop fallback after reaching 30%
                if (fallbackProgress >= 30) {
                    clearInterval(fallbackInterval);
                }
            } else {
                // Real progress is happening, stop fallback
                clearInterval(fallbackInterval);
            }
        }, 100);
        
        // Make sure we don't interfere with the game's loading screen
        // Remove our indicator when the game's loading screen appears
        const checkForGameLoading = setInterval(() => {
            const gameLoadingScreen = document.getElementById('loading-screen');
            const initialIndicator = document.getElementById('initial-loading-indicator');
            
            if (gameLoadingScreen && 
                initialIndicator && 
                window.getComputedStyle(gameLoadingScreen).display !== 'none') {
                // Game loading screen is visible, remove our indicator
                initialIndicator.parentNode.removeChild(initialIndicator);
                clearInterval(checkForGameLoading);
                console.log('Initial loading indicator removed, game loading screen active');
            }
        }, 100);
        
        // Safety cleanup - remove our indicator after a reasonable time
        // This ensures we don't block the game menu if something goes wrong
        setTimeout(() => {
            const initialIndicator = document.getElementById('initial-loading-indicator');
            if (initialIndicator) {
                initialIndicator.parentNode.removeChild(initialIndicator);
                console.log('Initial loading indicator removed by safety timeout');
            }
        }, 15000); // 15 seconds should be more than enough for initial loading
    }
    
    // Start tracking as soon as possible
    init();
})();