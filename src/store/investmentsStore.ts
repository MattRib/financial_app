import { create } from 'zustand'
import { investmentsService } from '../services/investments'
import type {
  Investment,
  CreateInvestmentDto,
  UpdateInvestmentDto,
} from '../types'

export interface InvestmentsState {
  investments: Investment[]
  loading: boolean
  error: string | null
  monthlyTotal: number | null

  fetchInvestments: () => Promise<void>
  fetchMonthlyTotal: (month: number, year: number) => Promise<void>
  createInvestment: (data: CreateInvestmentDto) => Promise<void>
  updateInvestment: (id: string, data: UpdateInvestmentDto) => Promise<void>
  deleteInvestment: (id: string) => Promise<void>
}

export const useInvestmentsStore = create<InvestmentsState>((set) => ({
  investments: [],
  loading: false,
  error: null,
  monthlyTotal: null,

  fetchInvestments: async () => {
    set({ loading: true, error: null })
    try {
      const investments = await investmentsService.getAll()
      set({ investments, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchMonthlyTotal: async (month: number, year: number) => {
    try {
      const total = await investmentsService.getMonthlyTotal(month, year)
      set({ monthlyTotal: total })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  createInvestment: async (data: CreateInvestmentDto) => {
    set({ loading: true, error: null })
    try {
      const newInvestment = await investmentsService.create(data)
      set((state) => ({
        investments: [newInvestment, ...state.investments],
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  updateInvestment: async (id: string, data: UpdateInvestmentDto) => {
    set({ loading: true, error: null })
    try {
      const updatedInvestment = await investmentsService.update(id, data)
      set((state) => ({
        investments: state.investments.map((inv) =>
          inv.id === id ? updatedInvestment : inv
        ),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  deleteInvestment: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await investmentsService.delete(id)
      set((state) => ({
        investments: state.investments.filter((inv) => inv.id !== id),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },
}))
