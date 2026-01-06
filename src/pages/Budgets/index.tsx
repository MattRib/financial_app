import React, { useState, useEffect, useCallback } from 'react'
import { MainLayout } from '../../components/layout'
import { useBudgetsStore } from '../../store/budgetsStore'
import { useCategoriesStore } from '../../store/categoriesStore'
import BudgetsList from './BudgetsList'
import BudgetForm from './BudgetForm'
import type { Budget, CreateBudgetDto, UpdateBudgetDto } from '../../types'
import { Plus, X, ChevronLeft, ChevronRight, Wallet, TrendingDown, TrendingUp, Percent } from 'lucide-react'

// Months in Portuguese
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const BudgetsPage: React.FC = () => {
  // Stores
  const {
    budgets,
    overview,
    loading,
    error,
    fetchBudgets,
    fetchBudgetOverview,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgetsStore()

  const { categories, fetchCategories } = useCategoriesStore()

  // Local state
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })

  // Current month/year state
  const currentDate = new Date()
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear())

  // Fetch data on mount and when month/year changes
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchBudgets(currentMonth, currentYear)
    fetchBudgetOverview(currentMonth, currentYear)
  }, [fetchBudgets, fetchBudgetOverview, currentMonth, currentYear])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleGoToCurrentMonth = () => {
    setCurrentMonth(currentDate.getMonth() + 1)
    setCurrentYear(currentDate.getFullYear())
  }

  // Handle new budget
  const handleNewBudget = () => {
    setEditingBudget(null)
    setShowForm(true)
  }

  // Handle edit budget
  const handleEditBudget = useCallback((budget: Budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }, [])

  // Handle delete budget
  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirm({ id, show: true })
  }, [])

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteBudget(deleteConfirm.id)
        setNotification({ type: 'success', message: 'Orçamento deletado com sucesso!' })
        setDeleteConfirm({ id: '', show: false })
        // Refetch data
        await fetchBudgets(currentMonth, currentYear)
        await fetchBudgetOverview(currentMonth, currentYear)
      } catch {
        setNotification({ type: 'error', message: 'Erro ao deletar orçamento' })
      }
    }
  }

  // Handle form submit
  const handleFormSubmit = async (data: CreateBudgetDto | UpdateBudgetDto) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, data as UpdateBudgetDto)
        setNotification({ type: 'success', message: 'Orçamento atualizado com sucesso!' })
      } else {
        await createBudget(data as CreateBudgetDto)
        setNotification({ type: 'success', message: 'Orçamento criado com sucesso!' })
      }
      setShowForm(false)
      setEditingBudget(null)
      // Refetch data
      await fetchBudgets(currentMonth, currentYear)
      await fetchBudgetOverview(currentMonth, currentYear)
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao salvar orçamento' })
      throw err
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  // Close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Filter categories by expense type
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')

  // Get progress color for percentage
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
            <p className="text-gray-500">Gerencie seus orçamentos mensais</p>
          </div>
          <button
            onClick={handleNewBudget}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={20} />
            Novo Orçamento
          </button>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {MONTHS[currentMonth - 1]} {currentYear}
                </h2>
              </div>
              {(currentMonth !== currentDate.getMonth() + 1 || currentYear !== currentDate.getFullYear()) && (
                <button
                  onClick={handleGoToCurrentMonth}
                  className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                >
                  Ir para mês atual
                </button>
              )}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Próximo mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Orçado Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(overview.total_budget)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <Wallet size={24} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gasto Total</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(overview.total_spent)}
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
                  <p className="text-sm text-gray-500 mb-1">Saldo Disponível</p>
                  <p
                    className={`text-2xl font-bold ${
                      overview.total_remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(overview.total_remaining)}
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
                  <p className="text-sm text-gray-500 mb-1">% Utilizado</p>
                  <p className={`text-2xl font-bold ${getProgressColor(overview.percentage)}`}>
                    {Math.round(overview.percentage)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50">
                  <Percent size={24} className="text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Budgets List */}
        <BudgetsList
          budgets={budgets}
          loading={loading}
          onEdit={handleEditBudget}
          onDelete={handleDeleteClick}
        />

        {/* Modal - Budget Form */}
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
                      {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                    </h3>
                    <button
                      onClick={handleFormCancel}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <BudgetForm
                    initialData={editingBudget || undefined}
                    categories={expenseCategories}
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
                    Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
                    {(() => {
                      const budget = budgets.find((b) => b.id === deleteConfirm.id)
                      return budget ? (
                        <span className="block mt-2 font-medium text-gray-900">
                          {budget.category?.name || 'Orçamento Geral'} - {formatCurrency(budget.amount)}
                        </span>
                      ) : null
                    })()}
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

export default BudgetsPage

