import { useAuth } from '@/auth/AuthProvider'
import { Badge, Button, ConfirmDialog, DataTable, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { useApi } from '@/services/api/useApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function AlertsPage() {
  const api = useApi()
  const { can } = useAuth()
  const client = useQueryClient()
  const [note, setNote] = useState('Contacto con conductor. Sigue en ruta autorizada.')
  const [target, setTarget] = useState<string | null>(null)
  const [mode, setMode] = useState<'contact' | 'resolve'>('contact')
  const query = useQuery({ queryKey: ['alerts'], enabled: Boolean(api), queryFn: () => api!.listAlerts() })

  const mutate = useMutation({
    mutationFn: async () => {
      if (!api || !target) return
      if (mode === 'contact') {
        return api.contactDriver({ alertId: target, note, capability: 'driver.contact', idempotencyKey: crypto.randomUUID(), reason: note })
      }
      return api.resolveAlert({ alertId: target, reason: note, capability: 'alert.resolve', idempotencyKey: crypto.randomUUID() })
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['alerts'] })
      setTarget(null)
    },
  })

  if (query.isLoading || !api) return <Skeleton />

  return (
    <div className="space-y-4">
      <PageHeader title="Alertas operativas" subtitle="Las infracciones las calcula el backend. Aquí se gestiona responsable, SLA, contacto y resolución." />
      {api.kind === 'mock' ? <MockBanner>Incluye desvío y GPS desactualizado en R-GDLR-2404.</MockBanner> : null}
      <DataTable
        caption="Alertas"
        rows={query.data?.items ?? []}
        columns={[
          { key: 'title', header: 'Alerta', render: (row) => <span data-testid={`alert-${row.id}`}>{row.title}</span> },
          { key: 'sev', header: 'Severidad', render: (row) => <Badge tone={row.severity === 'critical' ? 'danger' : 'warn'}>{row.severity}</Badge> },
          { key: 'state', header: 'Estado', render: (row) => row.state },
          { key: 'owner', header: 'Responsable', render: (row) => row.ownerName ?? 'Sin asignar' },
          { key: 'route', header: 'Ruta', render: (row) => <Link to={`/torre/rutas/${row.routeId}`}>{row.routeId}</Link> },
          {
            key: 'act',
            header: 'Gestión',
            render: (row) => (
              <div className="flex gap-2">
                {can('driver.contact') ? (
                  <Button type="button" variant="ghost" data-testid={`contact-${row.id}`} onClick={() => { setMode('contact'); setTarget(row.id) }}>
                    Contactar
                  </Button>
                ) : null}
                {can('alert.resolve') ? (
                  <Button type="button" variant="secondary" data-testid={`resolve-${row.id}`} onClick={() => { setMode('resolve'); setTarget(row.id) }}>
                    Resolver
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(target)}
        title={mode === 'contact' ? 'Registrar contacto' : 'Resolver alerta'}
        body="La nota queda en bitácora. No altera telemetría ni evidencia original."
        confirmLabel={mode === 'contact' ? 'Guardar contacto' : 'Resolver'}
        reason={note}
        onReason={setNote}
        onCancel={() => setTarget(null)}
        onConfirm={() => mutate.mutate()}
      />
    </div>
  )
}

export function SupervisionPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Supervisión" subtitle="Secuencia, progreso, ETA y excepciones. Coordinación de rescates y cambios excepcionales." />
      <AlertsPage />
    </div>
  )
}
