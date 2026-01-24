import { create } from 'zustand'
import { debtsService } from '../services/debts'
import type {
  Debt,
  DebtSummary,
  FilterDebtDto,
  CreateDebtDto,
  UpdateDebtDto,
} from '../types'

export interface DebtsState {
  debts: Debt[]
  loading: boolean
  error: string | null
  summary: DebtSummary | null
  overdueDebts: Debt[]

  fetchDebts: (filters?: FilterDebtDto) => Promise<void>
  fetchSummary: () => Promise<void>
  fetchOverdue: () => Promise<void>
  createDebt: (data: CreateDebtDto) => Promise<void>
  updateDebt: (id: string, data: UpdateDebtDto) => Promise<void>
  deleteDebt: (id: string) => Promise<void>
  markAsPaid: (id: string) => Promise<void>
  clearError: () => void
}

export const useDebtsStore = create<DebtsState>((set) => ({
  debts: [],
  loading: false,
  error: null,
  summary: null,
  overdueDebts: [],

  fetchDebts: async (filters?: FilterDebtDto) => {
    set({ loading: true, error: null })
    try {
      const debts = await debtsService.getAll(filters)
      set({ debts, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchSummary: async () => {
    set({ error: null })
    try {
      const summary = await debtsService.getSummary()
      set({ summary })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  fetchOverdue: async () => {
    set({ error: null })
    try {
      const overdueDebts = await debtsService.getOverdue()
      set({ overdueDebts })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  createDebt: async (data: CreateDebtDto) => {
    set({ loading: true, error: null })
    try {
      const newDebt = await debtsService.create(data)
      set((state) => ({
        debts: [newDebt, ...state.debts],
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  updateDebt: async (id: string, data: UpdateDebtDto) => {
    set({ loading: true, error: null })
    try {
      const updatedDebt = await debtsService.update(id, data)
      set((state) => ({
        debts: state.debts.map((debt) => (debt.id === id ? updatedDebt : debt)),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  deleteDebt: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await debtsService.delete(id)
      set((state) => ({
        debts: state.debts.filter((debt) => debt.id !== id),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  markAsPaid: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const updatedDebt = await debtsService.markAsPaid(id)
      set((state) => ({
        debts: state.debts.map((debt) => (debt.id === id ? updatedDebt : debt)),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
