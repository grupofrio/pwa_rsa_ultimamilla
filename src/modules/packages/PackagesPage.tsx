import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, Donut, ErrorState, FilterBar, KpiCard, PageHeader, Panel, ProgressBar, SearchField, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { claims as seedClaims, money, returnManifest, routeStops, toneFor, type ClaimRecord } from '@/demo/operations'
import { JOURNEY_LEG_LABELS, PACKAGE_STATE_LABELS, ROUTE_STATE_LABELS } from '@/entities/states'
import { formatDateTime, formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { Camera, CheckCircle2, Clock3, FileCheck2, MapPin, PackageCheck, ScanLine, ShieldCheck, Signature } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function PackagesPage() {
  const api = useApi()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [state, setState] = useState('Todos')
  const query = useQuery({ queryKey: ['packages'], enabled: Boolean(api), queryFn: () => api!.listPackages() })
  if (!user) return null
  if (query.isLoading || !api) return <Skeleton />
  if (query.isError) return <ErrorState title="No se pudieron cargar paquetes" body="Revisa la conexión y vuelve a intentar." onRetry={() => void query.refetch()} />
  const all = query.data?.items ?? []
  const rows = all.filter((item) => `${item.tracking} ${item.recipientMasked}`.toLowerCase().includes(search.toLowerCase()) && (state === 'Todos' || PACKAGE_STATE_LABELS[item.state] === state))
  return (
    <div className="space-y-4">
      <PageHeader title="Custodia de paquetes" subtitle="Trazabilidad desde el escaneo en CEDIS hasta la entrega, devolución o aclaración." actions={<Link className="inline-flex min-h-11 items-center rounded-xl bg-[var(--va-navy)] px-4 text-sm font-semibold text-white" to="/aclaraciones"><FileCheck2 className="mr-2" size={17}/>Ver aclaraciones</Link>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="En custodia" value="874" hint="30 rutas del día" icon={<PackageCheck size={18}/>} /><KpiCard label="Entregados" value="746" hint="96.8% de efectividad" trend={{ value: '+1.6%', direction: 'up' }} icon={<CheckCircle2 size={18}/>} /><KpiCard label="Por devolver" value="11" hint="2 pendientes de acuse" icon={<Clock3 size={18}/>} /><KpiCard label="En aclaración" value="4" hint="$2,016 protegidos" icon={<ShieldCheck size={18}/>} /></section>
      <FilterBar><SearchField aria-label="Buscar guía o destinatario" placeholder="Buscar guía o destinatario" value={search} onChange={(event) => setSearch(event.target.value)}/><SelectField aria-label="Filtrar estado" value={state} onChange={(event) => setState(event.target.value)}><option>Todos</option>{[...new Set(all.map((item) => PACKAGE_STATE_LABELS[item.state]))].map((label) => <option key={label}>{label}</option>)}</SelectField><Badge tone="info">{rows.length} registros visibles</Badge></FilterBar>
      <DataTable caption="Paquetes" rows={rows} onRowClick={(row) => navigate(`/paquetes/${row.id}`)} columns={[
        { key: 'tracking', header: 'Guía', render: (row) => <div><strong>{row.tracking}</strong><p className="text-xs text-[var(--va-muted)]">{row.recipientMasked}</p></div> },
        { key: 'state', header: 'Estado', render: (row) => <Badge tone={row.claimedMissing ? 'danger' : row.state === 'delivered' ? 'ok' : 'info'}>{PACKAGE_STATE_LABELS[row.state]}</Badge> },
        { key: 'route', header: 'Ruta', render: (row) => routeLabel(row.routeId) },
        { key: 'custody', header: 'Custodio actual', render: (row) => row.state === 'delivered' ? 'Destinatario' : row.state === 'pending_return' ? 'Conductor' : 'Unidad asignada' },
        { key: 'when', header: 'Último movimiento', render: (row) => formatDateTime(row.lastEventAt, user.activeScope.timezone) },
        { key: 'claim', header: 'Control', render: (row) => row.claimedMissing ? <Badge tone="danger">Requiere aclaración</Badge> : <Badge tone="ok">Trazabilidad completa</Badge> },
      ]}/>
    </div>
  )
}

export function PackageDetailPage() {
  const { id = '' } = useParams()
  const api = useApi()
  const { user, can } = useAuth()
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)
  const query = useQuery({ queryKey: ['package', id], enabled: Boolean(api && id), queryFn: () => api!.getPackage(id) })
  if (!user) return null
  if (query.isLoading) return <Skeleton />
  if (!query.data) return <ErrorState title="Paquete no encontrado" body="Verifica la guía o el alcance seleccionado." />
  const item = query.data
  const proofCards = [
    { id: 'photo', icon: Camera, title: 'Fotografía de entrega', detail: 'Fachada y paquete visibles · 12:21:38' },
    { id: 'signature', icon: Signature, title: 'Firma del destinatario', detail: 'M. R***** · identidad protegida' },
    { id: 'gps', icon: MapPin, title: 'Ubicación validada', detail: '20.6842, -103.3681 · precisión 8 m' },
    { id: 'scan', icon: ScanLine, title: 'Escaneo de entrega', detail: 'Dispositivo REP-021 · guía coincidente' },
  ]
  return (
    <div className="space-y-4">
      <PageHeader title={item.tracking} subtitle={`${PACKAGE_STATE_LABELS[item.state]} · ${item.recipientMasked}`} actions={<Link className="inline-flex min-h-11 items-center rounded-xl border border-[var(--va-line)] bg-white px-4 text-sm font-semibold" to="/paquetes">Volver a paquetes</Link>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Ruta" value={routeLabel(item.routeId)} hint="VA-21 · Iván Gil"/><KpiCard label="Entrega" value="12:21" hint="30 ago 2026"/><KpiCard label="Geocerca" value="8 m" hint="Dentro del domicilio"/><KpiCard label="Expediente" value="Completo" hint={`${Math.max(4, item.evidence.length)} evidencias`}/></section>
      <div className="grid gap-4 xl:grid-cols-[.85fr_1.15fr]">
        <Panel><SectionHeader title="Cadena de custodia" subtitle="Cada cambio conserva actor, origen, hora y ubicación"/><ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[11px] before:top-2 before:w-0.5 before:bg-[var(--va-line)]">{item.custody.map((event, index) => <li key={event.id} className="relative flex gap-3"><span className="z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--va-teal)] text-[var(--va-navy)]"><CheckCircle2 size={14}/></span><div><p className="text-sm font-semibold">{event.description}</p><p className="text-xs text-[var(--va-muted)]">{formatDateTime(event.at, user.activeScope.timezone)} · {event.actor}</p><p className="text-xs text-[var(--va-muted)]">{event.locationLabel} · Evento {index + 1}/{item.custody.length}</p></div></li>)}</ol></Panel>
        <Panel><SectionHeader title="Prueba de entrega" subtitle="Expediente listo para responder una aclaración" action={<Badge tone="ok">Integridad validada</Badge>}/>
          {can('evidence.view') ? <div className="grid gap-3 sm:grid-cols-2">{proofCards.map((proof) => <button type="button" key={proof.id} onClick={() => setSelectedEvidence(proof.id)} className="group rounded-2xl border border-[var(--va-line)] bg-[var(--va-soft)] p-4 text-left transition hover:border-[var(--va-teal)]"><span className="grid h-20 place-items-center rounded-xl bg-gradient-to-br from-[var(--va-navy)] to-[var(--va-navy-400)] text-white"><proof.icon size={30}/></span><p className="mt-3 font-semibold">{proof.title}</p><p className="text-xs text-[var(--va-muted)]">{proof.detail}</p><p className="mt-2 text-xs font-semibold text-[var(--va-teal-700)]">Abrir evidencia</p></button>)}</div> : <StatusMessage tone="warn">Tu perfil no tiene acceso al contenido sensible de la evidencia.</StatusMessage>}
          {item.claimedMissing ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f6d79b] bg-[#fff7e8] p-3"><div><p className="font-semibold">Existe una aclaración abierta</p><p className="text-sm text-[var(--va-muted)]">El expediente contiene ubicación, fotografía, firma y escaneo.</p></div><Link className="text-sm font-bold text-[var(--va-teal-700)]" to="/aclaraciones">Abrir expediente</Link></div> : null}
        </Panel>
      </div>
      {selectedEvidence ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Visor de evidencia"><div className="w-full max-w-2xl rounded-2xl bg-white p-5"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">Evidencia protegida</h2><p className="text-sm text-[var(--va-muted)]">{proofCards.find((proof) => proof.id === selectedEvidence)?.detail}</p></div><Button type="button" variant="ghost" onClick={() => setSelectedEvidence(null)}>Cerrar</Button></div><div className="mt-4 grid min-h-80 place-items-center rounded-2xl bg-gradient-to-br from-[#0d314c] via-[#155477] to-[#12b8a6] text-white"><div className="text-center"><ShieldCheck className="mx-auto" size={54}/><p className="mt-3 text-xl font-bold">Evidencia íntegra</p><p className="text-sm text-white/75">Folio POD-2404-019 · sello 3F7A…91C2</p></div></div><div className="mt-4 grid gap-2 text-sm sm:grid-cols-3"><p><strong>Captura</strong><br/>30 ago · 12:21:38</p><p><strong>Ubicación</strong><br/>Coincide · precisión 8 m</p><p><strong>Dispositivo</strong><br/>REP-021 · autenticado</p></div></div></div> : null}
    </div>
  )
}

export function ReturnsPage() {
  const { can } = useAuth()
  const [rows, setRows] = useState(returnManifest)
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const pending = rows.filter((row) => row.state !== 'Devuelto con acuse').length
  return (
    <div className="space-y-4">
      <PageHeader title="Devoluciones a Mercado Libre" subtitle="Manifiesto, custodia y acuse para cada paquete no entregado." actions={can('package.return.manage') ? <Button type="button" onClick={() => setMessage('Manifiesto DEV-300826-05 generado con sello de integridad.')}>Generar manifiesto</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-3"><KpiCard label="Por devolver" value={String(pending)} hint="2 rutas con retorno"/><KpiCard label="Con acuse" value={String(rows.length - pending)} hint="Cadena cerrada"/><KpiCard label="Diferencias" value="1" hint="Documentada en CEDIS"/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <Panel><SectionHeader title="Manifiesto DEV-300826-05" subtitle="Cierre de jornada · responsable Ana Torres" action={<Badge tone={pending ? 'warn' : 'ok'}>{pending ? 'Pendiente de cierre' : 'Cerrado'}</Badge>}/><DataTable caption="Devoluciones" rows={rows} columns={[
        { key: 'tracking', header: 'Guía', render: (row) => <strong>{row.tracking}</strong> },
        { key: 'route', header: 'Ruta / unidad', render: (row) => <div>{row.route}<p className="text-xs text-[var(--va-muted)]">{row.unit}</p></div> },
        { key: 'cause', header: 'Causa', render: (row) => row.cause },
        { key: 'custody', header: 'Custodio', render: (row) => row.custody },
        { key: 'state', header: 'Estado', render: (row) => <Badge tone={toneFor(row.state)}>{row.state}</Badge> },
        { key: 'action', header: 'Acción', render: (row) => row.state !== 'Devuelto con acuse' && can('package.return.manage') ? <Button type="button" variant="ghost" onClick={() => setSelected(row.id)}>Registrar acuse</Button> : <Badge tone={row.state === 'Devuelto con acuse' ? 'ok' : 'warn'}>{row.state === 'Devuelto con acuse' ? 'Cerrado' : 'Sólo consulta'}</Badge> },
      ]}/></Panel>
      <ConfirmDialog open={Boolean(selected)} title="Registrar devolución a Mercado Libre" body="Confirma que el paquete fue recibido y que el acuse quedó asociado al manifiesto." confirmLabel="Cerrar custodia" onCancel={() => setSelected(null)} onConfirm={() => { setRows((current) => current.map((row) => row.id === selected ? { ...row, state: 'Devuelto con acuse', custody: 'Mercado Libre' } : row)); setSelected(null); setMessage('Devolución registrada y cadena de custodia cerrada.') }} />
    </div>
  )
}

