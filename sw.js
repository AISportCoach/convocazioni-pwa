// Incrementa questo valore (es. v2, v3...) a ogni modifica di index.html/manifest.json/icone:
// è l'unico modo per far arrivare l'aggiornamento a chi ha già installato l'app, altrimenti
// il service worker continua a servire la versione in cache indefinitamente.
const CACHE_NAME = 'convocazioni-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomi) {
      return Promise.all(
        nomi
          .filter(function (nome) { return nome !== CACHE_NAME; })
          .map(function (nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

// Le chiamate all'API Apps Script (script.google.com / script.googleusercontent.com)
// sono cross-origin e vanno sempre in rete: i dati (partite, convocazioni) devono
// restare sempre freschi, non vanno mai serviti dalla cache.
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (rispostaCache) {
      return rispostaCache || fetch(event.request);
    })
  );
});
