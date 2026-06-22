import {
  BarChart3,
  CheckSquare2,
  ClipboardList,
  Files,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  Network,
  ScrollText,
  Settings,
  ShieldEllipsis,
  UsersRound,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import type { PlatformIconKey } from './platformRegistry'

export const platformIconByKey: Record<PlatformIconKey, LucideIcon> = {
  analytics: LineChart,
  approval: CheckSquare2,
  audit: ScrollText,
  department: Network,
  diagnostics: HeartPulse,
  document: Files,
  overview: LayoutDashboard,
  report: BarChart3,
  security: ShieldEllipsis,
  settings: Settings,
  task: ClipboardList,
  user: UsersRound,
  workflow: Waypoints,
}
