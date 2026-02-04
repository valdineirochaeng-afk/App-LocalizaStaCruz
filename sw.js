
const CACHE_NAME = 'rota-sta-cruz-cache-v1';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './dadosLocais.json',
  './r-512x512.png',
  './r-192x192.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  // Adicione outros arquivos CSS e JS da sua aplicação aqui, se houver
  // Exemplo: './style.css',
  // Exemplo: './app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força o novo Service Worker a ser ativado imediatamente
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Permite que o Service Worker controle imediatamente os clientes existentes
  );
});

self.addEventListener('fetch', (event) => {
  // Evita intercepções para extensões do Chrome e requisições que não são http/https
  if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:')) || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Se não encontrou no cache, tenta a rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Verifica se a resposta da rede é válida antes de armazenar em cache
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Clona a resposta porque ela é um stream e só pode ser consumida uma vez
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          })
          .catch((error) => {
            // Fallback para uma página offline ou erro, se necessário
            console.error('Fetch failed; returning offline page or error.', error);
            // Você pode retornar uma página offline aqui se tiver uma
            // return caches.match('/offline.html');
          });
      })
  );
});
