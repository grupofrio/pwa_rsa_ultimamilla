import type { Capability } from '@/auth/capabilities'
import {
  Activity,
  Bell,
  Building2,
  ClipboardCheck,
  Fuel,
  Gauge,
  LayoutDashboard,
  Map,
  Package,
  Receipt,
  Settings,
  Shield,
  Truck,
  Users,
  Wallet,
  Wrench,
  LifeBuoy,
  FileSearch,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  capability: Capability
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/inicio', label: 'Inicio', capability: 'home.view', icon: LayoutDashboard },
  { to: '/despacho', label: 'Despacho', capability: 'route.assign', icon: ClipboardCheck },
  { to: '/paquetes', label: 'Paquetes', capability: 'package.view', icon: Package },
  { to: '/devoluciones', label: 'Devoluciones', capability: 'package.return', icon: Package },
  { to: '/torre', label: 'Torre', capability: 'tower.view', icon: Map },
  { to: '/supervision', label: 'Supervisión', capability: 'supervision.view', icon: Activity },
  { to: '/alertas', label: 'Alertas', capability: 'alert.view', icon: Bell },
  { to: '/flota', label: 'Flota', capability: 'fleet.view', icon: Truck },
  { to: '/mantenimiento', label: 'Mantenimiento', capability: 'maintenance.view', icon: Wrench },
  { to: '/combustible', label: 'Combustible', capability: 'fuel.view', icon: Fuel },
  { to: '/gastos', label: 'Gastos', capability: 'expense.view', icon: Wallet },
  { to: '/talento', label: 'Talento', capability: 'talent.view', icon: Users },
  { to: '/liquidaciones', label: 'Liquidaciones', capability: 'settlement.view', icon: Receipt },
  { to: '/facturacion', label: 'Facturación', capability: 'billing.view', icon: Receipt },
  { to: '/reportes', label: 'Reportes', capability: 'report.view', icon: Gauge },
  { to: '/gerencia', label: 'Gerencia', capability: 'management.view', icon: Gauge },
  { to: '/csc', label: 'CSC', capability: 'csc.view', icon: Building2 },
  { to: '/soporte', label: 'Soporte', capability: 'support.view', icon: LifeBuoy },
  { to: '/auditoria', label: 'Auditoría', capability: 'audit.view', icon: FileSearch },
  { to: '/configuracion', label: 'Configuración', capability: 'config.view', icon: Settings },
  { to: '/catalogo', label: 'Catálogo UI', capability: 'home.view', icon: Shield },
]
