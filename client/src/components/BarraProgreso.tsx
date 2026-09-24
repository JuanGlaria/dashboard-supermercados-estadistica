export function BarraProgreso({
  etiqueta,
  valor,
  porcentaje,
}: {
  etiqueta: string
  valor: string
  porcentaje: number
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 py-2 sm:grid-cols-[8rem_1fr_5rem]">
      <span className="truncate text-xs font-medium text-muted-foreground uppercase sm:order-1">{etiqueta}</span>
      <span className="text-right text-sm font-medium sm:order-3">{valor}</span>
      <div className="col-span-2 h-2 overflow-hidden rounded-full bg-muted sm:order-2 sm:col-span-1">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
        />
      </div>
    </div>
  )
}
