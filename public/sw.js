// Service Worker oficial de ShopDigital PWA
const CACHE_NAME = 'shopdigital-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/branding.png',
    '/ari-saludando.gif'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch event handler obligatorio para habilitar la instalación nativa PWA en Chrome/Android
self.addEventListener('fetch', (event) => {
    // Pasar las peticiones de red transparentemente
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
