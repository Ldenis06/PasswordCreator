const CACHE = 'passwordcreator-pwa-v10';
const ROOT = new URL('./', self.registration.scope);
const SHELL = new URL('./index.html', ROOT).href;
const ASSETS = [
  './index.html', './mobile.html', './mobile.webmanifest', './style.css?v=10', './app.js?v=10', './generator.js?v=10',
  './pwa.js?v=10', './manifest.webmanifest', './icons/icon.svg',
  './icons/lock-192.png', './icons/lock-512.png',
  './icons/lock-maskable-512.png', './icons/apple-touch-icon.png'
].map(path => new URL(path, ROOT).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key =>
      (key.startsWith('passwordcreator-') || key.startsWith('clave-fugaz-')) && key !== CACHE
    ).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
async function networkFirst(request, fallback) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(request, { cache: 'no-cache', signal: controller.signal });
    if (response.ok) return response;
    const cached = await (await caches.open(CACHE)).match(fallback);
    return cached || response;
  } catch {
    return await (await caches.open(CACHE)).match(fallback) || Response.error();
  } finally {
    clearTimeout(timeout);
  }
}
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  // Handle root, index.html and launch/update query strings with one offline shell.
  if (event.request.mode === 'navigate') {
    const shell = url.pathname === new URL('./mobile.html', ROOT).pathname
      ? new URL('./mobile.html', ROOT).href : SHELL;
    event.respondWith(networkFirst(event.request, shell));
    return;
  }
  const fallback = ASSETS.find(asset => new URL(asset).pathname === url.pathname);
  if (fallback) event.respondWith(networkFirst(event.request, fallback));
});
