import { api } from './api'
import type { 
  Debt, 
  DebtSummary,
  FilterDebtDto,
  CreateDebtDto, 
  UpdateDebtDto
} from '../types'

export const debtsService = {
  getAll: (filters?: FilterDebtDto) => 
    api.get<Debt[]>('/debts', filters as Record<string, string | number | undefined>),

  getById: (id: string) => 
    api.get<Debt>(`/debts/${id}`),

  getSummary: () => 
    api.get<DebtSummary>('/debts/summary'),

  getOverdue: () => 
    api.get<Debt[]>('/debts/overdue'),

  create: (data: CreateDebtDto) => 
    api.post<Debt>('/debts', data),

  update: (id: string, data: UpdateDebtDto) => 
    api.patch<Debt>(`/debts/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`/debts/${id}`),

  markAsPaid: (id: string) => 
    api.patch<Debt>(`/debts/${id}/pay`, {}),

  getActiveDebts: () => 
    api.get<Debt[]>('/debts', { 
      status: 'pending' 
    }),
}

