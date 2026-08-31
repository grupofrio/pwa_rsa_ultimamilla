import type { SessionUser } from '@/auth/types'
import type { Capability } from '@/auth/capabilities'
import type {
  AlertSeverity,
  DataQuality,
  JourneyLeg,
  MlLiquidationState,
  PackageState,
  RouteState,
} from '@/entities/states'

export interface DataProvenance {
  source: string
  quality: DataQuality
  updatedAt: string
  confidence: 'high' | 'medium' | 'low'
}

export interface Money {
  amount: number
  currency: 'MXN'
  kind: 'official' | 'estimate' | 'demo'
}

export interface DistanceBreakdown {
  officialRouteKm: number | null
  actualRouteKm: number | null
  positioningKm: number | null
  offPolicyKm: number | null
  provenance: DataProvenance
}

export interface DriverRef {
  id: string
  name: string
  phoneMasked: string
}

export interface VehicleRef {
  id: string
  code: string
  plate: string
  gpsQuality: DataQuality
}

export interface RouteSummary {
  id: string
  folio: string
  state: RouteState
  mlLiquidationState: MlLiquidationState
  windowLabel: string
  requestedArrivalAt: string
  actualArrivalAt: string | null
  mlExitAuthorizedAt: string | null
  driver: DriverRef
  vehicle: VehicleRef
  cedisName: string
  packagesExpected: number
  packagesReceived: number
  packagesLoaded: number
  packagesDelivered: number
  packagesPendingReturn: number
  hasLoadDifference: boolean
  blockedReasons: string[]
  distance: DistanceBreakdown
  journeyLeg: JourneyLeg
  provenance: DataProvenance
  fuelEstimate: {
    liters: number | null
    amount: Money | null
  } | null
}

export interface RouteDetail extends RouteSummary {
  version: number
  plannedPath: [number, number][]
  actualPath: [number, number][]
  events: CustodyEvent[]
  fuelSuggestion: FuelSuggestion | null
  commercial: CommercialSnapshot
}

export interface CommercialSnapshot {
  tariffBandLabel: string
  expectedRevenue: Money
  recognizedRevenue: Money | null
  viaAgilCost: Money
  contribution: Money
  discounts: Money
  note: string
}

export interface PackageRecord {
  id: string
  tracking: string
  state: PackageState
  routeId: string
  recipientMasked: string
  lastEventAt: string
  claimedMissing: boolean
}

export interface CustodyEvent {
  id: string
  at: string
  actor: string
  source: string
  locationLabel: string
  description: string
  evidenceId: string | null
}

export interface PackageDetail extends PackageRecord {
  custody: CustodyEvent[]
  evidence: EvidenceItem[]
}

export interface EvidenceItem {
  id: string
  kind: 'photo' | 'scan' | 'signature' | 'acuse'
  capturedAt: string
  source: string
  signedUrlExpiresAt: string
  redacted: boolean
}

export interface VehicleRecord {
  id: string
  code: string
  plate: string
  status: 'available' | 'in_route' | 'maintenance_block' | 'unsafe_block'
  habitualDriverName: string
  odometerKm: number
  odometerSource: string
  gps: {
    providerAgnostic: true
    lastMessageAt: string
    quality: DataQuality
    simStatus: 'active' | 'inactive' | 'unknown'
  }
  nextService: { dueAt: string | null; dueKm: number | null; reason: string }
  documents: { insurance: string; permit: string }
}

export interface AlertRecord {
  id: string
  routeId: string
  type: string
  severity: AlertSeverity
  title: string
  slaDueAt: string
  ownerName: string | null
  state: 'open' | 'in_progress' | 'resolved'
  createdAt: string
}

export interface FuelSuggestion {
  routeId: string
  plannedKm: number
  actualKm: number | null
  historicalYieldKmPerL: number | null
  suggestedLiters: number | null
  suggestedAmount: Money
  confidence: 'high' | 'medium' | 'low'
  explanation: string[]
  evidenceIds: string[]
}

export interface FuelAuthorization {
  id: string
  routeId: string
  amount: Money
  liters: number
  station: string
  reason: string
  status: 'draft' | 'authorized'
}

export interface SettlementRecord {
  id: string
  periodLabel: string
  state: 'draft' | 'ready_for_review' | 'approved' | 'error' | 'reversed'
  routesCount: number
  liquidatableCount: number
  officialTotal: Money
  estimateTotal: Money
}

export interface ManagementKpis {
  unitsDue: number
  unitsDeparted: number
  unitsFinished: number
  routesAtRisk: number
  openPackages: number
  expectedCollect: Money
  confirmedCollect: Money
  contribution: Money
  lossDrivers: { label: string; amount: Money }[]
  provenance: DataProvenance
}

export interface CopilotRecommendation {
  id: string
  title: string
  body: string
  period: string
  confidence: 'high' | 'medium' | 'low'
  cited: string[]
  suggestedAction: string
  requiresApproval: boolean
}

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  entity: string
  reason: string | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface CommandMeta {
  idempotencyKey: string
  reason?: string
  capability: Capability
}

export interface ApiClient {
  readonly kind: 'mock' | 'http'
  getSession(): Promise<SessionUser | null>
  login(email: string): Promise<SessionUser>
  logout(): Promise<void>
  switchScope(scopeId: string): Promise<SessionUser>
  switchTenant(input: { tenantId: string } & CommandMeta): Promise<SessionUser>
  listRoutes(): Promise<Paginated<RouteSummary>>
  getRoute(id: string): Promise<RouteDetail>
  assignRoute(input: { routeId: string; driverId: string; vehicleId: string; reason?: string } & CommandMeta): Promise<RouteSummary>
  confirmArrival(input: { routeId: string } & CommandMeta): Promise<RouteSummary>
  reconcileLoad(input: { routeId: string } & CommandMeta): Promise<RouteSummary>
  registerMlExitAuthorization(input: { routeId: string; authorizedAt: string } & CommandMeta): Promise<RouteSummary>
  confirmExit(input: { routeId: string } & CommandMeta): Promise<RouteSummary>
  listPackages(routeId?: string): Promise<Paginated<PackageRecord>>
  getPackage(id: string): Promise<PackageDetail>
  listVehicles(): Promise<Paginated<VehicleRecord>>
  getVehicle(id: string): Promise<VehicleRecord>
  listAlerts(): Promise<Paginated<AlertRecord>>
  contactDriver(input: { alertId: string; note: string } & CommandMeta): Promise<AlertRecord>
  resolveAlert(input: { alertId: string; reason: string } & CommandMeta): Promise<AlertRecord>
  authorizeFuel(input: { routeId: string; amount: number; liters: number; station: string; reason: string } & CommandMeta): Promise<FuelAuthorization>
  listSettlements(): Promise<Paginated<SettlementRecord>>
  getManagementKpis(): Promise<ManagementKpis>
  listCopilot(): Promise<CopilotRecommendation[]>
  listAudit(): Promise<Paginated<AuditEntry>>
  expireSession(): Promise<void>
  setNetwork(online: boolean): Promise<void>
  getNetwork(): { online: boolean; stale: boolean }
  applyDevScenario(name: 'resolve_load_difference', payload?: { routeId: string }): Promise<void>
}
