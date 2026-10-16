const APP_VERSION = 'rivals-word-arena-v8.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 安裝時立即跳過等待，強制接管
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_VERSION).then((cache) => cache.addAll(ASSETS))
  );
});

// 啟動時清除所有舊版本 Cache，並通知所有畫面立即更新
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

// Network-First 策略：只要有上網，永遠優先攞 GitHub 最新版本並更新 Cache！
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 抓到最新檔案，同步寫入快取
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const cloned = networkResponse.clone();
          caches.open(APP_VERSION).then((cache) => cache.put(event.request, cloned));
        }
        return networkResponse;
      })
      .catch(() => {
        // 離線時才讀取快取
        return caches.match(event.request);
      })
  );
});
