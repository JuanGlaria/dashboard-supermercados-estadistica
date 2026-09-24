import sql, { type ConnectionPool } from 'mssql'
import { aISO, hoy, inicioSemana, sumarDias } from '../common/fechas.js'

type VentaDia = { Dia: Date; final: number }

async function ventasDelDia(pool: ConnectionPool, fecha: Date): Promise<number> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<VentaDia>(
      `EXEC sp_vtas_mes @grupo = 'D', @fe1 = @fecha, @fe2 = @fecha, @CajaD = 0, @CajaH = 9999`,
    )
  return result.recordset[0]?.final ?? 0
}

async function ventasRango(pool: ConnectionPool, desde: Date, hasta: Date): Promise<VentaDia[]> {
  const result = await pool
    .request()
    .input('desde', sql.Date, desde)
    .input('hasta', sql.Date, hasta)
    .query<VentaDia>(
      `EXEC sp_vtas_mes @grupo = 'D', @fe1 = @desde, @fe2 = @hasta, @CajaD = 0, @CajaH = 9999`,
    )
  return result.recordset
}

async function ticketsDelDia(pool: ConnectionPool, fecha: Date): Promise<number> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{ cantidad: number }>(`
      SELECT COUNT(*) AS cantidad FROM (
        SELECT MAX(nticket) AS ticket
        FROM vepuntos
        WHERE fechav = @fecha AND caja <> 0 AND TIKCAN <> 2
        GROUP BY nticket, CAJA, Letra, fechav
      ) AS subquery
    `)
  return result.recordset[0]?.cantidad ?? 0
}

async function cajasActivas(pool: ConnectionPool, fecha: Date): Promise<number> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{ cantidad: number }>(`
      SELECT COUNT(*) AS cantidad FROM (
        SELECT DISTINCT caja FROM vepuntos
        WHERE fechav = @fecha AND caja <> 0 AND TIKCAN <> 2
      ) AS subquery
    `)
  return result.recordset[0]?.cantidad ?? 0
}

async function clientesAtendidos(pool: ConnectionPool, fecha: Date): Promise<number> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{ cantidad: number }>(`
      SELECT COUNT(*) AS cantidad FROM (
        SELECT DISTINCT cod_cli FROM vepuntos
        WHERE fechav = @fecha AND caja <> 0 AND TIKCAN <> 2
      ) AS subquery
    `)
  return result.recordset[0]?.cantidad ?? 0
}

export type MedioPago = { nombre: string; total: number; porcentaje: number }

async function mediosPago(pool: ConnectionPool, fecha: Date, totalDia: number): Promise<MedioPago[]> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{ nombre: string; total: number }>(`
      SELECT MAX(nombre) AS nombre, SUM(monpag) AS total
      FROM mppuntos
      LEFT JOIN mpagos ON mpagos.codigo = mppuntos.npago
      WHERE fectic = @fecha
      GROUP BY npago
      ORDER BY total DESC
    `)
  return result.recordset.map((r) => ({
    nombre: r.nombre?.trim() ?? 'Sin identificar',
    total: r.total,
    porcentaje: totalDia ? Math.round((r.total * 100) / totalDia) : 0,
  }))
}

export type VentaTarjeta = { nombre: string; total: number; porcentaje: number }

async function ventasTarjetas(pool: ConnectionPool, fecha: Date): Promise<VentaTarjeta[]> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{ nombre: string; total: number }>(`
      SELECT MAX(c1_nombre) AS nombre, SUM(c1_monto) AS total
      FROM cuptar
      WHERE c1_fecha = @fecha
      GROUP BY c1_nombre
      ORDER BY total DESC
    `)
  const max = result.recordset[0]?.total ?? 0
  return result.recordset.map((r) => ({
    nombre: r.nombre?.trim() ?? 'Sin identificar',
    total: r.total,
    porcentaje: max ? Math.round((r.total * 100) / max) : 0,
  }))
}

export type EventosTickets = {
  anulados: number
  editados: number
  descuentos: number
  personalizados: number
  incompletos: number
  total: number
}

