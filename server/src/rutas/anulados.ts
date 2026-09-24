import { Router } from 'express'
import { hoy } from '../common/fechas.js'
import type { Sucursal } from '../db/config.js'
import { getPool } from '../db/pool.js'
import { getAnulados, getDetalleTicket, getHistorialCajero, totalAnuladosDia } from '../repositorio/anulados.js'
import { requiereAccesoSucursal, requiereLogin } from '../auth/middleware.js'

export const anuladosRouter = Router()

anuladosRouter.get('/resumen', requiereLogin, async (req, res) => {
  const sucursales = req.usuario!.sucursales === 'todas' ? (['lavalle', 'savio', 'somisa'] as const) : req.usuario!.sucursales
  const fechaHoy = hoy()

  const resumen = await Promise.all(
    sucursales.map(async (s) => {
      try {
        const pool = await getPool(s)
        const totalHoy = await totalAnuladosDia(pool, fechaHoy)
        return { sucursal: s, totalHoy }
      } catch (err) {
        console.error(err)
        return { sucursal: s, totalHoy: null }
      }
    }),
  )
  res.json(resumen)
})

anuladosRouter.get('/:sucursal', requiereLogin, requiereAccesoSucursal, async (req, res) => {
  try {
    const pool = await getPool(req.params.sucursal as Sucursal)
    const datos = await getAnulados(pool)
    res.json(datos)
  } catch (err) {
    console.error(err)
    res.status(502).json({ error: 'No se pudo conectar a la sucursal' })
  }
})

anuladosRouter.get(
  '/:sucursal/cajero/:codigo',
  requiereLogin,
  requiereAccesoSucursal,
  async (req, res) => {
    try {
      const pool = await getPool(req.params.sucursal as Sucursal)
      const historial = await getHistorialCajero(pool, Number(req.params.codigo))
      res.json(historial)
    } catch (err) {
      console.error(err)
      res.status(502).json({ error: 'No se pudo conectar a la sucursal' })
    }
  },
)

anuladosRouter.get(
  '/:sucursal/ticket/:nticket',
  requiereLogin,
  requiereAccesoSucursal,
  async (req, res) => {
    try {
      const { letra, caja } = req.query as { letra?: string; caja?: string }
      if (!letra || !caja) {
        res.status(400).json({ error: 'Faltan parámetros letra/caja' })
        return
      }
      const pool = await getPool(req.params.sucursal as Sucursal)
      const detalle = await getDetalleTicket(pool, Number(req.params.nticket), letra, Number(caja))
      res.json(detalle)
    } catch (err) {
      console.error(err)
      res.status(502).json({ error: 'No se pudo conectar a la sucursal' })
    }
  },
)
