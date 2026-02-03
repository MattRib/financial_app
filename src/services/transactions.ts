import { api } from './api'
import type {
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilters,
  TransactionSummary,
  CategorySummary,
  InstallmentGroupSummary,
  OfxPreview,
  OfxImportConfirm
} from '../types'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL

export const transactionsService = {
  getAll: (filters?: TransactionFilters) => 
    api.get<Transaction[]>('/transactions', filters as Record<string, string | undefined>),

  getById: (id: string) => 
    api.get<Transaction>(`/transactions/${id}`),

  create: (data: CreateTransactionDto) => 
    api.post<Transaction>('/transactions', data),

  update: (id: string, data: UpdateTransactionDto) => 
    api.patch<Transaction>(`/transactions/${id}`, data),

  delete: (id: string, mode?: 'single' | 'future' | 'all') => 
    api.delete(`/transactions/${id}${mode ? `?mode=${encodeURIComponent(mode)}` : ''}`),

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

  getMonthlyExpenses: (year: number) =>
    api.get<{ month: number; total: number }[]>('/transactions/monthly-expenses', {
      year: year.toString()
    }),

  previewOfxImport: async (file: File, accountId: string): Promise<OfxPreview> => {
    const formData = new FormData()
    formData.append('file', file)

    const token = useAuthStore.getState().getAccessToken()
    if (!token) {
      throw new Error('Não autenticado')
    }

    const response = await fetch(`${API_URL}/transactions/import/ofx/preview?account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao processar arquivo' }))
      throw new Error(error.message || 'Erro ao processar arquivo OFX')
    }

    return response.json()
  },

  confirmOfxImport: (data: OfxImportConfirm) =>
    api.post<{ imported: number; transactions: Transaction[] }>(
      '/transactions/import/ofx/confirm',
      data
    ),
}
