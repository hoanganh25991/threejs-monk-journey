const CACHE_NAME = 'monk-journey-v2';
const ASSETS_TO_CACHE = [
  '',
  'index.html',
  'css/style.css',
  'js/main.js',
  // Core files
  'js/core/Game.js',
  'js/core/InputHandler.js',
  'js/core/AudioManager.js',
  'js/core/CollisionManager.js',
  'js/core/SaveManager.js',
  'js/core/DifficultyManager.js',
  'js/core/PerformanceManager.js',
  'js/core/QuestManager.js',
  // Entity files
  'js/entities/Player.js',
  'js/entities/Enemy.js',
  'js/entities/EnemyManager.js',
  'js/entities/Skill.js',
  // UI files
  'js/ui/UIManager.js',
  // World files
  'js/world/WorldManager.js',
  'js/world/environment/Bush.js',
  'js/world/environment/EnvironmentManager.js',
  'js/world/environment/Flower.js',
  'js/world/environment/Rock.js',
  'js/world/environment/Tree.js',
  'js/world/interactive/BossSpawnPoint.js',
  'js/world/interactive/InteractiveObjectManager.js',
  'js/world/interactive/QuestMarker.js',
  'js/world/interactive/TreasureChest.js',
  'js/world/lighting/LightingManager.js',
  'js/world/structures/Building.js',
  'js/world/structures/DarkSanctum.js',
  'js/world/structures/Ruins.js',
  'js/world/structures/StructureManager.js',
  'js/world/structures/Tower.js',
  'js/world/terrain/TerrainChunk.js',
  'js/world/terrain/TerrainManager.js',
  'js/world/utils/RandomGenerator.js',
  'js/world/utils/TextureGenerator.js',
  'js/world/zones/ZoneManager.js',
  // Images
  'images/logo-192.png',
  'images/logo-512.png',
  'images/logo-192.svg',
  'images/logo-512.svg',
  // Audio files
  'assets/audio/attack.mp3',
  'assets/audio/battle_theme.mp3',
  'assets/audio/boss_death.mp3',
  'assets/audio/boss_theme.mp3',
  'assets/audio/button_click.mp3',
  'assets/audio/chest_open.mp3',
  'assets/audio/cyclone_strike.mp3',
  'assets/audio/door_open.mp3',
  'assets/audio/enemy_attack.mp3',
  'assets/audio/enemy_death.mp3',
  'assets/audio/enemy_hit.mp3',
  'assets/audio/inner_sanctuary.mp3',
  'assets/audio/inventory_open.mp3',
  'assets/audio/item_pickup.mp3',
  'assets/audio/level_up.mp3',
  'assets/audio/main_theme.mp3',
  'assets/audio/player_death.mp3',
  'assets/audio/player_hit.mp3',
  'assets/audio/seven_sided_strike.mp3',
  'assets/audio/wave_strike.mp3',
  // Manifest
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