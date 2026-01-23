import React from 'react'
import type { Transaction } from '../../types'
import { Edit2, Trash2, TrendingUp, TrendingDown, Plus } from 'lucide-react'

interface TransactionsListProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onCreateFirst?: () => void
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
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Memoized transaction row component
const TransactionRow = React.memo<{
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}>(({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income'

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Date */}
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(transaction.date)}
      </td>

      {/* Description */}
      <td className="px-4 py-4 text-sm text-gray-900">
        <div className="max-w-xs truncate">
          {transaction.description || '-'}
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-4 whitespace-nowrap">
        {transaction.categories ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: `${transaction.categories.color}20`,
              color: transaction.categories.color,
            }}
          >
            <span>{transaction.categories.icon}</span>
            <span>{transaction.categories.name}</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400">Sem categoria</span>
        )}
      </td>

      {/* Type */}
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
            isIncome
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {isIncome ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isIncome ? 'Entrada' : 'Saída'}
        </span>
      </td>

      {/* Amount */}
      <td className="px-4 py-4 whitespace-nowrap text-right">
        <span
          className={`text-sm font-semibold ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors"
            title="Editar transação"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
            title="Deletar transação"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
})

TransactionRow.displayName = 'TransactionRow'

const TransactionsList = React.memo<TransactionsListProps>(({
  transactions,
  loading,
  onEdit,
  onDelete,
  onCreateFirst,
}) => {
  // Loading skeleton - table format
  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
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
              {Array.from({ length: 8 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 w-24 bg-gray-200 rounded ml-auto"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma transação encontrada
          </h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Comece registrando suas transações para acompanhar suas finanças
          </p>
          {onCreateFirst && (
            <button
              onClick={onCreateFirst}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus size={20} />
              Criar primeira transação
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
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
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.transactions === nextProps.transactions &&
    prevProps.loading === nextProps.loading &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onCreateFirst === nextProps.onCreateFirst
  )
})

TransactionsList.displayName = 'TransactionsList'

export default TransactionsList
