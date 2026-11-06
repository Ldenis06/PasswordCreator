const CACHE = 'passwordcreator-v6';
const ASSETS = ['./', './index.html', './style.css', './app.js', './generator.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'].map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE)
    .then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => (key.startsWith('clave-fugaz-') || key.startsWith('passwordcreator-')) && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  url.search = '';
  if (event.request.method !== 'GET' || !ASSETS.includes(url.href)) return;
  // Prefer the published version; use only pre-cached static assets offline.
  event.respondWith(fetch(new Request(event.request, { cache: 'no-cache' }))
    .then(async response => {
      if (response.ok) return response;
      return await caches.match(url.href) || response;
    })
    .catch(async () => await caches.match(url.href) || Response.error()));
});
