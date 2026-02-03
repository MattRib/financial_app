import { api } from './api'
import type {
  Account,
  AccountSummary,
  CreateAccountDto,
  UpdateAccountDto,
  FilterAccountDto,
  CreateTransferDto,
  CreditCardInvoice,
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

  getCurrentInvoice: (accountId: string) =>
    api.get<CreditCardInvoice>(`/accounts/${accountId}/invoices/current`),

  getInvoiceHistory: (accountId: string) =>
    api.get<CreditCardInvoice[]>(`/accounts/${accountId}/invoices/history`),

  markInvoicePaid: (accountId: string, period_start: string, period_end: string) =>
    api.patch<{ paid_at: string }>(`/accounts/${accountId}/invoices/pay`, {
      period_start,
      period_end,
    }),
}
