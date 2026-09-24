import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function KpiCard({
  titulo,
  valor,
  variacion,
}: {
  titulo: string
  valor: string
  variacion?: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">{valor}</div>
        {variacion !== undefined && (
          <p className={variacion >= 0 ? 'text-sm text-primary' : 'text-sm text-destructive'}>
            {variacion >= 0 ? '+' : ''}
            {variacion}% de ayer
          </p>
        )}
      </CardContent>
    </Card>
  )
}
