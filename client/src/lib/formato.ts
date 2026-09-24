export function formatoMoneda(valor: number): string {
  return valor.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export function formatoFecha(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${day}/${month}`
}

export function formatoFechaLarga(iso: string): string {
  const [, month, day] = iso.split('-')
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const fecha = new Date(iso + 'T00:00:00')
  return `${dias[fecha.getDay()]} ${day}/${month}`
}

export function fechaISOHoy(): string {
  const hoy = new Date()
  const sinOffset = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
  return sinOffset.toISOString().slice(0, 10)
}

export function abreviarMoneda(valor: number): string {
  if (valor >= 1e6) return `${(valor / 1e6).toFixed(1)}M`
  if (valor >= 1e3) return `${(valor / 1e3).toFixed(1)}k`
  return String(Math.round(valor))
}
