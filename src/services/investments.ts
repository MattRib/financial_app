import { api } from './api'
import type { 
  Investment, 
  CreateInvestmentDto, 
  UpdateInvestmentDto,
  InvestmentType
} from '../types'

interface FilterInvestmentDto {
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

export interface MonthlyEvolution {
  month: number
  year: number
  total: number
}

export const investmentsService = {
  getAll: (filters?: FilterInvestmentDto) =>
    api.get<Investment[]>('/investments', filters as Record<string, string | number | undefined>),

  getById: (id: string) => 
    api.get<Investment>(`/investments/${id}`),

  create: (data: CreateInvestmentDto) => 
    api.post<Investment>('/investments', data),

  update: (id: string, data: UpdateInvestmentDto) => 
    api.patch<Investment>(`/investments/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`/investments/${id}`),

  getByType: (type: InvestmentType) => 
    api.get<Investment[]>('/investments', { 
      type 
    }),

  getMonthlyTotal: (month: number, year: number) => 
    api.get<number>('/investments/monthly-total', { 
      month, 
      year 
    }),

  getSummary: (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    return api.get<InvestmentSummary>('/investments/summary', params)
  },

  getEvolution: (year: number) =>
    api.get<MonthlyEvolution[]>('/investments/evolution', { year }),
}

