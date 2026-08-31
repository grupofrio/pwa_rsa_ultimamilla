import type { Capability } from '@/auth/capabilities'
import {
  Activity,
  Bell,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  Fuel,
  Gauge,
  LayoutDashboard,
  Map,
  Package,
  Receipt,
  Settings,
  Shield,
  ScanLine,
  Truck,
  Users,
  Wallet,
  Wrench,
  LifeBuoy,
  FileSearch,
  RotateCcw,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  to: string
  label: string
  capability: Capability
  section: 'Operación' | 'Flota' | 'Administración' | 'Dirección' | 'Plataforma'
  internal?: boolean
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/inicio', label: 'Inicio', capability: 'home.view', icon: LayoutDashboard, section: 'Operación' },
  { to: '/despacho', label: 'Despacho', capability: 'route.assign', icon: ClipboardCheck, section: 'Operación' },
  { to: '/paquetes', label: 'Paquetes', capability: 'package.view', icon: Package, section: 'Operación' },
  { to: '/devoluciones', label: 'Devoluciones', capability: 'package.return', icon: RotateCcw, section: 'Operación' },
  { to: '/aclaraciones', label: 'Aclaraciones', capability: 'claim.view', icon: FileCheck2, section: 'Operación' },
  { to: '/torre', label: 'Torre de control', capability: 'tower.view', icon: Map, section: 'Operación' },
  { to: '/supervision', label: 'Supervisión', capability: 'supervision.view', icon: Activity, section: 'Operación' },
  { to: '/alertas', label: 'Alertas', capability: 'alert.view', icon: Bell, section: 'Operación' },
  { to: '/flota', label: 'Unidades', capability: 'fleet.view', icon: Truck, section: 'Flota' },
  { to: '/mantenimiento', label: 'Mantenimiento', capability: 'maintenance.view', icon: Wrench, section: 'Flota' },
  { to: '/combustible', label: 'Combustible', capability: 'fuel.view', icon: Fuel, section: 'Flota' },
  { to: '/gastos', label: 'Gastos', capability: 'expense.view', icon: Wallet, section: 'Administración' },
  { to: '/talento', label: 'Talento', capability: 'talent.view', icon: Users, section: 'Administración' },
  { to: '/talento/incidencias', label: 'Incidencias', capability: 'talent.incident.view', icon: ScanLine, section: 'Administración' },
  { to: '/liquidaciones', label: 'Liquidaciones', capability: 'settlement.view', icon: Receipt, section: 'Administración' },
  { to: '/facturacion', label: 'Facturación', capability: 'billing.view', icon: CircleDollarSign, section: 'Administración' },
  { to: '/reportes', label: 'Reportes', capability: 'report.view', icon: Gauge, section: 'Administración' },
  { to: '/gerencia', label: 'Tablero gerencial', capability: 'management.view', icon: Gauge, section: 'Dirección' },
  { to: '/csc', label: 'Centro de servicios', capability: 'csc.view', icon: Building2, section: 'Plataforma' },
  { to: '/soporte', label: 'Mesa de ayuda', capability: 'support.view', icon: LifeBuoy, section: 'Plataforma' },
  { to: '/auditoria', label: 'Auditoría', capability: 'audit.view', icon: FileSearch, section: 'Plataforma' },
  { to: '/configuracion', label: 'Configuración', capability: 'config.view', icon: Settings, section: 'Plataforma' },
  { to: '/catalogo', label: 'Catálogo UI', capability: 'config.view', icon: Shield, section: 'Plataforma', internal: true },
]
