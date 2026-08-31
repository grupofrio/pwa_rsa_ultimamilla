import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, FilterBar, KpiCard, PageHeader, Panel, ProgressBar, SearchField, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { useApi } from '@/services/api/useApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Headphones, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const alertState = { open: 'Abierta', in_progress: 'En atención', resolved: 'Resuelta' } as const
const severity = { critical: 'Crítica', warning: 'Preventiva', info: 'Informativa' } as const

export function AlertsPage() {
  const api = useApi()
  const { can } = useAuth()
  const client = useQueryClient()
  const [note, setNote] = useState('Conductor contactado; confirma retorno a la secuencia autorizada.')
  const [target, setTarget] = useState<string | null>(null)
  const [mode, setMode] = useState<'contact' | 'resolve'>('contact')
  const [filter, setFilter] = useState('Todas')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')
  const query = useQuery({ queryKey: ['alerts'], enabled: Boolean(api), queryFn: () => api!.listAlerts() })
  const mutate = useMutation({
    mutationFn: async () => { if (!api || !target) return; return mode === 'contact' ? api.contactDriver({ alertId: target, note, capability: 'driver.contact', idempotencyKey: crypto.randomUUID(), reason: note }) : api.resolveAlert({ alertId: target, reason: note, capability: 'alert.resolve', idempotencyKey: crypto.randomUUID() }) },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['alerts'] }); setFeedback(mode === 'contact' ? 'Contacto registrado y SLA actualizado.' : 'Alerta resuelta y bitácora actualizada.'); setTarget(null) },
  })
  if (query.isLoading || !api) return <Skeleton />
  const all = query.data?.items ?? []
  const rows = all.filter((row) => `${row.title} ${row.ownerName ?? ''}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Todas' || severity[row.severity] === filter || alertState[row.state] === filter))
  return (
    <div className="space-y-4">
      <PageHeader title="Alertas operativas" subtitle="Bandeja priorizada con responsable, SLA, contacto, evidencia y resolución." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Abiertas" value={String(all.filter((item) => item.state === 'open').length)} hint="1 crítica"/><KpiCard label="En atención" value={String(all.filter((item) => item.state === 'in_progress').length)} hint="Responsable asignado"/><KpiCard label="SLA promedio" value="18 min" hint="Meta menor a 30 min" trend={{value:'-6 min',direction:'down',positive:true}}/><KpiCard label="Resueltas hoy" value="14" hint="92% dentro de SLA"/></section>
      {feedback ? <StatusMessage>{feedback}</StatusMessage> : null}
      <FilterBar><SearchField aria-label="Buscar alerta" placeholder="Buscar alerta o responsable" value={search} onChange={(event) => setSearch(event.target.value)}/><SelectField aria-label="Filtrar alertas" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todas</option><option>Crítica</option><option>Preventiva</option><option>Abierta</option><option>En atención</option><option>Resuelta</option></SelectField></FilterBar>
      <DataTable caption="Alertas" rows={rows} columns={[
        { key: 'title', header: 'Alerta', render: (row) => <div><span className="font-semibold" data-testid={`alert-${row.id}`}>{row.title}</span><p className="text-xs text-[var(--va-muted)]">Creada hace {row.severity === 'critical' ? '12' : '27'} min</p></div> },
        { key: 'sev', header: 'Prioridad', render: (row) => <Badge tone={row.severity === 'critical' ? 'danger' : row.severity === 'warning' ? 'warn' : 'info'}>{severity[row.severity]}</Badge> },
        { key: 'state', header: 'Estado', render: (row) => <Badge tone={row.state === 'resolved' ? 'ok' : row.state === 'in_progress' ? 'info' : 'warn'}>{alertState[row.state]}</Badge> },
        { key: 'owner', header: 'Responsable', render: (row) => row.ownerName ?? 'Por asignar' },
        { key: 'route', header: 'Ruta', render: (row) => <Link className="font-semibold text-[var(--va-teal-700)]" to={`/torre/rutas/${row.routeId}`}>{row.routeId.replace('rt_','R-GDLR-')}</Link> },
        { key: 'sla', header: 'SLA', render: (row) => <div className="min-w-24"><p className="text-sm font-semibold">{row.state === 'resolved' ? 'Cumplido' : row.severity === 'critical' ? '18 min' : '46 min'}</p><ProgressBar value={row.state === 'resolved' ? 100 : row.severity === 'critical' ? 78 : 42} tone={row.severity === 'critical' ? 'danger' : 'amber'}/></div> },
        { key: 'act', header: 'Gestión', render: (row) => <div className="flex gap-2">{can('driver.contact') && row.state !== 'resolved' ? <Button type="button" variant="ghost" data-testid={`contact-${row.id}`} onClick={() => { setMode('contact'); setTarget(row.id) }}><Phone size={15}/>Contactar</Button> : null}{can('alert.resolve') && row.state !== 'resolved' ? <Button type="button" data-testid={`resolve-${row.id}`} onClick={() => { setMode('resolve'); setTarget(row.id) }}>Resolver</Button> : null}{row.state === 'resolved' ? <Badge tone="ok"><ShieldCheck size={13}/>Cerrada</Badge> : null}</div> },
      ]}/>
      <ConfirmDialog open={Boolean(target)} title={mode === 'contact' ? 'Registrar contacto con conductor' : 'Resolver alerta'} body={mode === 'contact' ? 'La llamada, respuesta y siguiente compromiso quedarán en la bitácora.' : 'Confirma la causa, solución y evidencia que permiten cerrar la alerta.'} confirmLabel={mode === 'contact' ? 'Guardar contacto' : 'Resolver'} reason={note} onReason={setNote} onCancel={() => setTarget(null)} onConfirm={() => mutate.mutate()} />
    </div>
  )
}

export function SupervisionPage() {
  const api = useApi()
  const { can } = useAuth()
  const routes = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const alerts = useQuery({ queryKey: ['alerts'], enabled: Boolean(api), queryFn: () => api!.listAlerts() })
  const [message, setMessage] = useState('')
  if (routes.isLoading || alerts.isLoading) return <Skeleton />
  const routeRows = routes.data?.items ?? []
  return (
    <div className="space-y-4">
      <PageHeader title="Supervisión operativa" subtitle="Rutas por banda, riesgos, contacto y rescates desde una sola consola." actions={can('alert.manage') ? <Button type="button" onClick={() => setMessage('Intervención creada; soporte VA-12 se dirige al punto de encuentro.')}>Coordinar rescate</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Conductores activos" value="26" hint="30 asignados"/><KpiCard label="Rutas en riesgo" value="3" hint="1 requiere contacto"/><KpiCard label="Adherencia" value="94%" hint="Promedio en vivo" trend={{value:'+2.1%',direction:'up'}}/><KpiCard label="Rescates hoy" value="1" hint="Tiempo de respuesta 14 min"/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <Panel><SectionHeader title="Rutas activas por prioridad" subtitle="Avance, ETA y siguiente intervención"/><div className="space-y-3">{routeRows.slice(0,6).map((route,index) => { const values=[18,37,62,76,89,96]; const risk=index===3 || route.hasLoadDifference; return <div key={route.id} className={`grid gap-3 rounded-2xl border p-3 lg:grid-cols-[1fr_1.1fr_auto] lg:items-center ${risk ? 'border-[var(--va-amber)] bg-[#fffaf0]' : 'border-[var(--va-line)]'}`}><div className="flex gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl ${risk ? 'bg-[#fff1d6] text-[var(--va-warning)]' : 'bg-[var(--va-soft)] text-[var(--va-teal-700)]'}`}>{risk ? <AlertTriangle size={19}/> : <Truck size={19}/>}</span><div><p className="font-bold">{route.vehicle.code} · {route.folio}</p><p className="text-xs text-[var(--va-muted)]">{route.driver.name} · ETA {index % 2 ? '15:42' : '14:58'}</p></div></div><div><ProgressBar value={values[index]} label={`${route.packagesDelivered}/${route.packagesExpected} paquetes`}/></div><div className="flex gap-2">{can('driver.contact') ? <Button type="button" variant="ghost" onClick={() => setMessage(`Contacto con ${route.driver.name} registrado.`)}><Phone size={15}/>Llamar</Button> : null}{risk && can('alert.manage') ? <Button type="button" onClick={() => setMessage(`Plan de apoyo creado para ${route.folio}.`)}>Intervenir</Button> : !risk ? <Badge tone="ok">En secuencia</Badge> : <Badge tone="warn">Requiere intervención</Badge>}</div></div>})}</div></Panel>
        <div className="space-y-4"><Panel><SectionHeader title="Cola de intervención" subtitle="Ordenada por SLA"/><ul className="space-y-3">{(alerts.data?.items ?? []).slice(0,4).map((alert,index) => <li key={alert.id} className="flex gap-3 rounded-xl bg-[var(--va-soft)] p-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${alert.severity === 'critical' ? 'bg-[#fff0ef] text-[var(--va-danger)]' : 'bg-[#fff7e8] text-[var(--va-warning)]'}`}><AlertTriangle size={17}/></span><div><p className="text-sm font-semibold">{alert.title}</p><p className="text-xs text-[var(--va-muted)]">{alert.routeId.replace('rt_','R-GDLR-')} · {18 + index*11} min</p></div></li>)}</ul></Panel><Panel><SectionHeader title="Cobertura de supervisión"/><div className="space-y-3"><ProgressBar value={98} label="Conductores localizables"/><ProgressBar value={94} label="GPS actualizado"/><ProgressBar value={92} label="Alertas dentro de SLA"/><ProgressBar value={88} label="Cierres sin pendientes" tone="amber"/></div></Panel><Panel><SectionHeader title="Canales activos"/><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-[var(--va-soft)] p-3"><Phone className="mx-auto" size={18}/><p className="mt-1 text-xs">Llamada</p></div><div className="rounded-xl bg-[var(--va-soft)] p-3"><Headphones className="mx-auto" size={18}/><p className="mt-1 text-xs">Soporte</p></div><div className="rounded-xl bg-[var(--va-soft)] p-3"><MapPin className="mx-auto" size={18}/><p className="mt-1 text-xs">Rescate</p></div></div></Panel></div>
      </div>
    </div>
  )
}
