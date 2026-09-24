export type MedioPago = { nombre: string; total: number; porcentaje: number }
export type VentaTarjeta = { nombre: string; total: number; porcentaje: number }
export type PuntoVentaDia = { fecha: string; total: number }

export type EventosTickets = {
  anulados: number
  editados: number
  descuentos: number
  personalizados: number
  incompletos: number
  total: number
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

export type PuntoAnuladosDia = { fecha: string; anulados: number }
export type RankingCajero = { codigo: number; nombre: string; anulados: number }

export type Anulados = {
  historico: PuntoAnuladosDia[]
  totalHoy: number
  rankingHoy: RankingCajero[]
  ranking14Dias: RankingCajero[]
}

export type ResumenAnuladosSucursal = { sucursal: string; totalHoy: number | null }

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Error de red' }))
    throw new Error(error ?? 'Error de red')
  }
  return res.json()
}

export function getDashboard(sucursal: string) {
  return get<DashboardVentas>(`/api/dashboard/${sucursal}`)
}

export function getAnulados(sucursal: string) {
  return get<Anulados>(`/api/anulados/${sucursal}`)
}

export function getResumenAnulados() {
  return get<ResumenAnuladosSucursal[]>('/api/anulados/resumen')
}
