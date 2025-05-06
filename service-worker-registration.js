if (window.location.hostname === 'localhost') {
    console.warn('Running on localhost. Service worker is disabled for development purposes.');
    return;
}

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
function updateLoadingProgress(percent, status) {
    document.getElementById('loading-progress').style.width = percent + '%';
    if (status) {
        document.getElementById('update-status').textContent = status;
    }
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

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;

                // Show update notification
                showUpdateNotification();

                newWorker.addEventListener('statechange', () => {
                    // Update based on the new service worker's state
                    switch (newWorker.state) {
                        case 'installing':
                            updateLoadingProgress(25, 'Installing update...');
                            break;
                        case 'installed':
                            updateLoadingProgress(75, 'Update installed, reloading...');
                            // If there's a controller, it means the page is being controlled by an old SW
                            if (navigator.serviceWorker.controller) {
                                // New content is available, reload to activate the new service worker
                                setTimeout(() => {
                                    updateLoadingProgress(100, 'Reloading...');
                                    window.location.reload();
                                }, 1000);
                            } else {
                                // First time install, no need to reload
                                updateLoadingProgress(100, 'Ready!');
                                setTimeout(hideUpdateNotification, 1000);
                            }
                            break;
                        case 'activating':
                            updateLoadingProgress(85, 'Activating...');
                            break;
                        case 'activated':
                            updateLoadingProgress(100, 'Complete!');
                            setTimeout(hideUpdateNotification, 1000);
                            break;
                        case 'redundant':
                            updateLoadingProgress(0, 'Update failed!');
                            setTimeout(hideUpdateNotification, 3000);
                            break;
                    }
                });
            });
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
});