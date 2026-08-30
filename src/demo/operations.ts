export type DemoTone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral'

export interface ClaimRecord {
  id: string
  tracking: string
  route: string
  unit: string
  recipient: string
  reason: string
  state: 'Nuevo' | 'En análisis' | 'Enviado a ML' | 'A favor' | 'No procedente'
  amount: number
  evidence: number
  locationMatch: boolean
  due: string
  owner: string
}

export const claims: ClaimRecord[] = [
  { id: 'cl_01', tracking: 'ML-771001', route: 'R-GDLR-2404', unit: 'VA-21', recipient: 'M. R*****', reason: 'Destinatario indica no recibido', state: 'En análisis', amount: 412, evidence: 4, locationMatch: true, due: 'Hoy · 16:30', owner: 'Laura Medina' },
  { id: 'cl_02', tracking: 'ML-771019', route: 'R-GDLR-2405', unit: 'VA-03', recipient: 'A. S*****', reason: 'Entrega fuera de geocerca', state: 'Enviado a ML', amount: 685, evidence: 3, locationMatch: false, due: 'Hoy · 18:00', owner: 'Carlos Ruiz' },
  { id: 'cl_03', tracking: 'ML-662304', route: 'R-GDLR-2398', unit: 'VA-15', recipient: 'J. L*****', reason: 'Firma desconocida', state: 'A favor', amount: 529, evidence: 5, locationMatch: true, due: 'Resuelto', owner: 'Laura Medina' },
  { id: 'cl_04', tracking: 'ML-551198', route: 'R-GDLR-2396', unit: 'VA-09', recipient: 'R. P*****', reason: 'Fotografía no concluyente', state: 'No procedente', amount: 390, evidence: 2, locationMatch: true, due: 'Cerrado', owner: 'Carlos Ruiz' },
]

export const returnManifest = [
  { id: 'ret_1', tracking: 'ML-551207', route: 'R-GDLR-2405', unit: 'VA-03', cause: 'Domicilio cerrado', custody: 'Rosa Vidal', state: 'Pendiente de acuse', scanned: true },
  { id: 'ret_2', tracking: 'ML-551219', route: 'R-GDLR-2405', unit: 'VA-03', cause: 'Cliente rechazó', custody: 'Rosa Vidal', state: 'Pendiente de acuse', scanned: true },
  { id: 'ret_3', tracking: 'ML-448202', route: 'R-GDLR-2402', unit: 'VA-18', cause: 'No recibido en CEDIS', custody: 'Andén 4', state: 'Diferencia documentada', scanned: false },
  { id: 'ret_4', tracking: 'ML-440037', route: 'R-GDLR-2399', unit: 'VA-12', cause: 'Domicilio incorrecto', custody: 'Mercado Libre', state: 'Devuelto con acuse', scanned: true },
]

export const routeStops = [
  { id: 'st_01', order: 1, recipient: 'M. R*****', zone: 'Providencia', eta: '09:08', state: 'Entregado', proof: 'Foto + firma + GPS' },
  { id: 'st_02', order: 2, recipient: 'L. A*****', zone: 'Ladrón de Guevara', eta: '09:24', state: 'Entregado', proof: 'Foto + escaneo' },
  { id: 'st_03', order: 3, recipient: 'D. C*****', zone: 'Americana', eta: '09:41', state: 'En camino', proof: 'Pendiente' },
  { id: 'st_04', order: 4, recipient: 'S. P*****', zone: 'Centro', eta: '10:03', state: 'Pendiente', proof: 'Pendiente' },
  { id: 'st_05', order: 5, recipient: 'R. V*****', zone: 'Oblatos', eta: '10:28', state: 'Pendiente', proof: 'Pendiente' },
]

