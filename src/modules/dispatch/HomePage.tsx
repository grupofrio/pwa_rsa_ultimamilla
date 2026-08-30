import { useAuth } from '@/auth/AuthProvider'
import { PROFILE_LABELS } from '@/auth/capabilities'
import { Badge, KpiCard, MockBanner, PageHeader } from '@/design-system/components/ui'
import { NAV_ITEMS } from '@/app/shell/navConfig'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { user, can } = useAuth()
  if (!user) return null
  const shortcuts = NAV_ITEMS.filter((item) => item.to !== '/inicio' && item.to !== '/catalogo' && can(item.capability)).slice(0, 8)

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Hola, ${user.displayName}`}
        subtitle={`${PROFILE_LABELS[user.profile]} · ${user.activeScope.companyName} · ${user.activeScope.plazaName} · ${user.activeScope.timezone}`}
      />
      {import.meta.env.DEV ? <MockBanner>Escenario de jornada GDL R / RSA. El backend de Sebastián aún no está conectado.</MockBanner> : null}
      <section className="grid gap-3 md:grid-cols-3">
        <KpiCard label="Scope activo" value={user.activeScope.plazaName} hint={user.activeScope.cedisName} />
        <KpiCard label="Turno" value={user.activeScope.shiftName} hint={user.activeScope.fleetName} />
        <KpiCard label="Capacidades" value={String(user.capabilities.length)} hint="Efectivas, entregadas por sesión" />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--va-muted)]">Tu espacio de trabajo</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="min-h-20 rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4 shadow-[var(--va-shadow)] hover:ring-2 hover:ring-[var(--va-teal)]"
            >
              <p className="font-semibold text-[var(--va-navy)]">{item.label}</p>
              <p className="text-xs text-[var(--va-muted)]">{item.to}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-[var(--va-radius)] bg-[var(--va-surface)] p-4 text-sm text-[var(--va-muted)]">
        <p>
          Las reglas oficiales de liquidación, combustible, P&L, distancia y cumplimiento las entrega el backend. Esta
          interfaz formatea, explica y, cuando hay mock, lo etiqueta.
        </p>
        {!can('fuel.authorize') ? (
          <p className="mt-2">
            <Badge tone="info">Este perfil no autoriza combustible, nómina, factura ni liquidación.</Badge>
          </p>
        ) : null}
      </section>
    </div>
  )
}
