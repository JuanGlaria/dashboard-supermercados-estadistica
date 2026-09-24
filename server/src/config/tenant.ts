import { SUCURSALES } from './sucursales.js'

export type TenantConfig = {
  nombreCliente: string
  logoUrl: string | null
  faviconUrl: string | null
  colorPrimary: string | null
  refrescoMinutos: number | null
  sucursales: typeof SUCURSALES
}

export function getTenantConfig(): TenantConfig {
  const refrescoMinutos = Number(process.env.REFRESCO_MINUTOS)
  return {
    nombreCliente: process.env.NOMBRE_CLIENTE || 'Panel Estadístico',
    logoUrl: process.env.LOGO_URL || null,
    faviconUrl: process.env.FAVICON_URL || null,
    colorPrimary: process.env.COLOR_PRIMARY || null,
    refrescoMinutos: refrescoMinutos > 0 ? refrescoMinutos : null,
    sucursales: SUCURSALES,
  }
}
