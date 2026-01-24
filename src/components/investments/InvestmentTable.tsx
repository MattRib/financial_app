import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
  const [showActions, setShowActions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const typeConfig = INVESTMENT_TYPE_CONFIG[investment.type]
  const TypeIcon = typeConfig.icon

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
        <div className="relative flex justify-end" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
                    onEdit?.(investment)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowActions(false)
                    onDelete?.(investment.id)
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
