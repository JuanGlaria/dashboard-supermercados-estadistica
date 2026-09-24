import type { config as MssqlConfig } from 'mssql'
import { SUCURSAL_IDS, type Sucursal } from '../config/sucursales.js'

export type { Sucursal }

function configSucursal(sucursal: Sucursal): MssqlConfig {
  const prefix = `DB_${sucursal.toUpperCase()}`
  return {
    server: process.env[`${prefix}_SERVER`]!,
    port: Number(process.env[`${prefix}_PORT`] ?? 1433),
    database: process.env[`${prefix}_DATABASE`],
    user: process.env[`${prefix}_USER`],
    password: process.env[`${prefix}_PASSWORD`],
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  }
}

export const dbConfigs: Record<Sucursal, MssqlConfig> = Object.fromEntries(
  SUCURSAL_IDS.map((id) => [id, configSucursal(id)]),
)
