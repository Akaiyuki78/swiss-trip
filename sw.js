/* Service worker — cache-first, precache the whole app for offline use.
   Bump CACHE when you change any file so clients pick up the update. */
const CACHE = "trips-v22";

const ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "css/fonts.css",
  "css/tokens.css",
  "css/base.css",
  "css/trip.css",
  "js/config.js",
  "js/trips/switzerland.js",
  "js/trips/tokyo.js",
  "js/trips/hokkaido.js",
  "js/views.js",
  "js/router.js",
  "js/app.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-512-maskable.png",
  "fonts/dm-serif-display.woff2",
  "fonts/figtree.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll fails if any single file 404s; add individually to be resilient
      Promise.allSettled(ASSETS.map((u) => c.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // never cache external map/website links — let them hit the network
  if (url.origin !== location.origin) return;

  // config.js is network-first so API-key/config edits take effect immediately
  // (falls back to cache when offline).
  if (url.pathname.endsWith("/js/config.js")) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match("index.html")); // SPA fallback
    })
  );
});
