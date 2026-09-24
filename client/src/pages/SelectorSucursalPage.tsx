import { Store } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

const NOMBRES: Record<string, string> = {
  lavalle: 'Lavalle',
  savio: 'Savio',
  somisa: 'Somisa',
}

export function SelectorSucursalPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  if (!usuario) return <Navigate to="/login" replace />

  const sucursales = usuario.sucursales === 'todas' ? ['lavalle', 'savio', 'somisa'] : usuario.sucursales

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-navy-deep p-4">
      <h1 className="text-2xl font-semibold text-primary-foreground">Elegí una sucursal</h1>
      <div className="flex flex-wrap justify-center gap-4">
        {sucursales.map((s) => (
          <button
            key={s}
            onClick={() => navigate(`/dashboard/${s}`)}
            className="flex w-24 flex-col items-center gap-2 rounded-lg bg-primary-foreground/5 p-4 text-primary-foreground transition-colors hover:bg-primary sm:w-32 sm:gap-3 sm:p-6"
          >
            <Store className="size-6 sm:size-8" aria-hidden="true" />
            {NOMBRES[s]}
          </button>
        ))}
      </div>
      <Button variant="destructive" onClick={() => logout()}>
        Cerrar sesión
      </Button>
    </div>
  )
}
