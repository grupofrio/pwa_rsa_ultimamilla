import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/design-system/components/ui'
import { PROFILE_LABELS } from '@/auth/capabilities'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'
import { useConnection } from '@/app/ConnectionProvider'
import { SimulatorDock } from 'virtual:simulator-dock'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function AppShell() {
  const { user, logout, switchScope, can } = useAuth()
  const connection = useConnection()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dark = location.pathname.startsWith('/torre')
  const items = NAV_ITEMS.filter((item) => can(item.capability))

  if (!user) return null

  return (
    <div className={`min-h-dvh ${dark ? 'va-dark bg-[var(--va-bg)] text-[var(--va-ink)]' : 'bg-[var(--va-bg)] text-[var(--va-ink)]'}`}>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <div className="flex min-h-dvh">
        <aside
          className={`${open ? 'fixed inset-y-0 left-0 z-40 w-72' : 'hidden'} lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col border-r border-[var(--va-line)] bg-[var(--va-navy)] text-white`}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <div className="flex items-center gap-3">
              <img src="/brand/via-agil-control-logo.png" alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-bold leading-tight">VÍA ÁGIL</p>
                <p className="text-xs tracking-[0.18em] text-[var(--va-teal)]">CONTROL</p>
              </div>
            </div>
            <button className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(false)} type="button" aria-label="Cerrar menú">
              <X />
            </button>
          </div>
          <p className="px-4 pb-2 text-[11px] uppercase tracking-wide text-white/60">Inteligencia operativa de última milla</p>
          <nav aria-label="Principal" className="flex-1 overflow-y-auto px-2 pb-4">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `mb-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm ${isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'}`
                  }
                >
                  <Icon size={18} aria-hidden />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-[var(--va-line)] bg-[var(--va-surface)] px-4 py-3">
            <button className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(true)} type="button" aria-label="Abrir menú">
              <Menu />
            </button>
            <label className="text-sm">
              <span className="sr-only">Scope operativo</span>
              <select
                className="min-h-11 rounded-xl border border-[var(--va-line)] bg-white px-3 text-sm"
                value={user.activeScope.id}
                onChange={(event) => void switchScope(event.target.value)}
                data-testid="scope-select"
              >
                {user.allowedScopes.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.companyName} · {scope.plazaName} · {scope.cedisName} · {scope.shiftName}
                  </option>
                ))}
              </select>
            </label>
            <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-[#e8eef3] px-3 py-1 text-xs font-semibold text-[var(--va-navy)]">
                {PROFILE_LABELS[user.profile]}
              </span>
              <span>{user.displayName}</span>
              <Button type="button" variant="ghost" onClick={() => void logout().then(() => navigate('/login'))}>
                Salir
              </Button>
            </div>
          </header>
          {!connection.online ? (
            <div className="bg-[var(--va-danger)] px-4 py-2 text-sm text-white" data-testid="offline-banner" role="status">
              Sin conexión. Se muestran datos posiblemente desactualizados. Las acciones críticas están bloqueadas.
            </div>
          ) : connection.stale ? (
            <div className="bg-[var(--va-amber)] px-4 py-2 text-sm text-[var(--va-navy)]" role="status">
              Telemetría posiblemente desactualizada. Revisa frescura antes de actuar.
            </div>
          ) : null}
          {user.tenantBanner ? (
            <div className="bg-[var(--va-navy)] px-4 py-2 text-sm text-white" data-testid="tenant-banner" role="status">
              {user.tenantBanner}
            </div>
          ) : null}
          <main id="contenido" className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
          <SimulatorDock />
        </div>
      </div>
    </div>
  )
}