export function ClaimsPage() {
  const { can } = useAuth()
  const [rows, setRows] = useState<ClaimRecord[]>(seedClaims)
  const [search, setSearch] = useState('')
  const [state, setState] = useState('Todos')
  const [selected, setSelected] = useState<ClaimRecord | null>(null)
  const [message, setMessage] = useState('')
  const filtered = rows.filter((row) => `${row.tracking} ${row.route} ${row.owner}`.toLowerCase().includes(search.toLowerCase()) && (state === 'Todos' || row.state === state))
  return (
    <div className="space-y-4">
      <PageHeader title="Aclaraciones y protección de ingresos" subtitle="Expedientes de entrega, descuentos y recuperaciones con SLA y responsable." actions={can('claim.manage') ? <Button type="button" onClick={() => setMessage('Nuevo expediente creado; queda listo para adjuntar el aviso de Mercado Libre.')}>Nueva aclaración</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Abiertas" value="2" hint="1 vence hoy"/><KpiCard label="Importe protegido" value={money(rows.filter((row) => !['No procedente','A favor'].includes(row.state)).reduce((sum, row) => sum + row.amount, 0))} hint="En análisis"/><KpiCard label="Recuperado este mes" value="$18,420" hint="87% favorable" trend={{value:'+9%',direction:'up'}}/><KpiCard label="Tiempo de respuesta" value="3.8 h" hint="Meta menor a 6 h"/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <FilterBar><SearchField aria-label="Buscar aclaración" placeholder="Buscar guía, ruta o responsable" value={search} onChange={(event) => setSearch(event.target.value)}/><SelectField aria-label="Filtrar estado" value={state} onChange={(event) => setState(event.target.value)}><option>Todos</option>{['Nuevo','En análisis','Enviado a ML','A favor','No procedente'].map((item) => <option key={item}>{item}</option>)}</SelectField></FilterBar>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <DataTable caption="Aclaraciones" rows={filtered} onRowClick={(row) => setSelected(row)} columns={[
          { key: 'package', header: 'Paquete', render: (row) => <div><strong>{row.tracking}</strong><p className="text-xs text-[var(--va-muted)]">{row.recipient}</p></div> },
          { key: 'route', header: 'Ruta / unidad', render: (row) => <div>{row.route}<p className="text-xs text-[var(--va-muted)]">{row.unit}</p></div> },
          { key: 'reason', header: 'Motivo', render: (row) => row.reason },
          { key: 'evidence', header: 'Expediente', render: (row) => <Badge tone={row.locationMatch ? 'ok' : 'warn'}>{row.evidence} evidencias</Badge> },
          { key: 'amount', header: 'Importe', render: (row) => <strong>{money(row.amount)}</strong> },
          { key: 'state', header: 'Estado', render: (row) => <Badge tone={toneFor(row.state)}>{row.state}</Badge> },
          { key: 'due', header: 'SLA', render: (row) => row.due },
        ]}/>
        <Panel><SectionHeader title="Resumen de protección" subtitle="Resultado de los últimos 30 días"/><Donut value={87} label="Casos favorables" detail="34 de 39 aclaraciones protegieron el ingreso"/><div className="mt-5 space-y-3"><ProgressBar value={100} label="Con fotografía"/><ProgressBar value={94} label="Con ubicación válida"/><ProgressBar value={91} label="Con firma o acuse"/><ProgressBar value={86} label="Enviadas dentro de SLA" tone="amber"/></div></Panel>
      </div>
      {selected ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="claim-title"><div className="w-full max-w-xl rounded-2xl bg-white p-5"><div className="flex justify-between gap-3"><div><h2 id="claim-title" className="text-lg font-bold">{selected.tracking}</h2><p className="text-sm text-[var(--va-muted)]">{selected.reason}</p></div><Button type="button" variant="ghost" onClick={() => setSelected(null)}>Cerrar</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Panel><p className="text-xs text-[var(--va-muted)]">Validación geográfica</p><p className="mt-1 font-bold">{selected.locationMatch ? 'Coincide con domicilio' : 'Requiere explicación'}</p></Panel><Panel><p className="text-xs text-[var(--va-muted)]">Importe protegido</p><p className="mt-1 font-bold">{money(selected.amount)}</p></Panel></div><div className="mt-4 rounded-xl bg-[var(--va-soft)] p-3 text-sm"><p className="font-semibold">Expediente listo</p><p className="mt-1 text-[var(--va-muted)]">Fotografía · firma · escaneo · ubicación · secuencia GPS · cadena de custodia</p></div>{can('claim.manage') && !['A favor','No procedente'].includes(selected.state) ? <Button className="mt-4 w-full" type="button" onClick={() => { setRows((current) => current.map((row) => row.id === selected.id ? { ...row, state: 'Enviado a ML' } : row)); setMessage(`${selected.tracking}: aclaración enviada y registrada en auditoría.`); setSelected(null) }}>Enviar aclaración a Mercado Libre</Button> : null}</div></div> : null}
    </div>
  )
}

