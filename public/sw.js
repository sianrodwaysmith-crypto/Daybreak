// Bump this cache name on any meaningful deploy — installed PWAs (especially
// on iOS) hold onto old caches stubbornly, and only `activate` with a new
// CACHE_NAME will evict them. Pair this with clients.claim() + reload-on-
// activate so the home-screen WebView picks up the new bundle on next open.
const CACHE_NAME = 'daybreak-v13';
const APP_SHELL  = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()).then(() =>
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Force every open window/PWA to reload onto the new bundle.
        for (const c of clients) {
          // navigate() is supported in standalone WebViews on iOS 16+.
          if ('navigate' in c) c.navigate(c.url);
        }
      })
    )
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API routes must always hit the network. We previously cached every
  // same-origin GET, which silently broke Whoop / weather / anything
  // dynamic — the first response stuck around forever.
  if (url.pathname.startsWith('/api/')) return;

  // Navigation / HTML: network-first so a new deploy is picked up immediately,
  // fall back to cache only when offline.
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Hashed static assets: cache-first (immutable filenames, safe to cache).
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, copy));
      return res;
    }))
  );
});
