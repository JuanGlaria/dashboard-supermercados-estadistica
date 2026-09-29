# Memoria del proyecto — SUPER JOSE (panel estadístico)

Alternativa moderna al proyecto original `SuperRCDash`/`SJ-dashboard` (Node/Express/Nunjucks/mssql).
Mismo alcance funcional, stack actual.

## Stack

- **Client**: React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui (preset Nova, radix) + Recharts + react-router-dom. Sin Redux, estado con Context/useState.
- **Server**: Express + TypeScript + `mssql` (tedious), JWT en cookie httpOnly, sin ORM. Repositorio simple por función de negocio (`repositorio/ventas.ts`, `repositorio/anulados.ts`).
- **Monolito**: dos carpetas (`client/`, `server/`), sin workspace tooling. `npm run dev` en la raíz levanta ambos (`(cd server && npm run dev) & (cd client && npm run dev) & wait`).

## Estructura

```
server/src/
  auth/       jwt.ts, middleware.ts, usuarios.ts (4 usuarios fijos: lavalle, savio, somisa, ivan=todas)
  db/         config.ts (conexión por sucursal desde .env), pool.ts (pool por sucursal)
  repositorio/ ventas.ts, anulados.ts — queries SQL reales (sp_vtas_mes, tabla EVENTOS, cuptar, mppuntos)
  rutas/      auth.ts, dashboard.ts, anulados.ts

client/src/
  components/ AppShell.tsx (sidebar+topbar+toggle), Sidebar.tsx, ChartCard.tsx, KpiCard.tsx, BarraProgreso.tsx
  components/ui/ shadcn (button, card, input, label)
  pages/      LoginPage, SelectorSucursalPage, DashboardPage, AnuladosPage
  lib/        api.ts (fetch wrapper), auth.tsx (AuthContext), formato.ts (moneda/fecha)
  index.css   tokens de diseño (paleta teal/navy calcada del proyecto real SJ-dashboard)
```

## Diseño

- Paleta copiada del proyecto real (`SJ-dashboard`, Gentelella-based): teal `#0e8069` (primary, ajustado de `#1ABB9C` original por contraste WCAG AA), navy `#2c3e50`/`#34495E`, rojo `#E74C3C` (destructive), fuente Poppins.
- `--muted-foreground: #5b6b7d` (ajustado, el original `#73879C` fallaba contraste).
- Charts: paleta categórica validada con skill `dataviz` (orden fijo, sin ciclar).
- Sidebar responsive: colapsa en mobile (overlay+hamburger) y es togglable en cualquier ancho vía un solo botón (`PanelLeftClose`/`PanelLeftOpen` en el header). KPI grid usa **container queries** (`@5xl:grid-cols-4`) en vez de media queries, porque el ancho de contenido depende de si el sidebar está abierto, no solo del viewport.

## Auth

- Login: usuario/password fijos en `server/src/auth/usuarios.ts`, leídos de `.env` (`LOGIN_<SUCURSAL>_USER/PASSWORD`).
- JWT: 7 días de duración (`server/src/auth/jwt.ts`), cookie httpOnly `maxAge` igual.
- **Ojo**: `tsx watch` no relee `.env` en caliente al editarlo a mano — hay que reiniciar el proceso del server.

## Skill de proyecto

`.claude/skills/auditoria-design/` — audita colores/tokens/a11y puntual contra `client/src/index.css`, adaptada de una skill de otro proyecto (`erp-transporte`, Bootstrap/nunjucks) a este stack (React/Tailwind/shadcn). No está en git (`.gitignore`).

## Pendiente / no implementado

- Detalle de ticket individual en la UI de Anulados (endpoint `/api/anulados/:sucursal/ticket/:nticket` ya existe, falta pantalla).
- Roles ARIA en los charts de Recharts (accesibilidad estructural, no un fix puntual).
- `--color-navy-deep` como token de texto: se usó por error 3 veces en vez de `--foreground` (mismo hex) — ya corregido en todos, pero valdría la pena sacarlo como token de texto y dejarlo solo para fondos.

## Cómo correr

```
npm run dev            # desde la raíz, levanta client (:5173) y server (:3001)
```

Necesita `server/.env` con datos reales de SQL Server por sucursal (no versionado, ver `server/.env.example`).

## Git

Commit inicial: `267e734`. `.gitignore` excluye `node_modules/`, `dist/`, `.env`, `.playwright-mcp/`, `.claude/`.

## Historial de esta sesión (para retomar tras `/clear`)

