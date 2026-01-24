import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Budget } from '../../types'
import { formatCurrency } from '../../hooks/useTransaction'
import { BudgetProgressBar } from './BudgetProgressBar'
import { getProgressColor } from './budgetUtils'

interface BudgetCardProps {
  budget: Budget
  index?: number
  onEdit?: (budget: Budget) => void
  onDelete?: (id: string) => void
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  index = 0,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate values
  const spent = budget.spent ?? 0
  const percentage = budget.percentage ?? (budget.amount > 0 ? (spent / budget.amount) * 100 : 0)
  const remaining = budget.remaining ?? (budget.amount - spent)
  const isOverBudget = percentage > 100
  const colors = getProgressColor(percentage)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Category display
  const categoryIcon = budget.category?.icon ?? '💰'
  const categoryName = budget.category?.name ?? 'Orçamento Geral'
  const categoryColor = budget.category?.color ?? '#64748b'

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02 }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl p-4
        transition-shadow hover:shadow-md
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Category Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${categoryColor}20` }}
          >
            {categoryIcon}
          </div>
          
          {/* Category Name & Badge */}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">
              {categoryName}
            </h3>
            <span className={`text-xs font-medium ${colors.text}`}>
              {isOverBudget ? 'Acima do limite' : percentage >= 70 ? 'Atenção' : 'No controle'}
            </span>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </motion.button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute right-0 top-full mt-1 z-10
                  bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  rounded-lg shadow-lg
                  py-1 min-w-[120px]
                "
              >
                <button
                  onClick={() => {
                    setShowActions(false)
                    onEdit?.(budget)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowActions(false)
                    onDelete?.(budget.id)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <BudgetProgressBar
        percentage={percentage}
        spent={spent}
        total={budget.amount}
        showValues
        size="md"
        delay={0.2 + index * 0.08}
      />

      {/* Footer - Remaining */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Restante
        </span>
        <span className={`text-sm font-semibold tabular-nums ${remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
          {remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(remaining))}
        </span>
      </div>
    </motion.div>
  )
}

// Skeleton for loading state
export const BudgetCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl p-4
      "
    >
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div>
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-1.5" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>

      {/* Progress bar skeleton */}
      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-1.5" />
      <div className="flex justify-between">
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </motion.div>
  )
}
