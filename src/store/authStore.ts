import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error?: string | null

  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  restoreSession: () => Promise<void>
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Subscribe to auth state changes once on store initialization
  supabase.auth.onAuthStateChange((_, session) => {
    set({ session: session ?? null, user: session?.user ?? null })
  })

  const restoreSession = async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await supabase.auth.getSession()
      set({ session: data.session ?? null, user: data.session?.user ?? null })
    } catch (err: unknown) {
      set({ error: String(err) })
    } finally {
      set({ loading: false })
    }
  }

  // Run an initial restore to populate store with current session (if any)
  void restoreSession()

  return {
    user: null,
    session: null,
    loading: false,
    error: null,

    signIn: async (email: string, password: string) => {
      set({ loading: true, error: null })
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ error: error.message })
          return
        }
        set({ session: data.session ?? null, user: data.user ?? null })
      } catch (err: unknown) {
        set({ error: String(err) })
      } finally {
        set({ loading: false })
      }
    },

    signUp: async (email: string, password: string) => {
      set({ loading: true, error: null })
      try {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          set({ error: error.message })
          return
        }
        set({ session: data.session ?? null, user: data.user ?? null })
      } catch (err: unknown) {
        set({ error: String(err) })
      } finally {
        set({ loading: false })
      }
    },

    signOut: async () => {
      set({ loading: true, error: null })
      try {
        const { error } = await supabase.auth.signOut()
        if (error) set({ error: error.message })
        set({ user: null, session: null })
      } catch (err: unknown) {
        set({ error: String(err) })
      } finally {
        set({ loading: false })
      }
    },

    setUser: (user: User | null) => set({ user }),

    restoreSession,

    getAccessToken: () => get().session?.access_token ?? null,
  }
})
