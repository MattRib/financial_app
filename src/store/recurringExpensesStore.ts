import { create } from 'zustand'
import { recurringExpensesService } from '../services/recurringExpenses'
import type {
  RecurringExpenseSummary,
  CreateRecurringExpenseDto,
} from '../types'

export interface RecurringExpensesState {
  recurringExpenses: RecurringExpenseSummary[]
  loading: boolean
  error: string | null

  fetchRecurringExpenses: () => Promise<void>
  createRecurringExpense: (data: CreateRecurringExpenseDto) => Promise<void>
  removeRecurringExpense: (groupId: string) => Promise<number>
}

export const useRecurringExpensesStore = create<RecurringExpensesState>(
  (set) => ({
    recurringExpenses: [],
    loading: false,
    error: null,

    fetchRecurringExpenses: async () => {
      set({ loading: true, error: null })
      try {
        const recurringExpenses = await recurringExpensesService.getGroups()
        set({ recurringExpenses, loading: false })
      } catch (err: unknown) {
        set({ error: String(err), loading: false })
      }
    },

    createRecurringExpense: async (data: CreateRecurringExpenseDto) => {
      console.log('🏪 [Store] createRecurringExpense chamado com:', data)
      set({ loading: true, error: null })
      try {
        console.log('🏪 [Store] Chamando service.create...')
        const result = await recurringExpensesService.create(data)
        console.log('🏪 [Store] Resultado do service.create:', result)
        // Refresh list after creation
        const recurringExpenses = await recurringExpensesService.getGroups()
        console.log('🏪 [Store] Lista atualizada:', recurringExpenses)
        set({ recurringExpenses, loading: false })
      } catch (err: unknown) {
        console.error('🏪 [Store] Erro capturado:', err)
        set({ error: String(err), loading: false })
        throw err
      }
    },

    removeRecurringExpense: async (groupId: string) => {
      set({ loading: true, error: null })
      try {
        const result = await recurringExpensesService.remove(groupId)
        // Refresh list after deletion
        const recurringExpenses = await recurringExpensesService.getGroups()
        set({ recurringExpenses, loading: false })
        return result.deleted
      } catch (err: unknown) {
        set({ error: String(err), loading: false })
        throw err
      }
    },
  }),
)
