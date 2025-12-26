import { create } from 'zustand'
import { goalsService } from '../services/goals'
import type {
  Goal,
  CreateGoalDto,
  UpdateGoalDto,
  GoalStatus,
} from '../types'

export interface FilterGoalDto {
  status?: GoalStatus
  start_date?: string
  end_date?: string
}

export interface GoalSummary {
  total_target: number
  current_amount: number
  remaining: number
  by_status: {
    active: {
      count: number
      total: number
    }
    completed: {
      count: number
      total: number
    }
    cancelled: {
      count: number
      total: number
    }
  }
}

export interface GoalsState {
  goals: Goal[]
  loading: boolean
  error: string | null
  summary: GoalSummary | null

  fetchGoals: (filters?: FilterGoalDto) => Promise<void>
  fetchSummary: () => Promise<void>
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

  fetchGoals: async (filters?: FilterGoalDto) => {
    set({ loading: true, error: null })
    try {
      const goals = await goalsService.getAll()
      
      // Apply filters locally if provided
      let filteredGoals = goals
      if (filters?.status) {
        filteredGoals = filteredGoals.filter((goal) => goal.status === filters.status)
      }
      if (filters?.start_date) {
        filteredGoals = filteredGoals.filter(
          (goal) => new Date(goal.target_date) >= new Date(filters.start_date!)
        )
      }
      if (filters?.end_date) {
        filteredGoals = filteredGoals.filter(
          (goal) => new Date(goal.target_date) <= new Date(filters.end_date!)
        )
      }
      
      set({ goals: filteredGoals, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  fetchSummary: async () => {
    set({ error: null })
    try {
      // Calculate summary locally from goals
      const { goals } = get()
      
      const summary: GoalSummary = {
        total_target: 0,
        current_amount: 0,
        remaining: 0,
        by_status: {
          active: { count: 0, total: 0 },
          completed: { count: 0, total: 0 },
          cancelled: { count: 0, total: 0 },
        },
      }

      goals.forEach((goal) => {
        summary.total_target += goal.target_amount
        summary.current_amount += goal.current_amount

        if (goal.status === 'active') {
          summary.by_status.active.count++
          summary.by_status.active.total += goal.target_amount
        } else if (goal.status === 'completed') {
          summary.by_status.completed.count++
          summary.by_status.completed.total += goal.target_amount
        } else if (goal.status === 'cancelled') {
          summary.by_status.cancelled.count++
          summary.by_status.cancelled.total += goal.target_amount
        }
      })

      summary.remaining = summary.total_target - summary.current_amount

      set({ summary })
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
      const updatedGoal = await goalsService.update(id, { status: 'completed' })
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
