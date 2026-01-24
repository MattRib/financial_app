/**
 * Get semantic color based on percentage
 * - Green (emerald): < 70%
 * - Yellow (amber): 70% - 90%
 * - Red: > 90%
 */
export const getProgressColor = (percentage: number) => {
  if (percentage >= 90) {
    return {
      bar: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      light: 'bg-red-100 dark:bg-red-900/30',
    }
  }
  if (percentage >= 70) {
    return {
      bar: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      light: 'bg-amber-100 dark:bg-amber-900/30',
    }
  }
  return {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    light: 'bg-emerald-100 dark:bg-emerald-900/30',
  }
}

export type ProgressColorResult = ReturnType<typeof getProgressColor>
