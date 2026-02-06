// Alterado para v2 para forçar o navegador a descartar o cache antigo com erro
const CACHE_NAME = 'rota-sta-cruz-cache-v3';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './dadosLocais.json',
  './r-512x512.png',
  './r-192x192.png'
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache v2 aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Ativa o novo SW imediatamente
  );
});

// Ativação: Remove caches antigos (v1, etc)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Assume o controle da página imediatamente
  );
});

// Estratégia de Fetch: Tenta Cache primeiro, se não tiver, busca na Rede
self.addEventListener('fetch', (event) => {
  // Ignora requisições de extensões ou protocolos não suportados
  if (!(event.request.url.startsWith('http:') || event.request.url.startsWith('https:')) || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se estiver no cache, retorna
        if (response) {
          return response;
        }

        // Se não, busca na rede
        return fetch(event.request).then((networkResponse) => {
          // Salva novas requisições no cache para uso offline futuro
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch((error) => {
          console.error('Falha no fetch:', error);
        });
      })
  );
});
