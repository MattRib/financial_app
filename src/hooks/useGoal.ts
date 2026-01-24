import { useState, useEffect, useCallback } from 'react'
import { useGoalsStore } from '../store/goalsStore'
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
      if (selectedGoal) {
        await updateGoal(selectedGoal.id, data as UpdateGoalDto)
      } else {
        await createGoal(data as CreateGoalDto)
      }
      await refreshData()
      closeModal()
    },
    [selectedGoal, createGoal, updateGoal, refreshData, closeModal]
  )

  const handleDelete = useCallback(async () => {
    if (!goalToDelete) return
    await deleteGoal(goalToDelete)
    await refreshData()
    closeDeleteModal()
  }, [goalToDelete, deleteGoal, refreshData, closeDeleteModal])

  const handleAddProgress = useCallback(
    async (amount: number) => {
      if (!goalToAddProgress) return
      await addContribution(goalToAddProgress.id, amount)
      await refreshData()
      closeAddProgressModal()
    },
    [goalToAddProgress, addContribution, refreshData, closeAddProgressModal]
  )

  const handleMarkComplete = useCallback(
    async (id: string) => {
      await markAsCompleted(id)
      await refreshData()
    },
    [markAsCompleted, refreshData]
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
