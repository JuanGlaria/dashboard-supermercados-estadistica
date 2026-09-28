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

export type HistorialCajero = { fecha: string; nticket: string }[]

export type DetalleTicketItem = { canti: number; nombre: string; marca: string | null; preciou: number; preciot: number }
export type DetalleTicket = { items: DetalleTicketItem[]; total: number }

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' })
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'))
  }
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Error de red' }))
    throw new Error(error ?? 'Error de red')
  }
  return res.json()
}

export function getDashboard(sucursal: string, fecha?: string) {
  return get<DashboardVentas>(`/api/dashboard/${sucursal}${fecha ? `?fecha=${fecha}` : ''}`)
}

export function getAnulados(sucursal: string, fecha?: string) {
  return get<Anulados>(`/api/anulados/${sucursal}${fecha ? `?fecha=${fecha}` : ''}`)
}

export function getResumenAnulados() {
  return get<ResumenAnuladosSucursal[]>('/api/anulados/resumen')
}

export function getHistorialCajero(sucursal: string, codigo: number) {
  return get<HistorialCajero>(`/api/anulados/${sucursal}/cajero/${codigo}`)
}

export function getDetalleTicket(sucursal: string, nticket: number, letra: string, caja: number) {
  return get<DetalleTicket>(`/api/anulados/${sucursal}/ticket/${nticket}?letra=${letra}&caja=${caja}`)
}
