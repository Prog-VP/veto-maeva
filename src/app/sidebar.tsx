import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  FileText,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Planning', icon: Calendar, path: '/planning' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'Consultations', icon: Stethoscope, path: '/consultations' },
  { label: 'Catalogue', icon: Package, path: '/catalogue' },
  { label: 'Factures', icon: FileText, path: '/factures' },
  { label: 'Stock', icon: Warehouse, path: '/stock' },
]

const STORAGE_KEY = 'sidebar-collapsed'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <aside
      className="flex flex-col transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--sidebar)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--sidebar-primary)' }}>
            Véto Maëva
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-1.5 transition-colors"
          style={{ color: 'var(--sidebar-foreground)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sidebar-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'opacity-70 hover:opacity-100'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--sidebar-primary)' : undefined,
              color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
            })}
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 text-xs opacity-50" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          Cabinet Vétérinaire
        </div>
      )}
    </aside>
  )
}
