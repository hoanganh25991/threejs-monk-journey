/**
 * initial-load-progress.js
 * Tracks the loading progress of critical resources during initial page load
 * Enhanced to handle large module downloads
 */

(function() {
    // Since we know the main bottleneck is the large module download,
    // we'll use a simpler approach focused on time-based progress
    
    // State variables
    let totalProgress = 0;
    let loadingStartTime = Date.now();
    let loadingElement = null;
    let loadingBarElement = null;
    let loadingTextElement = null;
    let loadingInfoElement = null;
    
    // Network speed detection
    let networkSpeed = 'unknown'; // 'slow', 'medium', 'fast'
    let downloadStartTime = 0;
    let lastDownloadSize = 0;
    let downloadSizeAccumulator = 0;
    
    // Module loading tracking
    let moduleLoadStarted = false;
    let mainModuleLoaded = false;
    
    // Estimated total download size (in KB)
    // This is an approximation based on the known size of the main module bundle
    const ESTIMATED_TOTAL_SIZE = 11000; // 11MB
    
    // Track download progress
    let downloadedSize = 0;
    
    // Debug mode
    const DEBUG = true;
    
    // Debug log function
    function debugLog(message) {
        if (DEBUG) {
            console.log(`[LoadProgress] ${message}`);
        }
    }
    
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
    
    // Update loading progress based on download size
    function updateProgress(size, filename) {
        if (!loadingBarElement) return;
        
        // Track download size
        const sizeInKB = size / 1024;
        downloadedSize += sizeInKB;
        
        // Calculate progress based on estimated total size
        let calculatedProgress = Math.min((downloadedSize / ESTIMATED_TOTAL_SIZE) * 100, 95);
        
        // If this is the first significant download, start tracking network speed
        if (downloadedSize > 100 && downloadStartTime === 0) {
            downloadStartTime = Date.now();
            lastDownloadSize = downloadedSize;
            debugLog(`Started tracking network speed with initial download of ${downloadedSize.toFixed(1)}KB`);
        }
        
        // Update network speed calculation every 500ms
        if (downloadStartTime > 0 && Date.now() - downloadStartTime > 500) {
            const timeDiff = (Date.now() - downloadStartTime) / 1000; // in seconds
            const sizeDiff = downloadedSize - lastDownloadSize; // in KB
            
            if (sizeDiff > 0) {
                const currentSpeed = sizeDiff / timeDiff; // KB/s
                downloadSizeAccumulator += sizeDiff;
                
                // Only update network speed after we have enough data
                if (downloadSizeAccumulator > 500) {
                    if (currentSpeed < 200) {
                        networkSpeed = 'slow';
                    } else if (currentSpeed < 1000) {
                        networkSpeed = 'medium';
                    } else {
                        networkSpeed = 'fast';
                    }
                    
                    debugLog(`Network speed: ${currentSpeed.toFixed(1)}KB/s (${networkSpeed})`);
                    
                    // Adjust progress calculation based on network speed
                    if (networkSpeed === 'slow') {
                        // For slow connections, show more progress to keep users engaged
                        calculatedProgress = Math.min(calculatedProgress * 1.2, 95);
                    }
                }
            }
            
            // Reset for next calculation
            downloadStartTime = Date.now();
            lastDownloadSize = downloadedSize;
        }
        
        // If main module is loaded, accelerate to 100%
        if (mainModuleLoaded) {
            calculatedProgress = 100;
        }
        
        // Ensure progress never goes backward
        totalProgress = Math.max(totalProgress, calculatedProgress);
        
        // Update loading bar
        loadingBarElement.style.width = `${Math.round(totalProgress)}%`;
        
        // Update loading text
        if (loadingTextElement) {
            if (totalProgress < 100) {
                loadingTextElement.textContent = `Loading resources... ${Math.round(totalProgress)}%`;
            } else {
                const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
                loadingTextElement.textContent = `Loading complete in ${loadTime}s`;
            }
        }
        
        // Update loading info
        if (loadingInfoElement && filename) {
            // Truncate filename if it's too long
            const displayName = filename.length > 30 ? 
                filename.substring(0, 15) + '...' + filename.substring(filename.length - 12) : 
                filename;
            
            // Show download size for large files
            if (sizeInKB > 100) {
                loadingInfoElement.textContent = `Loading: ${displayName} (${(sizeInKB / 1024).toFixed(1)}MB)`;
            } else {
                loadingInfoElement.textContent = `Loading: ${displayName}`;
            }
        }
        
        // If we're at 100%, show completion message
        if (totalProgress >= 99.5) {
            loadingBarElement.style.width = '100%';
            if (loadingInfoElement) {
                loadingInfoElement.textContent = 'Initializing game...';
            }
        }
        
        debugLog(`Progress: ${Math.round(totalProgress)}% - Downloaded: ${(downloadedSize / 1024).toFixed(2)}MB`);
    }
    
    // Track resource loading using Performance API and network monitoring
    function trackResourceLoading() {
        // Use Performance Observer to track resource loading
        if (window.PerformanceObserver) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    // Skip data URIs and non-resource entries
                    if (entry.name.startsWith('data:') || !entry.name.includes('://')) {
                        return;
                    }
                    
                    // Extract filename
                    const url = entry.name;
                    const filename = url.split('/').pop().split('?')[0]; // Remove query params
                    
                    // Get transfer size (or encoded body size as fallback)
                    const size = entry.transferSize || entry.encodedBodySize || 0;
                    
                    // Check if this is the main module
                    if (url.includes('/main.js') || url.includes('three.module.js')) {
                        moduleLoadStarted = true;
                        debugLog(`Detected module load: ${filename} (${(size / 1024 / 1024).toFixed(2)}MB)`);
                        
                        // If this is the main.js file, mark it as loaded
                        if (url.includes('/main.js')) {
                            mainModuleLoaded = true;
                        }
                    }
                    
                    // Update progress with the actual file size
                    updateProgress(size, filename);
                });
            });
            
            // Start observing resource timing entries
            observer.observe({ entryTypes: ['resource'] });
            
            // Also track navigation timing for the initial HTML
            try {
                const navObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            const size = entry.transferSize || entry.encodedBodySize || 10000;
                            updateProgress(size, 'index.html');
                        }
                    });
                });
                navObserver.observe({ entryTypes: ['navigation'] });
            } catch (e) {
                // Navigation timing might not be supported
                debugLog('Navigation timing not supported: ' + e.message);
                // Add some initial progress
                updateProgress(10000, 'index.html');
            }
        } else {
            // Fallback for browsers without PerformanceObserver
            debugLog('PerformanceObserver not supported, using fallback');
            simulateProgress();
        }
        
        // Detect module loading
        document.addEventListener('DOMContentLoaded', () => {
            debugLog('DOMContentLoaded event fired');
            
            // Find module scripts
            const moduleScripts = document.querySelectorAll('script[type="module"]');
            if (moduleScripts.length > 0) {
                moduleLoadStarted = true;
                debugLog(`Detected ${moduleScripts.length} module scripts`);
                
                // Pre-register the main module with an estimated size
                if (!mainModuleLoaded) {
                    updateProgress(5000000, 'main.js (estimating)');
                }
            }
            
            // If progress is still low, start simulating
            if (totalProgress < 10) {
                simulateProgress();
            }
        });
        
        // When window is fully loaded
        window.addEventListener('load', () => {
            debugLog('Window load event fired');
            
            // Mark main module as loaded if not already
            if (!mainModuleLoaded) {
                mainModuleLoaded = true;
                updateProgress(0, 'All resources loaded');
            }
            
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
                    
                    debugLog(`Loading completed in ${((Date.now() - loadingStartTime) / 1000).toFixed(1)}s`);
                }
            }, 200);
        });
    }
    
    // Simulate progress for browsers without proper API support
    function simulateProgress() {
        debugLog('Starting progress simulation');
        
        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
            // Accelerate progress based on time elapsed
            const timeElapsed = (Date.now() - loadingStartTime) / 1000;
            
            if (timeElapsed < 2) {
                // First 2 seconds: slow start
                simulatedProgress += 1;
            } else if (timeElapsed < 5) {
                // 2-5 seconds: medium speed
                simulatedProgress += 2;
            } else if (timeElapsed < 10) {
                // 5-10 seconds: faster
                simulatedProgress += 3;
            } else {
                // After 10 seconds: very fast
                simulatedProgress += 5;
            }
            
            // Cap progress at 90% until main module is loaded
            if (!mainModuleLoaded && simulatedProgress > 90) {
                simulatedProgress = 90;
            }
            
            // If main module is loaded, go to 100%
            if (mainModuleLoaded) {
                simulatedProgress = 100;
                clearInterval(progressInterval);
            }
            
            // Update UI
            if (loadingBarElement) {
                loadingBarElement.style.width = `${simulatedProgress}%`;
            }
            
            if (loadingTextElement) {
                loadingTextElement.textContent = `Loading resources... ${Math.round(simulatedProgress)}%`;
            }
            
            // Stop at 100%
            if (simulatedProgress >= 100) {
                clearInterval(progressInterval);
                
                if (loadingTextElement) {
                    const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
                    loadingTextElement.textContent = `Loading complete in ${loadTime}s`;
                }
                
                if (loadingInfoElement) {
                    loadingInfoElement.textContent = 'Initializing game...';
                }
            }
        }, 100);
    }
    
    // Initialize loading tracking
    function init() {
        debugLog('Initializing loading progress tracker');
        
        // Create loading indicator
        createLoadingIndicator();
        
        // Start with some initial progress to show immediate feedback
        if (loadingBarElement) {
            loadingBarElement.style.width = '5%';
        }
        
        if (loadingTextElement) {
            loadingTextElement.textContent = 'Preparing resources... 5%';
        }
        
        // Start tracking resource loading
        trackResourceLoading();
        
        // Set a minimum loading time to prevent flickering
        setTimeout(() => {
            // If loading is taking too long, show a message
            if (totalProgress < 30 && loadingInfoElement) {
                loadingInfoElement.textContent = 'Loading is taking longer than expected. Please wait...';
            }
        }, 5000);
        
        // Make sure we don't interfere with the game's loading screen
        // Remove our indicator when the game's loading screen appears
        const checkForGameLoading = setInterval(() => {
            const gameLoadingScreen = document.getElementById('loading-screen');
            const initialIndicator = document.getElementById('initial-loading-indicator');
            
            if (gameLoadingScreen && 
                initialIndicator && 
                window.getComputedStyle(gameLoadingScreen).display !== 'none') {
                // Game loading screen is visible, remove our indicator
                try {
                    // Transfer our progress to the game loading screen
                    const gameLoadingBar = document.getElementById('loading-bar');
                    if (gameLoadingBar && loadingBarElement) {
                        gameLoadingBar.style.width = loadingBarElement.style.width;
                        debugLog(`Transferred progress to game loading screen: ${loadingBarElement.style.width}`);
                    }
                    
                    initialIndicator.parentNode.removeChild(initialIndicator);
                    clearInterval(checkForGameLoading);
                    debugLog('Initial loading indicator removed, game loading screen active');
                } catch (e) {
                    debugLog('Error removing initial indicator: ' + e.message);
                }
            }
        }, 100);
        
        // Safety cleanup - remove our indicator after a reasonable time
        // This ensures we don't block the game menu if something goes wrong
        setTimeout(() => {
            const initialIndicator = document.getElementById('initial-loading-indicator');
            if (initialIndicator) {
                try {
                    initialIndicator.parentNode.removeChild(initialIndicator);
                    debugLog('Initial loading indicator removed by safety timeout');
                } catch (e) {
                    debugLog('Error removing initial indicator in safety timeout: ' + e.message);
                }
            }
        }, 15000); // 15 seconds should be more than enough for initial loading
        
        // Final check - if we're still at low progress after 8 seconds,
        // simulate faster progress to avoid user frustration
        setTimeout(() => {
            if (totalProgress < 50 && loadingBarElement) {
                debugLog('Progress still low after timeout, accelerating progress simulation');
                
                let acceleratedProgress = Math.max(totalProgress, 50);
                const accelerateInterval = setInterval(() => {
                    acceleratedProgress += Math.random() * 5 + 2;
                    
                    if (acceleratedProgress >= 90) {
                        acceleratedProgress = 90; // Cap at 90% to leave room for actual completion
                        clearInterval(accelerateInterval);
                    }
                    
                    if (loadingBarElement) {
                        loadingBarElement.style.width = `${acceleratedProgress}%`;
                    }
                    
                    if (loadingTextElement) {
                        loadingTextElement.textContent = `Loading resources... ${Math.round(acceleratedProgress)}%`;
                    }
                }, 200);
            }
        }, 8000);
        
        // Monitor network activity to detect when downloads have stopped
        // This helps identify when the main module has finished loading
        let lastActivityTime = Date.now();
        let lastDownloadedSize = 0;
        
        const activityCheckInterval = setInterval(() => {
            // If size hasn't changed in 2 seconds and we've downloaded something substantial
            if (downloadedSize > 1000 && downloadedSize === lastDownloadedSize) {
                const inactiveTime = (Date.now() - lastActivityTime) / 1000;
                
                if (inactiveTime > 2) {
                    debugLog(`Network inactive for ${inactiveTime.toFixed(1)}s, assuming download complete`);
                    
                    // Mark main module as loaded if not already
                    if (!mainModuleLoaded) {
                        mainModuleLoaded = true;
                        updateProgress(0, 'Download complete');
                        clearInterval(activityCheckInterval);
                    }
                }
            } else if (downloadedSize !== lastDownloadedSize) {
                // Update last activity time when download size changes
                lastActivityTime = Date.now();
                lastDownloadedSize = downloadedSize;
            }
        }, 500);
    }
    
    // Start tracking as soon as possible
    init();
})();