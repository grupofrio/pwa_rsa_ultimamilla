import { useAuth } from '@/auth/AuthProvider'
import { Badge, DataTable, KpiCard, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { isOfficiallyLiquidatable, ML_LIQUIDATION_LABELS, ROUTE_STATE_LABELS } from '@/entities/states'
import { formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

export function SettlementsPage() {
  const api = useApi()
  const query = useQuery({ queryKey: ['settlements'], enabled: Boolean(api), queryFn: () => api!.listSettlements() })
  const routes = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const navigate = useNavigate()
  if (query.isLoading || !api) return <Skeleton />
  const cut = query.data?.items[0]
  return (
    <div className="space-y-4">
      <PageHeader title="Cortes y liquidaciones" subtitle="Solo una ruta oficialmente liquidable genera el cobro de Vía Ágil. Completar la ruta no basta." />
      {api.kind === 'mock' ? <MockBanner>R-GDLR-2406 está cerrada operativamente y todavía no es liquidable.</MockBanner> : null}
      {cut ? (
        <div className="grid gap-3 md:grid-cols-3">
          <KpiCard label="Rutas en corte" value={String(cut.routesCount)} />
          <KpiCard label="Liquidables" value={String(cut.liquidatableCount)} />
          <KpiCard label="Cobro oficial" value={formatMxn(cut.officialTotal.amount)} hint={`Estimado ${formatMxn(cut.estimateTotal.amount, { estimate: true })}`} />
        </div>
      ) : null}
      <DataTable
        caption="Rutas del corte"
        rows={routes.data?.items ?? []}
        onRowClick={(row) => navigate(`/liquidaciones/rutas/${row.id}`)}
        columns={[
          { key: 'f', header: 'Folio', render: (row) => row.folio },
          { key: 's', header: 'Estado operativo', render: (row) => ROUTE_STATE_LABELS[row.state] },
          {
            key: 'm',
            header: 'ML (tentativo, no contrato)',
            render: (row) => (
              <Badge tone="neutral">{ML_LIQUIDATION_LABELS[row.mlLiquidationState]}</Badge>
            ),
          },
          {
            key: 'l',
            header: '¿Liquidable?',
            render: (row) => (isOfficiallyLiquidatable(row.state) ? 'Sí (estado oficial de backend)' : 'No'),
          },
        ]}
      />
    </div>
  )
}

export function SettlementRoutePage() {
  const { id = '' } = useParams()
  const api = useApi()
  const { can } = useAuth()
  const query = useQuery({ queryKey: ['route', id], enabled: Boolean(api && id), queryFn: () => api!.getRoute(id) })
  if (query.isLoading) return <Skeleton />
  const route = query.data
  if (!route) return <PageHeader title="Ruta no encontrada" />
  const liquidatable = isOfficiallyLiquidatable(route.state)
  return (
    <div className="space-y-4">
      <PageHeader title={`Liquidación ${route.folio}`} subtitle={route.commercial.note} />
      <dl className="grid gap-3 rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4 md:grid-cols-2" data-testid="settlement-detail">
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Estado de ruta</dt><dd>{ROUTE_STATE_LABELS[route.state]}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Campo tentativo ML (no contrato)</dt><dd>{ML_LIQUIDATION_LABELS[route.mlLiquidationState]}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Banda</dt><dd>{route.commercial.tariffBandLabel}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Costo Vía Ágil</dt><dd>{formatMxn(route.commercial.viaAgilCost.amount)}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Ingreso esperado</dt><dd>{formatMxn(route.commercial.expectedRevenue.amount, { estimate: route.commercial.expectedRevenue.kind === 'estimate' })}</dd></div>
        <div><dt className="text-xs uppercase text-[var(--va-muted)]">Ingreso reconocido</dt><dd>{route.commercial.recognizedRevenue ? formatMxn(route.commercial.recognizedRevenue.amount) : 'No reconocido'}</dd></div>
      </dl>
      {!liquidatable ? (
        <p data-testid="cannot-force-liquidatable" className="rounded-xl bg-[#fff1d6] p-3 text-sm">
          Esta ruta no es liquidable todavía. {can('settlement.force_liquidatable') ? 'Tu capacidad de excepción no está habilitada en este tenant.' : 'No tienes capacidad para forzarla.'}
        </p>
      ) : (
        <p className="rounded-xl bg-[#d9f6ec] p-3 text-sm">Ruta liquidable conforme a fuente oficial.</p>
      )}
    </div>
  )
}

export function BillingPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Facturación" subtitle="CxC / CxP y estatus de factura registrado en Odoo. Esta pantalla no publica asientos." />
      <p className="text-sm text-[var(--va-muted)]">Pendiente de contrato: documentos en borrador vs publicados, notas de crédito y analítica GDL R.</p>
    </div>
  )
}

export function ReportsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Reportes" subtitle="Por ruta, conductor, unidad, banda, plaza y periodo. Las exportaciones se auditan cuando el backend lo permita." />
    </div>
  )
}
