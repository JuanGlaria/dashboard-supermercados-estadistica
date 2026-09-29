# Panel Estadístico

Panel estadístico de solo lectura contra bases SQL Server operativas por sucursal. Stack: React 19 + TypeScript + Vite + Tailwind + shadcn/ui (cliente), Express + TypeScript + mssql (server).

## Requisitos

- Node.js 20+ (en el servidor se usa 22.18.0 vía nvm)
- Acceso a las bases SQL Server de cada sucursal

## Instalación

```bash
git clone <url-del-repo>
cd dashboard-supermercado-estadistica
```

**Desarrollo:**

```bash
cd server && npm install && cd ..
cd client && npm install && cd ..
```

**Producción** (servidor con varias versiones de Node, usar 22.18.0 vía nvm):

```bash
source ~/.nvm/nvm.sh
cd server && nvm exec 22.18.0 npm install && cd ..
cd client && nvm exec 22.18.0 npm install && cd ..
```

No usar `npm install` a secas en el servidor: tomaría el Node por defecto del sistema, que puede ser otra versión. Si falta la versión: `nvm install 22.18.0`.

## Configuración

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env   # solo desarrollo
```

`client/.env` define `CLIENT_PORT` (dev server de Vite, default 5173) y `SERVER_PORT` (debe coincidir con `PORT` de `server/.env`, default 3001). Si un puerto está ocupado, cambiarlo ahí.

Completar `server/.env` con:

- **`SUCURSALES`**: lista de ids separados por coma (ej. `lavalle,savio,somisa`). Cada id define el resto de sus propias variables:
  - `DB_<ID>_SERVER` / `_PORT` / `_DATABASE` / `_USER` / `_PASSWORD` — conexión SQL Server de esa sucursal.
  - `LOGIN_<ID>_USER` / `_PASSWORD` — usuario que ve solo esa sucursal.
  - `SUCURSAL_<ID>_NOMBRE` — nombre para mostrar (opcional, si se omite usa el id capitalizado).
- **`LOGIN_ADMIN_USER`** / **`LOGIN_ADMIN_PASSWORD`** — usuario que ve todas las sucursales.
- **`JWT_SECRET`** — secreto para firmar la sesión (cambiar el valor de ejemplo).
- **Branding** (todo opcional, cae a defaults genéricos si se omite): `NOMBRE_CLIENTE`, `LOGO_URL`, `FAVICON_URL`, `COLOR_PRIMARY`.
- **`REFRESCO_MINUTOS`** — auto-refresh del dashboard (vacío o `0` = desactivado).

## Correr en desarrollo

Desde la raíz, levanta client y server en paralelo:

```bash
npm run dev
```

- Client: `http://localhost:<CLIENT_PORT>`
- Server: `http://localhost:<PORT>` (proxeado por Vite bajo `/api`)

`tsx watch` no relee `.env` en caliente — si se edita a mano, hay que reiniciar el proceso del server.

## Build / producción

```bash
cd server && npm run build && npm start   # compila a dist/ y corre con node
cd client && npm run build                # build estático en client/dist
```

### Deploy detrás de nginx (subpath `/dash`)

Build del client con prefijo: `cd client && VITE_BASE=/dash/ npm run build`.

En `server/.env` (además de lo de arriba): `NODE_ENV=production`, `COOKIE_PATH=/dash`, `TZ=America/Argentina/Buenos_Aires`. El server arranca solo si están todas las variables requeridas; si falta alguna, lista cuáles y sale.

nginx sirve el estático y proxea `/dash/api/` al server (strippeando `/dash`):

```nginx
location /dash/api/ { proxy_pass http://127.0.0.1:<PORT>/api/; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
location /dash/ { alias /ruta/al/client/dist/; try_files $uri $uri/ /dash/index.html; }
```

Sin subpath (raíz o subdominio): build sin `VITE_BASE` y `COOKIE_PATH=/`.

### Correr el server con pm2 y Node 22.18.0

pm2 usa por defecto el Node del `PATH`. Para forzar la versión, se le pasa la ruta exacta del binario con `--interpreter`, y se lo arranca **desde `server/`** (el server lee `server/.env` desde el directorio actual).

```bash
source ~/.nvm/nvm.sh
cd /ruta/al/repo/server                      # ajustar a la ruta real
pm2 start dist/index.js --name sj-panel --interpreter ~/.nvm/versions/node/v22.18.0/bin/node
pm2 save                                     # persiste la lista de procesos
```

Verificar que quedó con la versión correcta:

```bash
pm2 describe sj-panel | grep -i "interpreter"   # debe mostrar .../v22.18.0/bin/node
pm2 logs sj-panel --lines 20                     # debe decir "Server escuchando en puerto ..."
```

Para arrancar solo tras un reinicio del VPS: `pm2 startup` (ejecutar el comando que imprime) y luego `pm2 save`.

Actualizar una versión nueva del código:

```bash
cd /ruta/al/repo && git pull
cd server && nvm exec 22.18.0 npm install && nvm exec 22.18.0 npm run build
pm2 restart sj-panel --update-env
cd ../client && VITE_BASE=/dash/ nvm exec 22.18.0 npm run build   # solo si hay cambios en client/
```

Cambiar de versión de Node: `pm2 delete sj-panel`, volver a instalar y compilar con la nueva versión (`nvm exec <versión> ...`) y arrancar de nuevo con `--interpreter ~/.nvm/versions/node/v<versión>/bin/node`.

## Estructura

```
server/src/
  auth/         JWT, login, middleware de autorización por sucursal
  config/       sucursales (desde SUCURSALES) y branding (tenant.ts)
  db/           pool de conexión mssql por sucursal
  repositorio/  queries SQL (ventas, anulados)
  rutas/        endpoints Express

client/src/
  components/   AppShell, Sidebar, charts, diálogos
  pages/        Login, selector de sucursal, Dashboard, Anulados, 404
  lib/          fetch wrapper, auth/tenant context, formato
```
