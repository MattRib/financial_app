import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  TrendingUp,
  Target,
  CreditCard,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Categorias', href: '/categories', icon: Tags },
  { name: 'Orçamentos', href: '/budgets', icon: Wallet },
  { name: 'Investimentos', href: '/investments', icon: TrendingUp },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Dívidas', href: '/debts', icon: CreditCard },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

const FloatingNavbar: React.FC = () => {
  const location = useLocation()
  const signOut = useAuthStore((s) => s.signOut)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        bg-white/80 backdrop-blur-xl
        border border-gray-200/50
        rounded-2xl shadow-lg shadow-gray-300/30
        px-2 py-2
        flex items-center gap-1
      "
    >
      {/* Navigation Items */}
      {navigation.map((item) => {
        const isActive = location.pathname === item.href
        const Icon = item.icon

        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={`
              relative p-3 rounded-xl
              transition-all duration-200 group
              ${isActive
                ? 'bg-gradient-to-t from-indigo-500 to-indigo-400 text-white shadow-lg shadow-indigo-300/50 scale-110 -translate-y-1'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:scale-105'
              }
            `}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />

            {/* Tooltip */}
            <div className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5
              bg-gray-900 text-white text-xs font-medium rounded-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 whitespace-nowrap
              pointer-events-none
            ">
              {item.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>

            {/* Active indicator dot */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </NavLink>
        )
      })}

      {/* Divider */}
      <div className="w-px h-8 bg-gray-200 mx-1" />

      {/* Logout Button */}
      <button
        onClick={handleSignOut}
        className="
          relative p-3 rounded-xl
          text-gray-500 hover:bg-red-50 hover:text-red-500
          transition-all duration-200 group hover:scale-105
        "
      >
        <LogOut size={22} strokeWidth={2} />

        {/* Tooltip */}
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5
          bg-gray-900 text-white text-xs font-medium rounded-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 whitespace-nowrap
          pointer-events-none
        ">
          Sair
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </button>
    </nav>
  )
}

export default FloatingNavbar
