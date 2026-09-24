import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AppShell } from '@/components/AppShell'
import { BarraProgreso } from '@/components/BarraProgreso'
import { ChartCard } from '@/components/ChartCard'
import { KpiCard } from '@/components/KpiCard'
import { getDashboard, type DashboardVentas } from '@/lib/api'
import type { EstadoCarga } from '@/lib/estadoCarga'
import { abreviarMoneda, formatoFecha, formatoFechaLarga, formatoMoneda } from '@/lib/formato'
import { useTenant } from '@/lib/tenant'

const COLORES_EVENTOS = ['var(--chart-2)', 'var(--chart-1)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function DashboardPage() {
  const { sucursal } = useParams()
  const [searchParams] = useSearchParams()
  const fecha = searchParams.get('fecha') ?? undefined
  const tenant = useTenant()
  const [estado, setEstado] = useState<EstadoCarga<DashboardVentas>>({ status: 'cargando' })

  useEffect(() => {
    if (!sucursal) return
    let cancelado = false

    function cargar(mostrarCargando: boolean) {
      if (mostrarCargando) setEstado({ status: 'cargando' })
      getDashboard(sucursal!, fecha)
        .then((datos) => {
          if (!cancelado) setEstado({ status: 'listo', datos })
        })
        .catch((err) => {
          if (!cancelado) setEstado({ status: 'error', mensaje: err.message })
        })
    }

    cargar(true)

    let intervalo: ReturnType<typeof setInterval> | undefined
    if (tenant.refrescoMinutos && !fecha) {
      intervalo = setInterval(() => cargar(false), tenant.refrescoMinutos * 60_000)
    }

    return () => {
      cancelado = true
      if (intervalo) clearInterval(intervalo)
    }
  }, [sucursal, fecha, tenant.refrescoMinutos])

  return (
    <AppShell>
      {estado.status === 'error' && <div className="p-8 text-destructive">{estado.mensaje}</div>}
      {estado.status === 'cargando' && <div className="p-8 text-muted-foreground">Cargando...</div>}
      {estado.status === 'listo' && <Contenido datos={estado.datos} />}
    </AppShell>
  )
}

function Contenido({ datos }: { datos: DashboardVentas }) {
  const semanas = datos.semanaActual.map((dia, i) => ({
    fecha: formatoFecha(dia.fecha),
    actual: dia.total,
    pasada: datos.semanaPasada[i]?.total ?? 0,
  }))

  const eventos = [
    { nombre: 'Anulados', cantidad: datos.eventosTickets.anulados },
    { nombre: 'Editados', cantidad: datos.eventosTickets.editados },
    { nombre: 'Descuentos', cantidad: datos.eventosTickets.descuentos },
    { nombre: 'Personalizados', cantidad: datos.eventosTickets.personalizados },
    { nombre: 'Incompletos', cantidad: datos.eventosTickets.incompletos },
  ].filter((e) => e.cantidad > 0)

  const maxUltimosDias = Math.max(...datos.ventasUltimosDias.map((d) => d.total), 1)
  const maxTarjeta = datos.ventasTarjetas[0]?.total ?? 1

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="grid grid-cols-2 gap-4 @5xl:grid-cols-4">
        <KpiCard titulo="Ventas en $" valor={formatoMoneda(datos.ventasHoy)} variacion={datos.variacionVentas} />
        <KpiCard titulo="Tickets" valor={String(datos.ticketsHoy)} variacion={datos.variacionTickets} />
        <KpiCard titulo="Cajas usadas" valor={String(datos.cajasActivas)} />
        <KpiCard titulo="Clientes atendidos" valor={String(datos.clientesAtendidos)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <ChartCard titulo="Semana actual vs semana pasada">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={semanas}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradPasada" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--navy)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="fecha" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatoMoneda(Number(v))} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="pasada" name="Semana pasada" stroke="var(--navy)" fill="url(#gradPasada)" strokeWidth={2} />
              <Area type="monotone" dataKey="actual" name="Esta semana" stroke="var(--chart-1)" fill="url(#gradActual)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard titulo="Ventas últimos 4 días">
          <div className="flex h-full flex-col justify-center gap-1">
            {datos.ventasUltimosDias.slice(-4).reverse().map((d) => (
              <BarraProgreso
                key={d.fecha}
                etiqueta={formatoFechaLarga(d.fecha)}
                valor={formatoMoneda(d.total)}
                porcentaje={(d.total * 100) / maxUltimosDias}
              />
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard titulo="Ventas por medios de pago">
          <div className="flex h-full flex-col justify-center gap-1">
            {datos.mediosPago.map((m) => (
              <BarraProgreso key={m.nombre} etiqueta={m.nombre} valor={abreviarMoneda(m.total)} porcentaje={m.porcentaje} />
            ))}
          </div>
        </ChartCard>

        <ChartCard titulo="Eventos de tickets">
          {eventos.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sin eventos hoy
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eventos} dataKey="cantidad" nameKey="nombre" innerRadius={50} outerRadius={80}>
                  {eventos.map((_, i) => (
                    <Cell key={i} fill={COLORES_EVENTOS[i % COLORES_EVENTOS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard titulo="Ventas en tarjetas">
          <div className="flex h-full flex-col justify-center gap-1 overflow-y-auto">
            {datos.ventasTarjetas.slice(0, 7).map((c) => (
              <BarraProgreso
                key={c.nombre}
                etiqueta={c.nombre}
                valor={abreviarMoneda(c.total)}
                porcentaje={(c.total * 100) / maxTarjeta}
              />
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
