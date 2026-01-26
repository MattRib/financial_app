import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon, action }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {action && (
        <motion.button
          whileHover={{ x: 2 }}
          onClick={action.onClick}
          className="
            text-sm text-slate-500 dark:text-slate-400
            hover:text-slate-700 dark:hover:text-slate-200
            flex items-center gap-1
            transition-colors duration-200 cursor-pointer
          "
        >
          {action.label}
          <ArrowRight size={14} />
        </motion.button>
      )}
    </div>
  )
}
