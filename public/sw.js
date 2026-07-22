/* Hotel Thamel Park — static shell only. Never cache Orbit media. */
const CACHE = "htp-static-v4-brand-icons";
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png?v=brand-20260722",
  "/icons/icon-512.png?v=brand-20260722",
  "/icons/maskable-512.png?v=brand-20260722",
  "/apple-touch-icon.png?v=brand-20260722",
  "/favicon.ico?v=brand-20260722",
];

function isBrandIconPath(pathname) {
  return (
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/brand/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/favicon-") ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/browserconfig.xml" ||
    pathname === "/manifest.webmanifest"
  );
}

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

  // Brand / PWA icons: network-first so logo updates never stick behind SW.
  if (isBrandIconPath(url.pathname)) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || fetch(request)))
    );
    return;
  }

  // Never intercept CMS, API, Orbit, uploads, or any media/video asset.
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
  if (url.pathname.startsWith("/_next/static/")) {
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

  // Network-first for HTML navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => response)
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
  }
});
