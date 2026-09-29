# Próximas mejoras — multi-cliente / instanciable

Idea: que este proyecto deje de ser "el panel de SUPER JOSE" y pase a ser una base que se pueda
instanciar para otros clientes, configurando en vez de editando código.

## Qué ya es configurable hoy (sin tocar código)

- Sucursales: lista dinámica vía `SUCURSALES` env var + `SUCURSAL_<ID>_NOMBRE` (`server/src/config/sucursales.ts`).
- Conexión SQL Server por sucursal: `DB_<SUC>_SERVER/PORT/DATABASE/USER/PASSWORD` (`server/src/db/config.ts`).
- Usuarios de login por sucursal: `LOGIN_<SUC>_USER/PASSWORD` + admin (`server/src/auth/usuarios.ts`).
- Branding: `nombreCliente`, `logoUrl`, `faviconUrl`, `colorPrimary`, `refrescoMinutos` vía `/api/config` (`lib/tenant.tsx`).

Esto ya cubre "mismo esquema de base, otro cliente" razonablemente bien.

## Qué bloquea instanciar para un cliente con otro esquema de base

1. **Queries SQL hardcodeadas al esquema de SUPER JOSE** (`server/src/repositorio/ventas.ts`,
   `anulados.ts`): tablas/columnas fijas (`sp_vtas_mes`, `EVENTOS`, `cuptar`, `mppuntos`/`mpagos`,
   `gr2_600`). No hay capa de abstracción — para otro cliente con esquema distinto (como ya pasa
   entre R.C. y SUPER JOSE, ver `../CLAUDE.md`) hay que reescribir el repositorio entero, no
   configurarlo.
   - Pregunta abierta: ¿el esquema `cuptar`/`mppuntos`/`gr2_600` es de un ERP/POS común a varios
     supermercados en Argentina, o específico de SUPER JOSE? Si es común (parece un sistema de
     gestión de retail estándar), vale la pena, porque varios clientes potenciales compartirían
     el mismo repositorio sin cambios.

2. **Único motor de base soportado**: `mssql`/tedious a mano, sin capa que permita otro motor
   (Postgres/MySQL) si algún cliente futuro no usa SQL Server.

3. **Códigos de negocio hardcodeados en el código, no en config**: ejemplo reciente, el filtro de
   `tipo <> 'R'` en `ventasTarjetas` (retenciones de `mpagos`) asume la tabla maestra de medios de
   pago de SUPER JOSE. Otro cliente con otra tabla maestra rompe esta query sin tocar nada de
   config.

4. **Setup manual y propenso a error**: para dar de alta una sucursal hoy hay que tocar ~6 env
   vars (`DB_*` x5 + `LOGIN_*` x2 + `SUCURSAL_*_NOMBRE`) a mano, sin validación, y reiniciar el
   proceso (`tsx watch` no relee `.env` en caliente). No hay:
   - Un comando/script que valide que las variables de una sucursal nueva estén completas.
   - Una pantalla o endpoint de healthcheck que confirme que cada sucursal conecta antes de
     ponerla en producción (hoy el error se descubre recién cuando falla un dashboard en vivo).

5. **Sin locale/moneda configurable**: `lib/formato.ts` asume `es-AR` y `$` fijos. Un cliente
   fuera de Argentina necesitaría tocar código.

## Posibles próximos pasos (sin comprometerse a ninguno todavía)

- Definir si el esquema de datos (`cuptar`, `mppuntos`, etc.) es realmente un estándar de mercado
  o propio de SUPER JOSE — esto cambia mucho el esfuerzo de "instanciar para cliente nuevo".
- Si es estándar: el repositorio de queries ya sirve tal cual, el trabajo real es solo
  configuración (env vars) + ese setup manual habría que simplificarlo (punto 4).
- Si no es estándar: pensar una interfaz de "repositorio" (tipo `VentasRepository`) con una
  implementación por esquema de cliente, elegida por config — recién ahí vale la pena, no antes
  (regla de las 3 veces: hoy hay 1 solo cliente real implementado).
- Sacar los códigos de negocio tipo `tipo <> 'R'` a config por cliente en vez de hardcodeados,
  si se confirma que varios clientes van a necesitar exclusiones distintas.
