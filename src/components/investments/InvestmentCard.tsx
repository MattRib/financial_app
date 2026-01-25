import React from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, Calendar } from 'lucide-react'
import type { Investment } from '../../types'
import { INVESTMENT_TYPE_CONFIG } from '../../constants/investments'
import { formatCurrency } from '../../hooks/useTransaction'

interface InvestmentCardProps {
  investment: Investment
  index?: number
  onEdit?: (investment: Investment) => void
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

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  index = 0,
  onEdit,
  onDelete,
}) => {
  const typeConfig = INVESTMENT_TYPE_CONFIG[investment.type]
  const TypeIcon = typeConfig.icon

  // Format date
  const formattedDate = new Date(investment.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })

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
          {/* Type Icon */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.bgColor}`}
          >
            <TypeIcon size={20} className={typeConfig.iconColor} />
          </div>
          
          {/* Name & Type */}
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {investment.name}
            </h3>
            <span className={`text-xs font-medium ${typeConfig.textColor}`}>
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit?.(investment)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            title="Editar"
          >
            <Pencil size={16} />
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete?.(investment.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            title="Excluir"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Amount & Date */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatCurrency(investment.amount)}
        </span>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Calendar size={14} />
          <span className="text-xs">{formattedDate}</span>
        </div>
      </div>

      {/* Notes (if exists) */}
      {investment.notes && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {investment.notes}
        </p>
      )}
    </motion.div>
  )
}

// Skeleton for loading state
export const InvestmentCardSkeleton: React.FC<{ index?: number }> = ({ index = 0 }) => (
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
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          <div className="w-28 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    </div>
    
    {/* Amount & Date skeleton */}
    <div className="flex items-center justify-between">
      <div className="w-24 h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      <div className="w-16 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
    </div>
  </motion.div>
)
