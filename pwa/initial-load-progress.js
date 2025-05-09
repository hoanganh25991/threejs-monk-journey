/**
 * initial-load-progress.js
 * Loading progress indicator using LoadingScreen class
 * Enhanced with realistic file-size based progress tracking
 */

import { LoadingScreen } from './LoadingScreen.js';

(function() {
    // State variables
    let loadingStartTime = Date.now();
    let loadingScreen = null;
    
    // Flag to track if window load event has fired
    let windowLoaded = false;
    
    // File loading simulation variables
    let totalFilesSize = 0;
    let loadedBytes = 0;
    let fileCategories = [];
    let filesData = null;
    
    // Initialize loading indicator
    function initLoadingIndicator() {
        // Create loading screen instance
        loadingScreen = new LoadingScreen();
        
        // Show the loading screen
        loadingScreen.show();
        
        // Start with initial progress
        loadingScreen.updateProgress(2, 'Initializing... 2%', 'Preparing to download game assets...');
        
        // Try to get file sizes from service worker
        fetchFileSizesFromServiceWorker()
            .then(() => {
                // Start progress tracking with file sizes
                trackProgressWithFileSize();
            })
            .catch(error => {
                console.error('Could not get file sizes from service worker:', error);
                // Do nothing as we don't have info to handle
            });
    }
    
    /**
     * Fetch total file size from the JSON file
     * @returns {Promise} Resolves when total file size is loaded
     */
    function fetchFileSizesFromServiceWorker() {
        return new Promise((resolve, reject) => {
            // Try to fetch the file sizes JSON file
            fetch('pwa/file-sizes.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch file sizes: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    try {
                        // Get total cache size - this is the only value we need
                        totalFilesSize = data.totalSizeBytes;
                        console.log(`Total cache size: ${formatFileSize(totalFilesSize)} (${data.totalFiles || 0} files)`);
                        
                        // Log category sizes if available (for information only)
                        if (data.categorySizes) {
                            console.log('File categories:');
                            Object.entries(data.categorySizes).forEach(([category, info]) => {
                                console.log(`- ${category}: ${info.count} files, ${info.sizeMB} MB`);
                            });
                        }
                        
                        // We don't need file categories or file sizes anymore
                        // The network observer will track actual downloads
                        resolve();
                    } catch (error) {
                        console.error('Error processing file sizes JSON:', error);
                        reject(error);
                    }
                })
                .catch(error => {
                    console.error('Error fetching file sizes JSON:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * Format file size in human-readable format
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Track loading progress based on actual network activity
     * Uses file sizes from file-sizes.json only for the total expected download size
     * All file tracking is based on actual network events
     */
    function trackProgressWithFileSize() {
        if (!totalFilesSize) {
            console.error('No total file size available, cannot track progress');
            return;
        }
        
        console.log('Starting pure network progress tracking');
        
        // Initialize tracking variables
        let downloadedResources = new Map(); // Map to track downloaded resources
        let lastProgressUpdate = Date.now();
        let progressUpdateInterval = null;
        
        // Function to determine file category based on extension
        function getFileCategory(url) {
            const ext = url.split('.').pop().toLowerCase();
            
            if (['glb', 'gltf'].includes(ext)) return 'Models';
            if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'].includes(ext)) return 'Images';
            if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'Audio';
            if (ext === 'js') return 'JavaScript';
            if (ext === 'css') return 'Stylesheets';
            if (ext === 'html') return 'HTML';
            if (ext === 'json') return 'Data';
            return 'Resources';
        }
        
        // Function to update the progress display
        function updateProgressDisplay() {
            // Calculate total downloaded bytes
            loadedBytes = Array.from(downloadedResources.values()).reduce((sum, size) => sum + size, 0);
            
            // Calculate progress percentage
            const progress = Math.min(Math.floor((loadedBytes / totalFilesSize) * 100), 100);
            
            // Get the most recently downloaded file for display
            const lastDownloadedFile = downloadedResources.size > 0 ? 
                Array.from(downloadedResources.keys())[downloadedResources.size - 1] : '';
            
            // Get the file name and category
            const fileName = lastDownloadedFile.split('/').pop();
            const categoryName = getFileCategory(fileName);
            
            // Update loading screen
            loadingScreen.updateProgress(
                progress,
                `Loading resources... ${progress}% (${formatFileSize(loadedBytes)} / ${formatFileSize(totalFilesSize)})`,
                `${categoryName}: ${fileName}`
            );
            
            // If window has loaded and we're at 99%, finish up
            if (windowLoaded && progress >= 99) {
                finishLoading(progressUpdateInterval);
            }
            
            // Log progress every 5 seconds
            const now = Date.now();
            if (now - lastProgressUpdate > 5000) {
                console.log(`Loading progress: ${progress}% (${formatFileSize(loadedBytes)} / ${formatFileSize(totalFilesSize)})`);
                lastProgressUpdate = now;
            }
        }
        
        // Set up network request interception using Performance Observer
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        // Only process completed resource loads
                        if (entry.entryType === 'resource') {
                            const url = entry.name;
                            const transferSize = entry.transferSize || 0;
                            
                            // Skip tracking for analytics, tracking pixels, etc.
                            if (url.includes('analytics') || url.includes('tracking') || 
                                url.includes('beacon') || url.includes('file-sizes.json')) {
                                return;
                            }
                            
                            // Extract the file name from the URL
                            const fileName = url.split('/').pop();
                            
                            // Store the downloaded resource size
                            if (transferSize > 0) {
                                downloadedResources.set(url, transferSize);
                                
                                // Update progress display
                                updateProgressDisplay();
                                
                                // Log detailed info for debugging
                                console.debug(`Downloaded: ${fileName} (${formatFileSize(transferSize)})`);
                            }
                        }
                    });
                });
                
                // Observe resource timing entries
                observer.observe({ entryTypes: ['resource'] });
                console.log('Network performance observer started');
            } catch (error) {
                console.error('Error setting up PerformanceObserver:', error);
            }
        } else {
            console.warn('PerformanceObserver not supported, cannot track network activity');
            
            // Show a basic loading message without progress percentage
            loadingScreen.updateProgress(
                10,
                'Loading resources...',
                'Please wait while the game loads'
            );
        }
        
        // Set up a regular interval to update progress display
        // This ensures smooth updates even when network activity is sparse
        progressUpdateInterval = setInterval(() => {
            updateProgressDisplay();
        }, 250); // Update every 250ms
        
        // Listen for window load event
        window.addEventListener('load', () => {
            console.log('Window load event fired');
            windowLoaded = true;
            
            // Force a final progress update
            setTimeout(() => {
                // If we've loaded at least 95% by this point, consider it complete
                if ((loadedBytes / totalFilesSize) >= 0.95) {
                    finishLoading(progressUpdateInterval);
                } else {
                    // Otherwise, give it a bit more time for any pending resources
                    updateProgressDisplay();
                }
            }, 1000);
        });
        
        // Safety cleanup - hide our loading screen after a reasonable time
        // This ensures we don't block the game if something goes wrong
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.hide();
            }
        }, 60000); // 60 seconds should be more than enough for initial loading
    }
    
    /**
     * Finish loading and show completion message
     * Exposes loading screen to main.js for final initialization
     */
    function finishLoading(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
        
        // Show 100% completion message
        loadingScreen.updateProgress(
            100,
            `Assets loaded in ${loadTime}s (${formatFileSize(totalFilesSize)})`,
            'Initializing game engine...'
        );
        
        // Expose loading screen instance to window so main.js can access it
        window.gameLoadingScreen = loadingScreen;
        
        // Dispatch a custom event to notify main.js that assets are loaded
        const assetsLoadedEvent = new CustomEvent('gameAssetsLoaded', {
            detail: {
                loadTime: loadTime,
                totalSize: totalFilesSize
            }
        });
        window.dispatchEvent(assetsLoadedEvent);
        
        console.log('Assets loaded, control passed to main.js');
    }
    
    // trackProgressSimulated function has been removed
    
    // Start tracking as soon as possible
    // Use DOMContentLoaded to ensure the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoadingIndicator);
    } else {
        initLoadingIndicator();
    }
})();