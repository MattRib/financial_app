import { api } from './api'
import type { 
  Goal, 
  CreateGoalDto, 
  UpdateGoalDto
} from '../types'

export const goalsService = {
  getAll: () => 
    api.get<Goal[]>('/goals'),

  getById: (id: string) => 
    api.get<Goal>(`/goals/${id}`),

  create: (data: CreateGoalDto) => 
    api.post<Goal>('/goals', data),

  update: (id: string, data: UpdateGoalDto) => 
    api.patch<Goal>(`/goals/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`/goals/${id}`),

  getActiveGoals: () => 
    api.get<Goal[]>('/goals', { 
      status: 'active' 
    }),
}

