import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppShell } from '@/components/AppShell'
import { ChartCard } from '@/components/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAnulados, getResumenAnulados, type Anulados, type ResumenAnuladosSucursal } from '@/lib/api'
import { formatoFecha } from '@/lib/formato'

const NOMBRES: Record<string, string> = {
  lavalle: 'Lavalle',
  savio: 'Savio',
  somisa: 'Somisa',
}

export function AnuladosPage() {
  const { sucursal } = useParams()
  const navigate = useNavigate()
  const [resumen, setResumen] = useState<ResumenAnuladosSucursal[] | null>(null)
  const [datos, setDatos] = useState<Anulados | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getResumenAnulados().then(setResumen).catch(() => setResumen([]))
  }, [])

  useEffect(() => {
    if (!sucursal) return
    setDatos(null)
    setError(null)
    getAnulados(sucursal).then(setDatos).catch((err) => setError(err.message))
  }, [sucursal])

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-4 sm:p-8">
        {resumen && resumen.length > 1 && (
          <div className="flex gap-4">
            {resumen.map((r) => (
              <button
                key={r.sucursal}
                onClick={() => navigate(`/anulados/${r.sucursal}`)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-4 transition-colors ${
                  r.sucursal === sucursal ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                }`}
              >
                <span className="text-3xl font-bold text-foreground">{r.totalHoy ?? '—'}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {NOMBRES[r.sucursal] ?? r.sucursal}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && <div className="text-destructive">{error}</div>}
        {!error && !datos && <div className="text-muted-foreground">Cargando...</div>}
        {datos && <Contenido datos={datos} />}
      </div>
    </AppShell>
  )
}

function Contenido({ datos }: { datos: Anulados }) {
  return (
    <div className="flex flex-col gap-6">
      <ChartCard titulo="Anulados — últimos 14 días">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos.historico.map((d) => ({ ...d, fecha: formatoFecha(d.fecha) }))}>
            <defs>
              <linearGradient id="gradAnulados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="fecha" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Area type="monotone" dataKey="anulados" name="Anulados" stroke="var(--destructive)" fill="url(#gradAnulados)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Ranking cajeros — hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <TablaRanking filas={datos.rankingHoy} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Ranking cajeros — últimos 14 días</CardTitle>
          </CardHeader>
          <CardContent>
            <TablaRanking filas={datos.ranking14Dias} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TablaRanking({ filas }: { filas: Anulados['rankingHoy'] }) {
  if (filas.length === 0) return <p className="text-sm text-muted-foreground">Sin anulados en el período.</p>
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th scope="col" className="pb-2 font-medium">Cajero</th>
          <th scope="col" className="pb-2 font-medium text-right">Anulados</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <tr key={f.codigo} className="border-t border-border">
            <td className="py-2">{f.nombre}</td>
            <td className="py-2 text-right tabular-nums">{f.anulados}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
