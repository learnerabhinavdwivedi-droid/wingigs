const CACHE_NAME = 'bahar-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/today',
  '/outside',
  '/progress',
  '/onboarding',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't fail install if some resources fail
      return Promise.allSettled(
        OFFLINE_URLS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests and external resources for now
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit
      if (response) {
        // Fetch new version in background (Stale-While-Revalidate)
        fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, res);
            });
          }
        }).catch(() => {});
        
        return response;
      }
      
      // Cache miss, fetch from network
      return fetch(event.request).catch(() => {
        // If offline and requesting HTML, try to return root or today
        if (event.request.mode === 'navigate') {
          return caches.match('/today');
        }
      });
    })
  );
});
