import { useState, useEffect, useCallback, useMemo } from 'react'
import { useInvestmentsStore, type MonthlyEvolution } from '../store/investmentsStore'
import { useToast } from '../store/toastStore'
import type { Investment, CreateInvestmentDto, UpdateInvestmentDto, InvestmentType } from '../types'
import { INVESTMENT_TYPE_CONFIG, type InvestmentTabId } from '../constants/investments'

interface InvestmentSummaryByType {
  type: InvestmentType
  total: number
  count: number
  percentage: number
}

interface UseInvestmentReturn {
  // Period state
  month: number
  year: number
  
  // Filter state
  selectedType: InvestmentTabId
  
  // Navigation
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToMonth: (month: number, year: number) => void
  setSelectedType: (type: InvestmentTabId) => void
  
  // Modal state
  isModalOpen: boolean
  isDeleteModalOpen: boolean
  selectedInvestment: Investment | null
  investmentToDelete: string | null
  
  // Modal actions
  openCreateModal: () => void
  openEditModal: (investment: Investment) => void
  closeModal: () => void
  openDeleteModal: (id: string) => void
  closeDeleteModal: () => void
  
  // CRUD operations
  handleSubmit: (data: CreateInvestmentDto | UpdateInvestmentDto) => Promise<void>
  handleDelete: () => Promise<void>
  
  // Data from store
  investments: Investment[]
  filteredInvestments: Investment[]
  loading: boolean
  error: string | null
  
  // Evolution
  evolution: MonthlyEvolution[]
  evolutionLoading: boolean
  
  // Computed summaries
  totalInvested: number
  monthlyTotal: number
  summaryByType: InvestmentSummaryByType[]
  chartData: { name: string; value: number; color: string }[]
}

