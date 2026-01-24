import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  List, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter, 
  ChevronDown, 
  X,
  Calendar,
} from 'lucide-react'
import type { DebtStatus } from '../../types'

type TabId = 'all' | DebtStatus

interface DebtFiltersProps {
  selectedTab: TabId
  debtCounts: {
    all: number
    pending: number
    paid: number
    overdue: number
  }
  filterDateStart: string
  filterDateEnd: string
  onTabChange: (tab: TabId) => void
  onDateStartChange: (date: string) => void
  onDateEndChange: (date: string) => void
  onClearFilters: () => void
}

const tabs: { id: TabId; label: string; icon: React.ElementType; colorClass?: string }[] = [
  { id: 'all', label: 'Todas', icon: List },
  { id: 'pending', label: 'Pendentes', icon: Clock, colorClass: 'text-amber-500' },
  { id: 'paid', label: 'Pagas', icon: CheckCircle, colorClass: 'text-emerald-500' },
  { id: 'overdue', label: 'Vencidas', icon: AlertTriangle, colorClass: 'text-red-500' },
]

export const DebtFilters: React.FC<DebtFiltersProps> = ({
  selectedTab,
  debtCounts,
  filterDateStart,
  filterDateEnd,
  onTabChange,
  onDateStartChange,
  onDateEndChange,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = React.useState(false)
  const hasActiveFilters = filterDateStart || filterDateEnd

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-2xl overflow-hidden
      "
    >
      {/* Tabs Row */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedTab === tab.id
            const count = debtCounts[tab.id]

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap
                  ${isActive
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon 
                  size={16} 
                  className={isActive && tab.colorClass ? tab.colorClass : ''} 
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span
                  className={`
                    ml-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${isActive
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  {count}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeDebtTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-slate-100"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 mr-3 text-sm font-medium rounded-xl transition-all cursor-pointer
            ${showFilters || hasActiveFilters
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
        >
          <Filter size={16} />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Filtrar por data de vencimento
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date Start Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Vencimento a partir de
                  </label>
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => onDateStartChange(e.target.value)}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                    "
                  />
                </div>

                {/* Date End Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Vencimento até
                  </label>
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => onDateEndChange(e.target.value)}
                    className="
                      w-full px-3 py-2.5 rounded-xl
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-slate-100 text-sm
                      focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                      transition-colors
                    "
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters}
                    className="
                      w-full px-4 py-2.5 rounded-xl
                      border border-slate-200 dark:border-slate-700
                      text-slate-600 dark:text-slate-400
                      hover:bg-white dark:hover:bg-slate-800
                      text-sm font-medium transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                      cursor-pointer
                    "
                  >
                    <X size={16} />
                    Limpar
                  </button>
                </div>
              </div>

              {/* Active Filters Tags */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filterDateStart && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                      A partir de: {new Date(filterDateStart + 'T00:00:00').toLocaleDateString('pt-BR')}
                      <button
                        onClick={() => onDateStartChange('')}
                        className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filterDateEnd && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
                      Até: {new Date(filterDateEnd + 'T00:00:00').toLocaleDateString('pt-BR')}
                      <button
                        onClick={() => onDateEndChange('')}
                        className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
