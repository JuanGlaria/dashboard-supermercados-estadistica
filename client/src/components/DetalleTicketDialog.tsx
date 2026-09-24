import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getDetalleTicket, type DetalleTicket } from '@/lib/api'
import type { EstadoCarga } from '@/lib/estadoCarga'
import { formatoMoneda } from '@/lib/formato'

export type TicketSeleccionado = { nticket: number; letra: string; caja: number }

export function DetalleTicketDialog({
  sucursal,
  ticket,
  onOpenChange,
}: {
  sucursal: string
  ticket: TicketSeleccionado | null
  onOpenChange: (open: boolean) => void
}) {
  const [estado, setEstado] = useState<EstadoCarga<DetalleTicket>>({ status: 'cargando' })

  useEffect(() => {
    if (!ticket) return
    setEstado({ status: 'cargando' })
    getDetalleTicket(sucursal, ticket.nticket, ticket.letra, ticket.caja)
      .then((datos) => setEstado({ status: 'listo', datos }))
      .catch((err) => setEstado({ status: 'error', mensaje: err.message }))
  }, [sucursal, ticket])

  return (
    <Dialog open={ticket !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle del ticket</DialogTitle>
        </DialogHeader>
        {estado.status === 'cargando' && <p className="text-sm text-muted-foreground">Cargando...</p>}
        {estado.status === 'error' && <p className="text-sm text-destructive">{estado.mensaje}</p>}
        {estado.status === 'listo' && (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th scope="col" className="pb-2 font-medium">Cant.</th>
                  <th scope="col" className="pb-2 font-medium">Producto</th>
                  <th scope="col" className="pb-2 font-medium text-right">Precio</th>
                </tr>
              </thead>
              <tbody>
                {estado.datos.items.map((item, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 tabular-nums">{item.canti}</td>
                    <td className="py-2">
                      {item.nombre}
                      {item.marca ? ` — ${item.marca}` : ''}
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatoMoneda(item.preciot)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td className="py-2" colSpan={2}>Total</td>
                  <td className="py-2 text-right tabular-nums">{formatoMoneda(estado.datos.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
