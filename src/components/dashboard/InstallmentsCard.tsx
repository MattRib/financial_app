import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import type { InstallmentGroupSummary } from '../../types'

interface InstallmentsCardProps {
  groups: InstallmentGroupSummary[]
  loading?: boolean
  formatCurrency: (value: number) => string
}

export const InstallmentsCard: React.FC<InstallmentsCardProps> = ({
  groups,
  loading,
  formatCurrency,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="py-8 text-center">
        <CreditCard className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhuma compra parcelada
        </p>
      </div>
    )
  }

  const totalGroups = groups.length
  const totalMonthly = groups.reduce((sum, g) => sum + g.monthly_amount, 0)

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {totalGroups} {totalGroups === 1 ? 'compra parcelada' : 'compras parceladas'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {formatCurrency(totalMonthly)}/mês no total
        </p>
      </div>

      {/* Lista de grupos */}
      <div className="space-y-2">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.installment_group_id)
          const progress = (group.paid_installments / group.total_installments) * 100

          return (
            <motion.div
              key={group.installment_group_id}
              layout
              className="
                border border-slate-200 dark:border-slate-700
                rounded-xl overflow-hidden
                bg-white dark:bg-slate-900
              "
            >
              {/* Header clicável */}
              <button
                onClick={() => toggleGroup(group.installment_group_id)}
                className="
                  w-full p-3 flex items-center justify-between
                  hover:bg-slate-50 dark:hover:bg-slate-800/50
                  transition-colors
                "
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Ícone da categoria */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      backgroundColor: group.category ? `${group.category.color}20` : '#f1f5f9',
                      color: group.category?.color || '#64748b',
                    }}
                  >
                    {group.category?.icon || '🛒'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                      {group.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {group.paid_installments}/{group.total_installments} pagas • {formatCurrency(group.monthly_amount)}/mês
                    </p>
                  </div>

                  {/* Falta pagar */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Faltam {formatCurrency(group.remaining_amount)}
                    </p>
                  </div>

                  {/* Ícone expandir */}
                  <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>
              </button>

              {/* Barra de progresso */}
              <div className="px-3 pb-3">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-slate-900 dark:bg-slate-600 rounded-full"
                  />
                </div>
              </div>

              {/* Detalhes expandidos */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Valor total</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(group.total_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Pago até agora</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-500">
                          {formatCurrency(group.total_amount - group.remaining_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Categoria</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {group.category?.name || 'Sem categoria'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Período</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {new Date(group.first_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          {' → '}
                          {new Date(group.last_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
