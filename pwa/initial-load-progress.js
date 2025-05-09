/**
 * initial-load-progress.js
 * Loading progress indicator using LoadingScreen class
 */

import { LoadingScreen } from '../js/core/menu-system/LoadingScreen.js';

(function() {
    // State variables
    let loadingStartTime = Date.now();
    let loadingScreen = null;
    
    // Estimated loading times in milliseconds
    const ESTIMATED_LOADING_TIME = 20000; // 20 seconds
    
    // Flag to track if window load event has fired
    let windowLoaded = false;
    
    // Initialize loading indicator
    function initLoadingIndicator() {
        // Create loading screen instance
        loadingScreen = new LoadingScreen();
        
        // Show the loading screen
        loadingScreen.show();
        
        // Start with initial progress
        loadingScreen.updateProgress(5, 'Loading resources... 5%', 'Downloading game assets...');
        
        // Start progress tracking
        trackProgress();
    }
    
    // Track loading progress
    function trackProgress() {
        let lastProgress = 5;
        
        const progressInterval = setInterval(() => {
            // Calculate progress based on elapsed time
            const elapsedTime = Date.now() - loadingStartTime;
            let progress = Math.min((elapsedTime / ESTIMATED_LOADING_TIME) * 100, 99);
            
            // If window has loaded, go to 100%
            if (windowLoaded) {
                progress = 100;
            }
            
            // Round progress
            progress = Math.round(progress);
            
            // Only update if progress has changed
            if (progress !== lastProgress) {
                lastProgress = progress;
                
                // Determine loading info message based on progress
                let infoMessage = 'Downloading game assets...';
                
                if (progress < 20) {
                    infoMessage = 'Downloading game assets...';
                } else if (progress < 40) {
                    infoMessage = 'Loading 3D models...';
                } else if (progress < 60) {
                    infoMessage = 'Preparing game world...';
                } else if (progress < 80) {
                    infoMessage = 'Initializing game engine...';
                } else if (progress < 100) {
                    infoMessage = 'Almost ready...';
                } else {
                    infoMessage = 'Starting game...';
                }
                
                // Update loading screen
                loadingScreen.updateProgress(
                    progress,
                    `Loading resources... ${progress}%`,
                    infoMessage
                );
                
                // If we're at 100%, show completion message and clean up
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
                    loadingScreen.updateProgress(
                        100,
                        `Loading complete in ${loadTime}s`,
                        'Initializing game...'
                    );
                }
            }
        }, 100);
        
        // Listen for window load event
        window.addEventListener('load', () => {
            console.log('Window load event fired');
            windowLoaded = true;
        });
        
        // Safety cleanup - hide our loading screen after a reasonable time
        // This ensures we don't block the game if something goes wrong
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.hide();
            }
        }, 30000); // 30 seconds should be more than enough for initial loading
    }
    
    // Start tracking as soon as possible
    // Use DOMContentLoaded to ensure the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoadingIndicator);
    } else {
        initLoadingIndicator();
    }
})();