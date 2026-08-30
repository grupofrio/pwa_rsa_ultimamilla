import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, FilterBar, KpiCard, MiniTrend, PageHeader, Panel, ProgressBar, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { invoices as seedInvoices, money, reportCards, toneFor, weekTrend } from '@/demo/operations'
import { isOfficiallyLiquidatable, ROUTE_STATE_LABELS } from '@/entities/states'
import { formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckCircle2, Download, FileSpreadsheet, ReceiptText, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const confirmationLabels = { pending: 'Pendiente de confirmación', confirmed: 'Confirmada para cobro', rejected: 'Rechazada', not_applicable: 'No aplica' } as const

export function SettlementsPage() {
  const api = useApi()
  const { can } = useAuth()
  const query = useQuery({ queryKey: ['settlements'], enabled: Boolean(api), queryFn: () => api!.listSettlements() })
  const routes = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Todas')
  const [message, setMessage] = useState('')
  if (query.isLoading || !api) return <Skeleton />
  const all = routes.data?.items ?? []
  const rows = all.filter((row) => filter === 'Todas' || (filter === 'Liquidables' && isOfficiallyLiquidatable(row.state)) || (filter === 'Con diferencias' && (row.hasLoadDifference || row.packagesPendingReturn > 0)))
  return (
    <div className="space-y-4">
      <PageHeader title="Cortes y liquidaciones" subtitle="Cierre diario por ruta y camioneta con ingresos, costos, evidencias y bloqueadores." actions={can('settlement.prepare') ? <Button type="button" onClick={() => setMessage('Corte 30-08 actualizado: 26 rutas conciliadas y 1 diferencia abierta.')}>Actualizar corte</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Rutas del corte" value="30" hint="26 con jornada cerrada" icon={<ReceiptText size={18}/>} /><KpiCard label="Listas para cobro" value="24" hint="2 pendientes de confirmación" icon={<CheckCircle2 size={18}/>} /><KpiCard label="Ingreso confirmado" value={formatMxn(43840)} hint="Más $4,620 estimados" trend={{value:'+8.4%',direction:'up'}} icon={<Wallet size={18}/>} /><KpiCard label="Contribución estimada" value="$22,780" hint="51.9% del ingreso" icon={<BarChart3 size={18}/>} /></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <FilterBar><SelectField aria-label="Filtrar liquidaciones" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todas</option><option>Liquidables</option><option>Con diferencias</option></SelectField><Badge tone="warn">1 ruta requiere devolución</Badge><Badge tone="danger">1 aclaración abierta</Badge></FilterBar>
      <DataTable caption="Rutas del corte" rows={rows} onRowClick={(row) => navigate(`/liquidaciones/rutas/${row.id}`)} columns={[
        { key: 'route', header: 'Ruta / unidad', render: (row) => <div><strong>{row.folio}</strong><p className="text-xs text-[var(--va-muted)]">{row.vehicle.code} · {row.driver.name}</p></div> },
        { key: 'status', header: 'Cierre operativo', render: (row) => <Badge tone={isOfficiallyLiquidatable(row.state) ? 'ok' : row.packagesPendingReturn ? 'warn' : 'info'}>{ROUTE_STATE_LABELS[row.state]}</Badge> },
        { key: 'packages', header: 'Paquetes', render: (row) => <div><p className="font-semibold">{row.packagesDelivered}/{row.packagesExpected}</p><p className="text-xs text-[var(--va-muted)]">{row.packagesPendingReturn} devolución</p></div> },
        { key: 'distance', header: 'Km / banda', render: (row) => <div><p>{row.distance.actualRouteKm ?? row.distance.officialRouteKm} km</p><p className="text-xs text-[var(--va-muted)]">{bandFor(row.distance.officialRouteKm ?? 0)}</p></div> },
        { key: 'revenue', header: 'Ingreso', render: (row) => <div><p className="font-bold">{money(revenueFor(row.distance.officialRouteKm ?? 0))}</p><p className="text-xs text-[var(--va-muted)]">{confirmationLabels[row.mlLiquidationState]}</p></div> },
        { key: 'costs', header: 'Costos', render: (row) => <div><p>{money(1120 + ((row.distance.actualRouteKm ?? 0) % 7) * 34)}</p><p className="text-xs text-[var(--va-muted)]">Chofer + combustible + gastos</p></div> },
        { key: 'margin', header: 'Contribución', render: (row) => <div><p className="font-bold text-[var(--va-success)]">{money(revenueFor(row.distance.officialRouteKm ?? 0)-1120)}</p><ProgressBar value={48}/></div> },
        { key: 'ready', header: 'Validación', render: (row) => isOfficiallyLiquidatable(row.state) ? <Badge tone="ok">Lista para corte</Badge> : <Badge tone="warn">{row.packagesPendingReturn ? 'Cerrar devolución' : 'Esperar confirmación'}</Badge> },
      ]}/>
    </div>
  )
}

export function SettlementRoutePage() {
  const { id = '' } = useParams()
  const { can } = useAuth()
  const api = useApi()
  const query = useQuery({ queryKey: ['route', id], enabled: Boolean(api && id), queryFn: () => api!.getRoute(id) })
  const [message, setMessage] = useState('')
  if (query.isLoading) return <Skeleton />
  const route = query.data
  if (!route) return <PageHeader title="Ruta no encontrada" />
  const liquidatable = isOfficiallyLiquidatable(route.state)
  const revenue = route.commercial.recognizedRevenue?.amount ?? route.commercial.expectedRevenue.amount
  const driverPay = 700
  const fuel = route.fuelEstimate?.amount?.amount ?? 420
  const expenses = route.folio.endsWith('4') ? 85 : 0
  const discounts = route.commercial.discounts.amount
  const contribution = revenue - driverPay - fuel - expenses - discounts - route.commercial.viaAgilCost.amount
  return (
    <div className="space-y-4">
      <PageHeader title={`Liquidación ${route.folio}`} subtitle={`${route.vehicle.code} · ${route.driver.name} · ${bandFor(route.distance.officialRouteKm ?? 0)}`} actions={<Button type="button" variant="ghost" onClick={() => setMessage('Expediente descargado con ruta, POD, gastos y bitácora.')}>Descargar expediente</Button>} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Ingreso de ruta" value={money(revenue)} hint={confirmationLabels[route.mlLiquidationState]}/><KpiCard label="Costo operativo" value={money(driverPay+fuel+expenses)} hint="Chofer + combustible + gastos"/><KpiCard label="Servicio Vía Ágil" value={money(route.commercial.viaAgilCost.amount)} hint="Ruta liquidable"/><KpiCard label="Contribución" value={money(contribution)} hint={`${Math.round((contribution/revenue)*100)}% del ingreso`}/></section>
      {!liquidatable ? <p data-testid="cannot-force-liquidatable" className="rounded-xl border border-[#f6d79b] bg-[#fff7e8] p-3 text-sm"><strong>Esta ruta todavía no puede liquidarse.</strong> Completa los bloqueadores mostrados abajo; la interfaz no permite convertirla manualmente en liquidable.</p> : <StatusMessage>Ruta lista para incorporarse al corte conforme a la confirmación recibida.</StatusMessage>}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Panel><SectionHeader title="Conciliación de la ruta" subtitle="Cada componente conserva fuente y evidencia"/><div className="divide-y divide-[var(--va-line)]">{[
          ['Ingreso por ruta', confirmationLabels[route.mlLiquidationState], money(revenue), liquidatable ? 'Validado' : 'Pendiente'],
          ['Pago del conductor', 'Tarifa fija por ruta cumplida', money(driverPay), 'Validado'],
          ['Combustible', `${route.fuelEstimate?.liters ?? 50} L · estación autorizada`, money(fuel), 'Conciliado'],
          ['Gastos', expenses ? 'Estacionamiento con comprobante' : 'Sin gastos adicionales', money(expenses), 'Conciliado'],
          ['Descuentos y aclaraciones', discounts ? 'Descuento confirmado' : 'Sin descuentos aplicados', money(discounts), discounts ? 'Revisado' : 'Sin novedad'],
          ['Servicio Vía Ágil', bandFor(route.distance.officialRouteKm ?? 0), money(route.commercial.viaAgilCost.amount), liquidatable ? 'Generado' : 'No generado'],
        ].map(([concept,detail,amount,state]) => <div key={concept} className="grid grid-cols-[1fr_auto] gap-3 py-3"><div><p className="font-semibold">{concept}</p><p className="text-xs text-[var(--va-muted)]">{detail}</p></div><div className="text-right"><p className="font-bold">{amount}</p><Badge tone={state === 'Pendiente' || state === 'No generado' ? 'warn' : 'ok'}>{state}</Badge></div></div>)}</div></Panel>
        <div className="space-y-4"><Panel><SectionHeader title="Validaciones de cierre"/><ul className="space-y-3">{[
          ['Jornada GPS completa', true],['Carga conciliada', !route.hasLoadDifference],['Paquetes entregados o devueltos', route.packagesPendingReturn === 0],['Pruebas de entrega disponibles', true],['Confirmación para cobro', liquidatable],['Gastos conciliados', true],
        ].map(([label,ok]) => <li key={String(label)} className="flex items-center justify-between gap-3"><span className="text-sm">{String(label)}</span><Badge tone={ok ? 'ok' : 'warn'}>{ok ? 'Completo' : 'Pendiente'}</Badge></li>)}</ul></Panel><Panel><SectionHeader title="Resultado"/><div className="rounded-2xl bg-[var(--va-navy)] p-4 text-white"><p className="text-xs text-white/55">Contribución estimada</p><p className="mt-1 text-3xl font-bold">{money(contribution)}</p><div className="mt-4"><ProgressBar value={Math.max(0,Math.round((contribution/revenue)*100))}/></div></div>{liquidatable && can('settlement.prepare') ? <Button className="mt-4 w-full" type="button" onClick={() => setMessage(`${route.folio} incorporada al corte diario.`)}>Incorporar al corte</Button> : null}</Panel></div>
      </div>
    </div>
  )
}

export function BillingPage() {
  const { can } = useAuth()
  const [rows, setRows] = useState(seedInvoices)
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-4">
      <PageHeader title="Facturación" subtitle="Pre-factura, aprobación, emisión y seguimiento de cobro por periodo." actions={can('billing.prepare') ? <Button type="button" onClick={() => setMessage('Pre-factura actualizada con las rutas liquidables del periodo.')}>Preparar periodo</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Por facturar" value="$16,970" hint="Periodo 25–31 ago"/><KpiCard label="Emitido este mes" value="$44,440" hint="3 documentos"/><KpiCard label="Cobrado" value="$14,365" hint="32% del mes"/><KpiCard label="Recuperaciones" value="$2,575" hint="Aclaraciones favorables" trend={{value:'+18%',direction:'up'}}/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <DataTable caption="Facturación" rows={rows} columns={[
        { key: 'period', header: 'Periodo', render: (row) => <strong>{row.period}</strong> },
        { key: 'client', header: 'Cliente', render: (row) => row.client },
        { key: 'routes', header: 'Rutas', render: (row) => row.routes },
        { key: 'base', header: 'Servicio base', render: (row) => money(row.base) },
        { key: 'extras', header: 'Bandas adicionales', render: (row) => money(row.extras) },
        { key: 'recoveries', header: 'Recuperaciones', render: (row) => money(row.recoveries) },
        { key: 'total', header: 'Total', render: (row) => <strong>{money(row.total)}</strong> },
        { key: 'state', header: 'Estado', render: (row) => <Badge tone={toneFor(row.state)}>{row.state}</Badge> },
        { key: 'action', header: 'Acción', render: (row) => can('invoice.approve') && row.state === 'Pre-factura' ? <Button type="button" onClick={() => setSelected(row.id)}>Aprobar</Button> : <Button type="button" variant="ghost" onClick={() => setMessage(`Documento ${row.id.toUpperCase()} abierto.`)}>Ver detalle</Button> },
      ]}/>
      <ConfirmDialog open={Boolean(selected)} title="Aprobar pre-factura" body="Confirma rutas, bandas adicionales, recuperaciones e impuestos antes de enviar a emisión." confirmLabel="Aprobar" onCancel={() => setSelected(null)} onConfirm={() => { setRows((current) => current.map((row) => row.id === selected ? { ...row, state: 'Aprobada' } : row)); setSelected(null); setMessage('Pre-factura aprobada y enviada al flujo de emisión.') }} />
    </div>
  )
}

