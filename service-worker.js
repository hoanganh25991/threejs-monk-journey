const CACHE_NAME = 'monk-journey-v1';
const ASSETS_TO_CACHE = [
  '',
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/core/Game.js',
  'js/core/World.js',
  'js/core/InputHandler.js',
  'js/core/AudioManager.js',
  'js/core/CollisionManager.js',
  'js/core/SaveManager.js',
  'js/entities/Player.js',
  'js/entities/Enemy.js',
  'js/entities/EnemyManager.js',
  'js/entities/Skill.js',
  'js/ui/UIManager.js',
  'images/logo-192.png',
  'images/logo-512.png',
  'manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make network request and cache the response
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Open cache and store the new response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});