import { useAuth } from '@/auth/AuthProvider'
import { getMockAdapter } from '@/services/api/adapters/mock'
import { Button } from '@/design-system/components/ui'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function SimulatorDock() {
  const { refresh } = useAuth()
  const client = useQueryClient()
  const [open, setOpen] = useState(false)

  if (!import.meta.env.DEV) return null

  async function run(action: () => Promise<void> | void) {
    await action()
    await refresh()
    await client.invalidateQueries()
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 text-xs opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100" data-testid="simulator-dock">
      <div className="flex flex-col items-end gap-2">
        {open ? (
          <div className="max-w-md rounded-2xl border border-[var(--va-line)] bg-white p-3 shadow-2xl">
            <p className="mb-2 font-semibold text-[var(--va-navy)]">Herramientas de demostración <span className="sr-only">VIA_AGIL_MOCK_SENTINEL</span></p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().expireSession())}>Simular sesión expirada</Button>
              <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().setNetwork(false))}>Cortar red</Button>
              <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().setNetwork(true))}>Restaurar red</Button>
              <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().reset())}>Reiniciar escenario</Button>
            </div>
          </div>
        ) : null}
        <Button className="rounded-full bg-white shadow-lg" type="button" variant="ghost" onClick={() => setOpen((value) => !value)}>
          {open ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
    </div>
  )
}
