import { consumeReturnTo, useAuth } from '@/auth/AuthProvider'
import { Button } from '@/design-system/components/ui'
import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

const DEV_USERS = [
  ['Ana López', 'ana.despacho@viaagil.example'],
  ['Bruno Méndez', 'bruno.supervisor@viaagil.example'],
  ['Carla Ruiz', 'carla.flota@viaagil.example'],
  ['Diego Navarro', 'diego.admin@viaagil.example'],
  ['Elena Prado', 'elena.gerencia@viaagil.example'],
  ['Fabio Ortega', 'fabio.csc@viaagil.example'],
  ['Gina Herrera', 'gina.plataforma@viaagil.example'],
] as const

export function LoginPage() {
  const { session, login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('ana.despacho@viaagil.example')
  const [error, setError] = useState<string | null>(null)

  if (!loading && session.status === 'authenticated') {
    return <Navigate to={consumeReturnTo() ?? '/inicio'} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await login(email)
      navigate(consumeReturnTo() ?? '/inicio', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    }
  }

  return (
    <main className="min-h-dvh bg-[var(--va-navy)] p-4 text-white lg:grid lg:place-items-center lg:p-8">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#071b2b] via-[#0b3450] to-[#08766e] p-8 lg:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <img src="/brand/via-agil-control-logo.png" alt="Vía Ágil Control" className="relative h-16 w-64 object-contain object-left brightness-0 invert" />
          <div className="relative mt-16 max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-[var(--va-teal)]">Operación bajo control</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight lg:text-5xl">Toda tu última milla, en una sola vista.</h1>
            <p className="mt-5 text-base leading-relaxed text-white/70">Despacho, custodia, GPS, combustible, mantenimiento, liquidaciones y rentabilidad conectados por ruta y unidad.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Torre operativa en vivo','Prueba de entrega y aclaraciones','Corte diario por camioneta','Copiloto y decisiones gerenciales'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 p-3 text-sm"><span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--va-teal)] font-bold text-[var(--va-navy)]">✓</span>{item}</div>)}
            </div>
          </div>
        </div>
        <div className="p-6 text-[var(--va-ink)] sm:p-8 lg:p-12">
          <p className="text-sm font-semibold text-[var(--va-teal-700)]">VÍA ÁGIL CONTROL</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--va-navy)]">Bienvenido</h2>
          <p className="mt-2 text-sm text-[var(--va-muted)]">Ingresa a tu espacio de trabajo autorizado.</p>
        {session.status === 'expired' ? (
          <p className="mt-3 rounded-lg bg-[#fde8e6] p-3 text-sm text-[var(--va-danger)]" role="status">
            La sesión expiró. El destino original se conservó de forma segura y se pedirá de nuevo tras autenticarte.
          </p>
        ) : null}
        <form className="mt-7 space-y-3" onSubmit={(event) => void onSubmit(event)}>
          <label className="block text-sm font-medium">
            Correo de acceso
            <input
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--va-line)] bg-[var(--va-soft)] px-4"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              data-testid="login-email"
            />
          </label>
          {error ? (
            <p className="text-sm text-[var(--va-danger)]" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full">
            Entrar a Vía Ágil
          </Button>
        </form>
        {import.meta.env.DEV ? (
          <div className="mt-6 border-t border-[var(--va-line)] pt-5" data-testid="simulador-de-sesion-mock">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--va-muted)]">Accesos para demostración</p>
            <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {DEV_USERS.map(([name, userEmail]) => (
                <button
                  key={userEmail}
                  type="button"
                  className={`min-h-11 rounded-xl border px-3 text-left text-sm transition ${email === userEmail ? 'border-[var(--va-teal)] bg-[#effbf9]' : 'border-[var(--va-line)] hover:bg-[var(--va-soft)]'}`}
                  onClick={() => setEmail(userEmail)}
                >
                  <strong>{name}</strong>
                  <span className="block text-xs text-[var(--va-muted)]">{userEmail}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-xs text-[var(--va-muted)]">Acceso seguro por usuario, empresa, plaza y perfil.</p>
        )}
        </div>
      </section>
    </main>
  )
}
