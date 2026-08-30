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
    <div className="sticky bottom-0 border-t border-dashed border-[var(--va-amber)] bg-[#fff8ea] px-4 py-2 text-xs" data-testid="simulator-dock">
      <div className="flex items-center justify-between gap-2">
        <p>
          Simulador de escenarios · <code>VIA_AGIL_MOCK_SENTINEL</code> · no disponible en producción
        </p>
        <Button type="button" variant="ghost" onClick={() => setOpen((value) => !value)}>
          {open ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
      {open ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().expireSession())}>
            Simular sesión expirada
          </Button>
          <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().setNetwork(false))}>
            Cortar red
          </Button>
          <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().setNetwork(true))}>
            Restaurar red
          </Button>
          <Button type="button" variant="ghost" onClick={() => void run(() => getMockAdapter().reset())}>
            Reiniciar escenario
          </Button>
        </div>
      ) : null}
    </div>
  )
}
