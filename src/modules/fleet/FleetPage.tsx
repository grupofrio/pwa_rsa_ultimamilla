import { Badge, DataTable, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

export function FleetPage() {
  const api = useApi()
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['vehicles'], enabled: Boolean(api), queryFn: () => api!.listVehicles() })
  if (query.isLoading || !api) return <Skeleton />
  return (
    <div className="space-y-4">
      <PageHeader title="Flota" subtitle="Expediente visible, GPS agnóstico de marca, SIM, documentos y próximo servicio." />
      {api.kind === 'mock' ? <MockBanner>VA-27 bloqueada por mantenimiento. GPS de terceros y dispositivos propios se unifican en backend.</MockBanner> : null}
      <DataTable
        caption="Unidades"
        rows={query.data?.items ?? []}
        onRowClick={(row) => navigate(`/flota/unidades/${row.id}`)}
        columns={[
          { key: 'code', header: 'Unidad', render: (row) => row.code },
          { key: 'plate', header: 'Placas', render: (row) => row.plate },
          { key: 'status', header: 'Estado', render: (row) => <Badge tone={row.status.includes('block') ? 'danger' : 'ok'}>{row.status}</Badge> },
          { key: 'driver', header: 'Conductor habitual', render: (row) => row.habitualDriverName },
          { key: 'odo', header: 'Odómetro', render: (row) => `${row.odometerKm} km · ${row.odometerSource}` },
          { key: 'gps', header: 'GPS', render: (row) => `${row.gps.quality} · SIM ${row.gps.simStatus}` },
          { key: 'next', header: 'Próximo servicio', render: (row) => row.nextService.reason },
        ]}
      />
    </div>
  )
}

export function VehicleDetailPage() {
  const { id = '' } = useParams()
  const api = useApi()
  const query = useQuery({ queryKey: ['vehicle', id], enabled: Boolean(api && id), queryFn: () => api!.getVehicle(id) })
  if (query.isLoading) return <Skeleton />
  const v = query.data
  if (!v) return <PageHeader title="Unidad no encontrada" />
  return (
    <div className="space-y-4">
      <PageHeader title={`${v.code} · ${v.plate}`} subtitle={`Conductor habitual: ${v.habitualDriverName}`} />
      <dl className="grid gap-3 rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4 sm:grid-cols-2">
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Estado</dt><dd>{v.status}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Odómetro</dt><dd>{v.odometerKm} km ({v.odometerSource})</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">GPS</dt><dd>Calidad {v.gps.quality} · SIM {v.gps.simStatus}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Documentos</dt><dd>Seguro {v.documents.insurance} · Permiso {v.documents.permit}</dd></div>
      </dl>
    </div>
  )
}

export function MaintenancePage() {
  const api = useApi()
  const query = useQuery({ queryKey: ['vehicles'], enabled: Boolean(api), queryFn: () => api!.listVehicles() })
  return (
    <div className="space-y-4">
      <PageHeader title="Mantenimiento" subtitle="Preventivo por fecha, kilometraje o condición. Órdenes, talleres y tiempo fuera de servicio." />
      {query.isLoading ? <Skeleton /> : (
        <DataTable caption="Servicios" rows={query.data?.items ?? []} columns={[
          { key: 'c', header: 'Unidad', render: (row) => row.code },
          { key: 'r', header: 'Motivo', render: (row) => row.nextService.reason },
          { key: 'k', header: 'Km objetivo', render: (row) => String(row.nextService.dueKm ?? '—') },
        ]} />
      )}
    </div>
  )
}
