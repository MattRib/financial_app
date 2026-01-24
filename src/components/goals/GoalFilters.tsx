import React from 'react'
import { GOAL_TABS, GOAL_CATEGORY_OPTIONS, type GoalTabId } from '../../constants/goals'
import type { GoalCategory } from '../../types'

interface GoalFiltersProps {
  statusFilter: GoalTabId
  categoryFilter: GoalCategory | 'all'
  onStatusChange: (status: GoalTabId) => void
  onCategoryChange: (category: GoalCategory | 'all') => void
}

export const GoalFilters: React.FC<GoalFiltersProps> = ({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {GOAL_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = statusFilter === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }
              `}
            >
              <Icon 
                size={16} 
                className={isActive && tab.colorClass ? tab.colorClass : ''} 
              />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Category filter */}
      <div className="w-full sm:w-auto">
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value as GoalCategory | 'all')}
          className={`
            w-full sm:w-48 px-3 py-2 text-sm rounded-lg
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-slate-700 dark:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600
            focus:border-transparent
            transition-colors duration-200
            cursor-pointer
          `}
        >
          <option value="all">Todas categorias</option>
          {GOAL_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
