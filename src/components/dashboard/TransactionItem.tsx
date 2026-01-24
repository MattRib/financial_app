import React from 'react'
import { motion } from 'framer-motion'

interface TransactionItemProps {
  date: string
  description: string
  amount: number
  category?: {
    name: string
    color: string
    icon?: string
  }
  index?: number
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  date,
  description,
  amount,
  category,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="
        flex items-center justify-between
        p-3 rounded-lg
        border border-transparent
        hover:bg-slate-50 dark:hover:bg-slate-800/50
        hover:border-slate-200 dark:hover:border-slate-700
        transition-all duration-200
        cursor-pointer
      "
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
            {formatDate(date)}
          </span>
          {category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
              }}
            >
              {category.icon} {category.name}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
          {description || 'Sem descricao'}
        </p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-sm font-semibold text-rose-500 tabular-nums">
          -{formatCurrency(amount)}
        </p>
      </div>
    </motion.div>
  )
}
