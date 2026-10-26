# Diario de Pesca v0.3 — GitHub Pages + Google Sheets

## Archivos
- `index.html`: app web adaptada para configurar sincronización con Google Sheets.
- `manifest.webmanifest`, `sw.js`, `icons/`: instalación PWA en iPhone.
- `Code.gs`: backend de Google Apps Script para leer/escribir la hoja.
- `README-configuracion.txt`: estas instrucciones.

## A. Crear la hoja de Google Sheets
1. Entra en https://sheets.google.com y crea una hoja llamada `Diario de Pesca`.
2. Copia el ID de la hoja desde su URL: en `https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`, copia solo el texto entre `/d/` y `/edit`.
3. No compartas públicamente la hoja. Déjala privada.
4. En la hoja, abre **Extensiones → Apps Script**.

## B. Configurar el backend
1. En Apps Script, abre el archivo `Code.gs` que se crea por defecto, borra su contenido y pega todo el contenido del archivo `Code.gs` incluido en este ZIP.
2. En la primera línea de configuración, sustituye `PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET` por el ID de tu hoja.
3. Cambia `CAMBIA_ESTA_CLAVE_POR_UNA_CLAVE_LARGA_Y_ALEATORIA` por una clave privada larga (por ejemplo, 30 caracteres aleatorios). No la publiques ni la pongas en GitHub.
4. Guarda el proyecto con un nombre como `Diario de Pesca API`.
5. Pulsa **Implementar → Nueva implementación**.
6. En el tipo de implementación, elige **Aplicación web**.
7. Configura **Ejecutar como: Yo** y el acceso como **Cualquier usuario** / **Anyone** (el texto exacto puede variar). Esto permite que el iPhone haga peticiones sin iniciar sesión en Google; la clave configurada en el script protege las operaciones. Mantén la hoja privada.
8. Pulsa **Implementar**, autoriza los permisos que solicite Google y copia la URL que termina en `/exec`. No uses la URL de prueba `/dev`.
9. Si editas el código más adelante, crea una nueva versión de la implementación desde **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**.

## C. Publicar en GitHub Pages
1. Entra en https://github.com y crea un repositorio nuevo llamado `diario-pesca`.
2. En GitHub Free, el repositorio debe ser **público** para usar GitHub Pages. No subas a este repositorio la hoja de cálculo ni la clave privada.
3. Descomprime este ZIP en tu ordenador.
4. Sube al nivel raíz del repositorio estos archivos y carpeta: `index.html`, `manifest.webmanifest`, `sw.js`, `icons/`. Puedes subir también el README, pero **no subas la clave privada ni una copia de datos**.
5. En el repositorio, abre **Settings → Pages**.
6. En **Build and deployment**, selecciona **Deploy from a branch**, elige `main` y `/(root)`, y pulsa **Save**.
7. Espera unos minutos. En **Settings → Pages** aparecerá la URL publicada.

## D. Conectar la app a Google Sheets
1. Abre la URL pública de GitHub Pages.
2. Entra en **Mis datos** dentro de la app.
3. En la tarjeta **Sincronización con Google Sheets**, pega la URL `/exec` de Apps Script y la misma clave que pusiste en `API_TOKEN`.
4. Pulsa **Guardar conexión**.
5. Si ya tenías jornadas guardadas localmente y quieres conservarlas, pulsa primero **Subir registros**. Esto reemplaza el contenido de las pestañas `Jornadas` y `Capturas` con los registros locales.
6. Si la hoja ya tiene registros y quieres recuperarlos en este dispositivo, pulsa **Cargar desde Sheets**. Atención: esta acción sustituye la copia local del navegador por los registros de la nube.
7. Al guardar nuevas jornadas, la app intentará sincronizarlas automáticamente. Revisa la hoja para confirmar que se han guardado.

## E. Instalar en el iPhone
1. Abre la URL de GitHub Pages en **Safari** (no dentro de un navegador integrado de otra app).
2. Pulsa **Compartir** → **Añadir a pantalla de inicio**.
3. Abre Diario de Pesca desde el nuevo icono.

## Cómo se organizan los datos
- `Jornadas`: una fila por salida, con columnas legibles y una columna `registro_json` que conserva todos los campos.
- `Capturas`: una fila por especie capturada en cada jornada.
- La app conserva además una copia local en el navegador.

## Importante
- No compartas la clave de Apps Script. No la incluyas en archivos del repositorio público.
- La clave compartida entre app y Apps Script es una protección básica, no un sistema de autenticación avanzado. La URL de Apps Script y la clave se guardan localmente en el navegador donde configures la app.
- Cada sincronización completa reemplaza el contenido de las dos pestañas con la lista local enviada. En un segundo dispositivo, pulsa **Cargar desde Sheets antes de empezar a registrar**. Evita usar simultáneamente dos dispositivos sin cargar primero la versión más reciente.
- Haz una exportación JSON periódica desde Ajustes como copia adicional.
- No guardes información especialmente sensible en la app.


ACTUALIZACION v0.4
La app incluye ahora el campo Actividad marina y el checklist de especies grandes avistadas. Para que las dos nuevas columnas aparezcan separadas en Google Sheets, sustituye el codigo de Apps Script por el Code.gs incluido y crea una nueva version del despliegue (Deploy > Manage deployments > Edit > New version > Deploy). La app guarda estos campos dentro de registro_json incluso antes de actualizar Apps Script.
