export function renderMobilePage(index) {
  return index
    .replace('href="./manifest.webmanifest"', 'href="./mobile.webmanifest"')
    .replace('<div class="installation">', '<div class="installation"><p id="recovery-note" class="note">Esta opción crea una instalación nueva si la anterior no abre. Si había otra instalada, podrían aparecer dos íconos.</p>');
}