export function ReportsPage() {
  const [period, setPeriod] = useState('Últimos 30 días')
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-4">
      <PageHeader title="Reportes" subtitle="Indicadores operativos, financieros y de servicio por periodo, plaza, ruta y unidad." actions={<Button type="button" onClick={() => setMessage('Reporte ejecutivo exportado; el evento quedó registrado en auditoría.')}><Download size={17}/>Exportar resumen</Button>} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <FilterBar><SelectField aria-label="Periodo del reporte" value={period} onChange={(event) => setPeriod(event.target.value)}><option>Hoy</option><option>Últimos 7 días</option><option>Últimos 30 días</option><option>Agosto 2026</option></SelectField><SelectField aria-label="Plaza"><option>Guadalajara</option></SelectField><Badge tone="ok">Datos consolidados</Badge></FilterBar>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{reportCards.map((report) => <Panel key={report.id} className="relative overflow-hidden"><span className="absolute inset-y-0 left-0 w-1.5" style={{background:report.accent}}/><div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--va-soft)]" style={{color:report.accent}}><FileSpreadsheet size={20}/></span><div><h2 className="font-bold">{report.title}</h2><p className="mt-1 text-sm text-[var(--va-muted)]">{report.description}</p><p className="mt-3 text-xs text-[var(--va-muted)]">Actualizado {report.updated}</p></div></div><div className="mt-4 flex gap-2"><Button type="button" variant="ghost" onClick={() => setMessage(`${report.title}: vista analítica abierta para ${period.toLowerCase()}.`)}><BarChart3 size={15}/>Abrir</Button><Button type="button" variant="ghost" onClick={() => setMessage(`${report.title}: exportación preparada.`)}><Download size={15}/>Exportar</Button></div></Panel>)}</div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><Panel><SectionHeader title="Efectividad de entrega" subtitle={`${period} · Guadalajara`}/><MiniTrend values={weekTrend}/><div className="mt-3 grid grid-cols-3 gap-3 text-center"><div><p className="text-2xl font-bold">96.8%</p><p className="text-xs text-[var(--va-muted)]">Efectividad</p></div><div><p className="text-2xl font-bold">3.8 h</p><p className="text-xs text-[var(--va-muted)]">Respuesta a aclaración</p></div><div><p className="text-2xl font-bold">8.2</p><p className="text-xs text-[var(--va-muted)]">km/L</p></div></div></Panel><Panel><SectionHeader title="Composición del costo"/><div className="space-y-4"><ProgressBar value={52} label="Pago de conductores" tone="navy"/><ProgressBar value={28} label="Combustible"/><ProgressBar value={13} label="Mantenimiento" tone="amber"/><ProgressBar value={7} label="Otros gastos"/></div><div className="mt-5 grid grid-cols-2 gap-3"><KpiCard label="Costo por ruta" value="$1,116"/><KpiCard label="Costo por km" value="$3.52"/></div></Panel></div>
    </div>
  )
}

function bandFor(km: number) { return km < 100 ? 'Menos de 100 km' : km <= 120 ? '100 a 120 km' : '121 a 150 km' }
function revenueFor(km: number) { return km < 100 ? 1450 : km <= 120 ? 1750 : 2050 }
