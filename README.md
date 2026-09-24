# Panel Estadístico

Panel estadístico de solo lectura contra bases SQL Server operativas por sucursal. Stack: React 19 + TypeScript + Vite + Tailwind + shadcn/ui (cliente), Express + TypeScript + mssql (server).

## Requisitos

- Node.js 20+
- Acceso a las bases SQL Server de cada sucursal

## Instalación

```bash
git clone <url-del-repo>
cd dashboard-supermercado-estadistica
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## Configuración

```bash
cp server/.env.example server/.env
```

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

- Client: http://localhost:5173
- Server: http://localhost:3001 (proxeado por Vite bajo `/api`)

`tsx watch` no relee `.env` en caliente — si se edita a mano, hay que reiniciar el proceso del server.

## Build / producción

```bash
cd server && npm run build && npm start   # compila a dist/ y corre con node
cd client && npm run build                # build estático en client/dist
```

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

No hay test suite ni linter configurado todavía.
