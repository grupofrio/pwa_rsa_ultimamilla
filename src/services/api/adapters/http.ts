import type { SessionUser } from '@/auth/types'
import { ApiError } from '@/services/api/errors'
import type { ApiClient, CommandMeta } from '@/services/api/types'

function cid(): string {
  return `cid_http_${Math.random().toString(36).slice(2, 10)}`
}

function notReady(operation: string): never {
  throw new ApiError({
    message: `El contrato HTTP para ${operation} aún no está conectado. Ver docs/SEBASTIAN_API_REQUESTS.md.`,
    code: 'contract_pending',
    status: 501,
    correlationId: cid(),
  })
}

export class HttpApiAdapter implements ApiClient {
  readonly kind = 'http' as const
  private readonly baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

  async getSession(): Promise<SessionUser | null> {
    if (!this.baseUrl) return null
    return notReady('GET /session')
  }

  async login(_email: string): Promise<SessionUser> {
    return notReady('POST /session')
  }

  async logout(): Promise<void> {
    if (!this.baseUrl) return
    return notReady('DELETE /session')
  }

  async switchScope(_scopeId: string): Promise<SessionUser> {
    return notReady('POST /session/scope')
  }

  async switchTenant(_input: { tenantId: string } & CommandMeta): Promise<SessionUser> {
    return notReady('POST /csc/tenant')
  }

  async listRoutes() {
    return notReady('GET /routes')
  }

  async getRoute(_id: string) {
    return notReady('GET /routes/{id}')
  }

  async assignRoute() {
    return notReady('POST /routes/{id}/assign')
  }

  async confirmArrival() {
    return notReady('POST /routes/{id}/arrival')
  }

  async reconcileLoad() {
    return notReady('POST /routes/{id}/reconcile-load')
  }

  async registerMlExitAuthorization() {
    return notReady('POST /routes/{id}/ml-exit-authorization')
  }

  async confirmExit() {
    return notReady('POST /routes/{id}/confirm-exit')
  }

  async listPackages() {
    return notReady('GET /packages')
  }

  async getPackage(_id: string) {
    return notReady('GET /packages/{id}')
  }

  async listVehicles() {
    return notReady('GET /vehicles')
  }

  async getVehicle(_id: string) {
    return notReady('GET /vehicles/{id}')
  }

  async listAlerts() {
    return notReady('GET /alerts')
  }

  async contactDriver() {
    return notReady('POST /alerts/{id}/contact')
  }

  async resolveAlert() {
    return notReady('POST /alerts/{id}/resolve')
  }

  async authorizeFuel() {
    return notReady('POST /fuel/authorizations')
  }

  async listSettlements() {
    return notReady('GET /settlements')
  }

  async getManagementKpis() {
    return notReady('GET /management/kpis')
  }

  async listCopilot() {
    return notReady('GET /copilot/recommendations')
  }

  async listAudit() {
    return notReady('GET /audit')
  }

  async expireSession(): Promise<void> {
    return
  }

  async setNetwork(_online: boolean): Promise<void> {
    return
  }

  getNetwork() {
    return { online: navigator.onLine, stale: false }
  }

  async applyDevScenario(): Promise<void> {
    return
  }
}

export function createApiAdapter(): ApiClient {
  return new HttpApiAdapter()
}
