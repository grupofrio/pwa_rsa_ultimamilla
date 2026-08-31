import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog, ForbiddenState } from '@/design-system/components/ui'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

function Harness() {
  const [open, setOpen] = useState(true)
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  return (
    <>
      {done ? <p>aprobado</p> : null}
      <ConfirmDialog
        open={open}
        title="Aprobar"
        body="Requiere motivo"
        confirmLabel="Confirmar"
        reason={reason}
        onReason={setReason}
        onCancel={() => setOpen(false)}
        onConfirm={() => setDone(true)}
      />
    </>
  )
}

describe('approval UI', () => {
  it('blocks confirm without reason', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
    await user.type(screen.getByLabelText('Motivo'), 'Doble control')
    await expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.getByText('aprobado')).toBeVisible()
  })

  it('explains missing permission', () => {
    render(<ForbiddenState />)
    expect(screen.getByText('Sin permiso')).toBeVisible()
  })
})
