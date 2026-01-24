import React from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '../../hooks/useTransaction'
import { getProgressColor } from './budgetUtils'

interface BudgetProgressBarProps {
  /** Current percentage (0-100+) */
  percentage: number
  /** Amount spent */
  spent?: number
  /** Total budget amount */
  total?: number
  /** Show values below the bar */
  showValues?: boolean
  /** Bar size */
  size?: 'sm' | 'md' | 'lg'
  /** Animation delay */
  delay?: number
  /** Custom class for container */
  className?: string
}

const sizeConfig = {
  sm: { height: 'h-1.5', text: 'text-xs' },
  md: { height: 'h-2', text: 'text-sm' },
  lg: { height: 'h-3', text: 'text-sm' },
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  percentage,
  spent,
  total,
  showValues = false,
  size = 'md',
  delay = 0,
  className = '',
}) => {
  const colors = getProgressColor(percentage)
  const config = sizeConfig[size]
  
  // Cap the visual width at 100% but keep the actual percentage for calculations
  const visualPercentage = Math.min(percentage, 100)
  
  return (
    <div className={className}>
      {/* Progress bar */}
      <div className={`w-full ${config.height} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
        <motion.div
          className={`${config.height} ${colors.bar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${visualPercentage}%` }}
          transition={{
            duration: 0.8,
            delay: delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>
      
      {/* Values */}
      {showValues && spent !== undefined && total !== undefined && (
        <div className={`flex justify-between items-center mt-1.5 ${config.text}`}>
          <span className="text-slate-500 dark:text-slate-400">
            {formatCurrency(spent)} de {formatCurrency(total)}
          </span>
          <span className={`font-medium tabular-nums ${colors.text}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}


