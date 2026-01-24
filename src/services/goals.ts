import { api } from './api'
import type { 
  Goal, 
  GoalWithProgress,
  GoalSummary,
  CreateGoalDto, 
  UpdateGoalDto,
  FilterGoalDto,
} from '../types'

export const goalsService = {
  getAll: (filters?: FilterGoalDto) => 
    api.get<Goal[]>('/goals', filters as Record<string, string | number | undefined>),

  getById: (id: string) => 
    api.get<Goal>(`/goals/${id}`),

  create: (data: CreateGoalDto) => 
    api.post<Goal>('/goals', data),

  update: (id: string, data: UpdateGoalDto) => 
    api.patch<Goal>(`/goals/${id}`, data),

  delete: (id: string) => 
    api.delete<void>(`/goals/${id}`),

  getActiveGoals: () => 
    api.get<Goal[]>('/goals', { status: 'active' }),

  getSummary: () =>
    api.get<GoalSummary>('/goals/summary'),

  markAsCompleted: (id: string) =>
    api.patch<Goal>(`/goals/${id}/complete`, {}),

  getAtRisk: () =>
    api.get<GoalWithProgress[]>('/goals/at-risk'),

  getNearCompletion: () =>
    api.get<GoalWithProgress[]>('/goals/near-completion'),
}

