import { KpiCard, MockBanner, PageHeader, Provenance, Skeleton } from '@/design-system/components/ui'
import { formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export function ManagementPage() {
  const api = useApi()
  const kpis = useQuery({ queryKey: ['mgmt'], enabled: Boolean(api), queryFn: () => api!.getManagementKpis() })
  const copilot = useQuery({ queryKey: ['copilot'], enabled: Boolean(api), queryFn: () => api!.listCopilot() })
  if (kpis.isLoading || !api) return <Skeleton />
  const data = kpis.data
  if (!data) return null
  return (
    <div className="space-y-4">
      <PageHeader title="Tablero gerencial" subtitle="Consulta y aprobaciones por excepción. El copiloto no ejecuta acciones sensibles." />
      {api.kind === 'mock' ? <MockBanner>El P&L mostrado mezcla oficiales y estimaciones, cada una etiquetada.</MockBanner> : null}
      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard label="Debían salir" value={String(data.unitsDue)} />
        <KpiCard label="Salieron" value={String(data.unitsDeparted)} />
        <KpiCard label="Terminaron" value={String(data.unitsFinished)} />
        <KpiCard label="En riesgo" value={String(data.routesAtRisk)} />
        <KpiCard label="Paquetes abiertos" value={String(data.openPackages)} />
        <KpiCard label="Se espera cobrar" value={formatMxn(data.expectedCollect.amount, { estimate: true })} />
        <KpiCard label="Cobro confirmado" value={formatMxn(data.confirmedCollect.amount)} />
        <KpiCard label="Contribución" value={formatMxn(data.contribution.amount, { estimate: data.contribution.kind === 'estimate' })} hint="No es P&L oficial si está etiquetada como estimación" />
      </div>
      <Provenance {...data.provenance} />
      <section>
        <h2 className="font-semibold">Dónde se pierde dinero (estimación)</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data.lossDrivers.map((item) => (
            <li key={item.label}>
              {item.label}: {formatMxn(item.amount.amount, { estimate: true })}
            </li>
          ))}
        </ul>
        <Link className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--va-teal-700)]" to="/flota/unidades/vh_21">
          Bajar a detalle de unidad VA-21
        </Link>
      </section>
      <section className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4" data-testid="copilot-panel">
        <h2 className="font-semibold">Copiloto</h2>
        <p className="text-xs text-[var(--va-muted)]">Recomendaciones citadas. Nunca inventa datos ni ejecuta sin contrato y aprobación.</p>
        <ul className="mt-3 space-y-3">
          {(copilot.data ?? []).map((item) => (
            <li key={item.id} className="border-t border-[var(--va-line)] pt-3">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm">{item.body}</p>
              <p className="text-xs text-[var(--va-muted)]">
                Periodo {item.period} · confianza {item.confidence} · cita {item.cited.join(', ')}
                {item.requiresApproval ? ' · requiere aprobación' : ''}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
