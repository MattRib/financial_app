import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ParsedOfxTransaction, Category } from '../../types'

interface OfxPreviewTableProps {
  transactions: ParsedOfxTransaction[]
  categories: Category[]
  duplicates: number[]
  selectedIndices: Set<number>
  onToggleSelection: (index: number) => void
  onToggleAll: () => void
  onCategoryChange: (index: number, categoryId: string) => void
  onRemove: (index: number) => void
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
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

export const OfxPreviewTable: React.FC<OfxPreviewTableProps> = ({
  transactions,
  categories,
  duplicates,
  selectedIndices,
  onToggleSelection,
  onToggleAll,
  onCategoryChange,
  onRemove,
}) => {
  const allSelected = transactions.length > 0 && selectedIndices.size === transactions.length

  const formatDate = (dateStr: string) => {
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date())
      return format(date, 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  const filteredCategories = (type: 'income' | 'expense') =>
    categories.filter((cat) => cat.type === type)

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    className="rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              {transactions.map((transaction, index) => {
                const isDuplicate = duplicates.includes(index)
                const isSelected = selectedIndices.has(index)

                return (
                  <motion.tr
                    key={index}
                    variants={rowVariants}
                    className={`
                      border-b border-slate-100 dark:border-slate-800
                      hover:bg-slate-50 dark:hover:bg-slate-800/50
                      transition-colors
                      ${isDuplicate ? 'bg-amber-50 dark:bg-amber-900/10' : ''}
                    `}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(index)}
                        className="rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
                      />
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-900 dark:text-slate-100 truncate max-w-xs">
                          {transaction.description}
                        </p>
                        {isDuplicate && (
                          <div className="flex-shrink-0">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-xs font-medium">Duplicata</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'income' ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-400">
                              Entrada
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-700 dark:text-red-400">
                              Saída
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={transaction.suggested_category_id || ''}
                        onChange={(e) => onCategoryChange(index, e.target.value)}
                        className="
                          text-sm px-3 py-1.5 rounded-lg
                          bg-slate-50 dark:bg-slate-800
                          border border-slate-200 dark:border-slate-700
                          text-slate-900 dark:text-slate-100
                          focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                          transition-colors
                        "
                      >
                        <option value="">Selecione...</option>
                        {filteredCategories(transaction.type).map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => onRemove(index)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Footer com contador */}
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <p>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {selectedIndices.size}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {transactions.length}
          </span>{' '}
          selecionadas
        </p>
        {duplicates.length > 0 && (
          <p className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            {duplicates.length} duplicata(s) detectada(s)
          </p>
        )}
      </div>
    </div>
  )
}
