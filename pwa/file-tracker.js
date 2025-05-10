/**
 * file-tracker.js
 * Enhanced file tracking system that monitors all network requests
 * Provides a summary of downloaded/cached files compared to the total list
 * Refactored to use class-based approach for better organization
 */

// Define interfaces for better type clarity
/**
 * @typedef {Object} FileInfo
 * @property {number} size - Size of the file in bytes
 */

/**
 * @typedef {Object} FileSizesData
 * @property {Object.<string, FileInfo>} fileSizes - Map of file names to file info
 * @property {number} totalFiles - Total number of files
 * @property {number} totalSizeBytes - Total size of all files in bytes
 */

/**
 * @typedef {Object} FileStats
 * @property {Object} knownFiles - Stats for files from file-sizes.json
 * @property {number} knownFiles.total - Total number of known files
 * @property {number} knownFiles.loaded - Number of loaded known files
 * @property {number} knownFiles.downloaded - Number of downloaded known files
 * @property {number} knownFiles.cached - Number of cached known files
 * @property {number} knownFiles.totalBytes - Total size of known files in bytes
 * @property {number} knownFiles.loadedBytes - Size of loaded known files in bytes
 * @property {number} knownFiles.fileCountPercent - Percentage of known files loaded by count
 * @property {number} knownFiles.byteSizePercent - Percentage of known files loaded by size
 * @property {Object} allFiles - Stats for all files
 * @property {number} allFiles.total - Total number of all files
 * @property {number} allFiles.downloaded - Number of downloaded files
 * @property {number} allFiles.cached - Number of cached files
 * @property {number} allFiles.totalBytes - Total size of all files in bytes
 * @property {number} allFiles.byteSizePercent - Percentage of all files loaded by size
 */

/**
 * FileTracker class for monitoring file downloads and caching
 */
class FileTracker {
    /**
     * Initialize the file tracker
     */
    constructor() {
        // State variables
        this.startTime = Date.now();
        this.filesData = null;
        this.totalFiles = 0;
        this.totalSizeBytes = 0;
        
        // Track files from file-sizes.json
        this.knownFiles = new Set();
        this.knownDownloadedFiles = new Set();
        this.knownCachedFiles = new Set();
        this.knownDownloadedBytes = 0;
        this.knownCachedBytes = 0;
        
        // Track all network requests
        this.allDownloadedFiles = new Set();
        this.allCachedFiles = new Set();
        this.allDownloadedBytes = 0;
        this.allCachedBytes = 0;
        
        // Map to store file sizes for files not in file-sizes.json
        this.otherFileSizes = new Map();
        
        // DOM elements for displaying progress
        this.loadingTitleElement = null;
        this.loadingBarElement = null;
        this.loadingTextElement = null;
        this.loadingInfoElement = null;
        
        // Track last log time
        this.lastLogTime = Date.now();
        
        // Initialize tracking as soon as possible
        this.initTracking();
    }
    
    /**
     * Initialize the file tracking system
     */
    initTracking() {
        console.debug('Initializing file tracking system');
        
        // Get references to existing UI elements
        const uiReady = this.setupUI();
        
        // Only proceed if UI elements are found
        if (uiReady) {
            // Start observing network requests immediately
            this.setupNetworkObserver();
            
            // Fetch file-sizes.json for reference data
            this.fetchFileSizesData();
            
            // Set up a regular interval to update the UI
            setInterval(() => this.updateUI(), 500);
        }
    }
    
