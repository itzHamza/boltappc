// service-worker.js
const CACHE_NAME = "v1.0.0"; // اسم ذاكرة التخزين المؤقت
const ASSETS_TO_CACHE = [
  "/", // الصفحة الرئيسية
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/index.css",
  "/loogo.png",
  "/tbcaai.png",
];

// تثبيت الـ Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// تفعيل الـ Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// استرجاع الملفات من الذاكرة المؤقتة
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
