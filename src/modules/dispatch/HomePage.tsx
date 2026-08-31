import { NAV_ITEMS } from '@/app/shell/navConfig'
import { useAuth } from '@/auth/AuthProvider'
import { PROFILE_LABELS, type Profile } from '@/auth/capabilities'
import { Badge, KpiCard, MiniTrend, PageHeader, Panel, ProgressBar, SectionHeader } from '@/design-system/components/ui'
import { weekTrend } from '@/demo/operations'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { Activity, AlertTriangle, ArrowRight, Building2, CheckCircle2, CircleDollarSign, Clock3, FileCheck2, Fuel, Gauge, Headphones, PackageCheck, ReceiptText, Route, Settings, ShieldCheck, Truck, Users, Wallet, Wrench, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const roleCopy: Record<Profile, { title: string; subtitle: string }> = {
  dispatcher: { title: 'Jornada de despacho', subtitle: 'Prepara rutas, concilia paquetes y libera unidades sin diferencias.' },
  supervisor: { title: 'Pulso de la operación', subtitle: 'Prioriza rutas en riesgo, conductores y acciones de rescate.' },
  fleet_coordinator: { title: 'Disponibilidad de flota', subtitle: 'Anticipa servicios, combustible y bloqueos antes de la salida.' },
  admin_finance: { title: 'Cierre administrativo', subtitle: 'Concilia gastos, combustible, liquidaciones y facturación.' },
  manager: { title: 'Resumen ejecutivo', subtitle: 'Cumplimiento, contribución y excepciones que requieren decisión.' },
  csc_operator: { title: 'Centro de Servicios Compartidos', subtitle: 'Pendientes por cliente, SLA y entregables del día.' },
  platform_admin: { title: 'Salud de la plataforma', subtitle: 'Tenants, integraciones, soporte y trazabilidad.' },
}

interface DashboardSpec {
  focus: { eyebrow: string; title: string; detail: string; to: string; action: string }
  metrics: { label: string; value: string; hint: string; icon: LucideIcon; trend?: { value: string; direction: 'up' | 'down'; positive?: boolean } }[]
  trendTitle: string
  trendSubtitle: string
  progress: { label: string; value: number; tone?: 'teal' | 'amber' | 'danger' | 'navy' }[]
  priorities: { icon: LucideIcon; title: string; detail: string; tone: string }[]
}

const roleShortcutPaths: Record<Profile, string[]> = {
  dispatcher: ['/despacho', '/paquetes', '/devoluciones', '/aclaraciones', '/torre', '/alertas'],
  supervisor: ['/supervision', '/torre', '/alertas', '/flota', '/mantenimiento', '/talento', '/talento/incidencias', '/aclaraciones'],
  fleet_coordinator: ['/flota', '/mantenimiento', '/combustible', '/torre', '/alertas'],
  admin_finance: ['/liquidaciones', '/combustible', '/gastos', '/mantenimiento', '/talento', '/talento/incidencias', '/facturacion', '/reportes'],
  manager: ['/gerencia', '/torre', '/supervision', '/alertas', '/liquidaciones', '/reportes', '/gastos', '/aclaraciones'],
  csc_operator: ['/csc', '/despacho', '/supervision', '/aclaraciones', '/devoluciones', '/liquidaciones', '/facturacion', '/soporte'],
  platform_admin: ['/configuracion', '/soporte', '/auditoria', '/catalogo'],
}

export function HomePage() {
  const { user, can } = useAuth()
  const api = useApi()
  const routes = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })
  const alerts = useQuery({ queryKey: ['alerts'], enabled: Boolean(api), queryFn: () => api!.listAlerts() })
  if (!user) return null
  const copy = roleCopy[user.profile]
  const routeRows = routes.data?.items ?? []
  const active = routeRows.filter((route) => route.state === 'in_route').length
  const completed = routeRows.filter((route) => ['completed_returns_pending', 'returns_closed', 'closed_operationally', 'liquidatable', 'settled'].includes(route.state)).length
  const atRisk = (alerts.data?.items ?? []).filter((alert) => alert.state !== 'resolved').length
  const dashboard = dashboardFor(user.profile, active, completed, atRisk)
  const shortcuts = roleShortcutPaths[user.profile]
    .map((path) => NAV_ITEMS.find((item) => item.to === path))
    .filter((item): item is (typeof NAV_ITEMS)[number] => Boolean(item && can(item.capability)))

  return (
    <div className="space-y-5">
      <PageHeader title={`${copy.title}, ${user.displayName.split(' ')[0]}`} subtitle={`${copy.subtitle} · ${user.activeScope.cedisName}`} />
      <section className="relative overflow-hidden rounded-[22px] bg-[var(--va-navy)] p-5 text-white shadow-xl" aria-labelledby="next-action-title">
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border-[34px] border-white/[.04]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--va-teal)]">{dashboard.focus.eyebrow}</p>
            <h2 id="next-action-title" className="mt-2 text-xl font-bold lg:text-2xl">{dashboard.focus.title}</h2>
            <p className="mt-1 text-sm text-white/70">{dashboard.focus.detail}</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[var(--va-navy)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--va-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--va-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--va-navy)]" to={dashboard.focus.to}>
            {dashboard.focus.action}<ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => <KpiCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} trend={metric.trend} icon={<metric.icon size={18} />} />)}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel>
          <SectionHeader title={dashboard.trendTitle} subtitle={dashboard.trendSubtitle} action={<Badge tone="ok">Actualizado ahora</Badge>} />
          <MiniTrend values={weekTrend} />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {dashboard.progress.map((item) => <ProgressBar key={item.label} value={item.value} label={item.label} tone={item.tone} />)}
          </div>
        </Panel>
        <Panel>
          <SectionHeader title="Prioridades de hoy" subtitle="Ordenadas por impacto y vencimiento" />
          <ul className="space-y-3">
            {dashboard.priorities.map((item) => (
              <li key={item.title} className="flex gap-3 rounded-xl bg-[var(--va-soft)] p-3">
                <item.icon className={item.tone} size={19} /><div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-[var(--va-muted)]">{item.detail}</p></div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="font-bold">Espacio de trabajo</h2><p className="text-xs text-[var(--va-muted)]">Accesos de {PROFILE_LABELS[user.profile]}</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to} className="group flex min-h-24 items-center gap-3 rounded-[var(--va-radius)] border border-[var(--va-line)] bg-[var(--va-surface)] p-4 shadow-[var(--va-shadow)] transition hover:-translate-y-0.5 hover:border-[var(--va-teal)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--va-soft)] text-[var(--va-teal-700)]"><Icon size={20} /></span>
                <div className="min-w-0"><p className="font-semibold">{item.label}</p><p className="mt-1 flex items-center gap-1 text-xs text-[var(--va-muted)] group-hover:text-[var(--va-teal-700)]">Abrir módulo <ArrowRight size={13} /></p></div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function dashboardFor(profile: Profile, active: number, completed: number, atRisk: number): DashboardSpec {
  const specs: Record<Profile, DashboardSpec> = {
    dispatcher: {
      focus: { eyebrow: 'Siguiente acción · vence en 18 min', title: 'Conciliar la carga de R-GDLR-2402', detail: 'Hay 2 paquetes esperados que aún no están escaneados. La unidad no debe salir hasta resolver la diferencia.', to: '/despacho', action: 'Resolver diferencia' },
      metrics: [
        { label: 'Rutas por liberar', value: '4', hint: 'Ventana 06:00', icon: Route },
        { label: 'En operación', value: String(Math.max(active, 17)), hint: '3 bandas de salida', icon: Truck },
        { label: 'Carga con diferencias', value: '1', hint: '2 paquetes pendientes', icon: AlertTriangle },
        { label: 'Devoluciones', value: '2', hint: 'Acuse antes de 17:00', icon: PackageCheck },
      ],
      trendTitle: 'Cumplimiento de despacho', trendSubtitle: 'Liberación segura de rutas y custodia de paquetes',
      progress: [{ label: 'Salidas a tiempo', value: 87 }, { label: 'Cargas conciliadas', value: 96, tone: 'navy' }, { label: 'Acuses cerrados', value: 82, tone: 'amber' }],
      priorities: [
        { icon: AlertTriangle, title: 'Diferencia de carga en VA-18', detail: 'Resolver antes de autorizar salida', tone: 'text-[var(--va-danger)]' },
        { icon: Clock3, title: '2 devoluciones sin acuse', detail: 'R-GDLR-2405 · vence 17:00', tone: 'text-[var(--va-warning)]' },
        { icon: FileCheck2, title: '1 aclaración requiere envío', detail: 'Expediente completo · SLA 3 h', tone: 'text-[var(--va-info)]' },
        { icon: CheckCircle2, title: '26 rutas liberadas', detail: 'Sin diferencias pendientes', tone: 'text-[var(--va-success)]' },
      ],
    },
    supervisor: {
      focus: { eyebrow: 'Siguiente acción · prioridad crítica', title: 'Intervenir el desvío de VA-21', detail: 'La unidad lleva 18 minutos fuera de la secuencia oficial. Contacta al conductor y documenta el plan de apoyo.', to: '/supervision', action: 'Abrir intervención' },
      metrics: [
        { label: 'Rutas activas', value: String(Math.max(active, 17)), hint: '26 conductores en jornada', icon: Truck },
        { label: 'Dentro de secuencia', value: '94%', hint: '+2.1% contra ayer', icon: Gauge },
        { label: 'Requieren atención', value: String(atRisk || 3), hint: '1 crítica · 2 preventivas', icon: AlertTriangle },
        { label: 'Incidencias de personal', value: '2', hint: '1 pendiente de evidencia', icon: Users },
      ],
      trendTitle: 'Pulso operativo', trendSubtitle: 'Adherencia, avance y capacidad de respuesta',
      progress: [{ label: 'Rutas en secuencia', value: 94 }, { label: 'Alertas dentro de SLA', value: 92, tone: 'navy' }, { label: 'Incidencias documentadas', value: 88, tone: 'amber' }],
      priorities: [
        { icon: AlertTriangle, title: 'VA-21 fuera de secuencia', detail: 'Contactar antes de 13:35', tone: 'text-[var(--va-danger)]' },
        { icon: Activity, title: 'VA-18 puede requerir apoyo', detail: '42% de avance · ETA 15:42', tone: 'text-[var(--va-warning)]' },
        { icon: Users, title: 'Retardo pendiente de evidencia', detail: 'Luis Cárdenas · ruta 2401', tone: 'text-[var(--va-info)]' },
        { icon: CheckCircle2, title: '14 rutas sin desviaciones', detail: 'Monitoreo normal', tone: 'text-[var(--va-success)]' },
      ],
    },
    fleet_coordinator: {
      focus: { eyebrow: 'Siguiente acción · mantenimiento preventivo', title: 'Programar el servicio de VA-21', detail: 'Faltan 240 km para el servicio. Reservarlo al cierre evita comprometer la banda de mañana.', to: '/mantenimiento', action: 'Programar servicio' },
      metrics: [
        { label: 'Unidades disponibles', value: '27', hint: '1 taller · 2 reserva', icon: Truck },
        { label: 'Servicios esta semana', value: '3', hint: '1 requiere autorización', icon: Wrench },
        { label: 'GPS transmitiendo', value: '29/30', hint: '1 señal desactualizada', icon: Activity },
        { label: 'Rendimiento promedio', value: '7.6 km/L', hint: '+0.4 contra objetivo', icon: Fuel },
      ],
      trendTitle: 'Disponibilidad y costo de flota', trendSubtitle: 'Prevención, señal GPS y rendimiento',
      progress: [{ label: 'Disponibilidad', value: 90 }, { label: 'Mantenimiento a tiempo', value: 94, tone: 'navy' }, { label: 'Objetivo combustible', value: 84, tone: 'amber' }],
      priorities: [
        { icon: Wrench, title: 'VA-21 próxima a servicio', detail: '240 km restantes', tone: 'text-[var(--va-warning)]' },
        { icon: Activity, title: 'GPS de VA-12 desactualizado', detail: 'Última señal hace 46 min', tone: 'text-[var(--va-danger)]' },
        { icon: Fuel, title: 'VA-18 debajo de rendimiento', detail: 'Revisar presión y carga', tone: 'text-[var(--va-info)]' },
        { icon: CheckCircle2, title: '27 unidades disponibles', detail: 'Cobertura completa para mañana', tone: 'text-[var(--va-success)]' },
      ],
    },
    admin_finance: {
      focus: { eyebrow: 'Siguiente acción · cierre diario', title: 'Revisar el corte del 30 de agosto', detail: 'Hay 26 rutas conciliadas, 2 pendientes de confirmación y 1 diferencia que debe quedar documentada.', to: '/liquidaciones', action: 'Revisar corte' },
      metrics: [
        { label: 'Cortes por cerrar', value: '2', hint: '1 diferencia abierta', icon: ReceiptText },
        { label: 'Combustible por autorizar', value: '3', hint: '$1,860 recomendados', icon: Fuel },
        { label: 'Gastos por conciliar', value: '4', hint: '$1,245 con comprobante', icon: Wallet },
        { label: 'Facturado este mes', value: '$44,440', hint: '3 documentos', icon: CircleDollarSign, trend: { value: '+8.4%', direction: 'up' } },
      ],
      trendTitle: 'Cierre administrativo', trendSubtitle: 'Conciliación, evidencia y recuperación de ingresos',
      progress: [{ label: 'Rutas conciliadas', value: 87 }, { label: 'Gastos comprobados', value: 93, tone: 'navy' }, { label: 'Facturas emitidas', value: 78, tone: 'amber' }],
      priorities: [
        { icon: ReceiptText, title: 'Corte diario listo para revisión', detail: '26 rutas · 1 con diferencia', tone: 'text-[var(--va-danger)]' },
        { icon: Fuel, title: '3 cargas esperan autorización', detail: 'Recomendación calculada por ruta', tone: 'text-[var(--va-warning)]' },
        { icon: Users, title: '1 incidencia por aprobar', detail: 'Evidencia operativa completa', tone: 'text-[var(--va-info)]' },
        { icon: CheckCircle2, title: '24 rutas listas para cobro', detail: '$43,840 confirmados', tone: 'text-[var(--va-success)]' },
      ],
    },
    manager: {
      focus: { eyebrow: 'Siguiente decisión · impacto económico', title: 'Revisar el resultado consolidado del día', detail: 'La operación alcanzó 96.8% de efectividad y $22,780 de contribución estimada; una aclaración vence hoy.', to: '/gerencia', action: 'Abrir tablero' },
      metrics: [
        { label: 'Rutas programadas', value: '30', hint: '26 salieron · ' + Math.max(completed, 8) + ' terminaron', icon: Route },
        { label: 'Efectividad', value: '96.8%', hint: '847 de 875 paquetes', icon: PackageCheck, trend: { value: '+1.6%', direction: 'up' } },
        { label: 'Contribución', value: '$22,780', hint: 'Estimación · 51.9%', icon: CircleDollarSign, trend: { value: '+4.2%', direction: 'up' } },
        { label: 'Alertas críticas', value: '1', hint: 'Atención dentro de SLA', icon: AlertTriangle },
      ],
      trendTitle: 'Desempeño del negocio', trendSubtitle: 'Cumplimiento, contribución y costo operativo',
      progress: [{ label: 'Efectividad', value: 97 }, { label: 'Utilización de flota', value: 90, tone: 'navy' }, { label: 'Margen objetivo', value: 84, tone: 'amber' }],
      priorities: [
        { icon: CircleDollarSign, title: '1 aclaración vence hoy', detail: '$412 de ingreso protegido', tone: 'text-[var(--va-danger)]' },
        { icon: Fuel, title: 'VA-21 con rendimiento bajo', detail: 'Impacto estimado $184/semana', tone: 'text-[var(--va-warning)]' },
        { icon: Wrench, title: 'VA-27 permanece en taller', detail: 'Liberación estimada 17:30', tone: 'text-[var(--va-info)]' },
        { icon: CheckCircle2, title: 'Cobro confirmado', detail: '$43,840 conciliados', tone: 'text-[var(--va-success)]' },
      ],
    },
    csc_operator: {
      focus: { eyebrow: 'Siguiente acción · SLA multiempresa', title: 'Atender tres entregables próximos a vencer', detail: 'RSA concentra una aclaración, un corte y una pre-factura que requieren preparación antes del cierre.', to: '/csc', action: 'Abrir cartera CSC' },
      metrics: [
        { label: 'Clientes activos', value: '3', hint: '2 plazas operando', icon: Building2 },
        { label: 'Tareas pendientes', value: '8', hint: '3 vencen hoy', icon: FileCheck2 },
        { label: 'Cumplimiento SLA', value: '96%', hint: '+1 punto este mes', icon: Gauge, trend: { value: '+1%', direction: 'up' } },
        { label: 'Cortes preparados', value: '26', hint: '2 por confirmar', icon: ReceiptText },
      ],
      trendTitle: 'Nivel de servicio CSC', trendSubtitle: 'Entregables, SLA y preparación por cliente',
      progress: [{ label: 'SLA operativo', value: 96 }, { label: 'Cortes preparados', value: 87, tone: 'navy' }, { label: 'Expedientes completos', value: 92 }],
      priorities: [
        { icon: FileCheck2, title: 'Aclaración RSA vence hoy', detail: 'Expediente listo para envío', tone: 'text-[var(--va-danger)]' },
        { icon: ReceiptText, title: 'Corte semanal por preparar', detail: '26 rutas conciliadas', tone: 'text-[var(--va-warning)]' },
        { icon: CircleDollarSign, title: 'Pre-factura pendiente', detail: 'Periodo 25–31 agosto', tone: 'text-[var(--va-info)]' },
        { icon: CheckCircle2, title: 'SLA global dentro de meta', detail: '96% de cumplimiento', tone: 'text-[var(--va-success)]' },
      ],
    },
    platform_admin: {
      focus: { eyebrow: 'Siguiente acción · salud técnica', title: 'Revisar la integración GPS con señal degradada', detail: 'Una conexión presenta datos desactualizados. La operación del cliente permanece aislada del perfil técnico.', to: '/configuracion', action: 'Revisar integración' },
      metrics: [
        { label: 'Disponibilidad', value: '99.92%', hint: 'Últimos 30 días', icon: ShieldCheck },
        { label: 'Integraciones sanas', value: '5/6', hint: '1 con señal degradada', icon: Activity },
        { label: 'Usuarios activos', value: '12', hint: '7 perfiles configurados', icon: Users },
        { label: 'Tickets abiertos', value: '4', hint: '1 prioridad crítica', icon: Headphones },
      ],
      trendTitle: 'Salud de la plataforma', trendSubtitle: 'Disponibilidad, integraciones y seguridad',
      progress: [{ label: 'Disponibilidad', value: 99 }, { label: 'Integraciones sanas', value: 83, tone: 'amber' }, { label: 'Eventos auditados', value: 100, tone: 'navy' }],
      priorities: [
        { icon: Activity, title: 'Conector GPS degradado', detail: 'Última señal hace 46 min', tone: 'text-[var(--va-danger)]' },
        { icon: Headphones, title: '1 ticket de prioridad crítica', detail: 'Respuesta dentro de 11 min', tone: 'text-[var(--va-warning)]' },
        { icon: Settings, title: 'Revisar versión de configuración', detail: 'Cambios pendientes de publicación', tone: 'text-[var(--va-info)]' },
        { icon: ShieldCheck, title: 'Auditoría íntegra', detail: '184 eventos · sin alteraciones', tone: 'text-[var(--va-success)]' },
      ],
    },
  }
  return specs[profile]
}
