# Clave fugaz

Aplicación web progresiva (PWA) en español para generar contraseñas temporales.

## Desarrollo

Requiere Node.js 22 o superior. No hay dependencias externas ni paso de compilación.

```sh
cd /workspace/PasswordCreator
npm start
```

El servidor usa el puerto 3000, configurable con `PORT`. Para validar el generador: `npm test`.

## Uso y privacidad

Elegí entre 8 y 128 caracteres y activá mayúsculas, minúsculas, números o símbolos. Cada contraseña incluye al menos un carácter de cada grupo elegido. Usa Web Crypto y muestreo por rechazo, sin `Math.random`.

La contraseña solo se mantiene temporalmente en memoria y en la pantalla: se elimina al copiar correctamente, cambiar las opciones, pulsar Borrar, ocultar la pestaña o después de 60 segundos. No se almacena en localStorage, sessionStorage, IndexedDB, cookies, caché ni archivos, ni se envía a un servidor. El service worker guarda únicamente recursos estáticos para uso sin conexión.

El portapapeles es externo a la aplicación y puede conservar historial o sincronizarse. La aplicación no puede garantizar su borrado, ni el borrado físico de memoria del navegador. No uses una contraseña real durante pruebas o grabaciones de pantalla.

## Instalación y despliegue

Abrí la web en un navegador compatible y elegí Instalar aplicación cuando se ofrezca; en iOS usá Compartir → Agregar a inicio. La disponibilidad depende del navegador. HTTPS es obligatorio en producción para Web Crypto, portapapeles y service worker; localhost se admite para desarrollo. La primera carga debe ser en línea; las siguientes pueden funcionar sin conexión. El servidor incluido sirve desarrollo; publicá los archivos estáticos con HTTPS para uso público. No se necesitan secretos ni base de datos.
