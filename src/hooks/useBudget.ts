import { useState, useEffect, useCallback } from 'react'
import { useBudgetsStore } from '../store/budgetsStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { useToast } from '../store/toastStore'
import type { Budget, CreateBudgetDto, UpdateBudgetDto, BudgetOverview, Category } from '../types'

interface UseBudgetReturn {
  // Period state
  month: number
  year: number
  
  // Navigation
  goToPrevMonth: () => void
  goToNextMonth: () => void
  goToMonth: (month: number, year: number) => void
  
  // Modal state
  isModalOpen: boolean
  isDeleteModalOpen: boolean
  selectedBudget: Budget | null
  budgetToDelete: string | null
  
  // Modal actions
  openCreateModal: () => void
  openEditModal: (budget: Budget) => void
  closeModal: () => void
  openDeleteModal: (id: string) => void
  closeDeleteModal: () => void
  
  // CRUD operations
  handleSubmit: (data: CreateBudgetDto | UpdateBudgetDto) => Promise<void>
  handleDelete: () => Promise<void>
  
  // Data from store
  budgets: Budget[]
  overview: BudgetOverview | null
  loading: boolean
  error: string | null
  
  // Categories (for modal)
  categories: Category[]
  categoriesLoading: boolean
}

export const useBudget = (): UseBudgetReturn => {
  // Current period state
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  
  // Store
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
  
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategoriesStore()

  const toast = useToast()

  // Fetch data when period changes
  useEffect(() => {
    fetchBudgets(month, year)
    fetchBudgetOverview(month, year)
  }, [month, year, fetchBudgets, fetchBudgetOverview])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])
  
  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])
  
  // Navigation - no useCallback needed, React Compiler handles optimization
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
    setSelectedBudget(null)
    setIsModalOpen(true)
  }, [])
  
  const openEditModal = useCallback((budget: Budget) => {
    setSelectedBudget(budget)
    setIsModalOpen(true)
  }, [])
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedBudget(null)
  }, [])
  
  const openDeleteModal = useCallback((id: string) => {
    setBudgetToDelete(id)
    setIsDeleteModalOpen(true)
  }, [])
  
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setBudgetToDelete(null)
  }, [])
  
  // CRUD operations
  const handleSubmit = useCallback(async (data: CreateBudgetDto | UpdateBudgetDto) => {
    try {
      if (selectedBudget) {
        // Update
        await updateBudget(selectedBudget.id, data)
        toast.success('Orçamento atualizado com sucesso!')
      } else {
        // Create
        await createBudget(data as CreateBudgetDto)
        toast.success('Orçamento criado com sucesso!')
      }

      // Refresh data
      await fetchBudgets(month, year)
      await fetchBudgetOverview(month, year)

      closeModal()
    } catch {
      toast.error('Erro ao salvar orçamento')
    }
  }, [selectedBudget, updateBudget, createBudget, fetchBudgets, fetchBudgetOverview, month, year, closeModal, toast])
  
  const handleDelete = useCallback(async () => {
    if (!budgetToDelete) return

    try {
      await deleteBudget(budgetToDelete)
      toast.success('Orçamento excluído com sucesso!')

      // Refresh data
      await fetchBudgets(month, year)
      await fetchBudgetOverview(month, year)

      closeDeleteModal()
    } catch {
      toast.error('Erro ao excluir orçamento')
    }
  }, [budgetToDelete, deleteBudget, fetchBudgets, fetchBudgetOverview, month, year, closeDeleteModal, toast])
  
  return {
    // Period
    month,
    year,
    
    // Navigation
    goToPrevMonth,
    goToNextMonth,
    goToMonth,
    
    // Modal state
    isModalOpen,
    isDeleteModalOpen,
    selectedBudget,
    budgetToDelete,
    
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
    budgets,
    overview,
    loading,
    error,
    categories,
    categoriesLoading,
  }
}
