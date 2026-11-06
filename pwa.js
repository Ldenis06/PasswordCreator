// Installation state belongs to the browser; never infer it from a missing prompt.
export function initializePWA({ beforeInstall = () => {} } = {}) {
  const button = document.querySelector('#install');
  const help = document.querySelector('#install-help');
  const status = document.querySelector('#install-status');
  const standalone = matchMedia('(display-mode: standalone)');
  let pendingPrompt;
  const message = text => { status.hidden = !text; status.textContent = text; };
  const showHelp = () => { help.hidden = false; button.setAttribute('aria-expanded', 'true'); };
  function renderMode() {
    const inApp = standalone.matches || navigator.standalone === true;
    button.textContent = inApp ? 'Ayuda de instalación' : 'Instalar aplicación';
    button.hidden = false;
    const recoveryNote = document.querySelector('#recovery-note');
    if (recoveryNote) recoveryNote.hidden = inApp;
    message(inApp ? 'Abierta en modo aplicación.' : '');
  }
  renderMode();
  standalone.addEventListener('change', renderMode);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingPrompt = event;
    button.textContent = 'Instalar aplicación';
    message('Tu navegador ofrece instalar PasswordCreator.');
  });
  button.addEventListener('click', async () => {
    beforeInstall();
    if (!pendingPrompt) {
      help.hidden = !help.hidden;
      button.setAttribute('aria-expanded', String(!help.hidden));
      return;
    }
    const prompt = pendingPrompt;
    pendingPrompt = undefined;
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      message(outcome === 'accepted'
        ? 'Solicitud aceptada. El navegador debe completar la instalación.'
        : 'Instalación cancelada. Podés volver a intentarlo desde el menú del navegador.');
    } catch {
      message('El navegador no pudo iniciar la instalación. Consultá la ayuda.');
    }
    showHelp();
  });
  window.addEventListener('appinstalled', () => {
    pendingPrompt = undefined;
    message('El navegador notificó la instalación. Buscá PasswordCreator en tus aplicaciones.');
    showHelp();
  });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    message('La instalación y el modo sin conexión necesitan HTTPS y un navegador compatible.');
    return;
  }
  let reloading = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !reloading) {
      reloading = true;
      beforeInstall();
      location.reload();
    }
  });
  // Retain the existing worker URL/scope so old installations can migrate.
  navigator.serviceWorker.register(new URL('./sw.js', import.meta.url), {
    scope: new URL('./', import.meta.url).href,
    updateViaCache: 'none'
  }).then(registration => {
    // A failed online update must not disable an already working offline app.
    registration.update().catch(() => {});
  }).catch(() => {
    message('No se pudo preparar el modo sin conexión. Revisá tu conexión y recargá.');
  });
}
