// Guarda só a "casca" do app (página e ícones). O cardápio vem sempre fresco do Google.
const CACHE = "cacula-app-v21";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest",
  "./icone-192.png", "./icone-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  if (req.url.endsWith(".mp4") || req.headers.has("range")) return; // vídeo vai direto, sem cache
  e.respondWith(
    fetch(req)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(req, copia));
        return resp;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
  );
});
