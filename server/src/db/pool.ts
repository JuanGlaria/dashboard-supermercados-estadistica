import sql from 'mssql'
import { dbCasaCentral, dbConfigs, type Sucursal } from './config.js'
import { SUCURSAL_IDS } from '../config/sucursales.js'

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

let poolCasaCentral: sql.ConnectionPool | undefined

export async function getPoolCasaCentral(): Promise<sql.ConnectionPool> {
  if (poolCasaCentral?.connected) return poolCasaCentral

  poolCasaCentral = await new sql.ConnectionPool(dbCasaCentral).connect()
  poolCasaCentral.on('error', (err: Error) => {
    console.error('[db:casa_central] error de pool', err)
  })
  return poolCasaCentral
}

export async function cerrarPools(): Promise<void> {
  await Promise.all([...SUCURSAL_IDS.map((s) => pools.get(s)?.close()), poolCasaCentral?.close()])
}
