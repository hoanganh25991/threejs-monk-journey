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
    let currentFileIndex = 0;
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
                console.warn('Could not get file sizes from service worker:', error);
                // Fall back to simulated progress
                trackProgressSimulated();
            });
    }
    
    /**
     * Fetch file sizes from the service worker
     * @returns {Promise} Resolves when file sizes are loaded
     */
    function fetchFileSizesFromServiceWorker() {
        return new Promise((resolve, reject) => {
            // Check if we already have file sizes in window object (from service worker)
            if (window.FILE_SIZES && Object.keys(window.FILE_SIZES).length > 0) {
                console.log('Using file sizes from window.FILE_SIZES');
                filesData = window.FILE_SIZES;
                setupFileCategories();
                resolve();
                return;
            }
            
            // Try to fetch the service worker file to extract file sizes
            fetch('../service-worker.js')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch service worker: ${response.status}`);
                    }
                    return response.text();
                })
                .then(text => {
                    // Extract FILE_SIZES object from service worker
                    const fileSizesMatch = text.match(/const FILE_SIZES = ({[\s\S]*?});/);
                    if (fileSizesMatch && fileSizesMatch[1]) {
                        try {
                            // Parse the FILE_SIZES object
                            // Need to clean up the string first (remove indentation)
                            const cleanJson = fileSizesMatch[1].replace(/^\s+/gm, '');
                            filesData = JSON.parse(cleanJson);
                            console.log(`Extracted file sizes for ${Object.keys(filesData).length} files`);
                            
                            // Also try to get total cache size
                            const totalSizeMatch = text.match(/const TOTAL_CACHE_SIZE_BYTES = (\d+);/);
                            if (totalSizeMatch && totalSizeMatch[1]) {
                                totalFilesSize = parseInt(totalSizeMatch[1], 10);
                                console.log(`Total cache size: ${formatFileSize(totalFilesSize)}`);
                            } else {
                                // Calculate total size from file sizes
                                totalFilesSize = Object.values(filesData).reduce((sum, size) => sum + size, 0);
                                console.log(`Calculated total size: ${formatFileSize(totalFilesSize)}`);
                            }
                            
                            // Setup file categories
                            setupFileCategories();
                            resolve();
                        } catch (error) {
                            console.error('Error parsing FILE_SIZES from service worker:', error);
                            reject(error);
                        }
                    } else {
                        reject(new Error('Could not find FILE_SIZES in service worker'));
                    }
                })
                .catch(reject);
        });
    }
    
    /**
     * Setup file categories for more realistic loading simulation
     */
    function setupFileCategories() {
        if (!filesData) return;
        
        // Group files by type/category
        const categories = {
            models: [],
            images: [],
            audio: [],
            js: [],
            css: [],
            other: []
        };
        
        // Categorize files
        Object.entries(filesData).forEach(([path, size]) => {
            if (path.includes('.glb')) {
                categories.models.push({ path, size });
            } else if (path.includes('.jpg') || path.includes('.png') || path.includes('.svg')) {
                categories.images.push({ path, size });
            } else if (path.includes('.mp3') || path.includes('.wav') || path.includes('.ogg')) {
                categories.audio.push({ path, size });
            } else if (path.includes('.js')) {
                categories.js.push({ path, size });
            } else if (path.includes('.css')) {
                categories.css.push({ path, size });
            } else {
                categories.other.push({ path, size });
            }
        });
        
        // Create a loading sequence that feels natural
        // Usually JS and CSS load first, then images, then models and audio
        fileCategories = [
            { name: 'Core Files', files: categories.other, loadingSpeed: 500000 }, // Fast loading for small files
            { name: 'JavaScript', files: categories.js, loadingSpeed: 300000 },    // ~300KB/s
            { name: 'Stylesheets', files: categories.css, loadingSpeed: 400000 },  // ~400KB/s
            { name: 'Images', files: categories.images, loadingSpeed: 200000 },    // ~200KB/s
            { name: 'Audio', files: categories.audio, loadingSpeed: 150000 },      // ~150KB/s
            { name: 'Models', files: categories.models, loadingSpeed: 100000 }     // ~100KB/s (3D models are large)
        ];
        
        // Log category sizes
        fileCategories.forEach(category => {
            const categorySize = category.files.reduce((sum, file) => sum + file.size, 0);
            console.log(`${category.name}: ${category.files.length} files, ${formatFileSize(categorySize)}`);
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
     * Track loading progress based on file sizes
     */
    function trackProgressWithFileSize() {
        if (!filesData || !fileCategories || fileCategories.length === 0) {
            console.warn('No file data available, falling back to simulated progress');
            trackProgressSimulated();
            return;
        }
        
        console.log('Starting file-size based progress tracking');
        
        let currentCategory = 0;
        let currentFile = 0;
        let categoryLoadedBytes = 0;
        let lastUpdateTime = Date.now();
        
        const progressInterval = setInterval(() => {
            const now = Date.now();
            const deltaTime = now - lastUpdateTime;
            lastUpdateTime = now;
            
            // Get current category
            const category = fileCategories[currentCategory];
            if (!category) {
                // All categories completed
                finishLoading(progressInterval);
                return;
            }
            
            // Get current file in category
            const file = category.files[currentFile];
            if (!file) {
                // Category completed, move to next
                currentCategory++;
                currentFile = 0;
                categoryLoadedBytes = 0;
                
                // Check if we've completed all categories
                if (currentCategory >= fileCategories.length) {
                    finishLoading(progressInterval);
                    return;
                }
                
                // Continue with next category
                return;
            }
            
            // Calculate how many bytes to load in this update
            const bytesToLoad = Math.min(
                Math.floor(category.loadingSpeed * (deltaTime / 1000)), // Bytes per second * fraction of second
                file.size - categoryLoadedBytes // Remaining bytes in file
            );
            
            // Update loaded bytes
            categoryLoadedBytes += bytesToLoad;
            loadedBytes += bytesToLoad;
            
            // Check if file is complete
            if (categoryLoadedBytes >= file.size) {
                // Move to next file
                currentFile++;
                categoryLoadedBytes = 0;
            }
            
            // Calculate overall progress percentage
            const progress = Math.min(Math.floor((loadedBytes / totalFilesSize) * 100), 99);
            
            // Get current file name for display
            const currentFileName = file.path.split('/').pop();
            const categoryName = category.name;
            
            // Update loading screen
            loadingScreen.updateProgress(
                progress,
                `Loading resources... ${progress}% (${formatFileSize(loadedBytes)} / ${formatFileSize(totalFilesSize)})`,
                `${categoryName}: ${currentFileName}`
            );
            
            // If window has loaded and we're at 99%, finish up
            if (windowLoaded && progress >= 99) {
                finishLoading(progressInterval);
            }
            
        }, 100); // Update every 100ms
        
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
        }, 60000); // 60 seconds should be more than enough for initial loading
    }
    
    /**
     * Finish loading and show completion message
     */
    function finishLoading(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
        loadingScreen.updateProgress(
            100,
            `Loading complete in ${loadTime}s (${formatFileSize(totalFilesSize)})`,
            'Initializing game...'
        );
        
        // Hide loading screen after a short delay
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.hide();
            }
        }, 1000);
    }
    
    /**
     * Fallback to simulated progress tracking (similar to original implementation)
     */
    function trackProgressSimulated() {
        console.log('Using simulated progress tracking');
        
        let lastProgress = 5;
        const ESTIMATED_LOADING_TIME = 20000; // 20 seconds
        
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