import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useTransactionsStore } from '../store/transactionsStore'
import { useAccountsStore } from '../store/accountsStore'
import { useCategoriesStore } from '../store/categoriesStore'
import { useToast } from '../store/toastStore'
import type { Transaction, TransactionType, DateFilterMode, DatePreset } from '../types'

type TabId = 'all' | TransactionType

interface UseTransactionOptions {
  itemsPerPage?: number
}

// Format currency to Brazilian Real
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function useTransaction(options: UseTransactionOptions = {}) {
  const { itemsPerPage = 15 } = options

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

  const { accounts, fetch: fetchAccounts } = useAccountsStore()

  const { categories, fetchCategories } = useCategoriesStore()
  const toast = useToast()

  // UI State
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    transaction: Transaction | null
    show: boolean
  }>({ transaction: null, show: false })

  // Filter State
  const [selectedTab, setSelectedTab] = useState<TabId>('all')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterDateStart, setFilterDateStart] = useState<string>('')
  const [filterDateEnd, setFilterDateEnd] = useState<string>('')

  // Date navigation state
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('month')

  // Infinite Scroll State
  const [loadedPages, setLoadedPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Initial data fetch
  useEffect(() => {
    fetchTransactions()
    fetchCategories()
    fetchAccounts()
    // Fetch summary for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    fetchSummary(startOfMonth, endOfMonth)
  }, [fetchTransactions, fetchCategories, fetchSummary, fetchAccounts])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error, toast])

  // Sync dates when in month navigation mode
  useEffect(() => {
    if (dateFilterMode === 'month') {
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      setFilterDateStart(firstDay.toISOString().split('T')[0])
      setFilterDateEnd(lastDay.toISOString().split('T')[0])
    }
  }, [month, year, dateFilterMode])

  // Filter transactions
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

  // Calculate display count based on loaded pages
  const displayCount = loadedPages * itemsPerPage

  // Displayed transactions (for infinite scroll)
  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, displayCount)
  }, [filteredTransactions, displayCount])

  // Has more items to load
  const hasMore = displayCount < filteredTransactions.length

  // Transaction counts by type
  const transactionCounts = useMemo(() => ({
    all: transactions.length,
    income: transactions.filter((t) => t.type === 'income').length,
    expense: transactions.filter((t) => t.type === 'expense').length,
  }), [transactions])

  // Custom setters that reset pagination
  const handleSetSelectedTab = useCallback((tab: TabId) => {
    setSelectedTab(tab)
    setLoadedPages(1)
  }, [])

  const handleSetFilterCategory = useCallback((categoryId: string) => {
    setFilterCategory(categoryId)
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

  // Month navigation functions
  const goToPrevMonth = useCallback(() => {
    if (month === 1) {
      setMonth(12)
      setYear((prev) => prev - 1)
    } else {
      setMonth((prev) => prev - 1)
    }
    setLoadedPages(1)
  }, [month])

  const goToNextMonth = useCallback(() => {
    if (month === 12) {
      setMonth(1)
      setYear((prev) => prev + 1)
    } else {
      setMonth((prev) => prev + 1)
    }
    setLoadedPages(1)
  }, [month])

  const goToCurrentMonth = useCallback(() => {
    const today = new Date()
    setMonth(today.getMonth() + 1)
    setYear(today.getFullYear())
    setLoadedPages(1)
  }, [])

  // Apply date preset
  const applyDatePreset = useCallback((preset: DatePreset) => {
    const today = new Date()
    let startDate: Date
    let endDate: Date = today

    switch (preset) {
      case 'this-month':
        setDateFilterMode('month')
        setMonth(today.getMonth() + 1)
        setYear(today.getFullYear())
        setLoadedPages(1)
        return // Early return, sync via useEffect

      case 'last-month': {
        const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        startDate = lastMonthDate
        endDate = new Date(today.getFullYear(), today.getMonth(), 0)
        setDateFilterMode('custom')
        break
      }

      case 'last-3-months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        setDateFilterMode('custom')
        break

      case 'last-6-months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1)
        setDateFilterMode('custom')
        break

      case 'this-year':
        startDate = new Date(today.getFullYear(), 0, 1)
        setDateFilterMode('custom')
        break

      case 'last-year':
        startDate = new Date(today.getFullYear() - 1, 0, 1)
        endDate = new Date(today.getFullYear() - 1, 11, 31)
        setDateFilterMode('custom')
        break

      default:
        return
    }

    setFilterDateStart(startDate.toISOString().split('T')[0])
    setFilterDateEnd(endDate.toISOString().split('T')[0])
    setLoadedPages(1)
  }, [])

  // Count active filters
  const getActiveFiltersCount = useCallback(() => {
    let count = 0

    if (filterCategory) count++
    if (selectedTab !== 'all') count++

    // Check if not in current month
    const today = new Date()
    const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear()
    if (!isCurrentMonth || dateFilterMode === 'custom') count++

    return count
  }, [filterCategory, selectedTab, month, year, dateFilterMode])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoadingMore && !loading) {
          setIsLoadingMore(true)
          // Simulate a small delay for smooth loading
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
  const handleNewTransaction = useCallback(() => {
    setEditingTransaction(null)
    setShowModal(true)
  }, [])

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowModal(false)
    setEditingTransaction(null)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) return

    setDeleteConfirm({ transaction, show: true })
  }, [transactions])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ transaction: null, show: false })
  }, [])

  const handleDeleteConfirm = useCallback(async (mode: 'single' | 'future' | 'all') => {
    if (deleteConfirm.transaction) {
      try {
        await deleteTransaction(deleteConfirm.transaction.id, mode)
        toast.success('Transação excluída com sucesso!')
        setDeleteConfirm({ transaction: null, show: false })

        // Refresh summary after deletion
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        fetchSummary(startOfMonth, endOfMonth)
      } catch {
        toast.error('Erro ao excluir transação')
      }
    }
  }, [deleteConfirm.transaction, deleteTransaction, fetchSummary, toast])

  const handleSubmitTransaction = useCallback(async (data: {
    date: string
    type: TransactionType
    category_id?: string
    amount: number
    description?: string
    tags?: string[]
    account_id: string
  }) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data)
      toast.success('Transação atualizada com sucesso!')
    } else {
      await createTransaction(data)
      toast.success('Transação criada com sucesso!')
    }

    setShowModal(false)
    setEditingTransaction(null)

    // Refresh summary
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    fetchSummary(startOfMonth, endOfMonth)
  }, [editingTransaction, createTransaction, updateTransaction, fetchSummary, toast])

  const handleClearFilters = useCallback(() => {
    setFilterCategory('')
    setDateFilterMode('month')
    const today = new Date()
    setMonth(today.getMonth() + 1)
    setYear(today.getFullYear())
    setLoadedPages(1)
    // Dates will be synced via useEffect
  }, [])

  return {
    // Data
    transactions: displayedTransactions,
    allTransactions: filteredTransactions,
    summary,
    categories,
    accounts,
    transactionCounts,

    // State
    loading,
    error,
    isLoadingMore,
    hasMore,
    showModal,
    editingTransaction,
    deleteConfirm,

    // Filters
    selectedTab,
    filterCategory,
    filterDateStart,
    filterDateEnd,

    // Date navigation
    month,
    year,
    dateFilterMode,

    // Refs
    loadMoreRef,

    // Handlers
    setSelectedTab: handleSetSelectedTab,
    setFilterCategory: handleSetFilterCategory,
    setFilterDateStart: handleSetFilterDateStart,
    setFilterDateEnd: handleSetFilterDateEnd,
    setDateFilterMode,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    applyDatePreset,
    getActiveFiltersCount,
    handleNewTransaction,
    handleEditTransaction,
    handleCloseModal,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleSubmitTransaction,
    handleClearFilters,
  }
}
