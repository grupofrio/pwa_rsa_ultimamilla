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
    <main className="grid min-h-dvh place-items-center bg-[var(--va-navy)] p-4 text-white">
      <section className="w-full max-w-lg rounded-[20px] bg-white p-6 text-[var(--va-ink)] shadow-[var(--va-shadow)]">
        <img src="/brand/via-agil-control-logo.png" alt="Vía Ágil Control" className="mx-auto h-16 object-contain" />
        <h1 className="mt-4 text-center text-2xl font-bold text-[var(--va-navy)]">Vía Ágil Control</h1>
        <p className="text-center text-sm text-[var(--va-muted)]">Inteligencia operativa de última milla</p>
        {session.status === 'expired' ? (
          <p className="mt-3 rounded-lg bg-[#fde8e6] p-3 text-sm text-[var(--va-danger)]" role="status">
            La sesión expiró. El destino original se conservó de forma segura y se pedirá de nuevo tras autenticarte.
          </p>
        ) : null}
        <form className="mt-5 space-y-3" onSubmit={(event) => void onSubmit(event)}>
          <label className="block text-sm font-medium">
            Correo nominativo
            <input
              className="mt-1 min-h-11 w-full rounded-xl border border-[var(--va-line)] px-3"
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
            Entrar
          </Button>
        </form>
        {import.meta.env.DEV ? (
          <div className="mt-5 border-t border-dashed border-[var(--va-line)] pt-4" data-testid="simulador-de-sesion-mock">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--va-muted)]">Simulador de sesión (mock)</p>
            <div className="mt-2 grid gap-2">
              {DEV_USERS.map(([name, userEmail]) => (
                <button
                  key={userEmail}
                  type="button"
                  className="min-h-11 rounded-xl border border-[var(--va-line)] px-3 text-left text-sm hover:bg-[#f3fbf9]"
                  onClick={() => setEmail(userEmail)}
                >
                  <strong>{name}</strong>
                  <span className="block text-xs text-[var(--va-muted)]">{userEmail}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-[var(--va-muted)]">
            El acceso de producción usa el contrato de identidad de Sebastián. Esta pantalla no guarda secretos.
          </p>
        )}
      </section>
    </main>
  )
}
