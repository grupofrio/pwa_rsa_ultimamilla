import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('via-agil-error', { name: error.name, correlation: 'client_boundary', info: info.componentStack?.slice(0, 200) })
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <main className="grid min-h-dvh place-items-center bg-[var(--va-bg)] p-6 text-[var(--va-ink)]">
        <section className="max-w-lg rounded-[var(--va-radius)] bg-white p-6 shadow-[var(--va-shadow)]">
          <h1 className="text-xl font-semibold">No se pudo mostrar este módulo</h1>
          <p className="mt-2 text-sm text-[var(--va-muted)]">
            El error se reportó sin datos personales. Código de correlación de cliente: <code>client_boundary</code>.
          </p>
          <button
            className="mt-4 min-h-11 rounded-lg bg-[var(--va-navy)] px-4 text-white"
            onClick={() => this.setState({ error: null })}
            type="button"
          >
            Reintentar
          </button>
        </section>
      </main>
    )
  }
}
