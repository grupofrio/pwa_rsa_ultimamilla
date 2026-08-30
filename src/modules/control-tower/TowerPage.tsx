import { Badge, DataTable, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { ROUTE_STATE_LABELS } from '@/entities/states'
import { freshnessLabel, formatKm } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const LiveMap = lazy(() => import('./LiveMap'))

export function TowerPage() {
  const api = useApi()
  const navigate = useNavigate()
  const routes = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const alerts = useQuery({ queryKey: ['alerts'], enabled: Boolean(api), queryFn: () => api!.listAlerts() })
  const rows = routes.data?.items ?? []

  return (
    <div className="space-y-4">
      <PageHeader title="Torre de control" subtitle="Mapa, lista sincronizada y alertas accionables. La telemetría atrasada se muestra de forma explícita." />
      {api?.kind === 'mock' ? <MockBanner>GPS desactualizado en VA-21. El mapa no infiere infracciones por sí solo.</MockBanner> : null}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="min-h-[420px] overflow-hidden rounded-[var(--va-radius)] bg-[var(--va-surface)]">
          {routes.isLoading ? (
            <Skeleton rows={10} />
          ) : (
            <Suspense fallback={<Skeleton rows={10} />}>
              <LiveMap routes={rows} />
            </Suspense>
          )}
        </div>
        <div className="space-y-3">
          <h2 className="font-semibold">Unidades</h2>
          <DataTable
            caption="Unidades en torre"
            rows={rows}
            onRowClick={(row) => navigate(`/torre/rutas/${row.id}`)}
            columns={[
              { key: 'unit', header: 'Unidad', render: (row) => row.vehicle.code },
              { key: 'state', header: 'Estado', render: (row) => ROUTE_STATE_LABELS[row.state] },
              { key: 'gps', header: 'GPS', render: (row) => <Badge tone={row.vehicle.gpsQuality === 'stale' ? 'warn' : 'ok'}>{row.vehicle.gpsQuality === 'stale' ? 'Desactualizado' : 'Fresco'}</Badge> },
              { key: 'km', header: 'Km ofic.', render: (row) => formatKm(row.distance.officialRouteKm) },
            ]}
          />
          <h2 className="font-semibold">Alertas</h2>
          <ul className="space-y-2">
            {(alerts.data?.items ?? []).map((alert) => (
              <li key={alert.id} className="rounded-xl border border-[var(--va-line)] bg-[var(--va-surface)] p-3">
                <Link className="font-semibold" to="/alertas">
                  {alert.title}
                </Link>
                <p className="text-xs text-[var(--va-muted)]">
                  {alert.severity} · {freshnessLabel(alert.createdAt)} · {alert.state}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
