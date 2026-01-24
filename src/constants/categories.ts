import { TrendingUp, TrendingDown, PiggyBank, List } from 'lucide-react'
import type { CategoryType } from '../types'

// Predefined colors for categories
export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b',
] as const

// Predefined icons for categories
export const CATEGORY_ICONS = [
  '💰', '💵', '💳', '🏦', '📈', '📊', '🏠', '🚗', '🚌', '✈️',
  '🍔', '🍽️', '🍕', '☕', '🏥', '💊', '💪', '📚', '✏️', '💻',
  '📱', '🎮', '🎬', '🎵', '⚽', '👕', '🛍️', '🎁', '👨‍👩‍👧‍👦', '🐶',
] as const

// Type configuration with labels, icons and colors
export const CATEGORY_TYPE_CONFIG = {
  income: {
    label: 'Entrada',
    pluralLabel: 'Receitas',
    icon: TrendingUp,
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500',
  },
  expense: {
    label: 'Saída',
    pluralLabel: 'Despesas',
    icon: TrendingDown,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
  },
  investment: {
    label: 'Investimento',
    pluralLabel: 'Investimentos',
    icon: PiggyBank,
    bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    textColor: 'text-primary-700 dark:text-primary-400',
    borderColor: 'border-primary-200 dark:border-primary-800',
    iconColor: 'text-primary-500',
  },
} as const satisfies Record<CategoryType, {
  label: string
  pluralLabel: string
  icon: typeof TrendingUp
  bgColor: string
  textColor: string
  borderColor: string
  iconColor: string
}>

// Tabs configuration for category filtering
export const CATEGORY_TABS = [
  { id: 'all' as const, label: 'Todos', icon: List },
  { id: 'income' as const, label: 'Receitas', icon: TrendingUp },
  { id: 'expense' as const, label: 'Despesas', icon: TrendingDown },
  { id: 'investment' as const, label: 'Investimentos', icon: PiggyBank },
] as const

export type CategoryTabId = (typeof CATEGORY_TABS)[number]['id']
