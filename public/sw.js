const CACHE = "reading-book-v1.0.0";
const shell = ["/", "/style.css?v=1.0.0", "/app.js?v=1.0.0", "/catalog.js", "/quotes.js",
  "/assets/hero.webp", "/assets/icon-192.png", "/assets/be.woff2", "/assets/be-bold.woff2", "/assets/lora.woff2", "/assets/dancing.woff2"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(shell)));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(
    key => key.startsWith("reading-book-") && key !== CACHE
  ).map(key => caches.delete(key)))));
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
