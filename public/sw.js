// BioDynamX AI OS — Service Worker v4
// Fixes: stale cache serving old _next chunk hashes after new deploy.
// HTML & Next.js navigations = NETWORK-FIRST (always fresh HTML → fresh chunk hashes)
// True static assets (images, fonts, icons) = cache-first for performance.
const CACHE_NAME = 'biodynamx-aios-v4';
const PRECACHE = [
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
    const url = new URL(event.request.url);

    // Always network-first for API routes
    const isApi = url.pathname.startsWith('/api/') || url.pathname.includes('gemini');
    if (isApi) {
        event.respondWith(
            fetch(event.request).catch(() => new Response('offline', { status: 503 }))
        );
        return;
    }

    // Network-first for HTML navigation requests and all Next.js chunks
    // This ensures fresh HTML is loaded after every deploy (new chunk hashes)
    const isNavigation = event.request.mode === 'navigate';
    const isNextChunk = url.pathname.startsWith('/_next/');
    if (isNavigation || isNextChunk) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful responses for offline fallback
                    if (response.ok && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for true static assets (images, fonts, icons) for performance
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});
