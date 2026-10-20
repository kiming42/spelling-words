const APP_VERSION = 'rivals-word-arena-v10.5.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/hud-controls.css',
  './css/lobby-armory.css',
  './css/modals-phonics.css',
  './js/data/vocab-data.js',
  './js/data/sentences-data.js',
  './js/data/phonics-dict.js',
  './js/data/armory-boss-data.js',
  './js/core/state-storage.js',
  './js/core/audio-tts.js',
  './js/ui/lobby-ui.js',
  './js/ui/phonics-ui.js',
  './js/ui/parent-ocr.js',
  './js/modes/mode-sniper.js',
  './js/modes/mode-assault.js',
  './js/modes/mode-cypher.js',
  './js/engine/arena-physics.js',
  './js/engine/renderer.js',
  './js/engine/input-controls.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_VERSION).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== APP_VERSION) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const cloned = networkResponse.clone();
          caches.open(APP_VERSION).then((cache) => cache.put(event.request, cloned));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
