import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import {
  Radar, ShoppingCart, Grid3X3, ChefHat, Package,
  Vault, BarChart3, Users, Building2, Settings2, Layers,
} from 'lucide-react'

const NAV = [
  { label: 'Comando', path: '/app/dashboard', icon: Radar, roles: ['admin_saas','admin_restaurant','gerente','supervisor'] },
  { label: 'Módulos', path: '/app/modules', icon: Layers, roles: ['admin_saas','admin_restaurant','gerente','supervisor','capitan','cajero','mesero','cocina'] },
  { label: 'POS', path: '/app/pos', icon: ShoppingCart, roles: ['cajero','mesero','supervisor','gerente','admin_restaurant'] },
  { label: 'Piso', path: '/app/tables', icon: Grid3X3, roles: ['mesero','cajero','supervisor','capitan','gerente','admin_restaurant'] },
  { label: 'Cocina', path: '/app/kitchen', icon: ChefHat, roles: ['cocina','supervisor','gerente','admin_restaurant'] },
  { label: 'Menú', path: '/app/catalog', icon: Package, roles: ['admin_restaurant','gerente','supervisor'] },
  { label: 'Caja', path: '/app/cash', icon: Vault, roles: ['cajero','gerente','supervisor','admin_restaurant'] },
  { label: 'Análisis', path: '/app/reports', icon: BarChart3, roles: ['gerente','admin_restaurant','admin_saas'] },
  { label: 'Equipo', path: '/app/users', icon: Users, roles: ['admin_restaurant','gerente'] },
  { label: 'Locales', path: '/app/branches', icon: Building2, roles: ['admin_restaurant','admin_saas'] },
  { label: 'Sistema', path: '/app/settings', icon: Settings2, roles: ['admin_restaurant','admin_saas'] },
]

export function CommandNav({ compact, light }: { compact?: boolean; light?: boolean }) {
  const { user } = useAuthStore()
  const visible = NAV.filter(i => user?.role && i.roles.includes(user.role))

  return (
    <nav className={cn('flex items-center gap-1 overflow-x-auto', compact ? 'flex-nowrap' : 'flex-wrap')}>
      {visible.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
            isActive
              ? light
                ? 'bg-white/25 text-white border border-white/40'
                : 'bg-gradient-to-r from-brand-100 to-orange-100 text-brand-700 border border-brand-300 shadow-glow'
              : light
                ? 'text-white/80 hover:bg-white/15 border border-transparent'
                : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50 border border-transparent'
          )}
        >
          <item.icon size={14} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

const MOBILE_PRIMARY_PATHS = new Set([
  '/app/dashboard',
  '/app/pos',
  '/app/tables',
  '/app/kitchen',
  '/app/cash',
  '/app/modules',
])

export function CommandMobileNav() {
  const { user } = useAuthStore()
  const visible = NAV.filter(
    (i) => user?.role && i.roles.includes(user.role) && MOBILE_PRIMARY_PATHS.has(i.path)
  )
  const tabs = visible.slice(0, 6)

  return (
    <nav
      className="mobile-tab-bar fixed bottom-0 left-0 right-0 z-40 border-t border-brand-200/80 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(245,158,11,0.12)] supports-[backdrop-filter]:bg-white/90"
      aria-label="Navegación principal"
    >
      <div
        className="mx-auto max-w-screen-sm px-1.5 pt-1.5 grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 min-h-[56px] transition-all duration-200 active:scale-95',
              isActive
                ? 'text-brand-700'
                : 'text-slate-500'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-brand-500 mobile-tab-active" />
                )}
                <span
                  className={cn(
                    'flex items-center justify-center rounded-2xl transition-all duration-200',
                    isActive
                      ? 'w-11 h-11 gradient-amber text-white shadow-glow mobile-tab-active'
                      : 'w-9 h-9 text-slate-500'
                  )}
                >
                  <item.icon size={isActive ? 22 : 18} strokeWidth={isActive ? 2.25 : 2} />
                </span>
                <span
                  className={cn(
                    'truncate max-w-full text-[10px] leading-tight',
                    isActive ? 'font-black text-brand-700' : 'font-semibold'
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
