/**
 * debug-utils.js
 * Utility functions for debug mode
 */

import { STORAGE_KEYS } from '../config/storage-keys.js';

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled, false otherwise
 */
export function isDebugMode() {
    return localStorage.getItem(STORAGE_KEYS.DEBUG_MODE) === 'true';
}

/**
 * Log a message to the console if debug mode is enabled
 * @param {string} message - The message to log
 * @param {string} level - The log level ('log', 'debug', 'info', 'warn', 'error')
 */
export function debugLog(message, level = 'debug') {
    if (isDebugMode()) {
        switch (level) {
            case 'log':
                console.debug('[DEBUG]', message);
                break;
            case 'info':
                console.info('[DEBUG]', message);
                break;
            case 'warn':
                console.warn('[DEBUG]', message);
                break;
            case 'error':
                console.error('[DEBUG]', message);
                break;
            case 'debug':
            default:
                console.debug('[DEBUG]', message);
                break;
        }
    }
}