const CACHE = "reading-book-v1.3.0";
const shell = ["/", "/style.css?v=1.3.0", "/app.js?v=1.3.0", "/catalog.js?v=1.3.0", "/quotes.js",
  "/journey.js", "/journey-score.js", "/journey-levels.js", "/journey-badges.js", "/journey.css?v=1.3.0", "/assets/journey.webp",
  "/learning.css?v=1.3.0", "/auth-page.js", "/mam-scenes.js", "/tutor.js", "/tutor-core.js", "/tutor-view.js",
  "/assets/mam-read.webp", "/assets/mam-guide.webp", "/assets/mam-celebrate.webp", "/assets/mam-think.webp", "/assets/hero.webp", "/assets/icon-192.png", "/assets/be.woff2", "/assets/be-bold.woff2", "/assets/lora.woff2", "/assets/dancing.woff2"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(shell)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(
    key => key.startsWith("reading-book-") && key !== CACHE
  ).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/")));
    return;
  }
  if (shell.includes(url.pathname + url.search) || url.pathname.startsWith("/assets/")) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      const stored = await cache.match(event.request);
      if (stored) return stored;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    }));
  }
});

self.addEventListener("push", event => {
  event.waitUntil(self.registration.showNotification("Reading Book", {
    body: "Đến hẹn đọc sách rồi. Mở thư viện để tiếp tục từ chỗ bạn đã dừng.",
    icon: "/assets/icon-192.png",
    tag: "reading-book-weekly"
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const app = windows.find(window => new URL(window.url).origin === self.location.origin);
    if (app) return app.focus();
    return clients.openWindow("/");
  })());
});
