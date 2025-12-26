import { create } from 'zustand'
import { investmentsService } from '../services/investments'
import type {
  Investment,
  CreateInvestmentDto,
  UpdateInvestmentDto,
  InvestmentType,
} from '../types'

export interface FilterInvestmentDto {
  type?: InvestmentType
  start_date?: string
  end_date?: string
}

export interface InvestmentSummary {
  total_invested: number
  by_type: {
    type: InvestmentType
    total: number
    percentage: number
    count: number
  }[]
  monthly_average: number
}

export interface InvestmentsState {
  investments: Investment[]
  loading: boolean
  error: string | null
  monthlyTotal: number | null
  summary: InvestmentSummary | null

  fetchInvestments: (filters?: FilterInvestmentDto) => Promise<void>
  fetchMonthlyTotal: (month: number, year: number) => Promise<void>
  fetchSummary: (startDate?: string, endDate?: string) => Promise<void>
  createInvestment: (data: CreateInvestmentDto) => Promise<void>
  updateInvestment: (id: string, data: UpdateInvestmentDto) => Promise<void>
  deleteInvestment: (id: string) => Promise<void>
}

export const useInvestmentsStore = create<InvestmentsState>((set) => ({
  investments: [],
  loading: false,
  error: null,
  monthlyTotal: null,
  summary: null,

  fetchInvestments: async (filters?: FilterInvestmentDto) => {
    set({ loading: true, error: null })
    try {
      const investments = await investmentsService.getAll(filters)
      set({ investments, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchMonthlyTotal: async (month: number, year: number) => {
    set({ error: null })
    try {
      const monthlyTotal = await investmentsService.getMonthlyTotal(month, year)
      set({ monthlyTotal })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  fetchSummary: async (startDate?: string, endDate?: string) => {
    set({ error: null })
    try {
      // TODO: Implementar quando o backend tiver o endpoint /investments/summary
      // const summary = await investmentsService.getSummary(startDate, endDate)
      // set({ summary })
      
      // Por enquanto retorna null ou calcula localmente
      set({ summary: null })
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
