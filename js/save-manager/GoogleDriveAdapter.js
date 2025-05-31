import { IStorageAdapter } from './IStorageAdapter.js';

/**
 * Implementation of storage adapter using Google Drive API
 * Allows for cross-device synchronization of save data
 */
export class GoogleDriveAdapter extends IStorageAdapter {
    /**
     * Create a new GoogleDriveAdapter
     * @param {string} clientId - Google API client ID
     */
    constructor(clientId) {
        super();
        this.clientId = clientId;
        this.isSignedIn = false;
        this.tokenClient = null;
        this.accessToken = null;
        this.fileCache = new Map(); // Cache file IDs for faster access
        this.FOLDER_NAME = 'MonkJourneySaves';
        this.folderId = null;
        
        // Scopes needed for Google Drive API
        this.SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';
        
        // Initialize Google API
        this.init();
    }
    
    /**
     * Initialize the Google API client
     */
    async init() {
        try {
            // Initialize the tokenClient
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope: this.SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        this.accessToken = tokenResponse.access_token;
                        this.isSignedIn = true;
                        
                        // Ensure save folder exists
                        this.ensureSaveFolder();
                        
                        // Dispatch event for successful sign-in
                        window.dispatchEvent(new CustomEvent('google-signin-success'));
                    }
                },
                error_callback: (error) => {
                    console.error('Google Sign-In error:', error);
                    this.isSignedIn = false;
                    this.accessToken = null;
                    
                    // Dispatch event for sign-in error
                    window.dispatchEvent(new CustomEvent('google-signin-error', { 
                        detail: { error } 
                    }));
                }
            });
        } catch (error) {
            console.error('Error initializing Google API:', error);
        }
    }
    
    /**
     * Request sign-in with Google
     * @returns {Promise<boolean>} Whether sign-in was successful
     */
    signIn() {
        return new Promise((resolve) => {
            if (this.isSignedIn) {
                resolve(true);
                return;
            }
            
            // Set up event listeners for sign-in result
            const successListener = () => {
                window.removeEventListener('google-signin-success', successListener);
                window.removeEventListener('google-signin-error', errorListener);
                resolve(true);
            };
            
            const errorListener = () => {
                window.removeEventListener('google-signin-success', successListener);
                window.removeEventListener('google-signin-error', errorListener);
                resolve(false);
            };
            
            window.addEventListener('google-signin-success', successListener);
            window.addEventListener('google-signin-error', errorListener);
            
            // Request access token
            this.tokenClient.requestAccessToken();
        });
    }
    
    /**
     * Sign out from Google
     */
    signOut() {
        google.accounts.oauth2.revoke(this.accessToken, () => {
            this.isSignedIn = false;
            this.accessToken = null;
            this.fileCache.clear();
            this.folderId = null;
            
            // Dispatch event for sign-out
            window.dispatchEvent(new CustomEvent('google-signout'));
        });
    }
    
    /**
     * Check if user is signed in
     * @returns {boolean} Whether user is signed in
     */
    isUserSignedIn() {
        return this.isSignedIn && this.accessToken !== null;
    }
    
    /**
     * Ensure the save folder exists in Google Drive
     * @returns {Promise<string>} Folder ID
     */
    async ensureSaveFolder() {
        if (this.folderId) {
            return this.folderId;
        }
        
        try {
            // Check if folder already exists
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                this.folderId = data.files[0].id;
                return this.folderId;
            }
            
            // Create folder if it doesn't exist
            const createResponse = await fetch(
                'https://www.googleapis.com/drive/v3/files',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.FOLDER_NAME,
                        mimeType: 'application/vnd.google-apps.folder'
                    })
                }
            );
            
            const folder = await createResponse.json();
            this.folderId = folder.id;
            return this.folderId;
        } catch (error) {
            console.error('Error ensuring save folder:', error);
            return null;
        }
    }
    
    /**
     * Get file ID for the given key
     * @param {string} key - Storage key
     * @returns {Promise<string|null>} File ID or null if not found
     */
    async getFileId(key) {
        // Check cache first
        if (this.fileCache.has(key)) {
            return this.fileCache.get(key);
        }
        
        try {
            const folderId = await this.ensureSaveFolder();
            if (!folderId) {
                return null;
            }
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${key}' and '${folderId}' in parents and trashed=false`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                const fileId = data.files[0].id;
                this.fileCache.set(key, fileId);
                return fileId;
            }
            
            return null;
        } catch (error) {
            console.error(`Error getting file ID for key ${key}:`, error);
            return null;
        }
    }
    
    /**
     * Save data with the given key
     * @param {string} key - Storage key
     * @param {*} data - Data to store (will be serialized)
     * @returns {Promise<boolean>} Success status
     */
    async saveData(key, data) {
        if (!this.isSignedIn) {
            console.warn('Not signed in to Google Drive, falling back to localStorage');
            try {
                const serializedData = JSON.stringify(data);
                localStorage.setItem(key, serializedData);
                return true;
            } catch (error) {
                console.error(`Error saving data for key ${key} to localStorage:`, error);
                return false;
            }
        }
        
        try {
            const serializedData = JSON.stringify(data);
            const folderId = await this.ensureSaveFolder();
            
            if (!folderId) {
                throw new Error('Could not create or find save folder');
            }
            
            const fileId = await this.getFileId(key);
            const method = fileId ? 'PATCH' : 'POST';
            const url = fileId 
                ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media` 
                : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
            
            const headers = {
                'Authorization': `Bearer ${this.accessToken}`
            };
            
            let body;
            
            if (fileId) {
                // Update existing file
                headers['Content-Type'] = 'application/json';
                body = serializedData;
            } else {
                // Create new file
                const boundary = '-------314159265358979323846';
                headers['Content-Type'] = `multipart/related; boundary=${boundary}`;
                
                body = 
                    `--${boundary}\r\n` +
                    'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify({
                        name: key,
                        parents: [folderId]
                    }) +
                    `\r\n--${boundary}\r\n` +
                    'Content-Type: application/json\r\n\r\n' +
                    serializedData +
                    `\r\n--${boundary}--`;
            }
            
            const response = await fetch(url, {
                method,
                headers,
                body
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const responseData = await response.json();
            
            // Update cache with new file ID
            if (!fileId) {
                this.fileCache.set(key, responseData.id);
            }
            
            return true;
        } catch (error) {
            console.error(`Error saving data for key ${key} to Google Drive:`, error);
            
            // Fallback to localStorage
            try {
                const serializedData = JSON.stringify(data);
                localStorage.setItem(key, serializedData);
                return true;
            } catch (localError) {
                console.error(`Error saving data for key ${key} to localStorage:`, localError);
                return false;
            }
        }
    }
    
    /**
     * Load data for the given key
     * @param {string} key - Storage key
     * @returns {Promise<*>} The loaded data (or null if not found)
     */
    async loadData(key) {
        // If not signed in, fall back to localStorage
        if (!this.isSignedIn) {
            try {
                const serializedData = localStorage.getItem(key);
                if (!serializedData) {
                    return null;
                }
                return JSON.parse(serializedData);
            } catch (error) {
                console.error(`Error loading data for key ${key} from localStorage:`, error);
                return null;
            }
        }
        
        try {
            const fileId = await this.getFileId(key);
            
            if (!fileId) {
                // Try localStorage as fallback
                const localData = localStorage.getItem(key);
                if (localData) {
                    try {
                        return JSON.parse(localData);
                    } catch (parseError) {
                        console.error(`Error parsing local data for key ${key}:`, parseError);
                        return null;
                    }
                }
                return null;
            }
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error loading data for key ${key} from Google Drive:`, error);
            
            // Fallback to localStorage
            try {
                const serializedData = localStorage.getItem(key);
                if (!serializedData) {
                    return null;
                }
                return JSON.parse(serializedData);
            } catch (localError) {
                console.error(`Error loading data for key ${key} from localStorage:`, localError);
                return null;
            }
        }
    }
    
    /**
     * Delete data for the given key
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} Success status
     */
    async deleteData(key) {
        // Always delete from localStorage for consistency
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error deleting data for key ${key} from localStorage:`, error);
        }
        
        // If not signed in, we're done
        if (!this.isSignedIn) {
            return true;
        }
        
        try {
            const fileId = await this.getFileId(key);
            
            if (!fileId) {
                return true; // Nothing to delete
            }
            
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            
            // Remove from cache
            this.fileCache.delete(key);
            
            return true;
        } catch (error) {
            console.error(`Error deleting data for key ${key} from Google Drive:`, error);
            return false;
        }
    }
    
    /**
     * Check if data exists for the given key
     * @param {string} key - Storage key
     * @returns {Promise<boolean>} Whether data exists
     */
    async hasData(key) {
        // Check localStorage first
        const hasLocalData = localStorage.getItem(key) !== null;
        
        // If not signed in or has local data, return result
        if (!this.isSignedIn || hasLocalData) {
            return hasLocalData;
        }
        
        // Check Google Drive
        try {
            const fileId = await this.getFileId(key);
            return fileId !== null;
        } catch (error) {
            console.error(`Error checking if data exists for key ${key}:`, error);
            return false;
        }
    }
}