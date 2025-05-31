/**
 * debug-utils.js
 * Utility functions for debug mode
 */

import { STORAGE_KEYS } from '../config/storage-keys.js';
import storageService from '../save-manager/StorageService.js';

// Cache for debug mode to avoid excessive async calls
let debugModeCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds cache TTL

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled, false otherwise
 */
export function isDebugMode() {
    // Use cached value if available and not expired
    const now = Date.now();
    if (debugModeCache !== null && now - lastCacheTime < CACHE_TTL) {
        return debugModeCache;
    }
    
    // For synchronous calls, we need to use a cached value or default to false
    // The cache will be updated asynchronously
    updateDebugModeCache();
    
    // Return current cache (might be null on first call)
    return debugModeCache === true;
}

/**
 * Update the debug mode cache asynchronously
 */
async function updateDebugModeCache() {
    try {
        // Initialize storage service if needed
        if (!storageService.initialized) {
            await storageService.init();
        }
        
        // Get debug mode from storage service
        const debugMode = await storageService.loadData(STORAGE_KEYS.DEBUG_MODE);
        
        // Update cache
        debugModeCache = debugMode === 'true';
        lastCacheTime = Date.now();
    } catch (error) {
        console.error('Error updating debug mode cache:', error);
        // Default to false in case of error
        debugModeCache = false;
    }
}

// Initialize the cache on module load
updateDebugModeCache();