export const maintenanceOrders = [
  { id: 'wo_01', unit: 'VA-27', service: 'Cambio de balatas delanteras', currentKm: 88420, dueKm: 88200, dueDate: '30 ago', priority: 'Crítica', state: 'En taller', workshop: 'Servicio Ágil GDL', cost: 4850, downtime: '6 h' },
  { id: 'wo_02', unit: 'VA-21', service: 'Servicio preventivo 90,000 km', currentKm: 89760, dueKm: 90000, dueDate: '2 sep', priority: 'Alta', state: 'Por autorizar', workshop: 'Flotillas Occidente', cost: 3200, downtime: '4 h' },
  { id: 'wo_03', unit: 'VA-18', service: 'Rotación y alineación', currentKm: 71350, dueKm: 72000, dueDate: '6 sep', priority: 'Media', state: 'Programada', workshop: 'Llantas Minerva', cost: 1450, downtime: '2 h' },
  { id: 'wo_04', unit: 'VA-12', service: 'Cambio de aceite y filtros', currentKm: 64810, dueKm: 65000, dueDate: '4 sep', priority: 'Alta', state: 'Programada', workshop: 'Servicio Ágil GDL', cost: 2100, downtime: '3 h' },
  { id: 'wo_05', unit: 'VA-03', service: 'Revisión de suspensión', currentKm: 56040, dueKm: 57500, dueDate: '12 sep', priority: 'Baja', state: 'Monitoreo', workshop: 'Por asignar', cost: 0, downtime: '—' },
]

export const expenses = [
  { id: 'ex_01', date: '30 ago', route: 'R-GDLR-2404', unit: 'VA-21', concept: 'Estacionamiento autorizado', provider: 'Parking Centro', amount: 85, tax: 0, evidence: true, state: 'Por conciliar' },
  { id: 'ex_02', date: '30 ago', route: 'R-GDLR-2405', unit: 'VA-03', concept: 'Peaje', provider: 'Red Vía Corta', amount: 194, tax: 26.76, evidence: true, state: 'Conciliado' },
  { id: 'ex_03', date: '29 ago', route: 'R-GDLR-2399', unit: 'VA-12', concept: 'Reparación de llanta', provider: 'Llantera Móvil', amount: 680, tax: 93.79, evidence: true, state: 'Aprobado' },
  { id: 'ex_04', date: '29 ago', route: 'R-GDLR-2398', unit: 'VA-15', concept: 'Lavado de unidad', provider: 'Autolavado Norte', amount: 160, tax: 22.07, evidence: false, state: 'Falta comprobante' },
]

export const drivers = [
  { id: 'dr_luis', name: 'Luis Cárdenas', unit: 'VA-12', phone: '33 **** 1190', status: 'Activo', score: 94, attendance: 100, delivery: 98.1, training: 'Completa', documents: 'Al día', nextExpiry: 'Licencia · 18 oct' },
  { id: 'dr_maria', name: 'María Soto', unit: 'VA-18', phone: '33 **** 2841', status: 'Activo', score: 97, attendance: 100, delivery: 99.0, training: 'Completa', documents: 'Al día', nextExpiry: 'Seguro social · 4 nov' },
  { id: 'dr_jorge', name: 'Jorge Peña', unit: 'VA-07', phone: '33 **** 9014', status: 'Activo', score: 91, attendance: 96, delivery: 97.4, training: '1 pendiente', documents: 'Al día', nextExpiry: 'Curso seguridad · 7 sep' },
  { id: 'dr_ivan', name: 'Iván Gil', unit: 'VA-21', phone: '33 **** 6204', status: 'En ruta', score: 86, attendance: 100, delivery: 94.2, training: 'Completa', documents: 'Por vencer', nextExpiry: 'Licencia · 3 sep' },
  { id: 'dr_rosa', name: 'Rosa Vidal', unit: 'VA-03', phone: '33 **** 4380', status: 'Cierre', score: 95, attendance: 98, delivery: 98.7, training: 'Completa', documents: 'Al día', nextExpiry: 'Resguardo · 12 dic' },
  { id: 'dr_pablo', name: 'Pablo Neri', unit: 'VA-09', phone: '33 **** 7708', status: 'Descanso', score: 89, attendance: 94, delivery: 96.1, training: '1 pendiente', documents: 'Al día', nextExpiry: 'Curso POD · 9 sep' },
]

export const payrollIncidents = [
  { id: 'pi_01', driver: 'Jorge Peña', date: '29 ago', type: 'Retardo', route: 'R-GDLR-2397', minutes: '22 min', evidence: 'GPS + arribo', impact: '-$85', state: 'Por aprobar' },
  { id: 'pi_02', driver: 'Pablo Neri', date: '28 ago', type: 'Bono de rescate', route: 'R-GDLR-2392', minutes: '—', evidence: 'Bitácora supervisor', impact: '+$180', state: 'Aprobado' },
  { id: 'pi_03', driver: 'Iván Gil', date: '27 ago', type: 'Uso fuera de política', route: 'R-GDLR-2388', minutes: '18 min', evidence: 'GPS + llamada', impact: 'En revisión', state: 'En análisis' },
  { id: 'pi_04', driver: 'Rosa Vidal', date: '26 ago', type: 'Ruta adicional', route: 'R-GDLR-2381', minutes: '—', evidence: 'Asignación excepcional', impact: '+$700', state: 'Aplicado' },
]