export function RouteDetailPage() {
  const { id = '' } = useParams()
  const api = useApi()
  const { user, can } = useAuth()
  const [message, setMessage] = useState('')
  const query = useQuery({ queryKey: ['route', id], enabled: Boolean(api && id), queryFn: () => api!.getRoute(id) })
  if (!user) return null
  if (query.isLoading) return <Skeleton />
  if (!query.data) return <ErrorState title="Ruta no encontrada" body="El identificador no existe en el alcance activo." />
  const route = query.data
  const progress = route.packagesExpected ? Math.round((route.packagesDelivered / route.packagesExpected) * 100) : 0
  return (
    <div className="space-y-4">
      <PageHeader title={route.folio} subtitle={`${route.driver.name} · ${route.vehicle.code} · ${route.windowLabel}`} actions={can('driver.contact') || can('alert.manage') ? <div className="flex gap-2">{can('driver.contact') ? <Button type="button" variant="ghost" onClick={() => setMessage(`Contacto con ${route.driver.name} registrado en la bitácora.`)}>Contactar conductor</Button> : null}{can('alert.manage') ? <Button type="button" onClick={() => setMessage(`Intervención operativa creada para ${route.folio}.`)}>Crear intervención</Button> : null}</div> : undefined} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Estado" value={ROUTE_STATE_LABELS[route.state]} hint={JOURNEY_LEG_LABELS[route.journeyLeg]}/><KpiCard label="Avance" value={`${progress}%`} hint={`${route.packagesDelivered}/${route.packagesExpected} entregados`}/><KpiCard label="ETA término" value="15:42" hint="Dentro de ventana"/><KpiCard label="Distancia" value={`${route.distance.actualRouteKm ?? 74} km`} hint={`${route.distance.offPolicyKm ?? 0} km fuera de política`}/></section>
      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <Panel><SectionHeader title="Secuencia de paradas" subtitle="Ruta optimizada y avance en tiempo real" action={<Badge tone="info">GPS hace 38 s</Badge>}/><div className="rounded-2xl bg-[var(--va-navy)] p-4 text-white"><div className="flex justify-between text-sm"><span>CEDIS GDL R</span><span>Zona Centro</span><span>Domicilio conductor</span></div><div className="mt-3"><ProgressBar value={46}/></div><p className="mt-3 text-xs text-white/60">Ruta oficial 112 km · recorridos 74 km · posicionamiento 18 km</p></div><ol className="mt-4 space-y-2">{routeStops.map((stop) => <li key={stop.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-xl border border-[var(--va-line)] p-3"><span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${stop.state === 'Entregado' ? 'bg-[#d9f6ec] text-[var(--va-success)]' : stop.state === 'En camino' ? 'bg-[#e4f0fb] text-[var(--va-info)]' : 'bg-[var(--va-soft)]'}`}>{stop.order}</span><div><p className="text-sm font-semibold">{stop.recipient} · {stop.zone}</p><p className="text-xs text-[var(--va-muted)]">{stop.proof}</p></div><div className="text-right"><p className="text-sm font-semibold">{stop.eta}</p><p className="text-xs text-[var(--va-muted)]">{stop.state}</p></div></li>)}</ol></Panel>
        <div className="space-y-4"><Panel><SectionHeader title="Indicadores de ruta"/><div className="space-y-3"><ProgressBar value={progress} label="Paquetes entregados"/><ProgressBar value={91} label="Adherencia a secuencia"/><ProgressBar value={96} label="Tiempo dentro de ventana"/><ProgressBar value={84} label="Rendimiento de combustible" tone="amber"/></div></Panel><Panel><SectionHeader title="Eventos recientes"/><ul className="space-y-3 text-sm">{route.events.slice(-4).reverse().map((event) => <li key={event.id} className="border-l-2 border-[var(--va-teal)] pl-3"><p className="font-semibold">{event.description}</p><p className="text-xs text-[var(--va-muted)]">{formatDateTime(event.at, user.activeScope.timezone)} · {event.locationLabel}</p></li>)}</ul></Panel>{can('settlement.view') || can('pnl.view') ? <Panel><SectionHeader title="Resumen económico"/><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-[var(--va-muted)]">Banda</p><p className="font-bold">{route.commercial.tariffBandLabel}</p></div><div><p className="text-xs text-[var(--va-muted)]">Ingreso esperado</p><p className="font-bold">{formatMxn(route.commercial.expectedRevenue.amount, { estimate: route.commercial.expectedRevenue.kind !== 'official' })}</p></div></div></Panel> : null}</div>
      </div>
    </div>
  )
}

function routeLabel(id: string) { return id.replace('rt_', 'R-GDLR-') }
