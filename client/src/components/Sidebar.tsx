import { LayoutDashboard, LogOut, Store } from 'lucide-react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth, type Sucursal } from '@/lib/auth'
import { Button } from '@/components/ui/button'

const NOMBRES: Record<Sucursal, string> = {
  lavalle: 'Lavalle',
  savio: 'Savio',
  somisa: 'Somisa',
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { sucursal: sucursalActual } = useParams()
  if (!usuario) return null

  const sucursales = usuario.sucursales === 'todas' ? (['lavalle', 'savio', 'somisa'] as const) : usuario.sucursales

  async function cerrarSesion() {
    await logout()
    navigate('/login')
  }

  function cerrarSiEsMobile() {
    if (window.innerWidth < 768) onClose()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-sidebar-border p-5 text-center">
          <h1 className="text-xl font-semibold">SUPER JOSE</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-5" onClick={cerrarSiEsMobile}>
          {sucursales.map((s) => (
            <NavLink
              key={s}
              to={`/dashboard/${s}`}
              className={({ isActive }) =>
                `flex items-center gap-3 border-l-[3px] px-5 py-3 transition-colors ${
                  isActive
                    ? 'border-l-primary bg-sidebar-accent text-sidebar-foreground'
                    : 'border-l-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`
              }
            >
              <Store className="size-5" aria-hidden="true" />
              {NOMBRES[s]}
            </NavLink>
          ))}
          <NavLink
            to={`/anulados/${sucursalActual ?? sucursales[0]}`}
            className={({ isActive }) =>
              `flex items-center gap-3 border-l-[3px] px-5 py-3 transition-colors ${
                isActive
                  ? 'border-l-primary bg-sidebar-accent text-sidebar-foreground'
                  : 'border-l-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`
            }
          >
            <LayoutDashboard className="size-5" aria-hidden="true" />
            Anulados
          </NavLink>
        </nav>

        <div className="border-t border-sidebar-border p-5">
          <Button variant="destructive" className="w-full gap-2" onClick={cerrarSesion}>
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  )
}
