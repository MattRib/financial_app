import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { formatPercentage, formatCurrency } from '../../utils/formatters'

interface BudgetAlertProps {
  categoryName: string
  percentage: number
  spent: number
  total: number
  index?: number
}

export const BudgetAlert: React.FC<BudgetAlertProps> = ({
  categoryName,
  percentage,
  spent,
  total,
  index = 0,
}) => {
  const isOver = percentage >= 100

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`
        flex items-center gap-3 p-4 rounded-lg border
        ${
          isOver
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
        }
      `}
    >
      <div
        className={`
        p-2 rounded-full
        ${
          isOver
            ? 'bg-rose-100 dark:bg-rose-900/50'
            : 'bg-amber-100 dark:bg-amber-900/50'
        }
      `}
      >
        <AlertTriangle
          size={18}
          className={
            isOver
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-amber-600 dark:text-amber-400'
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {formatPercentage(percentage)} do orcamento de {categoryName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {formatCurrency(spent)} de {formatCurrency(total)}
        </p>
      </div>
    </motion.div>
  )
}
