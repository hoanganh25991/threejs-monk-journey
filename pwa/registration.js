/**
 * ServiceWorkerRegistration - Handles the registration and lifecycle of the service worker
 * This class is self-invoking and is designed to be included directly in HTML
 */
(function() {
    class ServiceWorkerRegistration {
        constructor() {
            // Check if this file is being opened directly
            if (document.title === 'registration.js') {
                console.log('This is a service worker registration script. It should be included in an HTML page, not opened directly.');
                document.body.innerHTML = '<h1>Service Worker Registration Script</h1><p>This JavaScript file is meant to be included in an HTML page, not opened directly.</p>';
                return;
            }
            
            // Check if running on file:// protocol
            if (window.location.protocol === 'file:') {
                console.warn('Running from file:// protocol. Service workers are not supported when running locally from file://. Please use a web server.');
                return;
            }

            // Check if service workers are supported
            if (!('serviceWorker' in navigator)) {
                console.warn('Service workers are not supported.');
                return;
            }

            // Initialize when the page loads
            window.addEventListener('load', () => this.initialize());
        }

        /**
         * Safely get DOM element with fallback
         * @param {string} id - Element ID
         * @returns {HTMLElement|null} - The DOM element or null if not found
         */
        getElement(id) {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id '${id}' not found in the DOM.`);
            }
            return element;
        }

        /**
         * Show update notification
         */
        showUpdateNotification() {
            const notification = this.getElement('update-notification');
            if (notification) {
                notification.style.display = 'block';
            }
        }

        /**
         * Hide update notification
         */
        hideUpdateNotification() {
            const notification = this.getElement('update-notification');
            if (notification) {
                notification.style.display = 'none';
            }
        }

        /**
         * Format file size in human-readable format
         * @param {number} bytes - Size in bytes
         * @returns {string} - Formatted size string
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        /**
         * Update loading progress in the UI
         * @param {number} percent - Progress percentage
         * @param {string} status - Status message
         * @param {string} fileInfo - Current file information
         * @param {number} loadedBytes - Bytes loaded
         * @param {number} totalBytes - Total bytes
         * @param {number} totalSizeMB - Total size in MB
         */
        updateLoadingProgress(percent, status, fileInfo, loadedBytes, totalBytes, totalSizeMB) {
            const progressBar = this.getElement('loading-progress');
            if (progressBar) {
                progressBar.style.width = percent + '%';
            }
            
            // Update status text with size information if available
            if (status) {
                const statusElement = this.getElement('update-status');
                if (statusElement) {
                    let statusText = status;
                    
                    // Add size information if available
                    if (loadedBytes !== undefined && totalBytes !== undefined) {
                        const loadedFormatted = this.formatFileSize(loadedBytes);
                        const totalFormatted = totalSizeMB ? `${totalSizeMB} MB` : this.formatFileSize(totalBytes);
                        statusText += ` (${loadedFormatted} / ${totalFormatted})`;
                    }
                    
                    statusElement.textContent = statusText;
                }
            }
            
            // Update file info if provided
            const fileInfoElement = this.getElement('file-info');
            if (!fileInfoElement) return;
            
            if (fileInfo) {
                // If we have the file size, add it to the info
                if (loadedBytes !== undefined && fileInfo.startsWith('Caching:')) {
                    const filePath = fileInfo.substring(9).trim();
                    const fileSize = window.FILE_SIZES && window.FILE_SIZES[filePath];
                    
                    if (fileSize) {
                        fileInfo += ` (${this.formatFileSize(fileSize)})`;
                    }
                }
                
                fileInfoElement.textContent = fileInfo;
                fileInfoElement.style.display = 'block';
            } else {
                fileInfoElement.style.display = 'none';
            }
        }

        /**
         * Create a message channel for communication with the service worker
         * @param {ServiceWorkerRegistration} registration - The service worker registration
         * @returns {MessageChannel|null} - The message channel or null if creation failed
         */
        createMessageChannel(registration) {
            if (!registration) {
                console.warn('Cannot create message channel: registration is undefined');
                return null;
            }
            
            try {
                const messageChannel = new MessageChannel();
                
                // Store a reference to this for use in the callback
                // This is necessary because 'this' context changes in the event handler
                const instance = this;
                
                // Set up message event handler
                messageChannel.port1.onmessage = (event) => {
                    try {
                        const data = event.data;
                        
                        if (data && data.type === 'CACHE_PROGRESS') {
                            const { completed, total, currentFile, loadedBytes, totalBytes, totalSizeMB } = data;
                            const percent = Math.round((completed / total) * 100);
                            const fileInfo = currentFile ? `Caching: ${currentFile}` : '';
                            
                            // Store file sizes and total size in window object for reference
                            if (data.FILE_SIZES && !window.FILE_SIZES) {
                                window.FILE_SIZES = data.FILE_SIZES;
                            }
                            
                            // Store total size for reference in other parts of the code
                            if (data.totalSizeMB && !window.TOTAL_CACHE_SIZE_MB) {
                                window.TOTAL_CACHE_SIZE_MB = data.totalSizeMB;
                            }
                            
                            instance.updateLoadingProgress(
                                percent, 
                                `Downloading files (${completed}/${total})`, 
                                fileInfo,
                                loadedBytes,
                                totalBytes,
                                totalSizeMB
                            );
                            
                            // Log progress to console with size information
                            const loadedMB = loadedBytes ? (loadedBytes / (1024 * 1024)).toFixed(2) : '?';
                            const totalMB = totalSizeMB || (totalBytes ? (totalBytes / (1024 * 1024)).toFixed(2) : '?');
                            console.log(`Cache progress: ${percent}% (${completed}/${total}) - ${loadedMB}MB/${totalMB}MB - ${currentFile || 'N/A'}`);
                        }
                    } catch (error) {
                        console.error('Error processing message from service worker:', error);
                    }
                };
                
                // Send the port to the service worker
                try {
                    if (registration.installing) {
                        registration.installing.postMessage({
                            type: 'INIT_PORT',
                            port: messageChannel.port2
                        }, [messageChannel.port2]);
                    } else if (registration.active) {
                        registration.active.postMessage({
                            type: 'INIT_PORT',
                            port: messageChannel.port2
                        }, [messageChannel.port2]);
                    } else {
                        console.warn('No active or installing service worker found');
                    }
                } catch (error) {
                    console.error('Error sending message port to service worker:', error);
                }
                
                return messageChannel;
            } catch (error) {
                console.error('Error creating message channel:', error);
                return null;
            }
        }

        /**
         * Handle service worker state changes
         * @param {ServiceWorker} worker - The service worker
         */
        handleStateChange(worker) {
            try {
                console.log(`Service worker state changed to: ${worker.state}`);
                
                // Update based on the new service worker's state
                switch (worker.state) {
                    case 'installing':
                        this.updateLoadingProgress(5, 'Installing update...', 'Preparing to download files');
                        break;
                    case 'installed':
                        // Try to get the total size from the service worker
                        let totalSizeText = '';
                        if (window.TOTAL_CACHE_SIZE_MB) {
                            totalSizeText = ` (${window.TOTAL_CACHE_SIZE_MB} MB)`;
                        }
                        
                        this.updateLoadingProgress(90, `Update installed${totalSizeText}`, null);
                        
                        // No need to reload regardless of controller status
                        console.log('Service worker installed - no reload needed');
                        this.updateLoadingProgress(100, `Ready!${totalSizeText}`, null);
                        
                        // Use arrow function to preserve 'this' context
                        setTimeout(() => this.hideUpdateNotification(), 1000);
                        
                        // Note: We don't need to reload the page when the service worker is installed
                        // The service worker will handle caching at the network level and serve
                        // cached resources for subsequent requests automatically
                        break;
                    case 'activating':
                        this.updateLoadingProgress(95, 'Activating...', null);
                        break;
                    case 'activated':
                        // Try to get the total size from the service worker
                        let completedSizeText = '';
                        if (window.TOTAL_CACHE_SIZE_MB) {
                            completedSizeText = ` (${window.TOTAL_CACHE_SIZE_MB} MB)`;
                        }
                        
                        this.updateLoadingProgress(100, `Complete!${completedSizeText}`, null);
                        setTimeout(() => this.hideUpdateNotification(), 1000);
                        break;
                    case 'redundant':
                        this.updateLoadingProgress(0, 'Update failed!', 'Please refresh the page to try again');
                        setTimeout(() => this.hideUpdateNotification(), 3000);
                        break;
                }
            } catch (error) {
                console.error('Error handling service worker state change:', error);
            }
        }

        /**
         * Initialize the service worker registration
         */
        initialize() {
            try {
                let refreshing = false;

                // Handle service worker updates
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        console.log('Service worker controller changed - no reload needed');
                        // Note: We don't need to reload the page when the service worker changes
                        // The service worker handles caching at the network level and will serve
                        // cached resources for subsequent requests automatically
                    }
                });

                // Determine the correct path to service-worker.js
                let swPath = 'service-worker.js';
                
                // If we're in a subdirectory like /pwa/, adjust the path
                if (window.location.pathname.includes('/pwa/')) {
                    swPath = '../service-worker.js';
                }

                console.log(`Registering service worker from: ${swPath}`);
                
                navigator.serviceWorker.register(swPath)
                    .then(registration => {
                        console.log('Service Worker registered with scope:', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            try {
                                const newWorker = registration.installing;
                                if (!newWorker) {
                                    console.warn('Update found but no installing worker available');
                                    return;
                                }

                                // Show update notification
                                self.showUpdateNotification();

                                // Create a new message channel for the new worker
                                self.createMessageChannel(registration);

                                // Listen for state changes
                                newWorker.addEventListener('statechange', () => {
                                    self.handleStateChange(newWorker);
                                });
                            } catch (error) {
                                console.error('Error handling update found event:', error);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                        // Show error in the UI
                        self.updateLoadingProgress(0, 'Service Worker registration failed', error.message);
                        self.showUpdateNotification();
                        setTimeout(() => self.hideUpdateNotification(), 5000);
                    });
            } catch (error) {
                console.error('Error setting up service worker:', error);
            }
        }
    }

    // Self-invoke the class to maintain the same usage pattern
    new ServiceWorkerRegistration();
})();