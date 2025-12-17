import { api } from './api'
import type { 
  Budget, 
  CreateBudgetDto, 
  UpdateBudgetDto
} from '../types'

export const budgetsService = {
  getAll: () => 
    api.get<Budget[]>('/budgets'),

  getById: (id: string) => 
    api.get<Budget>(`/budgets/${id}`),

  create: (data: CreateBudgetDto) => 
    api.post<Budget>('/budgets', data),

  update: (id: string, data: UpdateBudgetDto) => 
    api.patch<Budget>(`/budgets/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`/budgets/${id}`),

  getMonthBudgets: (month: number, year: number) => 
    api.get<Budget[]>('/budgets', { 
      month, 
      year 
    }),
}

