// Re-export all constants
export * from './categories'
// Note: colors.ts also exports CATEGORY_COLORS but as an object with semantic keys
// Use the one from categories.ts (array) for category selection UI
export {
  STATUS_COLORS,
  CHART_COLORS,
  ICON_COLORS,
} from './colors'
export type { StatusColorKey } from './colors'
export * from './navigation'

// Months constant for date selectors
export const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
] as const

export type MonthValue = (typeof MONTHS)[number]['value']

// Helper to get month label by value
export const getMonthLabel = (month: number): string => {
  return MONTHS.find((m) => m.value === month)?.label ?? ''
}

// Helper to get short month label (3 chars)
export const getMonthShortLabel = (month: number): string => {
  return getMonthLabel(month).slice(0, 3)
}
