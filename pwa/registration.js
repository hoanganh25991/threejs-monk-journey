/**
 * ServiceWorkerRegistration - Handles the registration and lifecycle of the service worker
 * This class is self-invoking and is designed to be included directly in HTML
 */
(function() {
    class ServiceWorkerRegistration {
        constructor() {
            // Check if this file is being opened directly
            if (document.title === 'registration.js') {
                console.debug('This is a service worker registration script. It should be included in an HTML page, not opened directly.');
                document.body.innerHTML = '<h1>Service Worker Registration Script</h1><p>This JavaScript file is meant to be included in an HTML page, not opened directly.</p>';
                return;
            }
            
            // Check if running on file:// protocol
            if (window.location.protocol === 'file:') {
                console.warn('Running from file:// protocol. Service workers are not supported when running locally from file://. Please use a web server.');
                return;
            }

            // Check if debug mode is enabled
            // Using direct localStorage check instead of importing the utility
            if (localStorage.getItem('monk_journey_debug_mode') === 'true') {
                console.warn('Debug mode is enabled. Service workers are disabled in debug mode.');
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
         * Show update notification as a toast message
         * @param {boolean} forceUpdate - Whether this is a forced update
         */
        showUpdateNotification(forceUpdate = false) {
            const notification = this.getElement('update-notification');
            if (!notification) return;
            
            // Configure as toast notification
            notification.style.display = 'block';
            
            // Style as toast if not already styled
            if (!notification.classList.contains('toast-style')) {
                notification.classList.add('toast-style');
                notification.style.position = 'fixed';
                notification.style.bottom = '20px';
                notification.style.right = '20px';
                notification.style.padding = '10px 20px';
                notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                notification.style.color = 'white';
                notification.style.borderRadius = '4px';
                notification.style.zIndex = '9999';
                notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
                notification.style.transition = 'opacity 0.5s ease-in-out';
            }
            
            // Auto-hide toast after 5 seconds
            setTimeout(() => {
                if (notification.style.display === 'block') {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        notification.style.opacity = '1';
                    }, 500);
                }
            }, 5000);
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
                            
                            console.debug(
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
                            console.debug(`Cache progress: ${percent}% (${completed}/${total}) - ${loadedMB}MB/${totalMB}MB - ${currentFile || 'N/A'}`);
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
                console.debug(`Service worker state changed to: ${worker.state}`);
                
                // Get size text if available
                const sizeText = window.TOTAL_CACHE_SIZE_MB ? ` (${window.TOTAL_CACHE_SIZE_MB} MB)` : '';
                
                // Update based on the new service worker's state
                switch (worker.state) {
                    case 'installing':
                        this.updateLoadingProgress(5, 'Installing update...', 'Preparing to download files');
                        break;

                    case 'installed':
                        // The service worker is installed but waiting for activation
                        this.updateLoadingProgress(90, `Update ready${sizeText}`, null);
                        break;
                        
                    case 'activating':
                        this.updateLoadingProgress(95, 'Activating update...', null);
                        break;
                        
                    case 'activated':
                        this.updateLoadingProgress(100, `Update complete!${sizeText}`, null);
                        break;
                        
                    case 'redundant':
                        this.updateLoadingProgress(0, 'Update failed!', 'Please refresh the page to try again');
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
                        console.debug('Service worker controller changed - no reload needed');
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

                console.debug(`Registering service worker from: ${swPath}`);
                
                navigator.serviceWorker.register(swPath)
                    .then(registration => {
                        console.debug('Service Worker registered with scope:', registration.scope);
                        
                        // Check for updates
                        // Store a reference to this for use in the callback
                        const instance = this;
                        
                        registration.addEventListener('updatefound', () => {
                            try {
                                const newWorker = registration.installing;
                                if (!newWorker) {
                                    console.warn('Update found but no installing worker available');
                                    return;
                                }

                                // Create a new message channel for the new worker
                                const messageChannel = instance.createMessageChannel(registration);
                                
                                // Set up message handler for force update notifications
                                if (messageChannel) {
                                    messageChannel.port1.addEventListener('message', (event) => {
                                        if (event.data && event.data.type === 'FORCE_UPDATE') {
                                            console.debug('Force update requested by service worker');
                                            // Show update notification with auto-update message
                                            instance.showUpdateNotification(true);
                                        }
                                    });
                                    messageChannel.port1.start();
                                }

                                // Show toast notification about the update
                                instance.showUpdateNotification();
                                
                                // Listen for state changes
                                newWorker.addEventListener('statechange', () => {
                                    instance.handleStateChange(newWorker);
                                });
                            } catch (error) {
                                console.error('Error handling update found event:', error);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                        // Show error in the UI
                        instance.updateLoadingProgress(0, 'Service Worker registration failed', error.message);
                        instance.showUpdateNotification();
                        setTimeout(() => instance.hideUpdateNotification(), 5000);
                    });
            } catch (error) {
                console.error('Error setting up service worker:', error);
            }
        }
    }

    // Self-invoke the class to maintain the same usage pattern
    new ServiceWorkerRegistration();
})();