// BioDynamX AI OS — Service Worker
// Enables PWA install prompt and offline shell caching
const CACHE_NAME = 'biodynamx-aios-v2';
const PRECACHE = [
    '/',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
    '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Network-first for API/voice routes, cache-first for static assets
    const url = new URL(event.request.url);
    const isApi = url.pathname.startsWith('/api/') || url.pathname.includes('gemini');

    if (isApi) {
        event.respondWith(fetch(event.request).catch(() => new Response('offline', { status: 503 })));
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});
