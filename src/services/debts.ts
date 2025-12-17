import { api } from './api'
import type { 
  Debt, 
  CreateDebtDto, 
  UpdateDebtDto
} from '../types'

export const debtsService = {
  getAll: () => 
    api.get<Debt[]>('/debts'),

  getById: (id: string) => 
    api.get<Debt>(`/debts/${id}`),

  create: (data: CreateDebtDto) => 
    api.post<Debt>('/debts', data),

  update: (id: string, data: UpdateDebtDto) => 
    api.patch<Debt>(`/debts/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`/debts/${id}`),

  getActiveDebts: () => 
    api.get<Debt[]>('/debts', { 
      status: 'pending' 
    }),
}

