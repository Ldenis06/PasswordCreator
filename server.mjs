import { renderMobilePage } from './mobile-page.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const files = new Map([
  ['/', ['index.html', 'text/html']], ['/index.html', ['index.html', 'text/html']],
  ...['style.css','app.js','pwa.js','generator.js','sw.js','manifest.webmanifest','mobile.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/lock-192.png','icons/lock-512.png','icons/lock-maskable-512.png','icons/apple-touch-icon.png'].map(file => ['/'+file,[file, file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.webmanifest') ? 'application/manifest+json' : file.endsWith('.svg') ? 'image/svg+xml' : 'image/png']])
]);
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const localPath = path.startsWith('/PasswordCreator/') ? path.slice('/PasswordCreator'.length) : path;
  const entry = localPath === '/mobile.html' ? ['index.html', 'text/html'] : files.get(localPath);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; worker-src 'self'; manifest-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  if (!entry || !['GET','HEAD'].includes(req.method)) { res.writeHead(404); res.end(); return; }
  try {
    let data = await readFile(new URL(entry[0], import.meta.url));
    if (localPath === '/mobile.html') data = renderMobilePage(data.toString());
    res.setHeader('Content-Type', entry[1] + (entry[1].startsWith('text/') ? '; charset=utf-8' : ''));
    res.writeHead(200); res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(500); res.end('No se pudo cargar el recurso.'); }
});
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('PasswordCreator: servidor iniciado en puerto '+server.address().port));