async function eventosTickets(pool: ConnectionPool, fecha: Date): Promise<EventosTickets> {
  const result = await pool
    .request()
    .input('fecha', sql.Date, fecha)
    .query<{
      count_A: number
      count_E: number
      count_D: number
      count_P: number
      count_I: number
      total_count: number
    }>(`
      SELECT COUNT(CASE WHEN LEFT(Evento, 2) = '(A' THEN nticket END) AS count_A,
             COUNT(CASE WHEN LEFT(Evento, 2) = '(E' THEN nticket END) AS count_E,
             COUNT(CASE WHEN LEFT(Evento, 2) = '(D' THEN nticket END) AS count_D,
             COUNT(CASE WHEN LEFT(Evento, 2) = '(P' THEN nticket END) AS count_P,
             COUNT(CASE WHEN LEFT(Evento, 2) = '(I' THEN nticket END) AS count_I,
             COUNT(CASE WHEN LEFT(Evento, 2) IN ('(A', '(E', '(D', '(P', '(I') THEN nticket END) AS total_count
      FROM EVENTOS
      WHERE fecha = @fecha
    `)
  const r = result.recordset[0]
  return {
    anulados: r?.count_A ?? 0,
    editados: r?.count_E ?? 0,
    descuentos: r?.count_D ?? 0,
    personalizados: r?.count_P ?? 0,
    incompletos: r?.count_I ?? 0,
    total: r?.total_count ?? 0,
  }
}

export type PuntoVentaDia = { fecha: string; total: number }

function completarSemana(inicio: Date, ventas: VentaDia[]): PuntoVentaDia[] {
  const dias: PuntoVentaDia[] = []
  for (let i = 0; i < 7; i++) {
    const fecha = aISO(sumarDias(inicio, i))
    const venta = ventas.find((v) => aISO(v.Dia) === fecha)
    dias.push({ fecha, total: venta?.final ?? 0 })
  }
  return dias
}

export type DashboardVentas = {
  ventasHoy: number
  ventasAyer: number
  variacionVentas: number
  ticketsHoy: number
  ticketsAyer: number
  variacionTickets: number
  cajasActivas: number
  clientesAtendidos: number
  ventasUltimosDias: PuntoVentaDia[]
  semanaActual: PuntoVentaDia[]
  semanaPasada: PuntoVentaDia[]
  mediosPago: MedioPago[]
  ventasTarjetas: VentaTarjeta[]
  eventosTickets: EventosTickets
}

export async function getDashboardVentas(pool: ConnectionPool): Promise<DashboardVentas> {
  const fechaHoy = hoy()
  const fechaAyer = sumarDias(fechaHoy, -1)
  const inicioSemanaActual = inicioSemana(fechaHoy)
  const inicioSemanaPasada = sumarDias(inicioSemanaActual, -7)
  const finSemanaPasada = sumarDias(inicioSemanaPasada, 6)

  const [
    ventasHoy,
    ventasAyer,
    ticketsHoy,
    ticketsAyer,
    cajas,
    clientes,
    ultimosDiasRaw,
    semanaActualRaw,
    semanaPasadaRaw,
    pagos,
    tarjetas,
    eventos,
  ] = await Promise.all([
    ventasDelDia(pool, fechaHoy),
    ventasDelDia(pool, fechaAyer),
    ticketsDelDia(pool, fechaHoy),
    ticketsDelDia(pool, fechaAyer),
    cajasActivas(pool, fechaHoy),
    clientesAtendidos(pool, fechaHoy),
    ventasRango(pool, sumarDias(fechaHoy, -6), fechaHoy),
    ventasRango(pool, inicioSemanaActual, fechaHoy),
    ventasRango(pool, inicioSemanaPasada, finSemanaPasada),
    mediosPago(pool, fechaHoy, 0),
    ventasTarjetas(pool, fechaHoy),
    eventosTickets(pool, fechaHoy),
  ])

  const ventasUltimosDias: PuntoVentaDia[] = []
  for (let i = -6; i <= 0; i++) {
    const fecha = aISO(sumarDias(fechaHoy, i))
    const venta = ultimosDiasRaw.find((v) => aISO(v.Dia) === fecha)
    ventasUltimosDias.push({ fecha, total: venta?.final ?? 0 })
  }

  const totalHoyParaPorcentaje = ventasHoy
  const pagosConPorcentaje = pagos.map((p) => ({
    ...p,
    porcentaje: totalHoyParaPorcentaje ? Math.round((p.total * 100) / totalHoyParaPorcentaje) : 0,
  }))

  return {
    ventasHoy,
    ventasAyer,
    variacionVentas: ventasAyer ? Math.round(((ventasHoy - ventasAyer) * 100) / ventasAyer) : 0,
    ticketsHoy,
    ticketsAyer,
    variacionTickets: ticketsAyer ? Math.round(((ticketsHoy - ticketsAyer) * 100) / ticketsAyer) : 0,
    cajasActivas: cajas,
    clientesAtendidos: clientes,
    ventasUltimosDias,
    semanaActual: completarSemana(inicioSemanaActual, semanaActualRaw),
    semanaPasada: completarSemana(inicioSemanaPasada, semanaPasadaRaw),
    mediosPago: pagosConPorcentaje,
    ventasTarjetas: tarjetas,
    eventosTickets: eventos,
  }
}