1. **Planificación**: definimos stack (React+Vite+TS+Tailwind+shadcn / Express+TS+mssql, sin ORM, monolito de 2 carpetas) reemplazando la propuesta original de Nunjucks/EJS. Usuario pidió sin framework "grande" (nada de Next), shadcn/ui para componentes, sin Redux.
2. **Scaffold**: `npm create vite`, Tailwind v4, shadcn (preset Nova/radix — hubo que arreglar a mano porque el CLI puso archivos en `./@/` en vez de `src/`), Express+TS con `tsx watch`, pool de conexión por sucursal, JWT en cookie httpOnly.
3. **Config de prueba**: `.env` con usuarios de test (usuario `ivan` y otros, contraseñas solo en `.env`), proxy de Vite a `:3001`, verificado login end-to-end con curl y Playwright.
4. **Login UI**: pantalla con shadcn, botón mostrar/ocultar clave.
5. **Duración de token**: subida de 12h a 7 días (usuario reportó reexpiraba rápido — en realidad era el `.env` recargado con `JWT_SECRET` distinto tras editarlo a mano, no un bug de código).
6. **Gráficos reales**: leímos el código del proyecto original (`references/SuperRCDash` y el real `SJ-dashboard`) para sacar las queries SQL reales (`sp_vtas_mes`, tabla `EVENTOS`, `cuptar`, `mppuntos`) y las implementamos en `repositorio/ventas.ts` y `repositorio/anulados.ts`. Debug de un caso real: Somisa no conectaba porque el server tenía el `.env` viejo en memoria (puerto `3341` vs `33341` correcto) — hay que reiniciar `tsx watch` cuando se edita `.env` a mano.
7. **Comparación visual con el sistema real**: se corrió el proyecto real `SJ-dashboard` (`localhost:4001`) al lado del nuestro y se rediseñó todo (`Sidebar`, `AppShell`, paleta de colores, tipografía Poppins, `BarraProgreso` en vez de bar charts, área en vez de líneas) para que se parezca. Se creó la skill `.claude/skills/auditoria-design` adaptada de una skill de otro proyecto del usuario (`erp-transporte`).
8. **Pantalla de Anulados**: al principio solo mostraba una sucursal a la vez; se agregó un resumen con tiles de todas las sucursales (endpoint `/api/anulados/resumen`) porque el original las muestra juntas.
9. **`/impeccable audit`** (dos rondas): encontró y arreglamos sidebar roto en mobile, contraste de `--muted-foreground` y de `--primary` (bajo WCAG AA), jerarquía de headings, colores hardcodeados, bundle sin code-splitting. Se instaló `puppeteer` (aprobado explícitamente) para poder correr el detector mecánico contra la app viva.
10. **`/auditoria-design`** corrida en las 4 páginas: encontró 3 veces el mismo bug (`text-navy-deep` en vez de `text-foreground`, duplicaban el mismo hex) y un botón "Cerrar sesión" con estilos inconsistentes entre `Sidebar` y `SelectorSucursalPage`.
11. **`/impeccable adapt`**: pase de responsive mobile completo — `BarraProgreso` rediseñada (el fix más importante: en mobile las barras quedaban de ~47px, ilegibles), botones/tiles con overflow horizontal arreglados, touch targets a 44px.
12. **Sidebar togglable en cualquier ancho**: antes solo se podía ocultar en mobile; ahora un solo botón (`PanelLeftClose`/`PanelLeftOpen`) lo hace en cualquier tamaño de pantalla, con estado inicial según viewport al montar.
13. **Bug de KPIs cortados**: al hacer el sidebar togglable a cualquier ancho, el grid de KPIs (basado en `md:` viewport) se rompía en anchos intermedios (~950px) porque el contenido real es más angosto que el viewport cuando el sidebar está abierto. Se solucionó con **container queries** (`@container` + `@5xl:grid-cols-4`) en vez de media queries.
14. **Commit inicial** (`267e734`): se armó `.gitignore` (excluyendo `.playwright-mcp/` y `.claude/` además de lo estándar) y se commiteó todo el proyecto.

### Cosas para tener en cuenta si seguís en otra sesión
- Server y client corren en background (`npm run dev` desde la raíz, o procesos sueltos en `:3001`/`:5173`) — puede que ya no estén corriendo si pasó tiempo; revisar con `curl localhost:3001` / `:5173` antes de asumir.
- Si algo de datos "no anda" después de tocar `.env`, lo primero es reiniciar el proceso del server (no relee en caliente).
- El patrón `text-navy-deep`/`bg-white`/`text-white` hardcodeado ya se limpió en todo el código auditado hasta ahora — si aparece de nuevo en código nuevo, usar `text-foreground`/tokens en vez de repetirlo.
