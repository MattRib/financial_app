import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  List,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  CalendarRange,
} from 'lucide-react'
import type { TransactionType, Category, DateFilterMode, DatePreset } from '../../types'
import { getMonthLabel, DATE_PRESETS } from '../../constants'

type TabId = 'all' | TransactionType

interface TransactionFiltersProps {
  selectedTab: TabId
  transactionCounts: {
    all: number
    income: number
    expense: number
  }
  categories: Category[]
  filterCategory: string
  filterDateStart: string
  filterDateEnd: string
  month: number
  year: number
  dateFilterMode: DateFilterMode
  activeFiltersCount: number
  onTabChange: (tab: TabId) => void
  onCategoryChange: (categoryId: string) => void
  onDateStartChange: (date: string) => void
  onDateEndChange: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onCurrentMonth: () => void
  onDateFilterModeChange: (mode: DateFilterMode) => void
  onApplyPreset: (preset: DatePreset) => void
  onClearFilters: () => void
}

const tabs: { id: TabId; label: string; icon: React.ElementType; colorClass?: string }[] = [
  { id: 'all', label: 'Todos', icon: List },
  { id: 'income', label: 'Entradas', icon: TrendingUp, colorClass: 'text-emerald-500' },
  { id: 'expense', label: 'Saídas', icon: TrendingDown, colorClass: 'text-red-500' },
]

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  selectedTab,
  transactionCounts,
  categories,
  filterCategory,
  filterDateStart,
  filterDateEnd,
  month,
  year,
  dateFilterMode,
  activeFiltersCount,
  onTabChange,
  onCategoryChange,
  onDateStartChange,
  onDateEndChange,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onDateFilterModeChange,
  onApplyPreset,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = React.useState(false)
  const hasActiveFilters = activeFiltersCount > 0

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
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedTab === tab.id
            const count = transactionCounts[tab.id]

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer
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
                {tab.label}
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
                    layoutId="activeTab"
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
          Filtros
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {activeFiltersCount}
            </span>
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Period Selection Row */}
              <div className="flex items-center gap-2">
                {/* Mode Toggle Compact */}
                <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg">
                  <button
                    onClick={() => onDateFilterModeChange('month')}
                    className={`
                      p-1.5 rounded-md transition-all cursor-pointer
                      ${
                        dateFilterMode === 'month'
                          ? 'bg-white dark:bg-slate-800 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }
                    `}
                    title="Navegação mensal"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDateFilterModeChange('custom')}
                    className={`
                      p-1.5 rounded-md transition-all cursor-pointer
                      ${
                        dateFilterMode === 'custom'
                          ? 'bg-white dark:bg-slate-800 shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }
                    `}
                    title="Período customizado"
                  >
                    <CalendarRange className="w-4 h-4" />
                  </button>
                </div>

                {/* Month Navigation or Custom Dates */}
                {dateFilterMode === 'month' ? (
                  <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onPrevMonth}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </motion.button>

                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 px-2">
                      {getMonthLabel(month)} {year}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onNextMonth}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      aria-label="Próximo mês"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filterDateStart}
                      onChange={(e) => onDateStartChange(e.target.value)}
                      placeholder="Início"
                      className="
                        px-2 py-1.5 rounded-lg text-xs
                        bg-white dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-1 focus:ring-primary-500 focus:border-transparent
                        transition-colors
                      "
                    />
                    <input
                      type="date"
                      value={filterDateEnd}
                      onChange={(e) => onDateEndChange(e.target.value)}
                      placeholder="Fim"
                      className="
                        px-2 py-1.5 rounded-lg text-xs
                        bg-white dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        text-slate-900 dark:text-slate-100
                        focus:ring-1 focus:ring-primary-500 focus:border-transparent
                        transition-colors
                      "
                    />
                  </div>
                )}
              </div>

              {/* Quick Presets - Horizontal Scroll */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {DATE_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onApplyPreset(preset.value as DatePreset)}
                    className="
                      flex-shrink-0 px-2.5 py-1 text-xs rounded-md whitespace-nowrap
                      bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                      hover:bg-primary-100 dark:hover:bg-primary-900/30
                      hover:text-primary-700 dark:hover:text-primary-300
                      transition-all duration-150 cursor-pointer
                    "
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>

              {/* Category Filter Compact */}
              <div className="flex items-center gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="
                    flex-1 px-2.5 py-1.5 rounded-lg text-xs
                    bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-slate-900 dark:text-slate-100
                    focus:ring-1 focus:ring-primary-500 focus:border-transparent
                    transition-colors
                  "
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>

                {/* Clear Button Compact */}
                {hasActiveFilters && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClearFilters}
                    className="
                      px-2.5 py-1.5 rounded-lg text-xs font-medium
                      border border-slate-200 dark:border-slate-700
                      text-slate-600 dark:text-slate-400
                      hover:bg-white dark:hover:bg-slate-800
                      transition-colors cursor-pointer flex-shrink-0
                    "
                    title="Limpar filtros"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </div>

              {/* Active Filters Tags - More Compact */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const today = new Date()
                    const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear()

                    return (
                      <>
                        {!isCurrentMonth && dateFilterMode === 'month' && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium"
                          >
                            {getMonthLabel(month)} {year}
                            <button
                              onClick={onCurrentMonth}
                              className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5 transition-colors cursor-pointer"
                              aria-label="Remover"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}

                        {dateFilterMode === 'custom' && filterDateStart && filterDateEnd && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium"
                          >
                            {new Date(filterDateStart + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {new Date(filterDateEnd + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            <button
                              onClick={onCurrentMonth}
                              className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5 transition-colors cursor-pointer"
                              aria-label="Remover"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}

                        {filterCategory && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium"
                          >
                            {categories.find((c) => c.id === filterCategory)?.name}
                            <button
                              onClick={() => onCategoryChange('')}
                              className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5 transition-colors cursor-pointer"
                              aria-label="Remover"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
