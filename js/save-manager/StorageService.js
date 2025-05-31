import { LocalStorageAdapter } from './LocalStorageAdapter.js';
import { GoogleDriveAdapter } from './GoogleDriveAdapter.js';
import { STORAGE_KEYS } from '../config/storage-keys.js';

/**
 * Centralized storage service for the entire application
 * All storage operations should go through this service
 * 
 * Simplified flow:
 * 1. Always store to localStorage first, async in background to sync to GoogleDrive
 * 2. On first load, when no state in localStorage, try to get from GoogleDrive if the user has signed in
 * 3. For conflict resolution, ask user to choose between localStorage or GoogleDrive version
 * 
 * Optimized for UI components:
 * - Use loadDataSync() for immediate UI rendering without async effects
 * - Use saveData() which saves to localStorage immediately and syncs to cloud in background
 */
export class StorageService {
    /**
     * Create a new StorageService
     * @param {string} googleClientId - Google API client ID
     */
    constructor(googleClientId) {
        this.localStorage = new LocalStorageAdapter();
        this.googleDrive = new GoogleDriveAdapter(googleClientId);
        this.pendingSaves = new Map(); // Track pending save operations
        this.initialized = false;
        this.isSigningIn = false;
        
        // Add event listeners for storage events
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        
        // Listen for sign-in/sign-out events
        window.addEventListener('google-signin-success', () => {
            this.handleGoogleSignIn();
        });
        
        window.addEventListener('google-signout', () => {
            console.debug('Google sign-out detected');
        });
        
        // Fix existing localStorage data format issues immediately
        this.localStorage.fixExistingData();
    }
    
    /**
     * Initialize the storage service
     * This is now a lightweight operation since fixExistingData is called in constructor
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initialized) {
            return;
        }
        
        this.initialized = true;
        
        // If user is signed in to Google, try to load data from Google Drive
        // This happens in background and doesn't block UI rendering
        if (this.isSignedInToGoogle()) {
            this.syncFromGoogleDrive().catch(error => {
                console.error('Error syncing from Google Drive during init:', error);
            });
        }
    }
    
    /**
     * Handle Google sign-in success
     * @private
     */
    async handleGoogleSignIn() {
        console.debug('Google sign-in detected, syncing data');
        this.isSigningIn = true;
        
        try {
            // First, check if we need to load data from Google Drive
            await this.syncFromGoogleDrive();
            
            // Then, sync local data to Google Drive
            await this.syncToGoogleDrive();
        } catch (error) {
            console.error('Error during Google sign-in sync:', error);
        } finally {
            this.isSigningIn = false;
        }
    }
    
