import type { config as MssqlConfig } from 'mssql'

export type Sucursal = 'lavalle' | 'savio' | 'somisa'

export const SUCURSALES: Sucursal[] = ['lavalle', 'savio', 'somisa']

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

export const dbConfigs: Record<Sucursal, MssqlConfig> = {
  lavalle: configSucursal('lavalle'),
  savio: configSucursal('savio'),
  somisa: configSucursal('somisa'),
}
