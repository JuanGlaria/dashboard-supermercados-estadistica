export function hoy(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha)
  d.setDate(d.getDate() + dias)
  return d
}

export function inicioSemana(fecha: Date): Date {
  const diaSemana = fecha.getDay()
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1
  return sumarDias(fecha, -diasDesdeLunes)
}

export function aISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

export function parseFechaQuery(raw: unknown): Date | undefined {
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined
  const d = new Date(raw + 'T00:00:00')
  d.setHours(0, 0, 0, 0)
  return Number.isNaN(d.getTime()) ? undefined : d
}
