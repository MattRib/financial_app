/**
 * Color Constants and Palettes
 * 
 * Base UI: Slate (padrão para TODO o projeto - botões, superfícies, bordas, texto)
 * Primary/Azul: usar APENAS para acentos muito específicos (não para botões principais)
 * 
 * Padrão de Botões:
 * - Primário: bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600
 * - Secundário: border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800
 * - Perigo: bg-red-600 hover:bg-red-700
 * 
 * Semânticas: emerald (receitas), red (despesas/erros), amber (alertas), purple (investimentos)
 * 
 * Conforme DESIGN_SYSTEM.md
 */

// Base UI - Slate (usar diretamente as classes Tailwind)
// bg-white dark:bg-slate-900
// border-slate-200 dark:border-slate-800
// text-slate-900 dark:text-slate-50
// text-slate-500 dark:text-slate-400

// Category Type Colors (Tailwind native colors)
export const CATEGORY_COLORS = {
  income: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    border: 'border-emerald-500',
    hover: 'hover:bg-emerald-600',
    light: 'bg-emerald-50 dark:bg-emerald-900/20',
    hex: '#10b981', // emerald-500
  },
  expense: {
    bg: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-600',
    hover: 'hover:bg-red-700',
    light: 'bg-red-50 dark:bg-red-900/20',
    hex: '#dc2626', // red-600
  },
  investment: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    border: 'border-purple-500',
    hover: 'hover:bg-purple-600',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    hex: '#a855f7', // purple-500
  },
} as const

// Status Colors (Tailwind native)
export const STATUS_COLORS = {
  success: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    border: 'border-emerald-500',
    light: 'bg-emerald-50 dark:bg-emerald-900/20',
    hex: '#10b981', // emerald-500
  },
  warning: {
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-500',
    light: 'bg-amber-50 dark:bg-amber-900/20',
    hex: '#f59e0b', // amber-500
  },
  danger: {
    bg: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-600',
    light: 'bg-red-50 dark:bg-red-900/20',
    hex: '#dc2626', // red-600
  },
} as const

// Chart Colors - hex values for chart libraries
export const CHART_COLORS = {
  primary: '#2563eb',   // primary-600
  income: '#10b981',    // emerald-500
  expense: '#dc2626',   // red-600
  investment: '#a855f7', // purple-500
  success: '#10b981',   // emerald-500
  warning: '#f59e0b',   // amber-500
  danger: '#dc2626',    // red-600
} as const

// Color palette for category icons/cards
export const ICON_COLORS = [
  '#2563eb', // primary-600 (blue)
  '#10b981', // emerald-500 (green)
  '#dc2626', // red-600
  '#a855f7', // purple-500
  '#f59e0b', // amber-500 (orange/yellow)
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
] as const

// Export type helpers
export type CategoryColorKey = keyof typeof CATEGORY_COLORS
export type StatusColorKey = keyof typeof STATUS_COLORS
