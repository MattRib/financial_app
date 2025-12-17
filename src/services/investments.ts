import { api } from './api'
import type { 
  Investment, 
  CreateInvestmentDto, 
  UpdateInvestmentDto,
  InvestmentType
} from '../types'

export const investmentsService = {
  getAll: () => 
    api.get<Investment[]>('/investments'),

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
}

