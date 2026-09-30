// public/sw.js
const CACHE_NAME = 'gym-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through simples para garantir o funcionamento com Next.js
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});