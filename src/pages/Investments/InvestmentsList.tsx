import React from 'react'
import type { Investment, InvestmentType } from '../../types'
import { Edit2, Trash2 } from 'lucide-react'

interface InvestmentsListProps {
  investments: Investment[]
  loading: boolean
  onEdit: (investment: Investment) => void
  onDelete: (id: string) => void
}

// Helper functions (outside component for better performance)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const getTypeIcon = (type: InvestmentType) => {
  switch (type) {
    case 'renda_fixa':
      return '🏦'
    case 'renda_variavel':
      return '📈'
    case 'cripto':
      return '₿'
    case 'outros':
      return '💼'
    default:
      return '💼'
  }
}

const getTypeLabel = (type: InvestmentType) => {
  switch (type) {
    case 'renda_fixa':
      return 'Renda Fixa'
    case 'renda_variavel':
      return 'Renda Variável'
    case 'cripto':
      return 'Criptomoedas'
    case 'outros':
      return 'Outros'
    default:
      return type
  }
}

const getTypeBadgeClasses = (type: InvestmentType) => {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium'
  
  switch (type) {
    case 'renda_fixa':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'renda_variavel':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'cripto':
      return `${baseClasses} bg-orange-100 text-orange-800`
    case 'outros':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Memoized investment item component
const InvestmentItem = React.memo<{
  investment: Investment
  onEdit: (investment: Investment) => void
  onDelete: (id: string) => void
}>(({ investment, onEdit, onDelete }) => {
  return (
    <>
      {/* Desktop Table Row */}
      <tr className="hidden md:table-row hover:bg-gray-50 border-b border-gray-200">
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
          {formatDate(investment.date)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          <span className="max-w-xs truncate block">{investment.name}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className={getTypeBadgeClasses(investment.type)}>
            {getTypeIcon(investment.type)} {getTypeLabel(investment.type)}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-green-600">
          {formatCurrency(investment.amount)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onEdit(investment)}
              className="text-indigo-600 hover:text-indigo-900 p-1"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(investment.id)}
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
        {/* Header com nome e ações */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{investment.name}</h3>
            <p className="text-xs text-gray-500">{formatDate(investment.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(investment)}
              className="text-indigo-600 hover:text-indigo-900 p-1"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(investment.id)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Deletar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Badge do tipo */}
        <div className="mb-3">
          <span className={getTypeBadgeClasses(investment.type)}>
            {getTypeIcon(investment.type)} {getTypeLabel(investment.type)}
          </span>
        </div>

        {/* Valor */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-600">Valor investido:</span>
          <span className="text-sm font-semibold text-green-600">
            {formatCurrency(investment.amount)}
          </span>
        </div>

        {/* Notas (se existir) */}
        {investment.notes && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">{investment.notes}</p>
          </div>
        )}
      </div>
    </>
  )
})

InvestmentItem.displayName = 'InvestmentItem'

const InvestmentsList = React.memo<InvestmentsListProps>(({
  investments,
  loading,
  onEdit,
  onDelete,
}) => {

  // Loading state
  if (loading && investments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Carregando investimentos...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 mb-2">Nenhum investimento cadastrado</p>
          <p className="text-sm text-gray-400">Comece adicionando seu primeiro investimento</p>
        </div>
      </div>
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
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map((investment) => (
                <InvestmentItem
                  key={investment.id}
                  investment={investment}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {investments.map((investment) => (
          <InvestmentItem
            key={investment.id}
            investment={investment}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to avoid unnecessary re-renders
  return (
    prevProps.investments === nextProps.investments &&
    prevProps.loading === nextProps.loading &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  )
})

InvestmentsList.displayName = 'InvestmentsList'

export default InvestmentsList
