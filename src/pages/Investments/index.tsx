import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MainLayout } from '../../components/layout'
import { useInvestmentsStore } from '../../store/investmentsStore'
import InvestmentsList from './InvestmentsList'
import InvestmentForm from './InvestmentForm'
import type {
  Investment,
  CreateInvestmentDto,
  UpdateInvestmentDto,
  InvestmentType,
} from '../../types'
import { Plus, X, Filter, TrendingUp, Calendar } from 'lucide-react'

const InvestmentsPage: React.FC = () => {
  // Stores
  const {
    investments,
    loading,
    error,
    monthlyTotal,
    fetchInvestments,
    fetchMonthlyTotal,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestmentsStore()

  // Local state
  const [showForm, setShowForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedType, setSelectedType] = useState<InvestmentType | 'all'>('all')
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })

  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 6) // Últimos 6 meses
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Current month/year for monthly total
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Fetch investments on mount and when filters change
  useEffect(() => {
    const filters = {
      ...(selectedType !== 'all' && { type: selectedType }),
      start_date: startDate,
      end_date: endDate,
    }
    fetchInvestments(filters)
  }, [fetchInvestments, selectedType, startDate, endDate])

  // Fetch monthly total for dashboard card
  useEffect(() => {
    fetchMonthlyTotal(currentMonth, currentYear)
  }, [fetchMonthlyTotal, currentMonth, currentYear])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Handle new investment
  const handleNewInvestment = () => {
    setEditingInvestment(null)
    setShowForm(true)
  }

  // Handle edit investment
  const handleEditInvestment = useCallback((investment: Investment) => {
    setEditingInvestment(investment)
    setShowForm(true)
  }, [])

  // Handle delete investment
  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirm({ id, show: true })
  }, [])

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.id) {
      try {
        await deleteInvestment(deleteConfirm.id)
        setNotification({ type: 'success', message: 'Investimento deletado com sucesso!' })
        setDeleteConfirm({ id: '', show: false })
      } catch {
        setNotification({ type: 'error', message: 'Erro ao deletar investimento' })
      }
    }
  }

  // Handle form submit
  const handleFormSubmit = async (data: CreateInvestmentDto | UpdateInvestmentDto) => {
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment.id, data as UpdateInvestmentDto)
        setNotification({ type: 'success', message: 'Investimento atualizado com sucesso!' })
      } else {
        await createInvestment(data as CreateInvestmentDto)
        setNotification({ type: 'success', message: 'Investimento criado com sucesso!' })
      }
      setShowForm(false)
      setEditingInvestment(null)
    } catch (err) {
      setNotification({ type: 'error', message: 'Erro ao salvar investimento' })
      throw err
    }
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setEditingInvestment(null)
  }

  // Close notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Calculate totals by type
  const summaryByType = useMemo(() => {
    const totals = {
      renda_fixa: 0,
      renda_variavel: 0,
      cripto: 0,
      outros: 0,
    }

    investments.forEach((inv) => {
      totals[inv.type] += inv.amount
    })

    return totals
  }, [investments])

  // Calculate total invested (in current filter)
  const totalInvested = useMemo(() => {
    return investments.reduce((sum, inv) => sum + inv.amount, 0)
  }, [investments])

  // Filtered investments by type
  const filteredInvestments = useMemo(() => {
    if (selectedType === 'all') {
      return investments
    }
    return investments.filter((inv) => inv.type === selectedType)
  }, [investments, selectedType])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investimentos</h1>
            <p className="text-gray-500">Acompanhe seus investimentos</p>
          </div>
          <button
            onClick={handleNewInvestment}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={20} />
            Novo Investimento
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Investido (período filtrado) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Investido</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50">
                <TrendingUp size={24} className="text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Investimento do Mês */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Este Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyTotal || 0)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Renda Fixa */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Renda Fixa</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summaryByType.renda_fixa)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <span className="text-2xl">🏦</span>
              </div>
            </div>
          </div>

          {/* Card 4: Renda Variável */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Renda Variável</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summaryByType.renda_variavel)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

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
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as InvestmentType | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="renda_fixa">Renda Fixa</option>
                  <option value="renda_variavel">Renda Variável</option>
                  <option value="cripto">Criptomoedas</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Data Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  De
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Até
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
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

        {/* Investments List */}
        <InvestmentsList
          investments={filteredInvestments}
          loading={loading}
          onEdit={handleEditInvestment}
          onDelete={handleDeleteClick}
        />

        {/* Modal - Investment Form */}
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
                      {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
                    </h3>
                    <button
                      onClick={handleFormCancel}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <InvestmentForm
                    initialData={editingInvestment || undefined}
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
                    Tem certeza que deseja excluir este investimento? Esta ação não pode ser desfeita.
                    {(() => {
                      const investment = investments.find((inv) => inv.id === deleteConfirm.id)
                      return investment ? (
                        <span className="block mt-2 font-medium text-gray-900">
                          {investment.name} - {formatCurrency(investment.amount)}
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

export default InvestmentsPage

