/**
 * file-tracker.js
 * Enhanced file tracking system that monitors all network requests
 * Provides a summary of downloaded/cached files compared to the total list
 */

(function() {
    // State variables
    const startTime = Date.now();
    let filesData = null;
    let totalFiles = 0;
    let totalSizeBytes = 0;
    
    // Track files from file-sizes.json
    let knownFiles = new Set();
    let knownDownloadedFiles = new Set();
    let knownCachedFiles = new Set();
    let knownDownloadedBytes = 0;
    let knownCachedBytes = 0;
    
    // Track all network requests
    let allDownloadedFiles = new Set();
    let allCachedFiles = new Set();
    let allDownloadedBytes = 0;
    let allCachedBytes = 0;
    
    // Map to store file sizes for files not in file-sizes.json
    let otherFileSizes = new Map();
    
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
        const encodedBodySize = entry.encodedBodySize || 0;
        
        // Skip tracking for analytics, tracking pixels, etc.
        if (url.includes('analytics') || url.includes('tracking') || 
            url.includes('beacon') || url.includes('file-sizes.json')) {
            return;
        }
        
        // Extract the file name from the URL
        const fileName = url.split('/').pop();
        
        // Determine actual file size - use transferSize if available, otherwise encodedBodySize
        let actualSize = transferSize > 0 ? transferSize : encodedBodySize;
        
        // Track in the appropriate category (downloaded or cached)
        if (transferSize > 0) {
            // File was downloaded
            if (!allDownloadedFiles.has(url)) {
                allDownloadedFiles.add(url);
                allDownloadedBytes += actualSize;
                console.debug(`Downloaded: ${url} (${formatFileSize(actualSize)})`);
            }
        } else if (encodedBodySize > 0) {
            // File was loaded from cache
            if (!allCachedFiles.has(url)) {
                allCachedFiles.add(url);
                allCachedBytes += actualSize;
                console.debug(`Loaded from cache: ${url} (${formatFileSize(actualSize)})`);
            }
        }
        
        // Store size for files not in file-sizes.json
        if (actualSize > 0) {
            otherFileSizes.set(url, actualSize);
        }
        
        // Skip further processing if we don't have file data yet
        if (!filesData) {
            return;
        }
        
        // Also track files that are in file-sizes.json separately
        if (filesData[fileName]) {
            const fileSize = filesData[fileName].size;
            knownFiles.add(fileName);
            
            // Determine if file was downloaded or loaded from cache
            if (transferSize > 0) {
                // File was downloaded
                if (!knownDownloadedFiles.has(fileName)) {
                    knownDownloadedFiles.add(fileName);
                    knownDownloadedBytes += fileSize;
                }
            } else {
                // File was loaded from cache
                if (!knownCachedFiles.has(fileName)) {
                    knownCachedFiles.add(fileName);
                    knownCachedBytes += fileSize;
                }
            }
        }
    }
    
    /**
     * Recalculate progress for files tracked before file-sizes.json was loaded
     * This is no longer needed with the new tracking approach
     */
    function recalculateProgress() {
        // We're now tracking all files directly, so this function is mostly a no-op
        console.log(`Total tracked files: ${allDownloadedFiles.size + allCachedFiles.size} (${allDownloadedFiles.size} downloaded, ${allCachedFiles.size} cached)`);
        console.log(`Known files from file-sizes.json: ${knownFiles.size}/${totalFiles}`);
    }
    
    /**
     * Update the UI with current progress
     */
    function updateUI() {
        if (!loadingBarElement || !loadingTextElement || !loadingInfoElement) return;
        
        // Calculate known files progress (from file-sizes.json)
        const knownTotalFiles = knownDownloadedFiles.size + knownCachedFiles.size;
        const knownTotalBytes = knownDownloadedBytes + knownCachedBytes;
        
        // Calculate all files progress
        const allTotalFiles = allDownloadedFiles.size + allCachedFiles.size;
        const allTotalBytes = allDownloadedBytes + allCachedBytes;
        
        // Calculate percentages for known files
        const knownFileCountPercent = totalFiles > 0 ? Math.round((knownTotalFiles / totalFiles) * 100) : 0;
        const knownByteSizePercent = totalSizeBytes > 0 ? Math.round((knownTotalBytes / totalSizeBytes) * 100) : 0;
        
        // Use the higher percentage for the loading bar (all files vs known files)
        // This better matches what Chrome's network panel shows
        const displayPercent = Math.max(
            knownFileCountPercent,
            // If we have a lot of files, use a percentage based on total bytes
            allTotalFiles > totalFiles ? Math.min(95, Math.round((allTotalBytes / (totalSizeBytes * 1.2)) * 100)) : 0
        );
        
        // Update loading bar
        loadingBarElement.style.width = `${displayPercent}%`;
        
        // Update loading text with both known and all files
        loadingTextElement.textContent = `Loading resources... ${displayPercent}% (${allTotalFiles} total files)`;
        
        // Update loading info with more details
        let infoText = `Known files: ${knownTotalFiles}/${totalFiles}`;
        infoText += ` - Downloaded: ${allDownloadedFiles.size}, Cached: ${allCachedFiles.size}`;
        
        if (totalSizeBytes > 0) {
            infoText += ` - Size: ${formatFileSize(allTotalBytes)}/${formatFileSize(totalSizeBytes * 1.2)} (${Math.round((allTotalBytes / (totalSizeBytes * 1.2)) * 100)}%)`;
        }
        
        loadingInfoElement.textContent = infoText;
        
        // Update title if we have file data
        if (filesData && loadingTitleElement) {
            loadingTitleElement.textContent = `Loading Monk Journey... ${displayPercent}%`;
        }
        
        // Log progress to console every 5 seconds
        const now = Date.now();
        if (now - lastLogTime > 5000) {
            console.log(`All files: ${allTotalFiles} (${formatFileSize(allTotalBytes)})`);
            console.log(`Known files: ${knownTotalFiles}/${totalFiles} (${knownFileCountPercent}% by count, ${knownByteSizePercent}% by size)`);
            console.log(`Downloaded: ${allDownloadedFiles.size}, Cached: ${allCachedFiles.size}`);
            lastLogTime = now;
        }
        
        // Check if loading is complete (95% or more files loaded or document is complete)
        const loadingComplete = 
            (totalFiles > 0 && knownTotalFiles >= totalFiles * 0.95) || 
            (allTotalFiles > totalFiles * 1.2) ||
            (document.readyState === 'complete' && now - startTime > 5000);
            
        if (loadingComplete) {
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
        
        // Calculate known files progress (from file-sizes.json)
        const knownTotalFiles = knownDownloadedFiles.size + knownCachedFiles.size;
        const knownTotalBytes = knownDownloadedBytes + knownCachedBytes;
        
        // Calculate all files progress
        const allTotalFiles = allDownloadedFiles.size + allCachedFiles.size;
        const allTotalBytes = allDownloadedBytes + allCachedBytes;
        
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
            const knownFileCountPercent = totalFiles > 0 ? Math.round((knownTotalFiles / totalFiles) * 100) : 0;
            
            loadingInfoElement.textContent = `${allTotalFiles} total files - Known: ${knownTotalFiles}/${totalFiles} (${knownFileCountPercent}%) - Downloaded: ${allDownloadedFiles.size}, Cached: ${allCachedFiles.size}`;
        }
        
        // Log completion to console
        console.log(`Loading complete in ${loadTime}s`);
        console.log(`All files loaded: ${allTotalFiles} (${allDownloadedFiles.size} downloaded, ${allCachedFiles.size} cached)`);
        console.log(`Known files loaded: ${knownTotalFiles}/${totalFiles}`);
        console.log(`Total size: ${formatFileSize(allTotalBytes)} (Known files: ${formatFileSize(knownTotalBytes)}/${formatFileSize(totalSizeBytes)})`);
        
        // Dispatch a custom event to notify that tracking is complete
        const trackingCompleteEvent = new CustomEvent('fileTrackingComplete', {
            detail: {
                loadTime: loadTime,
                // Known files (from file-sizes.json)
                totalKnownFiles: totalFiles,
                loadedKnownFiles: knownTotalFiles,
                knownDownloadedFiles: knownDownloadedFiles.size,
                knownCachedFiles: knownCachedFiles.size,
                totalKnownSizeBytes: totalSizeBytes,
                loadedKnownBytes: knownTotalBytes,
                // All files
                totalFiles: allTotalFiles,
                downloadedFiles: allDownloadedFiles.size,
                cachedFiles: allCachedFiles.size,
                totalSizeBytes: allTotalBytes
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
            // Calculate known files progress (from file-sizes.json)
            const knownTotalFiles = knownDownloadedFiles.size + knownCachedFiles.size;
            const knownTotalBytes = knownDownloadedBytes + knownCachedBytes;
            
            // Calculate all files progress
            const allTotalFiles = allDownloadedFiles.size + allCachedFiles.size;
            const allTotalBytes = allDownloadedBytes + allCachedBytes;
            
            return {
                // Known files (from file-sizes.json)
                knownFiles: {
                    total: totalFiles,
                    loaded: knownTotalFiles,
                    downloaded: knownDownloadedFiles.size,
                    cached: knownCachedFiles.size,
                    totalBytes: totalSizeBytes,
                    loadedBytes: knownTotalBytes,
                    fileCountPercent: totalFiles > 0 ? Math.round((knownTotalFiles / totalFiles) * 100) : 0,
                    byteSizePercent: totalSizeBytes > 0 ? Math.round((knownTotalBytes / totalSizeBytes) * 100) : 0
                },
                // All files
                allFiles: {
                    total: allTotalFiles,
                    downloaded: allDownloadedFiles.size,
                    cached: allCachedFiles.size,
                    totalBytes: allTotalBytes,
                    byteSizePercent: totalSizeBytes > 0 ? Math.round((allTotalBytes / (totalSizeBytes * 1.2)) * 100) : 0
                }
            };
        }
    };
})();