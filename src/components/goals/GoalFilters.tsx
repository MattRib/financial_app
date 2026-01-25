import React from 'react'
import { GOAL_TABS, type GoalTabId } from '../../constants/goals'

interface GoalFiltersProps {
  statusFilter: GoalTabId
  onStatusChange: (status: GoalTabId) => void
}

export const GoalFilters: React.FC<GoalFiltersProps> = ({
  statusFilter,
  onStatusChange,
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
    </div>
  )
}
