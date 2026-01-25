import React from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Investment } from '../../types'
import { INVESTMENT_TYPE_CONFIG } from '../../constants/investments'
import { formatCurrency } from '../../hooks/useTransaction'

interface InvestmentTableProps {
  investments: Investment[]
  onEdit?: (investment: Investment) => void
  onDelete?: (id: string) => void
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

interface TableRowProps {
  investment: Investment
  onEdit?: (investment: Investment) => void
  onDelete?: (id: string) => void
}

const TableRow: React.FC<TableRowProps> = ({ investment, onEdit, onDelete }) => {
  const typeConfig = INVESTMENT_TYPE_CONFIG[investment.type]
  const TypeIcon = typeConfig.icon

  // Format date
  const formattedDate = new Date(investment.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <motion.tr
      variants={rowVariants}
      className="
        border-b border-slate-100 dark:border-slate-800
        hover:bg-slate-50 dark:hover:bg-slate-800/50
        transition-colors
      "
    >
      {/* Name & Type */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeConfig.bgColor}`}
          >
            <TypeIcon size={18} className={typeConfig.iconColor} />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {investment.name}
            </p>
            <span className={`text-xs font-medium ${typeConfig.textColor}`}>
              {typeConfig.label}
            </span>
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="py-4 px-4">
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
          {formatCurrency(investment.amount)}
        </span>
      </td>

      {/* Date */}
      <td className="py-4 px-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formattedDate}
        </span>
      </td>

      {/* Notes */}
      <td className="py-4 px-4 max-w-[200px]">
        <span className="text-sm text-slate-500 dark:text-slate-400 truncate block">
          {investment.notes || '-'}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 px-4">
        <div className="flex items-center justify-end gap-1">
          {/* Edit Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit?.(investment)}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            title="Editar"
          >
            <Pencil size={16} />
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete?.(investment.id)}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            title="Excluir"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  )
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  investments,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Investimento
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Data
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Notas
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {investments.map((investment) => (
              <TableRow
                key={investment.id}
                investment={investment}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}

// Skeleton for loading state
export const InvestmentTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Investimento
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Valor
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Data
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Notas
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr
              key={i}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-28 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="w-24 h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4">
                <div className="w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4">
                <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </td>
              <td className="py-4 px-4">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
