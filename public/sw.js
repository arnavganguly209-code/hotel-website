/* Hotel Thamel Park — static shell only. Never cache Orbit media. */
const CACHE = "htp-static-v3-no-media";
const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "PURGE_MEDIA_CACHE") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept CMS, API, Orbit, uploads, or any media/video asset.
  // Cache-first media was causing deleted Orbit assets to flash from SW memory.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/orbit") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.startsWith("/media/") ||
    /\.(mp4|webm|mov|m4v|jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(url.pathname)
  ) {
    return;
  }

  // Cache-first for hashed Next static assets only
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // Network-first for HTML navigations — do not serve stale pages with old media URLs
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => response)
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
  }
});
