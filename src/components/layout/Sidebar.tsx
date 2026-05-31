import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  ListChecks,
  FileText,
  LayoutDashboard,
  Settings,
  Building2,
  Users,
  GitBranch,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import type { UserRole } from '@/lib/types/enums'

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[] | 'all'
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: 'all' },
  { label: 'Frameworks', href: '/frameworks', icon: BarChart3, roles: ['cs_admin', 'super_admin', 'auditor'] },
  { label: 'Assignments', href: '/assignments', icon: ListChecks, roles: ['cs_admin', 'super_admin'] },
  { label: 'My Tasks', href: '/collection/tasks', icon: CheckSquare, roles: ['dept_poc'] },
  { label: 'Review Queue', href: '/review', icon: ClipboardList, roles: ['cs_admin', 'super_admin'] },
  { label: 'Reports', href: '/reports', icon: FileText, roles: ['cs_admin', 'super_admin', 'auditor'] },
]

const settingsItems: NavItem[] = [
  { label: 'Organisation', href: '/settings/org', icon: Building2, roles: ['cs_admin', 'super_admin'] },
  { label: 'Users', href: '/settings/users', icon: Users, roles: ['cs_admin', 'super_admin'] },
  { label: 'Departments', href: '/settings/departments', icon: GitBranch, roles: ['cs_admin', 'super_admin'] },
  { label: 'Report Periods', href: '/settings/periods', icon: Calendar, roles: ['cs_admin', 'super_admin'] },
]

function isVisible(item: NavItem, role: UserRole | null): boolean {
  if (item.roles === 'all') return true
  if (!role) return false
  return item.roles.includes(role)
}

type LinkItemProps = {
  href: string
  icon: React.ElementType
  label: string
}

function LinkItem({ href, icon: Icon, label, onClick }: LinkItemProps & { onClick?: () => void }) {
  return (
    <NavLink
      to={href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const { userRole } = useAuth()

  const visibleNav = navItems.filter(item => isVisible(item, userRole))
  const visibleSettings = settingsItems.filter(item => isVisible(item, userRole))
  const showSettings = visibleSettings.length > 0

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-card">
      {/* Logo / brand */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <span className="text-xs font-bold text-primary-foreground">VT</span>
        </div>
        <span className="font-semibold text-sm">VasudhaTech</span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map(item => (
          <LinkItem key={item.href} href={item.href} icon={item.icon} label={item.label} onClick={onNavClick} />
        ))}

        {showSettings && (
          <>
            <NavLink
              to={visibleSettings[0].href}
              onClick={onNavClick}
              className="mt-4 mb-1 flex items-center gap-2 px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-colors hover:text-foreground"
            >
              <Settings className="h-3 w-3" />
              Settings
            </NavLink>
            {visibleSettings.map(item => (
              <LinkItem key={item.href} href={item.href} icon={item.icon} label={item.label} onClick={onNavClick} />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}
