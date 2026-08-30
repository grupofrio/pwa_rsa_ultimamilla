export const PACKAGE_STATES = [
  'expected',
  'received_cedis',
  'loaded',
  'in_transit',
  'delivered',
  'rejected',
  'undeliverable',
  'pending_return',
  'returned_to_ml',
  'in_dispute',
] as const

export type PackageState = (typeof PACKAGE_STATES)[number]

export const PACKAGE_STATE_LABELS: Record<PackageState, string> = {
  expected: 'Esperado',
  received_cedis: 'Recibido en CEDIS',
  loaded: 'Cargado en unidad',
  in_transit: 'En reparto',
  delivered: 'Entregado',
  rejected: 'Rechazado',
  undeliverable: 'No entregable',
  pending_return: 'Pendiente de devolución',
  returned_to_ml: 'Devuelto a Mercado Libre',
  in_dispute: 'En disputa / aclaración',
}

export const ROUTE_STATES = [
  'scheduled',
  'assigned',
  'arrived_cedis',
  'loading',
  'load_reconciled',
  'exit_authorized',
  'in_route',
  'completed_returns_pending',
  'returns_closed',
  'closed_operationally',
  'liquidatable',
  'settled',
  'cancelled',
  'reversed',
] as const

export type RouteState = (typeof ROUTE_STATES)[number]

export const ROUTE_STATE_LABELS: Record<RouteState, string> = {
  scheduled: 'Programada',
  assigned: 'Asignada',
  arrived_cedis: 'Arribó a CEDIS',
  loading: 'En carga',
  load_reconciled: 'Carga conciliada',
  exit_authorized: 'Salida autorizada por Mercado Libre',
  in_route: 'En ruta',
  completed_returns_pending: 'Completada con devoluciones pendientes',
  returns_closed: 'Devoluciones cerradas',
  closed_operationally: 'Cerrada operativamente',
  liquidatable: 'Liquidable (fuente oficial)',
  settled: 'Liquidada',
  cancelled: 'Cancelada',
  reversed: 'Revertida',
}

export const JOURNEY_LEGS = [
  'home_to_cedis',
  'cedis_dwell',
  'official_delivery',
  'last_to_home',
  'off_policy',
] as const

export type JourneyLeg = (typeof JOURNEY_LEGS)[number]

export const JOURNEY_LEG_LABELS: Record<JourneyLeg, string> = {
  home_to_cedis: 'Domicilio → CEDIS (ventana autorizada)',
  cedis_dwell: 'Espera, carga y autorización en CEDIS',
  official_delivery: 'Ruta oficial de entregas',
  last_to_home: 'Última entrega → domicilio (ventana autorizada)',
  off_policy: 'Uso fuera de horario o geografía autorizada',
}

/**
 * Campo TENTATIVO de UI. No es contrato oficial hasta que Sebastián lo confirme.
 * El frontend no usa este valor para decidir elegibilidad de cobro.
 */
export const ML_LIQUIDATION_STATES = [
  'pending',
  'confirmed',
  'rejected',
  'not_applicable',
] as const

export type MlLiquidationState = (typeof ML_LIQUIDATION_STATES)[number]

export const ML_LIQUIDATION_LABELS: Record<MlLiquidationState, string> = {
  pending: 'Pendiente de confirmación oficial (campo tentativo)',
  confirmed: 'Confirmada por fuente oficial (campo tentativo)',
  rejected: 'Rechazada por fuente oficial (campo tentativo)',
  not_applicable: 'No aplica (campo tentativo)',
}

/** Elegibilidad de cobro: solo el estado de ruta que declara el backend. */
export function isOfficiallyLiquidatable(state: RouteState): boolean {
  return state === 'liquidatable' || state === 'settled'
}

export const DATA_QUALITY = ['ok', 'stale', 'degraded', 'missing'] as const
export type DataQuality = (typeof DATA_QUALITY)[number]

export const DATA_QUALITY_LABELS: Record<DataQuality, string> = {
  ok: 'Fresco',
  stale: 'Desactualizado',
  degraded: 'Calidad reducida',
  missing: 'Sin dato',
}

export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number]
