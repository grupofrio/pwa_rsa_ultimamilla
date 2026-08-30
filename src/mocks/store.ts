import { capabilitiesFor, type Profile } from '@/auth/capabilities'
import type { OperatingScope, SessionUser } from '@/auth/types'
import type {
  AlertRecord,
  CommercialSnapshot,
  CopilotRecommendation,
  CustodyEvent,
  DistanceBreakdown,
  FuelSuggestion,
  ManagementKpis,
  PackageDetail,
  RouteDetail,
  SettlementRecord,
  VehicleRecord,
} from '@/services/api/types'
import type { MlLiquidationState, PackageState, RouteState } from '@/entities/states'

export const MOCK_SENTINEL = 'VIA_AGIL_MOCK_SENTINEL'

const TZ = 'America/Mexico_City'

function isoMinutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString()
}

function isoHoursAhead(hours: number): string {
  return new Date(Date.now() + hours * 3600_000).toISOString()
}

const SCOPE_RSA: OperatingScope = {
  id: 'scope_rsa_gdlr_am',
  companyId: 'co_rsa',
  companyName: 'RSA',
  plazaId: 'pl_gdlr',
  plazaName: 'GDL R',
  cedisId: 'cd_gdl_ml',
  cedisName: 'CEDIS Mercado Libre GDL',
  shiftId: 'sh_am',
  shiftName: 'Ventana AM',
  fleetId: 'fl_gdlr_30',
  fleetName: 'Flota GDL R',
  timezone: TZ,
  currency: 'MXN',
}

const SCOPE_DEMO: OperatingScope = {
  ...SCOPE_RSA,
  id: 'scope_demo_norte',
  companyId: 'co_demo',
  companyName: 'Cliente demo Norte',
  plazaId: 'pl_mty',
  plazaName: 'MTY A',
  cedisId: 'cd_mty',
  cedisName: 'CEDIS Norte',
}

function user(id: string, email: string, displayName: string, profile: Profile, scopes = [SCOPE_RSA]): SessionUser {
  return {
    id,
    email,
    displayName,
    profile,
    capabilities: capabilitiesFor(profile),
    allowedScopes: scopes,
    activeScope: scopes[0],
    tenantBanner: null,
  }
}

export const DEMO_USERS: SessionUser[] = [
  user('usr_ana', 'ana.despacho@viaagil.example', 'Ana López', 'dispatcher'),
  user('usr_bruno', 'bruno.supervisor@viaagil.example', 'Bruno Méndez', 'supervisor'),
  user('usr_carla', 'carla.flota@viaagil.example', 'Carla Ruiz', 'fleet_coordinator'),
  user('usr_diego', 'diego.admin@viaagil.example', 'Diego Navarro', 'admin_finance'),
  user('usr_elena', 'elena.gerencia@viaagil.example', 'Elena Prado', 'manager'),
  user('usr_fabio', 'fabio.csc@viaagil.example', 'Fabio Ortega', 'csc_operator', [SCOPE_RSA, SCOPE_DEMO]),
  user('usr_gina', 'gina.plataforma@viaagil.example', 'Gina Herrera', 'platform_admin', [SCOPE_RSA, SCOPE_DEMO]),
]

const provenance = (source: string, minutesAgo: number, confidence: 'high' | 'medium' | 'low' = 'high') => ({
  source,
  quality: minutesAgo > 2 ? ('stale' as const) : ('ok' as const),
  updatedAt: isoMinutesAgo(minutesAgo),
  confidence,
})

function money(amount: number, kind: 'official' | 'estimate' | 'demo' = 'official') {
  return { amount, currency: 'MXN' as const, kind }
}

function distance(official: number | null, actual: number | null, pos: number | null, off: number | null, minutes = 1): DistanceBreakdown {
  return {
    officialRouteKm: official,
    actualRouteKm: actual,
    positioningKm: pos,
    offPolicyKm: off,
    provenance: provenance('Telemetría unificada (backend)', minutes, actual === null ? 'low' : 'medium'),
  }
}

