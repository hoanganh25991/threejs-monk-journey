import { IStorageAdapter } from './IStorageAdapter.js';
import { LocalStorageAdapter } from './LocalStorageAdapter.js';
import { GoogleDriveAdapter } from './GoogleDriveAdapter.js';

/**
 * Storage adapter that can switch between local storage and Google Drive
 * Provides a unified interface for both storage methods
 */
export class SyncStorageAdapter extends IStorageAdapter {
    /**
     * Create a new SyncStorageAdapter
     * @param {string} googleClientId - Google API client ID
     */
    constructor(googleClientId) {
        super();
        this.localStorage = new LocalStorageAdapter();
        this.googleDrive = new GoogleDriveAdapter(googleClientId);
        this.useGoogleDrive = false;
        
        // Listen for sign-in/sign-out events
        window.addEventListener('google-signin-success', () => {
            this.useGoogleDrive = true;
            this.syncLocalToCloud();
        });
        
        window.addEventListener('google-signout', () => {
            this.useGoogleDrive = false;
        });
    }
    
    /**
     * Get the active storage adapter
     * @returns {IStorageAdapter} The active storage adapter
     */
    getActiveAdapter() {
        return this.useGoogleDrive && this.googleDrive.isUserSignedIn() 
            ? this.googleDrive 
            : this.localStorage;
    }
    
    /**
     * Sign in to Google Drive
     * @returns {Promise<boolean>} Whether sign-in was successful
     */
    async signInToGoogle() {
        const success = await this.googleDrive.signIn();
        if (success) {
            this.useGoogleDrive = true;
            await this.syncLocalToCloud();
        }
        return success;
    }
    
    /**
     * Sign out from Google Drive
     */
    signOutFromGoogle() {
        this.googleDrive.signOut();
        this.useGoogleDrive = false;
    }
    
    /**
     * Check if signed in to Google Drive
     * @returns {boolean} Whether signed in to Google Drive
     */
    isSignedInToGoogle() {
        return this.googleDrive.isUserSignedIn();
    }
    
    /**
     * Sync local storage data to cloud
     * @returns {Promise<void>}
     */
    async syncLocalToCloud() {
        if (!this.useGoogleDrive || !this.googleDrive.isUserSignedIn()) {
            return;
        }
        
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
                if (data) {
                    await this.googleDrive.saveData(key, data);
                }
            } catch (error) {
                console.error(`Error syncing ${key} to Google Drive:`, error);
            }
        }
    }
    
    /**
     * Save data with the given key
     * @param {string} key - Storage key
     * @param {*} data - Data to store (will be serialized)
     * @returns {boolean} Success status
     */
    async saveData(key, data) {
        // Always save to localStorage for offline access
        const localSuccess = this.localStorage.saveData(key, data);
        
        // If using Google Drive, also save there
        if (this.useGoogleDrive && this.googleDrive.isUserSignedIn()) {
            try {
                await this.googleDrive.saveData(key, data);
                return true;
            } catch (error) {
                console.error(`Error saving to Google Drive for key ${key}:`, error);
                return localSuccess;
            }
        }
        
        return localSuccess;
    }
    
    /**
     * Load data for the given key
     * @param {string} key - Storage key
     * @returns {*} The loaded data (or null if not found)
     */
    async loadData(key) {
        // If using Google Drive, try to load from there first
        if (this.useGoogleDrive && this.googleDrive.isUserSignedIn()) {
            try {
                const cloudData = await this.googleDrive.loadData(key);
                if (cloudData) {
                    // Update local storage with cloud data
                    this.localStorage.saveData(key, cloudData);
                    return cloudData;
                }
            } catch (error) {
                console.error(`Error loading from Google Drive for key ${key}:`, error);
            }
        }
        
        // Fall back to localStorage
        return this.localStorage.loadData(key);
    }
    
    /**
     * Delete data for the given key
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    async deleteData(key) {
        // Delete from localStorage
        const localSuccess = this.localStorage.deleteData(key);
        
        // If using Google Drive, also delete there
        if (this.useGoogleDrive && this.googleDrive.isUserSignedIn()) {
            try {
                await this.googleDrive.deleteData(key);
                return true;
            } catch (error) {
                console.error(`Error deleting from Google Drive for key ${key}:`, error);
                return localSuccess;
            }
        }
        
        return localSuccess;
    }
    
    /**
     * Check if data exists for the given key
     * @param {string} key - Storage key
     * @returns {boolean} Whether data exists
     */
    async hasData(key) {
        // If using Google Drive, check there first
        if (this.useGoogleDrive && this.googleDrive.isUserSignedIn()) {
            try {
                const hasCloudData = await this.googleDrive.hasData(key);
                if (hasCloudData) {
                    return true;
                }
            } catch (error) {
                console.error(`Error checking Google Drive for key ${key}:`, error);
            }
        }
        
        // Fall back to localStorage
        return this.localStorage.hasData(key);
    }
}