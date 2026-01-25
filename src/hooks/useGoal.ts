import { useState, useEffect, useCallback } from 'react'
import { useGoalsStore } from '../store/goalsStore'
import { useToast } from '../store/toastStore'
import type {
  Goal,
  GoalWithProgress,
  GoalSummary,
  GoalStatus,
  GoalCategory,
  CreateGoalDto,
  UpdateGoalDto,
} from '../types'
import type { GoalTabId } from '../constants/goals'

interface UseGoalReturn {
  // Data from store
  goals: Goal[]
  filteredGoals: Goal[]
  summary: GoalSummary | null
  atRiskGoals: GoalWithProgress[]
  nearCompletionGoals: GoalWithProgress[]
  loading: boolean
  error: string | null

  // Filters
  statusFilter: GoalTabId
  categoryFilter: GoalCategory | 'all'
  setStatusFilter: (status: GoalTabId) => void
  setCategoryFilter: (category: GoalCategory | 'all') => void

  // Modal states
  isModalOpen: boolean
  isDeleteModalOpen: boolean
  isAddProgressModalOpen: boolean
  selectedGoal: Goal | null
  goalToDelete: string | null
  goalToAddProgress: Goal | null

  // Modal actions
  openCreateModal: () => void
  openEditModal: (goal: Goal) => void
  closeModal: () => void
  openDeleteModal: (id: string) => void
  closeDeleteModal: () => void
  openAddProgressModal: (goal: Goal) => void
  closeAddProgressModal: () => void

  // CRUD operations
  handleSubmit: (data: CreateGoalDto | UpdateGoalDto) => Promise<void>
  handleDelete: () => Promise<void>
  handleAddProgress: (amount: number) => Promise<void>
  handleMarkComplete: (id: string) => Promise<void>

  // Refresh data
  refreshData: () => Promise<void>
}

export const useGoal = (): UseGoalReturn => {
  // Store data
  const {
    goals,
    summary,
    atRiskGoals,
    nearCompletionGoals,
    loading,
    error,
    fetchGoals,
    fetchSummary,
    fetchAtRisk,
    fetchNearCompletion,
    createGoal,
    updateGoal,
    deleteGoal,
    markAsCompleted,
    addContribution,
  } = useGoalsStore()

  const toast = useToast()

  // Filters state
  const [statusFilter, setStatusFilter] = useState<GoalTabId>('all')
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | 'all'>('all')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddProgressModalOpen, setIsAddProgressModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const [goalToAddProgress, setGoalToAddProgress] = useState<Goal | null>(null)

  // Filter goals based on current filters
  const filteredGoals = goals.filter((goal) => {
    // Status filter
    if (statusFilter !== 'all' && goal.status !== statusFilter) {
      return false
    }
    // Category filter
    if (categoryFilter !== 'all' && goal.category !== categoryFilter) {
      return false
    }
    return true
  })

  // Fetch data on mount and when filters change
  const refreshData = useCallback(async () => {
    const filters: { status?: GoalStatus; category?: GoalCategory } = {}

    if (statusFilter !== 'all') {
      filters.status = statusFilter
    }
    if (categoryFilter !== 'all') {
      filters.category = categoryFilter
    }

    await Promise.all([
      fetchGoals(Object.keys(filters).length > 0 ? filters : undefined),
      fetchSummary(),
      fetchAtRisk(),
      fetchNearCompletion(),
    ])
  }, [statusFilter, categoryFilter, fetchGoals, fetchSummary, fetchAtRisk, fetchNearCompletion])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  // Modal actions
  const openCreateModal = useCallback(() => {
    setSelectedGoal(null)
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback((goal: Goal) => {
    setSelectedGoal(goal)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedGoal(null)
  }, [])

  const openDeleteModal = useCallback((id: string) => {
    setGoalToDelete(id)
    setIsDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setGoalToDelete(null)
  }, [])

  const openAddProgressModal = useCallback((goal: Goal) => {
    setGoalToAddProgress(goal)
    setIsAddProgressModalOpen(true)
  }, [])

  const closeAddProgressModal = useCallback(() => {
    setIsAddProgressModalOpen(false)
    setGoalToAddProgress(null)
  }, [])

  // CRUD handlers
  const handleSubmit = useCallback(
    async (data: CreateGoalDto | UpdateGoalDto) => {
      try {
        if (selectedGoal) {
          await updateGoal(selectedGoal.id, data as UpdateGoalDto)
          toast.success('Meta atualizada com sucesso!')
          await refreshData()
        } else {
          await createGoal(data as CreateGoalDto)
          toast.success('Meta criada com sucesso!')
          // Apenas atualiza summary sem aplicar filtros para garantir que a meta criada apareça
          await fetchSummary()
        }
        closeModal()
      } catch {
        toast.error('Erro ao salvar meta')
      }
    },
    [selectedGoal, createGoal, updateGoal, refreshData, fetchSummary, closeModal, toast]
  )

  const handleDelete = useCallback(async () => {
    if (!goalToDelete) return
    try {
      await deleteGoal(goalToDelete)
      toast.success('Meta excluída com sucesso!')
      await refreshData()
      closeDeleteModal()
    } catch {
      toast.error('Erro ao excluir meta')
    }
  }, [goalToDelete, deleteGoal, refreshData, closeDeleteModal, toast])

  const handleAddProgress = useCallback(
    async (amount: number) => {
      if (!goalToAddProgress) return
      try {
        await addContribution(goalToAddProgress.id, amount)
        toast.success('Progresso adicionado com sucesso!')
        await refreshData()
        closeAddProgressModal()
      } catch {
        toast.error('Erro ao adicionar progresso')
      }
    },
    [goalToAddProgress, addContribution, refreshData, closeAddProgressModal, toast]
  )

  const handleMarkComplete = useCallback(
    async (id: string) => {
      try {
        await markAsCompleted(id)
        toast.success('Meta marcada como concluída!')
        await refreshData()
      } catch {
        toast.error('Erro ao marcar meta como concluída')
      }
    },
    [markAsCompleted, refreshData, toast]
  )

  return {
    // Data
    goals,
    filteredGoals,
    summary,
    atRiskGoals,
    nearCompletionGoals,
    loading,
    error,

    // Filters
    statusFilter,
    categoryFilter,
    setStatusFilter,
    setCategoryFilter,

    // Modal states
    isModalOpen,
    isDeleteModalOpen,
    isAddProgressModalOpen,
    selectedGoal,
    goalToDelete,
    goalToAddProgress,

    // Modal actions
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    openAddProgressModal,
    closeAddProgressModal,

    // CRUD operations
    handleSubmit,
    handleDelete,
    handleAddProgress,
    handleMarkComplete,

    // Refresh
    refreshData,
  }
}
