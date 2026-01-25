import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDebtsStore } from '../store/debtsStore'
import { useToast } from '../store/toastStore'
import type { Debt, DebtStatus, CreateDebtDto, UpdateDebtDto } from '../types'

type TabId = 'all' | DebtStatus

interface UseDebtOptions {
  itemsPerPage?: number
}

// Format currency to Brazilian Real
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Format date to Brazilian format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00')
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

// Calculate days until due date
export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function useDebt(options: UseDebtOptions = {}) {
  const { itemsPerPage = 15 } = options

  // Store
  const {
    debts,
    summary,
    loading,
    error,
    fetchDebts,
    fetchSummary,
    createDebt,
    updateDebt,
    deleteDebt,
    markAsPaid,
    clearError,
  } = useDebtsStore()

  const toast = useToast()

  // UI State
  const [showModal, setShowModal] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; show: boolean }>({ id: '', show: false })

  // Filter State
  const [selectedTab, setSelectedTab] = useState<TabId>('all')
  const [filterDateStart, setFilterDateStart] = useState<string>('')
  const [filterDateEnd, setFilterDateEnd] = useState<string>('')

  // Infinite Scroll State
  const [loadedPages, setLoadedPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initial data fetch
  useEffect(() => {
    fetchDebts()
    fetchSummary()
  }, [fetchDebts, fetchSummary])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  // Filter debts
  const filteredDebts = useMemo(() => {
    let result = debts

    // Filter by status (tab)
    if (selectedTab !== 'all') {
      result = result.filter((d) => d.status === selectedTab)
    }

    // Filter by due date range
    if (filterDateStart) {
      result = result.filter((d) => d.due_date >= filterDateStart)
    }
    if (filterDateEnd) {
      result = result.filter((d) => d.due_date <= filterDateEnd)
    }

    return result
  }, [debts, selectedTab, filterDateStart, filterDateEnd])

  // Calculate display count based on loaded pages
  const displayCount = loadedPages * itemsPerPage

  // Displayed debts (for infinite scroll)
  const displayedDebts = useMemo(() => {
    return filteredDebts.slice(0, displayCount)
  }, [filteredDebts, displayCount])

  // Has more items to load
  const hasMore = displayCount < filteredDebts.length

  // Debt counts by status
  const debtCounts = useMemo(() => ({
    all: debts.length,
    pending: debts.filter((d) => d.status === 'pending').length,
    paid: debts.filter((d) => d.status === 'paid').length,
    overdue: debts.filter((d) => d.status === 'overdue').length,
  }), [debts])

  // Custom setters that reset pagination
  const handleSetSelectedTab = useCallback((tab: TabId) => {
    setSelectedTab(tab)
    setLoadedPages(1)
  }, [])

  const handleSetFilterDateStart = useCallback((date: string) => {
    setFilterDateStart(date)
    setLoadedPages(1)
  }, [])

  const handleSetFilterDateEnd = useCallback((date: string) => {
    setFilterDateEnd(date)
    setLoadedPages(1)
  }, [])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoadingMore && !loading) {
          setIsLoadingMore(true)
          setTimeout(() => {
            setLoadedPages((prev) => prev + 1)
            setIsLoadingMore(false)
          }, 300)
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasMore, isLoadingMore, loading])

  // Handlers
  const handleNewDebt = useCallback(() => {
    setEditingDebt(null)
    setShowModal(true)
  }, [])

  const handleEditDebt = useCallback((debt: Debt) => {
    setEditingDebt(debt)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingDebt(null)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteConfirm({ id, show: true })
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ id: '', show: false })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirm.id) {
      try {
        await deleteDebt(deleteConfirm.id)
        toast.success('Dívida excluída com sucesso!')
        setDeleteConfirm({ id: '', show: false })
        fetchSummary()
      } catch {
        toast.error('Erro ao excluir dívida')
      }
    }
  }, [deleteConfirm.id, deleteDebt, fetchSummary, toast])

  const handleMarkAsPaid = useCallback(async (id: string) => {
    try {
      await markAsPaid(id)
      toast.success('Dívida marcada como paga!')
      fetchSummary()
    } catch {
      toast.error('Erro ao marcar dívida como paga')
    }
  }, [markAsPaid, fetchSummary, toast])

  const handleSubmitDebt = useCallback(async (data: CreateDebtDto | UpdateDebtDto) => {
    try {
      if (editingDebt) {
        await updateDebt(editingDebt.id, data as UpdateDebtDto)
        toast.success('Dívida atualizada com sucesso!')
      } else {
        await createDebt(data as CreateDebtDto)
        toast.success('Dívida criada com sucesso!')
      }

      setShowModal(false)
      setEditingDebt(null)
      // Atualiza tanto a lista quanto o summary
      await fetchDebts()
      await fetchSummary()
    } catch {
      toast.error(editingDebt ? 'Erro ao atualizar dívida' : 'Erro ao criar dívida')
    }
  }, [editingDebt, createDebt, updateDebt, fetchDebts, fetchSummary, toast])

  const handleClearFilters = useCallback(() => {
    setFilterDateStart('')
    setFilterDateEnd('')
    setSelectedTab('all')
    setLoadedPages(1)
  }, [])

  // Get debt being deleted (for confirmation modal)
  const debtToDelete = useMemo(() => {
    return debts.find((d) => d.id === deleteConfirm.id)
  }, [debts, deleteConfirm.id])

  return {
    // Data
    debts: displayedDebts,
    allDebts: filteredDebts,
    summary,
    debtCounts,
    debtToDelete,

    // State
    loading,
    error,
    isLoadingMore,
    hasMore,
    showModal,
    editingDebt,
    deleteConfirm,

    // Filters
    selectedTab,
    filterDateStart,
    filterDateEnd,

    // Refs
    loadMoreRef,

    // Handlers
    setSelectedTab: handleSetSelectedTab,
    setFilterDateStart: handleSetFilterDateStart,
    setFilterDateEnd: handleSetFilterDateEnd,
    handleNewDebt,
    handleEditDebt,
    handleCloseModal,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleMarkAsPaid,
    handleSubmitDebt,
    handleClearFilters,
    clearError,
  }
}
