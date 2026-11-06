import { generatePassword } from './generator.js?v=8';
const form = document.querySelector('#generator');
const length = document.querySelector('#length');
const result = document.querySelector('#result');
const password = document.querySelector('#password');
const status = document.querySelector('#status');
const personalize = document.querySelector('#personalize');
const personalWord = document.querySelector('#personal-word');
const personalOptions = document.querySelector('#personal-options');
let expiry;
let revision = 0;
function clear(message = 'Contraseña borrada de esta pantalla.', eraseWord = true) {
  clearTimeout(expiry);
  if (eraseWord) personalWord.value = '';
  password.textContent = '';
  result.hidden = true;
  revision++;
  status.textContent = message;
}
length.addEventListener('input', () => {
  document.querySelector('#length-value').value = length.value;
  clear('Configuración actualizada. Generá una nueva contraseña.');
});
document.querySelector('#settings-panel').addEventListener('change', () => clear('Configuración actualizada. Generá una nueva contraseña.'));
form.addEventListener('submit', event => {
  event.preventDefault();
  clear('', false);
  try {
    if (personalize.checked && !personalWord.value.trim()) throw new Error('Escribí una palabra o desactivá la opción de incluirla.');
    password.textContent = generatePassword(Number(length.value), [...document.querySelectorAll('[name=group]:checked')].map(input => input.value), personalize.checked ? personalWord.value : '');
    result.hidden = false;
    status.textContent = 'Contraseña generada. Copiala antes de 60 segundos.';
    expiry = setTimeout(() => clear('La contraseña venció y se borró de esta pantalla.'), 60000);
  } catch (error) { status.textContent = error.message; }
});
document.querySelector('#clear').addEventListener('click', () => clear());
document.querySelector('#copy').addEventListener('click', async () => {
  if (!password.textContent) return;
  const current = revision;
  try {
    await navigator.clipboard.writeText(password.textContent);
    if (current === revision) clear('Copiada al portapapeles y borrada de esta pantalla.');
  } catch {
    if (current === revision) status.textContent = 'No se pudo copiar. Revisá el permiso del portapapeles y usá HTTPS o localhost.';
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
window.addEventListener('pagehide', () => clear());
const install = document.querySelector('#install');
const installHelp = document.querySelector('#install-help');
const installStatus = document.querySelector('#install-status');
const standalone = matchMedia('(display-mode: standalone)');
let installPrompt;
function updateAppMode() {
  install.hidden = false;
  if (standalone.matches || navigator.standalone === true) {
    install.textContent = 'Ayuda de instalación';
    installStatus.hidden = false;
    installStatus.textContent = 'Esta ventana está abierta en modo aplicación.';
  } else {
    install.textContent = 'Instalar en el celular';
    installStatus.hidden = true;
  }
}
function showInstallHelp() {
  installHelp.hidden = false;
  install.setAttribute('aria-expanded', 'true');
}
function showInstallRequested() {
  install.textContent = 'Ayuda de instalación';
  installStatus.hidden = false;
  installStatus.textContent = 'Chrome recibió la solicitud. Comprobá si aparece PasswordCreator en la lista de aplicaciones del celular.';
  showInstallHelp();
}
updateAppMode();
standalone.addEventListener('change', updateAppMode);
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  install.hidden = false;
});
install.addEventListener('click', async () => {
  clear();
  if (!installPrompt) {
    installHelp.hidden = !installHelp.hidden;
    install.setAttribute('aria-expanded', String(!installHelp.hidden));
    return;
  }
  const prompt = installPrompt;
  installPrompt = undefined;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') showInstallRequested();
    else showInstallHelp();
  } catch {
    installStatus.hidden = false;
    installStatus.textContent = 'No se pudo abrir el aviso de instalación. Revisá los pasos de ayuda.';
    showInstallHelp();
  }
});
window.addEventListener('appinstalled', () => { installPrompt = undefined; showInstallRequested(); });
if ('serviceWorker' in navigator) {
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (wasControlled && !refreshing) {
      refreshing = true;
      clear('Actualizando la aplicación…');
      location.reload();
    }
  });
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
    .then(registration => registration.update())
    .catch(() => {
      status.textContent = 'Modo sin conexión no disponible. Podés seguir generando contraseñas.';
    });
}

const tabs = [document.querySelector('#create-tab'), document.querySelector('#settings-tab')];
for (const tab of tabs) tab.addEventListener('click', () => {
  clear('Generá una contraseña para empezar.');
  for (const item of tabs) {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-expanded', String(active));
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  }
});
const theme = document.querySelector('#theme');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  if (theme.value === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme.value;
  const dark = theme.value === 'dark' || (theme.value === 'system' && systemTheme.matches);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#212121' : '#f5f5f3';
}
theme.addEventListener('change', applyTheme);
systemTheme.addEventListener('change', applyTheme);
applyTheme();

personalize.addEventListener('change', () => {
  clear('Generá una nueva contraseña.');
  personalOptions.hidden = !personalize.checked;
  if (personalize.checked) personalWord.focus();
});
personalWord.addEventListener('input', () => clear('Palabra actualizada. Generá una nueva contraseña.', false));
