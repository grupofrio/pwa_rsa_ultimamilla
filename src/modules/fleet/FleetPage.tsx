import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, FilterBar, KpiCard, PageHeader, Panel, ProgressBar, SearchField, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { maintenanceOrders, money, toneFor } from '@/demo/operations'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { Activity, CalendarClock, FileCheck2, Fuel, Gauge, MapPin, Satellite, Truck, Wrench } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const vehicleStatus = { available: 'Disponible', in_route: 'En operación', maintenance_block: 'Bloqueada por mantenimiento', unsafe_block: 'Bloqueada por seguridad' } as const

export function FleetPage() {
  const api = useApi()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todas')
  const query = useQuery({ queryKey: ['vehicles'], enabled: Boolean(api), queryFn: () => api!.listVehicles() })
  if (query.isLoading || !api) return <Skeleton />
  const all = query.data?.items ?? []
  const rows = all.filter((row) => `${row.code} ${row.plate} ${row.habitualDriverName}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Todas' || vehicleStatus[row.status] === filter))
  return (
    <div className="space-y-4">
      <PageHeader title="Flota" subtitle="Disponibilidad, GPS, documentos, rendimiento y mantenimiento de cada unidad." />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Unidades" value="30" hint="27 disponibles para operar" icon={<Truck size={18}/>} /><KpiCard label="GPS en línea" value="29" hint="1 señal degradada" icon={<Satellite size={18}/>} /><KpiCard label="Disponibilidad" value="90%" hint="Meta 92%" trend={{value:'+3%',direction:'up'}} icon={<Activity size={18}/>} /><KpiCard label="Servicio próximo" value="4" hint="1 requiere atención hoy" icon={<Wrench size={18}/>} /></section>
      <FilterBar><SearchField aria-label="Buscar unidad" placeholder="Buscar unidad, placas o conductor" value={search} onChange={(event) => setSearch(event.target.value)}/><SelectField aria-label="Filtrar estado de unidad" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todas</option><option>Disponible</option><option>En operación</option><option>Bloqueada por mantenimiento</option></SelectField><Badge tone="ok">29 de 30 transmitiendo</Badge></FilterBar>
      <DataTable caption="Unidades" rows={rows} onRowClick={(row) => navigate(`/flota/unidades/${row.id}`)} columns={[
        { key: 'code', header: 'Unidad', render: (row) => <div><strong>{row.code}</strong><p className="text-xs text-[var(--va-muted)]">{row.plate}</p></div> },
        { key: 'status', header: 'Estado', render: (row) => <Badge tone={row.status.includes('block') ? 'danger' : row.status === 'in_route' ? 'info' : 'ok'}>{vehicleStatus[row.status]}</Badge> },
        { key: 'driver', header: 'Conductor habitual', render: (row) => row.habitualDriverName },
        { key: 'odo', header: 'Odómetro', render: (row) => <div><p className="font-semibold tabular">{row.odometerKm.toLocaleString('es-MX')} km</p><p className="text-xs text-[var(--va-muted)]">{row.odometerSource}</p></div> },
        { key: 'gps', header: 'GPS / SIM', render: (row) => <div><Badge tone={row.gps.quality === 'ok' ? 'ok' : 'warn'}>{row.gps.quality === 'ok' ? 'En línea' : 'Señal degradada'}</Badge><p className="mt-1 text-xs text-[var(--va-muted)]">SIM {row.gps.simStatus === 'active' ? 'activa' : 'por revisar'}</p></div> },
        { key: 'next', header: 'Próximo servicio', render: (row) => <div><p className="font-medium">{row.nextService.reason}</p><p className="text-xs text-[var(--va-muted)]">{row.nextService.dueKm ? `${Math.max(0,row.nextService.dueKm-row.odometerKm).toLocaleString('es-MX')} km restantes` : row.nextService.dueAt}</p></div> },
        { key: 'health', header: 'Salud', render: (row) => <div className="min-w-24"><ProgressBar value={row.status.includes('block') ? 42 : row.gps.quality === 'ok' ? 92 : 74}/></div> },
      ]}/>
    </div>
  )
}

export function VehicleDetailPage() {
  const { id = '' } = useParams()
  const api = useApi()
  const { can } = useAuth()
  const [message, setMessage] = useState('')
  const query = useQuery({ queryKey: ['vehicle', id], enabled: Boolean(api && id), queryFn: () => api!.getVehicle(id) })
  if (query.isLoading) return <Skeleton />
  const v = query.data
  if (!v) return <PageHeader title="Unidad no encontrada" />
  const is21 = v.code === 'VA-21'
  return (
    <div className="space-y-4">
      <PageHeader title={`${v.code} · ${v.plate}`} subtitle={`Conductor habitual: ${v.habitualDriverName}`} actions={can('unit.block_operational') || can('maintenance.request') ? <div className="flex gap-2">{can('unit.block_operational') ? <Button type="button" variant="danger" onClick={() => setMessage(`${v.code} bloqueada preventivamente; el supervisor y despacho fueron notificados.`)}>Bloquear unidad</Button> : null}{can('maintenance.request') ? <Button type="button" onClick={() => setMessage(`Solicitud de servicio creada para ${v.code}.`)}>Solicitar servicio</Button> : null}</div> : undefined} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Estado" value={vehicleStatus[v.status]} hint="Asignación habitual vigente" icon={<Truck size={18}/>} /><KpiCard label="Odómetro" value={`${v.odometerKm.toLocaleString('es-MX')} km`} hint="GPS + captura validada" icon={<Gauge size={18}/>} /><KpiCard label="Rendimiento" value={is21 ? '7.6 km/L' : '8.4 km/L'} hint={is21 ? '6% bajo el objetivo' : 'Dentro del objetivo'} icon={<Fuel size={18}/>} /><KpiCard label="Próximo servicio" value={is21 ? '240 km' : '1,190 km'} hint={v.nextService.reason} icon={<CalendarClock size={18}/>} /></section>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <Panel><SectionHeader title="Jornada y uso autorizado" subtitle="Domicilio → CEDIS → ruta oficial → domicilio" action={<Badge tone={is21 ? 'warn' : 'ok'}>{is21 ? '1 evento por revisar' : 'Sin uso personal'}</Badge>}/><div className="rounded-2xl bg-[var(--va-navy)] p-4 text-white"><div className="grid gap-3 sm:grid-cols-4">{[['Casa → CEDIS','18.4 km'],['En CEDIS','1 h 12 min'],['Ruta oficial','112 km'],['Última → casa','14.8 km']].map(([label,value]) => <div key={label}><p className="text-xs text-white/55">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}</div><div className="mt-4"><ProgressBar value={is21 ? 72 : 91}/></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[var(--va-line)] p-3"><div className="flex items-center gap-2"><MapPin className="text-[var(--va-teal-700)]" size={18}/><p className="font-semibold">Ubicación actual</p></div><p className="mt-2 text-sm">Zona Centro · Guadalajara</p><p className="text-xs text-[var(--va-muted)]">Última señal hace 38 segundos</p></div><div className="rounded-xl border border-[var(--va-line)] p-3"><div className="flex items-center gap-2"><Satellite className="text-[var(--va-teal-700)]" size={18}/><p className="font-semibold">Telemetría</p></div><p className="mt-2 text-sm">Motor encendido · 34 km/h</p><p className="text-xs text-[var(--va-muted)]">Voltaje y señal normales</p></div></div><SectionHeader title="Últimos recorridos" subtitle="Kilómetros reconocidos por componente"/><div className="space-y-2">{[['30 ago','R-GDLR-2404','145.2 km','7.6 km/L'],['29 ago','R-GDLR-2399','132.8 km','8.1 km/L'],['28 ago','R-GDLR-2391','118.4 km','8.3 km/L']].map(([date,route,km,yieldValue]) => <div key={date} className="grid grid-cols-4 gap-2 rounded-xl bg-[var(--va-soft)] p-3 text-sm"><span>{date}</span><strong>{route}</strong><span>{km}</span><span className="text-right">{yieldValue}</span></div>)}</div></Panel>
        <div className="space-y-4"><Panel><SectionHeader title="Salud de la unidad"/><div className="space-y-3"><ProgressBar value={is21 ? 76 : 92} label="Condición mecánica" tone={is21 ? 'amber' : 'teal'}/><ProgressBar value={94} label="Calidad GPS"/><ProgressBar value={88} label="Rendimiento" tone="amber"/><ProgressBar value={100} label="Documentación"/></div></Panel><Panel><SectionHeader title="Documentos y resguardo"/><ul className="space-y-3">{[['Seguro','Vigente · 14 feb 2027'],['Permiso','Vigente · 30 nov 2026'],['Verificación','Vigente · 18 ene 2027'],['Resguardo digital','Firmado · 4 ene 2026']].map(([name,status]) => <li key={name} className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><FileCheck2 className="text-[var(--va-success)]" size={17}/><span className="text-sm font-medium">{name}</span></div><span className="text-xs text-[var(--va-muted)]">{status}</span></li>)}</ul></Panel><Panel><SectionHeader title="Alertas recientes"/><div className="space-y-2"><div className="rounded-xl bg-[#fff7e8] p-3 text-sm"><strong>Rendimiento debajo del objetivo</strong><p className="text-xs text-[var(--va-muted)]">Revisar presión de llantas y ralentí.</p></div><div className="rounded-xl bg-[#e9f8f2] p-3 text-sm"><strong>Documentos completos</strong><p className="text-xs text-[var(--va-muted)]">Sin vencimientos próximos.</p></div></div></Panel></div>
      </div>
    </div>
  )
}

export function MaintenancePage() {
  const { can } = useAuth()
  const [rows, setRows] = useState(maintenanceOrders)
  const [filter, setFilter] = useState('Todos')
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const visible = rows.filter((row) => filter === 'Todos' || row.priority === filter || row.state === filter)
  return (
    <div className="space-y-4">
      <PageHeader title="Mantenimiento" subtitle="Servicios preventivos y correctivos por kilometraje, fecha y condición." actions={can('maintenance.request') ? <Button type="button" onClick={() => setMessage('Nueva solicitud creada y enviada a revisión.')}>Nueva solicitud</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Atención inmediata" value="1" hint="Unidad bloqueada"/><KpiCard label="Próximos 7 días" value="3" hint="Servicios programables"/><KpiCard label="Disponibilidad" value="90%" hint="27 de 30 unidades"/><KpiCard label="Costo del mes" value="$38,460" hint="4% bajo presupuesto" trend={{value:'-$1,620',direction:'down',positive:true}}/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <FilterBar><SelectField aria-label="Filtrar mantenimiento" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todos</option><option>Crítica</option><option>Alta</option><option>Media</option><option>En taller</option><option>Por autorizar</option></SelectField><Badge tone="info">Plan preventivo 93% al día</Badge></FilterBar>
      <DataTable caption="Órdenes de mantenimiento" rows={visible} columns={[
        { key: 'unit', header: 'Unidad', render: (row) => <strong>{row.unit}</strong> },
        { key: 'service', header: 'Servicio', render: (row) => <div><p className="font-medium">{row.service}</p><p className="text-xs text-[var(--va-muted)]">{row.workshop}</p></div> },
        { key: 'km', header: 'Kilometraje', render: (row) => <div><p>{row.currentKm.toLocaleString('es-MX')} km</p><p className={`text-xs ${row.dueKm <= row.currentKm ? 'text-[var(--va-danger)]' : 'text-[var(--va-muted)]'}`}>{row.dueKm <= row.currentKm ? `${row.currentKm-row.dueKm} km vencido` : `${row.dueKm-row.currentKm} km restantes`}</p></div> },
        { key: 'due', header: 'Fecha / prioridad', render: (row) => <div><p>{row.dueDate}</p><Badge tone={toneFor(row.priority)}>{row.priority}</Badge></div> },
        { key: 'state', header: 'Estado', render: (row) => <Badge tone={toneFor(row.state)}>{row.state}</Badge> },
        { key: 'cost', header: 'Costo / baja', render: (row) => <div><p className="font-semibold">{row.cost ? money(row.cost) : 'Por cotizar'}</p><p className="text-xs text-[var(--va-muted)]">{row.downtime}</p></div> },
        { key: 'action', header: 'Acción', render: (row) => can('maintenance.manage') && row.state === 'Por autorizar' ? <Button type="button" onClick={() => setSelected(row.id)}>Autorizar</Button> : <Button type="button" variant="ghost" onClick={() => setMessage(`${row.id.toUpperCase()}: detalle y evidencias abiertos.`)}>Ver orden</Button> },
      ]}/>
      <ConfirmDialog open={Boolean(selected)} title="Autorizar orden de mantenimiento" body="Confirma taller, costo estimado y tiempo fuera de servicio." confirmLabel="Autorizar orden" onCancel={() => setSelected(null)} onConfirm={() => { setRows((current) => current.map((row) => row.id === selected ? { ...row, state: 'Programada' } : row)); setSelected(null); setMessage('Orden autorizada y ventana de taller reservada.') }} />
    </div>
  )
}
