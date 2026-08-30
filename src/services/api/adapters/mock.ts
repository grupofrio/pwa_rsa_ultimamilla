import { can } from '@/auth/can'
import type { Capability } from '@/auth/capabilities'
import type { SessionUser } from '@/auth/types'
import { createInitialStore, MOCK_SENTINEL, type MutableStore } from '@/mocks/store'
import { ApiError } from '@/services/api/errors'
import type {
  AlertRecord,
  ApiClient,
  CommandMeta,
  FuelAuthorization,
  PackageDetail,
  Paginated,
  RouteDetail,
  RouteSummary,
  VehicleRecord,
} from '@/services/api/types'

function cid(): string {
  return `cid_mock_${Math.random().toString(36).slice(2, 10)}`
}

function deny(correlationId: string, message = 'No autorizado para esta acción'): never {
  throw new ApiError({ message, code: 'forbidden', status: 403, correlationId })
}

function expired(correlationId: string): never {
  throw new ApiError({
    message: 'La sesión expiró. Vuelve a autenticarte.',
    code: 'session_expired',
    status: 401,
    correlationId,
  })
}

function offline(correlationId: string): never {
  throw new ApiError({
    message: 'Sin conexión. Las acciones críticas están bloqueadas.',
    code: 'offline',
    status: 503,
    correlationId,
    retryable: true,
  })
}

function page<T>(items: T[]): Paginated<T> {
  return { items, total: items.length, page: 1, pageSize: items.length || 25 }
}

export class MockApiAdapter implements ApiClient {
  readonly kind = 'mock' as const
  readonly sentinel = MOCK_SENTINEL
  private store: MutableStore = createInitialStore()

  reset(): void {
    this.store = createInitialStore()
  }

  private requireUser(capability?: Capability): { user: SessionUser; correlationId: string } {
    const correlationId = cid()
    if (!this.store.online && capability && capability !== 'session.view') offline(correlationId)
    if (this.store.expired) expired(correlationId)
    const user = this.store.users.find((item) => item.id === this.store.currentUserId)
    if (!user) expired(correlationId)
    if (capability && !can(user.capabilities, capability)) deny(correlationId)
    return { user, correlationId }
  }

  private requireCommand(meta: CommandMeta, capability: Capability): SessionUser {
    const { user } = this.requireUser(capability)
    if (meta.capability !== capability) deny(cid(), 'La capacidad del comando no coincide.')
    if (!meta.idempotencyKey) deny(cid(), 'Falta idempotency key.')
    return user
  }

  private audit(actor: string, action: string, entity: string, reason: string | null): void {
    this.store.audit.unshift({
      id: `aud_${this.store.audit.length + 1}`,
      at: new Date().toISOString(),
      actor,
      action,
      entity,
      reason,
    })
  }

  async getSession(): Promise<SessionUser | null> {
    if (this.store.expired || !this.store.currentUserId) return null
    return this.store.users.find((item) => item.id === this.store.currentUserId) ?? null
  }

  async login(email: string): Promise<SessionUser> {
    const user = this.store.users.find((item) => item.email === email.trim().toLowerCase())
    if (!user) {
      throw new ApiError({
        message: 'No existe un usuario nominativo con ese correo en el simulador.',
        code: 'unknown_user',
        status: 401,
        correlationId: cid(),
      })
    }
    this.store.expired = false
    this.store.currentUserId = user.id
    this.audit(user.displayName, 'session.login', user.id, 'Simulador de sesión')
    return user
  }

  async logout(): Promise<void> {
    this.store.currentUserId = null
    this.store.expired = false
  }

  async switchScope(scopeId: string): Promise<SessionUser> {
    const { user } = this.requireUser('scope.switch')
    const scope = user.allowedScopes.find((item) => item.id === scopeId)
    if (!scope) deny(cid(), 'Scope no autorizado.')
    user.activeScope = scope
    user.tenantBanner = null
    this.audit(user.displayName, 'scope.switch', scopeId, null)
    return user
  }

  async switchTenant(input: { tenantId: string } & CommandMeta): Promise<SessionUser> {
    const user = this.requireCommand(input, 'csc.tenant.switch')
    const scope = user.allowedScopes.find((item) => item.companyId === input.tenantId)
    if (!scope) deny(cid(), 'Tenant no delegado a este operador CSC.')
    user.activeScope = scope
    user.tenantBanner = `CSC en tenant ${scope.companyName} · plaza ${scope.plazaName}. Acceso delegado, auditado y reversible.`
    this.audit(user.displayName, 'csc.tenant.switch', scope.companyId, input.reason ?? 'Cambio de tenant CSC')
    return user
  }

  async listRoutes(): Promise<Paginated<RouteSummary>> {
    this.requireUser('route.view')
    return page(this.store.routes.map(toSummary))
  }

  async getRoute(id: string): Promise<RouteDetail> {
    this.requireUser('route.view')
    const route = this.store.routes.find((item) => item.id === id)
    if (!route) {
      throw new ApiError({ message: 'Ruta no encontrada', code: 'not_found', status: 404, correlationId: cid() })
    }
    return structuredClone(route)
  }

