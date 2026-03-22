// Macitta Service Worker — Cache-first for static, network-first for API
const CACHE_NAME = "macitta-v1";
const STATIC_ASSETS = [
    "/",
    "/dashboard",
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png",
];

// Install — precache static shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch — network-first for navigations and API, cache-first for static assets
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    // API calls — network only, don't cache
    if (url.pathname.startsWith("/api/") || url.pathname.includes("supabase")) return;

    // Navigation requests — network first, fallback to cache
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
        );
        return;
    }

    // Static assets — cache first, fallback to network
    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ||
                fetch(request).then((response) => {
                    // Cache JS, CSS, images
                    if (
                        url.pathname.endsWith(".js") ||
                        url.pathname.endsWith(".css") ||
                        url.pathname.match(/\.(png|jpg|svg|ico|woff2?)$/)
                    ) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    }
                    return response;
                })
        )
    );
});
