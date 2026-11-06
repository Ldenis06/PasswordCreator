import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('./', import.meta.url);
test('manifest launches a standalone app inside the GitHub Pages scope with valid PNG icons', async () => {
  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', root), 'utf8'));
  const base = new URL('https://example.github.io/PasswordCreator/manifest.webmanifest');
  const scope = new URL(manifest.scope, base);
  const start = new URL(manifest.start_url, base);
  assert.equal(manifest.display, 'standalone');
  assert.equal(new URL(manifest.id, start).pathname, '/PasswordCreator/');
  assert.ok(start.href.startsWith(scope.href));
  await readFile(new URL(manifest.start_url, root));
  for (const icon of manifest.icons) {
    const png = await readFile(new URL(icon.src, root));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable'));
});
async function worker(fetch) {
  const handlers = new Map();
  const requests = [];
  const cachedShell = new Response('offline app shell');
  const context = vm.createContext({
    URL, Request, Response, AbortController, setTimeout, clearTimeout, fetch,
    self: { registration: { scope: 'https://example.github.io/PasswordCreator/' }, addEventListener: (name, fn) => handlers.set(name, fn) },
    caches: { open: async () => ({ match: async url => { requests.push(url); return url.endsWith('/index.html') ? cachedShell : undefined; } }) }
  });
  vm.runInContext(await readFile(new URL('sw.js', root), 'utf8'), context);
  return {handlers, requests};
}
test('offline launches from root, index and query strings resolve to the app shell', async () => {
  for (const path of ['', 'index.html', '?source=pwa', '?actualizar=9']) {
    const {handlers, requests} = await worker(async () => { throw new Error('offline'); });
    let response;
    handlers.get('fetch')({request: {url:'https://example.github.io/PasswordCreator/'+path,method:'GET',mode:'navigate'},respondWith: promise => { response = promise; }});
    assert.equal(await (await response).text(), 'offline app shell');
    assert.equal(requests[0], 'https://example.github.io/PasswordCreator/index.html');
  }
});
test('successful network navigation takes priority over the offline shell', async () => {
  const {handlers, requests} = await worker(async () => new Response('new release'));
  let response;
  handlers.get('fetch')({request:{url:'https://example.github.io/PasswordCreator/',method:'GET',mode:'navigate'},respondWith: promise => {response=promise;}});
  assert.equal(await (await response).text(), 'new release');
  assert.equal(requests.length, 0);
});
test('worker does not intercept unrelated requests or POST data', async () => {
  const {handlers} = await worker(() => { throw new Error('must not fetch'); });
  for (const request of [
    {url:'https://example.github.io/OtherApp/',method:'GET',mode:'navigate'},
    {url:'https://example.github.io/PasswordCreator/',method:'POST',mode:'navigate'},
    {url:'https://example.github.io/PasswordCreator/private-data',method:'GET',mode:'cors'}
  ]) handlers.get('fetch')({request, respondWith: () => assert.fail('unrelated request intercepted')});
});
