import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { INVESTMENT_TABS, type InvestmentTabId, MONTH_NAMES } from '../../constants/investments'

interface InvestmentFiltersProps {
  // Type filter
  selectedType: InvestmentTabId
  onTypeChange: (type: InvestmentTabId) => void
  // Period navigation
  month: number
  year: number
  onPrevMonth: () => void
  onNextMonth: () => void
  className?: string
}

export const InvestmentFilters: React.FC<InvestmentFiltersProps> = ({
  selectedType,
  onTypeChange,
  month,
  year,
  onPrevMonth,
  onNextMonth,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`space-y-4 ${className}`}
    >
      {/* Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {INVESTMENT_TABS.map((tab) => {
          const isSelected = selectedType === tab.id
          const Icon = tab.icon
          
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTypeChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl
                text-sm font-medium transition-colors cursor-pointer
                ${isSelected
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              <Icon 
                size={16} 
                className={isSelected && 'colorClass' in tab && tab.colorClass ? tab.colorClass : ''} 
              />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous Month Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevMonth}
          className="
            p-2 rounded-lg
            text-slate-500 dark:text-slate-400
            hover:text-slate-700 dark:hover:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors cursor-pointer
          "
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* Current Period Display */}
        <div className="
          flex items-center gap-2 px-4 py-2
          bg-slate-100 dark:bg-slate-800
          rounded-xl min-w-[180px] justify-center
        ">
          <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {MONTH_NAMES[month - 1]}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {year}
          </span>
        </div>

        {/* Next Month Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextMonth}
          className="
            p-2 rounded-lg
            text-slate-500 dark:text-slate-400
            hover:text-slate-700 dark:hover:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors cursor-pointer
          "
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  )
}
