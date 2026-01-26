import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthYearSelectorProps {
  month: number
  year: number
  onPrevMonth: () => void
  onNextMonth: () => void
}

export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  month,
  year,
  onPrevMonth,
  onNextMonth,
}) => {
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(year, month - 1),
  )

  return (
    <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <motion.button
        onClick={onPrevMonth}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} />
      </motion.button>

      <div className="text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 capitalize">
          {monthName} {year}
        </p>
      </div>

      <motion.button
        onClick={onNextMonth}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
      >
        <ChevronRight size={20} />
      </motion.button>
    </div>
  )
}
