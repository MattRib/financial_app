import React from 'react'
import type { Budget } from '../../types'
import { Edit2, Trash2 } from 'lucide-react'

interface BudgetsListProps {
  budgets: Budget[]
  loading: boolean
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

const BudgetsList: React.FC<BudgetsListProps> = ({
  budgets,
  loading,
  onEdit,
  onDelete,
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calculate percentage
  const calculatePercentage = (spent: number, amount: number): number => {
    if (amount === 0) return 0
    return Math.min(100, Math.round((spent / amount) * 100))
  }

  // Get progress bar color based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Get progress bar text color
  const getProgressTextColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Loading state
  if (loading && budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 mb-2">Nenhum orçamento encontrado</p>
          <p className="text-sm text-gray-400">Comece criando um novo orçamento</p>
        </div>
      </div>
    )
  }

  // Budget row/card component
  const BudgetItem = ({ budget }: { budget: Budget }) => {
    const spent = budget.spent || 0
    const amount = budget.amount
    const remaining = budget.remaining !== undefined ? budget.remaining : amount - spent
    const percentage = budget.percentage !== undefined 
      ? budget.percentage 
      : calculatePercentage(spent, amount)
    
    const categoryName = budget.category?.name || 'Orçamento Geral'
    const categoryColor = budget.category?.color || '#6b7280'
    const categoryIcon = budget.category?.icon || '📁'

    return (
      <>
        {/* Desktop Table Row */}
        <tr className="hidden md:table-row hover:bg-gray-50 border-b border-gray-200">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span
                className="text-lg"
                style={{ color: categoryColor }}
              >
                {categoryIcon}
              </span>
              <span className="text-sm font-medium text-gray-900">{categoryName}</span>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatCurrency(amount)}
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatCurrency(spent)}
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getProgressColor(percentage)}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${getProgressTextColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remaining)}
            </span>
          </td>
          <td className="px-4 py-4 whitespace-nowrap text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onEdit(budget)}
                className="text-indigo-600 hover:text-indigo-900 p-1"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(budget.id)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Deletar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>

        {/* Mobile Card */}
        <div className="md:hidden bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="text-xl"
                style={{ color: categoryColor }}
              >
                {categoryIcon}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{categoryName}</h3>
                <p className="text-xs text-gray-500">
                  {formatCurrency(amount)} orçado
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(budget)}
                className="text-indigo-600 hover:text-indigo-900 p-1"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(budget.id)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Deletar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Gasto: {formatCurrency(spent)}</span>
              <span className={`text-xs font-medium ${getProgressTextColor(percentage)}`}>
                {percentage}%
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${getProgressColor(percentage)}`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>

          {/* Remaining */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-600">Saldo disponível:</span>
            <span className={`text-sm font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => (
                <BudgetItem key={budget.id} budget={budget} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {budgets.map((budget) => (
          <BudgetItem key={budget.id} budget={budget} />
        ))}
      </div>
    </>
  )
}

export default BudgetsList

