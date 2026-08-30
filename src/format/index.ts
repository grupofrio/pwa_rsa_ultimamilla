import type { DataQuality } from '@/entities/states'

const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

const NUMBER = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 })

export function formatMxn(amount: number | null | undefined, options?: { estimate?: boolean }): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  const value = MXN.format(amount)
  return options?.estimate ? `${value} (estimación)` : value
}

export function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(km)) return '—'
  return `${NUMBER.format(km)} km`
}

export function formatDateTime(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone,
  }).format(date)
}

export function formatTime(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-MX', {
    timeStyle: 'short',
    timeZone,
  }).format(date)
}

export function freshnessLabel(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'Sin actualización'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'Sin actualización'
  const delta = Math.max(0, now - then)
  const minutes = Math.floor(delta / 60_000)
  if (minutes < 1) return 'Hace segundos'
  if (minutes === 1) return 'Hace 1 min'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return 'Hace 1 h'
  return `Hace ${hours} h`
}

export function qualityFromAge(iso: string | null | undefined, staleAfterMs = 120_000, now = Date.now()): DataQuality {
  if (!iso) return 'missing'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'missing'
  return now - then > staleAfterMs ? 'stale' : 'ok'
}
