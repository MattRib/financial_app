import React from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface PremiumEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  minHeight?: number
}

export const PremiumEmptyState: React.FC<PremiumEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  minHeight,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="
        flex flex-col items-center justify-center py-12 px-6
        border border-dashed border-slate-200 dark:border-slate-700
        rounded-xl text-center
      "
      style={minHeight ? { minHeight } : undefined}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon size={24} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="
            mt-4 px-4 py-2 text-sm font-medium
            bg-slate-900 dark:bg-slate-100
            text-white dark:text-slate-900
            rounded-lg
            hover:bg-slate-800 dark:hover:bg-slate-200
            transition-colors duration-200
            cursor-pointer
          "
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
