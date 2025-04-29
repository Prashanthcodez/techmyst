const CACHE_NAME = 'techtools-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './assets/all.min.css',
    '/assets/webfonts/fa-solid-900.woff2',
    '/assets/webfonts/fa-solid-900.ttf',
    '/assets/webfonts/fa-brands-400.woff2',
    '/assets/webfonts/fa-brands-400.ttf',
    '/assets/webfonts/fa-regular-400.woff2',
    '/assets/webfonts/fa-regular-400.ttf',
    '/assets/webfonts/fa-v4compatibility.woff2',
    '/assets/webfonts/fa-v4compatibility.ttf'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
}); 