import { create } from 'zustand'
import { categoriesService } from '../services/categories'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types'

export interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
  selectedCategory: Category | null

  fetchCategories: () => Promise<void>
  createCategory: (data: CreateCategoryDto) => Promise<void>
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  setSelectedCategory: (category: Category | null) => void
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const categories = await categoriesService.getAll()
      set({ categories, loading: false })
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  createCategory: async (data: CreateCategoryDto) => {
    set({ loading: true, error: null })
    try {
      const newCategory = await categoriesService.create(data)
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  updateCategory: async (id: string, data: UpdateCategoryDto) => {
    set({ loading: true, error: null })
    try {
      const updatedCategory = await categoriesService.update(id, data)
      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === id ? updatedCategory : cat
        ),
        selectedCategory:
          state.selectedCategory?.id === id
            ? updatedCategory
            : state.selectedCategory,
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  deleteCategory: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await categoriesService.delete(id)
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        selectedCategory:
          state.selectedCategory?.id === id ? null : state.selectedCategory,
        loading: false,
      }))
    } catch (err: unknown) {
      set({ error: String(err), loading: false })
    }
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category })
  },
}))

