import { Badge, KpiCard, PageHeader, Panel, ProgressBar, SectionHeader, SelectField } from '@/design-system/components/ui'
import { ROUTE_STATE_LABELS } from '@/entities/states'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Clock3, Navigation, Satellite, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LiveMap from './LiveMap'

export function TowerPage() {
  const api = useApi()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Todas')
  const routes = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const alerts = useQuery({ queryKey: ['alerts'], enabled: Boolean(api), queryFn: () => api!.listAlerts() })
  const all = routes.data?.items ?? []
  const rows = all.filter((route) => filter === 'Todas' || (filter === 'En ruta' && route.state === 'in_route') || (filter === 'Atención' && (route.hasLoadDifference || route.vehicle.gpsQuality !== 'ok')))
  const openAlerts = (alerts.data?.items ?? []).filter((alert) => alert.state !== 'resolved')
  return (
    <div className="space-y-4">
      <PageHeader title="Torre de control" subtitle="Posición, avance, ETA, adherencia y excepciones de toda la operación." actions={<div className="flex gap-2"><SelectField aria-label="Filtrar torre" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todas</option><option>En ruta</option><option>Atención</option></SelectField><Badge tone="ok"><span className="h-2 w-2 rounded-full bg-current"/>En vivo</Badge></div>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Unidades monitoreadas" value="30" hint="29 transmitiendo" icon={<Satellite size={18}/>} /><KpiCard label="En ruta" value="17" hint="8 terminadas · 5 en CEDIS" icon={<Truck size={18}/>} /><KpiCard label="Dentro de secuencia" value="94%" hint="Promedio de la jornada" trend={{value:'+2.1%',direction:'up'}} icon={<Navigation size={18}/>} /><KpiCard label="Alertas abiertas" value={String(openAlerts.length || 3)} hint="1 crítica · 2 preventivas" icon={<AlertTriangle size={18}/>} /></section>
      <div className="overflow-hidden rounded-[20px] border border-[#17374e] bg-[#07131e] p-3 text-white shadow-2xl lg:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1"><div><h2 className="font-bold">Mapa operativo Guadalajara</h2><p className="text-xs text-white/55">Rutas planeadas, recorrido real y última posición GPS</p></div><div className="flex flex-wrap gap-3 text-xs text-white/65"><span className="flex items-center gap-1"><i className="h-2 w-5 rounded bg-[var(--va-teal)]"/>En secuencia</span><span className="flex items-center gap-1"><i className="h-2 w-5 rounded bg-[var(--va-amber)]"/>Desvío</span><span className="flex items-center gap-1"><i className="h-2 w-5 rounded bg-white/40"/>Planeada</span></div></div>
        <div className="grid gap-3 xl:grid-cols-[1.55fr_.85fr]">
          <div className="min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[#0c1d2c]"><LiveMap routes={rows}/></div>
          <div className="va-scrollbar max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {rows.map((route, index) => { const progress = [18,42,61,76,88,96,100,9][index] ?? 55; const risk = route.vehicle.gpsQuality !== 'ok' || route.hasLoadDifference; return <button type="button" key={route.id} onClick={() => navigate(`/torre/rutas/${route.id}`)} className={`w-full rounded-2xl border p-3 text-left transition ${risk ? 'border-[var(--va-amber)] bg-[#152535]' : 'border-white/10 bg-white/[.04] hover:bg-white/[.08]'}`}><div className="flex items-start justify-between gap-2"><div><p className="font-bold">{route.vehicle.code} · {route.folio}</p><p className="text-xs text-white/55">{route.driver.name} · {route.windowLabel}</p></div><Badge tone={risk ? 'warn' : route.state === 'in_route' ? 'info' : 'ok'}>{risk ? 'Atención' : ROUTE_STATE_LABELS[route.state]}</Badge></div><div className="mt-3"><ProgressBar value={progress}/></div><div className="mt-2 flex justify-between text-xs text-white/55"><span>{route.packagesDelivered}/{route.packagesExpected} paquetes</span><span>ETA {index % 2 ? '15:42' : '14:58'}</span></div></button> })}
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Panel><SectionHeader title="Alertas que requieren intervención" subtitle="Priorizadas por impacto y SLA" action={<Link className="text-sm font-bold text-[var(--va-teal-700)]" to="/alertas">Ver todas</Link>}/><div className="grid gap-3 md:grid-cols-2">{openAlerts.slice(0,4).map((alert) => <Link key={alert.id} to="/alertas" className="flex gap-3 rounded-xl border border-[var(--va-line)] p-3 hover:border-[var(--va-teal)]"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${alert.severity === 'critical' ? 'bg-[#fff0ef] text-[var(--va-danger)]' : 'bg-[#fff7e8] text-[var(--va-warning)]'}`}><AlertTriangle size={18}/></span><div><p className="text-sm font-semibold">{alert.title}</p><p className="text-xs text-[var(--va-muted)]">{routeName(alert.routeId)} · vence en {alert.severity === 'critical' ? '18 min' : '46 min'}</p></div></Link>)}</div></Panel>
        <Panel><SectionHeader title="Próximos hitos" subtitle="Proyección con tránsito y avance actual"/><ul className="space-y-3">{[['14:58','VA-15 termina ruta'],['15:10','VA-03 inicia retorno autorizado'],['15:42','VA-21 termina ruta'],['16:05','Cierre de banda 06:00']].map(([time,title]) => <li key={time} className="flex gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--va-soft)] text-[var(--va-teal-700)]"><Clock3 size={17}/></span><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-[var(--va-muted)]">{time} · Guadalajara</p></div></li>)}</ul></Panel>
      </div>
    </div>
  )
}

function routeName(id: string) { return id.replace('rt_', 'R-GDLR-') }
