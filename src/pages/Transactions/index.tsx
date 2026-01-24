import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MainLayout } from '../../components/layout'
import { useTransactionsStore } from '../../store/transactionsStore'
import { useCategoriesStore } from '../../store/categoriesStore'
import TransactionsList from './TransactionsList'
import type { Transaction, TransactionType } from '../../types'
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  List,
  Filter,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Transaction type configuration
const TRANSACTION_TYPES = [
  { id: 'income' as const, label: 'Entrada', icon: TrendingUp, bgColor: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-500' },
  { id: 'expense' as const, label: 'Saída', icon: TrendingDown, bgColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-700' },
]

// Items per page for pagination
const ITEMS_PER_PAGE = 10

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

  // Local state - UI control
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTab, setSelectedTab] = useState<'all' | TransactionType>('all')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterDateStart, setFilterDateStart] = useState<string>('')
  const [filterDateEnd, setFilterDateEnd] = useState<string>('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Form state
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [formType, setFormType] = useState<TransactionType>('expense')
  const [formCategoryId, setFormCategoryId] = useState<string>('')
  const [formAmount, setFormAmount] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [formTagInput, setFormTagInput] = useState<string>('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchTransactions()
    fetchCategories()
    // Fetch summary for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    fetchSummary(startOfMonth, endOfMonth)
  }, [fetchTransactions, fetchCategories, fetchSummary])

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (showModal || deleteConfirm.show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal, deleteConfirm.show])

  // Close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Filter transactions by selected tab and filters
  const filteredTransactions = useMemo(() => {
    let result = transactions

    // Filter by type (tab)
    if (selectedTab !== 'all') {
      result = result.filter((t) => t.type === selectedTab)
    }

    // Filter by category
    if (filterCategory) {
      result = result.filter((t) => t.category_id === filterCategory)
    }

    // Filter by date range
    if (filterDateStart) {
      result = result.filter((t) => t.date >= filterDateStart)
    }
    if (filterDateEnd) {
      result = result.filter((t) => t.date <= filterDateEnd)
    }

    return result
  }, [transactions, selectedTab, filterCategory, filterDateStart, filterDateEnd])

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredTransactions, currentPage])

  // Total pages
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)

  // Track previous filter values to reset page when they change
  const filterKey = `${selectedTab}-${filterCategory}-${filterDateStart}-${filterDateEnd}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)

  // Reset to first page when filters change (sync during render, not in effect)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }

  // Filter categories by form type
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === formType)
  }, [categories, formType])

  // Get selected category for preview
  const selectedCategory = useMemo(() => {
    return categories.find((cat) => cat.id === formCategoryId)
  }, [categories, formCategoryId])

  // Format currency to Brazilian Real
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Parse currency input to number
  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/\D/g, '')
    if (!numericValue) return 0
    return Number(numericValue) / 100
  }

  // Format amount input as user types
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = inputValue.replace(/\D/g, '')

    if (numericValue) {
      const numberValue = Number(numericValue) / 100
      const formatted = formatCurrency(numberValue)
      setFormAmount(formatted)
    } else {
      setFormAmount('')
    }

    if (formErrors.amount) {
      setFormErrors((prev) => ({ ...prev, amount: '' }))
    }
  }

  // Reset form
  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0])
    setFormType('expense')
    setFormCategoryId('')
    setFormAmount('')
    setFormDescription('')
    setFormTags([])
    setFormTagInput('')
    setFormErrors({})
    setSubmitError(null)
  }

  // Handle new transaction
  const handleNewTransaction = () => {
    resetForm()
    setEditingTransaction(null)
    setShowModal(true)
  }

  // Handle edit transaction
  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setFormDate(transaction.date)
    setFormType(transaction.type)
    setFormCategoryId(transaction.category_id || '')
    setFormAmount(formatCurrency(transaction.amount))
    setFormDescription(transaction.description || '')
    setFormTags(transaction.tags || [])
    setFormTagInput('')
    setFormErrors({})
    setSubmitError(null)
    setEditingTransaction(transaction)
    setShowModal(true)
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
      } catch {
        setNotification({ type: 'error', message: 'Erro ao deletar transação' })
      }
    }
  }

  // Handle tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const tag = formTagInput.trim()
      if (tag && !formTags.includes(tag) && formTags.length < 10) {
        setFormTags([...formTags, tag])
        setFormTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((tag) => tag !== tagToRemove))
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formDate) {
      errors.date = 'Data é obrigatória'
    }

    const amountValue = parseCurrency(formAmount)
    if (!formAmount || amountValue <= 0) {
      errors.amount = 'Valor deve ser maior que zero'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    try {
      const data = {
        date: formDate,
        type: formType,
        category_id: formCategoryId || undefined,
        amount: parseCurrency(formAmount),
        description: formDescription.trim() || undefined,
        tags: formTags.length > 0 ? formTags : undefined,
      }

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data)
        setNotification({ type: 'success', message: 'Transação atualizada com sucesso!' })
      } else {
        await createTransaction(data)
        setNotification({ type: 'success', message: 'Transação criada com sucesso!' })
      }

      setShowModal(false)
      setEditingTransaction(null)
      resetForm()

      // Refresh summary
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      fetchSummary(startOfMonth, endOfMonth)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar transação'
      setSubmitError(errorMessage)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false)
    setEditingTransaction(null)
    resetForm()
  }

  // Clear filters
  const handleClearFilters = () => {
    setFilterCategory('')
    setFilterDateStart('')
    setFilterDateEnd('')
  }

  // Get type info helper
  const getTypeInfo = (type: TransactionType) => {
    const typeConfig = TRANSACTION_TYPES.find((t) => t.id === type)
    return typeConfig || TRANSACTION_TYPES[1] // Default to expense
  }

  // Tab configuration
  const tabs = [
    { id: 'all' as const, label: 'Todos', icon: List },
    { id: 'income' as const, label: 'Entradas', icon: TrendingUp },
    { id: 'expense' as const, label: 'Saídas', icon: TrendingDown },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
            <p className="text-gray-500">Gerencie suas receitas e despesas</p>
          </div>
          <button
            onClick={handleNewTransaction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Plus size={20} />
            Nova Transação
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Income */}
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

            {/* Total Expense */}
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

            {/* Balance */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Saldo</p>
                  <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${summary.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Wallet size={24} className={summary.balance >= 0 ? 'text-green-600' : 'text-red-600'} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <nav className="flex -mb-px" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = selectedTab === tab.id
                  const count = tab.id === 'all'
                    ? transactions.length
                    : transactions.filter((t) => t.type === tab.id).length

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${
                          isActive
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon size={16} />
                      {tab.label}
                      <span
                        className={`
                          ml-1 px-2 py-0.5 rounded-full text-xs
                          ${
                            isActive
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-gray-100 text-gray-600'
                          }
                        `}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </nav>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 mr-4 text-sm font-medium rounded-md transition-colors ${
                  showFilters || filterCategory || filterDateStart || filterDateEnd
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter size={16} />
                Filtros
                {(filterCategory || filterDateStart || filterDateEnd) && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Start Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Date End Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
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
          loading={loading}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteClick}
          onCreateFirst={handleNewTransaction}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de{' '}
              {filteredTransactions.length} transações
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Modal - Create/Edit Transaction */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            {/* Background overlay with blur */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all"
              onClick={handleModalClose}
            />

            {/* Modal panel */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto px-6 py-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                </h3>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Date Field */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Data <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value)
                      if (formErrors.date) {
                        setFormErrors((prev) => ({ ...prev, date: '' }))
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.date ? 'border-red-600' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.date && <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>}
                </div>

                {/* Type Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TRANSACTION_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = formType === type.id
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setFormType(type.id)
                            setFormCategoryId('') // Reset category when type changes
                          }}
                          className={`px-3 py-3 rounded-md border-2 transition-colors ${
                            isSelected
                              ? `${type.bgColor} ${type.borderColor} ${type.textColor}`
                              : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <Icon size={20} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Category Field */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    id="category"
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <div className="mt-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: `${selectedCategory.color}20`,
                          color: selectedCategory.color,
                        }}
                      >
                        {selectedCategory.icon} {selectedCategory.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Amount Field */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Valor <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={formAmount}
                    onChange={handleAmountChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-medium ${
                      formErrors.amount ? 'border-red-600' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.amount && <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>}
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    id="description"
                    type="text"
                    placeholder="Ex: Compras no supermercado"
                    value={formDescription}
                    onChange={(e) => {
                      if (e.target.value.length <= 255) {
                        setFormDescription(e.target.value)
                      }
                    }}
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="mt-1 flex justify-end">
                    <p className={`text-xs ${formDescription.length >= 240 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {formDescription.length}/255
                    </p>
                  </div>
                </div>

                {/* Tags Field */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    placeholder="Digite uma tag e pressione Enter"
                    value={formTagInput}
                    onChange={(e) => setFormTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {formTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Máximo de 10 tags
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: selectedCategory ? `${selectedCategory.color}20` : '#f3f4f6',
                          color: selectedCategory?.color || '#6b7280',
                        }}
                      >
                        {selectedCategory?.icon || '📋'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formDescription || 'Descrição da transação'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formDate ? new Date(formDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${formType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formType === 'income' ? '+' : '-'} {formAmount || 'R$ 0,00'}
                      </p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getTypeInfo(formType).bgColor} ${getTypeInfo(formType).textColor}`}>
                        {formType === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {getTypeInfo(formType).label}
                      </span>
                    </div>
                  </div>
                  {formTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {formTags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Salvando...' : editingTransaction ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6">
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all"
                onClick={() => setDeleteConfirm({ id: '', show: false })}
              />
              <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 rounded-xl">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                    {(() => {
                      const transaction = transactions.find((t) => t.id === deleteConfirm.id)
                      if (!transaction) return null
                      return (
                        <span className="block mt-3 p-3 bg-gray-50 rounded-md">
                          <span className="block font-medium text-gray-900">
                            {transaction.description || 'Sem descrição'}
                          </span>
                          <span className={`block text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </span>
                        </span>
                      )
                    })()}
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirm({ id: '', show: false })}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-colors"
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
