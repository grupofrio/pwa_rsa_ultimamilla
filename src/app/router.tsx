import { AppShell } from '@/app/shell/AppShell'
import { RequireAuth, RequireCapability } from '@/auth/guards'
import { LoginPage } from '@/auth/LoginPage'
import type { Capability } from '@/auth/capabilities'
import { HomePage } from '@/modules/dispatch/HomePage'
import { DispatchAssignmentsPage, DispatchLoadPage, DispatchPage } from '@/modules/dispatch/DispatchPage'
import { ClaimsPage, PackageDetailPage, PackagesPage, ReturnsPage, RouteDetailPage } from '@/modules/packages/PackagesPage'
import { TowerPage } from '@/modules/control-tower/TowerPage'
import { AlertsPage, SupervisionPage } from '@/modules/control-tower/AlertsPage'
import { FleetPage, MaintenancePage, VehicleDetailPage } from '@/modules/fleet/FleetPage'
import { ExpensesPage, FuelPage } from '@/modules/fuel/FuelPage'
import { BillingPage, ReportsPage, SettlementRoutePage, SettlementsPage } from '@/modules/settlements/SettlementsPage'
import { ManagementPage } from '@/modules/management/ManagementPage'
import {
  AuditPage,
  CatalogPage,
  ConfigPage,
  CscClientPage,
  CscPage,
  ScopePage,
  SupportPage,
  TalentIncidentsPage,
  TalentPage,
} from '@/modules/csc/CscPages'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'

function Gate({ capability, children }: { capability: Capability; children: ReactNode }) {
  return (
    <RequireAuth>
      <RequireCapability capability={capability}>{children}</RequireCapability>
    </RequireAuth>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/scope" element={<ScopePage />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/despacho" element={<Gate capability="route.assign"><DispatchPage /></Gate>} />
        <Route path="/despacho/asignaciones" element={<Gate capability="route.assign"><DispatchAssignmentsPage /></Gate>} />
        <Route path="/despacho/carga" element={<Gate capability="route.reconcile_load"><DispatchLoadPage /></Gate>} />
        <Route path="/paquetes" element={<Gate capability="package.view"><PackagesPage /></Gate>} />
        <Route path="/paquetes/:id" element={<Gate capability="package.view"><PackageDetailPage /></Gate>} />
        <Route path="/devoluciones" element={<Gate capability="package.return"><ReturnsPage /></Gate>} />
        <Route path="/aclaraciones" element={<Gate capability="claim.view"><ClaimsPage /></Gate>} />
        <Route path="/torre" element={<Gate capability="tower.view"><TowerPage /></Gate>} />
        <Route path="/torre/rutas/:id" element={<Gate capability="route.view"><RouteDetailPage /></Gate>} />
        <Route path="/supervision" element={<Gate capability="supervision.view"><SupervisionPage /></Gate>} />
        <Route path="/alertas" element={<Gate capability="alert.view"><AlertsPage /></Gate>} />
        <Route path="/flota" element={<Gate capability="fleet.view"><FleetPage /></Gate>} />
        <Route path="/flota/unidades/:id" element={<Gate capability="fleet.view"><VehicleDetailPage /></Gate>} />
        <Route path="/mantenimiento" element={<Gate capability="maintenance.view"><MaintenancePage /></Gate>} />
        <Route path="/combustible" element={<Gate capability="fuel.view"><FuelPage /></Gate>} />
        <Route path="/gastos" element={<Gate capability="expense.view"><ExpensesPage /></Gate>} />
        <Route path="/talento" element={<Gate capability="talent.view"><TalentPage /></Gate>} />
        <Route path="/talento/incidencias" element={<Gate capability="talent.incident.view"><TalentIncidentsPage /></Gate>} />
        <Route path="/liquidaciones" element={<Gate capability="settlement.view"><SettlementsPage /></Gate>} />
        <Route path="/liquidaciones/rutas/:id" element={<Gate capability="settlement.view"><SettlementRoutePage /></Gate>} />
        <Route path="/facturacion" element={<Gate capability="billing.view"><BillingPage /></Gate>} />
        <Route path="/reportes" element={<Gate capability="report.view"><ReportsPage /></Gate>} />
        <Route path="/gerencia" element={<Gate capability="management.view"><ManagementPage /></Gate>} />
        <Route path="/csc" element={<Gate capability="csc.view"><CscPage /></Gate>} />
        <Route path="/csc/clientes/:id" element={<Gate capability="csc.view"><CscClientPage /></Gate>} />
        <Route path="/soporte" element={<Gate capability="support.view"><SupportPage /></Gate>} />
        <Route path="/auditoria" element={<Gate capability="audit.view"><AuditPage /></Gate>} />
        <Route path="/configuracion" element={<Gate capability="config.view"><ConfigPage /></Gate>} />
        <Route path="/catalogo" element={<Gate capability="config.view"><CatalogPage /></Gate>} />
      </Route>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
