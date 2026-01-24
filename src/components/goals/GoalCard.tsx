import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, Plus, CheckCircle2, Calendar, AlertTriangle } from 'lucide-react'
import { GoalProgressBar } from './GoalProgressBar'
import {
  GOAL_CATEGORY_CONFIG,
  GOAL_STATUS_CONFIG,
  getDaysRemaining,
  calculateProgress,
  formatGoalCurrency,
} from '../../constants/goals'
import type { Goal } from '../../types'

interface GoalCardProps {
  goal: Goal
  index?: number
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onAddProgress: (goal: Goal) => void
  onMarkComplete: (id: string) => void
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index = 0,
  onEdit,
  onDelete,
  onAddProgress,
  onMarkComplete,
}) => {
  const [showActions, setShowActions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const categoryConfig = goal.category
    ? GOAL_CATEGORY_CONFIG[goal.category]
    : GOAL_CATEGORY_CONFIG.other
  const statusConfig = GOAL_STATUS_CONFIG[goal.status]
  const progress = calculateProgress(goal.current_amount, goal.target_amount)
  const daysInfo = getDaysRemaining(goal.target_date)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  const isActive = goal.status === 'active'
  const isCompleted = goal.status === 'completed'

  return (
    <div
      className={`
        relative p-5 rounded-xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        shadow-sm hover:shadow-md
        transition-all duration-200
        hover:scale-[1.02]
        ${isCompleted ? 'opacity-75' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Category emoji */}
          <div
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-lg
              ${categoryConfig.bgColor}
            `}
          >
            {categoryConfig.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {goal.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {categoryConfig.label}
            </p>
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowActions(!showActions)}
            className={`
              p-1.5 rounded-lg transition-colors cursor-pointer
              hover:bg-slate-100 dark:hover:bg-slate-800
              text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
            `}
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className={`
                  absolute right-0 top-full mt-1 z-20
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  rounded-lg shadow-lg py-1 min-w-[160px]
                `}
              >
                <button
                  onClick={() => {
                    onEdit(goal)
                    setShowActions(false)
                  }}
                  className={`
                    w-full px-3 py-2 text-left text-sm flex items-center gap-2
                    text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-slate-700/50
                    cursor-pointer
                  `}
                >
                  <Pencil size={14} />
                  Editar
                </button>

                {isActive && (
                  <>
                    <button
                      onClick={() => {
                        onAddProgress(goal)
                        setShowActions(false)
                      }}
                      className={`
                        w-full px-3 py-2 text-left text-sm flex items-center gap-2
                        text-emerald-600 dark:text-emerald-400
                        hover:bg-slate-50 dark:hover:bg-slate-700/50
                        cursor-pointer
                      `}
                    >
                      <Plus size={14} />
                      Adicionar progresso
                    </button>

                    <button
                      onClick={() => {
                        onMarkComplete(goal.id)
                        setShowActions(false)
                      }}
                      className={`
                        w-full px-3 py-2 text-left text-sm flex items-center gap-2
                        text-blue-600 dark:text-blue-400
                        hover:bg-slate-50 dark:hover:bg-slate-700/50
                        cursor-pointer
                      `}
                    >
                      <CheckCircle2 size={14} />
                      Marcar concluída
                    </button>
                  </>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

                <button
                  onClick={() => {
                    onDelete(goal.id)
                    setShowActions(false)
                  }}
                  className={`
                    w-full px-3 py-2 text-left text-sm flex items-center gap-2
                    text-red-600 dark:text-red-400
                    hover:bg-red-50 dark:hover:bg-red-900/20
                    cursor-pointer
                  `}
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <GoalProgressBar percentage={progress} size="md" delay={0.2 + index * 0.08} />
      </div>

      {/* Values */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Atual</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatGoalCurrency(goal.current_amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Meta</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatGoalCurrency(goal.target_amount)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Days remaining */}
        <div className="flex items-center gap-1.5">
          {daysInfo.isPast && isActive ? (
            <AlertTriangle size={14} className="text-amber-500" />
          ) : (
            <Calendar size={14} className="text-slate-400" />
          )}
          <span
            className={`text-xs ${
              daysInfo.isPast && isActive
                ? 'text-amber-600 dark:text-amber-400 font-medium'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {daysInfo.label}
          </span>
        </div>

        {/* Status badge */}
        <span
          className={`
            inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
            ${statusConfig.bgColor} ${statusConfig.textColor}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
          {statusConfig.label}
        </span>
      </div>
    </div>
  )
}

// Skeleton component for loading state
export const GoalCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`
        p-5 rounded-xl
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
      `}
    >
      {/* Header skeleton */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
      </div>

      {/* Values skeleton */}
      <div className="flex justify-between mb-3">
        <div>
          <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-1" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="text-right">
          <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-1 ml-auto" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </motion.div>
  )
}