const gdl: [number, number][] = [
  [20.6736, -103.344],
  [20.682, -103.351],
  [20.691, -103.36],
  [20.704, -103.349],
]

export interface MutableStore {
  users: SessionUser[]
  currentUserId: string | null
  expired: boolean
  online: boolean
  routes: RouteDetail[]
  packages: PackageDetail[]
  vehicles: VehicleRecord[]
  alerts: AlertRecord[]
  settlements: SettlementRecord[]
  kpis: ManagementKpis
  copilot: CopilotRecommendation[]
  audit: { id: string; at: string; actor: string; action: string; entity: string; reason: string | null }[]
  fuelAuths: { id: string; routeId: string; amount: ReturnType<typeof money>; liters: number; station: string; reason: string; status: 'draft' | 'authorized' }[]
}

function commercial(band: string, expected: number, recognized: number | null, cost: number, discounts = 0): CommercialSnapshot {
  const rec = recognized === null ? null : money(recognized, 'official')
  const contributionKind = rec ? 'official' : 'estimate'
  return {
    tariffBandLabel: band,
    expectedRevenue: money(expected, rec ? 'official' : 'estimate'),
    recognizedRevenue: rec,
    viaAgilCost: money(cost, 'official'),
    contribution: money((recognized ?? expected) - cost - discounts, contributionKind),
    discounts: money(discounts, 'official'),
    note: rec
      ? 'Valores oficiales entregados por backend a partir de la fuente configurada de Mercado Libre.'
      : 'Ingreso aún no reconocido. El diferencial mostrado es una estimación y no un P&L oficial.',
  }
}

function fuel(routeId: string, planned: number, actual: number | null, yieldKm: number, amount: number, liters: number, conf: 'high' | 'medium' | 'low'): FuelSuggestion {
  return {
    routeId,
    plannedKm: planned,
    actualKm: actual,
    historicalYieldKmPerL: yieldKm,
    suggestedLiters: liters,
    suggestedAmount: money(amount, 'estimate'),
    confidence: conf,
    explanation: [
      `Ventana y kilometraje previsto: ${planned} km`,
      actual === null ? 'Kilometraje real aún no consolidado' : `Kilometraje real observado: ${actual} km`,
      `Rendimiento histórico confiable: ${yieldKm} km/L`,
      'El monto sugerido no es una autorización. Requiere capacidad fuel.authorize.',
    ],
    evidenceIds: ['ev_yield_90d', 'ev_window_ml'],
  }
}

function event(id: string, minutes: number, actor: string, source: string, location: string, description: string): CustodyEvent {
  return {
    id,
    at: isoMinutesAgo(minutes),
    actor,
    source,
    locationLabel: location,
    description,
    evidenceId: null,
  }
}

function pkg(
  id: string,
  tracking: string,
  state: PackageState,
  routeId: string,
  claimed = false,
): PackageDetail {
  const custody: CustodyEvent[] = [
    event(`${id}_e1`, 180, 'Sistema', 'Mercado Libre', 'Manifiesto', 'Paquete esperado en manifiesto del día'),
  ]
  if (state !== 'expected') {
    custody.push(event(`${id}_e2`, 90, 'Ana López', 'Escaneo CEDIS', 'CEDIS GDL', 'Recibido en CEDIS'))
  }
  if (['loaded', 'in_transit', 'delivered', 'rejected', 'undeliverable', 'pending_return', 'returned_to_ml', 'in_dispute'].includes(state)) {
    custody.push(event(`${id}_e3`, 70, 'Ana López', 'Escaneo unidad', 'Andén 2', 'Cargado en unidad'))
  }
  if (['delivered', 'rejected', 'undeliverable', 'pending_return', 'returned_to_ml', 'in_dispute'].includes(state)) {
    custody.push(event(`${id}_e4`, 20, 'Conductor', 'POD', 'Punto de entrega', state === 'delivered' ? 'Entregado con evidencia' : 'Cierre de intento de entrega'))
  }
  return {
    id,
    tracking,
    state,
    routeId,
    recipientMasked: 'Destinatario ···· 4821',
    lastEventAt: custody[custody.length - 1].at,
    claimedMissing: claimed,
    custody,
    evidence:
      state === 'delivered' || claimed
        ? [
            {
              id: `${id}_pod`,
              kind: 'photo',
              capturedAt: isoMinutesAgo(20),
              source: 'POD conductor',
              signedUrlExpiresAt: isoHoursAhead(1),
              redacted: true,
            },
          ]
        : [],
  }
}

