import { IStorageAdapter } from './IStorageAdapter.js';

/**
 * Implementation of storage adapter using browser's localStorage
 */
export class LocalStorageAdapter extends IStorageAdapter {
    /**
     * Save data with the given key
     * @param {string} key - Storage key
     * @param {*} data - Data to store (will be serialized)
     * @returns {boolean} Success status
     */
    saveData(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error(`Error saving data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Load data for the given key
     * @param {string} key - Storage key
     * @returns {*} The loaded data (or null if not found)
     */
    loadData(key) {
        try {
            const serializedData = localStorage.getItem(key);
            if (!serializedData) {
                return null;
            }
            
            // Handle keys that might contain simple string values
            if (key.startsWith('monk_journey_selected_skill_variant_') || 
                key === 'monk_journey_selected_size' ||
                key === 'monk_journey_selected_model' ||
                key === 'monk_journey_difficulty' ||
                key === 'monk_journey_quality_level') {
                return serializedData; // Return the raw string value
            }
            
            // For all other keys, parse as JSON
            const parsedData = JSON.parse(serializedData);
            
            // Process the parsed data to convert string booleans to actual booleans
            return this.processLoadedData(parsedData);
        } catch (error) {
            console.error(`Error loading data for key ${key}:`, error);
            
            // If JSON parsing fails, return the raw string value
            // This handles cases where non-JSON values were stored
            const rawData = localStorage.getItem(key);
            if (rawData) {
                console.debug(`Returning raw string value for key ${key}`);
                return rawData;
            }
            
            return null;
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
    
    /**
     * Delete data for the given key
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    deleteData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error deleting data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Check if data exists for the given key
     * @param {string} key - Storage key
     * @returns {boolean} Whether data exists
     */
    hasData(key) {
        return localStorage.getItem(key) !== null;
    }
}