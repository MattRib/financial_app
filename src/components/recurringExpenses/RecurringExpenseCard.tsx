import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Trash2 } from 'lucide-react'
import type { RecurringExpenseSummary } from '../../types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RecurringExpenseCardProps {
  expense: RecurringExpenseSummary
  index: number
  onDelete: (groupId: string) => void
  formatCurrency: (value: number) => string
}

export const RecurringExpenseCard: React.FC<RecurringExpenseCardProps> = ({
  expense,
  index,
  onDelete,
  formatCurrency,
}) => {
  const progressPercentage =
    (expense.completed_recurrences / expense.total_recurrences) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02 }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl p-5
        shadow-sm hover:shadow-md
        transition-shadow cursor-pointer
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {expense.category && (
              <span className="text-lg">{expense.category.icon}</span>
            )}
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {expense.description}
            </h3>
          </div>
          {expense.category && (
            <span
              className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
              style={{
                backgroundColor: `${expense.category.color}20`,
                color: expense.category.color,
              }}
            >
              {expense.category.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(expense.recurring_group_id)
            }}
            className="
              p-2 rounded-lg
              text-slate-400 dark:text-slate-500
              hover:bg-red-50 dark:hover:bg-red-900/20
              hover:text-red-600 dark:hover:text-red-400
              transition-colors
            "
            aria-label="Remover despesa recorrente"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatCurrency(expense.monthly_amount)}
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">
            / mês
          </span>
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Total: {formatCurrency(expense.total_amount)} (
          {expense.total_recurrences} meses)
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
          <span>{expense.completed_recurrences} pagas</span>
          <span>{expense.pending_recurrences} pendentes</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{
              duration: 0.8,
              delay: 0.2 + index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={`h-full ${
              expense.type === 'expense'
                ? 'bg-red-500 dark:bg-red-600'
                : 'bg-emerald-500 dark:bg-emerald-600'
            }`}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>
            {format(new Date(expense.first_date), 'MMM yyyy', {
              locale: ptBR,
            })}{' '}
            até{' '}
            {format(new Date(expense.last_date), 'MMM yyyy', { locale: ptBR })}
          </span>
        </div>
        {!expense.is_active && (
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">
            Incompleto
          </span>
        )}
      </div>
    </motion.div>
  )
}

// Skeleton Loading State
export const RecurringExpenseCardSkeleton: React.FC<{ index: number }> = ({
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-xl p-5
      "
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
      <div className="mt-3 h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    </motion.div>
  )
}