  async assignRoute(input: { routeId: string; driverId: string; vehicleId: string; reason?: string } & CommandMeta): Promise<RouteSummary> {
    const user = this.requireCommand(input, 'route.assign')
    const route = this.findRoute(input.routeId)
    const vehicle = this.store.vehicles.find((item) => item.id === input.vehicleId)
    if (vehicle?.status === 'maintenance_block' || vehicle?.status === 'unsafe_block') {
      throw new ApiError({
        message: 'La unidad está bloqueada. No se puede asignar.',
        code: 'vehicle_blocked',
        status: 409,
        correlationId: cid(),
      })
    }
    route.driver = { ...route.driver, id: input.driverId }
    if (vehicle) {
      route.vehicle = { id: vehicle.id, code: vehicle.code, plate: vehicle.plate, gpsQuality: vehicle.gps.quality }
    }
    if (route.state === 'scheduled') route.state = 'assigned'
    route.version += 1
    this.audit(user.displayName, 'route.assign', route.folio, input.reason ?? 'Asignación habitual o cambio excepcional')
    return toSummary(route)
  }

  async confirmArrival(input: { routeId: string } & CommandMeta): Promise<RouteSummary> {
    const user = this.requireCommand(input, 'route.confirm_arrival')
    const route = this.findRoute(input.routeId)
    route.actualArrivalAt = new Date().toISOString()
    route.state = 'arrived_cedis'
    route.journeyLeg = 'cedis_dwell'
    route.version += 1
    this.audit(user.displayName, 'route.confirm_arrival', route.folio, input.reason ?? null)
    return toSummary(route)
  }

  async reconcileLoad(input: { routeId: string } & CommandMeta): Promise<RouteSummary> {
    const user = this.requireCommand(input, 'route.reconcile_load')
    const route = this.findRoute(input.routeId)
    if (route.hasLoadDifference) {
      throw new ApiError({
        message: 'Hay diferencia de paquetes. Resuélvela antes de conciliar la carga.',
        code: 'load_difference',
        status: 409,
        correlationId: cid(),
      })
    }
    route.state = 'load_reconciled'
    route.blockedReasons = route.blockedReasons.filter((reason) => !reason.includes('Diferencia'))
    if (!route.mlExitAuthorizedAt) {
      route.blockedReasons = ['Falta autorización de salida de Mercado Libre']
    }
    route.version += 1
    this.audit(user.displayName, 'route.reconcile_load', route.folio, input.reason ?? null)
    return toSummary(route)
  }

  async registerMlExitAuthorization(input: { routeId: string; authorizedAt: string } & CommandMeta): Promise<RouteSummary> {
    const user = this.requireCommand(input, 'route.confirm_exit')
    const route = this.findRoute(input.routeId)
    route.mlExitAuthorizedAt = input.authorizedAt
    route.blockedReasons = route.blockedReasons.filter((reason) => !reason.includes('autorización'))
    if (!route.hasLoadDifference && route.state === 'load_reconciled') {
      route.state = 'exit_authorized'
    }
    route.version += 1
    this.audit(user.displayName, 'ml.exit.authorization.recorded', route.folio, 'Registro posterior a autorización de Mercado Libre')
    return toSummary(route)
  }

  async confirmExit(input: { routeId: string } & CommandMeta): Promise<RouteSummary> {
    const user = this.requireCommand(input, 'route.confirm_exit')
    const route = this.findRoute(input.routeId)
    if (route.hasLoadDifference) {
      throw new ApiError({
        message: 'No se puede confirmar la salida con diferencia de paquetes.',
        code: 'load_difference',
        status: 409,
        correlationId: cid(),
      })
    }
    if (!route.mlExitAuthorizedAt) {
      throw new ApiError({
        message: 'Mercado Libre no ha autorizado la salida. Vía Ágil solo registra el hito.',
        code: 'ml_exit_missing',
        status: 409,
        correlationId: cid(),
      })
    }
    route.state = 'in_route'
    route.journeyLeg = 'official_delivery'
    route.blockedReasons = []
    route.version += 1
    this.audit(user.displayName, 'route.confirm_exit', route.folio, input.reason ?? null)
    return toSummary(route)
  }

  async listPackages(routeId?: string) {
    this.requireUser('package.view')
    const items = this.store.packages.filter((item) => (routeId ? item.routeId === routeId : true))
    return page(items)
  }

  async getPackage(id: string): Promise<PackageDetail> {
    this.requireUser('package.view')
    const item = this.store.packages.find((pkg) => pkg.id === id)
    if (!item) {
      throw new ApiError({ message: 'Paquete no encontrado', code: 'not_found', status: 404, correlationId: cid() })
    }
    return structuredClone(item)
  }

  async listVehicles() {
    this.requireUser('fleet.view')
    return page(this.store.vehicles)
  }

