import { api, HttpError } from './api'
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

  getInstallmentGroups: (activeOnly?: boolean) =>
    api.get<InstallmentGroupSummary[]>(
      `/transactions/installments/groups${activeOnly ? '?active_only=true' : ''}`,
    ),

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
      throw new HttpError(401, 'Não autenticado')
    }

    const response = await fetch(`${API_URL}/transactions/import/ofx/preview?account_id=${accountId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    })

    if (!response.ok) {
      // Try parse json, fallback to text
      const err = await response.json().catch(async () => {
        const txt = await response.text().catch(() => '')
        return { message: txt || 'Erro ao processar arquivo' }
      })
      throw new HttpError(response.status, err.message || 'Erro ao processar arquivo OFX', err)
    }

    try {
      return await response.json()
    } catch {
      const text = await response.text().catch(() => '')
      return (text as unknown) as OfxPreview
    }
  },

  confirmOfxImport: (data: OfxImportConfirm) =>
    api.post<{ imported: number; transactions: Transaction[] }>(
      '/transactions/import/ofx/confirm',
      data
    ),
}
