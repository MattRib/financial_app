import { api } from './api'
import type { Insight, GenerateInsightDto, FilterInsightDto } from '../types'

export const insightsService = {
  generate: (data: GenerateInsightDto) =>
    api.post<Insight>('/insights/generate', data),

  getAll: (filters?: FilterInsightDto) =>
    api.get<Insight[]>('/insights', filters as Record<string, string | undefined>),

  getById: (id: string) => api.get<Insight>(`/insights/${id}`),

  delete: (id: string) => api.delete(`/insights/${id}`),
}
