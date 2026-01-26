import { api } from './api'
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  TransactionSummary,
  CategorySummary,
  InstallmentGroupSummary
} from '../types'

export const transactionsService = {
  getAll: (filters?: TransactionFilters) => 
    api.get<Transaction[]>('/transactions', filters as Record<string, string | undefined>),

  getById: (id: string) => 
    api.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionDto) => 
    api.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionDto) => 
    api.patch<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) => 
    api.delete(`/transactions/${id}`),

  getSummary: (startDate: string, endDate: string) => 
    api.get<TransactionSummary>('/transactions/summary', { 
      start_date: startDate, 
      end_date: endDate 
    }),

  getByCategory: (startDate: string, endDate: string) =>
    api.get<CategorySummary[]>('/transactions/by-category', {
      start_date: startDate,
      end_date: endDate
    }),

  getInstallmentGroups: () =>
    api.get<InstallmentGroupSummary[]>('/transactions/installments/groups'),

  getInstallmentsByGroup: (groupId: string) =>
    api.get<Transaction[]>(`/transactions/installments/group/${groupId}`),
}
