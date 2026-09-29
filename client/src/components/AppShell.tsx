import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { fechaISOHoy } from '@/lib/formato'
import { useTenant } from '@/lib/tenant'

function sidebarVisibleInicial() {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= 768
}

export function AppShell({ children }: { children: ReactNode }) {
  const { sucursal } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const tenant = useTenant()
  const [sidebarAbierto, setSidebarAbierto] = useState(sidebarVisibleInicial)
  const nombreSucursal = sucursal ? (tenant.sucursales.find((s) => s.id === sucursal)?.nombre ?? sucursal) : ''

  const hoyISO = fechaISOHoy()
  const fechaSeleccionada = searchParams.get('fecha') ?? hoyISO
  const fechaFormateada = new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const [borrador, setBorrador] = useState(fechaSeleccionada)

  // Espera a que termine de tipear antes de cambiar la fecha (cada dígito válido dispararía un refetch).
  useEffect(() => {
    if (!borrador || borrador === fechaSeleccionada) return
    const t = setTimeout(() => setSearchParams(borrador === hoyISO ? {} : { fecha: borrador }), 700)
    return () => clearTimeout(t)
  }, [borrador, fechaSeleccionada, hoyISO, setSearchParams])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />
      <div className={sidebarAbierto ? 'md:ml-64' : ''}>
        <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-4 md:px-8">
          <button
            type="button"
            onClick={() => setSidebarAbierto((v) => !v)}
            className="-m-2.5 flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-accent"
            aria-label={sidebarAbierto ? 'Ocultar menú de navegación' : 'Mostrar menú de navegación'}
          >
            {sidebarAbierto ? <PanelLeftClose className="size-6" /> : <PanelLeftOpen className="size-6" />}
          </button>
          <h2 className="text-lg text-muted-foreground capitalize">
            {nombreSucursal} — {fechaFormateada}
          </h2>
          <input
            type="date"
            value={borrador}
            max={hoyISO}
            onChange={(e) => setBorrador(e.target.value)}
            className="ml-auto rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground"
            aria-label="Elegir fecha"
          />
        </header>
        <main className="@container">{children}</main>
      </div>
    </div>
  )
}
