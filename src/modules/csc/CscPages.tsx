import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, FilterBar, KpiCard, PageHeader, Panel, ProgressBar, SearchField, SectionHeader, SelectField, Skeleton, StatusMessage } from '@/design-system/components/ui'
import { auditSeed, configSections, cscClients, drivers, payrollIncidents, supportTickets, toneFor } from '@/demo/operations'
import { formatDateTime } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { Activity, Bell, BookOpenCheck, Building2, CheckCircle2, ClipboardList, FileCheck2, Headphones, PlugZap, Settings, ShieldCheck, Users, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export function CscPage() {
  const { user, switchTenant, can } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('Atención operativa y revisión de entregables del cliente.')
  const [message, setMessage] = useState('')
  if (!user) return null
  const other = user.allowedScopes.find((scope) => scope.id !== user.activeScope.id)
  return (
    <div className="space-y-4">
      <PageHeader title="Centro de Servicios Compartidos" subtitle="Operación multiempresa con SLA, segregación y trazabilidad de cada intervención." actions={can('csc.tenant.switch') && other ? <Button type="button" data-testid="switch-tenant" onClick={() => setOpen(true)}>Cambiar a {other.companyName}</Button> : undefined} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Clientes atendidos" value="3" hint="2 operando · 1 onboarding" icon={<Building2 size={18}/>} /><KpiCard label="Pendientes CSC" value="14" hint="3 vencen hoy" icon={<ClipboardList size={18}/>} /><KpiCard label="SLA global" value="98.1%" hint="Meta 97%" trend={{value:'+1.1%',direction:'up'}} icon={<Activity size={18}/>} /><KpiCard label="Entregables hoy" value="9/11" hint="2 liquidaciones por cerrar" icon={<CheckCircle2 size={18}/>} /></section>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Panel><SectionHeader title="Cartera de clientes" subtitle="Salud, operación y pendientes por tenant"/><DataTable caption="Clientes CSC" rows={cscClients} columns={[
          { key: 'name', header: 'Cliente', render: (row) => <div><Link className="font-bold text-[var(--va-teal-700)]" to={`/csc/clientes/${row.id}`}>{row.name}</Link><p className="text-xs text-[var(--va-muted)]">{row.plaza} · {row.units} unidades</p></div> },
          { key: 'routes', header: 'Operación hoy', render: (row) => <div><p className="font-semibold">{row.routesToday} rutas</p><p className="text-xs text-[var(--va-muted)]">{row.alerts} alertas</p></div> },
          { key: 'health', header: 'Salud', render: (row) => <div className="min-w-24"><ProgressBar value={row.health}/></div> },
          { key: 'pending', header: 'Pendientes', render: (row) => <Badge tone={row.pending > 5 ? 'warn' : 'info'}>{row.pending}</Badge> },
          { key: 'sla', header: 'SLA', render: (row) => <strong>{row.sla}</strong> },
          { key: 'state', header: 'Estado', render: (row) => <Badge tone={toneFor(row.state)}>{row.state}</Badge> },
        ]}/></Panel>
        <Panel><SectionHeader title="Cola de trabajo" subtitle="Priorizada por SLA e impacto"/><ul className="space-y-3">{[
          ['RSA Última Milla','Resolver diferencia de liquidación','39 min','Crítica'],['RSA Última Milla','Enviar aclaración ML-771001','2 h 14 min','Alta'],['Cliente demo Norte','Validar 4 usuarios nuevos','5 h 48 min','Media'],['Entrega Bajío','Publicar resumen semanal','Hoy · 17:00','Baja'],
        ].map(([client,title,sla,priority]) => <li key={title} className="rounded-xl border border-[var(--va-line)] p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-[var(--va-muted)]">{client}</p></div><Badge tone={toneFor(priority)}>{priority}</Badge></div><div className="mt-2 flex items-center justify-between"><span className="text-xs text-[var(--va-muted)]">SLA {sla}</span><Button type="button" variant="ghost" onClick={() => setMessage(`${title}: tarea abierta en el tenant correcto.`)}>Atender</Button></div></li>)}</ul></Panel>
      </div>
      <ConfirmDialog open={open} title="Cambiar de cliente" body="El cliente activo quedará visible durante toda la sesión y cada consulta se registrará en auditoría." confirmLabel="Cambiar tenant" reason={reason} onReason={setReason} onCancel={() => setOpen(false)} onConfirm={() => { if (!other) return; void switchTenant(other.companyId, reason).then(() => { setOpen(false); setMessage(`Ahora atiendes ${other.companyName}. El cambio quedó auditado.`) }) }} />
    </div>
  )
}

