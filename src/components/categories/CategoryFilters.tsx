import React from 'react'
import { motion } from 'framer-motion'
import { List, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import type { CategoryType } from '../../types'

type TabId = 'all' | CategoryType

interface CategoryFiltersProps {
  selectedTab: TabId
  categoryCounts: {
    all: number
    income: number
    expense: number
    investment: number
  }
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'Todos', icon: List },
  { id: 'income', label: 'Receitas', icon: TrendingUp },
  { id: 'expense', label: 'Despesas', icon: TrendingDown },
  { id: 'investment', label: 'Investimentos', icon: PiggyBank },
]

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  selectedTab,
  categoryCounts,
  onTabChange,
}) => {
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
      <div className="flex items-center justify-between">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = selectedTab === tab.id
            const count = categoryCounts[tab.id]

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon size={16} />
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
                    layoutId="activeCategoryTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-slate-100"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </motion.div>
  )
}
