import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, Donut, FilterBar, KpiCard, PageHeader, Panel, ProgressBar, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { expenses as seedExpenses, money, toneFor } from '@/demo/operations'
import { formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import type { RouteSummary } from '@/services/api/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fuel, Gauge, ReceiptText, Route, TrendingDown } from 'lucide-react'
import { useState } from 'react'

export function FuelPage() {
  const api = useApi()
  const { can } = useAuth()
  const client = useQueryClient()
  const [target, setTarget] = useState<string | null>(null)
  const [reason, setReason] = useState('Carga autorizada según distancia, rendimiento histórico y combustible disponible.')
  const [message, setMessage] = useState<string | null>(null)
  const [band, setBand] = useState('Todas')
  const query = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const authorize = useMutation({
    mutationFn: async () => { if (!api || !target) return; const row = query.data?.items.find((item) => item.id === target); const estimate = row?.fuelEstimate; if (!estimate?.amount || estimate.liters == null) throw new Error('La ruta no tiene una sugerencia vigente.'); return api.authorizeFuel({ routeId: target, amount: estimate.amount.amount, liters: estimate.liters, station: 'Estación autorizada GDL', reason, capability: 'fuel.authorize', idempotencyKey: crypto.randomUUID() }) },
    onSuccess: async () => { setMessage('Autorización registrada. Folio COMB-300826-184 creado para la gasolinera autorizada.'); setTarget(null); await client.invalidateQueries() },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'No fue posible autorizar'),
  })
  if (query.isLoading || !api) return <Skeleton />
  const rows = (query.data?.items ?? []).filter((row) => band === 'Todas' || row.windowLabel.includes(band))
  const baseColumns = [
    { key: 'route', header: 'Ruta / unidad', render: (row: RouteSummary) => <div><strong>{row.folio}</strong><p className="text-xs text-[var(--va-muted)]">{row.vehicle.code} · {row.driver.name}</p></div> },
    { key: 'distance', header: 'Distancia', render: (row: RouteSummary) => <div><p>{row.distance.officialRouteKm ?? '—'} km planeados</p><p className="text-xs text-[var(--va-muted)]">{row.distance.actualRouteKm ?? 0} km recorridos</p></div> },
    { key: 'yield', header: 'Rendimiento', render: (row: RouteSummary) => <div className="min-w-28"><p className="font-semibold">{row.vehicle.code === 'VA-21' ? '7.6' : '8.4'} km/L</p><ProgressBar value={row.vehicle.code === 'VA-21' ? 76 : 92} tone={row.vehicle.code === 'VA-21' ? 'amber' : 'teal'}/></div> },
    { key: 'suggestion', header: 'Sugerencia', render: (row: RouteSummary) => { const estimate = row.fuelEstimate; return estimate?.amount && estimate.liters != null ? <div><p className="font-bold">{formatMxn(estimate.amount.amount, { estimate: estimate.amount.kind !== 'official' })}</p><p className="text-xs text-[var(--va-muted)]">{estimate.liters} L · Estación GDL</p></div> : <Badge tone="warn">Requiere cálculo</Badge> } },
    { key: 'reason', header: 'Explicación', render: (row: RouteSummary) => <span className="text-xs text-[var(--va-muted)]">Ruta {row.distance.officialRouteKm ?? 0} km + posicionamiento {row.distance.positioningKm ?? 0} km + reserva 8%</span> },
  ]
  const columns = can('fuel.authorize') ? [...baseColumns, { key: 'action', header: 'Acción', render: (row: RouteSummary) => <Button type="button" data-testid={`fuel-${row.id}`} onClick={() => setTarget(row.id)}>Autorizar</Button> }] : baseColumns
  return (
    <div className="space-y-4">
      <PageHeader title="Combustible" subtitle="Sugerencia explicada por distancia, rendimiento, carga anterior y reserva operativa." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Costo de hoy" value="$11,840" hint="26 rutas autorizadas" icon={<Fuel size={18}/>} /><KpiCard label="Rendimiento flota" value="8.2 km/L" hint="Objetivo 8.4 km/L" trend={{value:'+0.3',direction:'up'}} icon={<Gauge size={18}/>} /><KpiCard label="Costo por km" value="$3.52" hint="4.8% menor al mes anterior" trend={{value:'-$0.18',direction:'down',positive:true}} icon={<Route size={18}/>} /><KpiCard label="Anomalías" value="2" hint="Ralentí y rendimiento" icon={<TrendingDown size={18}/>} /></section>
      {message ? <StatusMessage tone={message.includes('registrada') ? 'ok' : 'danger'}><span data-testid="fuel-feedback">{message}</span></StatusMessage> : null}
      <FilterBar><SelectField aria-label="Filtrar combustible por banda" value={band} onChange={(event) => setBand(event.target.value)}><option>Todas</option><option>05:30</option><option>06:00</option><option>07:30</option></SelectField><Badge tone="ok">Política aplicada</Badge><span className="text-xs text-[var(--va-muted)]">Solo se muestran litros y monto respaldados por la sugerencia vigente.</span></FilterBar>
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]"><DataTable caption="Sugerencias de combustible" rows={rows} columns={columns}/><Panel><SectionHeader title="Eficiencia del mes" subtitle="Consumo reconocido vs objetivo"/><Donut value={94} label="Dentro de política" detail="28 de 30 unidades sin variaciones críticas"/><div className="mt-5 space-y-3"><ProgressBar value={97} label="Cargas con evidencia"/><ProgressBar value={92} label="Rendimiento objetivo"/><ProgressBar value={88} label="Ralentí controlado" tone="amber"/></div></Panel></div>
      <ConfirmDialog open={Boolean(target)} title="Autorizar combustible" body="La autorización registra monto, litros, estación, ruta, responsable y motivo." confirmLabel="Autorizar" reason={reason} onReason={setReason} onCancel={() => setTarget(null)} onConfirm={() => authorize.mutate()} />
    </div>
  )
}

