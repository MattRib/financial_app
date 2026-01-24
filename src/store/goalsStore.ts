import { create } from 'zustand'
import { goalsService } from '../services/goals'
import type {
  Goal,
  GoalWithProgress,
  GoalSummary,
  FilterGoalDto,
  CreateGoalDto,
  UpdateGoalDto,
  GoalStatus,
} from '../types'

export interface GoalsState {
  goals: Goal[]
  loading: boolean
  error: string | null
  summary: GoalSummary | null
  atRiskGoals: GoalWithProgress[]
  nearCompletionGoals: GoalWithProgress[]

  fetchGoals: (filters?: FilterGoalDto) => Promise<void>
  fetchSummary: () => Promise<void>
  fetchAtRisk: () => Promise<void>
  fetchNearCompletion: () => Promise<void>
  createGoal: (data: CreateGoalDto) => Promise<void>
  updateGoal: (id: string, data: UpdateGoalDto) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  markAsCompleted: (id: string) => Promise<void>
  addContribution: (id: string, amount: number) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,
  error: null,
  summary: null,
  atRiskGoals: [],
  nearCompletionGoals: [],

  fetchGoals: async (filters?: FilterGoalDto) => {
    set({ loading: true, error: null })
    try {
      const goals = await goalsService.getAll(filters)
      set({ goals, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchSummary: async () => {
    set({ error: null })
    try {
      const summary = await goalsService.getSummary()
      set({ summary })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  fetchAtRisk: async () => {
    set({ error: null })
    try {
      const atRiskGoals = await goalsService.getAtRisk()
      set({ atRiskGoals })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  fetchNearCompletion: async () => {
    set({ error: null })
    try {
      const nearCompletionGoals = await goalsService.getNearCompletion()
      set({ nearCompletionGoals })
    } catch (err: unknown) {
      set({ error: String(err) })
    }
  },

  createGoal: async (data: CreateGoalDto) => {
    set({ loading: true, error: null })
    try {
      const newGoal = await goalsService.create(data)
      set((state) => ({
        goals: [newGoal, ...state.goals],
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  updateGoal: async (id: string, data: UpdateGoalDto) => {
    set({ loading: true, error: null })
    try {
      const updatedGoal = await goalsService.update(id, data)
      set((state) => ({
        goals: state.goals.map((goal) => (goal.id === id ? updatedGoal : goal)),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  deleteGoal: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await goalsService.delete(id)
      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  markAsCompleted: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const updatedGoal = await goalsService.markAsCompleted(id)
      set((state) => ({
        goals: state.goals.map((goal) => (goal.id === id ? updatedGoal : goal)),
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  addContribution: async (id: string, amount: number) => {
    const { goals, updateGoal } = get()
    const currentGoal = goals.find((goal) => goal.id === id)

    if (!currentGoal) {
      set({ error: 'Meta não encontrada' })
      return
    }

    const newCurrentAmount = currentGoal.current_amount + amount

    try {
      // Update current amount
      await updateGoal(id, { current_amount: newCurrentAmount })

      // Check if goal is completed
      if (newCurrentAmount >= currentGoal.target_amount && currentGoal.status === 'active') {
        await updateGoal(id, { status: 'completed' })
      }
    } catch (err: unknown) {
      set({ error: String(err) })
      throw err
    }
  },
}))