export const invoices = [
  { id: 'inv_01', period: '25–31 ago', client: 'RSA Última Milla', routes: 184, base: 11960, extras: 3720, recoveries: 1290, total: 16970, state: 'Pre-factura', due: '2 sep' },
  { id: 'inv_02', period: '18–24 ago', client: 'RSA Última Milla', routes: 176, base: 11440, extras: 3410, recoveries: 820, total: 15670, state: 'Aprobada', due: '30 ago' },
  { id: 'inv_03', period: '11–17 ago', client: 'RSA Última Milla', routes: 171, base: 11115, extras: 3290, recoveries: 0, total: 14405, state: 'Emitida', due: '27 ago' },
  { id: 'inv_04', period: '4–10 ago', client: 'RSA Última Milla', routes: 168, base: 10920, extras: 2980, recoveries: 465, total: 14365, state: 'Cobrada', due: '20 ago' },
]

export const reportCards = [
  { id: 'rp_01', title: 'Cumplimiento operativo', description: 'Salida, terminación, paquetes y SLA por ruta, banda y CEDIS.', updated: 'Hoy · 13:08', accent: '#12b8a6' },
  { id: 'rp_02', title: 'Rentabilidad por unidad', description: 'Ingreso, combustible, gastos, nómina y contribución por camioneta.', updated: 'Hoy · 12:55', accent: '#0e65a5' },
  { id: 'rp_03', title: 'Rendimiento de combustible', description: 'Kilómetros por litro, costo por km, cargas y anomalías.', updated: 'Hoy · 12:50', accent: '#f5a623' },
  { id: 'rp_04', title: 'Custodia y aclaraciones', description: 'Escaneos, devoluciones, POD, descuentos y recuperaciones.', updated: 'Hoy · 12:42', accent: '#7c3aed' },
  { id: 'rp_05', title: 'Salud de flota', description: 'Disponibilidad, mantenimiento próximo y tiempo fuera de servicio.', updated: 'Hoy · 12:30', accent: '#dc2626' },
  { id: 'rp_06', title: 'Talento y desempeño', description: 'Asistencia, efectividad, capacitación e incidencias.', updated: 'Hoy · 11:58', accent: '#0f7a4a' },
]

export const cscClients = [
  { id: 'co_rsa', name: 'RSA Última Milla', plaza: 'Guadalajara', units: 30, routesToday: 26, health: 92, alerts: 3, pending: 7, sla: '98.4%', state: 'Operando' },
  { id: 'co_demo', name: 'Cliente demo Norte', plaza: 'Monterrey', units: 18, routesToday: 15, health: 86, alerts: 4, pending: 5, sla: '96.8%', state: 'Onboarding' },
  { id: 'co_bajio', name: 'Entrega Bajío', plaza: 'León', units: 22, routesToday: 19, health: 95, alerts: 1, pending: 2, sla: '99.1%', state: 'Operando' },
]

export const supportTickets = [
  { id: 'SUP-184', client: 'RSA Última Milla', subject: 'GPS VA-21 con señal intermitente', severity: 'Alta', owner: 'Mesa GPS', opened: 'Hace 38 min', sla: '1 h 22 min', state: 'En atención' },
  { id: 'SUP-179', client: 'Cliente demo Norte', subject: 'Alta de cuatro usuarios de supervisión', severity: 'Media', owner: 'Onboarding', opened: 'Hace 2 h', sla: '5 h 48 min', state: 'En proceso' },
  { id: 'SUP-172', client: 'RSA Última Milla', subject: 'Diferencia en archivo de liquidación', severity: 'Crítica', owner: 'Operaciones CSC', opened: 'Hace 21 min', sla: '39 min', state: 'Escalado' },
  { id: 'SUP-168', client: 'Entrega Bajío', subject: 'Actualización de geocerca CEDIS', severity: 'Baja', owner: 'Configuración', opened: 'Ayer', sla: '12 h', state: 'Programado' },
]

