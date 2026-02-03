import { api } from './api'
import type {
  RecurringExpenseSummary,
  CreateRecurringExpenseDto,
  Transaction,
} from '../types'

export const recurringExpensesService = {
  /**
   * Get all recurring expense groups
   */
  getGroups: () =>
    api.get<RecurringExpenseSummary[]>('/transactions/recurring/groups'),

  /**
   * Get all transactions in a recurring expense group
   */
  getByGroup: (groupId: string) =>
    api.get<Transaction[]>(`/transactions/recurring/group/${groupId}`),

  /**
   * Create new recurring expense (creates all future transactions)
   */
  create: (data: CreateRecurringExpenseDto) =>
    api.post<Transaction[]>('/transactions', data),

  /**
   * Remove recurring expense (deletes only future transactions)
   */
  remove: (groupId: string) =>
    api.delete<{ deleted: number }>(`/transactions/recurring/group/${groupId}`),
}