    /**
     * Sync data from Google Drive to localStorage
     * @private
     * @returns {Promise<void>}
     */
    async syncFromGoogleDrive() {
        if (!this.isSignedInToGoogle()) {
            return;
        }
        
        console.debug('Syncing data from Google Drive to localStorage');
        
        // Get all keys from localStorage that start with 'monk_journey_'
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('monk_journey_')) {
                keys.push(key);
            }
        }
        
        // For each key, check if it exists in Google Drive
        for (const key of keys) {
            try {
                // Check if the key exists in Google Drive
                const hasCloudData = await this.googleDrive.hasData(key);
                
                if (hasCloudData) {
                    // Check if the key exists in localStorage
                    const hasLocalData = this.localStorage.hasData(key);
                    
                    if (!hasLocalData) {
                        // If the key doesn't exist in localStorage, load it from Google Drive
                        const cloudData = await this.googleDrive.loadData(key);
                        if (cloudData !== null) {
                            this.localStorage.saveData(key, cloudData);
                            console.debug(`Loaded ${key} from Google Drive to localStorage`);
                        }
                    } else {
                        // Both exist - check for conflicts
                        const localData = this.localStorage.loadData(key);
                        const cloudData = await this.googleDrive.loadData(key);
                        
                        // Simple string comparison to detect conflicts
                        const localStr = JSON.stringify(localData);
                        const cloudStr = JSON.stringify(cloudData);
                        
                        if (localStr !== cloudStr) {
                            // Conflict detected - ask user to resolve
                            await this.resolveConflict(key, localData, cloudData);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error syncing ${key} from Google Drive:`, error);
            }
        }
        
        // Also check for keys that exist in Google Drive but not in localStorage
        try {
            // This would require listing all files in the Google Drive folder
            // For simplicity, we'll skip this for now
            // In a real implementation, you would list all files in the Google Drive folder
            // and check if they exist in localStorage
        } catch (error) {
            console.error('Error checking for new keys in Google Drive:', error);
        }
    }
    
    /**
     * Sync data from localStorage to Google Drive
     * @private
     * @returns {Promise<void>}
     */
    async syncToGoogleDrive() {
        if (!this.isSignedInToGoogle()) {
            return;
        }
        
        console.debug('Syncing data from localStorage to Google Drive');
        
        // Get all keys from localStorage that start with 'monk_journey_'
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('monk_journey_')) {
                keys.push(key);
            }
        }
        
        // Sync each key to Google Drive
        for (const key of keys) {
            try {
                const data = this.localStorage.loadData(key);
                if (data !== null) {
                    await this.googleDrive.saveData(key, data);
                    console.debug(`Synced ${key} to Google Drive`);
                }
            } catch (error) {
                console.error(`Error syncing ${key} to Google Drive:`, error);
            }
        }
    }
    
    /**
     * Resolve a conflict between localStorage and Google Drive
     * @private
     * @param {string} key - The key with the conflict
     * @param {*} localData - The data from localStorage
     * @param {*} cloudData - The data from Google Drive
     * @returns {Promise<void>}
     */
    async resolveConflict(key, localData, cloudData) {
        console.warn(`Conflict detected for ${key}`);
        
        // For now, we'll use a simple confirm dialog
        // In a real implementation, you would use a more sophisticated UI
        const useCloudVersion = confirm(
            `Data conflict detected for ${key}.\n\n` +
            `Local version: ${JSON.stringify(localData).substring(0, 100)}${JSON.stringify(localData).length > 100 ? '...' : ''}\n\n` +
            `Cloud version: ${JSON.stringify(cloudData).substring(0, 100)}${JSON.stringify(cloudData).length > 100 ? '...' : ''}\n\n` +
            `Click OK to use the cloud version, or Cancel to keep your local version.`
        );
        
        if (useCloudVersion) {
            // Use the cloud version
            this.localStorage.saveData(key, cloudData);
            console.debug(`Resolved conflict for ${key} by using cloud version`);
        } else {
            // Use the local version - sync to cloud
            await this.googleDrive.saveData(key, localData);
            console.debug(`Resolved conflict for ${key} by using local version`);
        }
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
            // Always save to localStorage first
            const localSuccess = this.localStorage.saveData(key, data);
            
            // Dispatch event for successful save
            if (localSuccess) {
                window.dispatchEvent(new CustomEvent('storage-service-save', {
                    detail: { key, data }
                }));
            }
            
            // If signed in to Google Drive, sync in background
            if (this.isSignedInToGoogle()) {
                // Don't await this - let it run in the background
                this.googleDrive.saveData(key, data).catch(error => {
                    console.error(`Error syncing ${key} to Google Drive:`, error);
                });
            }
            
            return localSuccess;
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
                await this.saveData(key, data);
                // No need to resolve here as we already resolved below
            }, debounceMs);
            
            this.pendingSaves.set(key, timeoutId);
            
            // Resolve immediately with true to indicate the save was scheduled
            resolve(true);
        });
    }
    
    /**
     * Load data for the given key synchronously from localStorage only
     * This is the preferred method for UI components that need immediate data
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value to return if key is not found
     * @returns {*} The loaded data (or defaultValue if not found)
     */
    loadDataSync(key, defaultValue = null) {
        try {
            // Only try localStorage - this is synchronous and immediate
            const localData = this.localStorage.loadData(key);
            
            // If data exists in localStorage, return it
            if (localData !== null) {
                return localData;
            }
            
            // If we're signed in to Google but don't have local data,
            // trigger a background sync that will eventually update localStorage
            if (this.isSignedInToGoogle() && !this.isSigningIn) {
                // Don't await - this happens in background
                this.googleDrive.loadData(key)
                    .then(cloudData => {
                        if (cloudData !== null) {
                            this.localStorage.saveData(key, cloudData);
                            // Dispatch event to notify UI components of the update
                            window.dispatchEvent(new CustomEvent('storage-service-update', {
                                detail: { key, newValue: cloudData }
                            }));
                        }
                    })
                    .catch(error => {
                        console.error(`Error loading data from Google Drive for key ${key}:`, error);
                    });
            }
            
            // Return the default value
            return defaultValue;
        } catch (error) {
            console.error(`Error loading data synchronously for key ${key}:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Load data for the given key
     * @param {string} key - Storage key
     * @returns {Promise<*>} The loaded data (or null if not found)
     */
    async loadData(key) {
        try {
            // Always try localStorage first
            const localData = this.localStorage.loadData(key);
            
            // If data exists in localStorage, return it
            if (localData !== null) {
                return localData;
            }
            
            // If not found in localStorage and signed in to Google Drive, try Google Drive
            if (this.isSignedInToGoogle() && !this.isSigningIn) {
                try {
                    const cloudData = await this.googleDrive.loadData(key);
                    
                    // If found in Google Drive, save to localStorage for future use
                    if (cloudData !== null) {
                        this.localStorage.saveData(key, cloudData);
                        return cloudData;
                    }
                } catch (driveError) {
                    console.error(`Error loading data from Google Drive for key ${key}:`, driveError);
                }
            }
            
            // Not found in either storage
            return null;
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
            // Always delete from localStorage
            const localSuccess = this.localStorage.deleteData(key);
            
            // If signed in to Google Drive, also delete there
            if (this.isSignedInToGoogle()) {
                // Don't await this - let it run in the background
                this.googleDrive.deleteData(key).catch(error => {
                    console.error(`Error deleting ${key} from Google Drive:`, error);
                });
            }
            
            // Dispatch event for successful delete
            if (localSuccess) {
                window.dispatchEvent(new CustomEvent('storage-service-delete', {
                    detail: { key }
                }));
            }
            
            return localSuccess;
        } catch (error) {
            console.error(`Error deleting data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Check if data exists for the given key synchronously (localStorage only)
     * @param {string} key - Storage key
     * @returns {boolean} Whether data exists in localStorage
     */
    hasDataSync(key) {
        try {
            return this.localStorage.hasData(key);
        } catch (error) {
            console.error(`Error checking if data exists synchronously for key ${key}:`, error);
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
            // Check localStorage first
            const hasLocalData = this.localStorage.hasData(key);
            
            // If found in localStorage, return true
            if (hasLocalData) {
                return true;
            }
            
            // If not found in localStorage and signed in to Google Drive, check Google Drive
            if (this.isSignedInToGoogle() && !this.isSigningIn) {
                try {
                    return await this.googleDrive.hasData(key);
                } catch (driveError) {
                    console.error(`Error checking if data exists in Google Drive for key ${key}:`, driveError);
                }
            }
            
            // Not found in either storage
            return false;
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
            return await this.googleDrive.signIn();
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
            this.googleDrive.signOut();
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
            return this.googleDrive.isUserSignedIn();
        } catch (error) {
            console.error('Error checking if signed in to Google Drive:', error);
            return false;
        }
    }
}

// Create a singleton instance
const storageService = new StorageService(
    '1070303484277-ssbjoks5dqt7pdh5n887t3fkofm2cssf.apps.googleusercontent.com'
);

export default storageService;