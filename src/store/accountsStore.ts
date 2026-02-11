import { create } from 'zustand'
import { accountsService } from '../services/accounts'
import type {
  Account,
  AccountSummary,
  CreateAccountDto,
  UpdateAccountDto,
  FilterAccountDto,
} from '../types'

export interface AccountsState {
  accounts: Account[]
  summary: AccountSummary | null
  loading: boolean
  error: string | null

  fetch: (filters?: FilterAccountDto) => Promise<void>
  fetchSummary: () => Promise<void>
  create: (data: CreateAccountDto) => Promise<Account>
  update: (id: string, data: UpdateAccountDto) => Promise<Account>
  delete: (id: string) => Promise<void>
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  summary: null,
  loading: false,
  error: null,

  fetch: async (filters?) => {
    set({ loading: true, error: null })
    try {
      const accounts = await accountsService.getAll(filters)
      set({ accounts, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await accountsService.getSummary()
      set({ summary })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  create: async (data) => {
    set({ loading: true, error: null })
    try {
      const account = await accountsService.create(data)
      set((state) => ({
        accounts: [...state.accounts, account],
        loading: false,
      }))
      // Refresh summary
      get().fetchSummary()
      return account
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const account = await accountsService.update(id, data)
      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? account : a)),
        loading: false,
      }))
      get().fetchSummary()
      return account
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  delete: async (id) => {
    set({ loading: true, error: null })
    try {
      await accountsService.delete(id)
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
        loading: false,
      }))
      get().fetchSummary()
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },
}))
