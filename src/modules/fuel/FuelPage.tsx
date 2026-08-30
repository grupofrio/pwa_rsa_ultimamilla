import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { formatMxn } from '@/format'
import { useApi } from '@/services/api/useApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function FuelPage() {
  const api = useApi()
  const { can } = useAuth()
  const client = useQueryClient()
  const [target, setTarget] = useState<string | null>(null)
  const [reason, setReason] = useState('Carga autorizada según sugerencia y evidencia de rendimiento.')
  const [message, setMessage] = useState<string | null>(null)
  const query = useQuery({ queryKey: ['routes'], enabled: Boolean(api), queryFn: () => api!.listRoutes() })

  const authorize = useMutation({
    mutationFn: async () => {
      if (!api || !target) return
      const row = query.data?.items.find((item) => item.id === target)
      const estimate = row?.fuelEstimate
      if (!estimate?.amount || estimate.liters == null) {
        throw new Error('No hay estimado de combustible del backend para esta ruta.')
      }
      return api.authorizeFuel({
        routeId: target,
        amount: estimate.amount.amount,
        liters: estimate.liters,
        station: 'Estación autorizada GDL',
        reason,
        capability: 'fuel.authorize',
        idempotencyKey: crypto.randomUUID(),
      })
    },
    onSuccess: async () => {
      setMessage('Autorización registrada. El cálculo oficial lo confirma el backend.')
      setTarget(null)
      await client.invalidateQueries()
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'No autorizado'),
  })

  if (query.isLoading || !api) return <Skeleton />

  return (
    <div className="space-y-4">
      <PageHeader title="Combustible" subtitle="La sugerencia explica, no inventa certeza. Autorizar requiere capacidad, motivo y comprobante." />
      {api.kind === 'mock' ? <MockBanner>Montos sugeridos son estimación. No hay litros hardcodeados de negocio en producción: llegan del backend.</MockBanner> : null}
      {message ? (
        <p role="status" data-testid="fuel-feedback">
          {message}
        </p>
      ) : null}
      <DataTable
        caption="Sugerencias de combustible"
        rows={query.data?.items ?? []}
        columns={[
          { key: 'f', header: 'Ruta', render: (row) => row.folio },
          { key: 'd', header: 'Conductor', render: (row) => row.driver.name },
          {
            key: 's',
            header: 'Sugerencia (backend)',
            render: (row) => {
              const estimate = row.fuelEstimate
              if (!estimate?.amount || estimate.liters == null) {
                return 'Sin estimado del backend'
              }
              return (
                <span className="tabular">
                  {formatMxn(estimate.amount.amount, { estimate: estimate.amount.kind !== 'official' })} · {estimate.liters} L
                </span>
              )
            },
          },
          {
            key: 'a',
            header: 'Acción',
            render: (row) =>
              can('fuel.authorize') ? (
                <Button type="button" data-testid={`fuel-${row.id}`} onClick={() => setTarget(row.id)}>
                  Autorizar
                </Button>
              ) : (
                <Badge tone="info">Sin capacidad fuel.authorize</Badge>
              ),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(target)}
        title="Autorizar combustible"
        body="Confirma monto, gasolinera y motivo. Esta UI no publica un asiento contable."
        confirmLabel="Autorizar"
        reason={reason}
        onReason={setReason}
        onCancel={() => setTarget(null)}
        onConfirm={() => authorize.mutate()}
      />
    </div>
  )
}

export function ExpensesPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Gastos operativos" subtitle="Captura y conciliación. Nadie crea, valida, aprueba y elimina el mismo movimiento." />
      <p className="text-sm text-[var(--va-muted)]">Bandeja de captura lista para el contrato de gastos. Sin cifras oficiales locales.</p>
    </div>
  )
}
