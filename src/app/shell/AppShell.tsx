import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/design-system/components/ui'
import { PROFILE_LABELS } from '@/auth/capabilities'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'
import { useConnection } from '@/app/ConnectionProvider'
import { SimulatorDock } from 'virtual:simulator-dock'
import { Bell, ChevronDown, Menu, X } from 'lucide-react'
import { useLayoutEffect, useState } from 'react'

export function AppShell() {
  const { user, logout, switchScope, can } = useAuth()
  const connection = useConnection()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const items = NAV_ITEMS.filter((item) => can(item.capability) && (!item.internal || user?.profile === 'platform_admin'))
  const sections = [...new Set(items.map((item) => item.section))]
  const workspaceLabel = user?.profile === 'platform_admin' ? 'Plataforma Vía Ágil' : user?.profile === 'csc_operator' ? 'Centro de Servicios Compartidos' : 'Operación Guadalajara'

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  if (!user) return null

  return (
    <div className="min-h-dvh bg-[var(--va-bg)] text-[var(--va-ink)]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <div className="flex min-h-dvh">
        <aside
          className={`${open ? 'fixed inset-y-0 left-0 z-40 w-72' : 'hidden'} lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[272px] lg:flex-col border-r border-white/10 bg-[var(--va-navy)] text-white shadow-2xl`}
        >
          <div className="flex items-center justify-between gap-2 px-5 py-5">
            <img src="/brand/via-agil-control-logo.png" alt="Vía Ágil Control" className="h-12 w-44 object-contain object-left brightness-0 invert" />
            <button className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(false)} type="button" aria-label="Cerrar menú">
              <X />
            </button>
          </div>
          <p className="px-5 pb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Inteligencia operativa de última milla</p>
          <nav aria-label="Principal" className="va-scrollbar flex-1 overflow-y-auto px-3 pb-4">
            {sections.map((section) => (
              <div key={section} className="mb-4">
                <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">{section}</p>
                {items.filter((item) => item.section === section).map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `mb-1 flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition ${isActive ? 'bg-[var(--va-teal)] font-semibold text-[var(--va-navy)] shadow-lg shadow-black/10' : 'text-white/75 hover:bg-white/10 hover:text-white'}`
                      }
                    >
                      <Icon size={17} aria-hidden />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <p className="text-xs font-semibold">{workspaceLabel}</p>
            <p className="mt-1 flex items-center gap-2 text-[11px] text-white/55"><span className="h-2 w-2 rounded-full bg-[var(--va-teal)]" />Servicios conectados</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex min-h-[72px] flex-wrap items-center gap-3 border-b border-[var(--va-line)] bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
            <button className="min-h-11 min-w-11 lg:hidden" onClick={() => setOpen(true)} type="button" aria-label="Abrir menú">
              <Menu />
            </button>
            <label className="relative text-sm">
              <span className="sr-only">Scope operativo</span>
              <select
                className="min-h-11 max-w-[60vw] appearance-none rounded-xl border border-[var(--va-line)] bg-[var(--va-soft)] py-2 pl-3 pr-9 text-sm font-medium text-[var(--va-ink)]"
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--va-muted)]" size={16} />
            </label>
            <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
              <button type="button" className="relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--va-line)] bg-white text-[var(--va-muted)]" aria-label="Notificaciones">
                <Bell size={19} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--va-danger)]" />
              </button>
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
          <main id="contenido" className="flex-1 p-4 lg:p-6 xl:p-8">
            <Outlet />
          </main>
          <SimulatorDock />
        </div>
      </div>
    </div>
  )
}

