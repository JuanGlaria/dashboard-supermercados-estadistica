import sql, { type ConnectionPool } from 'mssql'
import { aISO, hoy, sumarDias } from '../common/fechas.js'

export type PuntoAnuladosDia = { fecha: string; anulados: number }

async function historicoAnulados(
  pool: ConnectionPool,
  desde: Date,
  hasta: Date,
): Promise<PuntoAnuladosDia[]> {
  const result = await pool
    .request()
    .input('desde', sql.Date, desde)
    .input('hasta', sql.Date, hasta)
    .query<{ Fecha: Date; Anulados: number }>(`
      SELECT MAX(fecha) AS Fecha, COUNT(nticket) AS Anulados
      FROM EVENTOS
      WHERE fecha BETWEEN @desde AND @hasta AND LEFT(Evento, 2) = '(A'
      GROUP BY fecha
      ORDER BY fecha ASC
    `)
  return result.recordset.map((r) => ({ fecha: aISO(r.Fecha), anulados: r.Anulados }))
}

export async function totalAnuladosDia(pool: ConnectionPool, fecha: Date): Promise<number> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{ cantidad: number }>(`
      SELECT COUNT(CASE WHEN LEFT(Evento, 2) = '(A' THEN nticket END) AS cantidad
      FROM EVENTOS
      WHERE fecha = @fecha
    `)
  return result.recordset[0]?.cantidad ?? 0
}

export type RankingCajero = { codigo: number; nombre: string; anulados: number }

async function rankingCajeros(pool: ConnectionPool, desde: Date, hasta: Date): Promise<RankingCajero[]> {
  const result = await pool
    .request()
    .input('desde', sql.Date, desde)
    .input('hasta', sql.Date, hasta)
    .query<{ CodCajero: number; Anulados: number; NombCajero: string | null }>(`
      SELECT TOP 10
        MAX(a.cajero) AS CodCajero,
        COUNT(a.nticket) AS Anulados,
        MAX(b.ven_nomb) AS NombCajero
      FROM EVENTOS a
      LEFT JOIN gr2_600 b ON b.ven_codi = a.cajero
      WHERE fecha BETWEEN @desde AND @hasta AND LEFT(Evento, 2) = '(A'
      GROUP BY cajero
      ORDER BY Anulados DESC
    `)
  return result.recordset.map((r) => ({
    codigo: r.CodCajero,
    nombre: r.NombCajero?.trim() ?? `Cajero ${r.CodCajero}`,
    anulados: r.Anulados,
  }))
}

export type Anulados = {
  historico: PuntoAnuladosDia[]
  totalHoy: number
  rankingHoy: RankingCajero[]
  ranking14Dias: RankingCajero[]
}

export async function getAnulados(pool: ConnectionPool): Promise<Anulados> {
  const fechaHoy = hoy()
  const hace14Dias = sumarDias(fechaHoy, -13)

  const [historico, totalHoy, rankingHoy, ranking14Dias] = await Promise.all([
    historicoAnulados(pool, hace14Dias, fechaHoy),
    totalAnuladosDia(pool, fechaHoy),
    rankingCajeros(pool, fechaHoy, fechaHoy),
    rankingCajeros(pool, hace14Dias, fechaHoy),
  ])

  return { historico, totalHoy, rankingHoy, ranking14Dias }
}

export type EventoTicket = { canti: number; nombre: string; marca: string | null; preciou: number; preciot: number }

export async function getDetalleTicket(
  pool: ConnectionPool,
  nticket: number,
  letra: string,
  caja: number,
): Promise<{ items: EventoTicket[]; total: number }> {
  const result = await pool
    .request()
    .input('nticket', sql.Int, nticket)
    .input('letra', sql.Char, letra)
    .input('caja', sql.Int, caja)
    .query<EventoTicket>(`
      SELECT canti, st_larga AS nombre, ma_nombre AS marca, preciou, preciot
      FROM Avepuntos
      LEFT JOIN stock ON stock.st_interno = interno
      LEFT JOIN marcas ON ma_codigo = stock.st_marc
      WHERE nticket = @nticket AND letra = @letra AND caja = @caja
    `)
  const total = result.recordset.reduce((sum, item) => sum + item.preciot, 0)
  return { items: result.recordset, total: Math.floor(total) }
}

export async function getHistorialCajero(
  pool: ConnectionPool,
  codigoCajero: number,
): Promise<{ fecha: string; nticket: number }[]> {
  const fechaHoy = hoy()
  const hace14Dias = sumarDias(fechaHoy, -13)
  const result = await pool
    .request()
    .input('desde', sql.Date, hace14Dias)
    .input('hasta', sql.Date, fechaHoy)
    .input('cajero', sql.Int, codigoCajero)
    .query<{ fecha: Date; nticket: number }>(`
      SELECT fecha, nticket
      FROM EVENTOS
      WHERE fecha BETWEEN @desde AND @hasta AND LEFT(Evento, 2) = '(A' AND cajero = @cajero
      ORDER BY fecha DESC
    `)
  return result.recordset.map((r) => ({ fecha: aISO(r.fecha), nticket: r.nticket }))
}
