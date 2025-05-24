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
            const version = await this.settingsMenu.fetchCacheVersion();
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
}