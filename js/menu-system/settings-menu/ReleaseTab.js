/**
 * ReleaseTab.js
 * Manages the release settings tab UI component
 */

import { SettingsTab } from './SettingsTab.js';

export class ReleaseTab extends SettingsTab {
    /**
     * Create a release settings tab
     * @param {import('../../game/Game.js').Game} game - The game instance
     * @param {SettingsMenu} settingsMenu - The parent settings menu
     */
    constructor(game, settingsMenu) {
        super('release', game, settingsMenu);
        
        // Release settings elements
        this.updateToLatestButton = document.getElementById('update-to-latest-button');
        this.currentVersionSpan = document.getElementById('current-version');
        
        this.init();
    }
    
    /**
     * Initialize the release settings
     * @returns {boolean} - True if initialization was successful
     */
    init() {
        this.initializeReleaseSettings();
        return true;
    }
    
    /**
     * Initialize release settings
     * @private
     */
    async initializeReleaseSettings() {
        // Display current version
        if (this.currentVersionSpan) {
            const version = await this.fetchCacheVersion();
            this.currentVersionSpan.textContent = version;
        }
        
        // Set up update button
        if (this.updateToLatestButton) {
            this.updateToLatestButton.addEventListener('click', async () => {
                // Show loading state
                this.updateToLatestButton.textContent = 'Updating...';
                this.updateToLatestButton.disabled = true;
                
                try {
                    // Unregister service worker
                    if ('serviceWorker' in navigator) {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (const registration of registrations) {
                            await registration.unregister();
                        }
                    }
                    
                    // Clear caches
                    if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(
                            cacheNames.map(cacheName => caches.delete(cacheName))
                        );
                    }
                    
                    // Reload the page
                    window.location.reload(true);
                } catch (error) {
                    console.error('Error updating to latest version:', error);
                    
                    // Reset button state
                    this.updateToLatestButton.textContent = 'Update to Latest';
                    this.updateToLatestButton.disabled = false;
                    
                    // Show error message
                    alert('Failed to update to the latest version. Please try again later.');
                }
            });
        }
    }

    async fetchCacheVersion() {
        try {
            // Fetch the service worker file
            const response = await fetch('service-worker.js');
            if (!response.ok) {
                throw new Error(`Failed to fetch service worker: ${response.status}`);
            }
            
            // Get the text content
            const text = await response.text();
            
            // Extract the cache version using regex
            const versionMatch = text.match(/const CACHE_VERSION = ['"](\d+)['"]/);
            if (versionMatch && versionMatch[1]) {
                return versionMatch[1];
            } else {
                throw new Error('Could not find CACHE_VERSION in service-worker.js');
            }
        } catch (error) {
            console.error('Error fetching cache version:', error);
            return 'Unknown';
        }
    }
}