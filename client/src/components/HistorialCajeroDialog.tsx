import { Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DetalleTicketDialog, type TicketSeleccionado } from '@/components/DetalleTicketDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getHistorialCajero, type HistorialCajero } from '@/lib/api'
import type { EstadoCarga } from '@/lib/estadoCarga'

export type CajeroSeleccionado = { codigo: number; nombre: string }

function parseNticket(nticket: string): TicketSeleccionado {
  return {
    letra: nticket.slice(0, 1),
    caja: Number(nticket.slice(1, 5)),
    nticket: Number(nticket.slice(5)),
  }
}

export function HistorialCajeroDialog({
  sucursal,
  cajero,
  onOpenChange,
}: {
  sucursal: string
  cajero: CajeroSeleccionado | null
  onOpenChange: (open: boolean) => void
}) {
  const [estado, setEstado] = useState<EstadoCarga<HistorialCajero>>({ status: 'cargando' })
  const [ticket, setTicket] = useState<TicketSeleccionado | null>(null)

  useEffect(() => {
    if (!cajero) return
    setEstado({ status: 'cargando' })
    getHistorialCajero(sucursal, cajero.codigo)
      .then((datos) => setEstado({ status: 'listo', datos }))
      .catch((err) => setEstado({ status: 'error', mensaje: err.message }))
  }, [sucursal, cajero])

  return (
    <>
      <Dialog open={cajero !== null} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{cajero?.nombre} — anulados últimos 14 días</DialogTitle>
          </DialogHeader>
          {estado.status === 'cargando' && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {estado.status === 'error' && <p className="text-sm text-destructive">{estado.mensaje}</p>}
          {estado.status === 'listo' &&
            (estado.datos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin anulados en el período.</p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th scope="col" className="pb-2 font-medium">Fecha</th>
                      <th scope="col" className="pb-2 font-medium">Ticket</th>
                      <th scope="col" className="pb-2 font-medium text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estado.datos.map((r) => (
                      <tr key={`${r.fecha}-${r.nticket}`} className="border-t border-border">
                        <td className="py-2">{r.fecha}</td>
                        <td className="py-2 tabular-nums">{r.nticket}</td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setTicket(parseNticket(r.nticket))}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Ver detalle del ticket"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </DialogContent>
      </Dialog>
      <DetalleTicketDialog sucursal={sucursal} ticket={ticket} onOpenChange={(open) => !open && setTicket(null)} />
    </>
  )
}
