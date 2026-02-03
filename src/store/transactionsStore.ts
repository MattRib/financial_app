import { create } from 'zustand'
import { transactionsService } from '../services/transactions'
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  TransactionSummary,
} from '../types'

export interface TransactionsState {
  transactions: Transaction[]
  summary: TransactionSummary | null
  loading: boolean
  error: string | null

  fetchTransactions: (filters?: TransactionFilters) => Promise<void>
  fetchSummary: (startDate: string, endDate: string) => Promise<void>
  createTransaction: (data: CreateTransactionDto) => Promise<void>
  updateTransaction: (id: string, data: UpdateTransactionDto) => Promise<void>
  deleteTransaction: (id: string, mode?: 'single' | 'future' | 'all') => Promise<void>
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  summary: null,
  loading: false,
  error: null,

  fetchTransactions: async (filters?: TransactionFilters) => {
    set({ loading: true, error: null })
    try {
      const transactions = await transactionsService.getAll(filters)
      set({ transactions, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchSummary: async (startDate: string, endDate: string) => {
    try {
      const summary = await transactionsService.getSummary(startDate, endDate)
      set({ summary })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  createTransaction: async (data: CreateTransactionDto) => {
    set({ loading: true, error: null })
    try {
      const newTransaction = await transactionsService.create(data)
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  updateTransaction: async (id: string, data: UpdateTransactionDto) => {
    set({ loading: true, error: null })
    try {
      const updatedTransaction = await transactionsService.update(id, data)
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updatedTransaction : t
        ),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  deleteTransaction: async (id: string, mode?: 'single' | 'future' | 'all') => {
    set({ loading: true, error: null })
    try {
      await transactionsService.delete(id, mode)
      
      // Refetch transactions to get the updated list
      // (since we might delete multiple installments)
      const transactions = await transactionsService.getAll()
      set({ transactions, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },
}))

