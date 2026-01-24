import { Landmark, TrendingUp, Bitcoin, Briefcase, List } from 'lucide-react'
import type { InvestmentType } from '../types'

// Type configuration with labels, icons and colors
export const INVESTMENT_TYPE_CONFIG = {
  renda_fixa: {
    label: 'Renda Fixa',
    icon: Landmark,
    emoji: '🏦',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    chartColor: '#3b82f6', // blue-500
  },
  renda_variavel: {
    label: 'Renda Variável',
    icon: TrendingUp,
    emoji: '📈',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-500',
    chartColor: '#10b981', // emerald-500
  },
  cripto: {
    label: 'Criptomoedas',
    icon: Bitcoin,
    emoji: '₿',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-500',
    chartColor: '#f97316', // orange-500
  },
  outros: {
    label: 'Outros',
    icon: Briefcase,
    emoji: '💼',
    bgColor: 'bg-slate-100 dark:bg-slate-700/50',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    iconColor: 'text-slate-500',
    chartColor: '#64748b', // slate-500
  },
} as const satisfies Record<InvestmentType, {
  label: string
  icon: typeof Landmark
  emoji: string
  bgColor: string
  textColor: string
  borderColor: string
  iconColor: string
  chartColor: string
}>

// Tabs configuration for investment filtering
export const INVESTMENT_TABS = [
  { id: 'all' as const, label: 'Todos', icon: List },
  { id: 'renda_fixa' as const, label: 'Renda Fixa', icon: Landmark },
  { id: 'renda_variavel' as const, label: 'Renda Variável', icon: TrendingUp },
  { id: 'cripto' as const, label: 'Cripto', icon: Bitcoin },
  { id: 'outros' as const, label: 'Outros', icon: Briefcase },
] as const

export type InvestmentTabId = (typeof INVESTMENT_TABS)[number]['id']

// Helper to get chart data from investments
export const getInvestmentChartData = (
  byType: { type: InvestmentType; total: number }[]
) => {
  return byType
    .filter(item => item.total > 0)
    .map(item => ({
      name: INVESTMENT_TYPE_CONFIG[item.type].label,
      value: item.total,
      color: INVESTMENT_TYPE_CONFIG[item.type].chartColor,
    }))
    .sort((a, b) => b.value - a.value)
}

// Month names in Portuguese
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const

// Format period label
export const formatPeriodLabel = (month: number, year: number): string => {
  return `${MONTH_NAMES[month - 1]} ${year}`
}
