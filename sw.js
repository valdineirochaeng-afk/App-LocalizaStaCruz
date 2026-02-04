
const CACHE_NAME = 'sc-v4';
const ASSETS = ['./', './index.html', 'https://cdn.sheetjs.com'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