export function ExpensesPage() {
  const { can } = useAuth()
  const [rows, setRows] = useState(seedExpenses)
  const [filter, setFilter] = useState('Todos')
  const [captureOpen, setCaptureOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('Comprobante y ruta verificados contra la jornada.')
  const visible = rows.filter((row) => filter === 'Todos' || row.state === filter)
  const pending = rows.filter((row) => !['Conciliado','Aprobado'].includes(row.state)).reduce((sum,row) => sum + row.amount,0)
  return (
    <div className="space-y-4">
      <PageHeader title="Gastos operativos" subtitle="Captura, comprobación y conciliación por ruta, unidad y centro de costo." actions={can('expense.capture') ? <Button type="button" onClick={() => setCaptureOpen(true)}>Capturar gasto</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Gasto del día" value="$1,119" hint="4 movimientos" icon={<ReceiptText size={18}/>} /><KpiCard label="Por conciliar" value={money(pending)} hint="2 movimientos"/><KpiCard label="Con comprobante" value="75%" hint="1 requiere evidencia"/><KpiCard label="Costo por ruta" value="$43" hint="6% bajo objetivo" trend={{value:'-$3',direction:'down',positive:true}}/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <FilterBar><SelectField aria-label="Filtrar gastos" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todos</option><option>Por conciliar</option><option>Conciliado</option><option>Aprobado</option><option>Falta comprobante</option></SelectField></FilterBar>
      <DataTable caption="Gastos operativos" rows={visible} columns={[
        { key: 'date', header: 'Fecha', render: (row) => row.date },
        { key: 'route', header: 'Ruta / unidad', render: (row) => <div><strong>{row.route}</strong><p className="text-xs text-[var(--va-muted)]">{row.unit}</p></div> },
        { key: 'concept', header: 'Concepto', render: (row) => <div><p className="font-medium">{row.concept}</p><p className="text-xs text-[var(--va-muted)]">{row.provider}</p></div> },
        { key: 'amount', header: 'Importe', render: (row) => <div><strong>{money(row.amount)}</strong><p className="text-xs text-[var(--va-muted)]">IVA {money(row.tax)}</p></div> },
        { key: 'evidence', header: 'Comprobante', render: (row) => <Badge tone={row.evidence ? 'ok' : 'danger'}>{row.evidence ? 'Adjunto' : 'Faltante'}</Badge> },
        { key: 'state', header: 'Estado', render: (row) => <Badge tone={toneFor(row.state)}>{row.state}</Badge> },
        { key: 'action', header: 'Acción', render: (row) => can('expense.reconcile') && row.state === 'Por conciliar' ? <Button type="button" onClick={() => setSelected(row.id)}>Conciliar</Button> : <Button type="button" variant="ghost" onClick={() => setMessage(`Comprobante ${row.id.toUpperCase()} abierto.`)}>Ver evidencia</Button> },
      ]}/>
      {captureOpen ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Capturar gasto"><div className="w-full max-w-lg rounded-2xl bg-white p-5"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Capturar gasto</h2><p className="text-sm text-[var(--va-muted)]">Asocia comprobante, ruta y unidad.</p></div><Button type="button" variant="ghost" onClick={() => setCaptureOpen(false)}>Cerrar</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Ruta<SelectField className="mt-1 w-full"><option>R-GDLR-2404</option><option>R-GDLR-2405</option></SelectField></label><label className="text-sm font-semibold">Concepto<SelectField className="mt-1 w-full"><option>Estacionamiento</option><option>Peaje</option><option>Reparación menor</option></SelectField></label><label className="text-sm font-semibold">Importe<input className="mt-1 min-h-11 w-full rounded-xl border border-[var(--va-line)] px-3" defaultValue="120"/></label><label className="text-sm font-semibold">Comprobante<input className="mt-1 min-h-11 w-full rounded-xl border border-[var(--va-line)] p-2" type="file"/></label></div><Button className="mt-4 w-full" type="button" onClick={() => { setCaptureOpen(false); setMessage('Gasto capturado y enviado a conciliación.') }}>Guardar gasto</Button></div></div> : null}
      <ConfirmDialog open={Boolean(selected)} title="Conciliar gasto" body="Confirma que el movimiento corresponde a la ruta, unidad y evidencia presentada." confirmLabel="Conciliar" reason={reason} onReason={setReason} onCancel={() => setSelected(null)} onConfirm={() => { setRows((current) => current.map((row) => row.id === selected ? { ...row, state: 'Conciliado' } : row)); setSelected(null); setMessage('Gasto conciliado e incorporado al corte de la ruta.') }} />
    </div>
  )
}
