import React from 'react'
import { motion } from 'framer-motion'
import { getGoalProgressColor } from '../../constants/goals'

interface GoalProgressBarProps {
  percentage: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  delay?: number
  className?: string
}

const sizeConfig = {
  sm: {
    height: 'h-1.5',
    text: 'text-xs',
  },
  md: {
    height: 'h-2',
    text: 'text-sm',
  },
  lg: {
    height: 'h-3',
    text: 'text-sm',
  },
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  percentage,
  showLabel = true,
  size = 'md',
  delay = 0,
  className = '',
}) => {
  const colors = getGoalProgressColor(percentage)
  const config = sizeConfig[size]
  const visualPercentage = Math.min(100, Math.max(0, percentage))

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className={`${config.text} text-slate-500 dark:text-slate-400`}>
            Progresso
          </span>
          <span className={`${config.text} font-medium ${colors.text}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div
        className={`
          w-full ${config.height} rounded-full overflow-hidden
          bg-slate-200 dark:bg-slate-700
        `}
      >
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
    </div>
  )
}
