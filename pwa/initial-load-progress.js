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
                        
                        // Store file sizes data for potential use
                        filesData = data.fileSizes;
                        
                        // Log file categories if available
                        if (filesData) {
                            // Count files by category
                            const categoryCounts = {};
                            Object.entries(filesData).forEach(([fileName, fileInfo]) => {
                                const category = fileInfo.category;
                                if (!categoryCounts[category]) {
                                    categoryCounts[category] = { count: 0, size: 0 };
                                }
                                categoryCounts[category].count++;
                                categoryCounts[category].size += fileInfo.size;
                            });
                            
                            // Log category information
                            console.log('File categories:');
                            Object.entries(categoryCounts).forEach(([category, info]) => {
                                const sizeMB = (info.size / (1024 * 1024)).toFixed(2);
                                console.log(`- ${category}: ${info.count} files, ${sizeMB} MB`);
                            });
                        }
                        
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
     * Uses file sizes from file-sizes.json for both total expected download size
     * and for more accurate category-based progress reporting
     */
    function trackProgressWithFileSize() {
        if (!totalFilesSize) {
            console.error('No total file size available, cannot track progress');
            return;
        }
        
        console.log('Starting enhanced network progress tracking with file-sizes.json data');
        
        // Initialize tracking variables
        let downloadedResources = new Map(); // Map to track downloaded resources
        let lastProgressUpdate = Date.now();
        let progressUpdateInterval = null;
        
        // Track progress by category
        let categoryProgress = {};
        let categoryTotals = {};
        
        // Initialize category tracking if we have file data
        if (filesData) {
            // Calculate total size by category
            Object.entries(filesData).forEach(([fileName, fileInfo]) => {
                const category = fileInfo.category;
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                    categoryProgress[category] = 0;
                }
                categoryTotals[category] += fileInfo.size;
            });
            
            // Log category totals
            console.log('Category size totals:');
            Object.entries(categoryTotals).forEach(([category, size]) => {
                console.log(`- ${category}: ${formatFileSize(size)} (${((size / totalFilesSize) * 100).toFixed(1)}% of total)`);
            });
            
            // Store category information for progress display
            fileCategories = Object.keys(categoryTotals).map(category => ({
                name: category,
                totalSize: categoryTotals[category],
                loadedSize: 0,
                percentage: 0
            }));
        }
        
        /**
         * Determine file category based on file extension
         * @param {string} ext - File extension
         * @param {boolean} capitalize - Whether to capitalize the category name
         * @returns {string} The category name
         */
        function getCategoryFromExtension(ext, capitalize = false) {
            let category;
            
            if (['glb', 'gltf'].includes(ext)) category = 'models';
            else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'].includes(ext)) category = 'images';
            else if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) category = 'audio';
            else if (ext === 'js') category = 'javascript';
            else if (ext === 'css') category = 'stylesheets';
            else if (ext === 'html') category = 'html';
            else if (ext === 'json') category = 'data';
            else category = 'resources';
            
            // Capitalize if requested
            if (capitalize) {
                category = category.charAt(0).toUpperCase() + category.slice(1);
            }
            
            return category;
        }
        
        /**
         * Estimate file size based on category
         * @param {string} category - File category
         * @returns {number} Estimated file size in bytes
         */
        function getEstimatedSizeForCategory(category) {
            // Normalize category to lowercase for comparison
            const normalizedCategory = category.toLowerCase();
            
            if (normalizedCategory === 'models') return 500000; // ~500KB for models
            else if (normalizedCategory === 'images') return 100000; // ~100KB for images
            else if (normalizedCategory === 'audio') return 200000; // ~200KB for audio
            else if (normalizedCategory === 'javascript') return 50000; // ~50KB for JS
            else if (normalizedCategory === 'stylesheets') return 20000; // ~20KB for CSS
            else if (normalizedCategory === 'html') return 15000; // ~15KB for HTML
            else if (normalizedCategory === 'data') return 25000; // ~25KB for data files
            else return 30000; // ~30KB default
        }
        
        /**
         * Determine file category and size based on filename
         * @param {string} url - File URL
         * @returns {Object} Object containing fileName, category, and expectedSize
         */
        function getFileInfo(url) {
            // Extract filename from URL
            const fileName = url.split('/').pop();
            
            // Default values
            let category = 'unknown';
            let expectedSize = 0;
            
            // Check if we have data for this file in file-sizes.json
            if (filesData && filesData[fileName]) {
                category = filesData[fileName].category;
                expectedSize = filesData[fileName].size;
                
                // Convert category to display format (capitalize first letter)
                category = category.charAt(0).toUpperCase() + category.slice(1);
            } else {
                // Fallback to extension-based categorization if file not found in data
                const ext = url.split('.').pop().toLowerCase();
                
                // Get category from extension (with capitalization)
                category = getCategoryFromExtension(ext, true);
                
                // Try to estimate size based on category if we don't have actual data
                if (expectedSize === 0) {
                    expectedSize = getEstimatedSizeForCategory(category);
                }
            }
            
            return { fileName, category, expectedSize };
        }
        
        /**
         * Update category progress based on loaded file
         * @param {string} fileName - Name of the loaded file
         * @param {number} size - Size of the loaded file in bytes
         */
        function updateCategoryProgress(fileName, size) {
            // If we have file data in filesData, use it
            if (filesData && filesData[fileName]) {
                const category = filesData[fileName].category;
                if (categoryProgress[category] !== undefined) {
                    categoryProgress[category] += size;
                    
                    // Update category in fileCategories array
                    const categoryIndex = fileCategories.findIndex(c => c.name === category);
                    if (categoryIndex !== -1) {
                        fileCategories[categoryIndex].loadedSize += size;
                        fileCategories[categoryIndex].percentage = 
                            (fileCategories[categoryIndex].loadedSize / fileCategories[categoryIndex].totalSize) * 100;
                    }
                }
                return;
            }
            
            // If file not found in filesData, determine category from extension
            const ext = fileName.split('.').pop().toLowerCase();
            const category = getCategoryFromExtension(ext); // Use our utility function
            
            // Update the category if it exists in our tracking
            if (categoryProgress[category] !== undefined) {
                categoryProgress[category] += size;
                
                // Update category in fileCategories array
                const categoryIndex = fileCategories.findIndex(c => c.name === category);
                if (categoryIndex !== -1) {
                    fileCategories[categoryIndex].loadedSize += size;
                    fileCategories[categoryIndex].percentage = 
                        (fileCategories[categoryIndex].loadedSize / fileCategories[categoryIndex].totalSize) * 100;
                }
            }
        }
        
        // Function to get the current loading focus (which category is most actively loading)
        function getCurrentLoadingFocus() {
            if (!fileCategories || fileCategories.length === 0) return 'Resources';
            
            // Find the category with the highest recent activity but not complete
            const activeCategories = fileCategories.filter(c => c.percentage < 99);
            if (activeCategories.length === 0) return 'Finalizing';
            
            // Sort by percentage loading (highest first)
            activeCategories.sort((a, b) => b.percentage - a.percentage);
            return activeCategories[0].name.charAt(0).toUpperCase() + activeCategories[0].name.slice(1);
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
            
            // Get the file info
            const { fileName, category } = getFileInfo(lastDownloadedFile);
            
            // Get the current loading focus
            const loadingFocus = getCurrentLoadingFocus();
            
            // Create a detailed status message
            let statusMessage = `Loading resources... ${progress}% (${formatFileSize(loadedBytes)} / ${formatFileSize(totalFilesSize)})`;
            let detailMessage = `${category}: ${fileName}`;
            
            // Add category progress if available
            if (fileCategories && fileCategories.length > 0) {
                // Find the most active category (highest percentage but not complete)
                const activeCategory = fileCategories.find(c => c.name.toLowerCase() === loadingFocus.toLowerCase());
                if (activeCategory) {
                    detailMessage = `${loadingFocus} (${Math.round(activeCategory.percentage)}%): ${fileName}`;
                }
            }
            
            // Update loading screen
            loadingScreen.updateProgress(
                progress,
                statusMessage,
                detailMessage
            );
            
            // If window has loaded and we're at 99%, finish up
            if (windowLoaded && progress >= 99) {
                finishLoading(progressUpdateInterval);
            }
            
            // Log progress every 5 seconds
            const now = Date.now();
            if (now - lastProgressUpdate > 5000) {
                console.log(`Loading progress: ${progress}% (${formatFileSize(loadedBytes)} / ${formatFileSize(totalFilesSize)})`);
                
                // Log category progress
                if (fileCategories && fileCategories.length > 0) {
                    console.log('Category progress:');
                    fileCategories.forEach(category => {
                        console.log(`- ${category.name}: ${Math.round(category.percentage)}% (${formatFileSize(category.loadedSize)} / ${formatFileSize(category.totalSize)})`);
                    });
                }
                
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
                            
                            // Get expected size from file-sizes.json if available
                            let expectedSize = 0;
                            let sizeToRecord = transferSize;
                            let loadSource = 'network';
                            let sizeAccuracy = '';
                            
                            // Check if we have file size data in file-sizes.json
                            if (filesData && filesData[fileName]) {
                                expectedSize = filesData[fileName].size;
                                
                                // If transferSize is 0, this is likely a cached resource
                                // Use the expected size from file-sizes.json instead
                                if (transferSize === 0) {
                                    sizeToRecord = expectedSize;
                                    loadSource = 'cache';
                                } else {
                                    // For network transfers, calculate accuracy compared to expected size
                                    const accuracy = ((transferSize / expectedSize) * 100).toFixed(1);
                                    sizeAccuracy = ` (${accuracy}% of expected ${formatFileSize(expectedSize)})`;
                                }
                            }
                            
                            // Store the resource size (either from network or from file-sizes.json for cached resources)
                            if (sizeToRecord > 0) {
                                downloadedResources.set(url, sizeToRecord);
                                
                                // Update category progress tracking
                                updateCategoryProgress(fileName, sizeToRecord);
                                
                                // Update progress display
                                updateProgressDisplay();
                                
                                // Log detailed info for debugging
                                console.debug(`${loadSource === 'cache' ? 'Loaded from cache' : 'Downloaded'}: ${fileName} (${formatFileSize(sizeToRecord)}${sizeAccuracy})`);
                            }
                        }
                    });
                });
                
                // Observe resource timing entries
                observer.observe({ entryTypes: ['resource'] });
                console.log('Enhanced network performance observer started with category tracking');
            } catch (error) {
                console.error('Error setting up PerformanceObserver:', error);
            }
        } else {
            console.warn('PerformanceObserver not supported, cannot track network activity');
            
            // If we have file size data, we can still show category information
            if (fileCategories && fileCategories.length > 0) {
                // Show the largest categories
                fileCategories.sort((a, b) => b.totalSize - a.totalSize);
                const largestCategory = fileCategories[0].name;
                
                loadingScreen.updateProgress(
                    10,
                    `Loading resources... (${formatFileSize(totalFilesSize)} total)`,
                    `Preparing to load ${largestCategory} files and other assets...`
                );
            } else {
                // Show a basic loading message without progress percentage
                loadingScreen.updateProgress(
                    10,
                    'Loading resources...',
                    'Please wait while the game loads'
                );
            }
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
     * Provides detailed category-based loading statistics
     */
    function finishLoading(intervalId) {
        if (intervalId) {
            clearInterval(intervalId);
        }
        
        const loadTime = ((Date.now() - loadingStartTime) / 1000).toFixed(1);
        
        // Prepare category statistics if available
        let categoryStats = {};
        let largestCategory = 'assets';
        let largestCategorySize = 0;
        
        if (fileCategories && fileCategories.length > 0) {
            // Calculate statistics for each category
            fileCategories.forEach(category => {
                categoryStats[category.name] = {
                    size: category.loadedSize,
                    percentage: Math.round(category.percentage)
                };
                
                // Track the largest category
                if (category.totalSize > largestCategorySize) {
                    largestCategorySize = category.totalSize;
                    largestCategory = category.name;
                }
            });
            
            // Log detailed category statistics
            console.log('Final loading statistics by category:');
            Object.entries(categoryStats).forEach(([category, stats]) => {
                console.log(`- ${category}: ${formatFileSize(stats.size)} (${stats.percentage}% loaded)`);
            });
        }
        
        // Create a more informative completion message
        let completionMessage = `Assets loaded in ${loadTime}s (${formatFileSize(totalFilesSize)})`;
        let detailMessage = 'Initializing game engine...';
        
        // Add category information if available
        if (Object.keys(categoryStats).length > 0) {
            // Count how many categories were fully loaded
            const fullyLoadedCategories = Object.entries(categoryStats)
                .filter(([_, stats]) => stats.percentage >= 99)
                .length;
                
            const totalCategories = Object.keys(categoryStats).length;
            
            // Add category information to the detail message
            if (fullyLoadedCategories === totalCategories) {
                detailMessage = `All ${totalCategories} asset categories loaded successfully`;
            } else {
                detailMessage = `${fullyLoadedCategories}/${totalCategories} asset categories loaded`;
            }
        }
        
        // Show 100% completion message
        loadingScreen.updateProgress(
            100,
            completionMessage,
            detailMessage
        );
        
        // Expose loading screen instance to window so main.js can access it
        window.gameLoadingScreen = loadingScreen;
        
        // Dispatch a custom event to notify main.js that assets are loaded
        const assetsLoadedEvent = new CustomEvent('gameAssetsLoaded', {
            detail: {
                loadTime: loadTime,
                totalSize: totalFilesSize,
                categories: categoryStats || null,
                largestCategory: largestCategory
            }
        });
        window.dispatchEvent(assetsLoadedEvent);
        
        console.log(`Assets loaded in ${loadTime}s, control passed to main.js`);
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