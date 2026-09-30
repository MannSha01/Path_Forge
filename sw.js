// ===================================================
// PATH FORGE - SERVICE WORKER (OFFLINE-FIRST PWA)
// Caches App Shell, CSS, JS, and CDN assets for offline study
// ===================================================

const CACHE_NAME = "pathforge-v1.0.0";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon.svg",
  "/src/styles/base.css",
  "/src/styles/components.css",
  "/src/styles/animations.css",
  "/src/app.js",
  "/src/data/pathways.js",
  "/src/data/curriculum.js",
  "/src/data/quizQuestions.js",
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/lucide@latest",
  "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"
];

// Install: Pre-cache static core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Path Forge SW] Pre-caching core app shell");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[Path Forge SW] Pre-cache warning:", err);
      })
  );
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST to APIs handled by network)
  if (request.method !== "GET") {
    return;
  }

  // 1. API Endpoints (/api/*): Network-First with graceful offline fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            error: "You are currently offline. Cached learning pathways and notes remain available."
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );
    return;
  }

  // 2. Navigation requests: Network-first falling back to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 3. Static Assets: Cache-First with Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" || networkResponse.type === "cors")
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