export function CscClientPage() {
  const { id = '' } = useParams()
  const client = cscClients.find((item) => item.id === id) ?? cscClients[0]
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-4">
      <PageHeader title={client.name} subtitle={`${client.plaza} · Expediente operativo y servicios contratados`} actions={<Button type="button" onClick={() => setMessage('Checklist de servicio actualizado y compartido con el responsable del cliente.')}>Actualizar seguimiento</Button>} />
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Unidades" value={String(client.units)} hint="GPS integrado"/><KpiCard label="Rutas hoy" value={String(client.routesToday)} hint="3 bandas de salida"/><KpiCard label="Salud operativa" value={`${client.health}%`} hint={`${client.alerts} alertas`}/><KpiCard label="SLA CSC" value={client.sla} hint={`${client.pending} pendientes`}/></section>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><Panel><SectionHeader title="Expediente del cliente" subtitle="Configuración operativa y responsables"/><div className="grid gap-3 sm:grid-cols-2">{[
        ['Operación','Guadalajara · CEDIS GDL R · 3 bandas'],['Flota','30 unidades · conductor habitual'],['GPS','30 dispositivos · 29 transmitiendo'],['Usuarios','9 activos · 5 perfiles'],['Responsable cliente','Mauricio Herrera · Operaciones'],['Responsable CSC','Fabio Ortega · Cuenta'],['Facturación','Semanal · corte lunes'],['Servicio','Control + CSC operativo'],
      ].map(([label,value]) => <div key={label} className="rounded-xl bg-[var(--va-soft)] p-3"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--va-muted)]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div></Panel><Panel><SectionHeader title="Módulos habilitados"/><ul className="space-y-3">{['Despacho y custodia','Torre y supervisión','Flota y mantenimiento','Combustible y gastos','Liquidaciones y facturación','Talento y nómina','Gerencia y copiloto'].map((item) => <li key={item} className="flex items-center justify-between"><span className="text-sm">{item}</span><Badge tone="ok">Activo</Badge></li>)}</ul></Panel></div>
      <Panel><SectionHeader title="Plan de servicio" subtitle="Entregables, responsable y próximo vencimiento"/><DataTable caption="Plan de servicio" rows={[
        {id:'svc1',deliverable:'Monitoreo de jornada',owner:'CSC Operaciones',frequency:'Diario',next:'En curso',state:'Dentro de SLA'},
        {id:'svc2',deliverable:'Corte y conciliación',owner:'CSC Administración',frequency:'Diario',next:'Hoy · 18:00',state:'En preparación'},
        {id:'svc3',deliverable:'Pre-factura',owner:'CSC Finanzas',frequency:'Semanal',next:'2 sep',state:'Programado'},
        {id:'svc4',deliverable:'Reporte gerencial',owner:'CSC Cuenta',frequency:'Semanal',next:'1 sep',state:'Programado'},
      ]} columns={[
        {key:'d',header:'Entregable',render:(row)=><strong>{row.deliverable}</strong>},{key:'o',header:'Responsable',render:(row)=>row.owner},{key:'f',header:'Frecuencia',render:(row)=>row.frequency},{key:'n',header:'Próximo',render:(row)=>row.next},{key:'s',header:'Estado',render:(row)=><Badge tone={toneFor(row.state)}>{row.state}</Badge>},
      ]}/></Panel>
    </div>
  )
}