export const auditSeed = [
  { id: 'au_01', at: '30 ago · 13:04', actor: 'Diego Ramírez', action: 'Autorizó combustible', entity: 'R-GDLR-2404', reason: 'Carga sugerida por rendimiento', tenant: 'RSA Última Milla' },
  { id: 'au_02', at: '30 ago · 12:51', actor: 'Bruno Salas', action: 'Resolvió alerta', entity: 'VA-21', reason: 'Conductor regresó a secuencia', tenant: 'RSA Última Milla' },
  { id: 'au_03', at: '30 ago · 12:34', actor: 'Ana Torres', action: 'Concilió carga', entity: 'R-GDLR-2403', reason: '28 de 28 paquetes', tenant: 'RSA Última Milla' },
  { id: 'au_04', at: '30 ago · 11:58', actor: 'Laura Medina', action: 'Envió aclaración', entity: 'ML-771019', reason: 'Expediente completo', tenant: 'RSA Última Milla' },
  { id: 'au_05', at: '30 ago · 11:22', actor: 'Carlos Ruiz', action: 'Preparó corte', entity: 'Corte 30-08', reason: '26 rutas validadas', tenant: 'RSA Última Milla' },
]

export const configSections = [
  { id: 'cfg_scope', title: 'Operación y alcances', status: 'Completo', description: '1 empresa · 1 plaza · 1 CEDIS · 3 bandas de salida · 30 unidades', items: ['Plaza Guadalajara', 'CEDIS Mercado Libre GDL R', 'Turnos 05:30, 06:00 y 07:30'] },
  { id: 'cfg_gps', title: 'GPS y telemetría', status: 'Saludable', description: '30 dispositivos conectados · 29 transmitiendo · 1 degradado', items: ['Proveedor actual integrado', 'SIM administrada por cliente', 'Geocercas casa, CEDIS y ruta'] },
  { id: 'cfg_rules', title: 'Reglas operativas', status: 'Activo', description: 'Ventanas, alertas, combustible y mantenimiento', items: ['Desvío mayor a 500 m', 'Detención mayor a 12 min', 'Servicio preventivo cada 10,000 km'] },
  { id: 'cfg_users', title: 'Usuarios y permisos', status: 'Revisado', description: '7 perfiles · 14 usuarios activos · segregación aplicada', items: ['Acceso por plaza y CEDIS', 'Doble control financiero', 'Auditoría de acciones críticas'] },
  { id: 'cfg_integrations', title: 'Integraciones', status: 'Operando', description: 'API pública, GPS y Odoo preparados por adaptador', items: ['Identidad y sesión', 'Telemetría unificada', 'Facturación y analítica'] },
  { id: 'cfg_notifications', title: 'Notificaciones', status: 'Activo', description: 'WhatsApp, push y correo por criticidad', items: ['Supervisor: alertas críticas', 'Administrador: autorizaciones', 'Gerencia: resumen diario'] },
]

export const weekTrend = [68, 72, 70, 77, 81, 84, 88, 91, 89, 94, 96, 93]
export const bandPerformance = [
  { label: '< 100 km', value: 98, routes: 14, revenue: 1450 },
  { label: '100–120 km', value: 94, routes: 8, revenue: 1840 },
  { label: '121–150 km', value: 91, routes: 4, revenue: 1120 },
]

export function money(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
}

export function toneFor(value: string): DemoTone {
  const normalized = value.toLowerCase()
  if (normalized.includes('crít') || normalized.includes('falta') || normalized.includes('bloque') || normalized.includes('no procedente')) return 'danger'
  if (normalized.includes('pend') || normalized.includes('alta') || normalized.includes('análisis') || normalized.includes('revisión') || normalized.includes('degrad')) return 'warn'
  if (normalized.includes('activo') || normalized.includes('operando') || normalized.includes('complet') || normalized.includes('concili') || normalized.includes('aprob') || normalized.includes('cobrad') || normalized.includes('a favor') || normalized.includes('saludable')) return 'ok'
  if (normalized.includes('ruta') || normalized.includes('proceso') || normalized.includes('atención') || normalized.includes('enviado') || normalized.includes('emitida')) return 'info'
  return 'neutral'
}
