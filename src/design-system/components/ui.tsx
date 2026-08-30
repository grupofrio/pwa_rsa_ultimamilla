import type { DataQuality } from '@/entities/states'
import { DATA_QUALITY_LABELS } from '@/entities/states'
import { freshnessLabel } from '@/format'
import { AlertTriangle, CheckCircle2, Info, MinusCircle, Search, TrendingDown, TrendingUp } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const styles = {
    primary: 'border border-[var(--va-navy)] bg-[var(--va-navy)] text-white shadow-sm hover:bg-[var(--va-navy-400)]',
    secondary: 'border border-[#a9bac7] bg-white text-[var(--va-navy)] hover:border-[var(--va-navy)] hover:bg-[var(--va-soft)]',
    danger: 'border border-[var(--va-danger)] bg-[var(--va-danger)] text-white shadow-sm hover:brightness-90',
    ghost: 'border border-transparent bg-transparent text-[var(--va-ink)] hover:border-[var(--va-line)] hover:bg-[var(--va-soft)]',
  }[variant]
  return (
    <button
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--va-teal)] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
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
  trend,
  icon,
}: {
  label: string
  value: string
  hint?: string
  provenance?: { source: string; quality: DataQuality; updatedAt: string }
  trend?: { value: string; direction: 'up' | 'down'; positive?: boolean }
  icon?: ReactNode
}) {
  const trendGood = trend?.positive ?? trend?.direction === 'up'
  return (
    <article className="rounded-[var(--va-radius)] border border-[var(--va-line)] bg-[var(--va-surface)] p-4 shadow-[var(--va-shadow)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--va-muted)]">{label}</p>
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--va-soft)] text-[var(--va-teal-700)]">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-bold tabular">{value}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {trend ? (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trendGood ? 'text-[var(--va-success)]' : 'text-[var(--va-danger)]'}`}>
            {trend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend.value}
          </span>
        ) : null}
        {hint ? <p className="text-sm text-[var(--va-muted)]">{hint}</p> : null}
      </div>
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
        <h1 className="text-2xl font-bold tracking-tight text-[var(--va-ink)] lg:text-[28px]">{title}</h1>
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
    <div className="overflow-x-auto rounded-[var(--va-radius)] border border-[var(--va-line)] bg-[var(--va-surface)] shadow-[var(--va-shadow)]">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--va-soft)] text-xs uppercase tracking-wide text-[var(--va-muted)]">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-semibold" scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[var(--va-muted)]">No hay registros para los filtros seleccionados.</td></tr>
          ) : rows.map((row) => (
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

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[var(--va-radius)] border border-[var(--va-line)] bg-[var(--va-surface)] p-4 shadow-[var(--va-shadow)] ${className}`}>{children}</section>
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-bold text-[var(--va-ink)]">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-[var(--va-muted)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function ProgressBar({ value, label, tone = 'teal' }: { value: number; label?: string; tone?: 'teal' | 'amber' | 'danger' | 'navy' }) {
  const colors = { teal: 'bg-[var(--va-teal)]', amber: 'bg-[var(--va-amber)]', danger: 'bg-[var(--va-danger)]', navy: 'bg-[var(--va-navy-400)]' }
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div>
      {label ? <div className="mb-1 flex justify-between text-xs text-[var(--va-muted)]"><span>{label}</span><span className="font-semibold tabular">{safe}%</span></div> : null}
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--va-soft)]"
        role="progressbar"
        aria-label={label ?? `Progreso ${safe}%`}
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${safe}%` }} />
      </div>
    </div>
  )
}

export function SearchField({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`relative block min-w-56 ${className}`}>
      <span className="sr-only">{props['aria-label'] ?? 'Buscar'}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--va-muted)]" size={17} />
      <input className="min-h-11 w-full rounded-xl border border-[var(--va-line)] bg-[var(--va-surface)] pl-10 pr-3 text-sm" {...props} />
    </label>
  )
}

export function SelectField({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`min-h-11 rounded-xl border border-[var(--va-line)] bg-[var(--va-surface)] px-3 text-sm text-[var(--va-ink)] ${className}`} {...props}>{children}</select>
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-[var(--va-radius)] border border-[var(--va-line)] bg-[var(--va-surface)] p-3">{children}</div>
}

export function StatusMessage({ children, tone = 'ok' }: { children: ReactNode; tone?: 'ok' | 'warn' | 'danger' | 'info' }) {
  const styles = {
    ok: 'border-[#a7e2ce] bg-[#e9f8f2] text-[var(--va-success)]',
    warn: 'border-[#f6d79b] bg-[#fff7e8] text-[var(--va-warning)]',
    danger: 'border-[#f5b7b1] bg-[#fff0ef] text-[var(--va-danger)]',
    info: 'border-[#b9d8f2] bg-[#eef7ff] text-[var(--va-info)]',
  }
  return <p role="status" className={`rounded-xl border px-3 py-2 text-sm font-medium ${styles[tone]}`}>{children}</p>
}

export function MiniTrend({ values, color = 'var(--va-teal)', height = 120 }: { values: number[]; color?: string; height?: number }) {
  const width = 600
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * width},${height - 12 - ((value - min) / range) * (height - 28)}`).join(' ')
  const area = `0,${height} ${points} ${width},${height}`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Tendencia del periodo">
      <defs><linearGradient id="vaTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".28"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polygon points={area} fill="url(#vaTrendFill)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Donut({ value, label, detail }: { value: number; label: string; detail: string }) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--va-teal) ${safe}%, var(--va-soft) 0)` }}>
        <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--va-surface)] text-center"><strong className="text-xl tabular">{safe}%</strong></div>
      </div>
      <div><p className="font-semibold">{label}</p><p className="text-sm text-[var(--va-muted)]">{detail}</p></div>
    </div>
  )
}
