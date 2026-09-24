import { Frown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/lib/tenant'

export function NotFoundPage() {
  const tenant = useTenant()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-navy-deep p-4 text-center">
      <Frown className="size-12 text-primary-foreground/60" aria-hidden="true" />
      <h1 className="text-4xl font-bold text-primary-foreground">404</h1>
      <p className="text-primary-foreground/70">Esta página no existe en {tenant.nombreCliente}.</p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
