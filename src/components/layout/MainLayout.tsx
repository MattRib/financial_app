import React from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import FloatingNavbar from './FloatingNavbar'
import { ThemeToggle } from '../ui/ThemeToggle'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Top Right Actions - Theme Toggle & Notifications */}
      <div className="fixed top-4 right-4 lg:right-8 z-50 flex items-center gap-2">
        <ThemeToggle />
        <motion.button
          className="relative p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {/* Badge placeholder for future notifications count */}
          {/* <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-medium rounded-full flex items-center justify-center">3</span> */}
        </motion.button>
      </div>

      {/* Floating Dock Navbar */}
      <FloatingNavbar />

      {/* Main content - with bottom padding for dock navbar */}
      <main className="min-h-screen px-4 lg:px-8 xl:px-16 pt-8 pb-28 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}

export default MainLayout
