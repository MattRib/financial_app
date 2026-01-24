import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
import { ThemeToggle } from '../ui/ThemeToggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transacoes', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Categorias', href: '/categories', icon: Tags },
  { name: 'Orcamentos', href: '/budgets', icon: Wallet },
  { name: 'Investimentos', href: '/investments', icon: TrendingUp },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Dividas', href: '/debts', icon: CreditCard },
  { name: 'Configuracoes', href: '/settings', icon: Settings },
]

// Animation variants
const navbarVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const tooltipVariants = {
  hidden: { opacity: 0, y: 4, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeIn' as const,
    },
  },
}

interface NavItemProps {
  item: (typeof navigation)[0]
  isActive: boolean
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const Icon = item.icon

  return (
    <motion.div variants={itemVariants} className="relative">
      <NavLink
        to={item.href}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative block"
      >
        <motion.div
          className={`
            relative p-3 rounded-xl
            ${isActive
              ? 'text-slate-900 dark:text-slate-50'
              : 'text-slate-400 dark:text-slate-500'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Active background indicator */}
          {isActive && (
            <motion.div
              layoutId="activeNavBackground"
              className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-xl"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
              }}
            />
          )}

          {/* Hover background */}
          <AnimatePresence>
            {isHovered && !isActive && (
              <motion.div
                className="absolute inset-0 bg-slate-100 dark:bg-slate-800/50 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <motion.div
            className="relative z-10"
            animate={{
              y: isActive ? -2 : 0,
            }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </motion.div>

          {/* Active indicator dot */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-1/2 w-1 h-1 bg-slate-900 dark:bg-slate-100 rounded-full"
                initial={{ opacity: 0, scale: 0, x: '-50%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, scale: 0, x: '-50%' }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </NavLink>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              px-2.5 py-1.5
              bg-slate-900 dark:bg-slate-100
              text-white dark:text-slate-900
              text-xs font-medium rounded-lg
              whitespace-nowrap pointer-events-none
              z-50
            "
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {item.name}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FloatingNavbar: React.FC = () => {
  const location = useLocation()
  const signOut = useAuthStore((s) => s.signOut)
  const [isLogoutHovered, setIsLogoutHovered] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <motion.nav
      className="
        fixed bottom-4 left-1/2 z-50
        bg-white/20 dark:bg-slate-950/30 backdrop-blur-3xl backdrop-saturate-200
        border border-white/30 dark:border-white/10
        rounded-2xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.2)_inset]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset]
        px-2 py-2
        flex items-center gap-0.5
      "
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      style={{ x: '-50%' }}
    >
      {/* Navigation Items */}
      {navigation.map((item) => {
        const isActive = location.pathname === item.href
        return <NavItem key={item.name} item={item} isActive={isActive} />
      })}

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5"
      />

      {/* Theme Toggle */}
      <motion.div variants={itemVariants}>
        <ThemeToggle />
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1.5"
      />

      {/* Logout Button */}
      <motion.div variants={itemVariants} className="relative">
        <motion.button
          onClick={handleSignOut}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          className="relative p-3 rounded-xl text-slate-400 dark:text-slate-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Hover background */}
          <AnimatePresence>
            {isLogoutHovered && (
              <motion.div
                className="absolute inset-0 bg-rose-50 dark:bg-rose-950/30 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>

          <motion.div
            className="relative z-10"
            animate={{
              color: isLogoutHovered ? '#f43f5e' : undefined,
            }}
            transition={{ duration: 0.15 }}
          >
            <LogOut size={20} strokeWidth={2} />
          </motion.div>
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {isLogoutHovered && (
            <motion.div
              className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                px-2.5 py-1.5
                bg-slate-900 dark:bg-slate-100
                text-white dark:text-slate-900
                text-xs font-medium rounded-lg
                whitespace-nowrap pointer-events-none
                z-50
              "
              variants={tooltipVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              Sair
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  )
}

export default FloatingNavbar
