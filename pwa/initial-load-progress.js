/**
 * initial-load-progress.js
 * Simple time-based loading progress indicator
 */

(function() {
    // State variables
    let progressInterval = null;
    let loadingStartTime = Date.now();
    let loadingElement = null;
    let loadingBarElement = null;
    let loadingTextElement = null;
    let loadingInfoElement = null;
    
    // Estimated loading times in milliseconds
    const ESTIMATED_LOADING_TIME = 20000; // 20 seconds
    
    // Flag to track if window load event has fired
    let windowLoaded = false;
    
    // Create and show loading indicator
    function createLoadingIndicator() {
        // Create loading indicator from scratch
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
        loadingInfoElement.textContent = 'Downloading game assets...';
        
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
    
    // Update progress based on time
    function updateTimeBasedProgress() {
        if (!loadingBarElement) return;
        
        // Calculate progress based on elapsed time
        const elapsedTime = Date.now() - loadingStartTime;
        let progress = Math.min((elapsedTime / ESTIMATED_LOADING_TIME) * 100, 99);
        
        // If window has loaded, go to 100%
        if (windowLoaded) {
            progress = 100;
        }
        
        // Update loading bar
        loadingBarElement.style.width = `${Math.round(progress)}%`;
        
        // Update loading text
        if (loadingTextElement) {
            loadingTextElement.textContent = `Loading resources... ${Math.round(progress)}%`;
        }
        
        // Update loading info based on progress
        if (loadingInfoElement) {
            if (progress < 20) {
                loadingInfoElement.textContent = 'Downloading game assets...';
            } else if (progress < 40) {
                loadingInfoElement.textContent = 'Loading 3D models...';
            } else if (progress < 60) {
                loadingInfoElement.textContent = 'Preparing game world...';
            } else if (progress < 80) {
                loadingInfoElement.textContent = 'Initializing game engine...';
            } else if (progress < 100) {
                loadingInfoElement.textContent = 'Almost ready...';
            } else {
                loadingInfoElement.textContent = 'Starting game...';
            }
        }
        
        // If we're at 100%, show completion message
        if (progress >= 100) {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            
            if (loadingTextElement) {
                const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
                loadingTextElement.textContent = `Loading complete in ${loadTime}s`;
            }
            
            if (loadingInfoElement) {
                loadingInfoElement.textContent = 'Initializing game...';
            }
        }
    }
    
    // Remove loading indicator
    function removeLoadingIndicator() {
        if (loadingElement && loadingElement.parentNode) {
            try {
                loadingElement.parentNode.removeChild(loadingElement);
                console.log('Initial loading indicator removed');
            } catch (e) {
                console.error('Error removing initial loading indicator:', e);
            }
        }
    }
    
    // Initialize loading tracking
    function init() {
        console.log('Initializing loading progress tracker');
        
        // Create loading indicator
        createLoadingIndicator();
        
        // Start with some initial progress
        if (loadingBarElement) {
            loadingBarElement.style.width = '5%';
        }
        
        // Start progress interval
        progressInterval = setInterval(updateTimeBasedProgress, 100);
        
        // Listen for window load event
        window.addEventListener('load', () => {
            console.log('Window load event fired');
            windowLoaded = true;
            
            // Ensure we show 100% at the end
            setTimeout(() => {
                if (loadingBarElement) {
                    loadingBarElement.style.width = '100%';
                    
                    if (loadingTextElement) {
                        const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
                        loadingTextElement.textContent = `Loading complete in ${loadTime}s`;
                    }
                    
                    if (loadingInfoElement) {
                        loadingInfoElement.textContent = 'Initializing game...';
                    }
                }
                
                // Clear interval if it's still running
                if (progressInterval) {
                    clearInterval(progressInterval);
                    progressInterval = null;
                }
            }, 200);
        });
        
        // Make sure we don't interfere with the game's loading screen
        // Remove our indicator when the game's loading screen appears
        const checkForGameLoading = setInterval(() => {
            const gameLoadingScreen = document.getElementById('loading-screen');
            
            if (gameLoadingScreen && 
                loadingElement && 
                window.getComputedStyle(gameLoadingScreen).display !== 'none') {
                // Game loading screen is visible, remove our indicator
                removeLoadingIndicator();
                clearInterval(checkForGameLoading);
            }
        }, 100);
        
        // Safety cleanup - remove our indicator after a reasonable time
        setTimeout(() => {
            removeLoadingIndicator();
        }, 30000); // 30 seconds should be more than enough for initial loading
    }
    
    // Start tracking as soon as possible
    init();
})();