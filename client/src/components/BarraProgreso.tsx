export function BarraProgreso({
  etiqueta,
  valor,
  porcentaje,
  montoCompleto,
}: {
  etiqueta: string
  valor: string
  porcentaje: number
  montoCompleto?: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 py-2 sm:grid-cols-[8rem_1fr_5rem]">
      <span className="truncate text-xs font-medium text-muted-foreground uppercase sm:order-1">{etiqueta}</span>
      <span className="font-numeric text-right text-sm font-medium tabular-nums sm:order-3">{valor}</span>
      <div className="group/barra relative col-span-2 h-2.5 overflow-visible rounded-full bg-muted sm:order-2 sm:col-span-1">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
        />
        {montoCompleto !== undefined && (
          <div className="font-numeric pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background opacity-0 transition-opacity group-hover/barra:opacity-100">
            {Math.round(porcentaje)}% ({montoCompleto})
          </div>
        )}
      </div>
    </div>
  )
}
