import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, ErrorState, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { ROUTE_STATE_LABELS } from '@/entities/states'
import { formatKm, formatTime } from '@/format'
import { useApi } from '@/services/api/useApi'
import type { RouteSummary } from '@/services/api/types'
import { ApiError } from '@/services/api/errors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function DispatchPage() {
  const api = useApi()
  const { user, can } = useAuth()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<RouteSummary | null>(null)
  const [reason, setReason] = useState('Registro posterior a autorización de Mercado Libre')

  const query = useQuery({
    queryKey: ['routes'],
    enabled: Boolean(api),
    queryFn: () => api!.listRoutes(),
  })

  const assign = useMutation({
    mutationFn: (route: RouteSummary) =>
      api!.assignRoute({
        routeId: route.id,
        driverId: route.driver.id === 'dr_none' ? 'dr_luis' : route.driver.id,
        vehicleId: route.vehicle.id,
        capability: 'route.assign',
        idempotencyKey: crypto.randomUUID(),
        reason: 'Asignación habitual conductor-unidad',
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['routes'] })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo asignar'),
  })

  const arrival = useMutation({
    mutationFn: (route: RouteSummary) =>
      api!.confirmArrival({ routeId: route.id, capability: 'route.confirm_arrival', idempotencyKey: crypto.randomUUID() }),
    onSuccess: async () => client.invalidateQueries({ queryKey: ['routes'] }),
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo registrar arribo'),
  })

  if (!user) return null
  if (query.isLoading || !api) return <Skeleton rows={8} />
  if (query.isError) return <ErrorState title="No se pudieron cargar las rutas" body="Reintenta o verifica el contrato." onRetry={() => void query.refetch()} />

  const tz = user.activeScope.timezone
  const rows = query.data?.items ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        title="Despacho CEDIS"
        subtitle="Asignación, custodia inicial y salida. Mercado Libre autoriza la salida; Vía Ágil solo registra el hito."
        actions={
          <div className="flex gap-2">
            <Link className="inline-flex min-h-11 items-center rounded-xl bg-[var(--va-navy)] px-4 text-sm text-white" to="/despacho/asignaciones">
              Asignaciones
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-xl border border-[var(--va-line)] px-4 text-sm" to="/despacho/carga">
              Carga
            </Link>
          </div>
        }
      />
      {api.kind === 'mock' ? <MockBanner>Jornada GDL R con diferencia de carga, salida pendiente de ML y unidad en mantenimiento.</MockBanner> : null}
      {error ? (
        <p className="text-sm text-[var(--va-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <DataTable
        caption="Rutas del día"
        rows={rows}
        onRowClick={(row) => navigate(`/torre/rutas/${row.id}`)}
        columns={[
          { key: 'folio', header: 'Folio', render: (row) => <strong>{row.folio}</strong> },
          { key: 'state', header: 'Estado de ruta', render: (row) => <Badge>{ROUTE_STATE_LABELS[row.state]}</Badge> },
          { key: 'window', header: 'Ventana', render: (row) => row.windowLabel },
          { key: 'people', header: 'Conductor / unidad', render: (row) => `${row.driver.name} · ${row.vehicle.code}` },
          {
            key: 'packages',
            header: 'Paquetes E/R/C',
            render: (row) => (
              <span className="tabular">
                {row.packagesExpected}/{row.packagesReceived}/{row.packagesLoaded}
                {row.hasLoadDifference ? <Badge tone="danger">Diferencia</Badge> : null}
              </span>
            ),
          },
          { key: 'km', header: 'Km oficiales / reales', render: (row) => `${formatKm(row.distance.officialRouteKm)} / ${formatKm(row.distance.actualRouteKm)}` },
          { key: 'arrival', header: 'Llegada', render: (row) => formatTime(row.actualArrivalAt, tz) },
          {
            key: 'actions',
            header: 'Acciones',
            render: (row) => (
              <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                {can('route.assign') ? (
                  <Button type="button" variant="ghost" onClick={() => assign.mutate(row)}>
                    Asignar
                  </Button>
                ) : null}
                {can('route.confirm_arrival') ? (
                  <Button type="button" variant="ghost" onClick={() => arrival.mutate(row)}>
                    Arribo
                  </Button>
                ) : null}
                {can('route.confirm_exit') ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      void api
                        .registerMlExitAuthorization({
                          routeId: row.id,
                          authorizedAt: new Date().toISOString(),
                          capability: 'route.confirm_exit',
                          idempotencyKey: crypto.randomUUID(),
                          reason: 'Mercado Libre autorizó la salida en andén',
                        })
                        .then(() => client.invalidateQueries({ queryKey: ['routes'] }))
                        .catch((err) => setError(err instanceof Error ? err.message : 'No se registró la autorización'))
                    }
                    data-testid={`ml-exit-${row.id}`}
                  >
                    Registrar autorización ML
                  </Button>
                ) : null}
                {can('route.confirm_exit') ? (
                  <Button type="button" variant="secondary" onClick={() => setConfirm(row)} data-testid={`exit-${row.id}`}>
                    Confirmar salida
                  </Button>
                ) : null}
                {api.kind === 'mock' && row.hasLoadDifference ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      void api.applyDevScenario('resolve_load_difference', { routeId: row.id }).then(() =>
                        client.invalidateQueries({ queryKey: ['routes'] }),
                      )
                    }}
                  >
                    Resolver faltantes (mock)
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(confirm)}
        title="Confirmar salida"
        body="Solo confirma si Mercado Libre ya autorizó la salida. Vía Ágil no sustituye esa autoridad. Si hay diferencia de paquetes, la acción será rechazada."
        confirmLabel="Registrar hito de salida"
        reason={reason}
        onReason={setReason}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm || !api) return
          void (async () => {
            try {
              await api.confirmExit({
                routeId: confirm.id,
                capability: 'route.confirm_exit',
                idempotencyKey: crypto.randomUUID(),
                reason,
              })
              await client.invalidateQueries({ queryKey: ['routes'] })
              setConfirm(null)
              setError(null)
            } catch (err) {
              setError(err instanceof ApiError ? err.message : 'No se pudo confirmar la salida')
              setConfirm(null)
            }
          })()
        }}
      />
    </div>
  )
}

export function DispatchAssignmentsPage() {
  return (
    <DispatchPage />
  )
}

export function DispatchLoadPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Conciliación de carga" subtitle="Esperado vs recibido vs cargado. Un paquete entregado no desaparece: conserva historia." />
      <DispatchPage />
    </div>
  )
}
