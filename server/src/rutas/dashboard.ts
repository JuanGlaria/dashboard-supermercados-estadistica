import { Router } from 'express'
import { parseFechaQuery } from '../common/fechas.js'
import type { Sucursal } from '../db/config.js'
import { getPool } from '../db/pool.js'
import { getDashboardVentas } from '../repositorio/ventas.js'
import { requiereAccesoSucursal, requiereLogin } from '../auth/middleware.js'

export const dashboardRouter = Router()

dashboardRouter.get('/:sucursal', requiereLogin, requiereAccesoSucursal, async (req, res) => {
  try {
    const pool = await getPool(req.params.sucursal as Sucursal)
    const datos = await getDashboardVentas(pool, parseFechaQuery(req.query.fecha))
    res.json(datos)
  } catch (err) {
    console.error(err)
    res.status(502).json({ error: 'No se pudo conectar a la sucursal' })
  }
})