function route(partial: {
  id: string
  folio: string
  state: RouteState
  ml: MlLiquidationState
  window: string
  driver: string
  driverId: string
  vehicle: string
  vehicleId: string
  plate: string
  expected: number
  received: number
  loaded: number
  delivered: number
  pendingReturn: number
  blocked: string[]
  leg: RouteDetail['journeyLeg']
  officialKm: number | null
  actualKm: number | null
  posKm: number | null
  offKm: number | null
  gpsMin: number
  arrival?: string | null
  mlExit?: string | null
  band: string
  expectedRev: number
  recognized: number | null
  cost: number
}): RouteDetail {
  const hasDiff = partial.expected !== partial.received || partial.received !== partial.loaded
  return {
    id: partial.id,
    folio: partial.folio,
    state: partial.state,
    mlLiquidationState: partial.ml,
    windowLabel: partial.window,
    requestedArrivalAt: isoMinutesAgo(120),
    actualArrivalAt: partial.arrival === undefined ? isoMinutesAgo(95) : partial.arrival,
    mlExitAuthorizedAt: partial.mlExit === undefined ? null : partial.mlExit,
    driver: { id: partial.driverId, name: partial.driver, phoneMasked: '33 **** 1190' },
    vehicle: {
      id: partial.vehicleId,
      code: partial.vehicle,
      plate: partial.plate,
      gpsQuality: partial.gpsMin > 5 ? 'stale' : 'ok',
    },
    cedisName: 'CEDIS Mercado Libre GDL',
    packagesExpected: partial.expected,
    packagesReceived: partial.received,
    packagesLoaded: partial.loaded,
    packagesDelivered: partial.delivered,
    packagesPendingReturn: partial.pendingReturn,
    hasLoadDifference: hasDiff,
    blockedReasons: partial.blocked,
    distance: distance(partial.officialKm, partial.actualKm, partial.posKm, partial.offKm, partial.gpsMin),
    journeyLeg: partial.leg,
    provenance: provenance('Operación + Mercado Libre', partial.gpsMin),
    version: 1,
    plannedPath: gdl,
    actualPath: gdl.slice(0, 3),
    events: [event(`${partial.id}_plan`, 200, 'Despacho', 'PWA', 'CEDIS GDL', 'Ruta programada en ventana AM')],
    fuelSuggestion: fuel(partial.id, partial.officialKm ?? 110, partial.actualKm, 8.4, 420, 50, 'medium'),
    commercial: commercial(partial.band, partial.expectedRev, partial.recognized, partial.cost),
  }
}

