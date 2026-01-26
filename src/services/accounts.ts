import { api } from './api'
import type {
  Account,
  AccountSummary,
  CreateAccountDto,
  UpdateAccountDto,
  FilterAccountDto,
  CreateTransferDto,
} from '../types'

export const accountsService = {
  getAll: (filters?: FilterAccountDto) =>
    api.get<Account[]>(
      '/accounts',
      filters as Record<string, string | undefined>
    ),

  getById: (id: string) => api.get<Account>(`/accounts/${id}`),

  create: (data: CreateAccountDto) => api.post<Account>('/accounts', data),

  update: (id: string, data: UpdateAccountDto) =>
    api.patch<Account>(`/accounts/${id}`, data),

  delete: (id: string) => api.delete(`/accounts/${id}`),

  getSummary: () => api.get<AccountSummary>('/accounts/summary'),

  transfer: (data: CreateTransferDto) =>
    api.post<{ transfer_id: string }>('/accounts/transfer', data),
}