  async getVehicle(id: string): Promise<VehicleRecord> {
    this.requireUser('fleet.view')
    const item = this.store.vehicles.find((vehicle) => vehicle.id === id)
    if (!item) {
      throw new ApiError({ message: 'Unidad no encontrada', code: 'not_found', status: 404, correlationId: cid() })
    }
    return structuredClone(item)
  }

  async listAlerts() {
    this.requireUser('alert.view')
    return page(this.store.alerts)
  }

  async contactDriver(input: { alertId: string; note: string } & CommandMeta): Promise<AlertRecord> {
    const user = this.requireCommand(input, 'driver.contact')
    const alert = this.findAlert(input.alertId)
    alert.state = 'in_progress'
    alert.ownerName = user.displayName
    this.audit(user.displayName, 'driver.contact', alert.id, input.note)
    return { ...alert }
  }

  async resolveAlert(input: { alertId: string; reason: string } & CommandMeta): Promise<AlertRecord> {
    const user = this.requireCommand(input, 'alert.resolve')
    const alert = this.findAlert(input.alertId)
    if (!input.reason.trim()) deny(cid(), 'La resolución exige un motivo.')
    alert.state = 'resolved'
    alert.ownerName = user.displayName
    this.audit(user.displayName, 'alert.resolve', alert.id, input.reason)
    return { ...alert }
  }

  async authorizeFuel(input: {
    routeId: string
    amount: number
    liters: number
    station: string
    reason: string
  } & CommandMeta): Promise<FuelAuthorization> {
    const user = this.requireCommand(input, 'fuel.authorize')
    const auth: FuelAuthorization = {
      id: `fuel_${this.store.fuelAuths.length + 1}`,
      routeId: input.routeId,
      amount: { amount: input.amount, currency: 'MXN', kind: 'official' },
      liters: input.liters,
      station: input.station,
      reason: input.reason,
      status: 'authorized',
    }
    this.store.fuelAuths.push(auth)
    this.audit(user.displayName, 'fuel.authorize', input.routeId, input.reason)
    return auth
  }

  async listSettlements() {
    this.requireUser('settlement.view')
    return page(this.store.settlements)
  }

  async getManagementKpis() {
    this.requireUser('management.view')
    return structuredClone(this.store.kpis)
  }

  async listCopilot() {
    this.requireUser('copilot.view')
    return structuredClone(this.store.copilot)
  }

  async listAudit() {
    this.requireUser('audit.view')
    return page(this.store.audit)
  }

  async expireSession(): Promise<void> {
    this.store.expired = true
  }

  async setNetwork(online: boolean): Promise<void> {
    this.store.online = online
  }

  getNetwork() {
    const stale = this.store.routes.some((route) => route.vehicle.gpsQuality === 'stale')
    return { online: this.store.online, stale }
  }

  async applyDevScenario(name: 'resolve_load_difference', payload?: { routeId: string }): Promise<void> {
    if (name === 'resolve_load_difference' && payload?.routeId) this.resolveLoadDifference(payload.routeId)
  }

  resolveLoadDifference(routeId: string): void {
    const route = this.findRoute(routeId)
    route.packagesReceived = route.packagesExpected
    route.packagesLoaded = route.packagesExpected
    route.hasLoadDifference = false
    route.blockedReasons = route.blockedReasons.filter((reason) => !reason.includes('Diferencia'))
  }

  private findRoute(id: string): RouteDetail {
    const route = this.store.routes.find((item) => item.id === id)
    if (!route) {
      throw new ApiError({ message: 'Ruta no encontrada', code: 'not_found', status: 404, correlationId: cid() })
    }
    return route
  }

  private findAlert(id: string): AlertRecord {
    const alert = this.store.alerts.find((item) => item.id === id)
    if (!alert) {
      throw new ApiError({ message: 'Alerta no encontrada', code: 'not_found', status: 404, correlationId: cid() })
    }
    return alert
  }
}

function toSummary(route: RouteDetail): RouteSummary {
  return {
    id: route.id,
    folio: route.folio,
    state: route.state,
    mlLiquidationState: route.mlLiquidationState,
    windowLabel: route.windowLabel,
    requestedArrivalAt: route.requestedArrivalAt,
    actualArrivalAt: route.actualArrivalAt,
    mlExitAuthorizedAt: route.mlExitAuthorizedAt,
    driver: route.driver,
    vehicle: route.vehicle,
    cedisName: route.cedisName,
    packagesExpected: route.packagesExpected,
    packagesReceived: route.packagesReceived,
    packagesLoaded: route.packagesLoaded,
    packagesDelivered: route.packagesDelivered,
    packagesPendingReturn: route.packagesPendingReturn,
    hasLoadDifference: route.hasLoadDifference,
    blockedReasons: route.blockedReasons,
    distance: route.distance,
    journeyLeg: route.journeyLeg,
    provenance: route.provenance,
  }
}

let singleton: MockApiAdapter | null = null

export function createApiAdapter(): ApiClient {
  singleton ??= new MockApiAdapter()
  return singleton
}

export function getMockAdapter(): MockApiAdapter {
  singleton ??= new MockApiAdapter()
  return singleton
}