export function createInitialStore(): MutableStore {
  const routes: RouteDetail[] = [
    route({
      id: 'rt_2401',
      folio: 'R-GDLR-2401',
      state: 'assigned',
      ml: 'pending',
      window: 'Ventana 06:00',
      driver: 'Luis Cárdenas',
      driverId: 'dr_luis',
      vehicle: 'VA-12',
      vehicleId: 'vh_12',
      plate: 'JDF-4512',
      expected: 36,
      received: 0,
      loaded: 0,
      delivered: 0,
      pendingReturn: 0,
      blocked: [],
      leg: 'home_to_cedis',
      officialKm: 98,
      actualKm: null,
      posKm: 18,
      offKm: 0,
      gpsMin: 1,
      arrival: null,
      band: '0 ≤ km < 100',
      expectedRev: 0,
      recognized: null,
      cost: 60,
    }),
    route({
      id: 'rt_2402',
      folio: 'R-GDLR-2402',
      state: 'loading',
      ml: 'pending',
      window: 'Ventana 06:00',
      driver: 'María Soto',
      driverId: 'dr_maria',
      vehicle: 'VA-18',
      vehicleId: 'vh_18',
      plate: 'JDF-4418',
      expected: 42,
      received: 40,
      loaded: 40,
      delivered: 0,
      pendingReturn: 0,
      blocked: ['Diferencia de paquetes en CEDIS (faltantes: 2)'],
      leg: 'cedis_dwell',
      officialKm: 110,
      actualKm: null,
      posKm: 16,
      offKm: 0,
      gpsMin: 1,
      band: '100 ≤ km ≤ 120',
      expectedRev: 0,
      recognized: null,
      cost: 65,
    }),
    route({
      id: 'rt_2403',
      folio: 'R-GDLR-2403',
      state: 'load_reconciled',
      ml: 'pending',
      window: 'Ventana 07:30',
      driver: 'Jorge Peña',
      driverId: 'dr_jorge',
      vehicle: 'VA-07',
      vehicleId: 'vh_07',
      plate: 'JDF-4307',
      expected: 28,
      received: 28,
      loaded: 28,
      delivered: 0,
      pendingReturn: 0,
      blocked: ['Falta autorización de salida de Mercado Libre'],
      leg: 'cedis_dwell',
      officialKm: 140,
      actualKm: null,
      posKm: 21,
      offKm: 0,
      gpsMin: 2,
      band: '120 < km ≤ 150',
      expectedRev: 0,
      recognized: null,
      cost: 70,
    }),
    route({
      id: 'rt_2404',
      folio: 'R-GDLR-2404',
      state: 'in_route',
      ml: 'pending',
      window: 'Ventana 06:00',
      driver: 'Iván Gil',
      driverId: 'dr_ivan',
      vehicle: 'VA-21',
      vehicleId: 'vh_21',
      plate: 'JDF-4521',
      expected: 33,
      received: 33,
      loaded: 33,
      delivered: 11,
      pendingReturn: 0,
      blocked: [],
      leg: 'official_delivery',
      officialKm: 118,
      actualKm: 96,
      posKm: 19,
      offKm: 4,
      gpsMin: 18,
      mlExit: isoMinutesAgo(80),
      band: '100 ≤ km ≤ 120',
      expectedRev: 0,
      recognized: null,
      cost: 65,
    }),
    route({
      id: 'rt_2405',
      folio: 'R-GDLR-2405',
      state: 'completed_returns_pending',
      ml: 'pending',
      window: 'Ventana 05:30',
      driver: 'Rosa Vidal',
      driverId: 'dr_rosa',
      vehicle: 'VA-03',
      vehicleId: 'vh_03',
      plate: 'JDF-4303',
      expected: 30,
      received: 30,
      loaded: 30,
      delivered: 27,
      pendingReturn: 3,
      blocked: [],
      leg: 'last_to_home',
      officialKm: 99,
      actualKm: 102,
      posKm: 14,
      offKm: 0,
      gpsMin: 3,
      mlExit: isoMinutesAgo(300),
      band: '0 ≤ km < 100',
      expectedRev: 0,
      recognized: null,
      cost: 60,
    }),
    route({
      id: 'rt_2406',
      folio: 'R-GDLR-2406',
      state: 'closed_operationally',
      ml: 'pending',
      window: 'Ventana 05:30',
      driver: 'Pablo Neri',
      driverId: 'dr_pablo',
      vehicle: 'VA-09',
      vehicleId: 'vh_09',
      plate: 'JDF-4309',
      expected: 25,
      received: 25,
      loaded: 25,
      delivered: 25,
      pendingReturn: 0,
      blocked: ['Completada operativamente, aún no liquidable'],
      leg: 'last_to_home',
      officialKm: 110,
      actualKm: 112,
      posKm: 17,
      offKm: 0,
      gpsMin: 8,
      mlExit: isoMinutesAgo(400),
      band: '100 ≤ km ≤ 120',
      expectedRev: 1800,
      recognized: null,
      cost: 65,
    }),
    route({
      id: 'rt_2407',
      folio: 'R-GDLR-2407',
      state: 'liquidatable',
      ml: 'confirmed',
      window: 'Ventana 05:30',
      driver: 'Sofía Lara',
      driverId: 'dr_sofia',
      vehicle: 'VA-15',
      vehicleId: 'vh_15',
      plate: 'JDF-4515',
      expected: 31,
      received: 31,
      loaded: 31,
      delivered: 31,
      pendingReturn: 0,
      blocked: [],
      leg: 'last_to_home',
      officialKm: 99,
      actualKm: 101,
      posKm: 15,
      offKm: 0,
      gpsMin: 40,
      mlExit: isoMinutesAgo(500),
      band: '0 ≤ km < 100',
      expectedRev: 1750,
      recognized: 1750,
      cost: 60,
    }),
    route({
      id: 'rt_2408',
      folio: 'R-GDLR-2408',
      state: 'scheduled',
      ml: 'not_applicable',
      window: 'Ventana 07:30',
      driver: 'Sin asignar',
      driverId: 'dr_none',
      vehicle: 'VA-27',
      vehicleId: 'vh_27',
      plate: 'JDF-4527',
      expected: 22,
      received: 0,
      loaded: 0,
      delivered: 0,
      pendingReturn: 0,
      blocked: ['Unidad bloqueada por mantenimiento'],
      leg: 'home_to_cedis',
      officialKm: 95,
      actualKm: null,
      posKm: null,
      offKm: null,
      gpsMin: 90,
      arrival: null,
      band: '0 ≤ km < 100',
      expectedRev: 0,
      recognized: null,
      cost: 60,
    }),
  ]

  const packages: PackageDetail[] = [
    pkg('pk_2402_a', 'ML-448201', 'loaded', 'rt_2402'),
    pkg('pk_2402_b', 'ML-448202', 'expected', 'rt_2402'),
    pkg('pk_2402_c', 'ML-448203', 'expected', 'rt_2402'),
    pkg('pk_2404_a', 'ML-551001', 'in_transit', 'rt_2404'),
    pkg('pk_2404_b', 'ML-551002', 'delivered', 'rt_2404', true),
    pkg('pk_2405_a', 'ML-660111', 'pending_return', 'rt_2405'),
    pkg('pk_2405_b', 'ML-660112', 'rejected', 'rt_2405'),
    pkg('pk_2406_a', 'ML-770001', 'delivered', 'rt_2406'),
    pkg('pk_2407_a', 'ML-880001', 'delivered', 'rt_2407'),
  ]

  const vehicles: VehicleRecord[] = [
    {
      id: 'vh_12',
      code: 'VA-12',
      plate: 'JDF-4512',
      status: 'in_route',
      habitualDriverName: 'Luis Cárdenas',
      odometerKm: 84210,
      odometerSource: 'GPS unificado',
      gps: { providerAgnostic: true, lastMessageAt: isoMinutesAgo(1), quality: 'ok', simStatus: 'active' },
      nextService: { dueAt: isoHoursAhead(24 * 12), dueKm: 85000, reason: 'Preventivo por kilometraje' },
      documents: { insurance: 'Vigente', permit: 'Vigente' },
    },
    {
      id: 'vh_18',
      code: 'VA-18',
      plate: 'JDF-4418',
      status: 'in_route',
      habitualDriverName: 'María Soto',
      odometerKm: 61002,
      odometerSource: 'GPS unificado',
      gps: { providerAgnostic: true, lastMessageAt: isoMinutesAgo(1), quality: 'ok', simStatus: 'active' },
      nextService: { dueAt: isoHoursAhead(24 * 4), dueKm: 62000, reason: 'Frenos / balatas' },
      documents: { insurance: 'Vigente', permit: 'Vigente' },
    },
    {
      id: 'vh_21',
      code: 'VA-21',
      plate: 'JDF-4521',
      status: 'in_route',
      habitualDriverName: 'Iván Gil',
      odometerKm: 90331,
      odometerSource: 'GPS unificado',
      gps: { providerAgnostic: true, lastMessageAt: isoMinutesAgo(18), quality: 'stale', simStatus: 'active' },
      nextService: { dueAt: isoHoursAhead(24 * 2), dueKm: 91000, reason: 'Servicio 90 mil km' },
      documents: { insurance: 'Vigente', permit: 'Por vencer' },
    },
    {
      id: 'vh_27',
      code: 'VA-27',
      plate: 'JDF-4527',
      status: 'maintenance_block',
      habitualDriverName: 'Por reasignar',
      odometerKm: 112440,
      odometerSource: 'Orden de taller',
      gps: { providerAgnostic: true, lastMessageAt: isoMinutesAgo(90), quality: 'stale', simStatus: 'unknown' },
      nextService: { dueAt: isoMinutesAgo(-1), dueKm: 112440, reason: 'Fuera de servicio — suspensión' },
      documents: { insurance: 'Vigente', permit: 'Vigente' },
    },
  ]

  const alerts: AlertRecord[] = [
    {
      id: 'al_dev_2404',
      routeId: 'rt_2404',
      type: 'route_deviation',
      severity: 'critical',
      title: 'Desvío respecto a la ruta oficial',
      slaDueAt: isoHoursAhead(0.5),
      ownerName: null,
      state: 'open',
      createdAt: isoMinutesAgo(16),
    },
    {
      id: 'al_gps_2404',
      routeId: 'rt_2404',
      type: 'gps_stale',
      severity: 'warning',
      title: 'GPS sin señal reciente',
      slaDueAt: isoHoursAhead(1),
      ownerName: 'Bruno Méndez',
      state: 'in_progress',
      createdAt: isoMinutesAgo(18),
    },
    {
      id: 'al_late_2402',
      routeId: 'rt_2402',
      type: 'late_departure',
      severity: 'warning',
      title: 'Salida atrasada por diferencia de carga',
      slaDueAt: isoHoursAhead(0.25),
      ownerName: 'Ana López',
      state: 'open',
      createdAt: isoMinutesAgo(25),
    },
  ]

  return {
    users: structuredClone(DEMO_USERS),
    currentUserId: null,
    expired: false,
    online: true,
    routes,
    packages,
    vehicles,
    alerts,
    settlements: [
      {
        id: 'st_2026_08_29',
        periodLabel: '29 ago 2026 · GDL R',
        state: 'ready_for_review',
        routesCount: 8,
        liquidatableCount: 1,
        officialTotal: money(1750, 'official'),
        estimateTotal: money(3550, 'estimate'),
      },
    ],
    kpis: {
      unitsDue: 8,
      unitsDeparted: 4,
      unitsFinished: 3,
      routesAtRisk: 2,
      openPackages: 5,
      expectedCollect: money(3550, 'estimate'),
      confirmedCollect: money(1750, 'official'),
      contribution: money(1685, 'estimate'),
      lossDrivers: [
        { label: 'Combustible fuera de rango', amount: money(180, 'estimate') },
        { label: 'Kilómetros fuera de política', amount: money(90, 'estimate') },
        { label: 'Unidad en mantenimiento', amount: money(0, 'estimate') },
      ],
      provenance: provenance('Tablero gerencial (backend)', 6, 'medium'),
    },
    copilot: [
      {
        id: 'cp_1',
        title: 'Priorizar conciliación de R-GDLR-2402',
        body: 'Hay 2 paquetes esperados no recibidos. La salida no debe confirmarse hasta resolver la diferencia y registrar la autorización de Mercado Libre.',
        period: 'Hoy, ventana 06:00, GDL R',
        confidence: 'high',
        cited: ['Manifiesto ML', 'Escaneos CEDIS', 'Estado de ruta loading'],
        suggestedAction: 'Abrir conciliación de carga y contactar al andén',
        requiresApproval: false,
      },
      {
        id: 'cp_2',
        title: 'No forzar liquidación de R-GDLR-2406',
        body: 'La ruta está cerrada operativamente pero ml_liquidation_state sigue pendiente. El cobro de Vía Ágil no aplica todavía.',
        period: 'Corte 29 ago 2026',
        confidence: 'high',
        cited: ['Estado de ruta', 'Fuente oficial Mercado Libre'],
        suggestedAction: 'Esperar confirmación oficial o abrir aclaración',
        requiresApproval: true,
      },
    ],
    audit: [],
    fuelAuths: [],
  }
}
