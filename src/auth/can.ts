import type { Capability } from './capabilities'
import type { OperatingScope } from './types'

export function can(capabilities: readonly Capability[], needed: Capability): boolean {
  return capabilities.includes(needed)
}

export function canAny(capabilities: readonly Capability[], needed: readonly Capability[]): boolean {
  return needed.some((item) => capabilities.includes(item))
}

export function canAll(capabilities: readonly Capability[], needed: readonly Capability[]): boolean {
  return needed.every((item) => capabilities.includes(item))
}

export function canInScope(
  capabilities: readonly Capability[],
  needed: Capability,
  active: OperatingScope | null,
  required: Partial<Pick<OperatingScope, 'companyId' | 'plazaId' | 'cedisId'>>,
): boolean {
  if (!can(capabilities, needed) || !active) return false
  if (required.companyId && active.companyId !== required.companyId) return false
  if (required.plazaId && active.plazaId !== required.plazaId) return false
  if (required.cedisId && active.cedisId !== required.cedisId) return false
  return true
}
