
const CACHE_NAME = 'mapa-offline-v1';
const ASSETS = ['./', './index.html', 'https://cdn.sheetjs.com'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
