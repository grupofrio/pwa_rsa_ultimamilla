import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, Donut, KpiCard, MiniTrend, PageHeader, Panel, ProgressBar, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { bandPerformance, money, weekTrend } from '@/demo/operations'
import { formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, CircleDollarSign, Clock3, Fuel, PackageCheck, Route, TrendingUp, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ManagementPage() {
  const api = useApi()
  const { can } = useAuth()
  const [period, setPeriod] = useState('Hoy')
  const [message, setMessage] = useState('')
  const kpis = useQuery({ queryKey: ['mgmt'], enabled: Boolean(api), queryFn: () => api!.getManagementKpis() })
  const copilot = useQuery({ queryKey: ['copilot'], enabled: Boolean(api) && can('copilot.view'), queryFn: () => api!.listCopilot() })
  if (kpis.isLoading || !api) return <Skeleton />
  const data = kpis.data
  if (!data) return null
  const recommendations = [...(copilot.data ?? []), { id: 'cp_local_3', title: 'Programar servicio de VA-21', body: 'El rendimiento bajó a 7.6 km/L y faltan 240 km para el servicio. Programarlo al cierre de la jornada evita afectar la banda de mañana.', period: 'Próximos 2 días', confidence: 'medium' as const }]
  return (
    <div className="space-y-4">
      <PageHeader title="Tablero gerencial" subtitle="Cumplimiento, rentabilidad, flota y decisiones de la operación." actions={<div className="flex gap-2"><SelectField aria-label="Periodo gerencial" value={period} onChange={(event) => setPeriod(event.target.value)}><option>Hoy</option><option>Últimos 7 días</option><option>Mes actual</option></SelectField><Button type="button" variant="ghost" onClick={() => setMessage('Resumen gerencial preparado y enviado a los destinatarios autorizados.')}>Compartir resumen</Button></div>} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Rutas programadas" value="30" hint="26 salieron · 24 terminaron" trend={{value:'+3 vs. ayer',direction:'up'}} icon={<Route size={18}/>} /><KpiCard label="Efectividad" value="96.8%" hint="847 de 875 paquetes" trend={{value:'+1.6%',direction:'up'}} icon={<PackageCheck size={18}/>} /><KpiCard label="Unidades disponibles" value="27" hint="1 taller · 2 reserva" icon={<Truck size={18}/>} /><KpiCard label="Alertas críticas" value="1" hint="Atención dentro de SLA" trend={{value:'-2 vs. ayer',direction:'down',positive:true}} icon={<AlertTriangle size={18}/>} /></section>
      {can('pnl.view') ? <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Ingreso esperado" value={formatMxn(48460, { estimate: true })} hint="Estimación del corte actual" icon={<CircleDollarSign size={18}/>} /><KpiCard label="Cobro confirmado" value={formatMxn(43840)} hint="Fuente conciliada" icon={<CircleDollarSign size={18}/>} /><KpiCard label="Contribución" value={formatMxn(22780, { estimate: true })} hint="Estimación · 51.9%" trend={{value:'+4.2%',direction:'up'}} icon={<TrendingUp size={18}/>} /><KpiCard label="Costo combustible" value="$11,840" hint="$3.52 por km" trend={{value:'-4.8%',direction:'down',positive:true}} icon={<Fuel size={18}/>} /></section> : <StatusMessage tone="info">Tu perfil administra la plataforma, pero no tiene acceso al P&amp;L del cliente.</StatusMessage>}
      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <Panel><SectionHeader title="Efectividad y contribución" subtitle={`${period} · comparación contra objetivo`} action={<Badge tone="ok">96.8% cumplimiento</Badge>}/><MiniTrend values={weekTrend}/><div className="mt-3 grid gap-3 sm:grid-cols-3">{bandPerformance.map((band) => <div key={band.label} className="rounded-xl bg-[var(--va-soft)] p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{band.label}</p><strong>{band.value}%</strong></div><div className="mt-2"><ProgressBar value={band.value}/></div><div className="mt-2 flex justify-between text-xs text-[var(--va-muted)]"><span>{band.routes} rutas</span>{can('pnl.view') ? <span>{money(band.revenue)}</span> : null}</div></div>)}</div></Panel>
        <Panel><SectionHeader title="Resultado de paquetes" subtitle="Custodia y cierre de la jornada"/><Donut value={97} label="Entregados" detail="847 entregados · 17 no entregables · 11 devoluciones"/><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-xl bg-[var(--va-soft)] p-3"><p className="text-2xl font-bold">4</p><p className="text-xs text-[var(--va-muted)]">Aclaraciones</p></div><div className="rounded-xl bg-[var(--va-soft)] p-3"><p className="text-2xl font-bold">87%</p><p className="text-xs text-[var(--va-muted)]">Favorables</p></div></div></Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <Panel><SectionHeader title="Dónde actuar hoy" subtitle="Impacto operativo y económico"/><ul className="space-y-3">{[
          { title:'VA-21: rendimiento bajo', detail:'7.6 km/L · impacto estimado $184/semana', icon:Fuel, tone:'warn' },
          { title:'1 aclaración vence hoy', detail:'Expediente completo · $412 protegidos', icon:Clock3, tone:'danger' },
          { title:'VA-27 en taller', detail:'Balatas · liberación estimada 17:30', icon:Truck, tone:'info' },
        ].map((item) => <li key={item.title} className="flex gap-3 rounded-xl border border-[var(--va-line)] p-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.tone === 'danger' ? 'bg-[#fff0ef] text-[var(--va-danger)]' : item.tone === 'warn' ? 'bg-[#fff7e8] text-[var(--va-warning)]' : 'bg-[#eef7ff] text-[var(--va-info)]'}`}><item.icon size={18}/></span><div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-[var(--va-muted)]">{item.detail}</p></div></li>)}</ul><Link className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--va-teal-700)]" to="/flota/unidades/vh_21">Bajar a detalle de unidad VA-21 <ArrowRight size={15}/></Link></Panel>
        {can('copilot.view') ? <Panel><SectionHeader title="Copiloto ejecutivo" subtitle="Recomendaciones explicadas; toda acción requiere aprobación" action={<Badge tone="info">{recommendations.length} recomendaciones</Badge>}/><ul className="space-y-3" data-testid="copilot-panel">{recommendations.map((item,index) => <li key={item.id} className="rounded-2xl border border-[var(--va-line)] p-4"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--va-navy)] font-bold text-[var(--va-teal)]">{index+1}</span><div className="flex-1"><p className="font-bold">{cleanCopy(item.title)}</p><p className="mt-1 text-sm text-[var(--va-muted)]">{cleanCopy(item.body)}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-[var(--va-muted)]">Confianza {item.confidence === 'high' ? 'alta' : item.confidence === 'medium' ? 'media' : 'baja'} · {item.period}</p><Button type="button" variant="ghost" onClick={() => setMessage(`Recomendación “${cleanCopy(item.title)}” enviada a aprobación.`)}>Revisar acción</Button></div></div></div></li>)}</ul></Panel> : <Panel><SectionHeader title="Administración técnica"/><p className="text-sm text-[var(--va-muted)]">La operación del cliente está aislada de la administración de plataforma. Usa Configuración, Soporte y Auditoría para tus actividades.</p></Panel>}
      </div>
    </div>
  )
}

function cleanCopy(value: string) {
  if (value.includes('nombre de campo tentativo')) return 'La ruta cerró su operación, pero todavía espera la confirmación de cobro. Mantenerla fuera del corte evita facturar una ruta no reconocida.'
  return value.replace(/backend/gi, 'fuente operativa').replace(/mock/gi, 'escenario')
}
