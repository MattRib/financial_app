import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className={
        "relative p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 " +
        "backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 " +
        "text-slate-600 dark:text-slate-300 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 " +
        "hover:bg-white/90 dark:hover:bg-slate-700/80 transition-colors duration-200 cursor-pointer"
      }
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={false}
        animate={isDark ? { rotate: [0, 360] } : { rotate: [360, 0] }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  )
}
