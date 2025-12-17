import { create } from 'zustand'
import { budgetsService } from '../services/budgets'
import type {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  BudgetOverview,
} from '../types'

export interface BudgetsState {
  budgets: Budget[]
  overview: BudgetOverview | null
  loading: boolean
  error: string | null

  fetchBudgets: (month: number, year: number) => Promise<void>
  fetchBudgetOverview: (month: number, year: number) => Promise<void>
  createBudget: (data: CreateBudgetDto) => Promise<void>
  updateBudget: (id: string, data: UpdateBudgetDto) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
}

export const useBudgetsStore = create<BudgetsState>((set) => ({
  budgets: [],
  overview: null,
  loading: false,
  error: null,

  fetchBudgets: async (month: number, year: number) => {
    set({ loading: true, error: null })
    try {
      const budgets = await budgetsService.getMonthBudgets(month, year)
      set({ budgets, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchBudgetOverview: async (month: number, year: number) => {
    try {
      const overview = await budgetsService.getOverview(month, year)
      set({ overview })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  createBudget: async (data: CreateBudgetDto) => {
    set({ loading: true, error: null })
    try {
      const newBudget = await budgetsService.create(data)
      set((state) => ({
        budgets: [newBudget, ...state.budgets],
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  updateBudget: async (id: string, data: UpdateBudgetDto) => {
    set({ loading: true, error: null })
    try {
      const updatedBudget = await budgetsService.update(id, data)
      set((state) => ({
        budgets: state.budgets.map((b) =>
          b.id === id ? updatedBudget : b
        ),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  deleteBudget: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await budgetsService.delete(id)
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },
}))

