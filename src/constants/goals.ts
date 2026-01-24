import type { GoalCategory, GoalStatus } from '../types'

// Goal category configuration with emojis and colors
export const GOAL_CATEGORY_CONFIG: Record<
  GoalCategory,
  {
    label: string
    emoji: string
    bgColor: string
    textColor: string
  }
> = {
  emergency_fund: {
    label: 'Fundo de Emergência',
    emoji: '🛡️',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
  },
  travel: {
    label: 'Viagem',
    emoji: '✈️',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30',
    textColor: 'text-sky-700 dark:text-sky-400',
  },
  purchase: {
    label: 'Compra',
    emoji: '🛒',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    textColor: 'text-orange-700 dark:text-orange-400',
  },
  debt_payoff: {
    label: 'Quitar Dívida',
    emoji: '💳',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    textColor: 'text-rose-700 dark:text-rose-400',
  },
  investment: {
    label: 'Investimento',
    emoji: '📈',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-400',
  },
  education: {
    label: 'Educação',
    emoji: '📚',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-700 dark:text-indigo-400',
  },
  retirement: {
    label: 'Aposentadoria',
    emoji: '🏖️',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-700 dark:text-teal-400',
  },
  other: {
    label: 'Outro',
    emoji: '🎯',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-400',
  },
}

// Goal status configuration
export const GOAL_STATUS_CONFIG: Record<
  GoalStatus,
  {
    label: string
    bgColor: string
    textColor: string
    dotColor: string
  }
> = {
  active: {
    label: 'Ativa',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  completed: {
    label: 'Concluída',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    dotColor: 'bg-blue-500',
  },
  cancelled: {
    label: 'Cancelada',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-600 dark:text-slate-400',
    dotColor: 'bg-slate-400',
  },
}

// Filter tabs for goals
export const GOAL_TABS = [
  { id: 'all' as const, label: 'Todas' },
  { id: 'active' as const, label: 'Ativas' },
  { id: 'completed' as const, label: 'Concluídas' },
  { id: 'cancelled' as const, label: 'Canceladas' },
]

export type GoalTabId = (typeof GOAL_TABS)[number]['id']

// Progress color helper
export const getGoalProgressColor = (
  percentage: number
): {
  bar: string
  text: string
  light: string
} => {
  if (percentage >= 75) {
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      light: 'bg-emerald-100 dark:bg-emerald-900/30',
    }
  }
  if (percentage >= 50) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      light: 'bg-amber-100 dark:bg-amber-900/30',
    }
  }
  return {
    bar: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    light: 'bg-red-100 dark:bg-red-900/30',
  }
}

// Days remaining helper
export const getDaysRemaining = (
  targetDate: string
): {
  days: number
  isPast: boolean
  label: string
} => {
  const target = new Date(targetDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isPast: true,
      label: `${Math.abs(diffDays)} dia${Math.abs(diffDays) !== 1 ? 's' : ''} atrasado`,
    }
  }

  if (diffDays === 0) {
    return {
      days: 0,
      isPast: false,
      label: 'Vence hoje',
    }
  }

  return {
    days: diffDays,
    isPast: false,
    label: `${diffDays} dia${diffDays !== 1 ? 's' : ''} restante${diffDays !== 1 ? 's' : ''}`,
  }
}

// Calculate progress percentage
export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

// Format currency for display
export const formatGoalCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Category options for select
export const GOAL_CATEGORY_OPTIONS = Object.entries(GOAL_CATEGORY_CONFIG).map(
  ([value, config]) => ({
    value: value as GoalCategory,
    label: `${config.emoji} ${config.label}`,
  })
)
