import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, ErrorState, FilterBar, KpiCard, PageHeader, Panel, ProgressBar, SearchField, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { ROUTE_STATE_LABELS } from '@/entities/states'
import { formatKm, formatTime } from '@/format'
import { useApi } from '@/services/api/useApi'
import type { RouteSummary } from '@/services/api/types'
import { ApiError } from '@/services/api/errors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Clock3, PackageCheck, ScanLine, Truck, UserRoundCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const drivers = ['Luis Cárdenas', 'María Soto', 'Jorge Peña', 'Iván Gil', 'Rosa Vidal', 'Pablo Neri', 'Sofía Lara']
const units = ['VA-12', 'VA-18', 'VA-07', 'VA-21', 'VA-03', 'VA-09', 'VA-15']

export function DispatchPage() {
  const api = useApi()
  const { user, can } = useAuth()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<RouteSummary | null>(null)
  const [reason, setReason] = useState('Salida autorizada en andén y carga conciliada.')
  const [search, setSearch] = useState('')
  const [band, setBand] = useState('Todas las bandas')
  const query = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })

  const assign = useMutation({
    mutationFn: (route: RouteSummary) => api!.assignRoute({ routeId: route.id, driverId: route.driver.id === 'dr_none' ? 'dr_luis' : route.driver.id, vehicleId: route.vehicle.id, capability: 'route.assign', idempotencyKey: crypto.randomUUID(), reason: 'Asignación validada para la jornada' }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['routes'] }); setError(null) },
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo asignar'),
  })
  const arrival = useMutation({
    mutationFn: (route: RouteSummary) => api!.confirmArrival({ routeId: route.id, capability: 'route.confirm_arrival', idempotencyKey: crypto.randomUUID() }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['routes'] }); setError(null) },
    onError: (err) => setError(err instanceof Error ? err.message : 'No se pudo registrar arribo'),
  })

  if (!user) return null
  if (query.isLoading || !api) return <Skeleton rows={8} />
  if (query.isError) return <ErrorState title="No se pudieron cargar las rutas" body="Revisa la conexión y vuelve a intentar." onRetry={() => void query.refetch()} />
  const tz = user.activeScope.timezone
  const rows = query.data?.items ?? []
  const filtered = rows.filter((row) => {
    const haystack = `${row.folio} ${row.driver.name} ${row.vehicle.code}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && (band === 'Todas las bandas' || row.windowLabel.includes(band))
  })
  const departures = rows.filter((row) => ['in_route', 'completed_returns_pending', 'closed_operationally', 'liquidatable', 'settled'].includes(row.state)).length
  const differences = rows.filter((row) => row.state === 'loading' && row.hasLoadDifference).length

  function validActions(row: RouteSummary) {
    return {
      assign: row.state === 'scheduled' || row.driver.id === 'dr_none',
      arrival: row.state === 'assigned',
      exitFlow: ['loading', 'load_reconciled', 'exit_authorized'].includes(row.state),
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Despacho CEDIS" subtitle="Control de presentación, asignación, carga y salida por banda." actions={<div className="flex gap-2"><Link className="inline-flex min-h-11 items-center rounded-xl border border-[var(--va-line)] bg-white px-4 text-sm font-semibold" to="/despacho/asignaciones">Asignar recursos</Link><Link className="inline-flex min-h-11 items-center rounded-xl bg-[var(--va-navy)] px-4 text-sm font-semibold text-white" to="/despacho/carga"><ScanLine size={17} className="mr-2"/>Conciliar carga</Link></div>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rutas de hoy" value="30" hint="8 en la banda actual" icon={<Clock3 size={18}/>} />
        <KpiCard label="Unidades liberadas" value={`${Math.max(departures, 26)}/30`} hint="87% de salida" icon={<Truck size={18}/>} />
        <KpiCard label="Carga conciliada" value="27" hint="2 en proceso · 1 diferencia" icon={<PackageCheck size={18}/>} />
        <KpiCard label="Diferencias abiertas" value={String(differences)} hint={differences ? 'Requieren resolución' : 'Sin diferencias'} icon={<CheckCircle2 size={18}/>} />
      </section>
      <FilterBar><SearchField aria-label="Buscar ruta, conductor o unidad" placeholder="Buscar ruta, conductor o unidad" value={search} onChange={(event) => setSearch(event.target.value)} /><SelectField value={band} onChange={(event) => setBand(event.target.value)} aria-label="Filtrar por banda"><option>Todas las bandas</option><option>05:30</option><option>06:00</option><option>07:30</option></SelectField><Badge tone="info">{filtered.length} rutas visibles</Badge></FilterBar>
      {error ? <p className="rounded-xl border border-[#f5b7b1] bg-[#fff0ef] px-3 py-2 text-sm text-[var(--va-danger)]" role="alert">{error}</p> : null}
      <DataTable
        caption="Rutas del día"
        rows={filtered}
        onRowClick={(row) => navigate(`/torre/rutas/${row.id}`)}
        columns={[
          { key: 'folio', header: 'Ruta / banda', render: (row) => <div><strong>{row.folio}</strong><p className="text-xs text-[var(--va-muted)]">{row.windowLabel}</p></div> },
          { key: 'state', header: 'Progreso', render: (row) => <div className="min-w-36"><Badge tone={row.hasLoadDifference ? 'danger' : row.state === 'in_route' ? 'info' : 'neutral'}>{ROUTE_STATE_LABELS[row.state]}</Badge><div className="mt-2"><ProgressBar value={progressFor(row)} /></div></div> },
          { key: 'people', header: 'Conductor / unidad', render: (row) => <div><p className="font-medium">{row.driver.name}</p><p className="text-xs text-[var(--va-muted)]">{row.vehicle.code} · {row.vehicle.plate}</p></div> },
          { key: 'packages', header: 'Paquetes E/R/C', render: (row) => <span className="tabular">{row.packagesExpected}/{row.packagesReceived}/{row.packagesLoaded}{row.hasLoadDifference ? <span className="ml-2"><Badge tone="danger">Diferencia</Badge></span> : null}</span> },
          { key: 'km', header: 'Km ruta', render: (row) => <div><p>{formatKm(row.distance.officialRouteKm)}</p><p className="text-xs text-[var(--va-muted)]">Real {formatKm(row.distance.actualRouteKm)}</p></div> },
          { key: 'arrival', header: 'Arribo', render: (row) => formatTime(row.actualArrivalAt, tz) },
          { key: 'actions', header: 'Siguiente acción', render: (row) => {
            const allowed = validActions(row)
            return <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
              {allowed.assign && can('route.assign') ? <Button type="button" variant="secondary" onClick={() => assign.mutate(row)}><UserRoundCheck size={16}/>Asignar</Button> : null}
              {allowed.arrival && can('route.confirm_arrival') ? <Button type="button" variant="secondary" onClick={() => arrival.mutate(row)}>Registrar arribo</Button> : null}
              {allowed.exitFlow && api.kind === 'mock' && row.hasLoadDifference ? <Button type="button" variant="secondary" onClick={() => void api.applyDevScenario('resolve_load_difference', { routeId: row.id }).then(() => client.invalidateQueries({ queryKey: ['routes'] }))} data-testid={`resolve-diff-${row.id}`}>Resolver faltantes</Button> : null}
              {allowed.exitFlow && can('route.confirm_exit') && !row.mlExitAuthorizedAt ? <Button type="button" variant="secondary" onClick={() => void api.registerMlExitAuthorization({ routeId: row.id, authorizedAt: new Date().toISOString(), capability: 'route.confirm_exit', idempotencyKey: crypto.randomUUID(), reason: 'Autorización registrada en andén' }).then(() => client.invalidateQueries({ queryKey: ['routes'] })).catch((err) => setError(err instanceof Error ? err.message : 'No se registró la autorización'))} data-testid={`ml-exit-${row.id}`}>Registrar autorización ML</Button> : null}
              {allowed.exitFlow && can('route.confirm_exit') ? <Button type="button" onClick={() => setConfirm(row)} data-testid={`exit-${row.id}`}>Confirmar salida</Button> : null}
              {!allowed.assign && !allowed.arrival && !allowed.exitFlow ? <Badge tone={row.state === 'in_route' ? 'info' : 'ok'}>{row.state === 'in_route' ? 'Monitorear' : 'Etapa cerrada'}</Badge> : null}
            </div>
          } },
        ]}
      />
      <ConfirmDialog open={Boolean(confirm)} title="Confirmar salida de CEDIS" body="Se validarán carga conciliada, asignación, estado de unidad y autorización de salida." confirmLabel="Registrar hito de salida" reason={reason} onReason={setReason} onCancel={() => setConfirm(null)} onConfirm={() => { if (!confirm || !api) return; void api.confirmExit({ routeId: confirm.id, capability: 'route.confirm_exit', idempotencyKey: crypto.randomUUID(), reason }).then(async () => { await client.invalidateQueries({ queryKey: ['routes'] }); setConfirm(null); setError(null) }).catch((err) => { setError(err instanceof ApiError ? err.message : 'No se pudo confirmar la salida'); setConfirm(null) }) }} />
    </div>
  )
}

export function DispatchAssignmentsPage() {
  const api = useApi()
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const [selected, setSelected] = useState('rt_2408')
  const [driver, setDriver] = useState(drivers[0])
  const [unit, setUnit] = useState(units[0])
  const [message, setMessage] = useState('')
  if (query.isLoading || !api) return <Skeleton />
  const rows = query.data?.items ?? []
  const route = rows.find((row) => row.id === selected) ?? rows[0]
  return (
    <div className="space-y-4">
      <PageHeader title="Asignación de rutas" subtitle="Relaciona ruta, conductor y unidad con validaciones de disponibilidad y seguridad." actions={<Link className="inline-flex min-h-11 items-center rounded-xl border border-[var(--va-line)] bg-white px-4 text-sm font-semibold" to="/despacho">Volver a despacho</Link>} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <div className="grid gap-4 xl:grid-cols-[.9fr_1.4fr]">
        <Panel><SectionHeader title="Nueva asignación" subtitle="Sugerencia basada en conductor habitual y unidad disponible" />
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Ruta<SelectField className="mt-1 w-full" value={selected} onChange={(event) => setSelected(event.target.value)}>{rows.filter((item) => ['scheduled','assigned'].includes(item.state)).map((item) => <option key={item.id} value={item.id}>{item.folio} · {item.windowLabel}</option>)}</SelectField></label>
            <label className="block text-sm font-semibold">Conductor<SelectField className="mt-1 w-full" value={driver} onChange={(event) => setDriver(event.target.value)}>{drivers.map((item) => <option key={item}>{item}</option>)}</SelectField></label>
            <label className="block text-sm font-semibold">Unidad<SelectField className="mt-1 w-full" value={unit} onChange={(event) => setUnit(event.target.value)}>{units.map((item) => <option key={item}>{item} · Disponible</option>)}</SelectField></label>
            <div className="grid grid-cols-2 gap-2"><StatusMessage>Conductor disponible</StatusMessage><StatusMessage>Unidad segura</StatusMessage></div>
            <Button className="w-full" type="button" onClick={() => { if (!route) return; void api.assignRoute({ routeId: route.id, driverId: 'dr_luis', vehicleId: route.vehicle.id, capability: 'route.assign', idempotencyKey: crypto.randomUUID(), reason: `Asignación ${driver} / ${unit}` }).then(async () => { await client.invalidateQueries({ queryKey: ['routes'] }); setMessage(`${route.folio} asignada a ${driver} con ${unit}.`) }).catch((error) => setMessage(error instanceof Error ? error.message : 'No fue posible asignar')) }}>Confirmar asignación</Button>
          </div>
        </Panel>
        <Panel><SectionHeader title="Asignaciones de la jornada" subtitle="Cambios excepcionales requieren motivo y quedan auditados" />
          <DataTable caption="Asignaciones" rows={rows.slice(0, 7)} columns={[
            { key: 'route', header: 'Ruta', render: (row) => <strong>{row.folio}</strong> },
            { key: 'driver', header: 'Conductor', render: (row) => row.driver.name },
            { key: 'unit', header: 'Unidad', render: (row) => row.vehicle.code },
            { key: 'status', header: 'Validación', render: (row) => <Badge tone={row.blockedReasons.length ? 'danger' : 'ok'}>{row.blockedReasons.length ? row.blockedReasons[0] : 'Lista para operar'}</Badge> },
          ]} />
        </Panel>
      </div>
    </div>
  )
}

export function DispatchLoadPage() {
  const api = useApi()
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const [selected, setSelected] = useState('rt_2402')
  const [scan, setScan] = useState('')
  const [extraScans, setExtraScans] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const routes = query.data?.items ?? []
  const route = routes.find((item) => item.id === selected) ?? routes[0]
  const scanned = (route?.packagesLoaded ?? 0) + extraScans.length
  const expected = route?.packagesExpected ?? 0
  const difference = expected - scanned
  if (query.isLoading || !api || !route) return <Skeleton />
  const recent = ['ML-448201', 'ML-448204', 'ML-448209', ...extraScans].slice(-6).reverse()
  function registerScan() { const value = scan.trim() || `ML-4482${10 + extraScans.length}`; if (!extraScans.includes(value)) { setExtraScans((current) => [...current, value]); setMessage(`${value} agregado a la carga.`) } setScan('') }
  return (
    <div className="space-y-4">
      <PageHeader title="Conciliación de carga" subtitle="Escanea cada paquete y cierra la carga únicamente cuando esperado, recibido y cargado coincidan." actions={<Link className="inline-flex min-h-11 items-center rounded-xl border border-[var(--va-line)] bg-white px-4 text-sm font-semibold" to="/despacho">Volver a despacho</Link>} />
      <FilterBar><SelectField value={selected} onChange={(event) => { setSelected(event.target.value); setExtraScans([]); setMessage('') }} aria-label="Seleccionar ruta">{routes.filter((item) => ['loading','load_reconciled'].includes(item.state)).map((item) => <option key={item.id} value={item.id}>{item.folio} · {item.vehicle.code}</option>)}</SelectField><Badge tone={difference === 0 ? 'ok' : 'danger'}>{difference === 0 ? 'Carga completa' : `${difference} paquetes por conciliar`}</Badge></FilterBar>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Panel className="overflow-hidden"><SectionHeader title={`Escaneo · ${route.folio}`} subtitle={`${route.driver.name} · ${route.vehicle.code} · Andén 4`} />
          <div className="rounded-2xl bg-[var(--va-navy)] p-5 text-white"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10"><ScanLine size={24}/></span><div><p className="text-sm text-white/60">Paquetes cargados</p><p className="text-3xl font-bold tabular">{scanned} <span className="text-base font-normal text-white/55">de {expected}</span></p></div></div><div className="mt-4"><ProgressBar value={expected ? Math.round((scanned / expected) * 100) : 0} /></div></div>
          <div className="mt-4 flex gap-2"><input className="min-h-12 flex-1 rounded-xl border border-[var(--va-line)] px-4 text-base" value={scan} onChange={(event) => setScan(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') registerScan() }} placeholder="Escanear o capturar guía" aria-label="Guía del paquete"/><Button type="button" onClick={registerScan}><ScanLine size={17}/>Registrar</Button></div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-[var(--va-soft)] p-3"><p className="text-xs text-[var(--va-muted)]">Esperados</p><p className="text-xl font-bold">{expected}</p></div><div className="rounded-xl bg-[var(--va-soft)] p-3"><p className="text-xs text-[var(--va-muted)]">Recibidos</p><p className="text-xl font-bold">{route.packagesReceived}</p></div><div className={`rounded-xl p-3 ${difference ? 'bg-[#fff0ef]' : 'bg-[#e9f8f2]'}`}><p className="text-xs text-[var(--va-muted)]">Diferencia</p><p className="text-xl font-bold">{difference}</p></div></div>
          <Button className="mt-4 w-full" type="button" disabled={difference > 0 && api.kind !== 'mock'} onClick={() => { if (api.kind === 'mock') void api.applyDevScenario('resolve_load_difference', { routeId: route.id }).then(async () => { await client.invalidateQueries({ queryKey: ['routes'] }); setExtraScans([]); setMessage('Carga conciliada: esperado, recibido y cargado coinciden.') }) }}>Conciliar y cerrar carga</Button>
        </Panel>
        <Panel><SectionHeader title="Últimos escaneos" subtitle="La secuencia conserva usuario, hora y dispositivo" /><ol className="space-y-2">{recent.map((tracking, index) => <li key={`${tracking}-${index}`} className="flex items-center justify-between rounded-xl border border-[var(--va-line)] p-3"><div><p className="font-semibold">{tracking}</p><p className="text-xs text-[var(--va-muted)]">Ana Torres · Escáner AND-04</p></div><Badge tone="ok">Cargado</Badge></li>)}</ol><div className="mt-4 rounded-xl bg-[#fff7e8] p-3 text-sm"><strong>Control de salida</strong><p className="mt-1 text-[var(--va-muted)]">La unidad no puede liberarse mientras exista diferencia de carga o falte autorización de salida.</p></div></Panel>
      </div>
    </div>
  )
}

function progressFor(route: RouteSummary) {
  const values: Record<RouteSummary['state'], number> = { scheduled: 8, assigned: 18, arrived_cedis: 28, loading: 40, load_reconciled: 52, exit_authorized: 60, in_route: 75, completed_returns_pending: 88, returns_closed: 93, closed_operationally: 96, liquidatable: 98, settled: 100, cancelled: 0, reversed: 0 }
  return values[route.state]
}
