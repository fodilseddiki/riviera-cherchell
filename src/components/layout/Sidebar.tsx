'use client'
// components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, FileText, CreditCard,
  HardHat, User, LogOut, ChevronRight, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoleUtilisateur } from '@/types'
import { LABELS_ROLE } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: RoleUtilisateur[]
}

const NAV: NavItem[] = [
  { href: '/dashboard',     label: 'Tableau de bord',    icon: LayoutDashboard, roles: ['directeur','agent_commercial','comptable'] },
  { href: '/ventes',        label: 'Ventes & unités',    icon: Building2,       roles: ['directeur','agent_commercial'] },
  { href: '/contrats',      label: 'Contrats',            icon: FileText,        roles: ['directeur','agent_commercial','comptable'] },
  { href: '/paiements',     label: 'Paiements',           icon: CreditCard,      roles: ['directeur','comptable','agent_commercial'] },
  { href: '/chantier',      label: 'Suivi chantier',      icon: HardHat,         roles: ['directeur','responsable_chantier'] },
  { href: '/clients',       label: 'Acheteurs',           icon: Users,           roles: ['directeur','agent_commercial'] },
  { href: '/client',        label: 'Mon espace',          icon: User,            roles: ['client'] },
]

interface SidebarProps {
  role: RoleUtilisateur
  nom: string
  prenom: string
  onLogout: () => void
}

export default function Sidebar({ role, nom, prenom, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const visibleNav = NAV.filter(item => item.roles.includes(role))

  return (
    <aside className="w-60 min-h-screen bg-rc-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-rc-800">
        <div className="font-display text-lg font-bold leading-tight">
          Riviera<br />
          <span className="text-sand-400">Cherchell</span>
        </div>
        <div className="text-rc-400 text-xs mt-1">Gestion immobilière</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleNav.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                active
                  ? 'bg-rc-400 text-white font-medium'
                  : 'text-rc-300 hover:bg-rc-800 hover:text-white'
              )}
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-rc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-rc-600 flex items-center justify-center text-xs font-bold text-white">
            {prenom.charAt(0)}{nom.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{prenom} {nom}</div>
            <div className="text-xs text-rc-400">{LABELS_ROLE[role]}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rc-400 hover:bg-rc-800 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
