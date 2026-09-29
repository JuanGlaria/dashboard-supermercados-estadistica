import type { config as MssqlConfig } from 'mssql'
import { SUCURSAL_IDS, type Sucursal } from '../config/sucursales.js'

export type { Sucursal }

function configDesdePrefijo(prefix: string): MssqlConfig {
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
  SUCURSAL_IDS.map((id) => [id, configDesdePrefijo(`DB_${id.toUpperCase()}`)]),
)

export const dbCasaCentral: MssqlConfig = configDesdePrefijo('DB_CASA_CENTRAL')
