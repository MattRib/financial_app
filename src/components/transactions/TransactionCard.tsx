import React from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import type { Transaction } from '../../types'

interface TransactionCardProps {
  transaction: Transaction
  index?: number
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

// Format currency to Brazilian Real
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Format date to Brazilian format
const formatDate = (dateString: string): string => {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  index = 0,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = React.useState(false)
  const isIncome = transaction.type === 'income'
  const category = transaction.categories

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="
        flex items-center gap-4 p-4
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        rounded-2xl
        hover:border-slate-300 dark:hover:border-slate-700
        transition-colors duration-150
      "
    >
      {/* Left: Category Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{
          backgroundColor: category ? `${category.color}15` : 'rgb(241 245 249)',
          color: category?.color || 'rgb(148 163 184)',
        }}
      >
        {category?.icon || '📋'}
      </div>

      {/* Center: Description + Meta */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {transaction.description || 'Sem descrição'}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {/* Category badge */}
          {category && (
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}
          {/* Date */}
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatDate(transaction.date)}
          </span>
        </div>
        {/* Tags */}
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {transaction.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded"
              >
                #{tag}
              </span>
            ))}
            {transaction.tags.length > 3 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                +{transaction.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Amount + Type + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Amount & Type */}
        <div className="text-right">
          <p
            className={`text-sm font-semibold tabular-nums ${
              isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'
            }`}
          >
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            {isIncome ? (
              <TrendingUp size={12} className="text-emerald-500" />
            ) : (
              <TrendingDown size={12} className="text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'
              }`}
            >
              {isIncome ? 'Entrada' : 'Saída'}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            onBlur={() => setTimeout(() => setShowActions(false), 150)}
            className="
              p-2 rounded-lg
              text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800
              transition-colors cursor-pointer
            "
          >
            <MoreHorizontal size={18} />
          </button>

          {/* Dropdown Menu */}
          {showActions && (
            <div
              className="
                absolute right-0 top-full mt-1 z-10
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-xl shadow-lg
                py-1 min-w-[140px]
                animate-in fade-in zoom-in-95 duration-150
              "
            >
              <button
                onClick={() => {
                  setShowActions(false)
                  onEdit(transaction)
                }}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-slate-700 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-slate-700
                  transition-colors cursor-pointer
                "
              >
                <Edit2 size={15} />
                Editar
              </button>
              <button
                onClick={() => {
                  setShowActions(false)
                  onDelete(transaction.id)
                }}
                className="
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-sm text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  transition-colors cursor-pointer
                "
              >
                <Trash2 size={15} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton for loading state
export const TransactionCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    className="
      flex items-center gap-4 p-4
      bg-white dark:bg-slate-900
      border border-slate-200 dark:border-slate-800
      rounded-2xl
    "
  >
    {/* Icon skeleton */}
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
    
    {/* Content skeleton */}
    <div className="flex-1 space-y-2">
      <div className="w-40 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
    
    {/* Amount skeleton */}
    <div className="flex items-center gap-3 shrink-0">
      <div className="text-right space-y-1">
        <div className="w-24 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse ml-auto" />
        <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse ml-auto" />
      </div>
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </div>
  </motion.div>
)
