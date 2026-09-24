import sql from 'mssql'
import { dbConfigs, SUCURSALES, type Sucursal } from './config.js'

const pools = new Map<Sucursal, sql.ConnectionPool>()

export async function getPool(sucursal: Sucursal): Promise<sql.ConnectionPool> {
  let pool = pools.get(sucursal)
  if (pool?.connected) return pool

  pool = await new sql.ConnectionPool(dbConfigs[sucursal]).connect()
  pool.on('error', (err: Error) => {
    console.error(`[db:${sucursal}] error de pool`, err)
  })
  pools.set(sucursal, pool)
  return pool
}

export async function cerrarPools(): Promise<void> {
  await Promise.all(SUCURSALES.map((s) => pools.get(s)?.close()))
}
