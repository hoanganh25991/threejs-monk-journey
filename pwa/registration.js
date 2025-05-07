(function() {
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
    
    // Check if running on localhost
    if (window.location.hostname === 'localhost') {
        console.warn('Running on localhost. Service worker is disabled for development purposes.');
        return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported.');
        return;
    }

    // Safely get DOM element with fallback
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found in the DOM.`);
        }
        return element;
    }

    // Show update notification
    function showUpdateNotification() {
        const notification = getElement('update-notification');
        if (notification) {
            notification.style.display = 'block';
        }
    }

    // Hide update notification
    function hideUpdateNotification() {
        const notification = getElement('update-notification');
        if (notification) {
            notification.style.display = 'none';
        }
    }

    // Update loading progress
    function updateLoadingProgress(percent, status, fileInfo) {
        const progressBar = getElement('loading-progress');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        
        if (status) {
            const statusElement = getElement('update-status');
            if (statusElement) {
                statusElement.textContent = status;
            }
        }
        
        // Update file info if provided
        const fileInfoElement = getElement('file-info');
        if (!fileInfoElement) return;
        
        if (fileInfo) {
            fileInfoElement.textContent = fileInfo;
            fileInfoElement.style.display = 'block';
        } else {
            fileInfoElement.style.display = 'none';
        }
    }

    // Create a message channel for communication with the service worker
    function createMessageChannel(registration) {
        if (!registration) {
            console.warn('Cannot create message channel: registration is undefined');
            return null;
        }
        
        try {
            const messageChannel = new MessageChannel();
            
            // Set up message event handler
            messageChannel.port1.onmessage = (event) => {
                try {
                    const data = event.data;
                    
                    if (data && data.type === 'CACHE_PROGRESS') {
                        const { completed, total, currentFile } = data;
                        const percent = Math.round((completed / total) * 100);
                        const fileInfo = currentFile ? `Caching: ${currentFile}` : '';
                        
                        updateLoadingProgress(
                            percent, 
                            `Downloading files (${completed}/${total})`, 
                            fileInfo
                        );
                        
                        // Log progress to console
                        console.log(`Cache progress: ${percent}% (${completed}/${total}) - ${currentFile || 'N/A'}`);
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

    window.addEventListener('load', () => {
        try {
            let refreshing = false;

            // Handle service worker updates
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    console.log('Service worker controller changed, reloading page');
                    window.location.reload();
                }
            });

            // Determine the correct path to service-worker.js
            // If opened directly, we need to adjust the path
            let swPath = 'service-worker.js';
            
            // If we're in a subdirectory like /pwa/, adjust the path
            if (window.location.pathname.includes('/pwa/')) {
                swPath = '../service-worker.js';
            }

            console.log(`Registering service worker from: ${swPath}`);
            
            navigator.serviceWorker.register(swPath)
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                    
                    // Create message channel for communication
                    const messageChannel = createMessageChannel(registration);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        try {
                            const newWorker = registration.installing;
                            if (!newWorker) {
                                console.warn('Update found but no installing worker available');
                                return;
                            }

                            // Show update notification
                            showUpdateNotification();

                            // Create a new message channel for the new worker
                            createMessageChannel(registration);

                            newWorker.addEventListener('statechange', () => {
                                try {
                                    console.log(`Service worker state changed to: ${newWorker.state}`);
                                    
                                    // Update based on the new service worker's state
                                    switch (newWorker.state) {
                                        case 'installing':
                                            updateLoadingProgress(5, 'Installing update...', 'Preparing to download files');
                                            break;
                                        case 'installed':
                                            updateLoadingProgress(90, 'Update installed, reloading...', null);
                                            // If there's a controller, it means the page is being controlled by an old SW
                                            if (navigator.serviceWorker.controller) {
                                                // New content is available, reload to activate the new service worker
                                                setTimeout(() => {
                                                    updateLoadingProgress(100, 'Reloading...', null);
                                                    window.location.reload();
                                                }, 1000);
                                            } else {
                                                // First time install, no need to reload
                                                updateLoadingProgress(100, 'Ready!', null);
                                                setTimeout(hideUpdateNotification, 1000);
                                            }
                                            break;
                                        case 'activating':
                                            updateLoadingProgress(95, 'Activating...', null);
                                            break;
                                        case 'activated':
                                            updateLoadingProgress(100, 'Complete!', null);
                                            setTimeout(hideUpdateNotification, 1000);
                                            break;
                                        case 'redundant':
                                            updateLoadingProgress(0, 'Update failed!', 'Please refresh the page to try again');
                                            setTimeout(hideUpdateNotification, 3000);
                                            break;
                                    }
                                } catch (error) {
                                    console.error('Error handling service worker state change:', error);
                                }
                            });
                        } catch (error) {
                            console.error('Error handling update found event:', error);
                        }
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                    // Show error in the UI
                    updateLoadingProgress(0, 'Service Worker registration failed', error.message);
                    showUpdateNotification();
                    setTimeout(hideUpdateNotification, 5000);
                });
        } catch (error) {
            console.error('Error setting up service worker:', error);
        }
    });
})();