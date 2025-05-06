(function() {
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

    // Show update notification
    function showUpdateNotification() {
        document.getElementById('update-notification').style.display = 'block';
    }

    // Hide update notification
    function hideUpdateNotification() {
        document.getElementById('update-notification').style.display = 'none';
    }

    // Update loading progress
    function updateLoadingProgress(percent, status, fileInfo) {
        document.getElementById('loading-progress').style.width = percent + '%';
        
        if (status) {
            document.getElementById('update-status').textContent = status;
        }
        
        // Update file info if provided
        if (fileInfo) {
            const fileInfoElement = document.getElementById('file-info');
            if (fileInfoElement) {
                fileInfoElement.textContent = fileInfo;
                fileInfoElement.style.display = 'block';
            }
        } else {
            const fileInfoElement = document.getElementById('file-info');
            if (fileInfoElement) {
                fileInfoElement.style.display = 'none';
            }
        }
    }

    // Create a message channel for communication with the service worker
    function createMessageChannel(registration) {
        const messageChannel = new MessageChannel();
        
        // Set up message event handler
        messageChannel.port1.onmessage = (event) => {
            const data = event.data;
            
            if (data.type === 'CACHE_PROGRESS') {
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
        };
        
        // Send the port to the service worker
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
        }
        
        return messageChannel;
    }

    window.addEventListener('load', () => {
        let refreshing = false;

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                window.location.reload();
            }
        });

        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                
                // Create message channel for communication
                const messageChannel = createMessageChannel(registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    // Show update notification
                    showUpdateNotification();

                    // Create a new message channel for the new worker
                    createMessageChannel(registration);

                    newWorker.addEventListener('statechange', () => {
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
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
                // Show error in the UI
                updateLoadingProgress(0, 'Service Worker registration failed', error.message);
                showUpdateNotification();
                setTimeout(hideUpdateNotification, 5000);
            });
    });
})();