export const useInvestment = (): UseInvestmentReturn => {
  // Current period state
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  
  // Filter state
  const [selectedType, setSelectedType] = useState<InvestmentTabId>('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null)
  
  // Store
  const {
    investments,
    loading,
    error,
    monthlyTotal,
    summary,
    evolution,
    evolutionLoading,
    fetchInvestments,
    fetchMonthlyTotal,
    fetchSummary,
    fetchEvolution,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  } = useInvestmentsStore()

  const toast = useToast()

  // Compute date range for current month
  const getDateRange = useCallback((m: number, y: number) => {
    const startDate = new Date(y, m - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(y, m, 0).toISOString().split('T')[0]
    return { startDate, endDate }
  }, [])
  
  // Fetch data when period changes
  useEffect(() => {
    const { startDate, endDate } = getDateRange(month, year)
    fetchInvestments({ start_date: startDate, end_date: endDate })
    fetchMonthlyTotal(month, year)
    fetchSummary() // Fetch summary for totals and charts
  }, [month, year, fetchInvestments, fetchMonthlyTotal, fetchSummary, getDateRange])
  
  // Fetch evolution data when year changes
  useEffect(() => {
    fetchEvolution(year)
  }, [year, fetchEvolution])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  // Filter investments by selected type
  const filteredInvestments = useMemo(() => {
    if (selectedType === 'all') return investments
    return investments.filter(inv => inv.type === selectedType)
  }, [investments, selectedType])
  
  // Calculate total invested from summary (all time)
  const totalInvested = useMemo(() => {
    return summary?.total_invested ?? 0
  }, [summary])

  // Calculate summary by type from summary API
  const summaryByType = useMemo((): InvestmentSummaryByType[] => {
    if (!summary?.by_type) {
      return []
    }

    return summary.by_type.map(item => ({
      type: item.type,
      total: item.total,
      count: item.count,
      percentage: item.percentage,
    }))
  }, [summary])

  // Chart data for CategoryBarChart
  const chartData = useMemo(() => {
    if (!summary?.by_type) {
      return []
    }

    return summary.by_type
      .filter(item => item.total > 0)
      .map(item => ({
        name: INVESTMENT_TYPE_CONFIG[item.type].label,
        value: item.total,
        color: INVESTMENT_TYPE_CONFIG[item.type].chartColor,
      }))
      .sort((a, b) => b.value - a.value)
  }, [summary])
  
  // Navigation
  const goToPrevMonth = () => {
    setMonth((currentMonth) => {
      if (currentMonth === 1) {
        setYear((y) => y - 1)
        return 12
      }
      return currentMonth - 1
    })
  }
  
  const goToNextMonth = () => {
    setMonth((currentMonth) => {
      if (currentMonth === 12) {
        setYear((y) => y + 1)
        return 1
      }
      return currentMonth + 1
    })
  }
  
  const goToMonth = (newMonth: number, newYear: number) => {
    setMonth(newMonth)
    setYear(newYear)
  }
  
  // Modal actions
  const openCreateModal = useCallback(() => {
    setSelectedInvestment(null)
    setIsModalOpen(true)
  }, [])
  
  const openEditModal = useCallback((investment: Investment) => {
    setSelectedInvestment(investment)
    setIsModalOpen(true)
  }, [])
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedInvestment(null)
  }, [])
  
  const openDeleteModal = useCallback((id: string) => {
    setInvestmentToDelete(id)
    setIsDeleteModalOpen(true)
  }, [])
  
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setInvestmentToDelete(null)
  }, [])
  
  // CRUD operations
  const handleSubmit = useCallback(async (data: CreateInvestmentDto | UpdateInvestmentDto) => {
    try {
      if (selectedInvestment) {
        await updateInvestment(selectedInvestment.id, data)
        toast.success('Investimento atualizado com sucesso!')
      } else {
        await createInvestment(data as CreateInvestmentDto)
        toast.success('Investimento criado com sucesso!')
      }

      // Refresh data
      const { startDate, endDate } = getDateRange(month, year)
      await Promise.all([
        fetchInvestments({ start_date: startDate, end_date: endDate }),
        fetchMonthlyTotal(month, year),
        fetchEvolution(year),
        fetchSummary(), // Fetch summary for totals and charts
      ])

      closeModal()
    } catch {
      toast.error('Erro ao salvar investimento')
    }
  }, [selectedInvestment, updateInvestment, createInvestment, fetchInvestments, fetchMonthlyTotal, fetchEvolution, fetchSummary, month, year, closeModal, getDateRange, toast])
  
  const handleDelete = useCallback(async () => {
    if (!investmentToDelete) return

    try {
      await deleteInvestment(investmentToDelete)
      toast.success('Investimento excluído com sucesso!')

      // Refresh data
      const { startDate, endDate } = getDateRange(month, year)
      await Promise.all([
        fetchInvestments({ start_date: startDate, end_date: endDate }),
        fetchMonthlyTotal(month, year),
        fetchEvolution(year),
        fetchSummary(), // Fetch summary for totals and charts
      ])

      closeDeleteModal()
    } catch {
      toast.error('Erro ao excluir investimento')
    }
  }, [investmentToDelete, deleteInvestment, fetchInvestments, fetchMonthlyTotal, fetchEvolution, fetchSummary, month, year, closeDeleteModal, getDateRange, toast])
  
  return {
    // Period
    month,
    year,
    
    // Filter
    selectedType,
    
    // Navigation
    goToPrevMonth,
    goToNextMonth,
    goToMonth,
    setSelectedType,
    
    // Modal state
    isModalOpen,
    isDeleteModalOpen,
    selectedInvestment,
    investmentToDelete,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    
    // CRUD
    handleSubmit,
    handleDelete,
    
    // Data
    investments,
    filteredInvestments,
    loading,
    error,
    
    // Evolution
    evolution,
    evolutionLoading,
    
    // Computed
    totalInvested,
    monthlyTotal: monthlyTotal ?? 0,
    summaryByType,
    chartData,
  }
}
