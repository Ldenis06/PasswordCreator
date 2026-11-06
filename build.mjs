import { mkdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import { renderMobilePage } from './mobile-page.mjs';
const root = new URL('./', import.meta.url);
const output = new URL('./_site/', root);
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'pwa.js', 'generator.js', 'sw.js', 'manifest.webmanifest', 'mobile.webmanifest']) {
  await copyFile(new URL(file, root), new URL(file, output));
}
await cp(new URL('./icons/', root), new URL('./icons/', output), { recursive: true });
await writeFile(new URL('mobile.html', output), renderMobilePage(await readFile(new URL('index.html', root), 'utf8')));
console.log('Sitio PWA generado en _site, incluida la instalación alternativa mobile.html.');
