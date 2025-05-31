import { SyncStorageAdapter } from './SyncStorageAdapter.js';
import { STORAGE_KEYS } from '../config/storage-keys.js';

/**
 * Centralized storage service for the entire application
 * All storage operations should go through this service
 */
export class StorageService {
    /**
     * Create a new StorageService
     * @param {string} googleClientId - Google API client ID
     */
    constructor(googleClientId) {
        this.adapter = new SyncStorageAdapter(googleClientId);
        this.pendingSaves = new Map(); // Track pending save operations
        this.initialized = false;
    }
    
    /**
     * Initialize the storage service
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initialized) {
            return;
        }
        
        // Add event listeners for storage events
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        
        // Migrate existing localStorage data if needed
        await this.migrateLocalData();
        
        this.initialized = true;
    }
    
    /**
     * Handle storage events from other tabs/windows
     * @param {StorageEvent} event - Storage event
     */
    handleStorageEvent(event) {
        // Only handle monk_journey keys
        if (event.key && event.key.startsWith('monk_journey_')) {
            // Notify any listeners about the change
            window.dispatchEvent(new CustomEvent('storage-service-update', {
                detail: {
                    key: event.key,
                    newValue: event.newValue,
                    oldValue: event.oldValue
                }
            }));
        }
    }
    
    /**
     * Get the storage adapter
     * @returns {SyncStorageAdapter} The storage adapter
     */
    getAdapter() {
        return this.adapter;
    }
    
    /**
     * Save data with the given key
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @returns {Promise<boolean>} Success status
     */
    async saveData(key, data) {
        // Cancel any pending save for this key
        if (this.pendingSaves.has(key)) {
            clearTimeout(this.pendingSaves.get(key));
            this.pendingSaves.delete(key);
        }
        
        try {
            const success = await this.adapter.saveData(key, data);
            
            // Dispatch event for successful save
            if (success) {
                window.dispatchEvent(new CustomEvent('storage-service-save', {
                    detail: { key, data }
                }));
            }
            
            return success;
        } catch (error) {
            console.error(`Error saving data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Save data with debounce to prevent excessive saves
     * @param {string} key - Storage key
     * @param {*} data - Data to store
     * @param {number} debounceMs - Debounce time in milliseconds
     * @returns {Promise<boolean>} Success status (resolves when save is scheduled)
     */
    debounceSave(key, data, debounceMs = 300) {
        return new Promise(resolve => {
            // Cancel any pending save for this key
            if (this.pendingSaves.has(key)) {
                clearTimeout(this.pendingSaves.get(key));
            }
            
            // Schedule a new save
            const timeoutId = setTimeout(async () => {
                this.pendingSaves.delete(key);
                const success = await this.saveData(key, data);
                // No need to resolve here as we already resolved below
            }, debounceMs);
            
            this.pendingSaves.set(key, timeoutId);
            
            // Resolve immediately with true to indicate the save was scheduled
            resolve(true);
        });
    }
    
    /**
     * Load data for the given key
     * @param {string} key - Storage key
     * @returns {Promise<*>} The loaded data (or null if not found)
     */
    async loadData(key) {
        try {
            return await this.adapter.loadData(key);
        } catch (error) {
            console.error(`Error loading data for key ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Delete data for the given key
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} Success status
     */
    async deleteData(key) {
        try {
            const success = await this.adapter.deleteData(key);
            
            // Dispatch event for successful delete
            if (success) {
                window.dispatchEvent(new CustomEvent('storage-service-delete', {
                    detail: { key }
                }));
            }
            
            return success;
        } catch (error) {
            console.error(`Error deleting data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Check if data exists for the given key
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} Whether data exists
     */
    async hasData(key) {
        try {
            return await this.adapter.hasData(key);
        } catch (error) {
            console.error(`Error checking if data exists for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Sign in to Google Drive
     * @returns {Promise<boolean>} Whether sign-in was successful
     */
    async signInToGoogle() {
        try {
            return await this.adapter.signInToGoogle();
        } catch (error) {
            console.error('Error signing in to Google Drive:', error);
            return false;
        }
    }
    
    /**
     * Sign out from Google Drive
     */
    signOutFromGoogle() {
        try {
            this.adapter.signOutFromGoogle();
        } catch (error) {
            console.error('Error signing out from Google Drive:', error);
        }
    }
    
    /**
     * Check if signed in to Google Drive
     * @returns {boolean} Whether signed in to Google Drive
     */
    isSignedInToGoogle() {
        try {
            return this.adapter.isSignedInToGoogle();
        } catch (error) {
            console.error('Error checking if signed in to Google Drive:', error);
            return false;
        }
    }
    
    /**
     * Migrate existing localStorage data to the storage adapter
     * @returns {Promise<void>}
     */
    async migrateLocalData() {
        console.debug('Migrating localStorage data to storage adapter...');
        
        // Get all keys from localStorage that start with 'monk_journey_'
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('monk_journey_')) {
                keys.push(key);
            }
        }
        
        console.debug(`Found ${keys.length} keys to migrate`);
        
        // Migrate each key to the storage adapter
        for (const key of keys) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    try {
                        // Try to parse as JSON
                        const parsedData = JSON.parse(data);
                        await this.saveData(key, parsedData);
                    } catch (parseError) {
                        // If not JSON, save as string
                        await this.saveData(key, data);
                    }
                }
            } catch (error) {
                console.error(`Error migrating ${key} to storage adapter:`, error);
            }
        }
        
        console.debug('Migration complete');
    }
}

// Create a singleton instance
const storageService = new StorageService(
    '1070303484277-3dmj1pfiv64gmgj396j5hcbvnqdkuje4.apps.googleusercontent.com'
);

export default storageService;