    /**
     * Set up references to UI elements
     * @returns {boolean} Whether UI setup was successful
     */
    setupUI() {
        // Get references to existing elements
        this.loadingTitleElement = document.querySelector('.loading-title');
        this.loadingBarElement = document.querySelector('.loading-bar');
        this.loadingTextElement = document.querySelector('.loading-text');
        this.loadingInfoElement = document.querySelector('.loading-info');
        
        // Check if elements exist
        if (!this.loadingTitleElement || !this.loadingBarElement || 
            !this.loadingTextElement || !this.loadingInfoElement) {
            console.error('Could not find loading indicator elements. File tracking disabled.');
            return false;
        }
        
        console.debug('Found loading indicator elements');
        
        // Set initial content
        this.loadingTextElement.textContent = 'Initializing file tracking...';
        this.loadingInfoElement.textContent = 'Waiting for file-sizes.json...';
        
        return true;
    }
    
    /**
     * Fetch file-sizes.json data
     */
    fetchFileSizesData() {
        fetch('pwa/file-sizes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch file sizes: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Store file data
                this.filesData = data.fileSizes;
                this.totalFiles = data.totalFiles || Object.keys(this.filesData).length;
                this.totalSizeBytes = data.totalSizeBytes || 0;
                
                console.debug(`File data loaded: ${this.totalFiles} files, total size: ${this.formatFileSize(this.totalSizeBytes)}`);
                
                // Update UI with initial data
                this.updateUI();
                
                // Check if we've already tracked some files before data was loaded
                if (this.allDownloadedFiles.size > 0 || this.allCachedFiles.size > 0) {
                    console.debug(`Already tracked ${this.allDownloadedFiles.size + this.allCachedFiles.size} files before file-sizes.json was loaded`);
                    this.recalculateProgress();
                }
            })
            .catch(error => {
                console.error('Error fetching file sizes JSON:', error);
                if (this.loadingInfoElement) {
                    this.loadingInfoElement.textContent = 'Error loading file-sizes.json';
                }
            });
    }
    
    /**
     * Set up network request observer
     */
    setupNetworkObserver() {
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        // Only process completed resource loads
                        if (entry.entryType === 'resource') {
                            this.processResourceEntry(entry);
                        }
                    });
                });
                
                // Observe resource timing entries
                observer.observe({ entryTypes: ['resource'] });
                console.debug('Network performance observer started');
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
    processResourceEntry(entry) {
        const url = entry.name;
        const transferSize = entry.transferSize || 0;
        const encodedBodySize = entry.encodedBodySize || 0;
        const decodedBodySize = entry.decodedBodySize || 0;
        
        // Skip tracking for analytics, tracking pixels, etc.
        if (url.includes('analytics') || url.includes('tracking') || 
            url.includes('beacon') || url.includes('file-sizes.json')) {
            return;
        }
        
        // Extract the file name from the URL, removing query parameters
        let fileName = url.split('/').pop();
        // Remove query parameters if present
        if (fileName.includes('?')) {
            fileName = fileName.split('?')[0];
        }
        // Remove hash if present
        if (fileName.includes('#')) {
            fileName = fileName.split('#')[0];
        }
        
        // Determine actual file size - prioritize decoded size for more accurate comparison with Chrome
        // Fall back to transfer size or encoded size if decoded is not available
        let actualSize = decodedBodySize > 0 ? decodedBodySize : (transferSize > 0 ? transferSize : encodedBodySize);
        
        // Track in the appropriate category (downloaded or cached)
        if (transferSize > 0) {
            // File was downloaded
            if (!this.allDownloadedFiles.has(url)) {
                this.allDownloadedFiles.add(url);
                this.allDownloadedBytes += actualSize;
                console.debug(`Downloaded: ${url} (${this.formatFileSize(actualSize)})`);
            }
        } else if (encodedBodySize > 0 || decodedBodySize > 0) {
            // File was loaded from cache
            if (!this.allCachedFiles.has(url)) {
                this.allCachedFiles.add(url);
                this.allCachedBytes += actualSize;
                console.debug(`Loaded from cache: ${url} (${this.formatFileSize(actualSize)})`);
            }
        }
        
        // Store size for files not in file-sizes.json
        if (actualSize > 0) {
            this.otherFileSizes.set(url, actualSize);
        }
        
        // Skip further processing if we don't have file data yet
        if (!this.filesData) {
            return;
        }
        
        // Try to match with file-sizes.json in multiple ways
        let fileInfo = this.filesData[fileName];
        
        // If not found by exact name, try to find by name without extension
        if (!fileInfo && fileName.includes('.')) {
            const nameWithoutExt = fileName.split('.')[0];
            // Look for any file that starts with this name
            for (const key in this.filesData) {
                if (key.startsWith(nameWithoutExt + '.')) {
                    fileInfo = this.filesData[key];
                    fileName = key; // Use the matched key
                    break;
                }
            }
        }
        
        // Also track files that are in file-sizes.json separately
        if (fileInfo) {
            const fileSize = fileInfo.size;
            this.knownFiles.add(fileName);
            
            // Determine if file was downloaded or loaded from cache
            if (transferSize > 0) {
                // File was downloaded
                if (!this.knownDownloadedFiles.has(fileName)) {
                    this.knownDownloadedFiles.add(fileName);
                    this.knownDownloadedBytes += fileSize;
                }
            } else {
                // File was loaded from cache
                if (!this.knownCachedFiles.has(fileName)) {
                    this.knownCachedFiles.add(fileName);
                    this.knownCachedBytes += fileSize;
                }
            }
        } else {
            // Log files not found in file-sizes.json for debugging
            console.debug(`File not in file-sizes.json: ${fileName} (${this.formatFileSize(actualSize)})`);
        }
    }
    
    /**
     * Recalculate progress for files tracked before file-sizes.json was loaded
     * This is no longer needed with the new tracking approach
     */
    recalculateProgress() {
        // We're now tracking all files directly, so this function is mostly a no-op
        console.debug(`Total tracked files: ${this.allDownloadedFiles.size + this.allCachedFiles.size} (${this.allDownloadedFiles.size} downloaded, ${this.allCachedFiles.size} cached)`);
        console.debug(`Known files from file-sizes.json: ${this.knownFiles.size}/${this.totalFiles}`);
    }
    
    /**
     * Update the UI with current progress
     */
    updateUI() {
        if (!this.loadingBarElement || !this.loadingTextElement || !this.loadingInfoElement) return;
        
        // Calculate known files progress (from file-sizes.json)
        const knownTotalFiles = this.knownDownloadedFiles.size + this.knownCachedFiles.size;
        const knownTotalBytes = this.knownDownloadedBytes + this.knownCachedBytes;
        
        // Calculate all files progress
        const allTotalFiles = this.allDownloadedFiles.size + this.allCachedFiles.size;
        const allTotalBytes = this.allDownloadedBytes + this.allCachedBytes;
        
        // Calculate percentages for known files
        const knownFileCountPercent = this.totalFiles > 0 ? Math.round((knownTotalFiles / this.totalFiles) * 100) : 0;
        const knownByteSizePercent = this.totalSizeBytes > 0 ? Math.round((knownTotalBytes / this.totalSizeBytes) * 100) : 0;
        
        // Calculate percentage for all files (compared to expected total)
        // Use a more realistic multiplier (1.05) since Chrome's total might include some overhead
        const allBytesPercent = this.totalSizeBytes > 0 ? 
            Math.round((allTotalBytes / this.totalSizeBytes) * 100) : 0;
        
        // Use the higher percentage for the loading bar
        // This better matches what Chrome's network panel shows
        const displayPercent = Math.max(
            knownFileCountPercent,
            knownByteSizePercent,
            allBytesPercent > 100 ? 95 : allBytesPercent // Cap at 95% if over 100%
        );
        
        // Update loading bar
        this.loadingBarElement.style.width = `${Math.min(displayPercent, 100)}%`;
        
        // Update loading text with both known and all files
        this.loadingTextElement.textContent = `Loading resources... ${displayPercent}% (${allTotalFiles} total files)`;
        
        // Update loading info with more details
        let infoText = `Known files: ${knownTotalFiles}/${this.totalFiles} (${knownFileCountPercent}% by count, ${knownByteSizePercent}% by size)`;
        infoText += ` - Downloaded: ${this.allDownloadedFiles.size}, Cached: ${this.allCachedFiles.size}`;
        
        if (this.totalSizeBytes > 0) {
            infoText += ` - Size: ${this.formatFileSize(allTotalBytes)}/${this.formatFileSize(this.totalSizeBytes)} (${allBytesPercent}%)`;
        }
        
        this.loadingInfoElement.textContent = infoText;
        
        // Log detailed stats to console for debugging
        const now = Date.now();
        if (typeof this.lastLogTime === 'undefined' || now - this.lastLogTime > 5000) {
            console.debug('--- File Tracker Stats ---');
            console.debug(`Total known files in file-sizes.json: ${this.totalFiles} (${this.formatFileSize(this.totalSizeBytes)})`);
            console.debug(`Known files tracked: ${knownTotalFiles}/${this.totalFiles} (${knownFileCountPercent}% by count, ${knownByteSizePercent}% by size)`);
            console.debug(`All files tracked: ${allTotalFiles} (${this.formatFileSize(allTotalBytes)})`);
            console.debug(`Files not in file-sizes.json: ${allTotalFiles - knownTotalFiles}`);
            
            // List some files not in file-sizes.json for debugging
            const unknownFiles = Array.from(this.otherFileSizes.entries())
                .filter(([url]) => {
                    // Make sure url is not null or undefined
                    if (!url) return false;
                    
                    try {
                        const urlParts = url.split('/');
                        const lastPart = urlParts.pop() || '';
                        const fileName = lastPart.split('?')[0] || '';
                        
                        // Check if this.filesData exists and if the fileName exists in it
                        return !this.filesData || !fileName || !this.filesData[fileName];
                    } catch (error) {
                        console.error('Error processing URL in file tracker:', error, url);
                        return false;
                    }
                })
                .sort((a, b) => b[1] - a[1]) // Sort by size, largest first
                .slice(0, 5); // Take top 5
                
            if (unknownFiles.length > 0) {
                console.debug('Top 5 largest files not in file-sizes.json:');
                unknownFiles.forEach(([url, size]) => {
                    console.debug(`- ${url.split('/').pop()}: ${this.formatFileSize(size)}`);
                });
            }
            
            this.lastLogTime = now;
        }
        
        // Update title if we have file data
        if (this.filesData && this.loadingTitleElement) {
            this.loadingTitleElement.textContent = `Loading Monk Journey... ${displayPercent}%`;
        }
        
        // Check if loading is complete (95% or more files loaded or document is complete)
        const loadingComplete = 
            (this.totalFiles > 0 && knownTotalFiles >= this.totalFiles * 0.95) || 
            (allTotalFiles > this.totalFiles * 1.2) ||
            (document.readyState === 'complete' && now - this.startTime > 5000);
            
        if (loadingComplete) {
            // If window has loaded, finish up
            if (document.readyState === 'complete') {
                this.finishLoading();
            }
        }
    }
    
    /**
     * Finish loading and show completion message
     */
    finishLoading() {
        // Only run once
        if (window.fileTrackerFinished) return;
        window.fileTrackerFinished = true;
        
        const loadTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        // Calculate known files progress (from file-sizes.json)
        const knownTotalFiles = this.knownDownloadedFiles.size + this.knownCachedFiles.size;
        const knownTotalBytes = this.knownDownloadedBytes + this.knownCachedBytes;
        
        // Calculate all files progress
        const allTotalFiles = this.allDownloadedFiles.size + this.allCachedFiles.size;
        const allTotalBytes = this.allDownloadedBytes + this.allCachedBytes;
        
        // Set loading bar to 100%
        if (this.loadingBarElement) {
            this.loadingBarElement.style.width = '100%';
        }
        
        // Update loading text
        if (this.loadingTextElement) {
            this.loadingTextElement.textContent = `Assets loaded in ${loadTime}s`;
        }
        
        // Create a detailed summary
        if (this.loadingInfoElement) {
            const knownFileCountPercent = this.totalFiles > 0 ? Math.round((knownTotalFiles / this.totalFiles) * 100) : 0;
            
            this.loadingInfoElement.textContent = `${allTotalFiles} total files - Known: ${knownTotalFiles}/${this.totalFiles} (${knownFileCountPercent}%) - Downloaded: ${this.allDownloadedFiles.size}, Cached: ${this.allCachedFiles.size}`;
        }
        
        // Log completion to console
        console.debug(`Loading complete in ${loadTime}s`);
        console.debug(`All files loaded: ${allTotalFiles} (${this.allDownloadedFiles.size} downloaded, ${this.allCachedFiles.size} cached)`);
        console.debug(`Known files loaded: ${knownTotalFiles}/${this.totalFiles}`);
        console.debug(`Total size: ${this.formatFileSize(allTotalBytes)} (Known files: ${this.formatFileSize(knownTotalBytes)}/${this.formatFileSize(this.totalSizeBytes)})`);
        
        // Dispatch a custom event to notify that tracking is complete
        const trackingCompleteEvent = new CustomEvent('fileTrackingComplete', {
            detail: {
                loadTime: loadTime,
                // Known files (from file-sizes.json)
                totalKnownFiles: this.totalFiles,
                loadedKnownFiles: knownTotalFiles,
                knownDownloadedFiles: this.knownDownloadedFiles.size,
                knownCachedFiles: this.knownCachedFiles.size,
                totalKnownSizeBytes: this.totalSizeBytes,
                loadedKnownBytes: knownTotalBytes,
                // All files
                totalFiles: allTotalFiles,
                downloadedFiles: this.allDownloadedFiles.size,
                cachedFiles: this.allCachedFiles.size,
                totalSizeBytes: allTotalBytes
            }
        });
        window.dispatchEvent(trackingCompleteEvent);
    }
    
    /**
     * Format file size in human-readable format
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Get current file tracking statistics
     * @returns {FileStats} Current file tracking statistics
     */
    getStats() {
        // Calculate known files progress (from file-sizes.json)
        const knownTotalFiles = this.knownDownloadedFiles.size + this.knownCachedFiles.size;
        const knownTotalBytes = this.knownDownloadedBytes + this.knownCachedBytes;
        
        // Calculate all files progress
        const allTotalFiles = this.allDownloadedFiles.size + this.allCachedFiles.size;
        const allTotalBytes = this.allDownloadedBytes + this.allCachedBytes;
        
        return {
            // Known files (from file-sizes.json)
            knownFiles: {
                total: this.totalFiles,
                loaded: knownTotalFiles,
                downloaded: this.knownDownloadedFiles.size,
                cached: this.knownCachedFiles.size,
                totalBytes: this.totalSizeBytes,
                loadedBytes: knownTotalBytes,
                fileCountPercent: this.totalFiles > 0 ? Math.round((knownTotalFiles / this.totalFiles) * 100) : 0,
                byteSizePercent: this.totalSizeBytes > 0 ? Math.round((knownTotalBytes / this.totalSizeBytes) * 100) : 0
            },
            // All files
            allFiles: {
                total: allTotalFiles,
                downloaded: this.allDownloadedFiles.size,
                cached: this.allCachedFiles.size,
                totalBytes: allTotalBytes,
                byteSizePercent: this.totalSizeBytes > 0 ? Math.round((allTotalBytes / (this.totalSizeBytes * 1.2)) * 100) : 0
            }
        };
    }
}

// Immediately create an instance and expose API for other scripts
(function() {
    // Create and expose to window
    window.fileTracker = new FileTracker();
})();