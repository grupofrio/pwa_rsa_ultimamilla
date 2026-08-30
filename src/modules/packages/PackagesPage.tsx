import { Badge, DataTable, ErrorState, MockBanner, PageHeader, Provenance, Skeleton } from '@/design-system/components/ui'
import { PACKAGE_STATE_LABELS } from '@/entities/states'
import { formatDateTime } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useAuth } from '@/auth/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

export function PackagesPage() {
  const api = useApi()
  const { user } = useAuth()
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['packages'], enabled: Boolean(api), queryFn: () => api!.listPackages() })
  if (!user) return null
  if (query.isLoading || !api) return <Skeleton />
  if (query.isError) return <ErrorState title="No se pudieron cargar paquetes" body="Contrato pendiente o error de red." onRetry={() => void query.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader title="Custodia de paquetes" subtitle="Estados independientes de la ruta. Un paquete entregado conserva su historia." />
      {api.kind === 'mock' ? <MockBanner>Incluye faltantes de CEDIS y un reclamo de no recibido.</MockBanner> : null}
      <DataTable
        caption="Paquetes"
        rows={query.data?.items ?? []}
        onRowClick={(row) => navigate(`/paquetes/${row.id}`)}
        columns={[
          { key: 'tracking', header: 'Guía', render: (row) => row.tracking },
          { key: 'state', header: 'Estado', render: (row) => <Badge tone={row.claimedMissing ? 'danger' : 'neutral'}>{PACKAGE_STATE_LABELS[row.state]}</Badge> },
          { key: 'route', header: 'Ruta', render: (row) => row.routeId },
          { key: 'dest', header: 'Destinatario', render: (row) => row.recipientMasked },
          { key: 'when', header: 'Último evento', render: (row) => formatDateTime(row.lastEventAt, user.activeScope.timezone) },
          { key: 'claim', header: 'Reclamo', render: (row) => (row.claimedMissing ? 'Destinatario afirma no recibido' : '—') },
        ]}
      />
    </div>
  )
}

export function PackageDetailPage() {
  const { id = '' } = useParams()
  const api = useApi()
  const { user } = useAuth()
  const query = useQuery({ queryKey: ['package', id], enabled: Boolean(api && id), queryFn: () => api!.getPackage(id) })
  if (!user) return null
  if (query.isLoading) return <Skeleton />
  if (!query.data) return <ErrorState title="Paquete no encontrado" body="Verifica el identificador." />
  const item = query.data

  return (
    <div className="space-y-4">
      <PageHeader title={item.tracking} subtitle={`${PACKAGE_STATE_LABELS[item.state]} · ${item.recipientMasked}`} />
      <section className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4 shadow-[var(--va-shadow)]">
        <h2 className="font-semibold">Cadena de custodia</h2>
        <ol className="mt-3 space-y-3">
          {item.custody.map((event, index) => (
            <li key={event.id} className="border-l-2 border-[var(--va-teal)] pl-3">
              <p className="text-sm font-semibold">{event.description}</p>
              <p className="text-xs text-[var(--va-muted)]">
                {formatDateTime(event.at, user.activeScope.timezone)} · {event.actor} · {event.source} · {event.locationLabel}
              </p>
              <p className="text-xs text-[var(--va-muted)]">
                Evento {index + 1} de {item.custody.length}
                {index > 0 ? ` · anterior: ${item.custody[index - 1].id}` : ''}
                {index < item.custody.length - 1 ? ` · siguiente: ${item.custody[index + 1].id}` : ''}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4">
        <h2 className="font-semibold">Evidencia permitida</h2>
        {item.evidence.length === 0 ? (
          <p className="text-sm text-[var(--va-muted)]">Sin evidencia descargable en este alcance.</p>
        ) : (
          item.evidence.map((ev) => (
            <p key={ev.id} className="text-sm">
              {ev.kind} · {ev.source} · URL firmada expira {formatDateTime(ev.signedUrlExpiresAt, user.activeScope.timezone)} ·{' '}
              {ev.redacted ? 'redactada' : 'visible'}
            </p>
          ))
        )}
      </section>
    </div>
  )
}

export function ReturnsPage() {
  const api = useApi()
  const query = useQuery({ queryKey: ['packages'], enabled: Boolean(api), queryFn: () => api!.listPackages() })
  const rows = (query.data?.items ?? []).filter((item) => item.state === 'pending_return' || item.state === 'rejected' || item.state === 'returned_to_ml')
  return (
    <div className="space-y-4">
      <PageHeader title="Devoluciones a Mercado Libre" subtitle="Pendiente de devolución vs devuelto con acuse. El dispatcher cierra contra evidencia." />
      {query.isLoading ? <Skeleton /> : <DataTable caption="Devoluciones" rows={rows} columns={[
        { key: 't', header: 'Guía', render: (row) => row.tracking },
        { key: 's', header: 'Estado', render: (row) => PACKAGE_STATE_LABELS[row.state] },
        { key: 'r', header: 'Ruta', render: (row) => row.routeId },
      ]} />}
    </div>
  )
}

export function RouteDetailPage() {
  const { id = '' } = useParams()
  const api = useApi()
  const { user, can } = useAuth()
  const query = useQuery({ queryKey: ['route', id], enabled: Boolean(api && id), queryFn: () => api!.getRoute(id) })
  if (!user) return null
  if (query.isLoading) return <Skeleton />
  if (!query.data) return <ErrorState title="Ruta no encontrada" body="El identificador no existe en el scope activo." />
  const route = query.data
  return (
    <div className="space-y-4">
      <PageHeader title={route.folio} subtitle={`${route.driver.name} · ${route.vehicle.code} · ${route.windowLabel}`} />
      <Provenance {...route.provenance} />
      <div className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4">
          <h2 className="font-semibold">Jornada</h2>
          <p className="text-sm">{route.journeyLeg}</p>
          <p className="mt-2 text-sm">Km oficiales {route.distance.officialRouteKm ?? '—'} · reales {route.distance.actualRouteKm ?? '—'} · posicionamiento {route.distance.positioningKm ?? '—'} · fuera de política {route.distance.offPolicyKm ?? '—'}</p>
        </article>
        <article className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4">
          <h2 className="font-semibold">Paquetes</h2>
          <p className="tabular text-sm">Esperados {route.packagesExpected} · recibidos {route.packagesReceived} · cargados {route.packagesLoaded} · entregados {route.packagesDelivered} · devolución {route.packagesPendingReturn}</p>
        </article>
        <article className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4">
          <h2 className="font-semibold">Comercial</h2>
          <p className="text-sm">{route.commercial.tariffBandLabel}</p>
          <p className="text-sm">Ingreso esperado {route.commercial.expectedRevenue.amount} {route.commercial.expectedRevenue.kind === 'estimate' ? '(estimación)' : '(oficial)'}</p>
          <p className="text-sm">Reconocido {route.commercial.recognizedRevenue ? `${route.commercial.recognizedRevenue.amount} oficial` : 'aún no'}</p>
          <p className="mt-2 text-xs text-[var(--va-muted)]">{route.commercial.note}</p>
          {!can('settlement.force_liquidatable') && route.mlLiquidationState !== 'confirmed' ? (
            <p className="mt-2 text-sm" data-testid="not-liquidatable">Completada o no, esta ruta todavía no es liquidable. No hay acción para forzarla.</p>
          ) : null}
        </article>
      </div>
    </div>
  )
}
