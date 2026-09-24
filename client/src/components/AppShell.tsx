import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { useTenant } from '@/lib/tenant'

function sidebarVisibleInicial() {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= 768
}

export function AppShell({ children }: { children: ReactNode }) {
  const { sucursal } = useParams()
  const tenant = useTenant()
  const [sidebarAbierto, setSidebarAbierto] = useState(sidebarVisibleInicial)
  const nombreSucursal = sucursal ? (tenant.sucursales.find((s) => s.id === sucursal)?.nombre ?? sucursal) : ''

  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarAbierto} onClose={() => setSidebarAbierto(false)} />
      <div className={sidebarAbierto ? 'md:ml-64' : ''}>
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4 md:px-8">
          <button
            type="button"
            onClick={() => setSidebarAbierto((v) => !v)}
            className="-m-2.5 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={sidebarAbierto ? 'Ocultar menú de navegación' : 'Mostrar menú de navegación'}
          >
            {sidebarAbierto ? <PanelLeftClose className="size-6" /> : <PanelLeftOpen className="size-6" />}
          </button>
          <h2 className="text-lg text-muted-foreground capitalize">
            {nombreSucursal} — {fechaHoy}
          </h2>
        </header>
        <main className="@container">{children}</main>
      </div>
    </div>
  )
}
