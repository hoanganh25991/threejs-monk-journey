/**
 * file-tracker.js
 * Simplified file tracking system that focuses only on files listed in file-sizes.json
 * Provides a summary of downloaded/cached files compared to the total list
 */

(function() {
    // State variables
    const startTime = Date.now();
    let filesData = null;
    let totalFiles = 0;
    let totalSizeBytes = 0;
    let downloadedFiles = new Set();
    let cachedFiles = new Set();
    let downloadedBytes = 0;
    let cachedBytes = 0;
    
    // DOM elements for displaying progress
    let loadingTitleElement = null;
    let loadingBarElement = null;
    let loadingTextElement = null;
    let loadingInfoElement = null;
    
    // Initialize tracking as soon as possible
    initTracking();
    
    /**
     * Initialize the file tracking system
     */
    function initTracking() {
        console.log('Initializing file tracking system');
        
        // Get references to existing UI elements
        const uiReady = setupUI();
        
        // Only proceed if UI elements are found
        if (uiReady) {
            // Start observing network requests immediately
            setupNetworkObserver();
            
            // Fetch file-sizes.json for reference data
            fetchFileSizesData();
            
            // Set up a regular interval to update the UI
            setInterval(updateUI, 500);
        }
    }
    
    /**
     * Set up references to UI elements
     * @returns {boolean} Whether UI setup was successful
     */
    function setupUI() {
        // Get references to existing elements
        loadingTitleElement = document.querySelector('.loading-title');
        loadingBarElement = document.querySelector('.loading-bar');
        loadingTextElement = document.querySelector('.loading-text');
        loadingInfoElement = document.querySelector('.loading-info');
        
        // Check if elements exist
        if (!loadingTitleElement || !loadingBarElement || !loadingTextElement || !loadingInfoElement) {
            console.error('Could not find loading indicator elements. File tracking disabled.');
            return false;
        }
        
        console.log('Found loading indicator elements');
        
        // Set initial content
        loadingTextElement.textContent = 'Initializing file tracking...';
        loadingInfoElement.textContent = 'Waiting for file-sizes.json...';
        
        return true;
    }
    
    /**
     * Fetch file-sizes.json data
     */
    function fetchFileSizesData() {
        fetch('pwa/file-sizes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch file sizes: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Store file data
                filesData = data.fileSizes;
                totalFiles = data.totalFiles || Object.keys(filesData).length;
                totalSizeBytes = data.totalSizeBytes || 0;
                
                console.log(`File data loaded: ${totalFiles} files, total size: ${formatFileSize(totalSizeBytes)}`);
                
                // Update UI with initial data
                updateUI();
                
                // Check if we've already tracked some files before data was loaded
                if (downloadedFiles.size > 0 || cachedFiles.size > 0) {
                    console.log(`Already tracked ${downloadedFiles.size + cachedFiles.size} files before file-sizes.json was loaded`);
                    recalculateProgress();
                }
            })
            .catch(error => {
                console.error('Error fetching file sizes JSON:', error);
                if (loadingInfoElement) {
                    loadingInfoElement.textContent = 'Error loading file-sizes.json';
                }
            });
    }
    
    /**
     * Set up network request observer
     */
    function setupNetworkObserver() {
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        // Only process completed resource loads
                        if (entry.entryType === 'resource') {
                            processResourceEntry(entry);
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
        }
    }
    
    /**
     * Process a resource entry from the performance observer
     * @param {PerformanceResourceTiming} entry - The resource timing entry
     */
    function processResourceEntry(entry) {
        const url = entry.name;
        const transferSize = entry.transferSize || 0;
        
        // Skip tracking for analytics, tracking pixels, etc.
        if (url.includes('analytics') || url.includes('tracking') || 
            url.includes('beacon') || url.includes('file-sizes.json')) {
            return;
        }
        
        // Extract the file name from the URL
        const fileName = url.split('/').pop();
        
        // Skip if we don't have file data yet
        if (!filesData) {
            // Store the file name for later processing
            if (transferSize > 0) {
                downloadedFiles.add(fileName);
            } else {
                cachedFiles.add(fileName);
            }
            return;
        }
        
        // Check if this file is in our file-sizes.json
        if (filesData[fileName]) {
            const fileSize = filesData[fileName].size;
            
            // Determine if file was downloaded or loaded from cache
            if (transferSize > 0) {
                // File was downloaded
                if (!downloadedFiles.has(fileName)) {
                    downloadedFiles.add(fileName);
                    downloadedBytes += fileSize;
                    console.debug(`Downloaded: ${fileName} (${formatFileSize(fileSize)})`);
                }
            } else {
                // File was loaded from cache
                if (!cachedFiles.has(fileName)) {
                    cachedFiles.add(fileName);
                    cachedBytes += fileSize;
                    console.debug(`Loaded from cache: ${fileName} (${formatFileSize(fileSize)})`);
                }
            }
        }
    }
    
    /**
     * Recalculate progress for files tracked before file-sizes.json was loaded
     */
    function recalculateProgress() {
        // Process downloaded files
        downloadedFiles.forEach(fileName => {
            if (filesData[fileName]) {
                downloadedBytes += filesData[fileName].size;
            }
        });
        
        // Process cached files
        cachedFiles.forEach(fileName => {
            if (filesData[fileName]) {
                cachedBytes += filesData[fileName].size;
            }
        });
        
        console.log(`Recalculated progress: ${downloadedFiles.size} downloaded, ${cachedFiles.size} cached`);
    }
    
    /**
     * Update the UI with current progress
     */
    function updateUI() {
        if (!loadingBarElement || !loadingTextElement || !loadingInfoElement) return;
        
        const totalTrackedFiles = downloadedFiles.size + cachedFiles.size;
        const totalTrackedBytes = downloadedBytes + cachedBytes;
        
        // Calculate file count percentage
        const fileCountPercent = totalFiles > 0 ? Math.round((totalTrackedFiles / totalFiles) * 100) : 0;
        
        // Calculate byte size percentage
        const byteSizePercent = totalSizeBytes > 0 ? Math.round((totalTrackedBytes / totalSizeBytes) * 100) : 0;
        
        // Update loading bar (use file count percentage for visual progress)
        loadingBarElement.style.width = `${fileCountPercent}%`;
        
        // Update loading text with file count
        loadingTextElement.textContent = `Loading resources... ${fileCountPercent}% (${totalTrackedFiles}/${totalFiles} files)`;
        
        // Update loading info with more details
        let infoText = `Downloaded: ${downloadedFiles.size}, Cached: ${cachedFiles.size}`;
        
        if (totalSizeBytes > 0) {
            infoText += ` - Size: ${formatFileSize(totalTrackedBytes)}/${formatFileSize(totalSizeBytes)} (${byteSizePercent}%)`;
        }
        
        loadingInfoElement.textContent = infoText;
        
        // Update title if we have file data
        if (filesData && loadingTitleElement) {
            loadingTitleElement.textContent = `Loading Monk Journey... ${fileCountPercent}%`;
        }
        
        // Log progress to console every 5 seconds
        const now = Date.now();
        if (now - lastLogTime > 5000) {
            console.log(`Loading progress: ${fileCountPercent}% by count, ${byteSizePercent}% by size`);
            console.log(`Files: ${totalTrackedFiles}/${totalFiles} (Downloaded: ${downloadedFiles.size}, Cached: ${cachedFiles.size})`);
            lastLogTime = now;
        }
        
        // Check if loading is complete (95% or more files loaded)
        if (totalFiles > 0 && totalTrackedFiles >= totalFiles * 0.95) {
            // If window has loaded, finish up
            if (document.readyState === 'complete') {
                finishLoading();
            }
        }
    }
    
    /**
     * Finish loading and show completion message
     */
    function finishLoading() {
        // Only run once
        if (window.fileTrackerFinished) return;
        window.fileTrackerFinished = true;
        
        const loadTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const totalTrackedFiles = downloadedFiles.size + cachedFiles.size;
        
        // Set loading bar to 100%
        if (loadingBarElement) {
            loadingBarElement.style.width = '100%';
        }
        
        // Update loading text
        if (loadingTextElement) {
            loadingTextElement.textContent = `Assets loaded in ${loadTime}s`;
        }
        
        // Create a detailed summary
        if (loadingInfoElement) {
            const fileCountPercent = totalFiles > 0 ? Math.round((totalTrackedFiles / totalFiles) * 100) : 0;
            const byteSizePercent = totalSizeBytes > 0 ? Math.round(((downloadedBytes + cachedBytes) / totalSizeBytes) * 100) : 0;
            
            loadingInfoElement.textContent = `${totalTrackedFiles}/${totalFiles} files (${fileCountPercent}%) - Downloaded: ${downloadedFiles.size}, Cached: ${cachedFiles.size}`;
        }
        
        // Log completion to console
        console.log(`Loading complete in ${loadTime}s`);
        console.log(`Files loaded: ${totalTrackedFiles}/${totalFiles} (${downloadedFiles.size} downloaded, ${cachedFiles.size} cached)`);
        console.log(`Total size: ${formatFileSize(downloadedBytes + cachedBytes)}/${formatFileSize(totalSizeBytes)}`);
        
        // Dispatch a custom event to notify that tracking is complete
        const trackingCompleteEvent = new CustomEvent('fileTrackingComplete', {
            detail: {
                loadTime: loadTime,
                totalFiles: totalFiles,
                loadedFiles: totalTrackedFiles,
                downloadedFiles: downloadedFiles.size,
                cachedFiles: cachedFiles.size,
                totalSizeBytes: totalSizeBytes,
                loadedBytes: downloadedBytes + cachedBytes
            }
        });
        window.dispatchEvent(trackingCompleteEvent);
    }
    
    // Track last log time
    let lastLogTime = Date.now();
    
    /**
     * Format file size in human-readable format
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Expose API for other scripts to access tracking data
    window.fileTracker = {
        getStats: function() {
            return {
                totalFiles,
                totalSizeBytes,
                downloadedFiles: downloadedFiles.size,
                cachedFiles: cachedFiles.size,
                downloadedBytes,
                cachedBytes,
                fileCountPercent: totalFiles > 0 ? Math.round(((downloadedFiles.size + cachedFiles.size) / totalFiles) * 100) : 0,
                byteSizePercent: totalSizeBytes > 0 ? Math.round(((downloadedBytes + cachedBytes) / totalSizeBytes) * 100) : 0
            };
        }
    };
})();