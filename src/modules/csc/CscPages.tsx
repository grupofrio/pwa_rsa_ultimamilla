import { useAuth } from '@/auth/AuthProvider'
import { Button, ConfirmDialog, DataTable, MockBanner, PageHeader, Skeleton } from '@/design-system/components/ui'
import { useApi } from '@/services/api/useApi'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

export function CscPage() {
  const { user, switchTenant, can } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('Acompañamiento contratado para onboarding y calidad de datos.')
  if (!user) return null
  const other = user.allowedScopes.find((scope) => scope.id !== user.activeScope.id)

  return (
    <div className="space-y-4">
      <PageHeader title="Centro de Servicios Compartidos" subtitle="El CSC prepara; no aprueba combustible, nómina, factura o liquidación salvo delegación explícita." />
      <MockBanner>Cambio de tenant con banner visible y auditoría. RSA conserva la propiedad de sus datos.</MockBanner>
      <p className="text-sm">Tenant activo: {user.activeScope.companyName} · {user.activeScope.plazaName}</p>
      {can('csc.tenant.switch') && other ? (
        <Button type="button" data-testid="switch-tenant" onClick={() => setOpen(true)}>
          Cambiar a {other.companyName}
        </Button>
      ) : (
        <p>Sin capacidad para cambiar de tenant.</p>
      )}
      <ConfirmDialog
        open={open}
        title="Cambiar de tenant"
        body="Quedará un banner visible y un rastro de auditoría. No es un acceso silencioso."
        confirmLabel="Cambiar tenant"
        reason={reason}
        onReason={setReason}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (!other) return
          void switchTenant(other.companyId, reason).then(() => setOpen(false))
        }}
      />
    </div>
  )
}

export function CscClientPage() {
  const { id = '' } = useParams()
  return (
    <div className="space-y-4">
      <PageHeader title={`Cliente ${id}`} subtitle="Onboarding, plazas, CEDIS, horarios, usuarios solicitados, vehículos y GPS." />
    </div>
  )
}

export function TalentPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Talento" subtitle="Expediente, capacitación y desempeño. No sustituye al backend laboral." />
      <p className="text-sm text-[var(--va-muted)]">Pago por ruta, salario, bono, incidencia y descuento se distinguen cuando el backend envía catálogo y vigencia. Nada está hardcodeado como tarifa oficial.</p>
    </div>
  )
}

export function TalentIncidentsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Incidencias de nómina" subtitle="Captura de ausencias, retardos y accidentes. El cálculo oficial no ocurre en el navegador." />
    </div>
  )
}

export function SupportPage() {
  const api = useApi()
  const { user } = useAuth()
  return (
    <div className="space-y-4">
      <PageHeader title="Soporte" subtitle="Diagnóstico copiable sin secretos ni PII." />
      <pre className="overflow-auto rounded-[var(--va-radius)] bg-[var(--va-navy)] p-4 text-xs text-white">
        {JSON.stringify(
          {
            app: 'Vía Ágil Control',
            version: '0.1.0',
            adapter: api?.kind ?? 'unknown',
            env: import.meta.env.VITE_APP_ENV,
            tenant: user?.activeScope.companyName,
            plaza: user?.activeScope.plazaName,
            profile: user?.profile,
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

export function AuditPage() {
  const api = useApi()
  const query = useQuery({ queryKey: ['audit'], enabled: Boolean(api), queryFn: () => api!.listAudit() })
  if (query.isLoading || !api) return <Skeleton />
  return (
    <div className="space-y-4">
      <PageHeader title="Auditoría" subtitle="Creación, validación, aprobación, reversa, exportación y cambios de tenant." />
      <DataTable
        caption="Bitácora"
        rows={query.data?.items ?? []}
        columns={[
          { key: 'at', header: 'Cuando', render: (row) => row.at },
          { key: 'actor', header: 'Quién', render: (row) => row.actor },
          { key: 'action', header: 'Acción', render: (row) => row.action },
          { key: 'entity', header: 'Entidad', render: (row) => row.entity },
          { key: 'reason', header: 'Motivo', render: (row) => row.reason ?? '—' },
        ]}
      />
    </div>
  )
}

export function ConfigPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Configuración autorizada" subtitle="Catálogos, integraciones y salud técnica. Nunca se exponen secretos, tokens ni acciones destructivas." />
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>Identidad y scopes — contrato pendiente</li>
        <li>GPS unificado — contrato pendiente</li>
        <li>Fuente oficial de liquidación Mercado Libre — contrato pendiente</li>
      </ul>
    </div>
  )
}

export function CatalogPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Catálogo de componentes" subtitle="Equivalente interno a Storybook. Tokens de Vía Ágil, no de KOLD OS." />
      <section className="flex flex-wrap gap-2">
        <ButtonProbe />
      </section>
    </div>
  )
}

function ButtonProbe() {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Botones 44px</p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex min-h-11 items-center rounded-xl bg-[var(--va-teal)] px-4 font-semibold text-[var(--va-navy)]">Primario</span>
        <span className="inline-flex min-h-11 items-center rounded-xl bg-[var(--va-navy)] px-4 font-semibold text-white">Secundario</span>
        <span className="inline-flex min-h-11 items-center rounded-xl bg-[var(--va-danger)] px-4 font-semibold text-white">Peligro</span>
      </div>
    </div>
  )
}

export function ScopePage() {
  const { user } = useAuth()
  return (
    <div className="space-y-4">
      <PageHeader title="Selector de scope" subtitle="Empresa, plaza, CEDIS, turno y flota. El backend autoriza el alcance." />
      <ul>
        {user?.allowedScopes.map((scope) => (
          <li key={scope.id}>
            {scope.companyName} · {scope.plazaName} · {scope.cedisName} · {scope.shiftName} · {scope.timezone}
          </li>
        ))}
      </ul>
    </div>
  )
}
