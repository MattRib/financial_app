import { create } from 'zustand'
import { insightsService } from '../services/insights'
import type { Insight, GenerateInsightDto, FilterInsightDto } from '../types'

export interface InsightsState {
  insights: Insight[]
  currentInsight: Insight | null
  loading: boolean
  generating: boolean
  error: string | null

  fetchInsights: (filters?: FilterInsightDto) => Promise<void>
  generateInsight: (data: GenerateInsightDto) => Promise<Insight>
  regenerateInsight: (data: GenerateInsightDto) => Promise<Insight>
  deleteInsight: (id: string) => Promise<void>
  setCurrentInsight: (insight: Insight | null) => void
}

export const useInsightsStore = create<InsightsState>((set) => ({
  insights: [],
  currentInsight: null,
  loading: false,
  generating: false,
  error: null,

  fetchInsights: async (filters?: FilterInsightDto) => {
    set({ loading: true, error: null })
    try {
      const insights = await insightsService.getAll(filters)
      set({ insights, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  generateInsight: async (data: GenerateInsightDto) => {
    set({ generating: true, error: null })
    try {
      const insight = await insightsService.generate(data)
      set((state) => ({
        insights: [insight, ...state.insights],
        currentInsight: insight,
        generating: false,
      }))
      return insight
    } catch (err: unknown) {
      set({ error: String(err), generating: false })
      throw err
    }
  },

  regenerateInsight: async (data: GenerateInsightDto) => {
    set({ generating: true, error: null })
    try {
      const insight = await insightsService.regenerate(data)
      set((state) => ({
        insights: state.insights.map((i) =>
          i.month === data.month && i.year === data.year ? insight : i
        ),
        currentInsight: insight,
        generating: false,
      }))
      return insight
    } catch (err: unknown) {
      set({ error: String(err), generating: false })
      throw err
    }
  },

  deleteInsight: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await insightsService.delete(id)
      set((state) => ({
        insights: state.insights.filter((i) => i.id !== id),
        currentInsight:
          state.currentInsight?.id === id ? null : state.currentInsight,
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  setCurrentInsight: (insight: Insight | null) => {
    set({ currentInsight: insight })
  },
}))
