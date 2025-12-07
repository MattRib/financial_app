import { api } from './api'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types'

export const categoriesService = {
  getAll: (type?: string) => 
    api.get<Category[]>('/categories', { type }),

  getById: (id: string) => 
    api.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryDto) => 
    api.post<Category>('/categories', data),

  update: (id: string, data: UpdateCategoryDto) => 
    api.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) => 
    api.delete(`/categories/${id}`),
}
