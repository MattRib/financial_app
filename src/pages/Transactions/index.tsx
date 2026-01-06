import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MainLayout } from '../../components/layout'
import { useTransactionsStore } from '../../store/transactionsStore'
import { useCategoriesStore } from '../../store/categoriesStore'
import TransactionForm from './TransactionForm'
import type { Transaction, TransactionFilters, TransactionType, CreateTransactionDto, UpdateTransactionDto } from '../../types'
import { Plus, Filter, X, Edit2, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

// Simple TransactionsList component
const TransactionsList = React.memo<{
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  loading: boolean
}>(({ transactions, onEdit, onDelete, loading }) => {
  if (loading && transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">Carregando transações...</p>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 mb-2">Nenhuma transação encontrada</p>
          <p className="text-sm text-gray-400">Comece adicionando uma nova transação</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.description || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {transaction.categories ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: `${transaction.categories.color}20`,
                        color: transaction.categories.color,
                      }}
                    >
                      {transaction.categories.icon} {transaction.categories.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type === 'income' ? '💰' : '💸'}
                    {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <span
                    className={
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Deletar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to avoid unnecessary re-renders
  return (
    prevProps.transactions === nextProps.transactions &&
    prevProps.loading === nextProps.loading &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  )
})

const TransactionsPage: React.FC = () => {
  // Stores
  const {
    transactions,
    summary,
    loading,
    error,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionsStore()

  const { categories, fetchCategories } = useCategoriesStore()

  // Local state
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [appliedFilters, setAppliedFilters] = useState<TransactionFilters>({})
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchTransactions(appliedFilters)
  }, [fetchTransactions, appliedFilters])

  useEffect(() => {
    if (startDate && endDate) {
      fetchSummary(startDate, endDate)
    }
  }, [fetchSummary, startDate, endDate])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Handle new transaction
  const handleNewTransaction = () => {
    setEditingTransaction(null)
    setShowForm(true)
  }

  // Handle edit transaction
  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }, [])

  // Handle delete transaction
  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirm({ id, show: true })
  }, [])

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteTransaction(deleteConfirm.id)
        setNotification({ type: 'success', message: 'Transação deletada com sucesso!' })
        setDeleteConfirm({ id: '', show: false })
        // Refetch transactions
        await fetchTransactions(appliedFilters)
      } catch {
        setNotification({ type: 'error', message: 'Erro ao deletar transação' })
      }
    }
  }

  // Handle form submit
  const handleFormSubmit = async (data: CreateTransactionDto | UpdateTransactionDto) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data as UpdateTransactionDto)
        setNotification({ type: 'success', message: 'Transação atualizada com sucesso!' })
      } else {
        await createTransaction(data as CreateTransactionDto)
        setNotification({ type: 'success', message: 'Transação criada com sucesso!' })
      }
      setShowForm(false)
      setEditingTransaction(null)
      // Refetch transactions
      await fetchTransactions(appliedFilters)
      // Refetch summary
      if (startDate && endDate) {
        await fetchSummary(startDate, endDate)
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao salvar transação' })
      throw err
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  // Handle apply filters
  const handleApplyFilters = () => {
    const newFilters: TransactionFilters = {}
    if (filters.type) newFilters.type = filters.type
    if (filters.category_id) newFilters.category_id = filters.category_id
    if (filters.start_date) {
      newFilters.start_date = filters.start_date
      setStartDate(filters.start_date)
    }
    if (filters.end_date) {
      newFilters.end_date = filters.end_date
      setEndDate(filters.end_date)
    }
    setAppliedFilters(newFilters)
    setShowFilters(false)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({})
    setAppliedFilters({})
    setStartDate(() => {
      const date = new Date()
      date.setDate(1)
      return date.toISOString().split('T')[0]
    })
    setEndDate(() => new Date().toISOString().split('T')[0])
  }

  // Close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Filter categories by type
  const filteredCategoriesByType = useMemo(() => {
    if (filters.type) {
      return categories.filter((cat) => cat.type === filters.type)
    }
    return categories
  }, [categories, filters.type])

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return transactions.slice(startIndex, endIndex)
  }, [transactions, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [appliedFilters])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
            <p className="text-gray-500">Gerenciar suas entradas e saídas</p>
          </div>
          <button
            onClick={handleNewTransaction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={20} />
            Nova Transação
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.total_income)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.total_expense)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <TrendingDown size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Saldo do Período</p>
                  <p
                    className={`text-2xl font-bold ${
                      summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Wallet size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Filter size={16} />
              Filtros
            </button>
            {Object.keys(appliedFilters).length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, type: (e.target.value || undefined) as TransactionType | undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Todos</option>
                  <option value="income">Entrada</option>
                  <option value="expense">Saída</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, category_id: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Todos</option>
                  {filteredCategoriesByType.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  De
                </label>
                <input
                  type="date"
                  value={filters.start_date || startDate}
                  onChange={(e) => {
                    setFilters({ ...filters, start_date: e.target.value || undefined })
                    setStartDate(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Até
                </label>
                <input
                  type="date"
                  value={filters.end_date || endDate}
                  onChange={(e) => {
                    setFilters({ ...filters, end_date: e.target.value || undefined })
                    setEndDate(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-4 flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div
            className={`p-4 rounded-md ${
              notification.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            <p className="text-sm">{notification.message}</p>
          </div>
        )}

        {/* Transactions List */}
        <TransactionsList
          transactions={paginatedTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        {/* Pagination */}
        {transactions.length > itemsPerPage && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
                {Math.min(currentPage * itemsPerPage, transactions.length)} de{' '}
                {transactions.length} transações
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal - Transaction Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleFormCancel}
              />

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                    </h3>
                    <button
                      onClick={handleFormCancel}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <TransactionForm
                    initialData={editingTransaction || undefined}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isLoading={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setDeleteConfirm({ id: '', show: false })}
              />
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirm({ id: '', show: false })}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default TransactionsPage

