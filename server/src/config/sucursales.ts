export type Sucursal = string

export type SucursalInfo = { id: Sucursal; nombre: string }

export const SUCURSALES: SucursalInfo[] = (process.env.SUCURSALES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((id) => ({
    id,
    nombre: process.env[`SUCURSAL_${id.toUpperCase()}_NOMBRE`] ?? id.charAt(0).toUpperCase() + id.slice(1),
  }))

export const SUCURSAL_IDS: Sucursal[] = SUCURSALES.map((s) => s.id)
