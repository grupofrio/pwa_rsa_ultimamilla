import type { DataQuality } from '@/entities/states'
import { DATA_QUALITY_LABELS } from '@/entities/states'
import { freshnessLabel } from '@/format'
import { AlertTriangle, CheckCircle2, Info, MinusCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Button({
  children,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'bg-[var(--va-teal)] text-[var(--va-navy)] hover:bg-[var(--va-teal-700)] hover:text-white',
    secondary: 'bg-[var(--va-navy)] text-white hover:bg-[var(--va-navy-600)]',
    danger: 'bg-[var(--va-danger)] text-white',
    ghost: 'bg-transparent text-[var(--va-navy)] border border-[var(--va-line)]',
  }[variant]
  return (
    <button
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'info'
}) {
  const map = {
    neutral: 'bg-[#e8eef3] text-[var(--va-navy)]',
    ok: 'bg-[#d9f6ec] text-[var(--va-success)]',
    warn: 'bg-[#fff1d6] text-[var(--va-warning)]',
    danger: 'bg-[#fde8e6] text-[var(--va-danger)]',
    info: 'bg-[#e4f0fb] text-[var(--va-info)]',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${map[tone]}`}>
      {children}
    </span>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  provenance,
}: {
  label: string
  value: string
  hint?: string
  provenance?: { source: string; quality: DataQuality; updatedAt: string }
}) {
  return (
    <article className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4 shadow-[var(--va-shadow)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--va-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular">{value}</p>
      {hint ? <p className="mt-1 text-sm text-[var(--va-muted)]">{hint}</p> : null}
      {provenance ? <Provenance {...provenance} /> : null}
    </article>
  )
}

export function Provenance({ source, quality, updatedAt }: { source: string; quality: DataQuality; updatedAt: string }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--va-muted)]" data-testid="data-provenance">
      <QualityMark quality={quality} />
      <span>Fuente: {source}</span>
      <span>· {freshnessLabel(updatedAt)}</span>
    </p>
  )
}

export function QualityMark({ quality }: { quality: DataQuality }) {
  const Icon = quality === 'ok' ? CheckCircle2 : quality === 'stale' ? AlertTriangle : quality === 'missing' ? MinusCircle : Info
  const tone = quality === 'ok' ? 'ok' : quality === 'stale' ? 'warn' : quality === 'missing' ? 'danger' : 'info'
  return (
    <Badge tone={tone}>
      <Icon size={12} aria-hidden />
      {DATA_QUALITY_LABELS[quality]}
    </Badge>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--va-navy)]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-[var(--va-muted)]">{subtitle}</p> : null}
      </div>
      {actions}
    </header>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--va-radius)] border border-dashed border-[var(--va-line)] bg-[var(--va-surface)] p-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-[var(--va-muted)]">{body}</p>
    </div>
  )
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-[var(--va-radius)] border border-[var(--va-danger)] bg-white p-6">
      <p className="font-semibold text-[var(--va-danger)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--va-muted)]">{body}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry} type="button" variant="secondary">
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

export function ForbiddenState() {
  return (
    <EmptyState
      title="Sin permiso"
      body="Tu perfil no tiene la capacidad requerida. Ocultar un botón no es la autorización: el servidor también rechazará la acción."
    />
  )
}

export function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-lg bg-[#e3ebf2]" />
      ))}
    </div>
  )
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
  onRowClick,
}: {
  columns: { key: string; header: string; render: (row: T) => ReactNode }[]
  rows: T[]
  caption: string
  onRowClick?: (row: T) => void
}) {
  return (
    <div className="overflow-x-auto rounded-[var(--va-radius)] bg-[var(--va-surface)] shadow-[var(--va-shadow)]">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[#eef3f7] text-xs uppercase tracking-wide text-[var(--va-muted)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-semibold" scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'cursor-pointer border-t border-[var(--va-line)] hover:bg-[#f3fbf9]' : 'border-t border-[var(--va-line)]'}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') onRowClick(row)
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-top">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
  reason,
  onReason,
}: {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  reason?: string
  onReason?: (value: string) => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-[var(--va-radius)] bg-white p-5 shadow-[var(--va-shadow)]">
        <h2 id="confirm-title" className="text-lg font-bold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--va-muted)]">{body}</p>
        {onReason ? (
          <label className="mt-3 block text-sm font-medium">
            Motivo
            <textarea
              className="mt-1 min-h-20 w-full rounded-lg border border-[var(--va-line)] p-2"
              value={reason}
              onChange={(event) => onReason(event.target.value)}
            />
          </label>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={Boolean(onReason) && !reason?.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MockBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--va-amber)] bg-[#fff8ea] px-3 py-2 text-xs text-[var(--va-navy)]" data-testid="mock-banner">
      Datos simulados · {children}
    </div>
  )
}
