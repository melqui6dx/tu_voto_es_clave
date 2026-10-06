// Service Worker básico (offline-first para la interfaz).
// - Shell de la app (HTML/manifest/íconos) y assets de /_astro/ (CSS, JS, fuentes): se sirven desde caché.
// - Datos de la API (/api/...): SIEMPRE red, nunca se cachean aquí
//   (la app guarda la última consulta en localStorage como respaldo).

const VERSION = 'v3';
const SHELL_CACHE = `shell-${VERSION}`;
const SHELL_URLS = ['/', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// La página envía los assets con hash que ya cargó (no se conocen en build del SW).
self.addEventListener('message', (event) => {
  const { tipo, urls } = event.data ?? {};
  if (tipo !== 'precache' || !Array.isArray(urls)) return;
  const propios = urls.filter((u) => new URL(u).origin === self.location.origin);
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(propios)).catch(() => {}));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET del mismo origen. La API y otros orígenes pasan directo a la red.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Navegación (HTML): red primero, con respaldo offline desde caché.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Assets generados por Astro y archivos del shell: caché primero.
  if (url.pathname.startsWith('/_astro/') || SHELL_URLS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match('/')) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