export function TalentPage() {
  const { can } = useAuth()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [message, setMessage] = useState('')
  const rows = drivers.filter((row) => `${row.name} ${row.unit}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Todos' || row.status === filter || row.documents === filter))
  return (
    <div className="space-y-4">
      <PageHeader title="Talento" subtitle="Expediente, disponibilidad, capacitación, documentos y desempeño de repartidores." actions={can('talent.manage') ? <Button type="button" onClick={() => setMessage('Nuevo candidato agregado al proceso de reclutamiento.')}>Agregar candidato</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Conductores activos" value="30" hint="26 operando hoy" icon={<Users size={18}/>} /><KpiCard label="Expedientes completos" value="28" hint="2 documentos por renovar" icon={<FileCheck2 size={18}/>} /><KpiCard label="Capacitación" value="93%" hint="2 cursos pendientes" icon={<BookOpenCheck size={18}/>} /><KpiCard label="Efectividad promedio" value="97.4%" hint="Meta 96%" trend={{value:'+1.4%',direction:'up'}} icon={<Activity size={18}/>} /></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <FilterBar><SearchField aria-label="Buscar conductor" placeholder="Buscar conductor o unidad" value={search} onChange={(event) => setSearch(event.target.value)}/><SelectField aria-label="Filtrar talento" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Todos</option><option>Activo</option><option>En ruta</option><option>Por vencer</option></SelectField></FilterBar>
      <DataTable caption="Conductores" rows={rows} columns={[
        {key:'name',header:'Conductor',render:(row)=><div><strong>{row.name}</strong><p className="text-xs text-[var(--va-muted)]">{row.phone}</p></div>},{key:'unit',header:'Unidad habitual',render:(row)=>row.unit},{key:'state',header:'Estado',render:(row)=><Badge tone={toneFor(row.status)}>{row.status}</Badge>},{key:'score',header:'Desempeño',render:(row)=><div className="min-w-24"><p className="font-bold">{row.score}/100</p><ProgressBar value={row.score}/></div>},{key:'delivery',header:'Efectividad',render:(row)=>`${row.delivery}%`},{key:'training',header:'Capacitación',render:(row)=><Badge tone={row.training==='Completa'?'ok':'warn'}>{row.training}</Badge>},{key:'docs',header:'Documentos',render:(row)=><div><Badge tone={row.documents==='Al día'?'ok':'warn'}>{row.documents}</Badge><p className="mt-1 text-xs text-[var(--va-muted)]">{row.nextExpiry}</p></div>},{key:'action',header:'Expediente',render:(row)=><Button type="button" variant="ghost" onClick={()=>setMessage(`Expediente de ${row.name} abierto con documentos y desempeño.`)}>Abrir</Button>},
      ]}/>
    </div>
  )
}

export function TalentIncidentsPage() {
  const { can } = useAuth()
  const [rows, setRows] = useState(payrollIncidents)
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  return (
    <div className="space-y-4">
      <PageHeader title="Incidencias de nómina" subtitle="Ausencias, retardos, bonos y excepciones vinculados a evidencia operativa." actions={can('talent.incident.capture') ? <Button type="button" onClick={() => setMessage('Incidencia capturada y enviada a revisión administrativa.')}>Capturar incidencia</Button> : undefined} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Por aprobar" value="1" hint="Impacto -$85"/><KpiCard label="En análisis" value="1" hint="Uso fuera de política"/><KpiCard label="Bonos del periodo" value="$880" hint="2 rutas adicionales"/><KpiCard label="Asistencia" value="97.8%" hint="Últimos 30 días"/></section>
      {message ? <StatusMessage>{message}</StatusMessage> : null}
      <DataTable caption="Incidencias de nómina" rows={rows} columns={[
        {key:'driver',header:'Conductor',render:(row)=><strong>{row.driver}</strong>},{key:'date',header:'Fecha',render:(row)=>row.date},{key:'type',header:'Incidencia',render:(row)=>row.type},{key:'route',header:'Ruta',render:(row)=>row.route},{key:'evidence',header:'Evidencia',render:(row)=><Badge tone="ok">{row.evidence}</Badge>},{key:'impact',header:'Impacto',render:(row)=><strong>{row.impact}</strong>},{key:'state',header:'Estado',render:(row)=><Badge tone={toneFor(row.state)}>{row.state}</Badge>},{key:'action',header:'Acción',render:(row)=>can('payroll.incident.approve')&&row.state==='Por aprobar'?<Button type="button" onClick={()=>setSelected(row.id)}>Aprobar</Button>:<Button type="button" variant="ghost" onClick={()=>setMessage(`Evidencia de ${row.type.toLowerCase()} abierta.`)}>Ver</Button>},
      ]}/>
      <ConfirmDialog open={Boolean(selected)} title="Aprobar incidencia" body="Confirma evidencia, política aplicable e impacto antes de enviarla al cálculo de nómina." confirmLabel="Aprobar" onCancel={()=>setSelected(null)} onConfirm={()=>{setRows((current)=>current.map((row)=>row.id===selected?{...row,state:'Aprobado'}:row));setSelected(null);setMessage('Incidencia aprobada y enviada a nómina.')}}/>
    </div>
  )
}

export function SupportPage() {
  const api = useApi()
  const { user } = useAuth()
  const [filter, setFilter] = useState('Todos')
  const [message, setMessage] = useState('')
  const rows = supportTickets.filter((row)=>filter==='Todos'||row.severity===filter||row.state===filter)
  return (
    <div className="space-y-4">
      <PageHeader title="Mesa de ayuda" subtitle="Incidentes, solicitudes y seguimiento técnico por cliente y severidad." actions={<Button type="button" onClick={()=>setMessage('Nuevo ticket creado y diagnóstico seguro adjuntado.')}>Nuevo ticket</Button>} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><KpiCard label="Abiertos" value="4" hint="1 crítico" icon={<Headphones size={18}/>} /><KpiCard label="Dentro de SLA" value="96%" hint="Meta 95%"/><KpiCard label="Tiempo de respuesta" value="11 min" hint="Promedio del mes"/><KpiCard label="Disponibilidad" value="99.92%" hint="Últimos 30 días"/></section>
      {message?<StatusMessage>{message}</StatusMessage>:null}
      <FilterBar><SelectField aria-label="Filtrar tickets" value={filter} onChange={(event)=>setFilter(event.target.value)}><option>Todos</option><option>Crítica</option><option>Alta</option><option>En atención</option><option>Escalado</option></SelectField></FilterBar>
      <DataTable caption="Tickets de soporte" rows={rows} columns={[
        {key:'id',header:'Ticket',render:(row)=><strong>{row.id}</strong>},{key:'client',header:'Cliente',render:(row)=>row.client},{key:'subject',header:'Asunto',render:(row)=><div><p className="font-medium">{row.subject}</p><p className="text-xs text-[var(--va-muted)]">{row.opened}</p></div>},{key:'severity',header:'Prioridad',render:(row)=><Badge tone={toneFor(row.severity)}>{row.severity}</Badge>},{key:'owner',header:'Responsable',render:(row)=>row.owner},{key:'sla',header:'SLA restante',render:(row)=>row.sla},{key:'state',header:'Estado',render:(row)=><Badge tone={toneFor(row.state)}>{row.state}</Badge>},{key:'action',header:'Acción',render:(row)=><Button type="button" variant="ghost" onClick={()=>setMessage(`${row.id} abierto con conversación, evidencia y diagnóstico.`)}>Atender</Button>},
      ]}/>
      <Panel><SectionHeader title="Diagnóstico seguro" subtitle="Información técnica sin secretos ni datos personales"/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Aplicación','Vía Ágil Control 0.1.0'],['Conexión',api?.kind==='mock'?'Entorno de demostración':'API pública'],['Cliente',user?.activeScope.companyName??'—'],['Plaza',user?.activeScope.plazaName??'—']].map(([label,value])=><div key={label} className="rounded-xl bg-[var(--va-soft)] p-3"><p className="text-xs text-[var(--va-muted)]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div></Panel>
    </div>
  )
}

export function AuditPage() {
  const api = useApi()
  const { user } = useAuth()
  const [search,setSearch]=useState('')
  const query = useQuery({ queryKey: ['audit'], enabled: Boolean(api), queryFn: () => api!.listAudit() })
  if (query.isLoading || !api || !user) return <Skeleton />
  const apiRows=(query.data?.items??[]).map((row)=>({id:row.id,at:formatDateTime(row.at,user.activeScope.timezone),actor:row.actor,action:translateAction(row.action),entity:translateEntity(row.entity),reason:row.reason??'Acción autorizada',tenant:user.activeScope.companyName}))
  const rows=[...apiRows,...auditSeed].filter((row)=>`${row.actor} ${row.action} ${row.entity}`.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="space-y-4"><PageHeader title="Auditoría" subtitle="Trazabilidad de accesos, decisiones, aprobaciones y cambios de información." actions={<Button type="button" variant="ghost">Exportar bitácora</Button>}/><section className="grid gap-3 sm:grid-cols-3"><KpiCard label="Eventos de hoy" value="184" hint="14 acciones críticas"/><KpiCard label="Usuarios activos" value="12" hint="7 perfiles"/><KpiCard label="Integridad" value="100%" hint="Sin eventos alterados"/></section><FilterBar><SearchField aria-label="Buscar auditoría" placeholder="Buscar usuario, acción o entidad" value={search} onChange={(event)=>setSearch(event.target.value)}/><SelectField aria-label="Periodo auditoría"><option>Hoy</option><option>Últimos 7 días</option></SelectField></FilterBar><DataTable caption="Bitácora" rows={rows} columns={[
      {key:'at',header:'Cuándo',render:(row)=>row.at},{key:'actor',header:'Quién',render:(row)=><strong>{row.actor}</strong>},{key:'action',header:'Acción',render:(row)=>row.action},{key:'entity',header:'Entidad',render:(row)=>row.entity},{key:'tenant',header:'Cliente',render:(row)=>row.tenant},{key:'reason',header:'Motivo',render:(row)=><span className="text-sm text-[var(--va-muted)]">{row.reason}</span>},
    ]}/></div>
  )
}

export function ConfigPage() {
  const { can } = useAuth()
  const [message,setMessage]=useState('')
  return (
    <div className="space-y-4"><PageHeader title="Configuración" subtitle="Operación, reglas, integraciones, usuarios y notificaciones del cliente." actions={can('config.manage') ? <Button type="button" onClick={()=>setMessage('Cambios validados y publicados con una nueva versión de configuración.')}>Publicar cambios</Button> : undefined}/>{message?<StatusMessage>{message}</StatusMessage>:null}<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{configSections.map((section,index)=>{const icons=[Settings,PlugZap,ShieldCheck,Users,Wrench,Bell];const Icon=icons[index];return <Panel key={section.id}><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--va-soft)] text-[var(--va-teal-700)]"><Icon size={20}/></span><Badge tone={toneFor(section.status)}>{section.status}</Badge></div><h2 className="mt-3 font-bold">{section.title}</h2><p className="mt-1 text-sm text-[var(--va-muted)]">{section.description}</p><ul className="mt-3 space-y-2">{section.items.map((item)=><li key={item} className="flex items-center gap-2 text-sm"><CheckCircle2 className="text-[var(--va-success)]" size={15}/>{item}</li>)}</ul>{can('config.manage') ? <Button className="mt-4 w-full" type="button" variant="secondary" onClick={()=>setMessage(`${section.title}: configuración abierta para edición.`)}>Administrar</Button> : <Badge tone="neutral">Sólo consulta</Badge>}</Panel>})}</section></div>
  )
}

export function CatalogPage() {
  return <div className="space-y-6"><PageHeader title="Catálogo interno de interfaz" subtitle="Referencia de componentes disponible únicamente para administración de plataforma."/><Panel><SectionHeader title="Estados y acciones"/><div className="flex flex-wrap gap-2"><Badge tone="ok">Operando</Badge><Badge tone="info">En atención</Badge><Badge tone="warn">Pendiente</Badge><Badge tone="danger">Crítico</Badge></div><div className="mt-4 flex flex-wrap gap-2"><Button type="button">Acción primaria</Button><Button type="button" variant="secondary">Acción secundaria</Button><Button type="button" variant="ghost">Acción auxiliar</Button><Button type="button" variant="danger">Acción crítica</Button></div></Panel></div>
}

export function ScopePage() {
  const { user,switchScope }=useAuth()
  const [message,setMessage]=useState('')
  if(!user)return null
  return <div className="space-y-4"><PageHeader title="Alcance operativo" subtitle="Selecciona empresa, plaza, CEDIS, turno y flota autorizados."/>{message?<StatusMessage>{message}</StatusMessage>:null}<div className="grid gap-3 md:grid-cols-2">{user.allowedScopes.map((scope)=><button type="button" key={scope.id} onClick={()=>void switchScope(scope.id).then(()=>setMessage(`Alcance cambiado a ${scope.companyName} · ${scope.plazaName}.`))} className={`rounded-2xl border p-4 text-left ${scope.id===user.activeScope.id?'border-[var(--va-teal)] bg-[#effbf9]':'border-[var(--va-line)] bg-white'}`}><div className="flex items-start justify-between"><div><h2 className="font-bold">{scope.companyName}</h2><p className="text-sm text-[var(--va-muted)]">{scope.plazaName} · {scope.cedisName}</p></div><Badge tone={scope.id===user.activeScope.id?'ok':'neutral'}>{scope.id===user.activeScope.id?'Activo':'Disponible'}</Badge></div><p className="mt-3 text-sm">{scope.shiftName} · {scope.fleetName} · {scope.timezone}</p></button>)}</div></div>
}

function translateAction(action:string){const map:Record<string,string>={'csc.tenant.switch':'Cambió de cliente','fuel.authorize':'Autorizó combustible','alert.resolve':'Resolvió alerta','route.confirm_exit':'Confirmó salida'};return map[action]??action.replaceAll('.',' · ')}
function translateEntity(entity:string){return entity.replace('rt_','R-GDLR-').replace('co_rsa','RSA Última Milla').replace('co_demo','Cliente demo Norte')}
