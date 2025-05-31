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
        this.FOLDER_NAME = 'MonkJourneySaves'; // Use a consistent folder name
        this.folderId = null; // Will store the folder ID once found or created
        
        // Flag to prevent concurrent folder creation
        this.isFolderCheckInProgress = false;
        this.folderCheckPromise = null;
        
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
                callback: async (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        this.accessToken = tokenResponse.access_token;
                        this.isSignedIn = true;
                        
                        // Ensure save folder exists - await to prevent race conditions
                        try {
                            await this.ensureSaveFolder();
                        } catch (folderError) {
                            console.error('Error ensuring save folder during sign-in:', folderError);
                        }
                        
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
            this.isFolderCheckInProgress = false;
            this.folderCheckPromise = null;
            
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
        // If we already have the folder ID, return it immediately
        if (this.folderId) {
            return this.folderId;
        }
        
        // If a folder check is already in progress, wait for it to complete
        if (this.isFolderCheckInProgress) {
            console.debug('Folder check already in progress, waiting for it to complete');
            return this.folderCheckPromise;
        }
        
        // Set the flag to prevent concurrent calls
        this.isFolderCheckInProgress = true;
        
        // Create a promise that will be resolved when the folder check is complete
        this.folderCheckPromise = (async () => {
            try {
                // Double-check if folder ID was set while we were waiting
                if (this.folderId) {
                    return this.folderId;
                }
                
                // Check if folder already exists
                console.debug('Checking for existing MonkJourneySaves folder');
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
                    // Use the first folder found
                    this.folderId = data.files[0].id;
                    console.debug(`Found existing folder with ID: ${this.folderId}`);
                    
                    // If multiple folders with the same name exist, delete the extras
                    if (data.files.length > 1) {
                        console.warn(`Found ${data.files.length} '${this.FOLDER_NAME}' folders, keeping only the first one and deleting others`);
                        
                        // Delete extra folders (starting from the second one)
                        for (let i = 1; i < data.files.length; i++) {
                            try {
                                await fetch(
                                    `https://www.googleapis.com/drive/v3/files/${data.files[i].id}`,
                                    {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${this.accessToken}`
                                        }
                                    }
                                );
                                console.debug(`Deleted duplicate folder with ID: ${data.files[i].id}`);
                            } catch (deleteError) {
                                console.error(`Error deleting duplicate folder: ${deleteError}`);
                            }
                        }
                    }
                    
                    return this.folderId;
                }
                
                // Double-check again before creating a new folder
                // This helps prevent race conditions where multiple calls might create folders simultaneously
                const doubleCheckResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q=name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`
                        }
                    }
                );
                
                const doubleCheckData = await doubleCheckResponse.json();
                
                if (doubleCheckData.files && doubleCheckData.files.length > 0) {
                    // A folder was created between our first and second check
                    this.folderId = doubleCheckData.files[0].id;
                    console.debug(`Found folder created by another process with ID: ${this.folderId}`);
                    
                    // Clean up any duplicates
                    if (doubleCheckData.files.length > 1) {
                        console.warn(`Found ${doubleCheckData.files.length} '${this.FOLDER_NAME}' folders in double-check, cleaning up`);
                        for (let i = 1; i < doubleCheckData.files.length; i++) {
                            try {
                                await fetch(
                                    `https://www.googleapis.com/drive/v3/files/${doubleCheckData.files[i].id}`,
                                    {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${this.accessToken}`
                                        }
                                    }
                                );
                            } catch (deleteError) {
                                console.error(`Error deleting duplicate folder: ${deleteError}`);
                            }
                        }
                    }
                    
                    return this.folderId;
                }
                
                // Create folder if it doesn't exist
                console.debug(`Creating new '${this.FOLDER_NAME}' folder in Google Drive`);
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
                console.debug(`Created new folder with ID: ${this.folderId}`);
                return this.folderId;
            } catch (error) {
                console.error('Error ensuring save folder:', error);
                return null;
            } finally {
                // Reset the flag when done
                this.isFolderCheckInProgress = false;
            }
        })();
        
        return this.folderCheckPromise;
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
            
            // Get all files with this name, including their creation time
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${key}' and '${folderId}' in parents and trashed=false&fields=files(id,name,createdTime,modifiedTime)`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            
            const data = await response.json();
            
            if (data.files && data.files.length > 0) {
                // If multiple files with the same name exist, handle them
                if (data.files.length > 1) {
                    console.debug(`Found ${data.files.length} files with name '${key}', cleaning up duplicates`);
                    
                    // Sort files by modified time (newest first)
                    data.files.sort((a, b) => {
                        return new Date(b.modifiedTime) - new Date(a.modifiedTime);
                    });
                    
                    // Keep the most recently modified file
                    const mostRecentFile = data.files[0];
                    this.fileCache.set(key, mostRecentFile.id);
                    
                    // Delete all other files with the same name
                    for (let i = 1; i < data.files.length; i++) {
                        try {
                            await fetch(
                                `https://www.googleapis.com/drive/v3/files/${data.files[i].id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${this.accessToken}`
                                    }
                                }
                            );
                            console.debug(`Deleted duplicate file '${key}' with ID: ${data.files[i].id}`);
                        } catch (deleteError) {
                            console.error(`Error deleting duplicate file '${key}': ${deleteError}`);
                        }
                    }
                    
                    return mostRecentFile.id;
                } else {
                    // Just one file found, use it
                    const fileId = data.files[0].id;
                    this.fileCache.set(key, fileId);
                    return fileId;
                }
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
                // Handle string values that are already serialized
                // Special handling for boolean strings to convert them to actual booleans
                let processedData = data;
                if (typeof data === 'string') {
                    if (data === 'true') {
                        processedData = true;
                    } else if (data === 'false') {
                        processedData = false;
                    } else {
                        processedData = data;
                    }
                }
                
                // Always use JSON.stringify for consistent serialization
                const serializedData = JSON.stringify(processedData);
                localStorage.setItem(key, serializedData);
                return true;
            } catch (error) {
                console.error(`Error saving data for key ${key} to localStorage:`, error);
                return false;
            }
        }
        
        try {
            // Handle string values that are already serialized
            // Special handling for boolean strings to convert them to actual booleans
            let processedData = data;
            if (typeof data === 'string') {
                if (data === 'true') {
                    processedData = true;
                } else if (data === 'false') {
                    processedData = false;
                } else {
                    // For non-boolean strings, keep them as strings
                    processedData = data;
                }
            }
            
            // Serialize the data - use JSON.stringify for all types to ensure proper serialization
            const serializedData = JSON.stringify(processedData);
            const folderId = await this.ensureSaveFolder();
            
            if (!folderId) {
                throw new Error('Could not create or find save folder');
            }
            
            // This will also clean up any duplicate files with the same name
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
                // Before creating a new file, double-check for any files with the same name
                // that might have been created since our last check
                const checkResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q=name='${key}' and '${folderId}' in parents and trashed=false&fields=files(id)`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`
                        }
                    }
                );
                
                const checkData = await checkResponse.json();
                
                if (checkData.files && checkData.files.length > 0) {
                    // Files with this name exist, use the first one and update it instead
                    const existingFileId = checkData.files[0].id;
                    this.fileCache.set(key, existingFileId);
                    
                    // Delete any other duplicates
                    if (checkData.files.length > 1) {
                        for (let i = 1; i < checkData.files.length; i++) {
                            try {
                                await fetch(
                                    `https://www.googleapis.com/drive/v3/files/${checkData.files[i].id}`,
                                    {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${this.accessToken}`
                                        }
                                    }
                                );
                                console.debug(`Deleted duplicate file '${key}' with ID: ${checkData.files[i].id}`);
                            } catch (deleteError) {
                                console.error(`Error deleting duplicate file '${key}': ${deleteError}`);
                            }
                        }
                    }
                    
                    // Update the existing file instead of creating a new one
                    return await this.saveData(key, data);
                }
                
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
                // Handle string values that are already serialized
                // Special handling for boolean strings to convert them to actual booleans
                let processedData = data;
                if (typeof data === 'string') {
                    if (data === 'true') {
                        processedData = true;
                    } else if (data === 'false') {
                        processedData = false;
                    } else {
                        processedData = data;
                    }
                }
                
                // Always use JSON.stringify for consistent serialization
                const serializedData = JSON.stringify(processedData);
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
                
                // Try to parse as JSON, but handle the case where it might be a plain string
                let parsedData;
                try {
                    parsedData = JSON.parse(serializedData);
                } catch (parseError) {
                    // If parsing fails, use the raw string value
                    parsedData = serializedData;
                }
                
                return this.processLoadedData(parsedData);
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
                        const parsedData = JSON.parse(localData);
                        return this.processLoadedData(parsedData);
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
            
            // Get the response text first
            const responseText = await response.text();
            
            // Try to parse the response as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.warn(`Error parsing response as JSON for key ${key}:`, parseError);
                // If parsing fails, use the raw text
                data = responseText;
            }
            
            return this.processLoadedData(data);
        } catch (error) {
            console.error(`Error loading data for key ${key} from Google Drive:`, error);
            
            // Fallback to localStorage
            try {
                const serializedData = localStorage.getItem(key);
                if (!serializedData) {
                    return null;
                }
                
                // Try to parse as JSON, but handle the case where it might be a plain string
                let parsedData;
                try {
                    parsedData = JSON.parse(serializedData);
                } catch (parseError) {
                    // If parsing fails, use the raw string value
                    parsedData = serializedData;
                }
                
                return this.processLoadedData(parsedData);
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
    
    /**
     * Process loaded data to convert string booleans to actual booleans
     * @param {*} data - The data to process
     * @returns {*} The processed data
     */
    processLoadedData(data) {
        if (data === null || data === undefined) {
            return data;
        }
        
        // Handle string boolean values
        if (data === "true") return true;
        if (data === "false") return false;
        
        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => this.processLoadedData(item));
        }
        
        // Handle objects
        if (typeof data === 'object') {
            const result = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    result[key] = this.processLoadedData(data[key]);
                }
            }
            return result;
        }
        
        // Return other types as is
        return data;
    }
}